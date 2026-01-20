import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";



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





// Event Listeners
export async function listenDownloadLog(callback: (log: { task_id: string; line: string }) => void) {
    return listen("download-log", (event) => callback(event.payload as any));
}


