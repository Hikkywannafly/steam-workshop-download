import { FolderOpen } from "lucide-react";

interface PathSelectorProps {
    path: string;
    onSelectPath: () => void;
}

export function PathSelector({ path, onSelectPath }: PathSelectorProps) {
    return (
        <div className="bg-surface rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-2">
                <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-medium">Download Path</span>
            </div>
            <button
                onClick={onSelectPath}
                className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-md transition-colors"
            >
                Select Directory
            </button>
            <p className="text-xs text-foreground-muted mt-2 truncate" title={path}>
                {path}
            </p>
        </div>
    );
}
