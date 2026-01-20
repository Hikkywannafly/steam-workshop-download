use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use regex::Regex;
use tauri::{AppHandle, Emitter};
use crate::models::DownloadTask;

/// Progress update payload for frontend
#[derive(Clone, serde::Serialize)]
pub struct ProgressPayload {
    pub task_id: String,
    pub progress: f32,
    pub speed: Option<String>,
    pub eta: Option<String>,
}

/// Downloader service for DepotDownloader management
pub struct DownloaderService;

impl DownloaderService {
    /// Check if .NET 9.0 Runtime is installed
    pub async fn check_dotnet_runtime() -> Result<bool, String> {
        let output = Command::new("dotnet")
            .arg("--list-runtimes")
            .output()
            .await
            .map_err(|e| format!("Failed to check .NET: {}", e))?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        // Check for .NET 9.x
        Ok(stdout.contains("Microsoft.NETCore.App 9."))
    }

    /// Get .NET 9.0 download URL
    pub fn get_dotnet_download_url() -> String {
        "https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/runtime-9.0.0-windows-x64-installer".to_string()
    }

    /// Kill all DepotDownloader processes
    #[cfg(target_os = "windows")]
    pub async fn cleanup_processes() -> Result<(), String> {
        Command::new("taskkill")
            .args(["/F", "/IM", "DepotDownloaderMod.exe"])
            .output()
            .await
            .ok(); // Ignore errors if no process found
        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    pub async fn cleanup_processes() -> Result<(), String> {
        Ok(())
    }

    /// Parse progress from DepotDownloader output
    pub fn parse_progress(line: &str) -> Option<f32> {
        // Pattern: "Downloading 'file.pak' (45.2 MB / 100.0 MB)"
        let re = Regex::new(r"(\d+\.?\d*)\s*MB\s*/\s*(\d+\.?\d*)\s*MB").ok()?;
        if let Some(caps) = re.captures(line) {
            let current: f32 = caps.get(1)?.as_str().parse().ok()?;
            let total: f32 = caps.get(2)?.as_str().parse().ok()?;
            if total > 0.0 {
                return Some((current / total) * 100.0);
            }
        }
        None
    }

    /// Spawn DepotDownloader process and stream progress
    #[cfg(target_os = "windows")]
    pub async fn spawn_download(
        app_handle: AppHandle,
        task: &DownloadTask,
        exe_path: std::path::PathBuf,
        password: String,
    ) -> Result<(), String> {
        use std::os::windows::process::CommandExt;
        
        // Use download_path directly - user already selects the full path (e.g., D:\Wallpaper Engine\projects\myprojects)
        // Only append pubfile_id to create a subfolder for each wallpaper
        let output_dir = format!(
            "{}\\{}",
            task.download_path, task.pubfile_id
        );

        let mut child = Command::new(&exe_path)
            .args([
                "-app", "431960",
                "-pubfile", &task.pubfile_id,
                "-verify-all",
                "-username", &task.account,
                "-password", &password,
                "-dir", &output_dir,
            ])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .creation_flags(0x08000000) // CREATE_NO_WINDOW
            .spawn()
            .map_err(|e| format!("Failed to spawn DepotDownloader: {}", e))?;

        let stdout = child.stdout.take()
            .ok_or("Failed to capture stdout")?;

        let task_id = task.id.clone();
        let app = app_handle.clone();

        // Stream stdout and emit progress
        tokio::spawn(async move {
            let reader = BufReader::new(stdout);
            let mut lines = reader.lines();

            while let Ok(Some(line)) = lines.next_line().await {
                // Emit log line
                let _ = app.emit("download-log", serde_json::json!({
                    "task_id": &task_id,
                    "line": &line
                }));

                // Parse and emit progress
                if let Some(progress) = Self::parse_progress(&line) {
                    let _ = app.emit("download-progress", ProgressPayload {
                        task_id: task_id.clone(),
                        progress,
                        speed: None, // TODO: parse speed
                        eta: None,   // TODO: calculate ETA
                    });
                }
            }
        });

        // Wait for process to complete
        let status = child.wait().await
            .map_err(|e| format!("Process error: {}", e))?;

        if status.success() {
            Ok(())
        } else {
            Err(format!("Download failed with exit code: {:?}", status.code()))
        }
    }

    #[cfg(not(target_os = "windows"))]
    pub async fn spawn_download(
        _app_handle: AppHandle,
        _task: &DownloadTask,
        _exe_path: std::path::PathBuf,
        _password: String,
    ) -> Result<(), String> {
        Err("Windows only".to_string())
    }
}
