import { useEffect, useRef } from "react";
import { Trash2, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ConsoleOutputProps {
    logs: string[];
    onClear?: () => void;
    className?: string;
}

export function ConsoleOutput({ logs, onClear, className = "" }: ConsoleOutputProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    // Auto-scroll to bottom when new logs are added
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const handleCopy = async () => {
        const text = logs.join("\n");
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`bg-surface rounded-lg p-3 border border-border flex flex-col ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Console Output</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleCopy}
                        className="p-1 hover:bg-surface-hover rounded transition-colors"
                        title="Copy logs"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                            <Copy className="w-3.5 h-3.5 text-muted" />
                        )}
                    </button>
                    {onClear && (
                        <button
                            onClick={onClear}
                            className="p-1 hover:bg-surface-hover rounded transition-colors"
                            title="Clear console"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-muted" />
                        </button>
                    )}
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex-1 bg-slate-900 rounded-md p-3 overflow-y-auto font-mono text-xs min-h-0"
                style={{ maxHeight: "100%", scrollBehavior: "smooth" }}
            >
                {logs.length === 0 ? (
                    <span className="text-slate-500">Ready...</span>
                ) : (
                    logs.map((line, i) => (
                        <div
                            key={i}
                            className={`${line.includes("❌") || line.includes("Error") || line.includes("failed")
                                    ? "text-red-400"
                                    : line.includes("✅") || line.includes("completed")
                                        ? "text-green-400"
                                        : line.includes("⚠️") || line.includes("Warning")
                                            ? "text-yellow-400"
                                            : line.includes("🎮") || line.includes("---")
                                                ? "text-blue-400"
                                                : "text-slate-300"
                                }`}
                        >
                            {line}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
