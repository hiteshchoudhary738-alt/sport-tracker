/**
 * CricTrack Data Manager & Storage Engine
 * Handles seed data initialization and localStorage CRUD operations
 */

const DEFAULT_PLAYERS = [
  {
    id: "p1",
    name: "Virat Kohli",
    country: "India",
    role: "Batsman",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm medium",
    photo: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80",
    stats: {
      Test: { matches: 113, runs: 8848, highest: 254, avg: 49.15, sr: 55.56, hundreds: 29, fifties: 30, wickets: 0, bestBowling: "0/0", economy: 0, bowlAvg: 0 },
      ODI:  { matches: 292, runs: 13848, highest: 183, avg: 58.67, sr: 93.58, hundreds: 50, fifties: 72, wickets: 4, bestBowling: "1/13", economy: 5.2, bowlAvg: 166.25 },
      T20:  { matches: 125, runs: 4188, highest: 122, avg: 48.69, sr: 137.04, hundreds: 1, fifties: 37, wickets: 4, bestBowling: "1/13", economy: 8.1, bowlAvg: 51.00 }
    }
  },
  {
    id: "p2",
    name: "Jasprit Bumrah",
    country: "India",
    role: "Bowler",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm fast",
    photo: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=400&q=80",
    stats: {
      Test: { matches: 36, runs: 268, highest: 34, avg: 7.65, sr: 25.10, hundreds: 0, fifties: 0, wickets: 159, bestBowling: "6/27", economy: 2.74, bowlAvg: 20.69 },
      ODI:  { matches: 89, runs: 95, highest: 14, avg: 5.27, sr: 50.00, hundreds: 0, fifties: 0, wickets: 149, bestBowling: "6/19", economy: 4.59, bowlAvg: 23.55 },
      T20:  { matches: 70, runs: 26, highest: 7, avg: 4.33, sr: 61.90, hundreds: 0, fifties: 0, wickets: 89, bestBowling: "3/7", economy: 6.27, bowlAvg: 17.74 }
    }
  },
  {
    id: "p3",
    name: "Steve Smith",
    country: "Australia",
    role: "Batsman",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm leg spin",
    photo: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=400&q=80",
    stats: {
      Test: { matches: 109, runs: 9685, highest: 239, avg: 56.97, sr: 53.80, hundreds: 32, fifties: 41, wickets: 19, bestBowling: "3/18", economy: 3.82, bowlAvg: 54.47 },
      ODI:  { matches: 158, runs: 5446, highest: 164, avg: 43.91, sr: 87.35, hundreds: 12, fifties: 33, wickets: 28, bestBowling: "3/16", economy: 5.41, bowlAvg: 38.67 },
      T20:  { matches: 67, runs: 1094, highest: 90, avg: 25.44, sr: 125.45, hundreds: 0, fifties: 5, wickets: 12, bestBowling: "3/20", economy: 7.95, bowlAvg: 22.16 }
    }
  },
  {
    id: "p4",
    name: "Rashid Khan",
    country: "Afghanistan",
    role: "Bowler",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm leg spin",
    photo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80",
    stats: {
      Test: { matches: 5, runs: 106, highest: 51, avg: 13.25, sr: 64.24, hundreds: 0, fifties: 1, wickets: 34, bestBowling: "7/137", economy: 3.25, bowlAvg: 22.35 },
      ODI:  { matches: 103, runs: 1240, highest: 60, avg: 19.37, sr: 104.91, hundreds: 0, fifties: 5, wickets: 182, bestBowling: "7/18", economy: 4.21, bowlAvg: 20.12 },
      T20:  { matches: 92, runs: 425, highest: 48, avg: 14.16, sr: 129.57, hundreds: 0, fifties: 0, wickets: 152, bestBowling: "5/3", economy: 6.08, bowlAvg: 14.42 }
    }
  },
  {
    id: "p5",
    name: "Ben Stokes",
    country: "England",
    role: "All-rounder",
    battingStyle: "Left-hand bat",
    bowlingStyle: "Right-arm fast medium",
    photo: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80",
    stats: {
      Test: { matches: 105, runs: 6508, highest: 258, avg: 35.75, sr: 59.21, hundreds: 13, fifties: 31, wickets: 203, bestBowling: "6/22", economy: 3.30, bowlAvg: 32.07 },
      ODI:  { matches: 114, runs: 3328, highest: 182, avg: 38.69, sr: 95.84, hundreds: 5, fifties: 22, wickets: 74, bestBowling: "5/61", economy: 6.05, bowlAvg: 42.39 },
      T20:  { matches: 43, runs: 585, highest: 52, avg: 21.66, sr: 128.00, hundreds: 0, fifties: 1, wickets: 26, bestBowling: "3/26", economy: 8.39, bowlAvg: 32.92 }
    }
  },
  {
    id: "p6",
    name: "Babar Azam",
    country: "Pakistan",
    role: "Batsman",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm off spin",
    photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    stats: {
      Test: { matches: 52, runs: 3898, highest: 196, avg: 45.85, sr: 54.91, hundreds: 9, fifties: 26, wickets: 2, bestBowling: "1/2", economy: 4.10, bowlAvg: 23.00 },
      ODI:  { matches: 117, runs: 5729, highest: 158, avg: 56.72, sr: 88.75, hundreds: 19, fifties: 32, wickets: 0, bestBowling: "0/0", economy: 5.50, bowlAvg: 0 },
      T20:  { matches: 119, runs: 4023, highest: 122, avg: 41.05, sr: 129.77, hundreds: 3, fifties: 36, wickets: 0, bestBowling: "0/0", economy: 6.00, bowlAvg: 0 }
    }
  },
  {
    id: "p7",
    name: "Pat Cummins",
    country: "Australia",
    role: "Bowler",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm fast",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    stats: {
      Test: { matches: 62, runs: 1289, highest: 63, avg: 17.18, sr: 43.20, hundreds: 0, fifties: 2, wickets: 269, bestBowling: "6/23", economy: 2.87, bowlAvg: 22.53 },
      ODI:  { matches: 88, runs: 442, highest: 37, avg: 12.27, sr: 78.45, hundreds: 0, fifties: 0, wickets: 141, bestBowling: "5/70", economy: 5.21, bowlAvg: 28.15 },
      T20:  { matches: 52, runs: 154, highest: 28, avg: 10.26, sr: 118.46, hundreds: 0, fifties: 0, wickets: 66, bestBowling: "3/15", economy: 7.42, bowlAvg: 22.84 }
    }
  },
  {
    id: "p8",
    name: "Heinrich Klaasen",
    country: "South Africa",
    role: "Wicket-keeper",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm off spin",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    stats: {
      Test: { matches: 4, runs: 104, highest: 35, avg: 13.00, sr: 48.14, hundreds: 0, fifties: 0, wickets: 0, bestBowling: "0/0", economy: 0, bowlAvg: 0 },
      ODI:  { matches: 54, runs: 1723, highest: 174, avg: 41.02, sr: 114.86, hundreds: 4, fifties: 6, wickets: 0, bestBowling: "0/0", economy: 6.20, bowlAvg: 0 },
      T20:  { matches: 47, runs: 912, highest: 81, avg: 24.00, sr: 147.57, hundreds: 0, fifties: 5, wickets: 0, bestBowling: "0/0", economy: 0, bowlAvg: 0 }
    }
  }
];

