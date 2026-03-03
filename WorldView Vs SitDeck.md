# WorldView and SitDeck: What They Share

## Overview

The tweet from Bilawal Sidhu references **WorldView**, a geospatial intelligence dashboard he built in three days using AI coding agents, publicly available data, and Google's 3D Tiles. **SitDeck**, built by entrepreneur Dan Ushman, is a web-based OSINT (Open-Source Intelligence) dashboard that aggregates 180+ live data feeds into a customizable interface. Despite being built by different people with different approaches, the two projects converge on a remarkably similar thesis.[^1][^2][^3][^4]

## Bilawal Sidhu's WorldView

WorldView is a browser-based geospatial "command center" that overlays real-time public data onto a 3D model of the Earth. Built by Bilawal Sidhu — an ex-Google PM who spent six years working on 3D Maps and spatial computing — the project went viral after people compared it to Palantir, prompting Palantir co-founder Joe Lonsdale to respond.[^5][^3][^1]

WorldView's capabilities include:

- Live satellite orbit tracking and military aircraft monitoring via ADS-B[^1]
- Real-time CCTV camera feeds projected onto 3D city geometry[^3]
- Earthquake and seismic data overlays[^1]
- Street traffic simulation using OpenStreetMap road network data[^1]
- Visual filters like CRT scan lines, night vision, and FLIR thermal imaging[^3]

Sidhu built it in roughly three days using AI coding agents (Gemini and Claude) running in parallel, leveraging his deep domain expertise to architect the system while AI handled implementation.[^6][^5]

## Dan Ushman's SitDeck

SitDeck is a polished, production-grade OSINT dashboard that aggregates 184 live data providers — from USGS, NOAA, NATO, and CISA, among others — into a single customizable interface. Unlike WorldView's developer-built prototype, SitDeck is designed as a publicly accessible product with a free tier that includes all 55+ widgets, 65+ map layers, and an AI Analyst chat feature.[^7][^2][^8][^9]

Key SitDeck features include:

- 180+ maintained live data feeds with sub-60-second refresh on critical sources[^7]
- 55+ drag-and-drop widgets across 12+ categories[^9]
- An interactive world map with 65+ toggleable intelligence layers[^9]
- AI Analyst chat for natural language queries across all feeds[^7]
- Daily AI-generated intelligence briefings and multi-pass Situation Reports[^2]
- Thousands of integrated live video feeds (traffic cams, webcams) from six continents[^9]

The launch post racked up 2M+ views and reportedly drove 7,000 signups in under 24 hours. Ushman is also known for building TrendSpider and SignalStack.[^10][^4]

## What They Have in Common

Despite their different origins — one a viral weekend project, the other a polished product launch — WorldView and SitDeck share a core set of ideas that define this emerging moment.

### Democratization of Intelligence-Grade Capabilities

Both projects demonstrate that capabilities once exclusive to government agencies and defense contractors are now accessible to individuals. WorldView was compared directly to Palantir, and SitDeck has been described as replacing "what used to require a six-figure Palantir contract and a team of analysts". The underlying data — flight tracking, seismic activity, conflict zones, satellite positions — has always been public. The breakthrough is making it usable by anyone.[^10][^3]

### Aggregation of Public OSINT Data Feeds

Both tools pull from many of the same types of open-source data: live flight tracking (ADS-B), seismic/earthquake data (USGS), weather (NOAA), conflict zones, satellite tracking, military movements, and live camera feeds. Neither uses classified or proprietary data — everything is built on publicly available government, institutional, and research data sources.[^11][^3][^1]

### Single-Pane Situational Awareness

Both aim to give users a unified, real-time picture of what's happening in the world on one screen. Rather than visiting dozens of separate data portals, both tools fuse multiple feeds into a layered, interactive interface — a "situation room" for anyone with a browser.[^2][^3]

### AI as the Enabler

AI plays a central but different role in each. Sidhu used AI coding agents (Gemini 3.1, Claude) to build WorldView's codebase in three days — the AI handled implementation while he provided architectural judgment. SitDeck uses AI at the product layer: an AI Analyst that cross-references all 184 feeds to answer natural language questions, plus AI-generated daily briefings and situation reports.[^6][^5][^2][^7]

### The "Vibe-Coded Palantir" Moment

