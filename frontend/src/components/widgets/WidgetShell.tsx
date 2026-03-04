import { memo, useState, type ReactNode } from "react";
import { Minus, Plus } from "lucide-react";

interface WidgetShellProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

function WidgetShell({ title, icon, children, className = "" }: WidgetShellProps) {
  const [minimized, setMinimized] = useState(false);

  return (
    <div
      className={`h-full flex flex-col bg-black/90 border border-emerald-500/20 rounded overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-emerald-500/10 border-t-2 border-t-emerald-500/50 bg-black flex-shrink-0">
        <div className="flex items-center gap-2 drag-handle cursor-grab flex-1">
          {icon && <span className="text-emerald-400">{icon}</span>}
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            {title}
          </span>
        </div>
        <button
          onClick={() => setMinimized((prev) => !prev)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5"
        >
          {minimized ? (
            <Plus className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Body */}
      {!minimized && (
        <div className="flex-1 overflow-auto p-2">{children}</div>
      )}
    </div>
  );
}

export default memo(WidgetShell);
