from __future__ import annotations

"""Banco Central do Brasil collector — SELIC, IPCA, USD/BRL exchange rate."""

import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS
from backend.models import EconomyIndicator

logger = logging.getLogger(__name__)

BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.{code}/dados/ultimos/30?formato=json"

SERIES = {
    "SELIC": {"code": 432, "unit": "% a.a."},
    "IPCA": {"code": 433, "unit": "% mensal"},
    "USD_BRL": {"code": 1, "unit": "BRL"},
}


class BCBCollector(BaseCollector):
    source_name = "bcb"
    refresh_interval = REFRESH_INTERVALS["bcb"]

    async def fetch(self) -> Any:
        session = await self._get_session()
        results: dict[str, Any] = {}
        for name, info in SERIES.items():
            url = BASE_URL.format(code=info["code"])
            try:
                async with session.get(url) as resp:
                    resp.raise_for_status()
                    results[name] = {
                        "data": await resp.json(),
                        "url": url,
                        "unit": info["unit"],
                    }
            except Exception:
                logger.warning("[bcb] Failed to fetch %s", name)
                results[name] = {"data": [], "url": url, "unit": info["unit"]}
        return results

    async def normalize(self, raw: Any) -> list[EconomyIndicator]:
        now = datetime.now(timezone.utc)
        results: list[EconomyIndicator] = []
        for indicator_name, info in raw.items():
            for entry in info["data"]:
                try:
                    val = float(entry.get("valor", 0))
                except (ValueError, TypeError):
                    continue
                results.append(EconomyIndicator(
                    source=self.source_name,
                    fetched_at=now,
                    api_url=info["url"],
                    indicator=indicator_name,
                    value=val,
                    date=entry.get("data", ""),
                    unit=info["unit"],
                ))
        return results


if __name__ == "__main__":
    import asyncio

    async def _test() -> None:
        c = BCBCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} economy indicators")
            for ind in data[-5:]:
                print(f"  {ind.indicator}: {ind.value} {ind.unit} ({ind.date})")
        finally:
            await c.close()

    asyncio.run(_test())
