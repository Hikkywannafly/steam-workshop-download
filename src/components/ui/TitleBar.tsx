import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

interface TitleBarProps {
    title?: string;
    icon?: string;
}

export function TitleBar({ title = "Workshop Downloader", icon = "/icon.png" }: TitleBarProps) {
    const appWindow = getCurrentWindow();

    const handleMinimize = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await appWindow.minimize();
    };

    const handleMaximize = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await appWindow.toggleMaximize();
    };

    const handleClose = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await appWindow.close();
    };

    return (
        <div
            data-tauri-drag-region
            className="h-9 flex items-center justify-between bg-background border-b border-border select-none"
        >
            {/* Left: Icon and Title - Draggable */}
            <div className="flex items-center gap-2 px-3 h-full flex-1">
                <img src={icon} alt="Logo" className="w-5 h-5" draggable={false} />
                <span className="text-sm font-medium text-foreground-muted">{title}</span>
            </div>

            {/* Right: Window Controls - NOT draggable */}
            <div className="flex h-full no-drag">
                <button
                    type="button"
                    onClick={handleMinimize}
                    className="h-full w-12 flex items-center justify-center hover:bg-surface-hover transition-colors"
                    aria-label="Minimize"
                    style={{ pointerEvents: 'auto' }}
                >
                    <Minus className="w-4 h-4" style={{ pointerEvents: 'none' }} />
                </button>
                <button
                    type="button"
                    onClick={handleMaximize}
                    className="h-full w-12 flex items-center justify-center hover:bg-surface-hover transition-colors"
                    aria-label="Maximize"
                    style={{ pointerEvents: 'auto' }}
                >
                    <Square className="w-3.5 h-3.5" style={{ pointerEvents: 'none' }} />
                </button>
                <button
                    type="button"
                    onClick={handleClose}
                    className="h-full w-12 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                    aria-label="Close"
                    style={{ pointerEvents: 'auto' }}
                >
                    <X className="w-4 h-4" style={{ pointerEvents: 'none' }} />
                </button>
            </div>
        </div>
    );
}
