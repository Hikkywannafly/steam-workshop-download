import { useState, useEffect, useRef } from "react";
import { User, FolderOpen, Link, CheckCircle, AlertCircle, ChevronDown, Download, Wifi, Settings, Gamepad2, Search } from "lucide-react";
import * as tauri from "@/lib/tauri";

type Tab = "downloader" | "dns" | "settings";

interface Account {
  id: string;
  username: string;
  password: string;
}

interface SteamGame {
  name: string;
  appId: string;
  icon?: string;
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
  const [workshopLinks, setWorkshopLinks] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [dotnetInstalled, setDotnetInstalled] = useState<boolean | null>(null);

  // Game search states
  const [gameSearch, setGameSearch] = useState("Wallpaper Engine");
  const [selectedAppId, setSelectedAppId] = useState("431960");
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<SteamGame[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const gameSearchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if input is a valid custom App ID
  const isCustomAppId = /^\d+$/.test(gameSearch.trim());

  // Debounced Steam API search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!gameSearch.trim() || isCustomAppId) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await tauri.searchSteamGames(gameSearch);
        setSearchResults(
          results.map((r) => ({
            name: r.name,
            appId: r.app_id,
            icon: r.icon || undefined,
          }))
        );
      } catch (error) {
        console.error("Steam search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [gameSearch, isCustomAppId]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (gameSearchRef.current && !gameSearchRef.current.contains(e.target as Node)) {
        setShowGameDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const startDownload = async () => {
    if (downloadPath === "Not set") {
      addLog("❌ Error: Save location is not set");
      return;
    }
    if (!workshopLinks.trim()) {
      addLog("❌ Error: Enter workshop links or IDs");
      return;
    }

    // Get selected account (for now use Account 1, later get from settings)
    const currentAccount = accounts.find((a) => a.id === selectedAccount);
    if (!currentAccount) {
      addLog("❌ Error: No account selected");
      return;
    }

    setIsDownloading(true);
    const lines = workshopLinks.split("\n").filter((l) => l.trim());
    const idRegex = /\b\d{8,10}\b/;

    for (const line of lines) {
      const match = line.match(idRegex);
      if (match) {
        const id = match[0];
        addLog(`----------Downloading ${id}--------`);

        try {
          // Call actual Tauri command with app ID
          addLog(`🎮 Game: App ID ${selectedAppId}`);
          await tauri.startDownload(
            id,
            currentAccount.username,
            currentAccount.password,
            downloadPath,
            selectedAppId
          );
          addLog(`✅ Download completed: ${id}`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          addLog(`❌ Download failed: ${errorMsg}`);
        }

        addLog(`-------------Download finished-----------`);
      } else {
        addLog(`Invalid link: ${line}`);
      }
    }
    setIsDownloading(false);
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
            onClick={() => setActiveTab("dns")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === "dns"
              ? "bg-foreground text-surface"
              : "text-foreground-muted hover:bg-surface-hover"
              }`}
          >
            <Wifi className="w-3.5 h-3.5 inline mr-1.5" />
            DNS
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
          {dotnetInstalled === true ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {dotnetInstalled === true ? ".NET 9.0" : "No .NET"}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "downloader" && (
          <div className="h-full p-4 grid grid-cols-2 gap-3">
            {/* Left Column - Controls */}
            <div className="space-y-3">
              {/* Account */}
              <div className="bg-surface rounded-lg p-3 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium">Steam Account</span>
                </div>
                <div className="relative">
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm appearance-none cursor-pointer"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.username}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                </div>
              </div>

              {/* Game Selector */}
              <div className="bg-surface rounded-lg p-3 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Gamepad2 className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs font-medium">Steam Game</span>
                </div>
                <div className="relative" ref={gameSearchRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                    <input
                      type="text"
                      value={gameSearch}
                      onChange={(e) => {
                        setGameSearch(e.target.value);
                        setShowGameDropdown(true);
                      }}
                      onFocus={() => setShowGameDropdown(true)}
                      placeholder="Search game or enter App ID..."
                      className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm"
                    />
                  </div>
                  {showGameDropdown && (searchResults.length > 0 || isCustomAppId || isSearching) && (
                    <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                      {isSearching && (
                        <div className="px-3 py-2 text-sm text-muted">Searching...</div>
                      )}
                      {searchResults.map((game: SteamGame) => (
                        <div
                          key={game.appId}
                          onClick={() => {
                            setGameSearch(game.name);
                            setSelectedAppId(game.appId);
                            setShowGameDropdown(false);
                          }}
                          className="px-3 py-2 hover:bg-surface-hover cursor-pointer text-sm flex justify-between items-center"
                        >
                          {game.icon && (
                            <img src={game.icon} alt="" className="w-6 h-6 rounded mr-2" />
                          )}
                          <span className="flex-1 truncate">{game.name}</span>
                          <span className="text-muted text-xs ml-2">{game.appId}</span>
                        </div>
                      ))}
                      {isCustomAppId && (
                        <div
                          onClick={() => {
                            setSelectedAppId(gameSearch.trim());
                            setShowGameDropdown(false);
                          }}
                          className="px-3 py-2 hover:bg-surface-hover cursor-pointer text-sm border-t border-border flex items-center gap-2"
                        >
                          <span className="text-primary">Use custom App ID:</span>
                          <span className="font-mono">{gameSearch.trim()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-foreground-muted mt-2">App ID: <span className="font-mono text-primary">{selectedAppId}</span></p>
              </div>

              {/* Path */}
              <div className="bg-surface rounded-lg p-3 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-medium">Download Path</span>
                </div>
                <button
                  onClick={selectDirectory}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-md transition-colors"
                >
                  Select Directory
                </button>
                <p className="text-xs text-foreground-muted mt-2 truncate">{downloadPath}</p>
              </div>

              {/* Links */}
              <div className="bg-surface rounded-lg p-3 border border-border flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Link className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium">Workshop Links</span>
                </div>
                <textarea
                  value={workshopLinks}
                  onChange={(e) => setWorkshopLinks(e.target.value)}
                  placeholder="Enter links or IDs (one per line)..."
                  className="w-full h-32 px-3 py-2 bg-background border border-border rounded-md text-sm placeholder:text-muted resize-none font-mono"
                />
              </div>

              {/* Download Button */}
              <button
                onClick={startDownload}
                disabled={isDownloading}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                {isDownloading ? "Downloading..." : "Start Download"}
              </button>
            </div>

            {/* Right Column - Console */}
            <div className="bg-surface rounded-lg p-3 border border-border flex flex-col">
              <div className="text-xs font-medium mb-2">Console Output</div>
              <div className="flex-1 bg-slate-900 rounded-md p-3 overflow-y-auto font-mono text-xs">
                {consoleOutput.length === 0 ? (
                  <span className="text-slate-500">Ready...</span>
                ) : (
                  consoleOutput.map((line, i) => (
                    <div key={i} className="text-slate-300">{line}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "dns" && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Wifi className="w-16 h-16 mx-auto mb-4 text-muted" />
              <h2 className="text-xl font-semibold mb-2">DNS Settings</h2>
              <p className="text-foreground-muted">Coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Settings className="w-16 h-16 mx-auto mb-4 text-muted" />
              <h2 className="text-xl font-semibold mb-2">Settings</h2>
              <p className="text-foreground-muted">Coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
