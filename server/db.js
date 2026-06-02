import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JSON_DB_PATH = path.join(__dirname, 'sports_tracker_db.json');

// Default Seed Data
const DEFAULT_SEED_DATA = {
  leagues: [
    { id: 1, name: 'English Premier League', sport: 'Football', country: 'England', logo: '⚽' },
    { id: 2, name: 'NBA', sport: 'Basketball', country: 'USA', logo: '🏀' },
    { id: 3, name: 'Wimbledon', sport: 'Tennis', country: 'UK', logo: '🎾' },
    { id: 4, name: 'Indian Premier League', sport: 'Cricket', country: 'India', logo: '🏏' }
  ],
  teams: [
    // Football
    { id: 1, name: 'Manchester United', short_name: 'MUN', logo: '🔴', league_id: 1 },
    { id: 2, name: 'Liverpool', short_name: 'LIV', logo: '🔴', league_id: 1 },
    { id: 3, name: 'Chelsea', short_name: 'CHE', logo: '🔵', league_id: 1 },
    { id: 4, name: 'Arsenal', short_name: 'ARS', logo: '🔴', league_id: 1 },
    // Basketball
    { id: 5, name: 'LA Lakers', short_name: 'LAL', logo: '🟡', league_id: 2 },
    { id: 6, name: 'GS Warriors', short_name: 'GSW', logo: '🔵', league_id: 2 },
    { id: 7, name: 'Boston Celtics', short_name: 'BOS', logo: '🟢', league_id: 2 },
    { id: 8, name: 'Miami Heat', short_name: 'MIA', logo: '🔥', league_id: 2 },
    // Tennis
    { id: 9, name: 'Novak Djokovic', short_name: 'DJOK', logo: '🇷🇸', league_id: 3 },
    { id: 10, name: 'Rafael Nadal', short_name: 'NADA', logo: '🇪🇸', league_id: 3 },
    { id: 11, name: 'Roger Federer', short_name: 'FEDE', logo: '🇨🇭', league_id: 3 },
    { id: 12, name: 'Carlos Alcaraz', short_name: 'ALCA', logo: '🇪🇸', league_id: 3 },
    // Cricket
    { id: 13, name: 'Mumbai Indians', short_name: 'MI', logo: '🌀', league_id: 4 },
    { id: 14, name: 'Chennai Super Kings', short_name: 'CSK', logo: '🦁', league_id: 4 },
    { id: 15, name: 'Royal Challengers', short_name: 'RCB', logo: '🔴', league_id: 4 },
    { id: 16, name: 'Kolkata Knight Riders', short_name: 'KKR', logo: '🟣', league_id: 4 }
  ],
  matches: [
    {
      id: 1,
      sport: 'Football',
      home_team_id: 1,
      away_team_id: 2,
      scheduled_time: new Date(Date.now() + 3600000).toISOString(), // 1 hr from now
      status: 'scheduled',
      home_score: 0,
      away_score: 0,
      current_time: 0,
      autopilot: true,
      autoIncrementClock: true,
      events: [],
      statistics: {
        possession: [50, 50],
        shots_on_target: [0, 0],
        shots_off_target: [0, 0],
        fouls: [0, 0],
        yellow_cards: [0, 0],
        red_cards: [0, 0],
        ball_x: 50,
        ball_y: 50,
        telemetry: {
          heart_rates: { home: [80, 82, 79], away: [81, 78, 80] },
          ball_speed: 0
        }
      }
    },
    {
      id: 2,
      sport: 'Basketball',
      home_team_id: 5,
      away_team_id: 6,
      scheduled_time: new Date(Date.now() - 1800000).toISOString(), // 30 min ago (Live)
      status: 'live',
      home_score: 88,
      away_score: 85,
      current_time: 2100, // 35 minutes into game
      autopilot: true,
      autoIncrementClock: true,
      events: [
        { time: '12:00 Q1', type: 'system', text: 'Match started.' },
        { time: '05:30 Q4', type: 'point', text: 'LeBron James drives and scores a layup.' }
      ],
      statistics: {
        possession: [52, 48],
        field_goals: [32, 30],
        three_pointers: [10, 11],
        rebounds: [40, 38],
        timeouts: [2, 3],
        ball_x: 75,
        ball_y: 45,
        telemetry: {
          heart_rates: { home: [142, 138, 150], away: [140, 145, 139] },
          ball_speed: 12
        }
      }
    },
    {
      id: 3,
      sport: 'Tennis',
      home_team_id: 9,
      away_team_id: 10,
      scheduled_time: new Date(Date.now() - 7200000).toISOString(), // 2 hr ago (Finished)
      status: 'finished',
      home_score: 3, // Sets
      away_score: 1,
      current_time: 7200,
      autopilot: true,
      autoIncrementClock: true,
      events: [
        { time: 'Set 1', type: 'system', text: 'Match started.' },
        { time: 'Set 4', type: 'match_point', text: 'Djokovic wins the match point!' }
      ],
      statistics: {
        possession: [55, 45],
        aces: [12, 6],
        double_faults: [3, 4],
        unforced_errors: [22, 31],
        sets_score: ['6-4', '3-6', '7-6', '6-3'],
        ball_x: 10,
        ball_y: 20,
        telemetry: {
          heart_rates: { home: [95, 96, 92], away: [100, 98, 102] },
          ball_speed: 0
        }
      }
    },
    {
      id: 4,
      sport: 'Cricket',
      home_team_id: 13,
      away_team_id: 14,
      scheduled_time: new Date(Date.now() + 18000000).toISOString(), // 5 hrs from now
      status: 'scheduled',
      home_score: 0,
      away_score: 0,
      current_time: 0,
      autopilot: true,
      autoIncrementClock: true,
      events: [],
      statistics: {
        runs: [0, 0],
        wickets: [0, 0],
        overs: [0.0, 0.0],
        target: 0,
        ball_x: 50,
        ball_y: 50,
        home_squad: ["Rohit Sharma", "Ishan Kishan", "Suryakumar Yadav", "Hardik Pandya", "Jasprit Bumrah", "Tilak Varma", "Tim David"],
        away_squad: ["Ruturaj Gaikwad", "Rachin Ravindra", "Shivam Dube", "Ravindra Jadeja", "MS Dhoni", "Deepak Chahar", "Mustafizur Rahman"],
        telemetry: {
          heart_rates: { home: [72, 75], away: [70, 71] },
          ball_speed: 0
        }
      }
    },
    {
      id: 5,
      sport: 'Cricket',
      home_team_id: 15,
      away_team_id: 16,
      scheduled_time: new Date(Date.now() + 28800000).toISOString(), // 8 hrs from now
      status: 'scheduled',
      home_score: 0,
      away_score: 0,
      current_time: 0,
      autopilot: true,
      autoIncrementClock: true,
      events: [],
      statistics: {
        runs: [0, 0],
        wickets: [0, 0],
        overs: [0.0, 0.0],
        target: 0,
        ball_x: 50,
        ball_y: 50,
        home_squad: ["Virat Kohli", "Faf du Plessis", "Glenn Maxwell", "Dinesh Karthik", "Mohammed Siraj", "Cameron Green", "Rajat Patidar"],
        away_squad: ["Shreyas Iyer", "Sunil Narine", "Andre Russell", "Rinku Singh", "Mitchell Starc", "Venkatesh Iyer", "Varun Chakaravarthy"],
        telemetry: {
          heart_rates: { home: [74, 76], away: [73, 75] },
          ball_speed: 0
        }
      }
    },
    {
      id: 6,
      sport: 'Football',
      home_team_id: 3,
      away_team_id: 4,
      scheduled_time: new Date(Date.now() - 3600000).toISOString(), // 1 hr ago (Live)
      status: 'live',
      home_score: 1,
      away_score: 1,
      current_time: 3600, // 60 mins into game
      autopilot: true,
      autoIncrementClock: true,
      events: [
        { time: '1\'', type: 'system', text: 'Match started.' },
        { time: '22\'', type: 'goal', text: '⚽ GOAL! Arsenal score the opening goal!' },
        { time: '44\'', type: 'goal', text: '⚽ GOAL! Chelsea equalise right before half time!' }
      ],
      statistics: {
        possession: [48, 52],
        shots_on_target: [3, 4],
        shots_off_target: [2, 3],
        fouls: [6, 7],
        yellow_cards: [1, 1],
        red_cards: [0, 0],
        ball_x: 45,
        ball_y: 55,
        telemetry: {
          heart_rates: { home: [135, 142], away: [138, 145] },
          ball_speed: 40
        }
      }
    },
    {
      id: 7,
      sport: 'Basketball',
      home_team_id: 7,
      away_team_id: 8,
      scheduled_time: new Date(Date.now() + 7200000).toISOString(), // 2 hrs from now
      status: 'scheduled',
      home_score: 0,
      away_score: 0,
      current_time: 0,
      autopilot: true,
      autoIncrementClock: true,
      events: [],
      statistics: {
        possession: [50, 50],
        field_goals: [0, 0],
        three_pointers: [0, 0],
        rebounds: [0, 0],
        timeouts: [4, 4],
        ball_x: 50,
        ball_y: 25,
        telemetry: {
          heart_rates: { home: [80, 80], away: [80, 80] },
          ball_speed: 0
        }
      }
    },
    {
      id: 8,
      sport: 'Tennis',
      home_team_id: 11,
      away_team_id: 12,
      scheduled_time: new Date(Date.now() - 5400000).toISOString(), // 1.5 hrs ago (Live)
      status: 'live',
      home_score: 1, // Sets
      away_score: 0,
      current_time: 5400,
      autopilot: true,
      autoIncrementClock: true,
      events: [
        { time: 'Set 1', type: 'system', text: 'Match started.' },
        { time: 'Set 1', type: 'point', text: '🎾 Set 1 won by Roger Federer!' }
      ],
      statistics: {
        possession: [50, 50],
        aces: [7, 4],
        double_faults: [1, 2],
        unforced_errors: [10, 15],
        sets_score: ['6-3'],
        current_game_score: ['40', '30'],
        ball_x: 35,
        ball_y: 22,
        telemetry: {
          heart_rates: { home: [125, 120], away: [135, 130] },
          ball_speed: 155
        }
      }
    },
    {
      id: 9,
      sport: 'Football',
      home_team_id: 4,
      away_team_id: 3,
      scheduled_time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago (Finished)
      status: 'finished',
      home_score: 2,
      away_score: 1,
      current_time: 5400,
      autopilot: true,
      autoIncrementClock: true,
      events: [
        { time: '1\'', type: 'system', text: 'Match started.' },
        { time: '35\'', type: 'goal', text: '⚽ GOAL! Arsenal scores.' },
        { time: '72\'', type: 'goal', text: '⚽ GOAL! Chelsea equalises.' },
        { time: '89\'', type: 'goal', text: '⚽ GOAL! Arsenal scores a late winner!' },
        { time: '90\'', type: 'system', text: 'Full Time! Match ended.' }
      ],
      statistics: {
        possession: [55, 45],
        shots_on_target: [6, 4],
        shots_off_target: [4, 5],
        fouls: [9, 11],
        yellow_cards: [2, 2],
        red_cards: [0, 0],
        ball_x: 50,
        ball_y: 50,
        telemetry: {
          heart_rates: { home: [80, 85], away: [80, 82] },
          ball_speed: 0
        }
      }
    },
    {
      id: 10,
      sport: 'Cricket',
      home_team_id: 15,
      away_team_id: 13,
      scheduled_time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago (Finished)
      status: 'finished',
      home_score: 162,
      away_score: 166,
      current_time: 7200,
      autopilot: true,
      autoIncrementClock: true,
      events: [
        { time: 'Over 20', type: 'system', text: 'RCB innings completed: 162/7 (20 ov)' },
        { time: 'Over 19.2', type: 'system', text: '🏏 MI: 🏆 MI won by 6 wickets!' }
      ],
      statistics: {
        runs: [162, 166],
        wickets: [7, 4],
        overs: [20.0, 19.2],
        target: 163,
        ball_x: 50,
        ball_y: 50,
        telemetry: {
          heart_rates: { home: [70, 72], away: [71, 74] },
          ball_speed: 0
        }
      }
    }
  ]
};

