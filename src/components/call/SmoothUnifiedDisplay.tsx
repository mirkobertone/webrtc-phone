import { useState, useEffect, useRef } from "react";
import { Phone, PhoneCall, PhoneOff } from "lucide-react";
import { Input } from "@/components/ui/input";

// Using the CallState type from useCall hook
interface CallState {
  status: "idle" | "calling" | "ringing" | "connected" | "ended";
  remoteNumber: string | null;
  session: unknown | null;
  duration: number;
}

interface SmoothUnifiedDisplayProps {
  callState: CallState;
  isInCall: boolean;
  isCallActive: boolean;
  formatDuration: (seconds: number) => string;
  phoneNumber: string;
  lastDialedNumber: string;
  onPhoneNumberChange: (value: string) => void;
  disabled?: boolean;
}

export function SmoothUnifiedDisplay({
  callState,
  isInCall,
  isCallActive,
  formatDuration,
  phoneNumber,
  lastDialedNumber,
  onPhoneNumberChange,
  disabled = false,
}: SmoothUnifiedDisplayProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mode transitions with smooth animations
  useEffect(() => {
    if (callState.status === "calling" || callState.status === "ended") {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [callState.status]);

  const handleInputChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9+*#]/g, "");
    onPhoneNumberChange(cleanValue);
  };

  const getStatusIcon = () => {
    switch (callState.status) {
      case "calling":
        return (
          <div className="w-11 h-11 rounded-full bg-blue-500 animate-ring-pulse flex items-center justify-center shadow-lg shadow-blue-500/40">
            <Phone className="w-5 h-5 text-white" />
          </div>
        );
      case "ringing":
        return (
          <div className="w-11 h-11 rounded-full bg-amber-500 animate-amber-ring flex items-center justify-center shadow-lg shadow-amber-500/40">
            <PhoneCall className="w-5 h-5 text-white" />
          </div>
        );
      case "connected":
        return (
          <div className="w-11 h-11 rounded-full bg-emerald-500 animate-connected-glow flex items-center justify-center shadow-lg shadow-emerald-500/40">
            <PhoneCall className="w-5 h-5 text-white" />
          </div>
        );
      case "ended":
        return (
          <div className="w-11 h-11 rounded-full bg-slate-500/70 flex items-center justify-center">
            <PhoneOff className="w-5 h-5 text-white/80" />
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (callState.status) {
      case "calling":   return "Calling…";
      case "ringing":   return "Ringing…";
      case "connected": return "Connected";
      case "ended":     return "Call Ended";
      default:          return "";
    }
  };

  const getStatusColor = () => {
    switch (callState.status) {
      case "calling":   return "text-blue-400 dark:text-blue-300";
      case "ringing":   return "text-amber-500 dark:text-amber-300";
      case "connected": return "text-emerald-500 dark:text-emerald-300";
      case "ended":     return "text-slate-400";
      default:          return "text-muted-foreground";
    }
  };

  const getBackgroundClass = () => {
    if (!isCallActive) {
      return "bg-gradient-to-b from-card to-background dark:from-card dark:to-background/60";
    }
    switch (callState.status) {
      case "calling":
        return "bg-gradient-to-br from-blue-50 to-blue-100/70 dark:from-blue-950/70 dark:to-blue-900/30";
      case "ringing":
        return "bg-gradient-to-br from-amber-50 to-amber-100/70 dark:from-amber-950/60 dark:to-amber-900/30";
      case "connected":
        return "bg-gradient-to-br from-emerald-50 to-emerald-100/70 dark:from-emerald-950/60 dark:to-emerald-900/30";
      case "ended":
        return "bg-gradient-to-br from-slate-100 to-slate-200/60 dark:from-slate-800/60 dark:to-slate-900/40";
      default:
        return "bg-gradient-to-b from-card to-background";
    }
  };

  const getContainerBoxShadow = (): React.CSSProperties => {
    if (!isCallActive) {
      return {
        boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.08)",
      };
    }
    switch (callState.status) {
      case "calling":
        return {
          boxShadow:
            "0 0 0 1px rgba(59,130,246,0.25), 0 8px 32px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
        };
      case "ringing":
        return {
          boxShadow:
            "0 0 0 1px rgba(245,158,11,0.25), 0 8px 32px rgba(245,158,11,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
        };
      case "connected":
        return {
          boxShadow:
            "0 0 0 1px rgba(34,197,94,0.25), 0 8px 32px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
        };
      case "ended":
        return {
          boxShadow:
            "0 0 0 1px rgba(100,116,139,0.2), 0 4px 16px rgba(0,0,0,0.1)",
        };
      default:
        return {};
    }
  };

  const displayNumber = callState.remoteNumber || lastDialedNumber || "Unknown";

  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <div
        ref={containerRef}
        className={`
          ${getBackgroundClass()}
          rounded-2xl border border-border/60
          transition-all duration-500 ease-in-out
          ${isAnimating ? "scale-[1.02]" : "scale-100"}
          relative overflow-hidden
        `}
        style={{
          minHeight: isCallActive ? "230px" : "96px",
          ...getContainerBoxShadow(),
        }}
      >
        {/* Subtle top-edge highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Input Mode */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center px-5
            transition-all duration-500 ease-in-out
            ${isCallActive ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"}
          `}
        >
          <Input
            value={phoneNumber}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter number…"
            className="text-center text-2xl h-14 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/50 tracking-widest"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            disabled={disabled}
          />
        </div>

        {/* Call Status Mode */}
        <div
          className={`
            absolute inset-0 px-8 py-8 flex flex-col items-center justify-center text-center gap-3
            transition-all duration-500 ease-in-out
            ${isCallActive ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
          `}
        >
          {/* Status Icon */}
          {getStatusIcon() && (
            <div className="transition-all duration-300">
              {getStatusIcon()}
            </div>
          )}

          {/* Phone Number */}
          <div
            className="text-[1.65rem] font-semibold text-foreground tracking-widest leading-none mt-1"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {displayNumber}
          </div>

          {/* Status Text / Duration */}
          <div className={`text-sm font-semibold tracking-widest uppercase ${getStatusColor()}`}>
            {isInCall ? formatDuration(callState.duration) : getStatusText()}
          </div>
        </div>
      </div>
    </div>
  );
}
