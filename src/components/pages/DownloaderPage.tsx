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
                <p className="text-xs text-foreground-muted mb-4 flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    <span>Have questions? Contact me on Discord. <span className="font-medium text-indigo-600">nekozzuki</span></span>
                </p>
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
