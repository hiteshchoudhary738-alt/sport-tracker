# CricTrack — Live Cricket Scores, ICC Rankings & Analytics Platform

A high-performance full-stack sports analytics and live cricket dashboard inspired by **Cricbuzz**. Built with **React 19**, **Node.js (Express)**, and **Python**, featuring an in-memory caching layer for RapidAPI rate-limit compliance, live scorecards, and ICC rankings.

---

## 🌟 Key Architecture & Features

### 1. ⚛️ React 19 Frontend (`client/`)
- **Live Match Center**: Live scores, batsman strike rate indicator (★), bowler figures, and ball-by-ball circles (Green for 4s, Gold for 6s, Red for Wickets).
- **ICC Rankings Explorer**: Filterable by Category (*Batsmen*, *Bowlers*, *All-rounders*, *Teams*) and Format (*Test*, *ODI*, *T20I*) with medal badges for Top 3 and trend indicators.
- **Fixtures & Results**: International tournament schedules, venues, and match summaries.
- **Cache & Architecture Monitor**: Live visualizer displaying real-time Node.js cache hits/misses and memory stats with cache flush capabilities.

### 2. 🟢 Node.js API Gateway & Caching Proxy (`server/`)
- **Rate-Limit Resilience**: Implements `node-cache` reducing upstream API hits by **>90%** (30s for live scores, 12 hours for ICC rankings).
- **Graceful Fallbacks**: Automatically falls back to high-fidelity mock datasets if upstream API quota is exceeded or offline, guaranteeing zero frontend downtime.
- **Endpoints**:
  - `GET /api/health` - Server mode and connectivity check
  - `GET /api/matches/live` - Live matches with active ball data
  - `GET /api/matches/upcoming` - Upcoming fixtures
  - `GET /api/matches/recent` - Recently concluded matches
  - `GET /api/rankings/:category/:format` - ICC rankings
  - `GET /api/cache-stats` - Real-time cache performance metrics
  - `POST /api/cache/clear` - Cache invalidation endpoint

### 3. 🐍 Python Data Engine (`python_service/`)
- **Rankings Parser**: Python worker built with `BeautifulSoup` to scrape and parse ICC rankings into standardized JSON formats.

---

## 📁 Project Structure

```
crinb/
├── client/                     ← React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LiveMatchCard.jsx
│   │   │   ├── RankingsTable.jsx
│   │   │   └── ArchitectureInfo.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
│
├── server/                     ← Node.js + Express API Gateway
│   ├── src/
│   │   ├── server.js           ← REST endpoints & logger
│   │   ├── cricketService.js   ← Caching engine & RapidAPI caller
│   │   └── mockData.js         ← Graceful fallback data
│   ├── .env.example            ← Environment template
│   └── package.json
│
├── python_service/             ← Python Data Sync & Analytics
│   └── icc_scraper.py          ← BeautifulSoup scraper
│
├── index.html                  ← Standalone Vanilla client (preserved)
├── pages/                      ← Full match & player profile views
└── package.json                ← Root workspace runner scripts
```

---

## 🚀 How to Run

### 1. Start the Node.js API Server
```bash
npm run server
# Runs at http://localhost:5000
```

### 2. Start the React Frontend
```bash
npm run client
# Runs at http://localhost:3000
```

### 3. (Optional) Run Python Data Scraper
```bash
npm run scraper
```

---

## 🔑 RapidAPI Configuration

The server works out-of-the-box in **Demo Mock Mode**. To connect live Cricbuzz data:

1. Subscribe to the free plan on [RapidAPI Cricbuzz](https://rapidapi.com/cricketapi-cricketapi-cricket-data/api/cricbuzz-cricket).
2. Copy `server/.env.example` to `server/.env`.
3. Add your key:
   ```env
   RAPID_API_KEY=your_key_here
   RAPID_API_HOST=cricbuzz-cricket.p.rapidapi.com
   ```
4. Restart the server!

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide Icons, CSS Custom Properties
- **Backend**: Node.js, Express, Axios, NodeCache, Dotenv, CORS
- **Data Engine**: Python 3.14, BeautifulSoup4, Requests
