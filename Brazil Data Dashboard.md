# Building a Brazil Intelligence Dashboard: Public Data Sources & Visualization Blueprint

## Overview

Brazil is one of the most data-rich countries in the world for open public information. Between government transparency mandates (Lei de Acesso à Informação, 2011), satellite monitoring programs from INPE, the Dados Abertos portal, and global open data feeds, there is an extraordinary volume of real-time and historical data available — all free, all public. This document catalogs every major public data source available for Brazil and maps each to specific visualization and experience concepts for a WorldView/SitDeck-style intelligence dashboard.[^1][^2]

***

## Environment & Climate

### Deforestation Monitoring (INPE — PRODES & DETER)

INPE operates two complementary satellite systems. **PRODES** produces annual deforestation maps at 30m resolution using Landsat imagery, covering the Legal Amazon since 1988. **DETER** provides daily near-real-time deforestation alerts using MODIS satellite imagery at 250m resolution, feeding directly to enforcement agencies like IBAMA. Both datasets are open access and downloadable.[^3][^4][^5]

- **Data**: Annual deforestation polygons (PRODES), daily alert polygons (DETER), classified by type (clear-cut, degradation, logging)[^6]
- **Coverage**: Legal Amazon + Cerrado biome (DETER-B since 2018)[^6]
- **Access**: terrabrasilis.dpi.inpe.br, INPE APIs, datazoom.amazonia R package

**Visualization concepts**:
- Animated time-lapse heatmap of deforestation from 1988 to present, biome by biome
- Live alert layer showing new DETER deforestation polygons updated daily
- Municipality-level deforestation leaderboard with year-over-year trends

### Fire Hotspots (INPE Queimadas + NASA FIRMS)

INPE's Queimadas program has monitored fire hotspots since 1998 using 13+ satellites, detecting thermal radiation signatures across all six Brazilian biomes. NASA's FIRMS system provides complementary global fire data with download APIs.[^7][^8][^9]

- **Data**: Latitude/longitude of active fire hotspots, fire risk indexes, satellite source, timestamp, biome, state[^10]
- **Coverage**: All of Brazil, updated multiple times daily
- **Access**: queimadas.dgi.inpe.br, NASA FIRMS API, BDQueimadas portal

**Visualization concepts**:
- Real-time fire hotspot overlay on the map with color-coded risk levels
- Historical fire season comparison animations (dry season August–October)
- Fire-deforestation correlation layer (overlay DETER alerts with fire hotspots)

### Land Use & Land Cover (MapBiomas)

MapBiomas produces annual 30m-resolution land use/land cover maps for all of Brazil from 1985 to present using Landsat imagery and machine learning on Google Earth Engine. A newer 10m-resolution product uses Sentinel-2 imagery.[^11][^12][^13]

- **Data**: Pixel-level classification — forest, agriculture, pasture, water, urban, etc. — for every year since 1985[^13]
- **Coverage**: Entire national territory, all six biomes
- **Access**: Google Earth Engine catalog, MapBiomas platform downloads

**Visualization concepts**:
- Time-slider showing 40 years of land use change, with agriculture and urban sprawl visually expanding
- Biome-level "health score" dashboard tracking forest vs. pasture ratios
- Transition maps showing what deforested areas become (forest → pasture → agriculture)

### Weather & Meteorology (INMET)

Brazil's National Institute of Meteorology (INMET) operates 500+ automatic weather stations (AWS) reporting hourly data. Variables include temperature, humidity, atmospheric pressure, radiation, wind speed/direction, rainfall, and more.[^14][^15]

- **Data**: Hourly temperature, humidity, pressure, radiation, wind, precipitation per station[^15]
- **Coverage**: All regions of Brazil, stations since 2000
- **Access**: INMET API, BrazilMet R package, Zenodo mirror datasets[^14][^15]

**Visualization concepts**:
- Real-time weather station map with animated wind flow patterns
- Drought/flood risk overlay combining rainfall anomalies with river levels
- Historical climate trends by region (warming, drying patterns)

***

## Geospatial & Demographic

### Census & Demographics (IBGE)

The Brazilian Institute of Geography and Statistics (IBGE) provides comprehensive APIs covering population census, household income, geographic hierarchies (states, municipalities, enumeration areas), and socioeconomic indicators. The 2022 Census is the latest, covering all 5,570+ municipalities.[^16][^17]

