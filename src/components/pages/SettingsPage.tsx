import { Settings, Palette, RefreshCw, FolderOpen, User } from "lucide-react";

export function SettingsPage() {
    return (
        <div className="h-full p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <Settings className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Settings</h2>
                    <p className="text-foreground-muted text-sm">
                        Configure application preferences
                    </p>
                </div>

                {/* Download Settings */}
                <div className="bg-surface rounded-lg border border-border p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-primary" />
                        Download Settings
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium">Auto Retry</label>
                                <p className="text-xs text-foreground-muted">
                                    Automatically retry failed downloads
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                defaultChecked
                                className="w-4 h-4 rounded border-border"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium">Retry Attempts</label>
                                <p className="text-xs text-foreground-muted">
                                    Number of retry attempts for failed downloads
                                </p>
                            </div>
                            <select className="px-3 py-1.5 bg-background border border-border rounded-md text-sm">
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3" selected>
                                    3
                                </option>
                                <option value="5">5</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium">
                                    Concurrent Downloads
                                </label>
                                <p className="text-xs text-foreground-muted">
                                    Maximum simultaneous downloads
                                </p>
                            </div>
                            <select className="px-3 py-1.5 bg-background border border-border rounded-md text-sm">
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3" selected>
                                    3
                                </option>
                                <option value="5">5</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="bg-surface rounded-lg border border-border p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-primary" />
                        Appearance
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium">Theme</label>
                                <p className="text-xs text-foreground-muted">
                                    Choose your preferred theme
                                </p>
                            </div>
                            <select className="px-3 py-1.5 bg-background border border-border rounded-md text-sm">
                                <option value="system">System</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Default Paths */}
                <div className="bg-surface rounded-lg border border-border p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-primary" />
                        Default Paths
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Download Location</label>
                            <p className="text-xs text-foreground-muted mb-2">
                                Default download location for workshop items
                            </p>
                            <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm rounded-md transition-colors">
                                Change Default Path
                            </button>
                        </div>
                    </div>
                </div>

                {/* Accounts */}
                <div className="bg-surface rounded-lg border border-border p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        Steam Accounts
                    </h3>

                    <p className="text-sm text-foreground-muted">
                        Account management coming soon. Currently using pre-configured
                        community accounts.
                    </p>
                </div>
            </div>
        </div>
    );
}