// Database state
let usePostgres = false;
let pgPool = null;

// JSON File Helper cache
let cachedJSONDb = null;

const readJSONDb = () => {
  if (cachedJSONDb) return cachedJSONDb;
  try {
    if (!fs.existsSync(JSON_DB_PATH)) {
      writeJSONDb(DEFAULT_SEED_DATA);
      cachedJSONDb = DEFAULT_SEED_DATA;
      return DEFAULT_SEED_DATA;
    }
    const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
    cachedJSONDb = JSON.parse(data);
    return cachedJSONDb;
  } catch (err) {
    console.error('Error reading JSON DB, using seed data:', err);
    return DEFAULT_SEED_DATA;
  }
};

const DEFAULT_SQUADS = {
  1: ["Marcus Rashford", "Bruno Fernandes", "Casemiro", "Alejandro Garnacho", "Kobbie Mainoo", "Luke Shaw", "Lisandro Martinez", "Harry Maguire", "Andre Onana"],
  2: ["Mohamed Salah", "Darwin Nunez", "Luis Diaz", "Alexis Mac Allister", "Virgil van Dijk", "Trent Alexander-Arnold", "Alisson Becker"],
  3: ["Cole Palmer", "Nicolas Jackson", "Raheem Sterling", "Conor Gallagher", "Enzo Fernandez", "Moises Caicedo", "Thiago Silva"],
  4: ["Bukayo Saka", "Martin Odegaard", "Declan Rice", "Gabriel Martinelli", "Kai Havertz", "William Saliba", "David Raya"],
  5: ["LeBron James", "Anthony Davis", "D'Angelo Russell", "Austin Reaves", "Rui Hachimura"],
  6: ["Stephen Curry", "Klay Thompson", "Draymond Green", "Andrew Wiggins", "Jonathan Kuminga"],
  7: ["Jayson Tatum", "Jaylen Brown", "Kristaps Porzingis", "Derrick White", "Jrue Holiday"],
  8: ["Jimmy Butler", "Bam Adebayo", "Tyler Herro", "Terry Rozier", "Duncan Robinson"],
  9: ["Novak Djokovic"],
  10: ["Rafael Nadal"],
  11: ["Roger Federer"],
  12: ["Carlos Alcaraz"],
  13: ["Rohit Sharma", "Ishan Kishan", "Suryakumar Yadav", "Hardik Pandya", "Jasprit Bumrah", "Tilak Varma", "Tim David"],
  14: ["Ruturaj Gaikwad", "Rachin Ravindra", "Shivam Dube", "Ravindra Jadeja", "MS Dhoni", "Deepak Chahar", "Mustafizur Rahman"],
  15: ["Virat Kohli", "Faf du Plessis", "Glenn Maxwell", "Dinesh Karthik", "Mohammed Siraj", "Cameron Green", "Rajat Patidar"],
  16: ["Shreyas Iyer", "Sunil Narine", "Andre Russell", "Rinku Singh", "Mitchell Starc", "Venkatesh Iyer", "Varun Chakaravarthy"]
};

