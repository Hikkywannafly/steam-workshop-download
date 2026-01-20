use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Download task status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TaskStatus {
    Queued,
    Downloading,
    Paused,
    Completed,
    Failed,
}

impl Default for TaskStatus {
    fn default() -> Self {
        TaskStatus::Queued
    }
}

/// A single download task
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadTask {
    pub id: String,
    pub pubfile_id: String,
    pub title: String,
    pub status: TaskStatus,
    pub progress: f32,
    pub speed: Option<String>,
    pub eta: Option<String>,
    pub error: Option<String>,
    pub account: String,
    pub download_path: String,
    pub app_id: String,
}

impl DownloadTask {
    pub fn new(pubfile_id: String, title: String, account: String, download_path: String, app_id: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            pubfile_id,
            title,
            status: TaskStatus::Queued,
            progress: 0.0,
            speed: None,
            eta: None,
            error: None,
            account,
            download_path,
            app_id,
        }
    }
}

/// Download history record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadRecord {
    pub id: String,
    pub pubfile_id: String,
    pub title: String,
    pub file_size: Option<u64>,
    pub download_date: String,
    pub status: String,
    pub error_message: Option<String>,
    pub account_used: String,
    pub download_path: String,
}
