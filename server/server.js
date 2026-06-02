import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { initDb, getMatches, getMatchById, createMatch, createTeam, resetDb } from './db.js';
import { cacheLiveMatch, getCachedMatch, getAllCachedMatches, evictCachedMatch, updateCachedMatch } from './cache.js';
import { startMatchSimulation, stopMatchSimulation, triggerEvent } from './simulator.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for dev simplicity
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// --- REST API Endpoints ---

// Get all matches (live matches sourced from cache, rest from DB)
app.get('/api/matches', async (req, res) => {
  try {
    const dbMatches = await getMatches();
    
    // Merge live matches from cache
    const finalMatches = dbMatches.map(m => {
      const cached = getCachedMatch(m.id);
      if (cached) {
        return {
          ...m,
          status: cached.status,
          home_score: cached.home_score,
          away_score: cached.away_score,
          current_time: cached.current_time,
          autopilot: cached.autopilot !== false,
          autoIncrementClock: cached.autoIncrementClock !== false,
          statistics: cached.statistics
        };
      }
      return m;
    });

    res.json(finalMatches);
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single match details
app.get('/api/matches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cached = getCachedMatch(id);
    if (cached) {
      return res.json(cached);
    }

    const match = await getMatchById(id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.json(match);
  } catch (err) {
    console.error('Error fetching match details:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Middleware to verify admin token
const verifyAdminHeader = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader === 'Bearer admin123') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Admin access required.' });
  }
};

// Create a new match
app.post('/api/matches', verifyAdminHeader, async (req, res) => {
  try {
    const { home_team_id, away_team_id } = req.body;
    if (parseInt(home_team_id) === parseInt(away_team_id)) {
      return res.status(400).json({ error: 'Home and Away teams cannot be the same.' });
    }
    const match = await createMatch(req.body);
    if (match.status === 'live') {
      cacheLiveMatch(match);
    }
    res.status(201).json(match);
  } catch (err) {
    console.error('Error creating match:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new team
app.post('/api/teams', verifyAdminHeader, async (req, res) => {
  try {
    const team = await createTeam(req.body);
    res.status(201).json(team);
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Reset database
app.post('/api/reset', verifyAdminHeader, async (req, res) => {
  try {
    // Stop all simulations first
    const cached = getAllCachedMatches();
    for (const match of cached) {
      stopMatchSimulation(match.id);
      await evictCachedMatch(match.id);
    }
    
    await resetDb();
    
    // Cache any matches that are set back to live from default seeds
    const dbMatches = await getMatches();
    dbMatches.forEach(m => {
      if (m.status === 'live') {
        cacheLiveMatch(m);
      }
    });

    io.emit('dbReset');
    res.json({ message: 'Database reset to seed data' });
  } catch (err) {
    console.error('Error resetting database:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Socket.io WebSocket Logic ---

io.on('connection', (socket) => {
  // console.log(`Client connected: ${socket.id}`);

  // Subscribe client to a specific match detail channel
  socket.on('subscribeMatch', (matchId) => {
    const id = parseInt(matchId);
    socket.join(`match:${id}`);
    // console.log(`Socket ${socket.id} joined room match:${id}`);
    
    // Immediately emit current cached/db state to client
    const cached = getCachedMatch(id);
    if (cached) {
      socket.emit('matchUpdate', cached);
    } else {
      getMatchById(id).then(match => {
        if (match) socket.emit('matchUpdate', match);
      });
    }
  });

  // Unsubscribe client from match details
  socket.on('unsubscribeMatch', (matchId) => {
    const id = parseInt(matchId);
    socket.leave(`match:${id}`);
    // console.log(`Socket ${socket.id} left room match:${id}`);
  });

  // Admin control: Start match simulation
  socket.on('adminStartMatch', (data) => {
    const { matchId, speedMs, token } = data;
    if (token !== 'admin123') return;
    const id = parseInt(matchId);
    
    getMatchById(id).then(match => {
      if (!match) return;

      // Load to cache and update state to live
      let cached = getCachedMatch(id);
      if (!cached) {
        match.status = 'live';
        cacheLiveMatch(match);
        cached = getCachedMatch(id);
      } else {
        cached.status = 'live';
      }

      // Sync status immediately
      io.emit('dashboardUpdate', { id, status: 'live' });
      
      // Start background updates
      startMatchSimulation(id, io, parseInt(speedMs || 100));
    });
  });

  // Admin control: Pause/Stop match simulation
  socket.on('adminPauseMatch', (data) => {
    const matchId = typeof data === 'object' ? data.matchId : data;
    const token = typeof data === 'object' ? data.token : null;
    if (token !== 'admin123') return;
    const id = parseInt(matchId);
    stopMatchSimulation(id);
    
    const cached = getCachedMatch(id);
    if (cached) {
      cached.status = 'live'; // remains live but paused
      io.to(`match:${id}`).emit('matchUpdate', cached);
    }
  });

  // Admin control: Change update frequency of simulation on the fly
  socket.on('adminChangeSpeed', (data) => {
    const { matchId, speedMs, token } = data;
    if (token !== 'admin123') return;
    const id = parseInt(matchId);
    
    const cached = getCachedMatch(id);
    if (cached && cached.status === 'live') {
      startMatchSimulation(id, io, parseInt(speedMs || 100));
    }
  });

  // Admin control: Trigger manual match event (goal, card, foul, etc.)
  socket.on('adminTriggerEvent', (data) => {
    const { matchId, type, details, token } = data;
    if (token !== 'admin123') return;
    const id = parseInt(matchId);

    // Ensure match is cached
    let cached = getCachedMatch(id);
    if (!cached) {
      getMatchById(id).then(match => {
        if (!match) return;
        match.status = 'live';
        cacheLiveMatch(match);
        triggerEvent(id, io, type, details);
      });
    } else {
      triggerEvent(id, io, type, details);
    }
  });

  // Admin control: Manually update match state (scores, clock, stats, autopilot, etc.)
  socket.on('adminUpdateMatchState', (data) => {
    const { matchId, updates, token } = data;
    if (token !== 'admin123') return;
    const id = parseInt(matchId);

    // Ensure match is cached
    let cached = getCachedMatch(id);
    if (!cached) {
      getMatchById(id).then(match => {
        if (!match) return;
        match.status = 'live';
        cacheLiveMatch(match);
        performUpdate(id, updates);
      });
    } else {
      performUpdate(id, updates);
    }

    function performUpdate(matchId, stateUpdates) {
      const updatedMatch = updateCachedMatch(matchId, stateUpdates);
      if (!updatedMatch) return;

      // Broadcast update to all subscribed clients
      io.to(`match:${matchId}`).emit('matchUpdate', updatedMatch);
      io.emit('dashboardUpdate', {
        id: updatedMatch.id,
        status: updatedMatch.status,
        home_score: updatedMatch.home_score,
        away_score: updatedMatch.away_score,
        current_time: updatedMatch.current_time,
        statistics: updatedMatch.statistics
      });
    }
  });

  socket.on('disconnect', () => {
    // console.log(`Client disconnected: ${socket.id}`);
  });
});

// --- Startup Initialization ---

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Initialize database and schemas
  await initDb();

  // 2. Pre-cache any live matches from DB
  try {
    const dbMatches = await getMatches();
    dbMatches.forEach(m => {
      if (m.status === 'live') {
        cacheLiveMatch(m);
        // Start simulation loop for matches that were running
        startMatchSimulation(m.id, io, 200);
      }
    });
  } catch (err) {
    console.error('Failed to pre-cache live matches on startup:', err);
  }

  // 3. Listen
  httpServer.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Real-Time Sports Tracker backend is running!`);
    console.log(`📡 REST API and Socket.io: http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
};

startServer();
