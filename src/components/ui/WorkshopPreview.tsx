import { useState, useEffect } from "react";
import { ExternalLink, Image, Loader2 } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
import * as tauri from "@/lib/tauri";

interface WorkshopPreviewProps {
    workshopId: string;
    onClose?: () => void;
}

export function WorkshopPreview({ workshopId, onClose }: WorkshopPreviewProps) {
    const [details, setDetails] = useState<tauri.WorkshopItemDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!workshopId) {
            setDetails(null);
            setLoading(false);
            return;
        }

        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await tauri.getWorkshopDetails(workshopId);
                setDetails(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load preview");
                setDetails(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [workshopId]);

    const openWorkshopPage = async () => {
        try {
            await open(`https://steamcommunity.com/sharedfiles/filedetails/?id=${workshopId}`);
        } catch (error) {
            console.error("Failed to open workshop page:", error);
        }
    };

    if (!workshopId) return null;

    if (loading) {
        return (
            <div className="bg-surface rounded-lg p-4 border border-border flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted">Loading preview...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-surface rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-red-400">{error}</span>
                    <button
                        onClick={openWorkshopPage}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                        Open in Steam <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
            </div>
        );
    }

    if (!details) return null;

    return (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="flex gap-3 p-3">
                {/* Preview Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-slate-800 rounded-md overflow-hidden">
                    {details.preview_url ? (
                        <img
                            src={details.preview_url}
                            alt={details.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-8 h-8 text-slate-600" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate" title={details.title}>
                        {details.title}
                    </h3>
                    {details.creator && (
                        <p className="text-xs text-muted mt-1">By {details.creator}</p>
                    )}
                    {details.file_size && (
                        <p className="text-xs text-muted">
                            Size: {(details.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    )}
                    <button
                        onClick={openWorkshopPage}
                        className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                        View on Steam <ExternalLink className="w-3 h-3" />
                    </button>
                </div>

                {/* Close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="self-start text-muted hover:text-foreground"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}

// Helper function to extract workshop IDs from text
function extractWorkshopIds(input: string): string[] {
    const ids: string[] = [];

    // Pattern 1: Extract from URL query param ?id=XXXXXXX
    const urlPattern = /[?&]id=(\d{6,12})/gi;
    let match;
    while ((match = urlPattern.exec(input)) !== null) {
        if (!ids.includes(match[1])) {
            ids.push(match[1]);
        }
    }

    // Pattern 2: Standalone workshop IDs (8-12 digits, not part of URL)
    // Only if no URL IDs were found in that line
    const lines = input.split('\n');
    for (const line of lines) {
        // Skip if this line already has a URL with id param
        if (/[?&]id=\d+/.test(line)) continue;

        // Look for standalone IDs
        const standalonePattern = /\b(\d{8,12})\b/g;
        while ((match = standalonePattern.exec(line)) !== null) {
            if (!ids.includes(match[1])) {
                ids.push(match[1]);
            }
        }
    }

    return ids;
}

// Component to display inline preview when typing workshop IDs
interface WorkshopInputPreviewProps {
    input: string;
}

export function WorkshopInputPreview({ input }: WorkshopInputPreviewProps) {
    const [workshopIds, setWorkshopIds] = useState<string[]>([]);

    useEffect(() => {
        const ids = extractWorkshopIds(input);
        // Only show first 3 previews to avoid clutter
        setWorkshopIds(ids.slice(0, 3));
    }, [input]);

    if (workshopIds.length === 0) return null;

    const totalIds = extractWorkshopIds(input).length;

    return (
        <div className="space-y-2 mt-2">
            <span className="text-xs text-muted">Previews:</span>
            {workshopIds.map((id) => (
                <WorkshopPreview key={id} workshopId={id} />
            ))}
            {workshopIds.length < totalIds && (
                <p className="text-xs text-muted">
                    +{totalIds - workshopIds.length} more items...
                </p>
            )}
        </div>
    );
}