const DEFAULT_MATCHES = [
  {
    id: "m101",
    series: "ICC Men's T20 World Cup 2026",
    matchType: "T20",
    venue: "Narendra Modi Stadium, Ahmedabad",
    date: "2026-09-02",
    status: "Live",
    team1: { name: "India", shortName: "IND", flag: "🇮🇳" },
    team2: { name: "Australia", shortName: "AUS", flag: "🇦🇺" },
    tossInfo: "Australia won the toss and elected to bowl",
    resultText: "India batting in 1st Innings",
    team1Score: { runs: 184, wickets: 4, overs: 18.2 },
    team2Score: { runs: 0, wickets: 0, overs: 0.0 },
    currentInnings: 1,
    battingTeamShort: "IND",
    liveData: {
      currentBatsmen: [
        { name: "Virat Kohli", runs: 76, balls: 48, fours: 7, sixes: 3, isStriker: true },
        { name: "Hardik Pandya", runs: 28, balls: 14, fours: 2, sixes: 2, isStriker: false }
      ],
      currentBowler: { name: "Pat Cummins", overs: 3.2, maidens: 0, runs: 38, wickets: 1 },
      recentBalls: ["1", "4", "6", "0", "1", "W", "2", "6", "1"]
    },
    scorecard: {
      team1Innings: {
        teamName: "India",
        totalRuns: 184,
        wickets: 4,
        overs: "18.2",
        batting: [
          { player: "Rohit Sharma", status: "c Smith b Starc", runs: 42, balls: 24, fours: 5, sixes: 2, sr: 175.0 },
          { player: "Yashasvi Jaiswal", status: "b Zampa", runs: 28, balls: 19, fours: 4, sixes: 1, sr: 147.37 },
          { player: "Virat Kohli", status: "batting", runs: 76, balls: 48, fours: 7, sixes: 3, sr: 158.33 },
          { player: "Suryakumar Yadav", status: "c Maxwell b Cummins", runs: 12, balls: 8, fours: 1, sixes: 1, sr: 150.0 },
          { player: "Hardik Pandya", status: "batting", runs: 28, balls: 14, fours: 2, sixes: 2, sr: 200.0 }
        ],
        bowling: [
          { player: "Mitchell Starc", overs: "4.0", maidens: 0, runs: 42, wickets: 1, economy: "10.50" },
          { player: "Pat Cummins", overs: "3.2", maidens: 0, runs: 38, wickets: 1, economy: "11.40" },
          { player: "Adam Zampa", overs: "4.0", maidens: 0, runs: 31, wickets: 1, economy: "7.75" },
          { player: "Glenn Maxwell", overs: "3.0", maidens: 0, runs: 29, wickets: 0, economy: "9.67" },
          { player: "Marcus Stoinis", overs: "4.0", maidens: 0, runs: 40, wickets: 1, economy: "10.00" }
        ],
        extras: "8 (b 1, lb 3, w 3, nb 1)"
      },
      team2Innings: null
    },
    commentary: [
      { ball: "18.2", text: "Pat Cummins to Virat Kohli, 1 run, driven down to long-on for a single." },
      { ball: "18.1", text: "Pat Cummins to Virat Kohli, SIX! Picked up over deep mid-wicket. Majestic shot!" },
      { ball: "17.6", text: "Mitchell Starc to Hardik Pandya, FOUR! Smashed down the ground past mid-off." },
      { ball: "17.5", text: "Mitchell Starc to Suryakumar Yadav, OUT! Caught at deep cover by Glenn Maxwell!" }
    ]
  },
  {
    id: "m102",
    series: "England tour of South Africa 2026",
    matchType: "ODI",
    venue: "Newlands, Cape Town",
    date: "2026-09-01",
    status: "Completed",
    team1: { name: "South Africa", shortName: "SA", flag: "🇿🇦" },
    team2: { name: "England", shortName: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    tossInfo: "South Africa won the toss and elected to bat",
    resultText: "South Africa won by 42 runs",
    team1Score: { runs: 312, wickets: 6, overs: 50.0 },
    team2Score: { runs: 270, wickets: 10, overs: 46.4 },
    currentInnings: 2,
    battingTeamShort: "ENG",
    scorecard: {
      team1Innings: {
        teamName: "South Africa",
        totalRuns: 312,
        wickets: 6,
        overs: "50.0",
        batting: [
          { player: "Quinton de Kock", status: "c Wood b Rashid", runs: 84, balls: 78, fours: 9, sixes: 3, sr: 107.69 },
          { player: "Aiden Markram", status: "b Stokes", runs: 45, balls: 52, fours: 4, sixes: 1, sr: 86.53 },
          { player: "Heinrich Klaasen", status: "c Buttler b Wood", runs: 110, balls: 83, fours: 10, sixes: 5, sr: 132.53 }
        ],
        bowling: [
          { player: "Mark Wood", overs: "10.0", maidens: 0, runs: 65, wickets: 2, economy: "6.50" },
          { player: "Adil Rashid", overs: "10.0", maidens: 1, runs: 54, wickets: 2, economy: "5.40" },
          { player: "Ben Stokes", overs: "8.0", maidens: 0, runs: 58, wickets: 1, economy: "7.25" }
        ],
        extras: "14 (lb 6, w 7, nb 1)"
      },
      team2Innings: {
        teamName: "England",
        totalRuns: 270,
        wickets: 10,
        overs: "46.4",
        batting: [
          { player: "Jos Buttler", status: "c Klaasen b Rabada", runs: 72, balls: 64, fours: 6, sixes: 3, sr: 112.5 },
          { player: "Ben Stokes", status: "b Maharaj", runs: 61, balls: 55, fours: 5, sixes: 2, sr: 110.9 }
        ],
        bowling: [
          { player: "Kagiso Rabada", overs: "9.4", maidens: 1, runs: 48, wickets: 4, economy: "4.96" },
          { player: "Keshav Maharaj", overs: "10.0", maidens: 0, runs: 52, wickets: 3, economy: "5.20" }
        ],
        extras: "11 (lb 4, w 7)"
      }
    },
    commentary: [
      { ball: "46.4", text: "Rabada to Mark Wood, OUT! Bowled him! South Africa complete an emphatic 42-run victory!" }
    ]
  },
  {
    id: "m103",
    series: "Asia Cup T20 Trophy 2026",
    matchType: "T20",
    venue: "Sher-e-Bangla Stadium, Dhaka",
    date: "2026-09-03",
    status: "Upcoming",
    team1: { name: "Pakistan", shortName: "PAK", flag: "🇵🇰" },
    team2: { name: "Afghanistan", shortName: "AFG", flag: "🇦🇫" },
    tossInfo: "Match starts at 19:00 IST",
    resultText: "Match scheduled for tomorrow",
    team1Score: { runs: 0, wickets: 0, overs: 0 },
    team2Score: { runs: 0, wickets: 0, overs: 0 },
    currentInnings: 0,
    battingTeamShort: "",
    scorecard: null,
    commentary: []
  }
];

const DEFAULT_NEWS = [
  {
    id: "n1",
    title: "Kohli shines as India set formidable total against Australia",
    category: "Match Reports",
    date: "2026-09-02",
    summary: "Virat Kohli notched up a sparkling half-century to lead India's batting surge in the T20 World Cup clash.",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "n2",
    title: "Klaasen's century powers South Africa to series victory over England",
    category: "Series News",
    date: "2026-09-01",
    summary: "Heinrich Klaasen smashed an 83-ball 110 at Cape Town as South Africa sealed the ODI series 2-1.",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "n3",
    title: "Rashid Khan reaches milestone 150 T20 International wickets",
    category: "Milestones",
    date: "2026-08-30",
    summary: "The Afghan wizard becomes the fastest spinner in cricket history to reach 150 T20I scalps.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80"
  }
];

const STORAGE_KEYS = {
  PLAYERS: "crictrack_players",
  MATCHES: "crictrack_matches",
  NEWS: "crictrack_news",
  THEME: "crictrack_theme",
  ADMIN_AUTH: "crictrack_admin_logged_in"
};

// Initialize Storage
function initData() {
  if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(DEFAULT_PLAYERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(DEFAULT_MATCHES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NEWS)) {
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(DEFAULT_NEWS));
  }
}

