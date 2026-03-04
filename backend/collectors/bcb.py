from __future__ import annotations

"""Banco Central do Brasil collector — SELIC, IPCA, USD/BRL exchange rate.

Returns a SINGLE aggregated dict matching the frontend EconomyData shape:
  {selic, ipca, usd_brl, selic_history, ipca_history, usd_brl_history}
"""

import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS

logger = logging.getLogger(__name__)

BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.{code}/dados/ultimos/30?formato=json"

SERIES = {
    "SELIC": {"code": 432, "unit": "% a.a."},
    "IPCA": {"code": 433, "unit": "% mensal"},
    "USD_BRL": {"code": 1, "unit": "BRL"},
}

# Static fallback values (approximate current values)
STATIC_FALLBACK: dict[str, Any] = {
    "SELIC": {
        "data": [
            {"data": "01/01/2025", "valor": "13.25"},
            {"data": "01/02/2025", "valor": "13.25"},
            {"data": "01/03/2025", "valor": "13.75"},
            {"data": "01/04/2025", "valor": "14.25"},
            {"data": "01/05/2025", "valor": "14.25"},
            {"data": "01/06/2025", "valor": "14.75"},
        ],
        "url": BASE_URL.format(code=432),
        "unit": "% a.a.",
    },
    "IPCA": {
        "data": [
            {"data": "01/2025", "valor": "0.16"},
            {"data": "02/2025", "valor": "1.31"},
            {"data": "03/2025", "valor": "0.56"},
            {"data": "04/2025", "valor": "0.43"},
            {"data": "05/2025", "valor": "0.36"},
            {"data": "06/2025", "valor": "0.53"},
        ],
        "url": BASE_URL.format(code=433),
        "unit": "% mensal",
    },
    "USD_BRL": {
        "data": [
            {"data": "01/01/2025", "valor": "5.85"},
            {"data": "01/02/2025", "valor": "5.78"},
            {"data": "01/03/2025", "valor": "5.72"},
            {"data": "01/04/2025", "valor": "5.68"},
            {"data": "01/05/2025", "valor": "5.65"},
            {"data": "01/06/2025", "valor": "5.70"},
        ],
        "url": BASE_URL.format(code=1),
        "unit": "BRL",
    },
}


class BCBCollector(BaseCollector):
    source_name = "bcb"
    refresh_interval = REFRESH_INTERVALS["bcb"]

    async def fetch(self) -> Any:
        session = await self._get_session()
        results: dict[str, Any] = {}
        any_success = False
        for name, info in SERIES.items():
            url = BASE_URL.format(code=info["code"])
            try:
                async with session.get(url) as resp:
                    resp.raise_for_status()
                    data = await resp.json()
                    if isinstance(data, list) and len(data) > 0:
                        results[name] = {
                            "data": data,
                            "url": url,
                            "unit": info["unit"],
                        }
                        any_success = True
                    else:
                        logger.warning("[bcb] Empty response for %s", name)
                        results[name] = STATIC_FALLBACK[name]
            except Exception:
                logger.warning("[bcb] Failed to fetch %s, using fallback", name)
                results[name] = STATIC_FALLBACK[name]

        if not any_success:
            logger.warning("[bcb] All series failed, using full static fallback")
            return STATIC_FALLBACK

        # Fill in any missing series with fallback
        for name in SERIES:
            if name not in results:
                results[name] = STATIC_FALLBACK[name]

        return results

    async def normalize(self, raw: Any) -> list[dict]:
        """Return a single-element list containing the aggregated EconomyData dict.

        The frontend expects: {selic, ipca, usd_brl, selic_history, ipca_history, usd_brl_history}
        """
        selic_val = 0.0
        ipca_val = 0.0
        usd_brl_val = 0.0
        selic_history: list[dict] = []
        ipca_history: list[dict] = []
        usd_brl_history: list[dict] = []

        for indicator_name, info in raw.items():
            entries = info.get("data", [])
            for entry in entries:
                try:
                    val = float(entry.get("valor", 0))
                except (ValueError, TypeError):
                    continue
                date_str = entry.get("data", "")
                point = {"date": date_str, "value": val}

                if indicator_name == "SELIC":
                    selic_history.append(point)
                    selic_val = val  # last value wins
                elif indicator_name == "IPCA":
                    ipca_history.append(point)
                    ipca_val = val
                elif indicator_name == "USD_BRL":
                    usd_brl_history.append(point)
                    usd_brl_val = val

        economy_data = {
            "selic": selic_val,
            "ipca": ipca_val,
            "usd_brl": usd_brl_val,
            "selic_history": selic_history,
            "ipca_history": ipca_history,
            "usd_brl_history": usd_brl_history,
        }

        # Return as a single-element list (the stream handler will unwrap it)
        return [economy_data]


if __name__ == "__main__":
    import asyncio
    import json

    async def _test() -> None:
        c = BCBCollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} economy data objects")
            if data:
                print(json.dumps(data[0], indent=2, default=str))
        finally:
            await c.close()

    asyncio.run(_test())
