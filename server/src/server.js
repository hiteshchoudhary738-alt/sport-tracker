import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  getLiveMatches,
  getUpcomingMatches,
  getRecentMatches,
  getRankings,
  getCacheStats,
  clearCache
} from './cricketService.js';

// Resolve directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 1. Health check & configuration status
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.RAPID_API_KEY && process.env.RAPID_API_KEY !== 'your_rapidapi_key_here');
  res.json({
    status: 'healthy',
    mode: hasKey ? 'live-rapidapi' : 'demo-mock-mode',
    apiHost: process.env.RAPID_API_HOST || 'cricbuzz-cricket.p.rapidapi.com',
    keyConfigured: hasKey,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 2. Matches endpoints
app.get('/api/matches/live', async (req, res) => {
  try {
    const result = await getLiveMatches();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/matches/upcoming', async (req, res) => {
  try {
    const result = await getUpcomingMatches();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/matches/recent', async (req, res) => {
  try {
    const result = await getRecentMatches();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. ICC Rankings endpoint
// Example: /api/rankings/batsmen/test, /api/rankings/bowlers/odi, /api/rankings/teams/t20
app.get('/api/rankings/:category/:format', async (req, res) => {
  try {
    const { category, format } = req.params;
    const result = await getRankings(category, format);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Shorthand rankings endpoint (defaults to batsmen test)
app.get('/api/rankings', async (req, res) => {
  try {
    const category = req.query.category || 'batsmen';
    const format = req.query.format || 'test';
    const result = await getRankings(category, format);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Cache management endpoints
app.get('/api/cache-stats', (req, res) => {
  res.json(getCacheStats());
});

app.post('/api/cache/clear', (req, res) => {
  res.json(clearCache());
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
});

// Start listening
app.listen(PORT, () => {
  const hasKey = Boolean(process.env.RAPID_API_KEY && process.env.RAPID_API_KEY !== 'your_rapidapi_key_here');
  console.log(`\n======================================================`);
  console.log(`🏏 CricTrack Cricket API Server running on http://localhost:${PORT}`);
  console.log(`Mode: ${hasKey ? '🟢 Live RapidAPI (Cricbuzz)' : '🟡 Demo Mock Mode (Add key in server/.env for live data)'}`);
  console.log(`Available Endpoints:`);
  console.log(`  - Health:    http://localhost:${PORT}/api/health`);
  console.log(`  - Live:      http://localhost:${PORT}/api/matches/live`);
  console.log(`  - Upcoming:  http://localhost:${PORT}/api/matches/upcoming`);
  console.log(`  - Recent:    http://localhost:${PORT}/api/matches/recent`);
  console.log(`  - Rankings:  http://localhost:${PORT}/api/rankings/batsmen/odi`);
  console.log(`  - Cache:     http://localhost:${PORT}/api/cache-stats`);
  console.log(`======================================================\n`);
});