Both projects landed at the same cultural moment: the realization that AI tools have lowered the barrier to building sophisticated intelligence platforms. Sidhu's post trended on X with commentary like "I vibe coded Palantir". SitDeck's LinkedIn coverage describes it as offering "the same situational awareness capabilities that intelligence agencies spend millions building in-house". Together, they signal a broader trend — surveillance and monitoring tools are being unbundled from defense budgets and made available to hobbyists, journalists, security professionals, and the general public.[^10][^1]

## The Key Difference

| Dimension | WorldView | SitDeck |
|-----------|-----------|---------|
| **Creator** | Bilawal Sidhu (ex-Google PM)[^1] | Dan Ushman (entrepreneur, TrendSpider)[^10] |
| **Nature** | Developer prototype / demo[^5] | Production SaaS product[^2] |
| **Built in** | ~3 days with AI agents[^1] | Ongoing product development[^11] |
| **3D visualization** | Full 3D globe with CRT/FLIR filters[^3] | Interactive map with 65+ layers[^9] |
| **AI role** | AI built the code[^6] | AI analyzes the data[^7] |
| **Access** | Not publicly available[^5] | Free tier available now[^8] |
| **Data sources** | ~10 public APIs[^1] | 184 maintained providers[^7] |

## Broader Implications

Both projects raise the same provocative question that Sidhu articulated in his newsletter: this capability has always existed within intelligence agencies, but now it's in a browser tab. The Palantir co-founder's response — that WorldView is "missing real proprietary data fusion" — highlights the remaining gap between these tools and enterprise defense platforms. But the gap is narrowing fast. The combination of freely available OSINT data, AI-powered coding, and AI-powered analysis means that the barrier to building and using intelligence-grade situational awareness tools has effectively collapsed.[^3][^1]

---

## References

1. [Ex-Google Maps PM Vibe Coded Palantir In a Weekend ... - YouTube](https://www.youtube.com/watch?v=rXvU7bPJ8n4) - ... Twitter here: https://x.com/bilawalsidhu Everywhere else here: https://bilawal.ai Business inqui...

2. [SitDeck — Open-Source Intelligence Dashboard](https://sitdeck.com) - The world's largest open-source intelligence dashboard. Monitor conflicts, earthquakes, markets, and...

3. [I Built a Spy Satellite Simulator in a Browser. Here's What I Learned.](https://www.spatialintelligence.ai/p/i-built-a-spy-satellite-simulator) - WorldView is the first attempt to make the thesis visible. The thesis: we're building AI that unders...

4. [SitDeck: Build CIA-level dashboards to monitor events](https://www.superhuman.ai/p/sitdeck-build-cia-level-dashboards-to-monitor-events) - SitDeck lets you monitor any situation globally by compiling 180+ live data feeds: SitDeck is a free...

5. [I built WorldView in three days. But I also spent six years at Google ...](https://www.linkedin.com/posts/bilawalsidhu_i-built-worldview-in-three-days-but-i-also-activity-7432079812619550720-O3Gb) - This is really cool I tried vibe coding something similar to this with Replit back in 2025 for this ...

6. [Bilawal Sidhu (@bilawal.ai) just vibe-coded a real-time geospatial ...](https://www.instagram.com/p/DVWIXQKCCGF/) - Bilawal Sidhu (@bilawal.ai) just vibe-coded a real-time geospatial tracking system using Gemini 3.1 ...

7. [llms.txt - SitDeck](https://sitdeck.com/llms.txt) - SitDeck is a web-based OSINT (Open-Source Intelligence) dashboard built by Situation Deck LLC. It ag...

8. [Pricing — Free Forever, Premium Coming Soon | SitDeck](https://sitdeck.com/pricing) - SitDeck is free forever with full dashboard access, all widgets, and all data sources ... Monitor sp...

9. [Product — How SitDeck Works](https://sitdeck.com/product) - Explore how SitDeck's customizable OSINT dashboard works. Drag-and-drop widgets, interactive maps wi...

10. [#osint #cybersecurity #threatintelligence #situationalawareness ...](https://www.linkedin.com/posts/jason-heath-profile_osint-cybersecurity-threatintelligence-activity-7433922718921650177-NpC-) - The tools I'm looking at in SitDeck? These are the same data sources ... Built by Dan Ushman (also b...

11. [Data Sources — 180+ Live Intelligence Feeds | SitDeck](https://sitdeck.com/data) - SitDeck aggregates 180+ live data sources across conflicts, markets, weather, cyber threats, and mor...

