from __future__ import annotations

"""OpenSky Network collector — live flights over Brazil."""

import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS
from backend.models import FlightData

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
        async with session.get(API_URL) as resp:
            resp.raise_for_status()
            return await resp.json()

    async def normalize(self, raw: Any) -> list[FlightData]:
        states = raw.get("states") or []
        now = datetime.now(timezone.utc)
        results: list[FlightData] = []
        for s in states:
            results.append(FlightData(
                source=self.source_name,
                fetched_at=now,
                api_url=API_URL,
                icao24=s[0],
                callsign=(s[1] or "").strip(),
                origin_country=s[2] or "",
                longitude=s[5],
                latitude=s[6],
                altitude=s[7],
                velocity=s[9],
                heading=s[10],
                on_ground=bool(s[8]),
            ))
        return results


if __name__ == "__main__":
    import asyncio

    async def _test() -> None:
        c = OpenSkyCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} flights")
            for f in data[:3]:
                print(f"  {f.callsign} @ {f.latitude},{f.longitude}")
        finally:
            await c.close()

    asyncio.run(_test())
