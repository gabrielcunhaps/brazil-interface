from __future__ import annotations

"""OpenSky Network collector — live flights over Brazil.

Returns dicts matching the frontend Flight shape:
  {icao24, callsign, lat, lon, altitude, velocity, heading, on_ground}

Note: The anonymous OpenSky API has severe rate limits (100 req/day, 10s cooldown).
We use a generous refresh interval and robust error handling.
"""

import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS

logger = logging.getLogger(__name__)

API_URL = (
    "https://opensky-network.org/api/states/all"
    "?lamin=-34&lomin=-74&lamax=6&lomax=-34"
)


class OpenSkyCollector(BaseCollector):
    source_name = "opensky"
    refresh_interval = REFRESH_INTERVALS["opensky"]

    async def fetch(self) -> Any:
        session = await self._get_session()
        try:
            async with session.get(API_URL) as resp:
                if resp.status == 429:
                    logger.warning("[opensky] Rate limited (429), returning cached data")
                    return {"states": None}
                resp.raise_for_status()
                return await resp.json()
        except Exception as exc:
            logger.warning("[opensky] Fetch failed: %s", exc)
            return {"states": None}

    async def normalize(self, raw: Any) -> list[dict]:
        """Return list of dicts matching frontend Flight type."""
        states = raw.get("states") if isinstance(raw, dict) else None
        if not states:
            # Return previously cached data or empty
            return self._cache if self._cache else []

        results: list[dict] = []
        for s in states:
            try:
                lat = s[6]
                lon = s[5]
                if lat is None or lon is None:
                    continue
                results.append({
                    "icao24": s[0] or "",
                    "callsign": (s[1] or "").strip(),
                    "lat": lat,
                    "lon": lon,
                    "altitude": s[7] or 0,
                    "velocity": s[9] or 0,
                    "heading": s[10] or 0,
                    "on_ground": bool(s[8]),
                })
            except (IndexError, TypeError):
                continue
        return results


if __name__ == "__main__":
    import asyncio
    import json

    async def _test() -> None:
        c = OpenSkyCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} flights")
            for f in data[:3]:
                print(f"  {f['callsign']} @ {f['lat']},{f['lon']}")
        finally:
            await c.close()

    asyncio.run(_test())
