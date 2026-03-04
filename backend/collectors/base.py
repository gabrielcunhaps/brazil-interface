"""Abstract base collector with caching, error handling, and aiohttp session management."""

from __future__ import annotations

import logging
import time
from abc import ABC, abstractmethod
from typing import Any

import aiohttp

logger = logging.getLogger(__name__)


class BaseCollector(ABC):
    source_name: str = "base"
    refresh_interval: float = 60.0  # seconds

    def __init__(self) -> None:
        self._cache: list[Any] = []
        self._last_fetch: float = 0.0
        self._session: aiohttp.ClientSession | None = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=30)
            self._session = aiohttp.ClientSession(timeout=timeout)
        return self._session

    async def close(self) -> None:
        if self._session and not self._session.closed:
            await self._session.close()

    def _should_refresh(self) -> bool:
        return (time.time() - self._last_fetch) >= self.refresh_interval

    @abstractmethod
    async def fetch(self) -> Any:
        """Make the raw API call and return raw data."""

        ...

    @abstractmethod
    async def normalize(self, raw: Any) -> list:
        """Transform raw API data into a list of dicts or Pydantic models.

        For singleton sources (economy, market, energy), return a single-element
        list containing the aggregated dict. The stream handler unwraps it.
        """
        ...

    async def get_latest(self) -> list:
        """Return cached data or fetch fresh data if stale."""
        if not self._should_refresh():
            return self._cache
        try:
            raw = await self.fetch()
            self._cache = await self.normalize(raw)
            self._last_fetch = time.time()
        except Exception:
            logger.exception("[%s] fetch failed, returning cached data", self.source_name)
        return self._cache
