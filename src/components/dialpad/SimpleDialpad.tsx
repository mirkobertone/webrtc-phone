import { Phone, PhoneOff, Delete } from "lucide-react";

interface SimpleDialpadProps {
  onNumberClick?: (number: string) => void;
  onBackspace?: () => void;
  onCall?: () => void;
  onHangup?: () => void;
  disabled?: boolean;
  isInCall?: boolean;
  canCall?: boolean;
}

const dialpadButtons = [
  { digit: "1", sub: ""     },
  { digit: "2", sub: "ABC"  },
  { digit: "3", sub: "DEF"  },
  { digit: "4", sub: "GHI"  },
  { digit: "5", sub: "JKL"  },
  { digit: "6", sub: "MNO"  },
  { digit: "7", sub: "PQRS" },
  { digit: "8", sub: "TUV"  },
  { digit: "9", sub: "WXYZ" },
  { digit: "*", sub: ""     },
  { digit: "0", sub: "+"    },
  { digit: "#", sub: ""     },
];

export function SimpleDialpad({
  onNumberClick,
  onBackspace,
  onCall,
  onHangup,
  disabled = false,
  isInCall = false,
  canCall = false,
}: SimpleDialpadProps) {
  const handleNumberClick = (number: string) => {
    if (disabled) return;
    onNumberClick?.(number);
  };

  const handleBackspace = () => {
    if (disabled) return;
    onBackspace?.();
  };

  const handleCall = () => {
    if (disabled || !canCall) return;
    onCall?.();
  };

  const handleHangup = () => {
    onHangup?.();
  };

  return (
    <div className="w-full max-w-xs mx-auto select-none">

      {/* Dialpad Grid */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        {dialpadButtons.map(({ digit, sub }) => (
          <button
            key={digit}
            onClick={() => handleNumberClick(digit)}
            disabled={disabled}
            className="
              group relative h-[4.25rem] w-[4.25rem] mx-auto rounded-full
              flex flex-col items-center justify-center gap-[3px]
              border border-border/70
              bg-gradient-to-b from-card to-secondary/60
              dark:from-card dark:to-secondary/40
              shadow-[0_2px_6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.08)]
              transition-all duration-100 ease-out
              hover:shadow-[0_4px_14px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.06)]
              hover:-translate-y-0.5
              hover:border-primary/30
              active:translate-y-0.5 active:shadow-[0_1px_3px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(0,0,0,0.12)]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
              cursor-pointer
            "
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            <span className="text-xl font-semibold text-foreground leading-none">
              {digit}
            </span>
            {sub && (
              <span className="text-[7.5px] font-semibold tracking-[0.15em] text-muted-foreground/70 leading-none uppercase">
                {sub}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-center gap-6">

        {/* Backspace */}
        <button
          onClick={handleBackspace}
          disabled={disabled}
          className="
            h-11 w-11 rounded-full flex items-center justify-center
            bg-secondary/60 border border-border/60
            shadow-[0_1px_3px_rgba(0,0,0,0.08)]
            transition-all duration-100
            hover:bg-secondary hover:shadow-md hover:-translate-y-0.5
            active:translate-y-0.5 active:shadow-sm
            disabled:opacity-30 disabled:cursor-not-allowed
            cursor-pointer
          "
        >
          <Delete className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Call / Hangup */}
        {isInCall ? (
          <button
            onClick={handleHangup}
            disabled={disabled}
            className="
              h-[4.75rem] w-[4.75rem] rounded-full flex items-center justify-center
              bg-red-500 hover:bg-red-600
              border-0
              animate-hangup-glow
              transition-all duration-150
              active:scale-95
              cursor-pointer
            "
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        ) : (
          <button
            onClick={handleCall}
            disabled={disabled || !canCall}
            className="
              h-[4.75rem] w-[4.75rem] rounded-full flex items-center justify-center
              bg-emerald-500 hover:bg-emerald-600
              border-0
              shadow-[0_4px_20px_rgba(34,197,94,0.4),0_2px_8px_rgba(34,197,94,0.3)]
              hover:shadow-[0_6px_26px_rgba(34,197,94,0.55),0_3px_10px_rgba(34,197,94,0.4)]
              transition-all duration-150
              hover:-translate-y-0.5
              active:scale-95 active:translate-y-0
              disabled:bg-muted disabled:shadow-none disabled:opacity-50 disabled:cursor-not-allowed
              cursor-pointer
            "
          >
            <Phone className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Spacer (mirror of backspace) */}
        <div className="h-11 w-11" />
      </div>
    </div>
  );
}