- **Data**: Population by municipality/enumeration area, housing units, income levels, education, age distribution[^17][^16]
- **Coverage**: National, state, municipality, enumeration area levels
- **Access**: servicodados.ibge.gov.br API (REST/JSON), SIDRA aggregate data API[^18]

**Visualization concepts**:
- Choropleth maps of population density, income inequality (Gini), education levels by municipality
- Demographic pyramid animations showing Brazil's aging population over decades
- Urban vs. rural migration flow maps

### Geographic & Administrative Boundaries (IBGE)

IBGE provides complete geographic APIs with state, municipality, micro/mesoregion, immediate/intermediate region hierarchies.[^18]

- **Data**: Administrative boundaries at all levels, geographic coordinates, region codes[^18]
- **Coverage**: 27 states, 5,570+ municipalities, enumeration areas
- **Access**: IBGE Geography API

**Visualization concepts**:
- Base layer for all other visualizations — interactive drill-down from region → state → municipality
- 3D terrain model with administrative overlay

***

## Transportation & Mobility

### Aviation / Flight Tracking (ADS-B — OpenSky Network)

ADS-B data from the OpenSky Network provides real-time positions, altitudes, speeds, and callsigns for aircraft in Brazilian airspace. FlightRadar24 offers additional commercial coverage.[^19][^20]

- **Data**: Latitude/longitude, altitude, speed, heading, callsign, aircraft type, ICAO code[^19]
- **Coverage**: Dense around major airports (GRU, GIG, CGH, BSB), variable in remote areas
- **Access**: OpenSky REST API (free with registration), ADS-B Exchange

**Visualization concepts**:
- Live aircraft overlay on 3D globe with altitude-coded flight paths
- Airport congestion heatmap (arrivals/departures per hour for major hubs)
- Military vs. commercial aircraft filter layer

### Maritime / Vessel Tracking (AIS)

AIS (Automatic Identification System) data tracks vessel positions globally, including Brazilian ports like Santos, Paranaguá, Rio de Janeiro, and Itaqui. The OECD provides an open AIS vessel tracking dashboard.[^21][^22][^23]

- **Data**: Vessel position, speed, heading, type, destination, ETA, IMO number[^22]
- **Coverage**: All major Brazilian ports and coastal waters[^23]
- **Access**: OECD AIS Dashboard (free), MarineTraffic (limited free tier), VesselFinder

**Visualization concepts**:
- Live shipping lane visualization around Brazilian coast
- Port congestion monitor (ships in port, waiting at anchor, average dwell time)
- Commodity flow tracker — iron ore, soybeans, oil tankers by route

### Live Traffic & City Cameras

Brazilian cities have extensive public CCTV and traffic camera networks. Platforms like Skyline Webcams, WorldCam, and WebcamHopper aggregate hundreds of publicly accessible feeds from airports, beaches, city centers, and highways.[^24][^25][^26]

- **Data**: Live video streams from public webcams
- **Coverage**: São Paulo, Rio, Belo Horizonte, Manaus, Porto Alegre, Recife, beach towns[^24]
- **Access**: Skyline Webcams API, WorldCam, individual city traffic portals

