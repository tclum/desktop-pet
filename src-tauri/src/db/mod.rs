use rusqlite::Connection;
use std::path::Path;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum DbError {
    #[error("sqlite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}

pub fn initialize(app_data_dir: &Path) -> Result<(), DbError> {
    std::fs::create_dir_all(app_data_dir)?;

    let db_path = app_data_dir.join("pet.db");
    let backup_path = app_data_dir.join("pet.db.backup");

    let conn = open_with_fallback(&db_path, &backup_path)?;
    apply_schema(&conn)?;
    maybe_refresh_backup(&db_path, &backup_path)?;

    Ok(())
}

fn open_with_fallback(db_path: &Path, backup_path: &Path) -> Result<Connection, DbError> {
    if let Ok(conn) = Connection::open(db_path) {
        let is_healthy = conn
            .query_row("PRAGMA integrity_check", [], |row| {
                row.get::<_, String>(0)
            })
            .map(|result| result == "ok")
            .unwrap_or(false);

        if is_healthy {
            return Ok(conn);
        }
    }

    // Main DB is missing or corrupt — restore from backup if one exists.
    if backup_path.exists() {
        std::fs::copy(backup_path, db_path)?;
        return Ok(Connection::open(db_path)?);
    }

    // No backup either — start fresh.
    Ok(Connection::open(db_path)?)
}

fn apply_schema(conn: &Connection) -> Result<(), DbError> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS schema_version (
            version  INTEGER NOT NULL,
            applied  TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        INSERT INTO schema_version (version)
        SELECT 1
        WHERE NOT EXISTS (SELECT 1 FROM schema_version);
        ",
    )?;
    Ok(())
}

// Refresh backup when it is missing or older than 24 hours.
fn maybe_refresh_backup(db_path: &Path, backup_path: &Path) -> Result<(), DbError> {
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
