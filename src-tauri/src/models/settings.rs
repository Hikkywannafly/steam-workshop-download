use serde::{Deserialize, Serialize};

/// Application settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    /// Wallpaper Engine installation path
    pub download_path: String,
    /// Maximum concurrent downloads
    pub max_concurrent_downloads: u32,
    /// Auto retry failed downloads
    pub auto_retry: bool,
    /// Number of retry attempts
    pub retry_attempts: u32,
    /// Default account username
    pub default_account: Option<String>,
    /// UI theme
    pub theme: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            download_path: String::new(),
            max_concurrent_downloads: 3,
            auto_retry: true,
            retry_attempts: 3,
            default_account: None,
            theme: "dark".to_string(),
        }
    }
}

/// Account info (password stored in OS keyring)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    pub id: String,
    pub username: String,
    pub is_default: bool,
}
