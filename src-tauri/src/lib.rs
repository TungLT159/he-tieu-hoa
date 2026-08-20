pub mod settings;

use tauri::Manager;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct NativeMenuRemovalStatus {
    pub window_menus_removed: usize,
}

pub trait NativeMenuRemover {
    type Error;

    fn remove_app_menu(&self) -> Result<(), Self::Error>;
    fn remove_window_menus(&self) -> Result<usize, Self::Error>;
}

pub fn remove_native_menus<T: NativeMenuRemover>(
    remover: &T,
) -> Result<NativeMenuRemovalStatus, T::Error> {
    remover.remove_app_menu()?;
    let window_menus_removed = remover.remove_window_menus()?;

    Ok(NativeMenuRemovalStatus {
        window_menus_removed,
    })
}

impl NativeMenuRemover for tauri::AppHandle {
    type Error = tauri::Error;

    fn remove_app_menu(&self) -> Result<(), Self::Error> {
        self.remove_menu().map(|_| ())
    }

    fn remove_window_menus(&self) -> Result<usize, Self::Error> {
        let mut removed = 0;

        for window in self.webview_windows().values() {
            window.remove_menu()?;
            removed += 1;
        }

        Ok(removed)
    }
}

#[tauri::command]
fn get_app_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

#[tauri::command]
fn open_system_screenshot_tool() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", "", "ms-screenclip:"])
            .spawn()
            .map(|_| ())
            .or_else(|_| {
                std::process::Command::new("explorer")
                    .arg("ms-screenclip:")
                    .spawn()
                    .map(|_| ())
            })
            .map_err(|error| format!("failed to launch Windows screenshot tool: {error}"))
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("/usr/sbin/screencapture")
            .arg("-i")
            .spawn()
            .map(|_| ())
            .map_err(|error| format!("failed to launch macOS screenshot tool: {error}"))
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        Err("system screenshot tool is unsupported on this platform".to_string())
    }
}

#[tauri::command]
async fn download_image_to_path(url: String, path: String) -> Result<(), String> {
    let response = reqwest::get(&url)
        .await
        .map_err(|error| format!("failed to download image: {error}"))?;

    if !response.status().is_success() {
        return Err(format!("Download failed: {}", response.status().as_u16()));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|error| format!("failed to read image bytes: {error}"))?;

    std::fs::write(&path, bytes).map_err(|error| format!("failed to save image: {error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            remove_native_menus(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            download_image_to_path,
            get_app_version,
            open_system_screenshot_tool,
            settings::get_settings,
            settings::save_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Phần mềm 3D Hệ tiêu hóa");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::Cell;

    #[derive(Default)]
    struct FakeNativeMenus {
        app_menu_removed: Cell<bool>,
        window_menu_removals: Cell<usize>,
    }

    impl NativeMenuRemover for FakeNativeMenus {
        type Error = String;

        fn remove_app_menu(&self) -> Result<(), Self::Error> {
            self.app_menu_removed.set(true);
            Ok(())
        }

        fn remove_window_menus(&self) -> Result<usize, Self::Error> {
            self.window_menu_removals.set(1);
            Ok(1)
        }
    }

    #[test]
    fn native_menu_removal_clears_app_and_window_menus() {
        let menus = FakeNativeMenus::default();

        let status = remove_native_menus(&menus).expect("native menus should be removable");

        assert!(menus.app_menu_removed.get());
        assert_eq!(menus.window_menu_removals.get(), 1);
        assert_eq!(status.window_menus_removed, 1);
    }
}
