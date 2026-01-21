import { User, ChevronDown } from "lucide-react";

export interface Account {
    id: string;
    username: string;
    password: string;
}

interface AccountSelectorProps {
    accounts: Account[];
    selectedAccountId: string;
    onAccountChange: (accountId: string) => void;
}

export function AccountSelector({
    accounts,
    selectedAccountId,
    onAccountChange,
}: AccountSelectorProps) {
    return (
        <div className="bg-surface rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium">Steam Account</span>
            </div>
            <div className="relative">
                <select
                    value={selectedAccountId}
                    onChange={(e) => onAccountChange(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm appearance-none cursor-pointer"
                >
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                            {acc.username}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>
        </div>
    );
}
