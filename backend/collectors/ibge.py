from __future__ import annotations

"""IBGE collector — population, GDP, area data from the Brazilian stats agency."""

import logging
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS

logger = logging.getLogger(__name__)

BASE_URL = "https://servicodados.ibge.gov.br/api/v3"

ENDPOINTS = {
    "populacao": {
        "url": f"{BASE_URL}/agregados/4714/periodos/-1/variaveis/93?localidades=N1[all]",
        "indicator": "POPULATION",
        "unit": "habitantes",
    },
    "pib": {
        "url": f"{BASE_URL}/agregados/5938/periodos/-1/variaveis/37?localidades=N1[all]",
        "indicator": "GDP",
        "unit": "R$ milhoes",
    },
    "area": {
        "url": f"{BASE_URL}/agregados/1301/periodos/-1/variaveis/615?localidades=N1[all]",
        "indicator": "AREA",
        "unit": "km2",
    },
}


class IBGECollector(BaseCollector):
    source_name = "ibge"
    refresh_interval = REFRESH_INTERVALS["ibge"]

    async def fetch(self) -> Any:
        session = await self._get_session()
        results: dict[str, Any] = {}
        for name, info in ENDPOINTS.items():
            try:
                async with session.get(info["url"]) as resp:
                    resp.raise_for_status()
                    results[name] = {
                        "data": await resp.json(),
                        "url": info["url"],
                        "indicator": info["indicator"],
                        "unit": info["unit"],
                    }
            except Exception:
                logger.warning("[ibge] Failed to fetch %s", name)
                results[name] = {
                    "data": [],
                    "url": info["url"],
                    "indicator": info["indicator"],
                    "unit": info["unit"],
                }
        return results

    async def normalize(self, raw: Any) -> list[dict]:
        """Return list of indicator dicts."""
        results: list[dict] = []
        for name, info in raw.items():
            data_list = info["data"]
            if not isinstance(data_list, list) or not data_list:
                continue
            try:
                first = data_list[0]
                resultados = first.get("resultados", [])
                for res in resultados:
                    series_list = res.get("series", [])
                    for serie in series_list:
                        for period, val in serie.get("serie", {}).items():
                            try:
                                value = float(val)
                            except (ValueError, TypeError):
                                continue
                            results.append({
                                "indicator": info["indicator"],
                                "value": value,
                                "date": period,
                                "unit": info["unit"],
                            })
            except Exception:
                logger.warning("[ibge] Failed to parse %s", name)
        return results


if __name__ == "__main__":
    import asyncio
    import json

    async def _test() -> None:
        c = IBGECollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} IBGE indicators")
            for ind in data[:5]:
                print(f"  {ind['indicator']}: {ind['value']} {ind['unit']} ({ind['date']})")
        finally:
            await c.close()

    asyncio.run(_test())
