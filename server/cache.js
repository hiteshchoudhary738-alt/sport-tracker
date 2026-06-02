import { updateMatch } from './db.js';

// In-Memory Live Cache Map
const liveCache = new Map();

// Load a match into the live cache
export const cacheLiveMatch = (match) => {
  if (!match) return;
  liveCache.set(parseInt(match.id), {
    ...match,
    // Ensure all numeric scores and time are integers
    id: parseInt(match.id),
    home_score: parseInt(match.home_score),
    away_score: parseInt(match.away_score),
    current_time: parseInt(match.current_time)
  });
  console.log(`[Cache] Match ${match.id} loaded into live memory.`);
};

// Retrieve a match from the live cache
export const getCachedMatch = (id) => {
  return liveCache.get(parseInt(id)) || null;
};

// Update match in cache
export const updateCachedMatch = (id, updates) => {
  const matchId = parseInt(id);
  const match = liveCache.get(matchId);
  if (!match) return null;

  const oldStats = match.statistics || {};
  const newStats = updates.statistics || {};
  const updatedMatch = {
    ...match,
    ...updates,
    statistics: updates.statistics ? {
      ...oldStats,
      ...newStats,
      batsmen: newStats.batsmen ? { ...(oldStats.batsmen || {}), ...newStats.batsmen } : oldStats.batsmen,
      bowlers: newStats.bowlers ? { ...(oldStats.bowlers || {}), ...newStats.bowlers } : oldStats.bowlers,
      players: newStats.players ? { ...(oldStats.players || {}), ...newStats.players } : oldStats.players
    } : oldStats,
    events: updates.events ? [...(match.events || []), ...updates.events] : (match.events || [])
  };

  liveCache.set(matchId, updatedMatch);
  return updatedMatch;
};

// Remove a match from cache (e.g. when finished)
export const evictCachedMatch = async (id) => {
  const matchId = parseInt(id);
  const match = liveCache.get(matchId);
  if (match) {
    // Perform final sync to database
    await syncMatchToDb(matchId);
    liveCache.delete(matchId);
    console.log(`[Cache] Match ${matchId} evicted from live cache.`);
  }
};

// Get all matches in cache
export const getAllCachedMatches = () => {
  return Array.from(liveCache.values());
};

// Sync a single match to the database
export const syncMatchToDb = async (id) => {
  const matchId = parseInt(id);
  const match = liveCache.get(matchId);
  if (!match) return;

  try {
    // Only save core schema attributes
    const {
      status,
      home_score,
      away_score,
      current_time,
      autopilot,
      autoIncrementClock,
      events,
      statistics
    } = match;

    await updateMatch(matchId, {
      status,
      home_score,
      away_score,
      current_time,
      autopilot: autopilot !== false,
      autoIncrementClock: autoIncrementClock !== false,
      events,
      statistics
    });
    // console.log(`[Cache Sync] Match ${matchId} synced to database.`);
  } catch (err) {
    console.error(`[Cache Sync Error] Failed to sync match ${matchId} to DB:`, err.message);
  }
};

// Sync all cached matches to the database
export const syncAllCachedMatches = async () => {
  if (liveCache.size === 0) return;
  
  // console.log(`[Cache Sync] Syncing ${liveCache.size} matches to database...`);
  const syncPromises = Array.from(liveCache.keys()).map(id => syncMatchToDb(id));
  await Promise.all(syncPromises);
};

// Periodically sync cache to database (every 5 seconds)
setInterval(async () => {
  await syncAllCachedMatches();
}, 5000);
