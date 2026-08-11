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
        std::process::Command::new("SnippingTool.exe")
            .arg("/clip")
            .spawn()
            .map(|_| ())
            .or_else(|_| {
                std::process::Command::new("SnippingTool.exe")
                    .spawn()
                    .map(|_| ())
            })
            .or_else(|_| {
                std::process::Command::new("snippingtool.exe")
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            remove_native_menus(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
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
