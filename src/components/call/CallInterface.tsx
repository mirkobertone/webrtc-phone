import { useState } from "react";
import { SmoothUnifiedDisplay } from "./SmoothUnifiedDisplay";
import { SimpleDialpad } from "@/components/dialpad/SimpleDialpad";
import { AlertTriangle, WifiOff } from "lucide-react";
import type { SIPAccount } from "@/types/sip";

// Using the CallState type from useCall hook
interface CallState {
  status: "idle" | "calling" | "ringing" | "connected" | "ended";
  remoteNumber: string | null;
  session: unknown | null;
  duration: number;
}

interface CallInterfaceProps {
  activeAccount: SIPAccount | null;
  callState: CallState;
  isInCall: boolean;
  isCallActive: boolean;
  formatDuration: (seconds: number) => string;
  onCall: (number: string) => void;
  onHangup: () => void;
}

export function CallInterface({
  activeAccount,
  callState,
  isInCall,
  isCallActive,
  formatDuration,
  onCall,
  onHangup,
}: CallInterfaceProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [lastDialedNumber, setLastDialedNumber] = useState("");
  const isRegistered = activeAccount?.registrationStatus === "registered";
  const isConnecting = activeAccount?.registrationStatus === "connecting";

  const handleNumberClick = (number: string) => {
    setPhoneNumber((prev) => prev + number);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (!phoneNumber.trim()) return;
    setLastDialedNumber(phoneNumber.trim());
    onCall(phoneNumber.trim());
  };

  const handleHangup = () => {
    onHangup();
    setPhoneNumber("");
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
  };

  // Show connection status when not registered
  if (!isRegistered) {
    return (
      <div className="flex flex-col items-center space-y-8 max-w-md mx-auto pt-4">
        <div
          className="w-full rounded-2xl p-8 text-center border overflow-hidden relative"
          style={{
            background: isConnecting
              ? "linear-gradient(135deg, rgba(59,130,246,0.07) 0%, rgba(139,92,246,0.05) 100%)"
              : "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(234,88,12,0.05) 100%)",
            borderColor: isConnecting
              ? "rgba(59,130,246,0.2)"
              : "rgba(245,158,11,0.2)",
          }}
        >
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 80%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 60%)",
            }}
          />

          <div className="relative">
            {/* Icon */}
            <div className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: isConnecting
                  ? "rgba(59,130,246,0.12)"
                  : "rgba(245,158,11,0.12)",
              }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: isConnecting ? "#3b82f6" : "#f59e0b",
                  boxShadow: isConnecting
                    ? "0 4px 18px rgba(59,130,246,0.4)"
                    : "0 4px 18px rgba(245,158,11,0.4)",
                }}
              >
                {isConnecting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-white" />
                )}
              </div>
            </div>

            {/* Message */}
            <p
              className="mb-2 font-bold text-base tracking-tight"
              style={{
                color: isConnecting ? "#3b82f6" : "#d97706",
                fontFamily: "'Syne', system-ui, sans-serif",
              }}
            >
              {isConnecting ? "Establishing connection…" : "Connection required"}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {activeAccount?.registrationStatus === "failed"
                ? "Registration failed. Please check your account settings."
                : activeAccount
                ? "Go to Accounts tab to connect your SIP account."
                : "Go to Accounts tab to add and connect a SIP account."}
            </p>

            {/* Divider + hint */}
            {!isConnecting && !activeAccount && (
              <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                <WifiOff className="w-3 h-3" />
                <span>No active account selected</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 max-w-md mx-auto">
      {/* Smooth Unified Display - transforms between input and call status */}
      <SmoothUnifiedDisplay
        callState={callState}
        isInCall={isInCall}
        isCallActive={isCallActive}
        formatDuration={formatDuration}
        phoneNumber={phoneNumber}
        lastDialedNumber={lastDialedNumber}
        onPhoneNumberChange={handlePhoneNumberChange}
        disabled={!isRegistered}
      />

      {/* Simplified Dialpad */}
      <SimpleDialpad
        onNumberClick={handleNumberClick}
        onBackspace={handleBackspace}
        onCall={handleCall}
        onHangup={handleHangup}
        disabled={!isRegistered}
        isInCall={isInCall}
        canCall={phoneNumber.length > 0}
      />
    </div>
  );
}
