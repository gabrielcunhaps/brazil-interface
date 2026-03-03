from __future__ import annotations

"""INPE Queimadas collector — Brazilian fire data from INPE."""

import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS
from backend.models import FireHotspotData

logger = logging.getLogger(__name__)

API_URL = "https://queimadas.dgi.inpe.br/queimadas/dados-abertos/apidadosabertos/focos/count"
FOCOS_URL = "https://queimadas.dgi.inpe.br/queimadas/dados-abertos/apidadosabertos/focos"


class QueimadasCollector(BaseCollector):
    source_name = "queimadas"
    refresh_interval = REFRESH_INTERVALS["queimadas"]

    async def fetch(self) -> Any:
        session = await self._get_session()
        params = {"pais_id": 33}  # Brazil
        async with session.get(FOCOS_URL, params=params) as resp:
            resp.raise_for_status()
            return await resp.json()

    async def normalize(self, raw: Any) -> list[FireHotspotData]:
        now = datetime.now(timezone.utc)
        items = raw if isinstance(raw, list) else raw.get("dados", raw.get("data", []))
        results: list[FireHotspotData] = []
        for item in items[:500]:  # cap at 500
            try:
                lat = float(item.get("lat", item.get("latitude", 0)))
                lon = float(item.get("lon", item.get("longitude", 0)))
            except (ValueError, TypeError):
                continue
            results.append(FireHotspotData(
                source=self.source_name,
                fetched_at=now,
                api_url=FOCOS_URL,
                latitude=lat,
                longitude=lon,
                brightness=_float(item.get("frp")),
                confidence=str(item.get("confianca", item.get("confidence", ""))),
                acq_date=str(item.get("data_hora_gmt", "")),
                frp=_float(item.get("frp")),
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
        c = QueimadasCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} INPE fire hotspots")
            for h in data[:3]:
                print(f"  {h.latitude},{h.longitude}")
        finally:
            await c.close()

    asyncio.run(_test())
