/**
 * High-fidelity fallback cricket data
 * Used when no RapidAPI key is provided or when upstream API rate limit is reached
 */

export const MOCK_LIVE_MATCHES = [
  {
    id: "live_101",
    series: "ICC Men's T20 World Cup",
    matchDesc: "Super 8 - Match 4",
    matchFormat: "T20",
    venue: "Kensington Oval, Bridgetown, Barbados",
    status: "Live",
    stateTitle: "India need 24 runs in 18 balls",
    team1: {
      name: "Australia",
      shortName: "AUS",
      flag: "🇦🇺",
      score: "186/6",
      overs: "20.0"
    },
    team2: {
      name: "India",
      shortName: "IND",
      flag: "🇮🇳",
      score: "163/3",
      overs: "17.0"
    },
    currentBatters: [
      { name: "Virat Kohli", runs: 72, balls: 46, fours: 7, sixes: 3, sr: 156.5, onStrike: true },
      { name: "Hardik Pandya", runs: 28, balls: 14, fours: 2, sixes: 2, sr: 200.0, onStrike: false }
    ],
    currentBowler: {
      name: "Pat Cummins",
      overs: "3.0",
      maidens: 0,
      runs: 28,
      wickets: 1,
      economy: 9.33
    },
    recentBalls: ["1", "4", "6", "0", "1", "2"]
  },
  {
    id: "live_102",
    series: "England tour of South Africa",
    matchDesc: "2nd ODI",
    matchFormat: "ODI",
    venue: "Newlands, Cape Town",
    status: "Live",
    stateTitle: "South Africa opt to bat",
    team1: {
      name: "South Africa",
      shortName: "SA",
      flag: "🇿🇦",
      score: "245/4",
      overs: "41.2"
    },
    team2: {
      name: "England",
      shortName: "ENG",
      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      score: "Yet to bat",
      overs: "-"
    },
    currentBatters: [
      { name: "Heinrich Klaasen", runs: 64, balls: 48, fours: 5, sixes: 3, sr: 133.3, onStrike: true },
      { name: "David Miller", runs: 31, balls: 26, fours: 3, sixes: 1, sr: 119.2, onStrike: false }
    ],
    currentBowler: {
      name: "Jofra Archer",
      overs: "8.2",
      maidens: 1,
      runs: 41,
      wickets: 2,
      economy: 4.92
    },
    recentBalls: ["0", "1", "1", "4", "0", "1"]
  }
];

export const MOCK_UPCOMING_MATCHES = [
  {
    id: "up_201",
    series: "Border-Gavaskar Trophy",
    matchDesc: "1st Test",
    matchFormat: "TEST",
    venue: "Optus Stadium, Perth",
    startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: "Upcoming",
    team1: { name: "Australia", shortName: "AUS", flag: "🇦🇺" },
    team2: { name: "India", shortName: "IND", flag: "🇮🇳" }
  },
  {
    id: "up_202",
    series: "Pakistan tour of New Zealand",
    matchDesc: "1st T20I",
    matchFormat: "T20",
    venue: "Eden Park, Auckland",
    startDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    status: "Upcoming",
    team1: { name: "New Zealand", shortName: "NZ", flag: "🇳🇿" },
    team2: { name: "Pakistan", shortName: "PAK", flag: "🇵🇰" }
  },
  {
    id: "up_203",
    series: "West Indies vs South Africa",
    matchDesc: "3rd T20I",
    matchFormat: "T20",
    venue: "Brian Lara Stadium, Trinidad",
    startDate: new Date(Date.now() + 86400000 * 6).toISOString(),
    status: "Upcoming",
    team1: { name: "West Indies", shortName: "WI", flag: "🌴" },
    team2: { name: "South Africa", shortName: "SA", flag: "🇿🇦" }
  }
];

