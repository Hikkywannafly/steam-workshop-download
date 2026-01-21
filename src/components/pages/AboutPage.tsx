import { Info, Heart, Github, ExternalLink, Sparkles, Gift } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";

interface Release {
    version: string;
    date: string;
    changes: string[];
}

// Changelog data - update this with each new release
const RELEASES: Release[] = [
    {
        version: "1.0.0",
        date: "2026-01-21",
        changes: [
            "Initial release",
            "Support for Wallpaper Engine and other Steam Workshop games",
            "Dynamic game search with Steam API",
            "Workshop item preview with thumbnails",
            "Network diagnostics page",
            "Auto-retry for failed downloads",
            ".NET Runtime check and guidance",
        ],
    },
];

const CURRENT_VERSION = "1.0.0";
const GITHUB_REPO = "https://github.com/Hikkywannafly";
const DONATE_LINK = "https://ko-fi.com/nyankoiscat";

export function AboutPage() {
    const openLink = async (url: string) => {
        try {
            await open(url);
        } catch (error) {
            console.error("Failed to open link:", error);
        }
    };

    return (
        <div className="h-full p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg">
                        <img src="/icon.png" alt="App Icon" className="w-16 h-16 rounded-2xl" />
                    </div>
                    <h2 className="text-xl font-semibold mb-1">Steam Workshop Downloader</h2>
                    <p className="text-foreground-muted text-sm mb-3 flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        Version {CURRENT_VERSION}
                    </p>
                    <p className="text-xs text-muted mb-2">
                        Download Steam Workshop items without owning the game
                    </p>
                    <p className="text-xs text-foreground-muted mb-4 flex items-center justify-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                        <span>Have questions? Contact me on Discord. <span className="font-medium text-indigo-600">nekozzuki</span></span>
                    </p>

                    {/* Quick Links in Header */}
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => openLink(GITHUB_REPO)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-hover border border-border rounded-full text-xs transition-colors"
                        >
                            <Github className="w-3.5 h-3.5" />
                            GitHub
                        </button>
                        <button
                            onClick={() => openLink(`${GITHUB_REPO}/WorkshopDownloader/releases`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-hover border border-border rounded-full text-xs transition-colors"
                        >
                            <Info className="w-3.5 h-3.5" />
                            Changelog
                        </button>
                        <button
                            onClick={() => openLink(DONATE_LINK)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white rounded-full text-xs transition-colors"
                        >
                            <Gift className="w-3.5 h-3.5" />
                            Donate
                        </button>
                    </div>
                </div>

                {/* Donate Section */}
                <div className="bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-lg border border-pink-500/30 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-medium text-sm">Support the Developer</h3>
                                <p className="text-xs text-foreground-muted">
                                    If you find this tool useful, consider buying me a coffee! ☕
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => openLink(DONATE_LINK)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                            <Gift className="w-4 h-4" />
                            Donate
                        </button>
                    </div>
                </div>

                {/* Links */}
                <div className="bg-surface rounded-lg border border-border p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-primary" />
                        Links
                    </h3>

                    <div className="space-y-2">
                        <button
                            onClick={() => openLink(GITHUB_REPO)}
                            className="w-full flex items-center justify-between p-3 bg-background hover:bg-surface-hover rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Github className="w-5 h-5" />
                                <div className="text-left">
                                    <p className="text-sm font-medium">GitHub Repository</p>
                                    <p className="text-xs text-foreground-muted">View source code & report issues</p>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted" />
                        </button>

                        <button
                            onClick={() => openLink(`${GITHUB_REPO}/releases`)}
                            className="w-full flex items-center justify-between p-3 bg-background hover:bg-surface-hover rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <div className="text-left">
                                    <p className="text-sm font-medium">Releases</p>
                                    <p className="text-xs text-foreground-muted">Download latest version</p>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted" />
                        </button>

                        <button
                            onClick={() => openLink(DONATE_LINK)}
                            className="w-full flex items-center justify-between p-3 bg-background hover:bg-surface-hover rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Heart className="w-5 h-5 text-pink-500" />
                                <div className="text-left">
                                    <p className="text-sm font-medium">Ko-fi</p>
                                    <p className="text-xs text-foreground-muted">Support development</p>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted" />
                        </button>
                    </div>
                </div>

                {/* Changelog */}
                <div className="bg-surface rounded-lg border border-border p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        Changelog
                    </h3>

                    <div className="space-y-4">
                        {RELEASES.map((release) => (
                            <div key={release.version} className="border-l-2 border-primary pl-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-semibold">v{release.version}</span>
                                    <span className="text-xs text-muted bg-background px-2 py-0.5 rounded">
                                        {release.date}
                                    </span>
                                    {release.version === CURRENT_VERSION && (
                                        <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                                            Current
                                        </span>
                                    )}
                                </div>
                                <ul className="space-y-1">
                                    {release.changes.map((change, idx) => (
                                        <li key={idx} className="text-xs text-foreground-muted flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            {change}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Credits */}
                <div className="text-center text-xs text-muted py-4">
                    <p>Made with ❤️ by <button onClick={() => openLink(DONATE_LINK)} className="text-primary hover:underline">NyankoIsCat</button></p>
                    <p className="mt-1">Powered by Tauri + React</p>
                </div>
            </div>
        </div>
    );
}
