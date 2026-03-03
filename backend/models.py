from __future__ import annotations

"""Pydantic v2 models for all Brazil Intelligence Dashboard data sources."""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Shared mixin
# ---------------------------------------------------------------------------

class SourceAttribution(BaseModel):
    source: str
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    api_url: str = ""


# ---------------------------------------------------------------------------
# Flights (OpenSky)
# ---------------------------------------------------------------------------

class FlightData(SourceAttribution):
    icao24: str
    callsign: Optional[str] = None
    origin_country: str = ""
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    altitude: Optional[float] = None
    velocity: Optional[float] = None
    heading: Optional[float] = None
    on_ground: bool = False


class FlightCollection(BaseModel):
    source: str = "opensky"
    count: int = 0
    flights: list[FlightData] = []


# ---------------------------------------------------------------------------
# Earthquakes (USGS)
# ---------------------------------------------------------------------------

class EarthquakeData(SourceAttribution):
    event_id: str
    magnitude: float
    place: str = ""
    longitude: float
    latitude: float
    depth: float = 0.0
    time: datetime
    tsunami: bool = False
    url: str = ""


class EarthquakeCollection(BaseModel):
    source: str = "usgs"
    count: int = 0
    earthquakes: list[EarthquakeData] = []


# ---------------------------------------------------------------------------
# Satellites (CelesTrak / SGP4)
# ---------------------------------------------------------------------------

class SatelliteData(SourceAttribution):
    norad_id: int
    name: str
    longitude: float
    latitude: float
    altitude_km: float
    velocity_km_s: Optional[float] = None


class SatelliteCollection(BaseModel):
    source: str = "celestrak"
    count: int = 0
    satellites: list[SatelliteData] = []


# ---------------------------------------------------------------------------
# Fire Hotspots (FIRMS / INPE Queimadas)
# ---------------------------------------------------------------------------

class FireHotspotData(SourceAttribution):
    latitude: float
    longitude: float
    brightness: Optional[float] = None
    confidence: Optional[str] = None
    acq_date: Optional[str] = None
    acq_time: Optional[str] = None
    frp: Optional[float] = None  # fire radiative power


class FireCollection(BaseModel):
    source: str = "firms"
    count: int = 0
    hotspots: list[FireHotspotData] = []


# ---------------------------------------------------------------------------
# Weather (INMET)
# ---------------------------------------------------------------------------

class WeatherStationData(SourceAttribution):
    station_id: str
    station_name: str = ""
    state: str = ""
    latitude: float = 0.0
    longitude: float = 0.0
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    pressure: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    precipitation: Optional[float] = None
    observation_time: Optional[datetime] = None


class WeatherCollection(BaseModel):
    source: str = "inmet"
    count: int = 0
    stations: list[WeatherStationData] = []


# ---------------------------------------------------------------------------
# Economy (BCB)
# ---------------------------------------------------------------------------

class EconomyIndicator(SourceAttribution):
    indicator: str  # SELIC, IPCA, USD_BRL
    value: float
    date: str
    unit: str = ""


class EconomyCollection(BaseModel):
    source: str = "bcb"
    count: int = 0
    indicators: list[EconomyIndicator] = []


# ---------------------------------------------------------------------------
# Market (Bovespa / yfinance)
# ---------------------------------------------------------------------------

class MarketTick(SourceAttribution):
    symbol: str
    price: float
    change: Optional[float] = None
    change_pct: Optional[float] = None
    volume: Optional[int] = None
    market_cap: Optional[float] = None
    timestamp: Optional[datetime] = None


class MarketCollection(BaseModel):
    source: str = "bovespa"
    count: int = 0
    ticks: list[MarketTick] = []


# ---------------------------------------------------------------------------
# Deforestation (DETER / TerraBrasilis)
# ---------------------------------------------------------------------------

class DeforestationAlert(SourceAttribution):
    alert_id: Optional[str] = None
    date: Optional[str] = None
    area_km2: Optional[float] = None
    municipality: Optional[str] = None
    state: Optional[str] = None
    biome: Optional[str] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    class_name: Optional[str] = None


class DeforestationCollection(BaseModel):
    source: str = "deter"
    count: int = 0
    alerts: list[DeforestationAlert] = []


# ---------------------------------------------------------------------------
# Energy (ONS)
# ---------------------------------------------------------------------------

class EnergySource(SourceAttribution):
    generation_type: str  # hydro, wind, solar, thermal, nuclear
    capacity_mw: Optional[float] = None
    generation_mw: Optional[float] = None
    region: Optional[str] = None
    date: Optional[str] = None


class EnergyCollection(BaseModel):
    source: str = "ons"
    count: int = 0
    sources: list[EnergySource] = []


# ---------------------------------------------------------------------------
# Health (DataSUS)
# ---------------------------------------------------------------------------

class HealthRecord(SourceAttribution):
    disease: str
    cases: int = 0
    deaths: int = 0
    state: Optional[str] = None
    period: Optional[str] = None
    incidence_rate: Optional[float] = None


class HealthCollection(BaseModel):
    source: str = "datasus"
    count: int = 0
    records: list[HealthRecord] = []


# ---------------------------------------------------------------------------
# Elections (TSE)
# ---------------------------------------------------------------------------

class ElectionResult(SourceAttribution):
    year: int
    election_type: str = ""
    state: Optional[str] = None
    candidate: Optional[str] = None
    party: Optional[str] = None
    votes: Optional[int] = None
    elected: Optional[bool] = None


class ElectionCollection(BaseModel):
    source: str = "tse"
    count: int = 0
    results: list[ElectionResult] = []


# ---------------------------------------------------------------------------
# Transparency (Portal da Transparencia)
# ---------------------------------------------------------------------------

class TransparencyRecord(SourceAttribution):
    program: str = ""
    municipality: Optional[str] = None
    state: Optional[str] = None
    amount: Optional[float] = None
    beneficiaries: Optional[int] = None
    month: Optional[str] = None
    year: Optional[int] = None


class TransparencyCollection(BaseModel):
    source: str = "transparencia"
    count: int = 0
    records: list[TransparencyRecord] = []


# ---------------------------------------------------------------------------
# Aggregated intel event
# ---------------------------------------------------------------------------

class IntelEvent(BaseModel):
    source: str
    event_type: str
    title: str
    description: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: Optional[str] = None  # low, medium, high, critical
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    raw_data: Optional[dict[str, Any]] = None


# ---------------------------------------------------------------------------
# Generic SSE payload
# ---------------------------------------------------------------------------

class GenericPayload(BaseModel):
    source: str
    data: Any
    timestamp: datetime = Field(default_factory=datetime.utcnow)