export const MOCK_RECENT_MATCHES = [
  {
    id: "rec_301",
    series: "Asia Cup Championship",
    matchDesc: "Final",
    matchFormat: "ODI",
    venue: "R. Premadasa Stadium, Colombo",
    status: "Completed",
    stateTitle: "India won by 10 wickets",
    team1: { name: "Sri Lanka", shortName: "SL", flag: "🇱🇰", score: "50/10", overs: "15.2" },
    team2: { name: "India", shortName: "IND", flag: "🇮🇳", score: "51/0", overs: "6.1" },
    playerOfTheMatch: "Mohammed Siraj (6/21)"
  },
  {
    id: "rec_302",
    series: "The Ashes Series",
    matchDesc: "5th Test",
    matchFormat: "TEST",
    venue: "The Oval, London",
    status: "Completed",
    stateTitle: "England won by 49 runs",
    team1: { name: "England", shortName: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", score: "283 & 395", overs: "Final" },
    team2: { name: "Australia", shortName: "AUS", flag: "🇦🇺", score: "295 & 334", overs: "Final" },
    playerOfTheMatch: "Chris Woakes"
  }
];

export const MOCK_RANKINGS = {
  batsmen: {
    test: [
      { rank: 1, name: "Joe Root", country: "England", rating: 899, trend: "same" },
      { rank: 2, name: "Kane Williamson", country: "New Zealand", rating: 829, trend: "up" },
      { rank: 3, name: "Harry Brook", country: "England", rating: 825, trend: "up" },
      { rank: 4, name: "Yashasvi Jaiswal", country: "India", rating: 792, trend: "up" },
      { rank: 5, name: "Steve Smith", country: "Australia", rating: 757, trend: "down" },
      { rank: 6, name: "Rohit Sharma", country: "India", rating: 751, trend: "same" },
      { rank: 7, name: "Virat Kohli", country: "India", rating: 745, trend: "up" },
      { rank: 8, name: "Daryl Mitchell", country: "New Zealand", rating: 730, trend: "same" },
      { rank: 9, name: "Babar Azam", country: "Pakistan", rating: 712, trend: "down" },
      { rank: 10, name: "Rishabh Pant", country: "India", rating: 706, trend: "up" }
    ],
    odi: [
      { rank: 1, name: "Babar Azam", country: "Pakistan", rating: 824, trend: "same" },
      { rank: 2, name: "Rohit Sharma", country: "India", rating: 765, trend: "up" },
      { rank: 3, name: "Shubman Gill", country: "India", rating: 763, trend: "down" },
      { rank: 4, name: "Virat Kohli", country: "India", rating: 746, trend: "same" },
      { rank: 5, name: "Harry Tector", country: "Ireland", rating: 713, trend: "same" },
      { rank: 6, name: "Daryl Mitchell", country: "New Zealand", rating: 708, trend: "up" },
      { rank: 7, name: "David Warner", country: "Australia", rating: 689, trend: "same" },
      { rank: 8, name: "Shai Hope", country: "West Indies", rating: 678, trend: "same" },
      { rank: 9, name: "Heinrich Klaasen", country: "South Africa", rating: 669, trend: "up" },
      { rank: 10, name: "Dawid Malan", country: "England", rating: 650, trend: "down" }
    ],
    t20: [
      { rank: 1, name: "Travis Head", country: "Australia", rating: 881, trend: "same" },
      { rank: 2, name: "Suryakumar Yadav", country: "India", rating: 805, trend: "down" },
      { rank: 3, name: "Phil Salt", country: "England", rating: 798, trend: "same" },
      { rank: 4, name: "Babar Azam", country: "Pakistan", rating: 755, trend: "same" },
      { rank: 5, name: "Mohammad Rizwan", country: "Pakistan", rating: 746, trend: "down" },
      { rank: 6, name: "Jos Buttler", country: "England", rating: 726, trend: "up" },
      { rank: 7, name: "Yashasvi Jaiswal", country: "India", rating: 706, trend: "up" },
      { rank: 8, name: "Rilee Rossouw", country: "South Africa", rating: 685, trend: "same" },
      { rank: 9, name: "Nicholas Pooran", country: "West Indies", rating: 671, trend: "up" },
      { rank: 10, name: "Aiden Markram", country: "South Africa", rating: 658, trend: "down" }
    ]
  },
  bowlers: {
    test: [
      { rank: 1, name: "Jasprit Bumrah", country: "India", rating: 870, trend: "same" },
      { rank: 2, name: "Ravichandran Ashwin", country: "India", rating: 859, trend: "same" },
      { rank: 3, name: "Josh Hazlewood", country: "Australia", rating: 847, trend: "up" },
      { rank: 4, name: "Pat Cummins", country: "Australia", rating: 820, trend: "down" },
      { rank: 5, name: "Kagiso Rabada", country: "South Africa", rating: 816, trend: "same" }
    ],
    odi: [
      { rank: 1, name: "Keshav Maharaj", country: "South Africa", rating: 695, trend: "same" },
      { rank: 2, name: "Josh Hazlewood", country: "Australia", rating: 668, trend: "up" },
      { rank: 3, name: "Adam Zampa", country: "Australia", rating: 663, trend: "same" },
      { rank: 4, name: "Mohammed Siraj", country: "India", rating: 657, trend: "down" },
      { rank: 5, name: "Jasprit Bumrah", country: "India", rating: 645, trend: "up" }
    ],
    t20: [
      { rank: 1, name: "Adil Rashid", country: "England", rating: 718, trend: "same" },
      { rank: 2, name: "Anrich Nortje", country: "South Africa", rating: 675, trend: "up" },
      { rank: 3, name: "Wanindu Hasaranga", country: "Sri Lanka", rating: 671, trend: "same" },
      { rank: 4, name: "Rashid Khan", country: "Afghanistan", rating: 668, trend: "down" },
      { rank: 5, name: "Axar Patel", country: "India", rating: 660, trend: "up" }
    ]
  },
  allrounders: {
    test: [
      { rank: 1, name: "Ravindra Jadeja", country: "India", rating: 444, trend: "same" },
      { rank: 2, name: "Ravichandran Ashwin", country: "India", rating: 322, trend: "same" },
      { rank: 3, name: "Shakib Al Hasan", country: "Bangladesh", rating: 310, trend: "same" }
    ],
    odi: [
      { rank: 1, name: "Mohammad Nabi", country: "Afghanistan", rating: 320, trend: "same" },
      { rank: 2, name: "Shakib Al Hasan", country: "Bangladesh", rating: 292, trend: "same" },
      { rank: 3, name: "Sikandar Raza", country: "Zimbabwe", rating: 288, trend: "up" }
    ],
    t20: [
      { rank: 1, name: "Marcus Stoinis", country: "Australia", rating: 231, trend: "up" },
      { rank: 2, name: "Wanindu Hasaranga", country: "Sri Lanka", rating: 228, trend: "down" },
      { rank: 3, name: "Hardik Pandya", country: "India", rating: 222, trend: "up" }
    ]
  },
  teams: {
    test: [
      { rank: 1, name: "Australia", points: 3715, rating: 124 },
      { rank: 2, name: "India", points: 4108, rating: 120 },
      { rank: 3, name: "England", points: 4452, rating: 106 },
      { rank: 4, name: "South Africa", points: 2197, rating: 105 },
      { rank: 5, name: "New Zealand", points: 2321, rating: 97 }
    ],
    odi: [
      { rank: 1, name: "India", points: 6184, rating: 118 },
      { rank: 2, name: "Australia", points: 4998, rating: 116 },
      { rank: 3, name: "South Africa", points: 3881, rating: 112 },
      { rank: 4, name: "Pakistan", points: 3370, rating: 106 },
      { rank: 5, name: "New Zealand", points: 3012, rating: 101 }
    ],
    t20: [
      { rank: 1, name: "India", points: 19128, rating: 267 },
      { rank: 2, name: "Australia", points: 11985, rating: 262 },
      { rank: 3, name: "England", points: 10738, rating: 253 },
      { rank: 4, name: "West Indies", points: 12140, rating: 250 },
      { rank: 5, name: "South Africa", points: 9812, rating: 247 }
    ]
  }
};
