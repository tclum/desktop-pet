mod db;
mod notifications;
mod pet;
mod platform;

use tauri::{
    image::Image,
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let db_path = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");

            db::initialize(&db_path)?;

            // Embed icon at compile time so it works in both dev and release.
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