initData();

// Storage CRUD Helpers
window.CricData = {
  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(DEFAULT_PLAYERS));
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(DEFAULT_MATCHES));
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(DEFAULT_NEWS));
  },

  getPlayers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYERS)) || DEFAULT_PLAYERS;
    } catch (e) {
      return DEFAULT_PLAYERS;
    }
  },
  getPlayerById(id) {
    return this.getPlayers().find(p => p.id === id);
  },
  savePlayer(playerData) {
    const players = this.getPlayers();
    if (!playerData.id) {
      playerData.id = "p_" + Date.now();
      players.push(playerData);
    } else {
      const idx = players.findIndex(p => p.id === playerData.id);
      if (idx !== -1) {
        players[idx] = playerData;
      } else {
        players.push(playerData);
      }
    }
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    return playerData;
  },
  deletePlayer(id) {
    const players = this.getPlayers().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  },

  getMatches() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MATCHES)) || DEFAULT_MATCHES;
    } catch (e) {
      return DEFAULT_MATCHES;
    }
  },
  getMatchById(id) {
    return this.getMatches().find(m => m.id === id);
  },
  saveMatch(matchData) {
    const matches = this.getMatches();
    if (!matchData.id) {
      matchData.id = "m_" + Date.now();
      matches.push(matchData);
    } else {
      const idx = matches.findIndex(m => m.id === matchData.id);
      if (idx !== -1) {
        matches[idx] = matchData;
      } else {
        matches.push(matchData);
      }
    }
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    return matchData;
  },
  deleteMatch(id) {
    const matches = this.getMatches().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  },

  getNews() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS)) || DEFAULT_NEWS;
    } catch (e) {
      return DEFAULT_NEWS;
    }
  },

  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || "dark";
  },
  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  isAdminLoggedIn() {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === "true";
  },
  setAdminLoggedIn(status) {
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, status ? "true" : "false");
  }
};