export const attachSquadsToMatch = (match) => {
  if (!match.statistics) match.statistics = {};
  if (!match.statistics.home_squad) {
    match.statistics.home_squad = DEFAULT_SQUADS[match.home_team_id] || [];
  }
  if (!match.statistics.away_squad) {
    match.statistics.away_squad = DEFAULT_SQUADS[match.away_team_id] || [];
  }
  return match;
};

const writeJSONDb = (data) => {
  cachedJSONDb = data;
  try {
    const dataCopy = JSON.parse(JSON.stringify(data));
    dataCopy.matches = dataCopy.matches.map(attachSquadsToMatch);
    fs.writeFile(JSON_DB_PATH, JSON.stringify(dataCopy, null, 2), 'utf8', (err) => {
      if (err) console.error('Error writing to JSON DB:', err);
    });
  } catch (err) {
    console.error('Error writing to JSON DB:', err);
  }
};

// Initialize DB (Connection Test)
export const initDb = async () => {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sports_tracker';
  console.log('Attempting to connect to PostgreSQL...');
  
  try {
    pgPool = new pg.Pool({
      connectionString,
      connectionTimeoutMillis: 3000 // Quick timeout to fall back fast
    });
    
    // Test query
    const client = await pgPool.connect();
    console.log('PostgreSQL connected successfully!');
    usePostgres = true;
    client.release();
    
    // Create Tables if not exist
    await createPostgresTables();
  } catch (err) {
    console.warn('PostgreSQL connection failed. Falling back to local JSON database storage.');
    console.warn(`Reason: ${err.message}`);
    usePostgres = false;
    
    // Ensure JSON file exists
    readJSONDb();
  }
};

