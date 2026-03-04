from __future__ import annotations

"""NASA FIRMS collector — active fire hotspots via VIIRS satellite.

Returns dicts matching the frontend FireHotspot shape:
  {lat, lon, brightness, confidence, source, acq_date}
"""

import csv
import io
import logging
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import FIRMS_MAP_KEY, REFRESH_INTERVALS

logger = logging.getLogger(__name__)

# Brazil bounding box
LAT_MIN, LAT_MAX = -34.0, 6.0
LON_MIN, LON_MAX = -74.0, -34.0


def _api_url() -> str:
    return (
        f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/"
        f"{FIRMS_MAP_KEY}/VIIRS_SNPP_NRT/world/1"
    )


class FIRMSCollector(BaseCollector):
    source_name = "firms"
    refresh_interval = REFRESH_INTERVALS["firms"]

    async def fetch(self) -> Any:
        if not FIRMS_MAP_KEY:
            logger.warning("[firms] No API key configured, skipping")
            return ""
        url = _api_url()
        session = await self._get_session()
        try:
            async with session.get(url) as resp:
                resp.raise_for_status()
                return await resp.text()
        except Exception as exc:
            logger.warning("[firms] Fetch failed: %s", exc)
            return ""

    async def normalize(self, raw: Any) -> list[dict]:
        """Return list of dicts matching frontend FireHotspot type."""
        if not raw or not isinstance(raw, str) or len(raw) < 50:
            return []

        reader = csv.DictReader(io.StringIO(raw))
        results: list[dict] = []
        for row in reader:
            try:
                lat = float(row.get("latitude", 0))
                lon = float(row.get("longitude", 0))
            except (ValueError, TypeError):
                continue

            if not (LAT_MIN <= lat <= LAT_MAX and LON_MIN <= lon <= LON_MAX):
                continue

            results.append({
                "lat": round(lat, 4),
                "lon": round(lon, 4),
                "brightness": _float(row.get("bright_ti4")) or 0,
                "confidence": row.get("confidence", ""),
                "source": "VIIRS",
                "acq_date": row.get("acq_date", ""),
            })
        return results


def _float(val: Any) -> float | None:
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


if __name__ == "__main__":
    import asyncio

    async def _test() -> None:
        if not FIRMS_MAP_KEY:
            print("Set FIRMS_MAP_KEY to test")
            return
        c = FIRMSCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} fire hotspots in Brazil")
            for h in data[:3]:
                print(f"  {h['lat']},{h['lon']} brightness={h['brightness']}")
        finally:
            await c.close()

    asyncio.run(_test())
