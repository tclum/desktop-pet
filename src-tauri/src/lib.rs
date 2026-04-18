mod db;
mod notifications;
mod pet;
mod platform;

use pet::PetStateDto;
use rusqlite::Connection;
use std::sync::Mutex;
use tauri::{
    image::Image,
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");

            let conn = db::initialize(&app_data_dir)?;
            app.manage(Mutex::new(conn));

            let icon_bytes = include_bytes!("../icons/tray.png");
            let tray_icon = Image::from_bytes(icon_bytes)?;

            TrayIconBuilder::with_id("main-tray")
                .icon(tray_icon)
                .icon_as_template(true)
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        toggle_pet_window(app);
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_pet,
            record_pet_interaction,
            is_notification_permission_needed,
            mark_notification_permission_asked,
            get_tasks,
            create_task,
            complete_task,
            delete_task,
            start_focus_session,
            complete_focus_session,
            abort_focus_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running desktop pet");
}

fn toggle_pet_window(app: &tauri::AppHandle) {
    let Some(window) = app.get_webview_window("pet") else {
        return;
    };

    if window.is_visible().unwrap_or(false) {
        let _ = window.hide();
    } else {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

// ---------------------------------------------------------------------------
// Pet commands
// ---------------------------------------------------------------------------

#[tauri::command]
fn get_pet(state: tauri::State<'_, Mutex<Connection>>) -> Result<PetStateDto, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    db::load_pet(&conn)
        .map(PetStateDto::from)
        .map_err(|e| e.to_string())
}

/// Records a care interaction and returns the updated pet state.
/// All three DB writes and the re-read happen under a single Mutex lock
/// acquisition, preventing any race with concurrent commands.
#[tauri::command]
fn record_pet_interaction(
    state: tauri::State<'_, Mutex<Connection>>,
    app: tauri::AppHandle,
    pet_id: i64,
) -> Result<PetStateDto, String> {
    let mut conn = state.lock().map_err(|e| e.to_string())?;
    let pet = db::record_interaction_and_reload(&mut conn, pet_id)
        .map(PetStateDto::from)
        .map_err(|e| e.to_string())?;

    let data_dir = app
        .path()
        .app_data_dir()
        .expect("app data dir");
    let db_path = data_dir.join("pet.db");
    let backup_path = data_dir.join("pet.db.backup");
    if let Err(e) = db::maybe_refresh_backup(&db_path, &backup_path) {
        eprintln!("backup refresh failed (non-fatal): {e}");
    }

    Ok(pet)
}

#[tauri::command]
fn is_notification_permission_needed(
    state: tauri::State<'_, Mutex<Connection>>,
) -> Result<bool, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let asked = db::get_setting(&conn, "notification_permission_asked")
        .map_err(|e| e.to_string())?;
    Ok(asked.is_none())
}

#[tauri::command]
fn mark_notification_permission_asked(
    state: tauri::State<'_, Mutex<Connection>>,
) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    db::set_setting(&conn, "notification_permission_asked", "true")
        .map_err(|e| e.to_string())
}

// ---------------------------------------------------------------------------
// Task commands
// ---------------------------------------------------------------------------

#[derive(serde::Serialize)]
pub struct TaskDto {
    pub id: i64,
    pub title: String,
    pub created_at: String,
    pub completed_at: Option<String>,
}

impl From<db::TaskRow> for TaskDto {
    fn from(row: db::TaskRow) -> Self {
        TaskDto {
            id: row.id,
            title: row.title,
            created_at: row.created_at,
            completed_at: row.completed_at,
        }
    }
}

#[tauri::command]
fn get_tasks(state: tauri::State<'_, Mutex<Connection>>) -> Result<Vec<TaskDto>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let pet_id = db::get_current_pet_id(&conn).map_err(|e| e.to_string())?;
    db::load_tasks(&conn, pet_id)
        .map(|rows| rows.into_iter().map(TaskDto::from).collect())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn create_task(
    state: tauri::State<'_, Mutex<Connection>>,
    title: String,
) -> Result<TaskDto, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let pet_id = db::get_current_pet_id(&conn).map_err(|e| e.to_string())?;
    let task = db::insert_task(&conn, pet_id, &title).map_err(|e| e.to_string())?;
    db::log_task_created_signal(&conn, pet_id).map_err(|e| e.to_string())?;
    Ok(TaskDto::from(task))
}

#[derive(serde::Serialize)]
pub struct CompleteTaskDto {
    pub points_awarded: i64,
}

#[tauri::command]
fn complete_task(
    state: tauri::State<'_, Mutex<Connection>>,
    task_id: i64,
) -> Result<CompleteTaskDto, String> {
    let mut conn = state.lock().map_err(|e| e.to_string())?;
    let pet_id = db::get_current_pet_id(&conn).map_err(|e| e.to_string())?;
    db::complete_task(&mut conn, task_id, pet_id)
        .map(|r| CompleteTaskDto { points_awarded: r.points_awarded })
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_task(
    state: tauri::State<'_, Mutex<Connection>>,
    task_id: i64,
) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    db::soft_delete_task(&conn, task_id).map_err(|e| e.to_string())
}

// ---------------------------------------------------------------------------
// Focus session commands
// ---------------------------------------------------------------------------

#[derive(serde::Serialize)]
pub struct FocusSessionDto {
    pub id: i64,
    pub started_at: String,
    pub duration_minutes: i64,
}

impl From<db::FocusSessionRow> for FocusSessionDto {
    fn from(row: db::FocusSessionRow) -> Self {
        FocusSessionDto {
            id: row.id,
            started_at: row.started_at,
            duration_minutes: row.duration_minutes,
        }
    }
}

#[derive(serde::Serialize)]
pub struct CompleteFocusDto {
    pub points_awarded: i64,
}

#[tauri::command]
fn start_focus_session(
    state: tauri::State<'_, Mutex<Connection>>,
    duration_minutes: i64,
) -> Result<FocusSessionDto, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let pet_id = db::get_current_pet_id(&conn).map_err(|e| e.to_string())?;
    db::start_focus_session(&conn, pet_id, duration_minutes)
        .map(FocusSessionDto::from)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn complete_focus_session(
    state: tauri::State<'_, Mutex<Connection>>,
    session_id: i64,
) -> Result<CompleteFocusDto, String> {
    let mut conn = state.lock().map_err(|e| e.to_string())?;
    let pet_id = db::get_current_pet_id(&conn).map_err(|e| e.to_string())?;
    db::complete_focus_session(&mut conn, session_id, pet_id)
        .map(|r| CompleteFocusDto { points_awarded: r.points_awarded })
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn abort_focus_session(
    state: tauri::State<'_, Mutex<Connection>>,
    session_id: i64,
) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    db::abort_focus_session(&conn, session_id).map_err(|e| e.to_string())
}
