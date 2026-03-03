# Brazil Intelligence Dashboard — Data Access & API Reference

> A comprehensive guide to programmatically accessing every public data source needed to build a Brazil-focused situational awareness dashboard.

---

## 1. Environment & Climate

### 1.1 Deforestation — INPE PRODES & DETER

INPE provides two complementary systems: **PRODES** (annual mapping since 1988) and **DETER** (daily near-real-time alerts).

| Detail | Value |
|--------|-------|
| **Portal** | [TerraBrasilis](https://terrabrasilis.dpi.inpe.br/en/home-page/) |
| **Download** | https://terrabrasilis.dpi.inpe.br/downloads/ |
| **Format** | Shapefile, GeoJSON, CSV |
| **Auth** | No |
| **Coverage** | Amazon (1988+), Cerrado (2000+), Pantanal (2023+ experimental) |
| **Frequency** | PRODES: Annual · DETER: Daily |
| **License** | CC BY-SA 4.0 |

**Option A — TerraBrasilis WFS (Web Feature Service)**

```
# DETER Amazonia WFS
https://terrabrasilis.dpi.inpe.br/geoserver/deter-amz/wfs

# PRODES Amazonia WFS
https://terrabrasilis.dpi.inpe.br/geoserver/prodes-amz/wfs

# Example: DETER alerts as GeoJSON
GET https://terrabrasilis.dpi.inpe.br/geoserver/deter-amz/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=deter-amz:deter_amz&outputFormat=application/json&count=100
```

**Option B — agrobr Python library (recommended)**

```python
pip install agrobr

from agrobr.sync import desmatamento

# PRODES: Annual deforestation for Mato Grosso
df = desmatamento.prodes(bioma="Cerrado", ano=2022, uf="MT")

# DETER: Real-time alerts for Amazon in Pará
df = desmatamento.deter(bioma="Amazônia", uf="PA",
                         data_inicio="2024-01-01", data_fim="2024-06-30")
```

**Option C — R (datazoom.amazonia)**

```r
install.packages("datazoom.amazonia")
library(datazoom.amazonia)
data <- load_prodes(dataset = "deforestation", raw_data = FALSE, language = "eng")
```

**Dashboard use:** Poll DETER WFS daily → overlay red polygons on map → store PRODES in PostGIS for time-lapse.

---

### 1.2 Fire Hotspots — INPE Queimadas

| Detail | Value |
|--------|-------|
| **Portal** | [BDQueimadas](https://terrabrasilis.dpi.inpe.br/queimadas/bdqueimadas/) |
| **API** | `https://queimadas.dgi.inpe.br/queimadas/dados-abertos/` |
| **Format** | CSV, Shapefile, KML, JSON |
| **Auth** | Email registration for bulk downloads |
| **Frequency** | Multiple times daily |
| **Coverage** | All 6 biomes |

```python
# Via agrobr (recommended)
from agrobr.sync import queimadas
df = queimadas.focos(ano=2024, mes=9, uf="PA", bioma="Amazonia")
# Returns: lat, lon, satellite, date, biome, state, municipality, fire_risk

# Direct: bulk downloads from BDQueimadas portal
# Filter → export CSV → link sent to email (max 1 year per request)
```

**Dashboard use:** Poll every 3 hours → orange/red dots on map, size = fire radiative power.

---

### 1.3 Fire Hotspots — NASA FIRMS

| Detail | Value |
|--------|-------|
| **API** | `https://firms.modaps.eosdis.nasa.gov/api/` |
| **Auth** | MAP_KEY required (free — register at firms.modaps.eosdis.nasa.gov/api/area/) |
| **Format** | CSV, JSON, KML, SHP |
| **Frequency** | Near real-time (~3 hours after satellite overpass) |

```python
import requests

MAP_KEY = "your_map_key_here"

# Active fires in Brazil, last 24 hours (VIIRS sensor)
# Brazil bbox: lat -33.75 to 5.27, lon -73.98 to -34.79
url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/-73.98,-33.75,-34.79,5.27/1"
response = requests.get(url)
# CSV: latitude, longitude, brightness, acq_date, acq_time, satellite, confidence, frp, daynight

# For 10 days of data, change last param to 10:
url_10d = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/-73.98,-33.75,-34.79,5.27/10"

# Sensor options: VIIRS_SNPP_NRT, VIIRS_NOAA20_NRT, MODIS_NRT
```

**Setup:** Register at https://firms.modaps.eosdis.nasa.gov/api/area/ → get MAP_KEY via email → use area endpoint.

---

### 1.4 Land Use — MapBiomas (via Google Earth Engine)

| Detail | Value |
|--------|-------|
| **Platform** | [MapBiomas](https://brasil.mapbiomas.org/en/) |
| **GEE Asset** | `projects/mapbiomas-workspace/public/collection8/mapbiomas_collection80_integration_v1` |
| **Auth** | Google Earth Engine account (free) |
| **Resolution** | 30m (Landsat) / 10m (Sentinel-2) |
| **Coverage** | 1985–present, all of Brazil |

```python
pip install earthengine-api

import ee
ee.Authenticate()
ee.Initialize(project='your-gee-project')

# Load MapBiomas Collection 8
mapbiomas = ee.Image(
    'projects/mapbiomas-workspace/public/collection8/mapbiomas_collection80_integration_v1'
)

# Land use for 2022
lulc_2022 = mapbiomas.select('classification_2022')
# Classes: 3=Forest, 15=Pasture, 39=Soybean, 24=Urban, 33=Water

# Export to Drive
task = ee.batch.Export.image.toDrive(
    image=lulc_2022, description='mapbiomas_2022',
    scale=30, region=brazil_geometry, maxPixels=1e13
)
task.start()
```

**Alternative:** `from agrobr.sync import mapbiomas; df = mapbiomas.cobertura(uf="MT", ano=2022)`

**Dashboard use:** Pre-generate tile layers → time slider for 40-year animation.

---

### 1.5 Weather — INMET (500+ stations)

| Detail | Value |
|--------|-------|
| **API** | `https://apitempo.inmet.gov.br/` |
| **Auth** | Token (free — register at portal.inmet.gov.br) |
| **Format** | JSON |
| **Frequency** | Hourly |
| **Stations** | 500+ automatic stations |

```python
import requests
BASE = "https://apitempo.inmet.gov.br"

# List all automatic stations
stations = requests.get(f"{BASE}/estacoes/T").json()

# Data for São Paulo station A701, January 2024
data = requests.get(f"{BASE}/estacao/dados/A701/2024-01-01/2024-01-31").json()
# Returns: temperature, humidity, pressure, wind_speed, wind_direction, precipitation, radiation
```

**R alternative:** `BrazilMet::download_AWS_INMET(station_id="A701", start_date="2024-01-01", end_date="2024-01-31")`

**Historical mirror:** https://zenodo.org/records/17544339 (full CSV dataset, 500+ stations since 2000)

**Dashboard use:** Poll hourly → station markers with wind barbs → interpolated heatmaps.

---

## 2. Demographics & Geography

### 2.1 Census & Statistics — IBGE Aggregate API (SIDRA)

| Detail | Value |
|--------|-------|
| **API** | `https://servicodados.ibge.gov.br/api/v3/agregados` |
| **Docs** | https://servicodados.ibge.gov.br/api/docs/agregados |
| **Auth** | No |
| **Format** | JSON |
| **Limit** | 100,000 values per request |
| **Levels** | N1=Brazil, N2=Region, N3=State(27), N6=Municipality(5,570+) |

**Key Aggregate IDs:**

| ID | Description |
|----|-------------|
| 6579 | 2022 Census — Population by municipality |
| 4714 | 2022 Census — Housing characteristics |
| 5938 | GDP by state |
| 1712 | Agricultural production (PAM) |
| 7060 | IPCA inflation (monthly) |

```python
import requests
BASE = "https://servicodados.ibge.gov.br/api/v3/agregados"

# Population by municipality (2022 Census)
url = f"{BASE}/6579/periodos/-1/variaveis/9324?localidades=N6"
data = requests.get(url).json()

# GDP by state
url = f"{BASE}/5938/periodos/-1/variaveis/37?localidades=N3"

# Filter: only SP(35) and RJ(33)
url = f"{BASE}/5938/periodos/-1/variaveis/37?localidades=N3[35,33]"
```

**R:** `ibger::ibge_variables(1712, localities = "N3")`

---

### 2.2 Geographic Boundaries — IBGE Localidades & Malhas

| Detail | Value |
|--------|-------|
| **Localidades API** | `https://servicodados.ibge.gov.br/api/v1/localidades/` |
| **Boundaries API** | `https://servicodados.ibge.gov.br/api/v3/malhas/` |
| **Auth** | No |
| **Format** | JSON, GeoJSON |

```python
import requests

# All states
states = requests.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados").json()

# Municipalities in São Paulo
munis = requests.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados/35/municipios").json()

# State boundary as GeoJSON
geojson = requests.get(
    "https://servicodados.ibge.gov.br/api/v3/malhas/estados/35",
    params={"formato": "application/vnd.geo+json", "resolucao": 2}
).json()

# All municipality boundaries
geojson_br = requests.get(
    "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR",
    params={"formato": "application/vnd.geo+json", "intrarregiao": "municipio"}
).json()
```

**Dashboard use:** Base layer for all choropleth maps. Enable drill-down: region → state → municipality.

---

## 3. Transportation & Mobility

### 3.1 Flight Tracking — OpenSky Network (ADS-B)

| Detail | Value |
|--------|-------|
| **API** | `https://opensky-network.org/api` |
| **Auth** | Optional (anonymous: 400 credits/day, registered: 4,000/day) |
| **Format** | JSON |
| **Frequency** | Every 5–10 seconds |

**Setup:** Register at https://opensky-network.org → Settings → API Clients → create client_id/secret → use OAuth2.

```python
import requests

# Anonymous: aircraft over Brazil right now
url = "https://opensky-network.org/api/states/all"
params = {"lamin": -33.75, "lamax": 5.27, "lomin": -73.98, "lomax": -34.79}
data = requests.get(url, params=params).json()
# state vector: [icao24, callsign, origin_country, time_position,
#   last_contact, longitude, latitude, baro_altitude, on_ground,
#   velocity, true_track, vertical_rate, sensors, geo_altitude,
#   squawk, spi, position_source, category]

# Authenticated (OAuth2):
TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"
token = requests.post(TOKEN_URL, data={
    "grant_type": "client_credentials",
    "client_id": "YOUR_CLIENT_ID", "client_secret": "YOUR_CLIENT_SECRET"
}).json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
data = requests.get(url, params=params, headers=headers).json()

# Arrivals at GRU (Guarulhos)
arrivals = requests.get(
    "https://opensky-network.org/api/flights/arrival",
    params={"airport": "SBGR", "begin": 1709251200, "end": 1709254800},
    headers=headers
).json()
```

**Key Brazilian airports:** SBGR (Guarulhos), SBGL (Galeão/Rio), SBSP (Congonhas), SBBR (Brasília), SBCF (Confins/BH), SBSV (Salvador)

**Dashboard use:** Poll every 10s → aircraft icons with heading → color by type (commercial/military/helicopter).

---

### 3.2 Maritime Vessel Tracking — AIS

| Source | URL | Access |
|--------|-----|--------|
| OECD Dashboard | oecd.org/dashboards/monitoring-maritime-trade | Free (aggregated) |
| AIS Hub | aishub.net | Free if contributing |
| MarineTraffic | marinetraffic.com | Limited free / paid API |
| VesselFinder | vesselfinder.com | Limited free |

**Key Brazilian ports:** Santos (BRSSZ), Paranaguá (BRPNG), Rio de Janeiro (BRRIO), Itaqui (BRITQ), Tubarão (BRVIX)

**Dashboard use:** Embed VesselFinder map or use OECD data for trade flow analysis.

---

### 3.3 Live Cameras

| Source | URL |
|--------|-----|
| Skyline Webcams | skylinewebcams.com/en/webcam/brasil.html |
| WorldCam | worldcam.eu/webcams/south-america/brazil |
| CET-SP (SP traffic) | cameras.cetsp.com.br |

**Dashboard use:** Map pins → click to open live feed (embed via iframe or HLS stream).

---

## 4. Economy & Finance

### 4.1 Central Bank — BCB SGS API (18,000+ series)

| Detail | Value |
|--------|-------|
| **API** | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.{code}/dados` |
| **Auth** | No |
| **Format** | JSON, CSV |

**Key series:** 432=IPCA monthly, 433=IPCA 12mo, 4390=USD/BRL, 4189=SELIC, 4391=EUR/BRL, 1=CDI

```python
# Option 1: pysgs (recommended)
pip install pysgs
from sgs import dataframe
df = dataframe([4189, 433], start='01/01/2020', end='01/01/2026')

# Option 2: BacenAPI
pip install BacenAPI
from BacenAPI import bacen_search, bacen_url, bacen_series
urls = bacen_url(series=[433, 4390], start_date="01/01/2020", end_date="01/01/2026")
df = bacen_series(urls)

# Option 3: Direct HTTP
import requests
url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4189/dados?formato=json&dataInicial=01/01/2020&dataFinal=01/01/2026"
data = requests.get(url).json()
# [{"data": "02/01/2020", "valor": "4.50"}, ...]
```

---

### 4.2 Stock Market — B3 / Bovespa

| Method | Details |
|--------|---------|
| **yfinance** | `pip install yfinance` — free, no API key |
| **brapi.dev** | https://brapi.dev/docs — free tier with token |
| **Twelve Data** | https://twelvedata.com — 800 free credits/day |

```python
import yfinance as yf

ibov = yf.download("^BVSP", period="1mo", interval="1d")           # IBOVESPA
petrobras = yf.download("PETR4.SA", period="1d", interval="5m")    # Add .SA suffix
vale = yf.download("VALE3.SA", period="1d", interval="5m")

# brapi.dev
import requests
url = "https://brapi.dev/api/quote/PETR4,VALE3,ITUB4?token=YOUR_TOKEN"
data = requests.get(url).json()
```

---

### 4.3 Government Spending — Portal da Transparência

| Detail | Value |
|--------|-------|
| **API** | `https://api.portaldatransparencia.gov.br/api-de-dados/` |
| **Docs** | https://portaldatransparencia.gov.br/api-de-dados |
| **Auth** | Free API key (register on portal) |

```python
import requests
API_KEY = "your_api_key"
BASE = "https://api.portaldatransparencia.gov.br/api-de-dados"
headers = {"chave-api-dados": API_KEY}

# Spending by agency
data = requests.get(f"{BASE}/despesas/por-orgao", headers=headers, params={"ano": 2024, "pagina": 1}).json()

# Bolsa Família by municipality
data = requests.get(f"{BASE}/bolsa-familia-por-municipio", headers=headers,
                     params={"mesAno": "202401", "codigoIbge": "3550308", "pagina": 1}).json()
```

---

## 5. Health

### 5.1 Public Health — DataSUS

| Detail | Value |
|--------|-------|
| **FTP** | `ftp://ftp.datasus.gov.br` |
| **TabNet** | https://datasus.saude.gov.br/informacoes-de-saude-tabnet/ |
| **Format** | DBC → CSV |
| **Auth** | No |

```python
# Recommended: datasus-db (imports to DuckDB)
pip install datasus-db
import datasus_db

datasus_db.import_sim_do()   # Mortality (SIM)
datasus_db.import_sih_rd()   # Hospital admissions (SIH)
datasus_db.import_sia_pa()   # Ambulatory (SIA)
datasus_db.import_ibge_pop() # Population

import duckdb
conn = duckdb.connect("datasus.db")
df = conn.execute("SELECT * FROM sim_do LIMIT 10").fetchdf()

# Alternative: PySUS
pip install PySUS
from pysus.online_data.SIM import download
df = download("sp", 2020)
```

**R:** `datazoom.saude` (GitHub), `datasus` (CRAN), `healthbR` (CRAN)

---

## 6. Elections

### 6.1 Electoral Data — TSE

| Detail | Value |
|--------|-------|
| **Portal** | https://dadosabertos.tse.jus.br |
| **API** | CKAN: `https://dadosabertos.tse.jus.br/api/3/` |
| **Auth** | No |
| **Coverage** | 1998–2024 |

```python
import requests

# List datasets
datasets = requests.get("https://dadosabertos.tse.jus.br/api/3/action/package_list").json()

# Get 2024 results metadata
meta = requests.get("https://dadosabertos.tse.jus.br/api/3/action/package_show?id=resultados-2024").json()
for r in meta["result"]["resources"]:
    print(r["url"])  # Direct CSV download URLs

# CepespData (FGV — cleaned data)
pip install cepespdata
from cepespdata import CepespData
cepesp = CepespData()
df = cepesp.get_votes(year=2022, position="Presidente", regional_aggregation="Municipio")
```

**R:** `electionsBR::vote_mun_zone_fed(year = 2022)`

---

## 7. Seismology

### 7.1 Earthquakes — RSBR / USP + USGS

| Detail | Value |
|--------|-------|
| **USP Center** | http://moho.iag.usp.br/ |
| **Protocol** | FDSN Web Services |
| **USGS API** | https://earthquake.usgs.gov/fdsnws/event/1/ |
| **Auth** | No |

```python
# ObsPy — seismology library
pip install obspy
from obspy.clients.fdsn import Client
from obspy import UTCDateTime

client = Client("USP")
events = client.get_events(
    starttime=UTCDateTime("2024-01-01"), endtime=UTCDateTime("2024-12-31"),
    minlatitude=-33.75, maxlatitude=5.27,
    minlongitude=-73.98, maxlongitude=-34.79,
    minmagnitude=2.0
)

# USGS (simpler, global)
import requests
params = {
    "format": "geojson", "starttime": "2024-01-01", "endtime": "2024-12-31",
    "minlatitude": -33.75, "maxlatitude": 5.27,
    "minlongitude": -73.98, "maxlongitude": -34.79, "minmagnitude": 2.0
}
quakes = requests.get("https://earthquake.usgs.gov/fdsnws/event/1/query", params=params).json()
```

---

## 8. Satellite & Space

### 8.1 Satellite Orbits — CelesTrak / Space-Track

| Source | Auth |
|--------|------|
| CelesTrak (celestrak.org) | No |
| Space-Track (space-track.org) | Free registration |

```python
# CelesTrak — no auth
import requests
sats = requests.get("https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json").json()

# Space-Track — auth required
pip install spacetrack
from spacetrack import SpaceTrackClient
st = SpaceTrackClient(identity='email', password='pass')
tles = st.tle_latest(norad_cat_id=[44337, 47699], format='json')
# 44337=CBERS-4A, 47699=Amazonia-1
```

### 8.2 Space Weather — INPE EMBRACE

Portal: http://www2.inpe.br/climaespacial/portal/en/ — download CSV/TXT for geomagnetic and ionospheric data (South Atlantic Anomaly focus).

---

## 9. Energy

### 9.1 Electricity Grid — ONS / ANEEL

| Source | URL |
|--------|-----|
| ONS Open Data | https://dados.ons.org.br/ |
| ANEEL Open Data | https://dadosabertos.aneel.gov.br/ |

```python
import requests

# ANEEL CKAN API
datasets = requests.get("https://dadosabertos.aneel.gov.br/api/3/action/package_list").json()

# SIGA generation capacity
meta = requests.get(
    "https://dadosabertos.aneel.gov.br/api/3/action/package_show?id=siga-sistema-de-informacoes-de-geracao-da-aneel"
).json()

# ONS: CSV downloads from https://dados.ons.org.br/
# Datasets: generation by source, demand, reservoir levels, interchange
```

---

## 10. Aggregated / Multi-Source

### 10.1 BrasilAPI (no auth, community-driven)

**Base:** `https://brasilapi.com.br/api/` · **Docs:** https://brasilapi.com.br/docs

```python
import requests
B = "https://brasilapi.com.br/api"

requests.get(f"{B}/cep/v2/01001000").json()           # Postal code
requests.get(f"{B}/banks/v1").json()                    # Banks
requests.get(f"{B}/cnpj/v1/19131243000197").json()      # Company by CNPJ
requests.get(f"{B}/taxas/v1").json()                    # CDI, SELIC, IPCA
requests.get(f"{B}/feriados/v1/2026").json()            # Holidays
requests.get(f"{B}/ibge/municipios/v1/SP").json()       # Municipalities
requests.get(f"{B}/ddd/v1/11").json()                   # Area codes
```

### 10.2 agrobr — 25 Sources in One Library

**Install:** `pip install agrobr` · **Docs:** https://agrobr.dev/docs · **GitHub:** https://github.com/bruno-portfolio/agrobr

Sources: MapBiomas, PRODES, DETER, SICAR (rural properties via WFS), NASA POWER, IBGE PAM, IBGE Census, Queimadas, + 17 more.

```python
from agrobr.sync import desmatamento, mapbiomas, queimadas, ibge

desmatamento.prodes(bioma="Cerrado", ano=2022, uf="MT")
desmatamento.deter(bioma="Amazônia", uf="PA")
mapbiomas.cobertura(uf="MT", ano=2022)
queimadas.focos(ano=2024, mes=9, uf="PA", bioma="Amazonia")
ibge.pam(produto="soja", ano=2022, nivel="municipio")
```

Also has an **MCP server** (`agrobr-mcp`) for connecting Claude/Cursor to Brazilian data via natural language.

---

## 11. Dashboard Architecture

### Recommended Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React/Next.js + Deck.gl or CesiumJS (3D) + Mapbox GL (2D) |
| **Charts** | Plotly / D3.js |
| **Real-time** | WebSocket (Socket.io / FastAPI WebSocket) |
| **Backend** | FastAPI (Python) or Node.js |
| **Cache** | Redis (hot data: flights, weather, markets) |
| **Geo DB** | PostgreSQL + PostGIS |
| **Time Series** | TimescaleDB |
| **Analytics** | DuckDB (DataSUS, elections, bulk analysis) |
| **AI Layer** | LLM with tool-use across all feeds (like SitDeck's AI Analyst) |

### Polling Schedule

| Source | Interval | Auth |
|--------|----------|------|
| OpenSky (flights) | 10s | OAuth2 (free) |
| B3 (stocks) | 15s (market hours) | None / API key |
| USGS (earthquakes) | 5 min | None |
| NASA FIRMS (fires) | 3 hrs | MAP_KEY (free) |
| INMET (weather) | 1 hr | Token (free) |
| BCB (economic) | Daily | None |
| DETER (deforestation) | Daily | None |
| Queimadas (INPE fires) | 3 hrs | Email reg |
| TSE (elections) | On-demand | None |
| DataSUS (health) | Monthly | None |
| ONS (energy) | Daily | None |
| CelesTrak (satellites) | 6 hrs | None |
| Transparência (spending) | Monthly | API key (free) |

### Quick-Start MVP (Weekend Build)

Get a working prototype with zero paid APIs:

1. **Map base:** Mapbox GL JS + IBGE boundary GeoJSON (no auth)
2. **Flights:** OpenSky anonymous API (poll every 10s)
3. **Fires:** NASA FIRMS (free MAP_KEY, poll every 3 hrs)
4. **Weather:** INMET API (free token, poll hourly)
5. **Markets:** yfinance (no auth, poll every 15s during market hours)
6. **Earthquakes:** USGS GeoJSON API (no auth, poll every 5 min)

These 6 layers = a compelling demo with minimal setup. Add deforestation (DETER WFS) and economic data (BCB SGS) for depth.
