import { useState, useEffect, useCallback } from "react";
import { Plus, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AccountForm } from "./AccountForm";
import type { SIPAccount, SIPAccountFormData } from "@/types/sip";
import { DEFAULT_PORTS } from "@/types/sip";
import { StorageService } from "@/services/storageService";
import { SIPService, type SIPRegistrationStatus } from "@/services/sipService";

export function AccountManager() {
  const [accounts, setAccounts] = useState<SIPAccount[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SIPAccount | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const storageService = StorageService.getInstance();
  const sipService = SIPService.getInstance();

  const loadAccounts = useCallback(() => {
    const savedAccounts = storageService.getSIPAccounts();
    setAccounts(savedAccounts);
  }, [storageService]);

  // Listen for registration status changes
  useEffect(() => {
    const handleStatusChange = (
      accountId: string,
      status: SIPRegistrationStatus
    ) => {
      console.log(`Registration status changed for ${accountId}: ${status}`);

      // Update the specific account in the local state immediately
      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) =>
          acc.id === accountId ? { ...acc, registrationStatus: status } : acc
        )
      );

      // Also reload from storage to ensure consistency
      loadAccounts();
    };

    sipService.on("registrationStatusChanged", handleStatusChange);

    return () => {
      sipService.off("registrationStatusChanged", handleStatusChange);
    };
  }, [sipService, loadAccounts]);

  // Load accounts on component mount
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleAddAccount = async (formData: SIPAccountFormData) => {
    setIsLoading(true);
    try {
      storageService.addSIPAccount({
        ...formData,
        isActive: accounts.length === 0, // First account is active by default
        registrationStatus: "unregistered",
      });

      // If this is the first account, make it active
      if (accounts.length === 0) {
        // Account will be automatically available in the top navigation dropdown
      }

      loadAccounts();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add account:", error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAccount = async (formData: SIPAccountFormData) => {
    if (!editingAccount) return;

    setIsLoading(true);
    try {
      const updatedAccount = storageService.updateSIPAccount(
        editingAccount.id,
        formData
      );
      if (updatedAccount) {
        loadAccounts();
        setEditingAccount(null);
        setIsEditDialogOpen(false); // Close the dialog

        // Account updates will be reflected in the top navigation
      }
    } catch (error) {
      console.error("Failed to update account:", error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    const success = storageService.deleteSIPAccount(accountId);
    if (success) {
      loadAccounts();

      // Account deletion will be reflected in the top navigation
    }
  };

  const getStatusConfig = (status: SIPAccount["registrationStatus"]) => {
    switch (status) {
      case "registered":
        return {
          dot: "bg-emerald-500",
          dotStyle: { boxShadow: "0 0 6px 2px rgba(34,197,94,0.45)" } as React.CSSProperties,
          label: "Registered",
          labelClass: "text-emerald-600 dark:text-emerald-400",
          cardBorderLeft: "border-l-emerald-500",
        };
      case "connecting":
        return {
          dot: "bg-amber-400 animate-pulse",
          dotStyle: { boxShadow: "0 0 5px 1px rgba(251,191,36,0.45)" } as React.CSSProperties,
          label: "Connecting",
          labelClass: "text-amber-600 dark:text-amber-300",
          cardBorderLeft: "border-l-amber-400",
        };
      case "failed":
        return {
          dot: "bg-red-500",
          dotStyle: { boxShadow: "0 0 5px 1px rgba(239,68,68,0.4)" } as React.CSSProperties,
          label: "Failed",
          labelClass: "text-red-600 dark:text-red-400",
          cardBorderLeft: "border-l-red-500",
        };
      default:
        return {
          dot: "bg-slate-400 dark:bg-slate-600",
          dotStyle: {} as React.CSSProperties,
          label: "Unregistered",
          labelClass: "text-muted-foreground",
          cardBorderLeft: "border-l-border",
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2
          className="text-base font-bold tracking-tight text-foreground"
          style={{ fontFamily: "'Syne', system-ui, sans-serif" }}
        >
          SIP Accounts
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="h-8 text-xs font-semibold px-3 bg-primary hover:bg-primary/90 shadow-[0_2px_8px_rgba(var(--primary),0.35)]"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogTitle>Add SIP Account</DialogTitle>
            <AccountForm
              onSubmit={handleAddAccount}
              onCancel={() => setIsAddDialogOpen(false)}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="pt-10 pb-10">
            <div className="text-center text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <p className="font-medium text-sm">No SIP accounts configured</p>
              <p className="text-xs mt-1 text-muted-foreground/60">
                Add your first account to get started
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {accounts.map((account) => {
            const statusConfig = getStatusConfig(account.registrationStatus);
            return (
              <Card
                key={account.id}
                className={`cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5 border-border/60 border-l-[3px] ${statusConfig.cardBorderLeft}`}
                style={{
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)",
                }}
                onClick={() => {
                  setEditingAccount(account);
                  setIsEditDialogOpen(true);
                }}
              >
                <CardContent className="pl-5 pr-4 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="font-semibold truncate text-foreground text-sm"
                          style={{ fontFamily: "'Syne', system-ui, sans-serif" }}
                        >
                          {account.name}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <p
                          className="text-xs text-muted-foreground truncate"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {account.userId}@{account.server}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-2 h-2 rounded-full ${statusConfig.dot}`}
                              style={statusConfig.dotStyle}
                            />
                            <span className={`text-xs font-medium capitalize ${statusConfig.labelClass}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 h-4 border-border/60 font-medium"
                            >
                              {account.transport}
                            </Badge>
                            {account.port !== DEFAULT_PORTS[account.transport] && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 border-border/60 font-mono"
                              >
                                :{account.port}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAccount(account);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-md text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete account "${account.name}"?`)) {
                            handleDeleteAccount(account.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Edit SIP Account</DialogTitle>
          {editingAccount && (
            <AccountForm
              onSubmit={handleEditAccount}
              onCancel={() => {
                setEditingAccount(null);
                setIsEditDialogOpen(false);
              }}
              initialData={editingAccount}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
