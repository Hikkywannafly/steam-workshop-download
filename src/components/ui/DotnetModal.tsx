import { open } from "@tauri-apps/plugin-shell";
import { X, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";

interface DotnetModalProps {
    onClose: () => void;
    onRecheck: () => Promise<void>;
}

export function DotnetModal({ onClose, onRecheck }: DotnetModalProps) {
    const openDownload = () => {
        open("https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/sdk-9.0.303-windows-x64-installer");
    };

    const handleRecheck = async () => {
        await onRecheck();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-surface border border-border rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-foreground-muted hover:text-foreground transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Icon + Title */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base">.NET 9.0 Runtime Required</h3>
                        <p className="text-sm text-foreground-muted mt-1">
                            This application requires <strong>.NET 9.0 Runtime</strong> to download workshop items.
                            Please install it and re-check.
                        </p>
                    </div>
                </div>

                {/* Download link box */}
                <div className="bg-background border border-border rounded-lg p-3 mb-4 text-xs text-foreground-muted break-all">
                    <span className="font-medium">Download: </span>
                    https://dotnet.microsoft.com/download/dotnet/9.0
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={openDownload}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-md transition-colors"
                    >
                        Download .NET 9.0 <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={handleRecheck}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 border border-border hover:bg-surface-hover text-sm rounded-md transition-colors"
                        title="Re-check after installing"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Re-check
                    </button>
                </div>
            </div>
        </div>
    );
}
