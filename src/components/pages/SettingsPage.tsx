import { useState } from "react";
import { Settings, CheckCircle, XCircle, ExternalLink, Cpu, RefreshCw } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";

interface SettingsPageProps {
    dotnetInstalled: boolean | null;
    onRecheckDotnet: () => Promise<void>;
}

export function SettingsPage({ dotnetInstalled, onRecheckDotnet }: SettingsPageProps) {
    const [rechecking, setRechecking] = useState(false);

    const openDotnetDownload = async () => {
        try {
            await open("https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/sdk-9.0.303-windows-x64-installer");
        } catch (error) {
            console.error("Failed to open download link:", error);
        }
    };

    const handleRecheck = async () => {
        setRechecking(true);
        await onRecheckDotnet();
        setRechecking(false);
    };

    return (
        <div className="h-full p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <Settings className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Settings</h2>
                    <p className="text-foreground-muted text-sm">
                        Configure application preferences
                    </p>
                </div>

                {/* .NET Runtime Check */}
                <div className={`rounded-lg border p-4 ${dotnetInstalled === true
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                    }`}>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Cpu className={`w-4 h-4 ${dotnetInstalled === true ? "text-green-500" : "text-red-500"}`} />
                        .NET Runtime Status
                    </h3>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {dotnetInstalled === true ? (
                                <>
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <div>
                                        <p className="text-sm font-medium text-green-500">.NET 9.0 Installed</p>
                                        <p className="text-xs text-foreground-muted">All features are available</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    <div>
                                        <p className="text-sm font-medium text-red-500">.NET 9.0 Not Found</p>
                                        <p className="text-xs text-foreground-muted">
                                            Required to download workshop items
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRecheck}
                                disabled={rechecking}
                                className="flex items-center gap-1.5 px-3 py-2 border border-border hover:bg-surface-hover text-sm rounded-md transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${rechecking ? "animate-spin" : ""}`} />
                                Re-check
                            </button>
                            {dotnetInstalled !== true && (
                                <button
                                    onClick={openDotnetDownload}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm rounded-md transition-colors"
                                >
                                    Download .NET 9.0 <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
