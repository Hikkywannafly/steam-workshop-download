import { create } from "zustand";
import type { DownloadTask, DownloadRecord, AppSettings } from "@/lib/tauri";

interface AppState {
    // Settings
    settings: AppSettings | null;
    setSettings: (settings: AppSettings) => void;

    // Download Queue
    queue: DownloadTask[];
    setQueue: (queue: DownloadTask[]) => void;
    addToQueue: (task: DownloadTask) => void;
    removeFromQueue: (taskId: string) => void;
    updateTaskProgress: (taskId: string, progress: number, speed?: string, eta?: string) => void;
    updateTaskStatus: (taskId: string, status: DownloadTask["status"], error?: string) => void;

    // History
    history: DownloadRecord[];
    setHistory: (history: DownloadRecord[]) => void;
    addToHistory: (record: DownloadRecord) => void;
    clearHistory: () => void;

    // UI State
    selectedAccount: string | null;
    setSelectedAccount: (account: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Settings
    settings: null,
    setSettings: (settings) => set({ settings }),

    // Queue
    queue: [],
    setQueue: (queue) => set({ queue }),
    addToQueue: (task) =>
        set((state) => ({ queue: [...state.queue, task] })),
    removeFromQueue: (taskId) =>
        set((state) => ({
            queue: state.queue.filter((t) => t.id !== taskId),
        })),
    updateTaskProgress: (taskId, progress, speed, eta) =>
        set((state) => ({
            queue: state.queue.map((t) =>
                t.id === taskId ? { ...t, progress, speed, eta } : t
            ),
        })),
    updateTaskStatus: (taskId, status, error) =>
        set((state) => ({
            queue: state.queue.map((t) =>
                t.id === taskId ? { ...t, status, error } : t
            ),
        })),

    // History
    history: [],
    setHistory: (history) => set({ history }),
    addToHistory: (record) =>
        set((state) => ({ history: [record, ...state.history] })),
    clearHistory: () => set({ history: [] }),

    // UI
    selectedAccount: null,
    setSelectedAccount: (account) => set({ selectedAccount: account }),
}));
