import { useState, useEffect, useRef } from "react";
import { Gamepad2, Search, ExternalLink } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
import * as tauri from "@/lib/tauri";

interface SteamGame {
    name: string;
    appId: string;
    icon?: string;
}

interface GameSelectorProps {
    selectedAppId: string;
    onAppIdChange: (appId: string, gameName: string) => void;
    defaultGameName?: string;
}

export function GameSelector({
    selectedAppId,
    onAppIdChange,
    defaultGameName = "Wallpaper Engine",
}: GameSelectorProps) {
    const [gameSearch, setGameSearch] = useState(defaultGameName);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchResults, setSearchResults] = useState<SteamGame[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
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
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [gameSearch, isCustomAppId]);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const openWorkshop = async () => {
        try {
            await open(`https://steamcommunity.com/app/${selectedAppId}/workshop/`);
        } catch (error) {
            console.error("Failed to open workshop:", error);
        }
    };

    return (
        <div className="bg-surface rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Gamepad2 className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs font-medium">Steam Game</span>
                </div>
                <button
                    onClick={openWorkshop}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    title="Browse Workshop for this game"
                >
                    Browse Workshop <ExternalLink className="w-3 h-3" />
                </button>
            </div>

            <div className="relative" ref={containerRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                    <input
                        type="text"
                        value={gameSearch}
                        onChange={(e) => {
                            setGameSearch(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Search game or enter App ID..."
                        className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm"
                    />
                </div>

                {showDropdown && (searchResults.length > 0 || isCustomAppId || isSearching) && (
                    <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                        {isSearching && (
                            <div className="px-3 py-2 text-sm text-muted">Searching...</div>
                        )}
                        {searchResults.map((game) => (
                            <div
                                key={game.appId}
                                onClick={() => {
                                    setGameSearch(game.name);
                                    onAppIdChange(game.appId, game.name);
                                    setShowDropdown(false);
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
                                    onAppIdChange(gameSearch.trim(), `App ${gameSearch.trim()}`);
                                    setShowDropdown(false);
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

            <div className="mt-2 space-y-0.5">
                <p className="text-xs text-foreground-muted">
                    App ID: <span className="font-mono text-primary">{selectedAppId}</span>
                </p>
                <p className="text-xs text-muted italic">
                    💡 Tìm game bạn muốn tải workshop, ví dụ: "Wallpaper Engine", "Cities Skylines"...
                </p>
            </div>
        </div>
    );
}
