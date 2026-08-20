use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Deserialize, PartialEq, Eq, Serialize)]
pub struct AppSettings {
    pub theme_mode: Option<String>,
    pub ui_language: Option<String>,
    pub narration_voice: Option<String>,
    pub notifications_enabled: Option<bool>,
    pub profile_display_name: Option<String>,
}

fn normalize_choice(value: Option<String>, allowed: &[&str]) -> Option<String> {
    let value = value?.trim().to_string();
    allowed
        .iter()
        .any(|candidate| *candidate == value)
        .then_some(value)
}

fn normalize_optional_string(value: Option<String>) -> Option<String> {
    value
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

pub fn normalize_settings(settings: AppSettings) -> AppSettings {
    AppSettings {
        theme_mode: normalize_choice(settings.theme_mode, &["light", "dark", "system"]),
        ui_language: normalize_choice(settings.ui_language, &["en", "vi", "system"]),
        narration_voice: normalize_choice(settings.narration_voice, &["bac", "trung", "nam"]),
        notifications_enabled: settings.notifications_enabled,
        profile_display_name: normalize_optional_string(settings.profile_display_name),
    }
}

#[tauri::command]
pub fn get_settings() -> Result<AppSettings, String> {
    Ok(AppSettings::default())
}

#[tauri::command]
pub fn save_settings(settings: AppSettings) -> Result<AppSettings, String> {
    Ok(normalize_settings(settings))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_starter_settings() {
        let settings = AppSettings {
            theme_mode: Some("dark".to_string()),
            ui_language: Some("vi".to_string()),
            narration_voice: Some("nam".to_string()),
            notifications_enabled: Some(true),
            profile_display_name: Some("Starter User".to_string()),
        };

        let normalized = normalize_settings(settings);

        assert_eq!(normalized.theme_mode.as_deref(), Some("dark"));
        assert_eq!(normalized.ui_language.as_deref(), Some("vi"));
        assert_eq!(normalized.narration_voice.as_deref(), Some("nam"));
        assert_eq!(normalized.notifications_enabled, Some(true));
        assert_eq!(
            normalized.profile_display_name.as_deref(),
            Some("Starter User")
        );
    }

    #[test]
    fn rejects_removed_locale_and_theme_values() {
        let settings = AppSettings {
            theme_mode: Some("sepia".to_string()),
            ui_language: Some("fr-FR".to_string()),
            narration_voice: Some("mien".to_string()),
            notifications_enabled: None,
            profile_display_name: None,
        };

        let normalized = normalize_settings(settings);

        assert_eq!(normalized.theme_mode, None);
        assert_eq!(normalized.ui_language, None);
        assert_eq!(normalized.narration_voice, None);
    }
}
