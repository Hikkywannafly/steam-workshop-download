use crate::models::AppSettings;
use std::fs;
use std::path::PathBuf;

/// Storage service for JSON-based persistence
pub struct StorageService;

impl StorageService {
    /// Get the config directory path
    pub fn get_config_dir() -> PathBuf {
        dirs::config_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("workshop-downloader")
    }

    /// Ensure config directory exists
    pub fn ensure_config_dir() -> Result<(), String> {
        let dir = Self::get_config_dir();
        fs::create_dir_all(&dir).map_err(|e| format!("Failed to create config dir: {}", e))
    }

    /// Load settings from JSON file
    pub fn load_settings() -> Result<AppSettings, String> {
        let path = Self::get_config_dir().join("settings.json");
        if path.exists() {
            let content = fs::read_to_string(&path)
                .map_err(|e| format!("Failed to read settings: {}", e))?;
            serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse settings: {}", e))
        } else {
            Ok(AppSettings::default())
        }
    }

    /// Save settings to JSON file
    pub fn save_settings(settings: &AppSettings) -> Result<(), String> {
        Self::ensure_config_dir()?;
        let path = Self::get_config_dir().join("settings.json");
        let json = serde_json::to_string_pretty(settings)
            .map_err(|e| format!("Failed to serialize settings: {}", e))?;
        fs::write(&path, json).map_err(|e| format!("Failed to write settings: {}", e))
    }

    /// Load download history
    pub fn load_history() -> Result<Vec<crate::models::DownloadRecord>, String> {
        let path = Self::get_config_dir().join("history.json");
        if path.exists() {
            let content = fs::read_to_string(&path)
                .map_err(|e| format!("Failed to read history: {}", e))?;
            serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse history: {}", e))
        } else {
            Ok(Vec::new())
        }
    }

    /// Save download history
    pub fn save_history(history: &[crate::models::DownloadRecord]) -> Result<(), String> {
        Self::ensure_config_dir()?;
        let path = Self::get_config_dir().join("history.json");
        let json = serde_json::to_string_pretty(history)
            .map_err(|e| format!("Failed to serialize history: {}", e))?;
        fs::write(&path, json).map_err(|e| format!("Failed to write history: {}", e))
    }
}
