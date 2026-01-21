import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { Toast } from "@/lib/notifications";
import { setToastCallback } from "@/lib/notifications";

export function ToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        setToastCallback((toast) => {
            setToasts((prev) => [...prev, toast]);

            // Auto-remove after duration
            if (toast.duration) {
                setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                }, toast.duration);
            }
        });

        return () => setToastCallback(() => { });
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: Toast["type"]) => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "error":
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case "warning":
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case "info":
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBorderColor = (type: Toast["type"]) => {
        switch (type) {
            case "success":
                return "border-l-green-500";
            case "error":
                return "border-l-red-500";
            case "warning":
                return "border-l-yellow-500";
            case "info":
                return "border-l-blue-500";
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`bg-surface border border-border border-l-4 ${getBorderColor(
                        toast.type
                    )} rounded-lg shadow-lg p-4 animate-slide-in flex items-start gap-3`}
                >
                    {getIcon(toast.type)}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{toast.title}</h4>
                        {toast.message && (
                            <p className="text-xs text-muted mt-1 truncate">{toast.message}</p>
                        )}
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-muted hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
