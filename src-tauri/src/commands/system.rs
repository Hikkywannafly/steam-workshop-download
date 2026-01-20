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

/// Steam game search result
#[derive(serde::Serialize)]
pub struct SteamGameResult {
    pub app_id: String,
    pub name: String,
    pub icon: Option<String>,
}

/// Search Steam games by name using Steam Store Search API
#[tauri::command]
pub async fn search_steam_games(query: String) -> Result<Vec<SteamGameResult>, String> {
    if query.trim().is_empty() {
        return Ok(vec![]);
    }

    let url = format!(
        "https://store.steampowered.com/api/storesearch/?term={}&l=en&cc=US",
        urlencoding::encode(&query)
    );

    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("HTTP request failed: {}", e))?;

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;

    let empty_items: Vec<serde_json::Value> = vec![];
    let items = json["items"].as_array().unwrap_or(&empty_items);
    
    let results: Vec<SteamGameResult> = items
        .iter()
        .take(10) // Limit to 10 results
        .filter_map(|item| {
            let app_id = item["id"].as_u64()?.to_string();
            let name = item["name"].as_str()?.to_string();
            let icon = item["tiny_image"].as_str().map(|s| s.to_string());
            Some(SteamGameResult { app_id, name, icon })
        })
        .collect();

    Ok(results)
}
