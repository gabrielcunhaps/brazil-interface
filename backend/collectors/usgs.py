from __future__ import annotations

"""USGS Earthquake collector — seismic events near Brazil.

Returns dicts matching the frontend Earthquake shape:
  {id, magnitude, lat, lon, depth, place, time}
"""

import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS

logger = logging.getLogger(__name__)

API_URL = (
    "https://earthquake.usgs.gov/fdsnws/event/1/query"
    "?format=geojson&minlatitude=-34&maxlatitude=6"
    "&minlongitude=-74&maxlongitude=-34&orderby=time&limit=50"
)


class USGSCollector(BaseCollector):
    source_name = "usgs"
    refresh_interval = REFRESH_INTERVALS["usgs"]

    async def fetch(self) -> Any:
        session = await self._get_session()
        try:
            async with session.get(API_URL) as resp:
                resp.raise_for_status()
                return await resp.json()
        except Exception as exc:
            logger.warning("[usgs] Fetch failed: %s", exc)
            return {"features": []}

    async def normalize(self, raw: Any) -> list[dict]:
        """Return list of dicts matching frontend Earthquake type."""
        features = raw.get("features") or []
        results: list[dict] = []
        for f in features:
            props = f.get("properties", {})
            coords = f.get("geometry", {}).get("coordinates", [0, 0, 0])
            try:
                time_ms = props.get("time", 0)
                results.append({
                    "id": f.get("id", ""),
                    "magnitude": props.get("mag", 0) or 0,
                    "lat": coords[1] if len(coords) > 1 else 0,
                    "lon": coords[0],
                    "depth": coords[2] if len(coords) > 2 else 0,
                    "place": props.get("place", ""),
                    "time": time_ms,
                })
            except (IndexError, TypeError, ValueError):
                continue
        return results


if __name__ == "__main__":
    import asyncio
    import json

    async def _test() -> None:
        c = USGSCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} earthquakes")
            for eq in data[:3]:
                print(f"  M{eq['magnitude']} @ {eq['place']}")
        finally:
            await c.close()

    asyncio.run(_test())
