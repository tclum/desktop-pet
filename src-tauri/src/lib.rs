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
