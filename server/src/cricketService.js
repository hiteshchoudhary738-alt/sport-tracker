import axios from 'axios';
import NodeCache from 'node-cache';
import {
  MOCK_LIVE_MATCHES,
  MOCK_UPCOMING_MATCHES,
  MOCK_RECENT_MATCHES,
  MOCK_RANKINGS
} from './mockData.js';

// Cache configuration:
// - Live scores: 30 seconds
// - Recent matches: 10 minutes (600s)
// - Upcoming matches: 1 hour (3600s)
// - ICC Rankings: 12 hours (43200s)
const cricketCache = new NodeCache({ checkperiod: 60 });

const getEnvConfig = () => ({
  apiKey: process.env.RAPID_API_KEY?.trim() || '',
  apiHost: process.env.RAPID_API_HOST || 'cricbuzz-cricket.p.rapidapi.com'
});

const isKeyConfigured = () => {
  const { apiKey } = getEnvConfig();
  return Boolean(apiKey && apiKey !== 'your_rapidapi_key_here');
};

 /* Helper to make authenticated RapidAPI calls */
async function callRapidApi(endpoint) {
  // Primary RapidAPI call (Cricbuzz)
  const { apiKey, apiHost } = getEnvConfig();
  const urlPrimary = `https://${apiHost}${endpoint}`;
  try {
    const response = await axios.get(urlPrimary, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost
      },
      timeout: 8000
    });
    return response.data;
  } catch (primaryErr) {
    console.warn(`⚠️ Primary RapidAPI request failed: ${primaryErr.message}`);
    // Attempt secondary API if configured
    const secondaryHost = process.env.SECONDARY_API_HOST?.trim();
    const secondaryKey = process.env.SECONDARY_API_KEY?.trim();
    if (secondaryHost && secondaryKey) {
      const urlSecondary = `https://${secondaryHost}${endpoint}`;
      try {
        const response = await axios.get(urlSecondary, {
          headers: {
            'x-rapidapi-key': secondaryKey,
            'x-rapidapi-host': secondaryHost
          },
          timeout: 8000
        });
        console.info('✅ Fetched data from secondary API');
        return response.data;
      } catch (secondaryErr) {
        console.warn(`⚠️ Secondary API request also failed: ${secondaryErr.message}`);
        throw primaryErr; // propagate original error
      }
    }
    // No secondary configured, rethrow
    throw primaryErr;
  }

/* Fetch Live Matches */
export async function getLiveMatches() {
  const cacheKey = 'matches:live';
  const cached = cricketCache.get(cacheKey);
  if (cached) {
    return { ...cached, source: 'cache' };
  }

  if (isKeyConfigured()) {
    try {
      console.log('📡 Fetching live matches from RapidAPI...');
      const apiData = await callRapidApi('/matches/v1/live');
      
      const payload = {
        success: true,
        source: 'rapidapi',
        data: apiData,
        timestamp: new Date().toISOString()
      };
      cricketCache.set(cacheKey, payload, 30);
      return payload;
    } catch (err) {
      console.warn(`⚠️ RapidAPI request failed: ${err.message}. Falling back to mock data.`);
    }
  } else {
    console.log('ℹ️ No RapidAPI key provided. Using mock live matches.');
  }

  // Fallback to mock data
  const mockPayload = {
    success: true,
    source: 'mock',
    message: isKeyConfigured()
      ? 'Upstream API error; serving fallback data'
      : 'RapidAPI key not set in .env; serving demo mock data',
    data: MOCK_LIVE_MATCHES,
    timestamp: new Date().toISOString()
  };
  cricketCache.set(cacheKey, mockPayload, 15);
  return mockPayload;
}

