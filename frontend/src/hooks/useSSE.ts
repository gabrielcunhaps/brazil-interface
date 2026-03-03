import { useEffect, useRef, useState } from "react";
import { useDataStore } from "@/stores/dataStore";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

const MAX_RETRY_DELAY = 30_000;

export function useSSE() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const retryCount = useRef(0);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let disposed = false;

    function connect() {
      if (disposed) return;

      setStatus("connecting");
      const es = new EventSource("/api/stream");
      esRef.current = es;

      es.onopen = () => {
        if (disposed) return;
        retryCount.current = 0;
        setStatus("connected");
      };

      const store = useDataStore.getState;

      // Map SSE event names to store update functions.
      // Backend payload shape: { source, event, count, timestamp, data: [...] }
      const handlers: Record<string, (payload: { data: unknown }) => void> = {
        flights: (p) => useDataStore.getState().updateFlights(p.data as never),
        earthquakes: (p) => useDataStore.getState().updateEarthquakes(p.data as never),
        satellites: (p) => useDataStore.getState().updateSatellites(p.data as never),
        fires: (p) => useDataStore.getState().updateFires(p.data as never),
        fires_inpe: (p) => {
          // Merge INPE fire data with existing fires
          const existing = useDataStore.getState().fires;
          useDataStore.getState().updateFires([...existing, ...(p.data as never[])]);
        },
        weather: (p) => useDataStore.getState().updateWeather(p.data as never),
        economy: (p) => useDataStore.getState().updateEconomy(p.data as never),
        market: (p) => useDataStore.getState().updateMarket(p.data as never),
        deforestation: (p) => useDataStore.getState().updateDeforestation(p.data as never),
        energy: (p) => useDataStore.getState().updateEnergy(p.data as never),
        health: (p) => useDataStore.getState().updateHealth(p.data as never),
        elections: (p) => useDataStore.getState().updateElections(p.data as never),
        transparency: (p) => useDataStore.getState().updateTransparency(p.data as never),
      };

      for (const [event, handler] of Object.entries(handlers)) {
        es.addEventListener(event, (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data);
            handler(payload);
          } catch {
            // skip malformed data
          }
        });
      }

      es.onerror = () => {
        if (disposed) return;
        es.close();
        esRef.current = null;
        setStatus("disconnected");
        const delay = Math.min(1000 * 2 ** retryCount.current, MAX_RETRY_DELAY);
        retryCount.current += 1;
        setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      disposed = true;
      esRef.current?.close();
      esRef.current = null;
    };
  }, []);

  return status;
}
