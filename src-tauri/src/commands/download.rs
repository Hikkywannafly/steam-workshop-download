use crate::models::{DownloadTask, DownloadRecord, TaskStatus};
use crate::services::{StorageService, DownloaderService};
use std::sync::Mutex;
use tauri::{State, AppHandle, Manager};
use chrono::Utc;

/// Application state
pub struct AppState {
    pub queue: Mutex<Vec<DownloadTask>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            queue: Mutex::new(Vec::new()),
        }
    }
}

/// Start download for a pubfile ID
#[tauri::command]
pub async fn start_download(
    app: AppHandle,
    pubfile_id: String,
    account: String,
    password: String,
    download_path: String,
) -> Result<(), String> {
    // Validate path exists
    let download_dir = std::path::Path::new(&download_path);
    if !download_dir.exists() {
        return Err(format!("Download path does not exist: {}", download_path));
    }

    // Get DepotDownloaderMod.exe path from assets
    let resource_path = app.path().resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;
    let exe_path = resource_path.join("assets").join("DepotDownloaderMod.exe");
    
    if !exe_path.exists() {
        return Err(format!("DepotDownloaderMod.exe not found at: {}", exe_path.display()));
    }

    // Create task
    let task = DownloadTask::new(
        pubfile_id.clone(),
        pubfile_id.clone(), // Use ID as title for now
        account.clone(),
        download_path.clone(),
    );

    // Spawn download
    DownloaderService::spawn_download(app, &task, exe_path, password).await?;

    // Add to history
    add_to_history(
        pubfile_id,
        task.title,
        "completed".to_string(),
        account,
        download_path,
        None,
    )?;

    Ok(())
}

/// Add a task to download queue
#[tauri::command]
pub fn add_to_queue(
    state: State<AppState>,
    pubfile_id: String,
    title: String,
    account: String,
    download_path: String,
) -> Result<DownloadTask, String> {
    let task = DownloadTask::new(pubfile_id, title, account, download_path);
    let task_clone = task.clone();
    
    let mut queue = state.queue.lock()
        .map_err(|e| format!("Failed to lock queue: {}", e))?;
    queue.push(task);
    
    Ok(task_clone)
}

/// Get current download queue
#[tauri::command]
pub fn get_queue(state: State<AppState>) -> Result<Vec<DownloadTask>, String> {
    let queue = state.queue.lock()
        .map_err(|e| format!("Failed to lock queue: {}", e))?;
    Ok(queue.clone())
}

/// Remove task from queue
#[tauri::command]
pub fn remove_from_queue(state: State<AppState>, task_id: String) -> Result<(), String> {
    let mut queue = state.queue.lock()
        .map_err(|e| format!("Failed to lock queue: {}", e))?;
    queue.retain(|t| t.id != task_id);
    Ok(())
}

/// Update task status
#[tauri::command]
pub fn update_task_status(
    state: State<AppState>,
    task_id: String,
    status: TaskStatus,
    error: Option<String>,
) -> Result<(), String> {
    let mut queue = state.queue.lock()
        .map_err(|e| format!("Failed to lock queue: {}", e))?;
    
    if let Some(task) = queue.iter_mut().find(|t| t.id == task_id) {
        task.status = status;
        task.error = error;
    }
    Ok(())
}

/// Clear completed/failed tasks from queue
#[tauri::command]
pub fn clear_completed(state: State<AppState>) -> Result<(), String> {
    let mut queue = state.queue.lock()
        .map_err(|e| format!("Failed to lock queue: {}", e))?;
    queue.retain(|t| t.status != TaskStatus::Completed && t.status != TaskStatus::Failed);
    Ok(())
}

/// Get download history
#[tauri::command]
pub fn get_history() -> Result<Vec<DownloadRecord>, String> {
    StorageService::load_history()
}

/// Add record to history
#[tauri::command]
pub fn add_to_history(
    pubfile_id: String,
    title: String,
    status: String,
    account_used: String,
    download_path: String,
    error_message: Option<String>,
) -> Result<(), String> {
    let mut history = StorageService::load_history().unwrap_or_default();
    
    let record = DownloadRecord {
        id: uuid::Uuid::new_v4().to_string(),
        pubfile_id,
        title,
        file_size: None,
        download_date: Utc::now().format("%Y-%m-%d %H:%M").to_string(),
        status,
        error_message,
        account_used,
        download_path,
    };
    
    history.insert(0, record); // Add to beginning
    
    // Keep last 100 records
    if history.len() > 100 {
        history.truncate(100);
    }
    
    StorageService::save_history(&history)
}

/// Clear download history
#[tauri::command]
pub fn clear_history() -> Result<(), String> {
    StorageService::save_history(&[])
}
