use rusqlite::{params, Connection};
use std::path::Path;
use thiserror::Error;

const SCHEMA_TARGET_VERSION: i64 = 2;

#[derive(Debug, Error)]
pub enum DbError {
    #[error("sqlite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
    #[error(
        "database schema version {0} is newer than this build supports ({1}); \
         refusing to start to avoid data corruption"
    )]
    VersionTooNew(i64, i64),
}

/// Opens the database, runs migrations, ensures a starter pet exists, and
/// returns the live connection for the app to manage.
pub fn initialize(app_data_dir: &Path) -> Result<Connection, DbError> {
    std::fs::create_dir_all(app_data_dir)?;

    let db_path = app_data_dir.join("pet.db");
    let backup_path = app_data_dir.join("pet.db.backup");

    let conn = open_with_fallback(&db_path, &backup_path)?;
    apply_migrations(&conn)?;
    ensure_starter_pet(&conn)?;
    maybe_refresh_backup(&db_path, &backup_path)?;

    Ok(conn)
}

fn open_with_fallback(db_path: &Path, backup_path: &Path) -> Result<Connection, DbError> {
    if let Ok(conn) = Connection::open(db_path) {
        let healthy = conn
            .query_row("PRAGMA integrity_check", [], |row| row.get::<_, String>(0))
            .map(|r| r == "ok")
            .unwrap_or(false);

        if healthy {
            return Ok(conn);
        }
        eprintln!("pet.db failed integrity check; attempting restore from backup");
    }

    if backup_path.exists() {
        eprintln!("restoring pet.db from pet.db.backup");
        std::fs::copy(backup_path, db_path)?;
        return Ok(Connection::open(db_path)?);
    }

    eprintln!("no backup available; starting with a fresh database");
    Ok(Connection::open(db_path)?)
}

fn apply_migrations(conn: &Connection) -> Result<(), DbError> {
    // Bootstrap schema_version if this is a brand-new file.
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER NOT NULL,
            applied TEXT    NOT NULL DEFAULT (datetime('now'))
        );
        INSERT INTO schema_version (version)
        SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM schema_version);",
    )?;

    let current: i64 =
        conn.query_row("SELECT version FROM schema_version LIMIT 1", [], |row| {
            row.get(0)
        })?;

    if current > SCHEMA_TARGET_VERSION {
        return Err(DbError::VersionTooNew(current, SCHEMA_TARGET_VERSION));
    }

    if current < 2 {
        migrate_1_to_2(conn)?;
    }

    Ok(())
}

fn migrate_1_to_2(conn: &Connection) -> Result<(), DbError> {
    conn.execute_batch(
        "BEGIN;

        CREATE TABLE pet (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at          TEXT NOT NULL DEFAULT (datetime('now')),
            stage               TEXT NOT NULL DEFAULT 'starter'
                                    CHECK(stage IN ('starter','hatchling','stage1','stage2')),
            personality         TEXT
                                    CHECK(personality IS NULL
                                       OR personality IN ('cuddly','powerful')),
            last_interaction_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE care_actions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            pet_id      INTEGER NOT NULL REFERENCES pet(id),
            action_type TEXT    NOT NULL,
            occurred_at TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE behavioral_signals (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            pet_id      INTEGER NOT NULL REFERENCES pet(id),
            signal_type TEXT    NOT NULL,
            value       REAL,
            occurred_at TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE settings (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        UPDATE schema_version SET version = 2;

        COMMIT;",
    )?;
    Ok(())
}

/// Creates a starter pet on first launch. Logs a warning if multiple rows exist
/// (shouldn't happen, but handled gracefully per v1 spec).
fn ensure_starter_pet(conn: &Connection) -> Result<(), DbError> {
    let count: i64 =
        conn.query_row("SELECT COUNT(*) FROM pet", [], |row| row.get(0))?;

    if count == 0 {
        conn.execute(
            "INSERT INTO pet (stage, last_interaction_at) VALUES ('starter', datetime('now'))",
            [],
        )?;
    } else if count > 1 {
        eprintln!(
            "warning: {} pet rows found; the most recently created one will be used",
            count
        );
    }

    Ok(())
}

// ---------------------------------------------------------------------------
// Public read/write API used by Tauri commands
// ---------------------------------------------------------------------------

pub struct PetRow {
    pub id: i64,
    pub created_at: String,
    pub stage: String,
    pub personality: Option<String>,
    pub last_interaction_at: String,
    pub seconds_since_last_interaction: i64,
}

pub fn load_pet(conn: &Connection) -> Result<PetRow, DbError> {
    let row = conn.query_row(
        "SELECT
             id,
             created_at,
             stage,
             personality,
             last_interaction_at,
             CAST((julianday('now') - julianday(last_interaction_at)) * 86400 AS INTEGER)
         FROM pet
         ORDER BY created_at DESC
         LIMIT 1",
        [],
        |row| {
            Ok(PetRow {
                id: row.get(0)?,
                created_at: row.get(1)?,
                stage: row.get(2)?,
                personality: row.get(3)?,
                last_interaction_at: row.get(4)?,
                seconds_since_last_interaction: row.get(5)?,
            })
        },
    )?;
    Ok(row)
}

/// Writes the three care rows and re-reads the pet, all while the caller
/// holds the connection lock — satisfying the single-lock-acquisition contract.
pub fn record_interaction_and_reload(
    conn: &mut Connection,
    pet_id: i64,
) -> Result<PetRow, DbError> {
    let tx = conn.transaction()?;
    tx.execute(
        "INSERT INTO care_actions (pet_id, action_type) VALUES (?1, 'pet')",
        params![pet_id],
    )?;
    tx.execute(
        "INSERT INTO behavioral_signals (pet_id, signal_type, value) VALUES (?1, 'gentle_care', NULL)",
        params![pet_id],
    )?;
    tx.execute(
        "UPDATE pet SET last_interaction_at = datetime('now') WHERE id = ?1",
        params![pet_id],
    )?;
    tx.commit()?;

    // Re-read inside the same lock acquisition (tx is committed and dropped).
    load_pet(conn)
}

pub fn get_setting(conn: &Connection, key: &str) -> Result<Option<String>, DbError> {
    match conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        params![key],
        |row| row.get(0),
    ) {
        Ok(v) => Ok(Some(v)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(DbError::Sqlite(e)),
    }
}

pub fn set_setting(conn: &Connection, key: &str, value: &str) -> Result<(), DbError> {
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![key, value],
    )?;
    Ok(())
}

/// Refreshes the backup when it is missing or older than 24 hours.
/// Called after initialization and after each successful DB write.
pub fn maybe_refresh_backup(db_path: &Path, backup_path: &Path) -> Result<(), DbError> {
    let should_refresh = backup_path
        .metadata()
        .and_then(|m| m.modified())
        .map(|modified| {
            modified
                .elapsed()
                .map(|age| age.as_secs() > 86_400)
                .unwrap_or(true)
        })
        .unwrap_or(true);

    if should_refresh {
        std::fs::copy(db_path, backup_path)?;
    }

    Ok(())
}
