from __future__ import annotations

"""USGS Earthquake collector — seismic events near Brazil."""

import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS
from backend.models import EarthquakeData

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
        async with session.get(API_URL) as resp:
            resp.raise_for_status()
            return await resp.json()

    async def normalize(self, raw: Any) -> list[EarthquakeData]:
        features = raw.get("features") or []
        now = datetime.now(timezone.utc)
        results: list[EarthquakeData] = []
        for f in features:
            props = f.get("properties", {})
            coords = f.get("geometry", {}).get("coordinates", [0, 0, 0])
            results.append(EarthquakeData(
                source=self.source_name,
                fetched_at=now,
                api_url=API_URL,
                event_id=f.get("id", ""),
                magnitude=props.get("mag", 0),
                place=props.get("place", ""),
                longitude=coords[0],
                latitude=coords[1],
                depth=coords[2] if len(coords) > 2 else 0,
                time=datetime.fromtimestamp(
                    props.get("time", 0) / 1000, tz=timezone.utc
                ),
                tsunami=bool(props.get("tsunami", 0)),
                url=props.get("url", ""),
            ))
        return results


if __name__ == "__main__":
    import asyncio

    async def _test() -> None:
        c = USGSCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} earthquakes")
            for eq in data[:3]:
                print(f"  M{eq.magnitude} @ {eq.place}")
        finally:
            await c.close()

    asyncio.run(_test())
