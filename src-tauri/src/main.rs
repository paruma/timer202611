#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem},
    Manager,
};

struct WindowMenu {
    menu: Menu<tauri::Wry>,
    always_on_top: CheckMenuItem<tauri::Wry>,
    sound: CheckMenuItem<tauri::Wry>,
}

#[tauri::command]
fn show_window_menu(
    window: tauri::WebviewWindow,
    state: tauri::State<WindowMenu>,
    sound_enabled: bool,
) -> Result<(), String> {
    state
        .sound
        .set_checked(sound_enabled)
        .map_err(|error| error.to_string())?;
    state
        .always_on_top
        .set_checked(
            window
                .is_always_on_top()
                .map_err(|error| error.to_string())?,
        )
        .map_err(|error| error.to_string())?;
    window
        .popup_menu(&state.menu)
        .map_err(|error| error.to_string())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let always_on_top = CheckMenuItem::with_id(
                app,
                "always-on-top",
                "常に最前面に表示",
                true,
                false,
                None::<&str>,
            )?;
            let reset_timer =
                MenuItem::with_id(app, "reset-timer", "タイマーをリセット", true, None::<&str>)?;
            let sound = CheckMenuItem::with_id(
                app,
                "toggle-sound",
                "通知音を鳴らす",
                true,
                true,
                None::<&str>,
            )?;
            let menu = Menu::with_items(app, &[&always_on_top, &reset_timer, &sound])?;
            app.manage(WindowMenu {
                menu,
                always_on_top,
                sound,
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![show_window_menu])
        .on_menu_event(|app, event| {
            if event.id().as_ref() == "toggle-sound" {
                if let Some(window) = app.get_webview_window("main") {
                    if let Err(error) =
                        window.eval("window.dispatchEvent(new Event('toggle-sound'))")
                    {
                        eprintln!("通知音を切り替えられませんでした: {error}");
                    }
                }
            }
            if event.id().as_ref() == "reset-timer" {
                if let Some(window) = app.get_webview_window("main") {
                    if let Err(error) =
                        window.eval("window.dispatchEvent(new Event('reset-timer'))")
                    {
                        eprintln!("タイマーをリセットできませんでした: {error}");
                    }
                }
            }
            if event.id().as_ref() == "always-on-top" {
                if let Some(window) = app.get_webview_window("main") {
                    let result = window
                        .is_always_on_top()
                        .and_then(|enabled| window.set_always_on_top(!enabled));
                    if let Err(error) = result {
                        eprintln!("最前面表示を切り替えられませんでした: {error}");
                    }
                    if let Ok(enabled) = window.is_always_on_top() {
                        let _ = app.state::<WindowMenu>().always_on_top.set_checked(enabled);
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("タイマーを起動できませんでした");
}
