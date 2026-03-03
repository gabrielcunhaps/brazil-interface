import { memo, useEffect, useState, useRef } from "react";
import { useUIStore } from "@/stores/uiStore";

const BOOT_LINES = [
  "> BRAZIL INTELLIGENCE DASHBOARD v1.0",
  "> INITIALIZING CORE SYSTEMS...",
  "> CONNECTING TO DATA FEEDS...",
  "> [\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588] OPENSKY NETWORK... OK",
  "> [\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588] USGS SEISMIC... OK",
  "> [\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588] NASA FIRMS... OK",
  "> [\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588] CELESTRAK TLE... OK",
  "> ALL SYSTEMS NOMINAL",
  "> DASHBOARD READY",
];

function SplashScreen() {
  const setSplashComplete = useUIStore((s) => s.setSplashComplete);
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentChar((prev) => {
        const line = BOOT_LINES[currentLine];
        if (!line) return prev;

        if (prev < line.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 20);

    return () => clearInterval(intervalRef.current);
  }, [currentLine]);

  useEffect(() => {
    const line = BOOT_LINES[currentLine];
    if (!line) return;

    if (currentChar >= line.length) {
      clearInterval(intervalRef.current);
      const timeout = setTimeout(() => {
        setLines((prev) => [...prev, line]);
        if (currentLine < BOOT_LINES.length - 1) {
          setCurrentLine((prev) => prev + 1);
          setCurrentChar(0);
        } else {
          // All lines displayed - fade out
          setTimeout(() => {
            setFading(true);
            setTimeout(() => setSplashComplete(true), 600);
          }, 400);
        }
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [currentChar, currentLine, setSplashComplete]);

  const partialLine = BOOT_LINES[currentLine]
    ? BOOT_LINES[currentLine].slice(0, currentChar)
    : "";

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        }}
      />

      <div className="max-w-xl w-full px-8">
        <pre className="font-mono text-sm text-emerald-400 leading-relaxed">
          {lines.map((line, i) => (
            <div
              key={i}
              className={
                line.includes("OK")
                  ? "text-emerald-400"
                  : line.includes("READY")
                    ? "text-emerald-300 font-bold"
                    : "text-emerald-500"
              }
            >
              {line}
            </div>
          ))}
          {currentLine < BOOT_LINES.length && (
            <div className="text-emerald-400">
              {partialLine}
              <span className="animate-pulse">_</span>
            </div>
          )}
        </pre>
      </div>
    </div>
  );
}

export default memo(SplashScreen);
