// Notification utility - In-app toast system only
// No external dependencies required

// In-app toast notifications (using CSS classes)
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

let toastCallback: ((toast: Toast) => void) | null = null;

export function setToastCallback(callback: (toast: Toast) => void) {
    toastCallback = callback;
}

export function showToast(type: ToastType, title: string, message?: string, duration = 5000) {
    if (toastCallback) {
        toastCallback({
            id: Date.now().toString(),
            type,
            title,
            message,
            duration,
        });
    }
}

// Convenience functions for download notifications
export function notifyDownloadComplete(title: string, workshopId: string) {
    showToast("success", "Download Complete", `Successfully downloaded: ${title || workshopId}`);
}

export function notifyDownloadError(workshopId: string, error: string) {
    showToast("error", "Download Failed", `${workshopId}: ${error}`);
}

export function notifyRetrying(workshopId: string, attempt: number, maxAttempts: number) {
    showToast("info", "Retrying Download", `${workshopId}: Attempt ${attempt}/${maxAttempts}`);
}