/* Fetch Upcoming Matches */
export async function getUpcomingMatches() {
  const cacheKey = 'matches:upcoming';
  const cached = cricketCache.get(cacheKey);
  if (cached) {
    return { ...cached, source: 'cache' };
  }

  if (isKeyConfigured()) {
    try {
      console.log('📡 Fetching upcoming fixtures from RapidAPI...');
      const apiData = await callRapidApi('/matches/v1/upcoming');
      const payload = {
        success: true,
        source: 'rapidapi',
        data: apiData,
        timestamp: new Date().toISOString()
      };
      cricketCache.set(cacheKey, payload, 3600);
      return payload;
    } catch (err) {
      console.warn(`⚠️ RapidAPI error (${err.message}). Using mock fixtures.`);
    }
  }

  const mockPayload = {
    success: true,
    source: 'mock',
    message: 'Serving upcoming match fixtures',
    data: MOCK_UPCOMING_MATCHES,
    timestamp: new Date().toISOString()
  };
  cricketCache.set(cacheKey, mockPayload, 300);
  return mockPayload;
}

/*Fetch Recent Matches*/
export async function getRecentMatches() {
  const cacheKey = 'matches:recent';
  const cached = cricketCache.get(cacheKey);
  if (cached) {
    return { ...cached, source: 'cache' };
  }

  if (isKeyConfigured()) {
    try {
      console.log('📡 Fetching recent matches from RapidAPI...');
      const apiData = await callRapidApi('/matches/v1/recent');
      const payload = {
        success: true,
        source: 'rapidapi',
        data: apiData,
        timestamp: new Date().toISOString()
      };
      cricketCache.set(cacheKey, payload, 600);
      return payload;
    } catch (err) {
      console.warn(`⚠️ RapidAPI error (${err.message}). Using mock recent matches.`);
    }
  }

  const mockPayload = {
    success: true,
    source: 'mock',
    data: MOCK_RECENT_MATCHES,
    timestamp: new Date().toISOString()
  };
  cricketCache.set(cacheKey, mockPayload, 300);
  return mockPayload;
}

/**
 * 4. Fetch ICC Rankings
   @param {string} category 
   @param {string} format
 */
export async function getRankings(category = 'batsmen', format = 'test') {
  // Primary RapidAPI config (cricbuzz)
  const primaryConfig = getEnvConfig();
  // Optional secondary API (e.g., another public cricket rankings provider)
  const secondaryHost = process.env.SECONDARY_API_HOST?.trim();
  const secondaryKey = process.env.SECONDARY_API_KEY?.trim();
  const normalizedCategory = category.toLowerCase();
  const normalizedFormat = format.toLowerCase();
  const cacheKey = `rankings:${normalizedCategory}:${normalizedFormat}`;

  const cached = cricketCache.get(cacheKey);
  if (cached) {
    return { ...cached, source: 'cache' };
  }

  if (isKeyConfigured()) {
    try {
      console.log(`📡 Fetching ${normalizedCategory} ${normalizedFormat} rankings from RapidAPI...`);
      // Cricbuzz rankings endpoint
      const endpoint = normalizedCategory === 'teams'
        ? `/stats/v1/rankings/teams?formatType=${normalizedFormat}`
        : `/stats/v1/rankings/${normalizedCategory}?formatType=${normalizedFormat}`;
      
      const apiData = await callRapidApi(endpoint);
      const payload = {
        success: true,
        source: 'rapidapi',
        category: normalizedCategory,
        format: normalizedFormat,
        data: apiData,
        timestamp: new Date().toISOString()
      };
      cricketCache.set(cacheKey, payload, 43200); // 12 hrs
      return payload;
    } catch (err) {
      console.warn(`⚠️ RapidAPI error (${err.message}). Falling back to mock rankings.`);
    }
  }

  // Get from mock rankings
  const categoryData = MOCK_RANKINGS[normalizedCategory] || MOCK_RANKINGS.batsmen;
  const formatData = categoryData[normalizedFormat] || categoryData.test || [];

  const mockPayload = {
    success: true,
    source: 'mock',
    category: normalizedCategory,
    format: normalizedFormat,
    data: formatData,
    timestamp: new Date().toISOString()
  };
  cricketCache.set(cacheKey, mockPayload, 3600);
  return mockPayload;
}

/* Cache introspection & management*/
export function getCacheStats() {
  return {
    keys: cricketCache.keys(),
    stats: cricketCache.getStats()
  };
}

export function clearCache() {
  cricketCache.flushAll();
  return { success: true, message: 'Cache flushed successfully' };
}
