import { useState, useEffect } from "react";
import { LogIn, LogOut, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { SIPAccount } from "@/types/sip";
import { StorageService } from "@/services/storageService";
import { SIPService } from "@/services/sipService";

interface AccountSelectorProps {
  activeAccount: SIPAccount | null;
  onAccountSelect: (account: SIPAccount) => void;
}

export function AccountSelector({
  activeAccount,
  onAccountSelect,
}: AccountSelectorProps) {
  const [accounts, setAccounts] = useState<SIPAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const storageService = StorageService.getInstance();
  const sipService = SIPService.getInstance();

  // Load accounts
  useEffect(() => {
    const loadAccounts = () => {
      const savedAccounts = storageService.getSIPAccounts();
      setAccounts(savedAccounts);
    };

    loadAccounts();

    // Listen for registration status changes to update connection state
    const handleStatusChange = (_accountId: string, status: string) => {
      setIsConnecting(status === "connecting");
      // Reload accounts to get updated status
      loadAccounts();
    };

    sipService.on("registrationStatusChanged", handleStatusChange);

    return () => {
      sipService.off("registrationStatusChanged", handleStatusChange);
    };
  }, [storageService, sipService]);

  const handleAccountChange = (accountId: string) => {
    const selectedAccount = accounts.find((acc) => acc.id === accountId);
    if (selectedAccount) {
      onAccountSelect(selectedAccount);
      storageService.setActiveAccountId(accountId);
    }
  };

  const handleConnect = async () => {
    if (!activeAccount) return;

    setIsConnecting(true);
    try {
      await sipService.registerAccount(activeAccount);
    } catch (error) {
      console.error("Failed to connect:", error);
    }
    // setIsConnecting will be updated via the status change listener
  };

  const handleDisconnect = async () => {
    if (!activeAccount) return;

    try {
      await sipService.unregister();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const getConnectionStatus = () => {
    if (!activeAccount) return null;

    switch (activeAccount.registrationStatus) {
      case "registered":
        return {
          label: "Connected",
          dotClass: "bg-emerald-500",
          dotStyle: { boxShadow: "0 0 6px 2px rgba(34,197,94,0.5)" } as React.CSSProperties,
          variant: "default" as const,
          badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        };
      case "connecting":
        return {
          label: "Connecting",
          dotClass: "bg-amber-400 animate-pulse",
          dotStyle: { boxShadow: "0 0 5px 1px rgba(251,191,36,0.4)" } as React.CSSProperties,
          variant: "secondary" as const,
          badgeClass: "bg-amber-400/15 text-amber-600 dark:text-amber-300 border-amber-400/30",
        };
      case "failed":
        return {
          label: "Failed",
          dotClass: "bg-red-500",
          dotStyle: { boxShadow: "0 0 5px 1px rgba(239,68,68,0.4)" } as React.CSSProperties,
          variant: "destructive" as const,
          badgeClass: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
        };
      default:
        return {
          label: "Disconnected",
          dotClass: "bg-slate-400 dark:bg-slate-600",
          dotStyle: {} as React.CSSProperties,
          variant: "outline" as const,
          badgeClass: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const connectionStatus = getConnectionStatus();

  if (accounts.length === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-border/70 bg-muted/20">
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          No accounts configured
        </div>
        <span className="text-xs text-muted-foreground/60">
          Add one in Accounts tab
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/60 bg-gradient-to-r from-muted/40 to-card/60 dark:from-muted/20 dark:to-card/40 shadow-sm"
    >
      {/* Account Selector and Status */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Account Dropdown */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Select
            value={activeAccount?.id || ""}
            onValueChange={handleAccountChange}
          >
            <SelectTrigger className="w-full max-w-xs bg-background/60 border-border/50 h-9 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                {connectionStatus && (
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${connectionStatus.dotClass}`}
                    style={connectionStatus.dotStyle}
                  />
                )}
                <SelectValue
                  placeholder="Select account…"
                  className="truncate"
                >
                  {activeAccount && (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium truncate text-sm">
                        {activeAccount.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate hidden sm:block">
                        {activeAccount.userId}@{activeAccount.server}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        account.registrationStatus === "registered"
                          ? "bg-emerald-500"
                          : account.registrationStatus === "connecting"
                          ? "bg-amber-400 animate-pulse"
                          : "bg-slate-400 dark:bg-slate-600"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate text-sm">{account.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {account.userId}@{account.server}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Connection Status Badge */}
          {connectionStatus && activeAccount && (
            <Badge
              variant="outline"
              className={`text-xs shrink-0 font-medium px-2 py-0.5 border ${connectionStatus.badgeClass}`}
            >
              {connectionStatus.label}
            </Badge>
          )}
        </div>

        {/* Connection Control Button */}
        {activeAccount && (
          <div className="flex items-center gap-2 shrink-0">
            {activeAccount.registrationStatus === "registered" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="h-8 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 rounded-lg px-3"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Disconnect
              </Button>
            ) : isConnecting ||
              activeAccount.registrationStatus === "connecting" ? (
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="h-8 text-xs font-medium opacity-60 border border-border/50 rounded-lg px-3"
              >
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                Connecting
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleConnect}
                className="h-8 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-500/10 border border-emerald-500/25 hover:border-emerald-500/40 rounded-lg px-3"
              >
                <LogIn className="w-3.5 h-3.5 mr-1" />
                Connect
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
