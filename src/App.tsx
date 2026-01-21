import { useState, useEffect } from "react";
import { Download, Wifi, Settings, CheckCircle, AlertCircle, Info, Github, Heart } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
import { DownloaderPage } from "@/components/pages/DownloaderPage";
import { NetworkPage } from "@/components/pages/NetworkPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { AboutPage } from "@/components/pages/AboutPage";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { TitleBar } from "@/components/ui/TitleBar";
import { APP_VERSION } from "@/lib/constants";
import * as tauri from "@/lib/tauri";

type Tab = "downloader" | "network" | "settings" | "about";

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
      {/* Custom Title Bar */}
      <TitleBar />

      {/* Header with Navigation */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface">
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
          <button
            onClick={() => setActiveTab("about")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === "about"
              ? "bg-foreground text-surface"
              : "text-foreground-muted hover:bg-surface-hover"
              }`}
          >
            <Info className="w-3.5 h-3.5 inline mr-1.5" />
            About
          </button>
        </nav>

        {/* Right Section: Social Links + Version + .NET Status */}
        <div className="flex items-center gap-2">
          {/* Social Links */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => open("https://github.com/Hikkywannafly")}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors group"
              title="GitHub"
            >
              <Github className="w-3.5 h-3.5 text-gray-700 group-hover:text-black transition-colors" />
            </button>
            <button
              onClick={() => open("https://ko-fi.com/nekozzuki")}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-red-50 transition-colors group"
              title="Support on Ko-fi"
            >
              <Heart className="w-3.5 h-3.5 text-red-500 group-hover:text-red-600 transition-colors" />
            </button>
            <button
              onClick={() => open("https://discord.com/users/nekozzuki")}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors group"
              title="Discord: nekozzuki"
            >
              <svg className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">nekozzuki</span>
            </button>
          </div>

          {/* Version Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
            v{APP_VERSION}
          </div>

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
            dotnetInstalled={dotnetInstalled}
          />
        )}

        {activeTab === "network" && <NetworkPage />}

        {activeTab === "settings" && <SettingsPage dotnetInstalled={dotnetInstalled} />}

        {activeTab === "about" && <AboutPage />}
      </div>

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
}