// Create tables in Postgres
const createPostgresTables = async () => {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS leagues (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sport VARCHAR(100) NOT NULL,
        country VARCHAR(100),
        logo VARCHAR(50)
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        short_name VARCHAR(50) NOT NULL,
        logo VARCHAR(50),
        league_id INTEGER REFERENCES leagues(id) ON DELETE CASCADE
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        sport VARCHAR(100) NOT NULL,
        home_team_id INTEGER REFERENCES teams(id),
        away_team_id INTEGER REFERENCES teams(id),
        scheduled_time TIMESTAMP NOT NULL,
        status VARCHAR(50) NOT NULL,
        home_score INTEGER DEFAULT 0,
        away_score INTEGER DEFAULT 0,
        current_time INTEGER DEFAULT 0,
        autopilot BOOLEAN DEFAULT TRUE,
        autoIncrementClock BOOLEAN DEFAULT TRUE,
        events JSONB DEFAULT '[]'::jsonb,
        statistics JSONB DEFAULT '{}'::jsonb
      );
    `);
    
    // Check if seeded
    const res = await client.query('SELECT COUNT(*) FROM leagues');
    if (parseInt(res.rows[0].count) === 0) {
      console.log('Seeding PostgreSQL database...');
      
      // Seed Leagues
      for (const league of DEFAULT_SEED_DATA.leagues) {
        await client.query(
          'INSERT INTO leagues (id, name, sport, country, logo) VALUES ($1, $2, $3, $4, $5)',
          [league.id, league.name, league.sport, league.country, league.logo]
        );
      }
      
      // Seed Teams
      for (const team of DEFAULT_SEED_DATA.teams) {
        await client.query(
          'INSERT INTO teams (id, name, short_name, logo, league_id) VALUES ($1, $2, $3, $4, $5)',
          [team.id, team.name, team.short_name, team.logo, team.league_id]
        );
      }
      
      // Seed Matches
      for (const match of DEFAULT_SEED_DATA.matches) {
        const seededMatch = attachSquadsToMatch(match);
        await client.query(
          'INSERT INTO matches (id, sport, home_team_id, away_team_id, scheduled_time, status, home_score, away_score, current_time, autopilot, autoIncrementClock, events, statistics) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
          [
            seededMatch.id,
            seededMatch.sport,
            seededMatch.home_team_id,
            seededMatch.away_team_id,
            seededMatch.scheduled_time,
            seededMatch.status,
            seededMatch.home_score,
            seededMatch.away_score,
            seededMatch.current_time,
            seededMatch.autopilot !== false,
            seededMatch.autoIncrementClock !== false,
            JSON.stringify(seededMatch.events),
            JSON.stringify(seededMatch.statistics)
          ]
        );
      }
      console.log('Seeding PostgreSQL completed!');
    }
    
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating/seeding tables in Postgres, falling back to JSON db:', err);
    usePostgres = false;
    readJSONDb();
  } finally {
    client.release();
  }
};

// Database Agnostic Methods

export const getLeagues = async () => {
  if (usePostgres) {
    const res = await pgPool.query('SELECT * FROM leagues ORDER BY id');
    return res.rows;
  } else {
    return readJSONDb().leagues;
  }
};

export const getTeams = async () => {
  if (usePostgres) {
    const res = await pgPool.query('SELECT * FROM teams ORDER BY id');
    return res.rows;
  } else {
    return readJSONDb().teams;
  }
};

export const getMatches = async () => {
  if (usePostgres) {
    const query = `
      SELECT m.*, 
             t_home.name as home_team_name, t_home.short_name as home_team_short, t_home.logo as home_team_logo,
             t_away.name as away_team_name, t_away.short_name as away_team_short, t_away.logo as away_team_logo,
             l.name as league_name, l.logo as league_logo
      FROM matches m
      JOIN teams t_home ON m.home_team_id = t_home.id
      JOIN teams t_away ON m.away_team_id = t_away.id
      LEFT JOIN leagues l ON t_home.league_id = l.id
      ORDER BY m.scheduled_time DESC
    `;
    const res = await pgPool.query(query);
    return res.rows;
  } else {
    const db = readJSONDb();
    return db.matches.map(m => {
      const home = db.teams.find(t => t.id === m.home_team_id);
      const away = db.teams.find(t => t.id === m.away_team_id);
      const league = db.leagues.find(l => l.id === home?.league_id);
      return {
        ...m,
        home_team_name: home?.name || '',
        home_team_short: home?.short_name || '',
        home_team_logo: home?.logo || '',
        away_team_name: away?.name || '',
        away_team_short: away?.short_name || '',
        away_team_logo: away?.logo || '',
        league_id: league?.id || null,
        league_name: league?.name || 'International Group Stage',
        league_logo: league?.logo || '🏆'
      };
    });
  }
};

export const getMatchById = async (id) => {
  const matchId = parseInt(id);
  if (usePostgres) {
    const query = `
      SELECT m.*, 
             t_home.name as home_team_name, t_home.short_name as home_team_short, t_home.logo as home_team_logo,
             t_away.name as away_team_name, t_away.short_name as away_team_short, t_away.logo as away_team_logo,
             l.name as league_name, l.logo as league_logo
      FROM matches m
      JOIN teams t_home ON m.home_team_id = t_home.id
      JOIN teams t_away ON m.away_team_id = t_away.id
      LEFT JOIN leagues l ON t_home.league_id = l.id
      WHERE m.id = $1
    `;
    const res = await pgPool.query(query, [matchId]);
    return res.rows[0] || null;
  } else {
    const db = readJSONDb();
    const m = db.matches.find(match => match.id === matchId);
    if (!m) return null;
    const home = db.teams.find(t => t.id === m.home_team_id);
    const away = db.teams.find(t => t.id === m.away_team_id);
    const league = db.leagues.find(l => l.id === home?.league_id);
    return {
      ...m,
      home_team_name: home?.name || '',
      home_team_short: home?.short_name || '',
      home_team_logo: home?.logo || '',
      away_team_name: away?.name || '',
      away_team_short: away?.short_name || '',
      away_team_logo: away?.logo || '',
      league_id: league?.id || null,
      league_name: league?.name || 'International Group Stage',
      league_logo: league?.logo || '🏆'
    };
  }
};

export const updateMatch = async (id, updates) => {
  const matchId = parseInt(id);
  if (usePostgres) {
    const keys = Object.keys(updates);
    const setClause = keys.map((key, i) => `"${key}" = $${i + 2}`).join(', ');
    const values = keys.map(key => {
      const val = updates[key];
      return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
    });
    
    const query = `UPDATE matches SET ${setClause} WHERE id = $1 RETURNING *`;
    const res = await pgPool.query(query, [matchId, ...values]);
    return res.rows[0];
  } else {
    const db = readJSONDb();
    const idx = db.matches.findIndex(m => m.id === matchId);
    if (idx === -1) return null;
    
    db.matches[idx] = {
      ...db.matches[idx],
      ...updates
    };
    writeJSONDb(db);
    return db.matches[idx];
  }
};

export const createMatch = async (matchData) => {
  if (usePostgres) {
    const query = `
      INSERT INTO matches (sport, home_team_id, away_team_id, scheduled_time, status, home_score, away_score, current_time, autopilot, autoIncrementClock, events, statistics)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const res = await pgPool.query(query, [
      matchData.sport,
      matchData.home_team_id,
      matchData.away_team_id,
      matchData.scheduled_time,
      matchData.status || 'scheduled',
      matchData.home_score || 0,
      matchData.away_score || 0,
      matchData.current_time || 0,
      matchData.autopilot !== false,
      matchData.autoIncrementClock !== false,
      JSON.stringify(matchData.events || []),
      JSON.stringify(matchData.statistics || {})
    ]);
    return res.rows[0];
  } else {
    const db = readJSONDb();
    const newId = db.matches.length > 0 ? Math.max(...db.matches.map(m => m.id)) + 1 : 1;
    const newMatch = {
      id: newId,
      sport: matchData.sport,
      home_team_id: parseInt(matchData.home_team_id),
      away_team_id: parseInt(matchData.away_team_id),
      scheduled_time: matchData.scheduled_time,
      status: matchData.status || 'scheduled',
      home_score: parseInt(matchData.home_score || 0),
      away_score: parseInt(matchData.away_score || 0),
      current_time: parseInt(matchData.current_time || 0),
      autopilot: matchData.autopilot !== false,
      autoIncrementClock: matchData.autoIncrementClock !== false,
      events: matchData.events || [],
      statistics: matchData.statistics || {}
    };
    db.matches.push(newMatch);
    writeJSONDb(db);
    return newMatch;
  }
};

