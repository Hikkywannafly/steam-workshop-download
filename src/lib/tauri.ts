import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

// Types
export interface DownloadTask {
    id: string;
    pubfile_id: string;
    title: string;
    status: "queued" | "downloading" | "paused" | "completed" | "failed";
    progress: number;
    speed?: string;
    eta?: string;
    error?: string;
    account: string;
    download_path: string;
}

export interface DownloadRecord {
    id: string;
    pubfile_id: string;
    title: string;
    file_size?: number;
    download_date: string;
    status: string;
    error_message?: string;
    account_used: string;
    download_path: string;
}

export interface AppSettings {
    download_path: string;
    max_concurrent_downloads: number;
    auto_retry: boolean;
    retry_attempts: number;
    default_account?: string;
    theme: string;
}

// System Commands
export async function checkDotnetRuntime(): Promise<boolean> {
    return invoke<boolean>("check_dotnet_runtime");
}

export async function getDotnetDownloadUrl(): Promise<string> {
    return invoke<string>("get_dotnet_download_url");
}

export async function selectFolder(): Promise<string | null> {
    return invoke<string | null>("select_folder");
}

export async function loadSettings(): Promise<AppSettings> {
    return invoke<AppSettings>("load_settings");
}

export async function saveSettings(settings: AppSettings): Promise<void> {
    return invoke("save_settings", { settings });
}

export async function getConfigPath(): Promise<string> {
    return invoke<string>("get_config_path");
}

// Download Commands
export async function startDownload(
    pubfileId: string,
    account: string,
    password: string,
    downloadPath: string
): Promise<void> {
    return invoke("start_download", {
        pubfileId,
        account,
        password,
        downloadPath,
    });
}

export async function addToQueue(
    pubfileId: string,
    title: string,
    account: string,
    downloadPath: string
): Promise<DownloadTask> {
    return invoke<DownloadTask>("add_to_queue", {
        pubfileId,
        title,
        account,
        downloadPath,
    });
}

export async function getQueue(): Promise<DownloadTask[]> {
    return invoke<DownloadTask[]>("get_queue");
}

export async function removeFromQueue(taskId: string): Promise<void> {
    return invoke("remove_from_queue", { taskId });
}

export async function updateTaskStatus(
    taskId: string,
    status: DownloadTask["status"],
    error?: string
): Promise<void> {
    return invoke("update_task_status", { taskId, status, error });
}

export async function clearCompleted(): Promise<void> {
    return invoke("clear_completed");
}

// History Commands
export async function getHistory(): Promise<DownloadRecord[]> {
    return invoke<DownloadRecord[]>("get_history");
}

export async function addToHistory(
    pubfileId: string,
    title: string,
    status: string,
    accountUsed: string,
    downloadPath: string,
    errorMessage?: string
): Promise<void> {
    return invoke("add_to_history", {
        pubfileId,
        title,
        status,
        accountUsed,
        downloadPath,
        errorMessage,
    });
}

export async function clearHistory(): Promise<void> {
    return invoke("clear_history");
}

// Event Listeners
export async function listenDownloadLog(callback: (log: { task_id: string; line: string }) => void) {
    return listen("download-log", (event) => callback(event.payload as any));
}

export async function listenDownloadProgress(callback: (progress: { task_id: string; progress: number; speed?: string; eta?: string }) => void) {
    return listen("download-progress", (event) => callback(event.payload as any));
}
