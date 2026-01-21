import { useState } from "react";
import { Link } from "lucide-react";
import { AccountSelector } from "@/components/ui/AccountSelector";
import type { Account } from "@/components/ui/AccountSelector";
import { GameSelector } from "@/components/ui/GameSelector";
import { PathSelector } from "@/components/ui/PathSelector";
import { ConsoleOutput } from "@/components/ui/ConsoleOutput";
import { WorkshopInputPreview } from "@/components/ui/WorkshopPreview";
import * as tauri from "@/lib/tauri";
import { showToast, notifyDownloadComplete, notifyDownloadError } from "@/lib/notifications";

interface DownloaderPageProps {
    accounts: Account[];
    selectedAccountId: string;
    onAccountChange: (id: string) => void;
    downloadPath: string;
    onSelectPath: () => void;
    consoleOutput: string[];
    onClearConsole: () => void;
    addLog: (msg: string) => void;
    dotnetInstalled: boolean | null;
}

export function DownloaderPage({
    accounts,
    selectedAccountId,
    onAccountChange,
    downloadPath,
    onSelectPath,
    consoleOutput,
    onClearConsole,
    addLog,
    dotnetInstalled,
}: DownloaderPageProps) {
    const [workshopLinks, setWorkshopLinks] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState("431960");
    const [gameName, setGameName] = useState("Wallpaper Engine");

    const maxRetries = 3;

    const startDownload = async () => {
        // Check .NET first
        if (dotnetInstalled !== true) {
            addLog("❌ Error: .NET 9.0 Runtime is not installed");
            addLog("💡 Download .NET 9.0: https://dotnet.microsoft.com/download/dotnet/9.0");
            showToast("error", ".NET Required", "Please install .NET 9.0 Runtime first");
            return;
        }

        if (downloadPath === "Not set") {
            addLog("❌ Error: Save location is not set");
            showToast("error", "Error", "Please set download location first");
            return;
        }
        if (!workshopLinks.trim()) {
            addLog("❌ Error: Enter workshop links or IDs");
            showToast("error", "Error", "Enter workshop links or IDs");
            return;
        }

        const currentAccount = accounts.find((a) => a.id === selectedAccountId);
        if (!currentAccount) {
            addLog("❌ Error: No account selected");
            showToast("error", "Error", "No account selected");
            return;
        }

        setIsDownloading(true);
        const lines = workshopLinks.split("\n").filter((l) => l.trim());
        const idRegex = /\b\d{8,10}\b/;

        let successCount = 0;
        let failCount = 0;

        for (const line of lines) {
            const match = line.match(idRegex);
            if (match) {
                const id = match[0];
                addLog(`----------Downloading ${id}--------`);
                addLog(`🎮 Game: ${gameName} (App ID ${selectedAppId})`);

                let success = false;
                let lastError = "";

                // Retry logic
                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        if (attempt > 1) {
                            addLog(`🔄 Retry attempt ${attempt}/${maxRetries}...`);
                        }

                        await tauri.startDownload(
                            id,
                            currentAccount.username,
                            currentAccount.password,
                            downloadPath,
                            selectedAppId
                        );
                        addLog(`✅ Download completed: ${id}`);
                        success = true;
                        successCount++;
                        await notifyDownloadComplete(id, id);
                        break;
                    } catch (error) {
                        lastError = error instanceof Error ? error.message : String(error);
                        addLog(`⚠️ Attempt ${attempt} failed: ${lastError}`);

                        if (attempt < maxRetries) {
                            // Wait before retry (exponential backoff)
                            const waitTime = Math.pow(2, attempt) * 1000;
                            addLog(`⏳ Waiting ${waitTime / 1000}s before retry...`);
                            await new Promise((resolve) => setTimeout(resolve, waitTime));
                        }
                    }
                }

                if (!success) {
                    addLog(`❌ Download failed after ${maxRetries} attempts: ${lastError}`);
                    failCount++;
                    await notifyDownloadError(id, lastError);
                    showToast("error", "Download Failed", `${id}: ${lastError}`);
                }

                addLog(`-------------Download finished-----------`);
            } else {
                addLog(`⚠️ Invalid link: ${line}`);
            }
        }

        // Summary notification
        if (lines.length > 1) {
            if (failCount === 0) {
                showToast("success", "All Downloads Complete", `${successCount} items downloaded successfully`);
            } else {
                showToast("warning", "Downloads Complete", `${successCount} succeeded, ${failCount} failed`);
            }
        }

        setIsDownloading(false);
    };

    return (
        <div className="h-full p-4 grid grid-cols-2 gap-3 overflow-hidden">
            {/* Left Column - Controls */}
            <div className="h-full overflow-y-auto space-y-3 flex flex-col">
                <AccountSelector
                    accounts={accounts}
                    selectedAccountId={selectedAccountId}
                    onAccountChange={onAccountChange}
                />

                <GameSelector
                    selectedAppId={selectedAppId}
                    onAppIdChange={(appId, name) => {
                        setSelectedAppId(appId);
                        setGameName(name);
                    }}
                    defaultGameName={gameName}
                />

                <PathSelector path={downloadPath} onSelectPath={onSelectPath} />

                {/* Links */}
                <div className="bg-surface rounded-lg p-3 border border-border flex flex-col min-h-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                        <Link className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-medium">Workshop Links</span>
                    </div>
                    <textarea
                        value={workshopLinks}
                        onChange={(e) => setWorkshopLinks(e.target.value)}
                        placeholder="Enter links or IDs (one per line)...&#10;Example: https://steamcommunity.com/sharedfiles/filedetails/?id=3629379075&#10;Or just: 3629379075"
                        className="flex-1 w-full px-3 py-2 bg-background border border-border rounded-md text-sm placeholder:text-muted resize-none font-mono min-h-[80px]"
                    />
                    {/* Auto-show preview when valid workshop IDs detected */}
                    <div className="overflow-y-auto max-h-[150px]">
                        <WorkshopInputPreview input={workshopLinks} />
                    </div>
                </div>

                {/* Download Button */}
                <button
                    onClick={startDownload}
                    disabled={isDownloading}
                    className="w-full px-4 py-2.5 bg-blue-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 flex-shrink-0"
                >
                    {isDownloading ? "Downloading..." : "Start Download"}
                </button>
            </div>

            {/* Right Column - Console */}
            <div className="h-full overflow-hidden">
                <ConsoleOutput
                    logs={consoleOutput}
                    onClear={onClearConsole}
                    className="h-full"
                />
            </div>
        </div>
    );
}
