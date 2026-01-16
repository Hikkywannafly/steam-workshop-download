use crate::services::{DownloaderService, StorageService};
use crate::models::AppSettings;
use tauri_plugin_dialog::DialogExt;
use std::sync::mpsc;

/// Check if .NET 9.0 Runtime is installed
#[tauri::command]
pub async fn check_dotnet_runtime() -> Result<bool, String> {
    DownloaderService::check_dotnet_runtime().await
}

/// Get .NET 9.0 download URL
#[tauri::command]
pub fn get_dotnet_download_url() -> String {
    DownloaderService::get_dotnet_download_url()
}

/// Open folder picker dialog
#[tauri::command]
pub async fn select_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let (tx, rx) = mpsc::channel();
    
    app.dialog()
        .file()
        .pick_folder(move |folder_path| {
            let _ = tx.send(folder_path.map(|p| p.to_string()));
        });
    
    // Wait for dialog result
    rx.recv()
        .map_err(|e| format!("Dialog error: {}", e))
}

/// Load app settings
#[tauri::command]
pub fn load_settings() -> Result<AppSettings, String> {
    StorageService::load_settings()
}

/// Save app settings
#[tauri::command]
pub fn save_settings(settings: AppSettings) -> Result<(), String> {
    StorageService::save_settings(&settings)
}

/// Get config directory path
#[tauri::command]
pub fn get_config_path() -> String {
    StorageService::get_config_dir().to_string_lossy().to_string()
}