**Visualization concepts**:
- Camera thumbnail grid showing live feeds from major cities
- Map-pinned camera icons with click-to-view video popups (like WorldView's CCTV overlay)
- Beach/tourism condition monitor (weather + live cam + crowd density)

***

## Economy & Finance

### Stock Market (B3 — Bovespa)

Brazil's stock exchange (B3) provides real-time and historical market data for equities, derivatives, commodities, and indices like IBOVESPA. Multiple API providers offer access.[^27][^28]

- **Data**: Real-time quotes, IBOVESPA index, trading volume, corporate actions, derivatives[^27]
- **Coverage**: All B3-listed instruments
- **Access**: Twelve Data API, EODHD API, Trading Economics, B3 market data platform[^29][^30]

**Visualization concepts**:
- Live IBOVESPA ticker with sector heatmap (Treemap style)
- Brazilian ADR vs. local share comparison
- Commodities dashboard (sugar, coffee, soybeans, iron ore prices — all critical Brazilian exports)

### Central Bank Economic Indicators (BCB)

The Banco Central do Brasil provides APIs for interest rates (SELIC), inflation (IPCA), exchange rates (USD/BRL), GDP, credit data, and PIX transaction volumes. BrasilAPI aggregates key rates like CDI, SELIC, and IPCA.[^31][^32]

- **Data**: SELIC, CDI, IPCA, USD/BRL, GDP, credit, reserves, PIX statistics[^31]
- **Coverage**: Historical time series (some going back decades)
- **Access**: BCB SGS API, BrasilAPI /taxas endpoint, World Bank API[^33]

**Visualization concepts**:
- Live economic dashboard: SELIC rate, USD/BRL, IPCA inflation, IBOVESPA in one panel
- PIX adoption curve visualization (billions of transactions since 2020)[^34]
- Interest rate vs. inflation historical overlay

### Government Spending (Portal da Transparência)

Brazil's Transparency Portal publishes all federal government expenditures — contracts, transfers to states/municipalities, social program beneficiaries (Bolsa Família), public servant salaries, and government credit card spending.[^35][^36][^37]

- **Data**: Federal spending by agency, transfers to municipalities, Bolsa Família payments, salaries, credit card expenses[^37]
- **Coverage**: All federal government spending
- **Access**: Portal da Transparência API, dados.gov.br, Apify scraper[^38]

**Visualization concepts**:
- Federal spending flow diagram (Sankey chart: revenue sources → ministries → programs)
- Municipality-level transfer tracker with per-capita analysis
- Anomaly detector highlighting unusual spending patterns (corruption signal)

***

## Public Safety & Seismology

### Earthquake Monitoring (RSBR)

The Brazilian Seismographic Network (RSBR) operates 84 broadband stations across the country, maintained by four research institutions (USP, UnB, UFRN, National Observatory). While Brazil has low seismicity, events up to M5+ do occur.[^39][^40][^41]

- **Data**: Real-time seismic waveforms, earthquake locations, magnitudes, depths[^39]
- **Coverage**: 84 stations nationally, real-time transmission via satellite/3G[^40]
- **Access**: FDSN web services, SeisComP3 SeedLink/ArcLink servers, open access[^39]

**Visualization concepts**:
- Real-time seismic event pins on the map with magnitude-scaled icons
- Historical earthquake timeline for Brazil (1986 João Câmara to present)[^41]
- Station health monitor showing which RSBR nodes are transmitting

### Crime & Public Safety Data

Brazilian states publish crime statistics through their security secretariats. São Paulo's SSP-SP portal provides monthly crime data by municipality. Federal data on homicide rates and public safety is available through IBGE and the Ministry of Justice.

- **Data**: Homicide rates, robbery, vehicle theft, domestic violence — by state/municipality
- **Coverage**: Varies by state (São Paulo most complete)
- **Access**: State security secretariat portals, dados.gov.br

**Visualization concepts**:
- Crime heatmap by municipality with year-over-year trend arrows
- Safe city index comparing major metros
- Correlation layer: crime rates vs. income/unemployment/education

***

## Health & Social

### Public Health (DataSUS / RNDS)

DataSUS manages health data for Brazil's universal health system (SUS), which serves ~72% of the population (164M people). The National Health Data Network (RNDS), launched in 2020, is building FHIR-based interoperability for nationwide health data sharing. The healthbR R package provides access to VIGITEL and other public health datasets.[^42][^43][^44]

- **Data**: Disease notifications, vaccination coverage, hospital capacity, mortality data, chronic disease surveillance[^44][^42]
- **Coverage**: All municipalities via SUS infrastructure
- **Access**: DataSUS TabNet, healthbR package, RNDS (FHIR API)[^45][^44]

**Visualization concepts**:
- Disease outbreak tracker (dengue, malaria, Zika) with real-time notification overlay
- Vaccination coverage map by municipality
- Hospital bed capacity and ICU availability dashboard

***

## Elections & Governance

### Electoral Data (TSE)

The Superior Electoral Court (TSE) publishes comprehensive data on all Brazilian elections — votes by candidate/party/zone, candidate profiles, campaign finance, and voter demographics. Data goes back to 1998 in machine-readable format.[^46][^47][^48]

- **Data**: Votes by candidate/party at section/zone/municipality level, candidate profiles, financial disclosures, voter registration statistics[^48][^46]
- **Coverage**: All elections 1998–2024, monthly electorate statistics[^48]
- **Access**: TSE open data repository, electionsBR R package, CepespData API[^47][^46]

**Visualization concepts**:
- Election results explorer: interactive map with vote share by municipality for any election
- Political party strength evolution from 1998 to present
- Campaign finance flow visualization (donor → party → candidate)

***

## Energy & Infrastructure

### Electricity Grid (ONS / ANEEL)

Brazil's National Electric System Operator (ONS) manages the interconnected power grid, while ANEEL regulates ~100 distribution companies, 380 transmission companies, and 5,000+ generation facilities. The sector is entering an Open Energy data portability era with ANEEL's 2025-2026 regulation.[^49][^50]

- **Data**: Generation by source (hydro, wind, solar, thermal), transmission capacity, distribution metrics, reservoir levels[^49]
- **Coverage**: National interconnected grid
- **Access**: ONS data portal, ANEEL SIGA database, Open Energy APIs (launching 2025-2026)[^50]

**Visualization concepts**:
- Real-time energy generation mix (hydro vs. wind vs. solar vs. thermal) as animated pie/area chart
- Reservoir level monitor for major hydroelectric dams (critical for energy security)
- Renewable energy growth tracker showing wind/solar expansion year by year

***

## Satellite & Space

### Satellite Tracking (Public TLE/Space-Track)

Public two-line element (TLE) data from Space-Track and CelesTrak provide orbital positions for thousands of satellites, including Brazilian satellites (CBERS, Amazonia-1) and the ISS. INPE's EMBRACE program monitors space weather affecting Brazil's ionosphere.[^51]

- **Data**: Satellite orbital elements, space weather indices, geomagnetic data[^51]
- **Coverage**: Global (all tracked objects), focus on South Atlantic Anomaly region
- **Access**: Space-Track.org, CelesTrak, EMBRACE/INPE portal[^51]

**Visualization concepts**:
- Live satellite orbit visualization over Brazilian territory (especially CBERS, Amazonia-1)
- South Atlantic Anomaly radiation overlay
- Space weather dashboard showing geomagnetic storm alerts

***

## Aggregate Data Hub (BrasilAPI)

BrasilAPI is a community-driven REST API that aggregates multiple Brazilian public data sources into a single interface. It provides endpoints for postal codes (CEP), bank listings, company registration (CNPJ), economic rates, vehicle data (FIPE), municipalities, holidays, and more.[^52][^31]

- **Access**: brasilapi.com.br (free, no auth required for most endpoints)

***

## Experience Concepts: Putting It All Together

Beyond individual data layers, combining these sources enables powerful composite experiences:

| Experience | Data Sources Combined | Description |
|---|---|---|
| **"Amazon Watch"** | DETER + Queimadas + MapBiomas + Weather | Real-time Amazon rainforest monitoring room: deforestation alerts, fire hotspots, land use change, and weather conditions in one view |
| **"Brazil Pulse"** | IBOVESPA + USD/BRL + SELIC + PIX + Transparência | Live economic situation room with market data, interest rates, government spending flows, and PIX adoption metrics |
| **"São Paulo Command Center"** | Traffic cameras + ADS-B + Weather + Crime + Air quality | Single-city deep dive with live feeds, flight paths over the city, weather overlay, and safety data |
| **"Port & Trade Monitor"** | AIS vessels + B3 commodities + Port cameras | Track commodity exports from farm to port to ship — soybeans, iron ore, coffee, sugar |
| **"Election War Room"** | TSE results + Demographics + Income + Bolsa Família | Map election outcomes against socioeconomic indicators to visualize political geography |
| **"Climate & Energy"** | Weather + Reservoir levels + Energy generation + Fire risk | Monitor how weather drives energy production (hydro depends on rain) and fire risk simultaneously |
| **"Deforestation vs. Economy"** | PRODES + MapBiomas + Agricultural production + Exports | Correlate deforestation patterns with agricultural expansion and commodity prices |

***

## Technical Architecture Notes

A Brazil-focused dashboard could be built using a similar stack to what Bilawal Sidhu and Dan Ushman used:

- **Frontend**: React/Next.js with Mapbox GL, Deck.gl, or CesiumJS for 3D globe rendering
- **Data ingestion**: Python/Node.js workers polling each API on appropriate intervals (weather: hourly, fires: every 3 hours, flights: every 10 seconds, markets: real-time WebSocket)
- **Backend**: Lightweight API gateway aggregating all feeds, with Redis cache for high-frequency data
- **AI layer**: LLM-powered analyst (like SitDeck's) that can answer natural language queries across all feeds — "What's happening in the Amazon right now?" or "Show me the biggest deforestation hotspots this month"
- **Storage**: PostgreSQL/PostGIS for geospatial data, TimescaleDB for time series

Most of these APIs are free and don't require authentication, or only require basic registration. The hardest engineering challenge isn't accessing the data — it's designing a coherent UX that makes dozens of simultaneous feeds comprehensible on one screen.

---

## References

1. [API Portal de Dados Abertos — Catálogo de APIs governamentais](https://www.gov.br/conecta/catalogo/apis/api-portal-de-dados-abertos) - A API do Portal Brasileiro de Dados Abertos permite acessar informações sobre conjuntos de dados púb...

2. [[PDF] Open Data Observatory in Brazil: An Academic Initiative](https://www.iastatedigitalpress.com/jlsc/article/18312/galley/17677/view/) - Catálogo de dados para descoberta e recuperação de dados abertos: Uma solução baseada em APIs govern...

3. [How is deforestation in the Amazon monitored?](https://ipam.org.br/entenda/how-is-deforestation-in-the-amazon-monitored/) - Two systems are used to monitor deforestation: Real-Time System for Detection of Deforestation (DETE...

4. [Prodes and Deter: get to know these strategic systems in ...](https://infoamazonia.org/en/2022/02/15/prodes-and-deter-systems-against-deforestation-amazon/) - While Prodes generates annual deforestation rates, Deter makes daily alerts to improve monitoring ag...

5. [Multiple systems use satellites to monitor deforestation in ...](https://revistapesquisa.fapesp.br/en/multiple-systems-use-satellites-to-monitor-deforestation-in-the-amazon/) - In 2004, INPE's Real-Time Deforestation Detection System (DETER) began operating alongside PRODES, i...

6. [Simplify Access to Data from the Amazon Region • datazoom ...](https://datazoom.com.br/datazoom.amazonia/) - PRODES. The PRODES project uses satellites to monitor deforestation in Brazil's Legal Amazon. The ra...

7. [How to monitor forest fires](https://revistapesquisa.fapesp.br/en/how-to-monitor-forest-fires-2/) - Since 1986, INPE's Queimadas program has been mapping Brazilian territory using satellites that dete...

8. [agrobr — Python library unifying 25 Brazilian agricultural ... - Reddit](https://www.reddit.com/r/gis/comments/1reg6qk/agrobr_python_library_unifying_25_brazilian/) - Queimadas/INPE — Fire hotspots by satellite (6 biomes, 13 satellites). NASA POWER — Daily/monthly cl...

9. [Download global wildfire data from NASA FIRMS and open in QGIS](https://www.youtube.com/watch?v=YKw5eKKUmyY) - NASA's FIRMS (Fire Information for Resource Management System) system allows you to download data wi...

10. [Fire Database - Data Basis](https://data-basis.org/dataset/f06f3cdc-b539-409b-b311-1ff8878fb8d9) - Hundreds of open datasets for you to explore however you like. Download or access processed data rea...

11. [MapBiomas Case Study | Google Cloud](https://cloud.google.com/customers/mapbiomas) - MapBiomas uses Google Earth Engine and Google Cloud Platform to analyze satellite data and produce l...

12. [Products - MapBiomas Brasil](https://brasil.mapbiomas.org/en/produtos/) - Land Use and Land Cover 10 Meters Maps. beta collection of maps using Sentinel-2 satellite images wi...

13. [MapBiomas Land Use and Land Cover - Brazil V1.0](https://developers.google.com/earth-engine/datasets/catalog/projects_mapbiomas-public_assets_brazil_lulc_v1) - MapBiomas Land Use and Land Cover (LULC) dataset for Brazil is produced annually by the MapBiomas Pr...

14. [[PDF] BrazilMet: Download and Processing of Automatic Weather Stations ...](https://cran.r-project.org/web/packages/BrazilMet/BrazilMet.pdf) - This function will download the hourly AWS data of INMET for whatever station of interest, based on ...

15. [Meteorological time series in Brazil - automatic stations](https://zenodo.org/records/17544339) - Hourly meteorological time series from automatic climate stations in Brazil. This dataset is a mirro...

16. [IBGE API - PublicAPI](https://publicapi.dev/ibge-api) - The IBGE API provides access to data from the Brazilian Institute of Geography and Statistics (IBGE)...

17. [2022 Census | IBGE](https://www.ibge.gov.br/en/statistics/social/labor/22836-2022-census-3.html?edicao=39826) - The Population Census is the reference source of information on the living conditions of the populat...

18. [Understanding the IBGE Aggregate Data API - CRAN](https://cran.r-project.org/web/packages/ibger/vignettes/api-concepts.html) - It covers every survey and census produced by the Brazilian Institute of Geography and Statistics. T...

19. [How to access ADS-B data from OpenSky live API?](https://traffic-viz.github.io/data_sources/opensky_rest.html) - Anonymous access to the OpenSky live API is possible, but functionalities may be limited. The first ...

20. [Flight Data API Market Outlook 2026-2034](https://www.intelmarketresearch.com/flight-data-api-market-36102) - Flight Data APIs are specialized interfaces that provide real-time and historical aviation data, inc...

21. [Monitoring Maritime Trade: The OECD AIS Vessel Tracking ...](https://www.oecd.org/en/data/dashboards/monitoring-maritime-trade-the-oecd-ais-vessel-tracking-dashboard.html) - This new OECD AIS Tracking Dashboard visualises key indicators on ports and maritime trade. Indicato...

22. [A complete guide to marine traffic tracking technologies and AIS data](https://up42.com/blog/a-complete-guide-to-marine-traffic-tracking-tech-and-ais-data) - Marine tracking using AIS data is a method of automatically and periodically broadcasting informatio...

23. [Port of Rio de Janeiro (Brazil) - Arrivals, Departures, Expected vessels](https://www.vesselfinder.com/ports/BRRIO001) - Port of Rio de Janeiro (Brazil) - Real-time data for recent ship arrivals and departures, ships in p...

24. [Discover Brazil via Live Cameras - Webcam Hopper](https://www.webcamhopper.com/south_america/brazil.html) - Explore real-time views of Brazil with live camera feeds and take in its sights from anywhere.

25. [Brazil Webcams – Live Cameras from Cities, Nature & Weather](https://worldcam.eu/webcams/south-america/brazil) - Discover live webcams from all across Brazil – see real-time views of cities, landmarks, and everyda...

26. [Live Cams in Brazil - Skyline Webcams](https://www.skylinewebcams.com/en/webcam/brasil.html) - Live Cams in Brazil, Live Cams in Alagoas, Live Cams in Bahia, Live Cams in Federal District, Live C...

27. [Market data platform | B3](https://www.b3.com.br/en_us/market-data-and-indices/data-services/market-data/market-data-platform/) - B3 real-time market data sends exchange data and news to authorized distributors. When a distributor...

28. [Brazil Stock Market (BOVESPA) - Quote - Chart - Historical Data](https://tradingeconomics.com/brazil/stock-market) - Brazil's main stock market index, the IBOVESPA, rose to 189999 points on March 2, 2026, gaining 0.64...

29. [Brasil Bolsa Balcão (B3SA3 SA) stock market data APIs - EODHD](https://eodhd.com/financial-summary/B3SA3.SA) - API Requests per Min.: 1000/minute; Type of Usage: Personal use. Data access: Historical EOD, Fundam...

30. [B3 Bovespa - Twelve Data](https://twelvedata.com/exchanges/BVMF) - Explore detailed information about the B3 Bovespa exchange, including trading hours, specifications,...

31. [Access Brazilian Data via APIs and Curated Datasets • BrazilDataAPI](https://lightbluetitan.github.io/brazildataapi/) - Provides functions to access data from the BrasilAPI, REST Countries API, Nager.Date API, and World ...

32. [PIX: Brazil's Revolutionary Instant Payment System - Neobanks](https://neobanque.ch/blog/brazil-pix-instant-payment-system-guide/) - PIX operates on a centralized settlement system managed by the Central Bank of Brazil. Key technical...

33. [[PDF] BrazilDataAPI: Access Brazilian Data via APIs and Curated Datasets](https://cran.r-project.org/web/packages/BrazilDataAPI/BrazilDataAPI.pdf) - The data is retrieved in real time from the World Bank API. Source. World Bank Open Data API: https:...

34. [Lessons from Pix: How to build a real-time payments platform at its ...](https://www.labrys.one/public/research-publication/lessons-from-pix) - Pix is the real-time payments rail created by the Brazilian Central Bank (BCB). Since its launch in ...

35. [Brazilian Transparency Policy and the Transparency Portal](https://oecd-opsi.org/innovations/brazilian-transparency-policy-and-the-transparency-portal/) - Transparency as a policy is a strategic effort to promote good governance and accountability. It all...

36. [Portal da Transparência - Wikipedia](https://en.wikipedia.org/wiki/Portal_da_Transpar%C3%AAncia) - Portal da Transparência is a Brazilian government portal dedicated to making public all expenditures...

37. [Brazil's Open Budget Transparency Portal](https://odimpact.org/case-brazils-open-budget-transparency-portal.html) - A tool that aims to increase fiscal transparency of the Brazilian Federal Government through open go...

38. [Input · Brazil Gov Transparency - Public Spending Data - Apify](https://apify.com/viralanalyzer/brazil-government-transparency/input-schema) - Extract Brazilian government data: public spending, contracts, agreements, salaries, and budget allo...

39. [The Brazilian Seismographic Network: Present Status and Society ...](https://seismosoc.secure-platform.com/a/gallery/rounds/3/details/1660) - For acquisition, real-time processing and distribution, RSBR uses SeisComP3. Besides the most common...

40. [RSBR | Centro de Sismologia (USP)](https://moho.iag.usp.br/about/projects/RSBR/) - While the main RSBR purpose is to monitor the seismicity in Brazil, its geometry and position in rel...

41. [CPRM's Seismology Laboratory receives seismological data in real ...](https://ibram.org.br/en/noticia/laboratorio-de-sismologia-da-cprm-recebe-dados-sismologicos-em-tempo-real/) - Operating since July 2016 at the CPRM headquarters in Brasília, the network currently receives data ...

42. [Unlocking Health Data in Brazil - RNDS, Patient Rights, and FHIR](https://www.linkedin.com/pulse/unlocking-health-data-brazil-rnds-patient-rights-power-ward-weistra-nh2ze) - DATASUS (the SUS health IT department) was tasked with managing both the RNDS and its standards, ens...

43. [Brazil - Healthcare](https://www.trade.gov/country-commercial-guides/brazil-healthcare) - Brazil's Unified Healthcare System (SUS) is the sole provider of health services for approximately 7...

44. [healthbR: Access Brazilian Public Health Data - CRAN](https://cran.r-project.org/package=healthbR) - Provides easy access to Brazilian public health data from multiple sources including VIGITEL (Survei...

45. [danicat/datasus: An Interface for the Brazilian Public Healthcare ...](https://github.com/danicat/datasus) - This project is an R package that provides an interface to the Public Healthcare Data repositories m...

46. [An R package for downloading Brazilian electoral data • electionsBR](https://electionsbr.com/novo/) - Easily pull data from the Brazilian Superior Electoral Court (TSE) and Cepesp's electoral data repos...

47. [Cepesp-Fgv/cepesp-python: Api python para acessar dados do TSE](https://github.com/Cepesp-Fgv/cepesp-python) - A simple python wrapper designed to assist users in accessing the API to Cepespdata, which facilitat...

48. [Statistics — English - TSE](https://international.tse.jus.br/en/elections/statistics) - Each month, the TSE consolidates statistical data on the Brazilian electorate. The information is ga...

49. [ANEEL – Informatica Customer Success Story](https://www.informatica.com/customer-success-stories/aneel.html) - Brazil's electric power regulator manages more than 100 energy distribution companies, 380 transmiss...

50. [Open Energy Brazil: The New Frontier of Energy Freedom](https://canalsolar.com.br/en/Open-Energy-Brazil--New-Frontier--Energy-Freedom/) - Following the path opened by Open Finance, the Brazilian electricity sector is definitively entering...

51. [Estudo e Monitoramento Brasileiro do Clima Espacial - Inpe](http://www2.inpe.br/climaespacial/portal/en/) - EMBRACE é o programa criado pelo INPE/MCT para o Estudo e Monitoramento Brasileiro do Clima Espacial...

52. [Brazil API — Free Public API | Public APIs Directory](https://publicapis.io/brazil-api) - Access to comprehensive public datasets from Brazil; Real-time data updates for accuracy; Community-...

