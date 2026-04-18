use rusqlite::{params, Connection};
use std::path::Path;
use thiserror::Error;

const SCHEMA_TARGET_VERSION: i64 = 3;

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
    if current < 3 {
        migrate_2_to_3(conn)?;
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

fn migrate_2_to_3(conn: &Connection) -> Result<(), DbError> {
    conn.execute_batch(
        "BEGIN;

        CREATE TABLE tasks (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            pet_id       INTEGER NOT NULL REFERENCES pet(id),
            title        TEXT    NOT NULL,
            created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
            completed_at TEXT,
            deleted_at   TEXT
        );

        CREATE TABLE focus_sessions (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            pet_id           INTEGER NOT NULL REFERENCES pet(id),
            started_at       TEXT    NOT NULL DEFAULT (datetime('now')),
            ended_at         TEXT,
            completed        INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)),
            duration_minutes INTEGER NOT NULL
        );

        CREATE TABLE growth_events (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            pet_id         INTEGER NOT NULL REFERENCES pet(id),
            source         TEXT    NOT NULL
                               CHECK(source IN ('task_completed','focus_completed')),
            points_awarded INTEGER NOT NULL,
            occurred_at    TEXT    NOT NULL DEFAULT (datetime('now')),
            -- related_id references tasks.id when source='task_completed',
            -- focus_sessions.id when source='focus_completed'
            related_id     INTEGER NOT NULL
        );

        ALTER TABLE pet ADD COLUMN growth_resources INTEGER NOT NULL DEFAULT 0;

        UPDATE schema_version SET version = 3;

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

pub fn get_current_pet_id(conn: &Connection) -> Result<i64, DbError> {
    let id = conn.query_row(
        "SELECT id FROM pet ORDER BY created_at DESC LIMIT 1",
        [],
        |row| row.get(0),
    )?;
    Ok(id)
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

// ---------------------------------------------------------------------------
// Task queries
// ---------------------------------------------------------------------------

pub struct TaskRow {
    pub id: i64,
    pub title: String,
    pub created_at: String,
    pub completed_at: Option<String>,
}

pub fn load_tasks(conn: &Connection, pet_id: i64) -> Result<Vec<TaskRow>, DbError> {
    let mut stmt = conn.prepare(
        "SELECT id, title, created_at, completed_at
         FROM tasks
         WHERE pet_id = ?1 AND deleted_at IS NULL
         ORDER BY created_at ASC",
    )?;
    let rows = stmt.query_map(params![pet_id], |row| {
        Ok(TaskRow {
            id: row.get(0)?,
            title: row.get(1)?,
            created_at: row.get(2)?,
            completed_at: row.get(3)?,
        })
    })?;
    rows.collect::<Result<Vec<_>, _>>().map_err(DbError::Sqlite)
}

pub fn insert_task(conn: &Connection, pet_id: i64, title: &str) -> Result<TaskRow, DbError> {
    conn.execute(
        "INSERT INTO tasks (pet_id, title) VALUES (?1, ?2)",
        params![pet_id, title],
    )?;
    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, title, created_at, completed_at FROM tasks WHERE id = ?1",
        params![id],
        |row| {
            Ok(TaskRow {
                id: row.get(0)?,
                title: row.get(1)?,
                created_at: row.get(2)?,
                completed_at: row.get(3)?,
            })
        },
    )
    .map_err(DbError::Sqlite)
}

pub struct CompleteTaskResult {
    pub points_awarded: i64,
}

pub fn complete_task(
    conn: &mut Connection,
    task_id: i64,
    pet_id: i64,
) -> Result<CompleteTaskResult, DbError> {
    let tx = conn.transaction()?;

    // Guard: silently no-op if already completed or deleted.
    let affected = tx.execute(
        "UPDATE tasks SET completed_at = datetime('now')
         WHERE id = ?1 AND completed_at IS NULL AND deleted_at IS NULL",
        params![task_id],
    )?;
    if affected == 0 {
        tx.commit()?;
        return Ok(CompleteTaskResult { points_awarded: 0 });
    }

    // Anti-cheat: tasks created less than 30 seconds ago earn no points.
    let age_seconds: i64 = tx.query_row(
        "SELECT CAST((julianday('now') - julianday(created_at)) * 86400 AS INTEGER)
         FROM tasks WHERE id = ?1",
        params![task_id],
        |row| row.get(0),
    )?;
    let base_points: i64 = if age_seconds < 30 { 0 } else { 1 };

    let final_points = apply_daily_cap(&tx, pet_id, base_points)?;

    tx.execute(
        "INSERT INTO growth_events (pet_id, source, points_awarded, related_id)
         VALUES (?1, 'task_completed', ?2, ?3)",
        params![pet_id, final_points, task_id],
    )?;
    tx.execute(
        "UPDATE pet SET growth_resources = growth_resources + ?1 WHERE id = ?2",
        params![final_points, pet_id],
    )?;
    tx.execute(
        "INSERT INTO behavioral_signals (pet_id, signal_type, value)
         VALUES (?1, 'task_completed', NULL)",
        params![pet_id],
    )?;

    tx.commit()?;
    Ok(CompleteTaskResult { points_awarded: final_points })
}

pub fn soft_delete_task(conn: &Connection, task_id: i64) -> Result<(), DbError> {
    conn.execute(
        "UPDATE tasks SET deleted_at = datetime('now') WHERE id = ?1 AND deleted_at IS NULL",
        params![task_id],
    )?;
    Ok(())
}

pub fn log_task_created_signal(conn: &Connection, pet_id: i64) -> Result<(), DbError> {
    conn.execute(
        "INSERT INTO behavioral_signals (pet_id, signal_type, value)
         VALUES (?1, 'task_created', NULL)",
        params![pet_id],
    )?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Focus session queries
// ---------------------------------------------------------------------------

pub struct FocusSessionRow {
    pub id: i64,
    pub started_at: String,
    pub duration_minutes: i64,
}

pub fn start_focus_session(
    conn: &Connection,
    pet_id: i64,
    duration_minutes: i64,
) -> Result<FocusSessionRow, DbError> {
    // Abort any open session for this pet before starting a new one.
    conn.execute(
        "UPDATE focus_sessions SET ended_at = datetime('now')
         WHERE pet_id = ?1 AND ended_at IS NULL",
        params![pet_id],
    )?;

    conn.execute(
        "INSERT INTO focus_sessions (pet_id, duration_minutes) VALUES (?1, ?2)",
        params![pet_id, duration_minutes],
    )?;
    let id = conn.last_insert_rowid();

    conn.execute(
        "INSERT INTO behavioral_signals (pet_id, signal_type, value)
         VALUES (?1, 'focus_started', ?2)",
        params![pet_id, duration_minutes as f64],
    )?;

    conn.query_row(
        "SELECT id, started_at, duration_minutes FROM focus_sessions WHERE id = ?1",
        params![id],
        |row| {
            Ok(FocusSessionRow {
                id: row.get(0)?,
                started_at: row.get(1)?,
                duration_minutes: row.get(2)?,
            })
        },
    )
    .map_err(DbError::Sqlite)
}

pub struct CompleteFocusResult {
    pub points_awarded: i64,
}

pub fn complete_focus_session(
    conn: &mut Connection,
    session_id: i64,
    pet_id: i64,
) -> Result<CompleteFocusResult, DbError> {
    let tx = conn.transaction()?;

    let affected = tx.execute(
        "UPDATE focus_sessions SET ended_at = datetime('now'), completed = 1
         WHERE id = ?1 AND ended_at IS NULL",
        params![session_id],
    )?;
    if affected == 0 {
        tx.commit()?;
        return Ok(CompleteFocusResult { points_awarded: 0 });
    }

    let duration_minutes: i64 = tx.query_row(
        "SELECT duration_minutes FROM focus_sessions WHERE id = ?1",
        params![session_id],
        |row| row.get(0),
    )?;

    let base_points = (duration_minutes / 15).min(8);
    let final_points = apply_daily_cap(&tx, pet_id, base_points)?;

    tx.execute(
        "INSERT INTO growth_events (pet_id, source, points_awarded, related_id)
         VALUES (?1, 'focus_completed', ?2, ?3)",
        params![pet_id, final_points, session_id],
    )?;
    tx.execute(
        "UPDATE pet SET growth_resources = growth_resources + ?1 WHERE id = ?2",
        params![final_points, pet_id],
    )?;
    tx.execute(
        "INSERT INTO behavioral_signals (pet_id, signal_type, value)
         VALUES (?1, 'focus_completed', ?2)",
        params![pet_id, duration_minutes as f64],
    )?;

    tx.commit()?;
    Ok(CompleteFocusResult { points_awarded: final_points })
}

pub fn abort_focus_session(conn: &Connection, session_id: i64) -> Result<(), DbError> {
    conn.execute(
        "UPDATE focus_sessions SET ended_at = datetime('now')
         WHERE id = ?1 AND ended_at IS NULL",
        params![session_id],
    )?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/// Applies the "silent diminishing returns" rule: if the user has already
/// earned 20+ points today (calendar day, local time), halve any new points
/// (floor, minimum 0).
fn apply_daily_cap(
    conn: &Connection,
    pet_id: i64,
    base_points: i64,
) -> Result<i64, DbError> {
    let daily_sum: i64 = conn.query_row(
        "SELECT COALESCE(SUM(points_awarded), 0)
         FROM growth_events
         WHERE pet_id = ?1
           AND occurred_at >= date('now', 'localtime')",
        params![pet_id],
        |row| row.get(0),
    )?;

    let final_points = if daily_sum >= 20 {
        ((base_points as f64) / 2.0).floor() as i64
    } else {
        base_points
    };

    Ok(final_points.max(0))
}
