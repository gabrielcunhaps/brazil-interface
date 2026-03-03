from __future__ import annotations

"""NASA FIRMS collector — active fire hotspots via VIIRS satellite."""

import csv
import io
import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import FIRMS_MAP_KEY, REFRESH_INTERVALS
from backend.models import FireHotspotData

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
        url = _api_url()
        session = await self._get_session()
        async with session.get(url) as resp:
            resp.raise_for_status()
            return await resp.text()

    async def normalize(self, raw: Any) -> list[FireHotspotData]:
        now = datetime.now(timezone.utc)
        url = _api_url()
        reader = csv.DictReader(io.StringIO(raw))
        results: list[FireHotspotData] = []
        for row in reader:
            try:
                lat = float(row.get("latitude", 0))
                lon = float(row.get("longitude", 0))
            except (ValueError, TypeError):
                continue

            if not (LAT_MIN <= lat <= LAT_MAX and LON_MIN <= lon <= LON_MAX):
                continue

            results.append(FireHotspotData(
                source=self.source_name,
                fetched_at=now,
                api_url=url,
                latitude=lat,
                longitude=lon,
                brightness=_float(row.get("bright_ti4")),
                confidence=row.get("confidence", ""),
                acq_date=row.get("acq_date", ""),
                acq_time=row.get("acq_time", ""),
                frp=_float(row.get("frp")),
            ))
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
                print(f"  {h.latitude},{h.longitude} brightness={h.brightness}")
        finally:
            await c.close()

    asyncio.run(_test())
