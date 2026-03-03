from __future__ import annotations

"""BrasilAPI collector — utility data (CNPJ, CEP, holidays, banks, etc.)."""

import logging
from datetime import datetime, timezone
from typing import Any

from backend.collectors.base import BaseCollector
from backend.config import REFRESH_INTERVALS
from backend.models import EconomyIndicator

logger = logging.getLogger(__name__)

BASE_URL = "https://brasilapi.com.br/api"


class BrasilAPICollector(BaseCollector):
    source_name = "brasilapi"
    refresh_interval = REFRESH_INTERVALS["brasilapi"]

    async def fetch(self) -> Any:
        session = await self._get_session()
        results: dict[str, Any] = {}

        # Fetch current year holidays
        year = datetime.now().year
        try:
            async with session.get(f"{BASE_URL}/feriados/v3/{year}") as resp:
                if resp.status == 200:
                    results["holidays"] = await resp.json()
        except Exception:
            logger.warning("[brasilapi] Failed to fetch holidays")
            results["holidays"] = []

        # Fetch bank list
        try:
            async with session.get(f"{BASE_URL}/banks/v1") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    results["banks"] = data[:20]  # top 20
        except Exception:
            logger.warning("[brasilapi] Failed to fetch banks")
            results["banks"] = []

        # Fetch IBGE municipality count
        try:
            async with session.get(f"{BASE_URL}/ibge/municipios/v1/BR") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    results["municipalities_count"] = len(data) if isinstance(data, list) else 0
        except Exception:
            results["municipalities_count"] = 5570  # known count

        return results

    async def normalize(self, raw: Any) -> list[EconomyIndicator]:
        now = datetime.now(timezone.utc)
        results: list[EconomyIndicator] = []

        # Holidays count
        holidays = raw.get("holidays", [])
        results.append(EconomyIndicator(
            source=self.source_name,
            fetched_at=now,
            api_url=f"{BASE_URL}/feriados/v3/{now.year}",
            indicator="HOLIDAYS",
            value=float(len(holidays)),
            date=str(now.year),
            unit="count",
        ))

        # Banks count
        banks = raw.get("banks", [])
        results.append(EconomyIndicator(
            source=self.source_name,
            fetched_at=now,
            api_url=f"{BASE_URL}/banks/v1",
            indicator="BANKS",
            value=float(len(banks)),
            date=str(now.year),
            unit="count",
        ))

        # Municipalities
        mun_count = raw.get("municipalities_count", 5570)
        results.append(EconomyIndicator(
            source=self.source_name,
            fetched_at=now,
            api_url=f"{BASE_URL}/ibge/municipios/v1/BR",
            indicator="MUNICIPALITIES",
            value=float(mun_count),
            date=str(now.year),
            unit="count",
        ))

        return results

    # --- Utility methods for on-demand enrichment ---

    async def lookup_cnpj(self, cnpj: str) -> dict | None:
        session = await self._get_session()
        try:
            async with session.get(f"{BASE_URL}/cnpj/v1/{cnpj}") as resp:
                if resp.status == 200:
                    return await resp.json()
        except Exception:
            logger.warning("[brasilapi] CNPJ lookup failed for %s", cnpj)
        return None

    async def lookup_cep(self, cep: str) -> dict | None:
        session = await self._get_session()
        try:
            async with session.get(f"{BASE_URL}/cep/v2/{cep}") as resp:
                if resp.status == 200:
                    return await resp.json()
        except Exception:
            logger.warning("[brasilapi] CEP lookup failed for %s", cep)
        return None


if __name__ == "__main__":
    import asyncio

    async def _test() -> None:
        c = BrasilAPICollector()
        try:
            data = await c.get_latest()
            print(f"Fetched {len(data)} BrasilAPI indicators")
            for ind in data:
                print(f"  {ind.indicator}: {ind.value} {ind.unit}")

            # Test CEP lookup
            cep = await c.lookup_cep("01001000")
            if cep:
                print(f"\nCEP 01001-000: {cep.get('street')}, {cep.get('city')}/{cep.get('state')}")
        finally:
            await c.close()

    asyncio.run(_test())
