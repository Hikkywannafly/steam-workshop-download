import { useState } from "react";
import {
    Wifi,
    CheckCircle,
    XCircle,
    RefreshCw,
    Shield,
    Globe,
    AlertTriangle,
    ExternalLink,
} from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
import * as tauri from "@/lib/tauri";

interface ConnectivityResult {
    name: string;
    status: "pending" | "checking" | "success" | "error";
    message?: string;
}

export function NetworkPage() {
    const [results, setResults] = useState<ConnectivityResult[]>([
        { name: "Steam API", status: "pending" },
        { name: "Steam CDN", status: "pending" },
        { name: "Steam Store", status: "pending" },
    ]);
    const [isChecking, setIsChecking] = useState(false);

    const runDiagnostics = async () => {
        setIsChecking(true);

        // Reset all to checking
        setResults((prev) =>
            prev.map((r) => ({ ...r, status: "checking" as const }))
        );

        // Check Steam API
        try {
            await tauri.searchSteamGames("test");
            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Steam API"
                        ? { ...r, status: "success", message: "Connected successfully" }
                        : r
                )
            );
        } catch (error) {
            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Steam API"
                        ? {
                            ...r,
                            status: "error",
                            message: error instanceof Error ? error.message : "Failed",
                        }
                        : r
                )
            );
        }

        // Check Steam CDN (simplified check using fetch)
        try {
            await fetch(
                "https://steamcdn-a.akamaihd.net/steam/apps/431960/header.jpg",
                { mode: "no-cors" }
            );
            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Steam CDN"
                        ? { ...r, status: "success", message: "CDN accessible" }
                        : r
                )
            );
        } catch {
            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Steam CDN"
                        ? { ...r, status: "error", message: "CDN blocked or unavailable" }
                        : r
                )
            );
        }

        // Check Steam Store
        try {
            await fetch("https://store.steampowered.com", { mode: "no-cors" });
            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Steam Store"
                        ? { ...r, status: "success", message: "Store accessible" }
                        : r
                )
            );
        } catch {
            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Steam Store"
                        ? { ...r, status: "error", message: "Store blocked or unavailable" }
                        : r
                )
            );
        }

        setIsChecking(false);
    };

    const hasErrors = results.some((r) => r.status === "error");

    return (
        <div className="h-full p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <Wifi className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Network Diagnostics</h2>
                    <p className="text-foreground-muted text-sm">
                        Check your connection to Steam services
                    </p>
                </div>

                {/* Connectivity Tests */}
                <div className="bg-surface rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Connectivity Tests</h3>
                        <button
                            onClick={runDiagnostics}
                            disabled={isChecking}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-sm rounded-md transition-colors disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`}
                            />
                            {isChecking ? "Checking..." : "Run Tests"}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {results.map((result) => (
                            <div
                                key={result.name}
                                className="flex items-center justify-between p-3 bg-background rounded-md"
                            >
                                <div className="flex items-center gap-3">
                                    <Globe className="w-4 h-4 text-muted" />
                                    <span className="text-sm font-medium">{result.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {result.status === "pending" && (
                                        <span className="text-xs text-muted">Not tested</span>
                                    )}
                                    {result.status === "checking" && (
                                        <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                                    )}
                                    {result.status === "success" && (
                                        <>
                                            <span className="text-xs text-green-500">
                                                {result.message}
                                            </span>
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        </>
                                    )}
                                    {result.status === "error" && (
                                        <>
                                            <span className="text-xs text-red-500">
                                                {result.message}
                                            </span>
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Warning if errors detected */}
                {hasErrors && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-yellow-500">
                                    Connection Issues Detected
                                </h4>
                                <p className="text-sm text-foreground-muted mt-1">
                                    Some Steam services are not accessible. This may be due to
                                    network restrictions, firewall settings, or regional blocks.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Solutions */}
                <div className="bg-surface rounded-lg border border-border p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Solutions for Blocked Networks
                    </h3>

                    <div className="space-y-4 text-sm">
                        <div className="p-3 bg-background rounded-md">
                            <h4 className="font-medium mb-2">🔒 VPN (Recommended)</h4>
                            <p className="text-foreground-muted mb-2">
                                Using a VPN is the most effective way to bypass Steam blocks.
                                Steam uses IP-based geolocation, so DNS changes alone won't
                                work.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => open("https://www.cyberghostvpn.com")}
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    CyberGhost <ExternalLink className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => open("https://nordvpn.com")}
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    NordVPN <ExternalLink className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => open("https://www.expressvpn.com")}
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    ExpressVPN <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        <div className="p-3 bg-background rounded-md">
                            <h4 className="font-medium mb-2">🌐 Check Firewall Settings</h4>
                            <p className="text-foreground-muted">
                                Make sure your firewall allows connections to Steam servers.
                                Add exceptions for this application and DepotDownloaderMod.exe.
                            </p>
                        </div>

                        <div className="p-3 bg-background rounded-md">
                            <h4 className="font-medium mb-2">🔄 Retry Downloads</h4>
                            <p className="text-foreground-muted">
                                The downloader automatically retries failed downloads up to 3
                                times with exponential backoff. This helps with temporary
                                network issues.
                            </p>
                        </div>

                        <div className="p-3 bg-background rounded-md">
                            <h4 className="font-medium mb-2">
                                ⚠️ DNS Changes (Not Recommended)
                            </h4>
                            <p className="text-foreground-muted">
                                Changing DNS servers (Google DNS 8.8.8.8, Cloudflare 1.1.1.1)
                                does NOT bypass Steam region blocks. Steam detects location via
                                IP address, not DNS.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
