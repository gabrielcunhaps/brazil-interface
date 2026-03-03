from __future__ import annotations

"""INMET weather collector — Brazilian meteorological station data."""

import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import INMET_TOKEN, REFRESH_INTERVALS
from backend.models import WeatherStationData

logger = logging.getLogger(__name__)

API_URL = "https://apitempo.inmet.gov.br/estacao/dados/24h"


class INMETCollector(BaseCollector):
    source_name = "inmet"
    refresh_interval = REFRESH_INTERVALS["inmet"]

    async def fetch(self) -> Any:
        session = await self._get_session()
        headers = {}
        if INMET_TOKEN:
            headers["Authorization"] = f"Bearer {INMET_TOKEN}"
        async with session.get(API_URL, headers=headers) as resp:
            resp.raise_for_status()
            return await resp.json()

    async def normalize(self, raw: Any) -> list[WeatherStationData]:
        now = datetime.now(timezone.utc)
        items = raw if isinstance(raw, list) else []
        results: list[WeatherStationData] = []
        for item in items:
            obs_time = None
            dt_str = item.get("DT_MEDICAO") or item.get("dt_medicao")
            hr_str = item.get("HR_MEDICAO") or item.get("hr_medicao")
            if dt_str:
                try:
                    t = f"{dt_str} {hr_str}" if hr_str else dt_str
                    obs_time = datetime.fromisoformat(t.replace("Z", "+00:00"))
                except ValueError:
                    pass

            results.append(WeatherStationData(
                source=self.source_name,
                fetched_at=now,
                api_url=API_URL,
                station_id=str(item.get("CD_ESTACAO", item.get("cd_estacao", ""))),
                station_name=item.get("DC_NOME", item.get("dc_nome", "")),
                state=item.get("SG_ESTADO", item.get("sg_estado", "")),
                latitude=_float(item.get("VL_LATITUDE", item.get("vl_latitude"))) or 0.0,
                longitude=_float(item.get("VL_LONGITUDE", item.get("vl_longitude"))) or 0.0,
                temperature=_float(item.get("TEM_INS", item.get("tem_ins"))),
                humidity=_float(item.get("UMD_INS", item.get("umd_ins"))),
                pressure=_float(item.get("PRE_INS", item.get("pre_ins"))),
                wind_speed=_float(item.get("VEN_VEL", item.get("ven_vel"))),
                wind_direction=_float(item.get("VEN_DIR", item.get("ven_dir"))),
                precipitation=_float(item.get("CHUVA", item.get("chuva"))),
                observation_time=obs_time,
            ))
        return results


def _float(val: Any) -> float | None:
    if val is None or val == "":
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


if __name__ == "__main__":
    import asyncio

    async def _test() -> None:
        c = INMETCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} weather stations")
            for s in data[:3]:
                print(f"  {s.station_name} ({s.state}): {s.temperature}C, {s.humidity}%")
        finally:
            await c.close()

    asyncio.run(_test())
