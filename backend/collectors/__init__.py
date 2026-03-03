from __future__ import annotations

"""All data collectors for the Brazil Intelligence Dashboard."""

from backend.collectors.opensky import OpenSkyCollector
from backend.collectors.usgs import USGSCollector
from backend.collectors.celestrak import CelesTrakCollector
from backend.collectors.firms import FIRMSCollector
from backend.collectors.queimadas import QueimadasCollector
from backend.collectors.inmet import INMETCollector
from backend.collectors.bcb import BCBCollector
from backend.collectors.bovespa import BovespaCollector
from backend.collectors.deter import DETERCollector
from backend.collectors.ibge import IBGECollector
from backend.collectors.ons import ONSCollector
from backend.collectors.datasus import DataSUSCollector
from backend.collectors.tse import TSECollector
from backend.collectors.transparencia import TransparenciaCollector
from backend.collectors.brasilapi import BrasilAPICollector

ALL_COLLECTORS = {
    "opensky": OpenSkyCollector,
    "usgs": USGSCollector,
    "celestrak": CelesTrakCollector,
    "firms": FIRMSCollector,
    "queimadas": QueimadasCollector,
    "inmet": INMETCollector,
    "bcb": BCBCollector,
    "bovespa": BovespaCollector,
    "deter": DETERCollector,
    "ibge": IBGECollector,
    "ons": ONSCollector,
    "datasus": DataSUSCollector,
    "tse": TSECollector,
    "transparencia": TransparenciaCollector,
    "brasilapi": BrasilAPICollector,
}

__all__ = [
    "ALL_COLLECTORS",
    "OpenSkyCollector",
    "USGSCollector",
    "CelesTrakCollector",
    "FIRMSCollector",
    "QueimadasCollector",
    "INMETCollector",
    "BCBCollector",
    "BovespaCollector",
    "DETERCollector",
    "IBGECollector",
    "ONSCollector",
    "DataSUSCollector",
    "TSECollector",
    "TransparenciaCollector",
    "BrasilAPICollector",
]