export const createTeam = async (teamData) => {
  if (usePostgres) {
    let leagueId = 1;
    const leaguesRes = await pgPool.query('SELECT id FROM leagues WHERE sport = $1 LIMIT 1', [teamData.sport]);
    if (leaguesRes.rows.length > 0) {
      leagueId = leaguesRes.rows[0].id;
    }
    const query = `
      INSERT INTO teams (name, short_name, logo, league_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await pgPool.query(query, [
      teamData.name,
      teamData.short_name,
      teamData.logo || '⚽',
      leagueId
    ]);
    return res.rows[0];
  } else {
    const db = readJSONDb();
    const newId = db.teams.length > 0 ? Math.max(...db.teams.map(t => t.id)) + 1 : 1;
    const league = db.leagues.find(l => l.sport === teamData.sport) || db.leagues[0];
    const newTeam = {
      id: newId,
      name: teamData.name,
      short_name: teamData.short_name,
      logo: teamData.logo || '⚽',
      league_id: league ? league.id : 1
    };
    db.teams.push(newTeam);
    writeJSONDb(db);
    return newTeam;
  }
};

export const resetDb = async () => {
  if (usePostgres) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DROP TABLE IF EXISTS matches CASCADE');
      await client.query('DROP TABLE IF EXISTS teams CASCADE');
      await client.query('DROP TABLE IF EXISTS leagues CASCADE');
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error resetting database in Postgres:', err);
    } finally {
      client.release();
    }
    await createPostgresTables();
  } else {
    writeJSONDb(DEFAULT_SEED_DATA);
  }
  return true;
};
