const Crosshair: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-20">
        {/* Outer rotating circle */}
        <circle
          cx="60" cy="60" r="50"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="4 8"
          className="text-emerald-400"
          style={{ animation: "spin 12s linear infinite", transformOrigin: "center" }}
        />
        {/* Cross lines with center gap */}
        <line x1="0" y1="60" x2="45" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-emerald-400" />
        <line x1="75" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-emerald-400" />
        <line x1="60" y1="0" x2="60" y2="45" stroke="currentColor" strokeWidth="0.5" className="text-emerald-400" />
        <line x1="60" y1="75" x2="60" y2="120" stroke="currentColor" strokeWidth="0.5" className="text-emerald-400" />
        {/* Center dot */}
        <circle cx="60" cy="60" r="2" fill="currentColor" className="text-emerald-400" />
        {/* Tick marks */}
        <line x1="60" y1="10" x2="60" y2="16" stroke="currentColor" strokeWidth="1" className="text-emerald-400" />
        <line x1="60" y1="104" x2="60" y2="110" stroke="currentColor" strokeWidth="1" className="text-emerald-400" />
        <line x1="10" y1="60" x2="16" y2="60" stroke="currentColor" strokeWidth="1" className="text-emerald-400" />
        <line x1="104" y1="60" x2="110" y2="60" stroke="currentColor" strokeWidth="1" className="text-emerald-400" />
      </svg>
    </div>
  );
};

export default Crosshair;
