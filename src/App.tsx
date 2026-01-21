import { useState, useEffect } from "react";
import { Download, Wifi, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { DownloaderPage } from "@/components/pages/DownloaderPage";
import { NetworkPage } from "@/components/pages/NetworkPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { ToastContainer } from "@/components/ui/ToastContainer";
import * as tauri from "@/lib/tauri";

type Tab = "downloader" | "network" | "settings";

interface Account {
  id: string;
  username: string;
  password: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("downloader");

  // Real accounts from Python example (passwords are base64 decoded)
  const [accounts] = useState<Account[]>([
    { id: "1", username: "ruiiixx", password: "S67GBTB83D3Y" },
    { id: "2", username: "premexilmenledgconis", password: "3pXbHZJlDb" },
    { id: "3", username: "vAbuDy", password: "Boolq8vip" },
    { id: "4", username: "adgjl1182", password: "QETUO99999" },
    { id: "5", username: "gobjj16182", password: "zuobiao8222" },
    { id: "6", username: "787109690", password: "HucUxYMQig15" },
  ]);
  const [selectedAccount, setSelectedAccount] = useState("1");
  const [downloadPath, setDownloadPath] = useState("Not set");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [dotnetInstalled, setDotnetInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const installed = await tauri.checkDotnetRuntime();
        setDotnetInstalled(installed);
        const settings = await tauri.loadSettings();
        if (settings.download_path) setDownloadPath(settings.download_path);

        // Listen for download logs
        await tauri.listenDownloadLog((log) => {
          addLog(log.line);
        });
      } catch {
        setDotnetInstalled(null);
      }
    };
    init();
  }, []);

  const addLog = (msg: string) => {
    setConsoleOutput((prev) => [...prev.slice(-100), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const clearConsole = () => {
    setConsoleOutput([]);
  };

  const selectDirectory = async () => {
    try {
      const folder = await tauri.selectFolder();
      if (folder) {
        setDownloadPath(folder);
        addLog(`Path set to ${folder}`);
        await tauri.saveSettings({
          download_path: folder,
          max_concurrent_downloads: 3,
          auto_retry: true,
          retry_attempts: 3,
          theme: "light",
        });
      }
    } catch {
      addLog("Error selecting folder");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Navigation */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface">
        <h1 className="text-lg font-bold">Steam Workshop Downloader</h1>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("downloader")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === "downloader"
                ? "bg-foreground text-surface"
                : "text-foreground-muted hover:bg-surface-hover"
              }`}
          >
            <Download className="w-3.5 h-3.5 inline mr-1.5" />
            Downloader
          </button>
          <button
            onClick={() => setActiveTab("network")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === "network"
                ? "bg-foreground text-surface"
                : "text-foreground-muted hover:bg-surface-hover"
              }`}
          >
            <Wifi className="w-3.5 h-3.5 inline mr-1.5" />
            Network
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === "settings"
                ? "bg-foreground text-surface"
                : "text-foreground-muted hover:bg-surface-hover"
              }`}
          >
            <Settings className="w-3.5 h-3.5 inline mr-1.5" />
            Settings
          </button>
        </nav>

        {/* .NET Status */}
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: dotnetInstalled === true ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            color: dotnetInstalled === true ? "#22c55e" : "#ef4444",
          }}
        >
          {dotnetInstalled === true ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          {dotnetInstalled === true ? ".NET 9.0" : "No .NET"}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "downloader" && (
          <DownloaderPage
            accounts={accounts}
            selectedAccountId={selectedAccount}
            onAccountChange={setSelectedAccount}
            downloadPath={downloadPath}
            onSelectPath={selectDirectory}
            consoleOutput={consoleOutput}
            onClearConsole={clearConsole}
            addLog={addLog}
          />
        )}

        {activeTab === "network" && <NetworkPage />}

        {activeTab === "settings" && <SettingsPage />}
      </div>

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
}
