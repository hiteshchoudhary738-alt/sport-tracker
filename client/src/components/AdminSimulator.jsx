import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Send, Plus, Trash2, Gauge } from 'lucide-react';

const AdminSimulator = ({ matches, socket, setMatches }) => {
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [fbTeam, setFbTeam] = useState('home');
  const [fbPlayer, setFbPlayer] = useState('');
  const [bbTeam, setBbTeam] = useState('home');
  const [bbPlayer, setBbPlayer] = useState('');
  const [simSpeed, setSimSpeed] = useState(200); // ms
  const [isSimulating, setIsSimulating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [creating, setCreating] = useState(false);

  // Custom commentary event state
  const [customEventText, setCustomEventText] = useState('');
  const [customEventType, setCustomEventType] = useState('custom');
  const [customEventTeam, setCustomEventTeam] = useState('none');
  const [customEventTime, setCustomEventTime] = useState('');

  // New Match Form State
  const [sport, setSport] = useState('Football');
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [activeBattingTeam, setActiveBattingTeam] = useState('home');
  const [homeSquad, setHomeSquad] = useState('');
  const [awaySquad, setAwaySquad] = useState('');
  const [striker, setStriker] = useState('');
  const [nonStriker, setNonStriker] = useState('');
  const [activeBowler, setActiveBowler] = useState('');
  const [useCustomTeams, setUseCustomTeams] = useState(false);
  const [customHomeTeamName, setCustomHomeTeamName] = useState('');
  const [customHomeTeamShort, setCustomHomeTeamShort] = useState('');
  const [customHomeTeamLogo, setCustomHomeTeamLogo] = useState('');
  const [customAwayTeamName, setCustomAwayTeamName] = useState('');
  const [customAwayTeamShort, setCustomAwayTeamShort] = useState('');
  const [customAwayTeamLogo, setCustomAwayTeamLogo] = useState('');
  const [matchStartMode, setMatchStartMode] = useState('manual');
  
  // Available Teams based on selected sport
  const [teams, setTeams] = useState([]);

  // Fetch teams on mount
  useEffect(() => {
    fetch(`http://${window.location.hostname}:5000/api/matches`) // just to ensure server is awake
      .then(() => fetch(`http://${window.location.hostname}:5000/api/matches`))
      .catch(err => console.error(err));
      
    // Populate default team options
    fetchTeams();
  }, []);

  const fetchTeams = () => {
    // We can fetch teams from our REST API if we want, or hardcode matching IDs
    // Since our db seeds specific IDs, we'll hardcode teams matching db.js
    const allTeams = [
      { id: 1, name: 'Manchester United', sport: 'Football' },
      { id: 2, name: 'Liverpool', sport: 'Football' },
      { id: 3, name: 'Chelsea', sport: 'Football' },
      { id: 4, name: 'Arsenal', sport: 'Football' },
      
      { id: 5, name: 'LA Lakers', sport: 'Basketball' },
      { id: 6, name: 'GS Warriors', sport: 'Basketball' },
      { id: 7, name: 'Boston Celtics', sport: 'Basketball' },
      { id: 8, name: 'Miami Heat', sport: 'Basketball' },
      
      { id: 9, name: 'Novak Djokovic', sport: 'Tennis' },
      { id: 10, name: 'Rafael Nadal', sport: 'Tennis' },
      { id: 11, name: 'Roger Federer', sport: 'Tennis' },
      { id: 12, name: 'Carlos Alcaraz', sport: 'Tennis' },
      
      { id: 13, name: 'Mumbai Indians', sport: 'Cricket' },
      { id: 14, name: 'Chennai Super Kings', sport: 'Cricket' },
      { id: 15, name: 'Royal Challengers', sport: 'Cricket' },
      { id: 16, name: 'Kolkata Knight Riders', sport: 'Cricket' }
    ];
    setTeams(allTeams);
  };

  const filteredTeams = teams.filter(t => t.sport === sport);

  // Set default team selections when sport changes
  useEffect(() => {
    if (filteredTeams.length >= 2) {
      setHomeTeamId(filteredTeams[0].id);
      setAwayTeamId(filteredTeams[1].id);
    }
  }, [sport, teams]);

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

  useEffect(() => {
    if (homeTeamId) {
      setHomeSquad((DEFAULT_SQUADS[homeTeamId] || []).join(', '));
    }
  }, [homeTeamId]);

  useEffect(() => {
    if (awayTeamId) {
      setAwaySquad((DEFAULT_SQUADS[awayTeamId] || []).join(', '));
    }
  }, [awayTeamId]);

  // Keep track of simulation state for selected match
  const selectedMatch = matches.find(m => m.id === parseInt(selectedMatchId));
  const [editingHomeSquad, setEditingHomeSquad] = useState('');
  const [editingAwaySquad, setEditingAwaySquad] = useState('');
  
  useEffect(() => {
    if (selectedMatch) {
      setIsSimulating(selectedMatch.status === 'live');
      setEditingHomeSquad(selectedMatch.statistics?.home_squad?.join(', ') || '');
      setEditingAwaySquad(selectedMatch.statistics?.away_squad?.join(', ') || '');
    } else {
      setIsSimulating(false);
      setEditingHomeSquad('');
      setEditingAwaySquad('');
    }
  }, [selectedMatchId, selectedMatch]);

  useEffect(() => {
    if (selectedMatch && selectedMatch.sport === 'Football') {
      const squad = fbTeam === 'home'
        ? selectedMatch.statistics?.home_squad || []
        : selectedMatch.statistics?.away_squad || [];
      setFbPlayer(squad[0] || '');
    }
  }, [fbTeam, selectedMatch?.statistics?.home_squad, selectedMatch?.statistics?.away_squad, selectedMatchId]);

  useEffect(() => {
    if (selectedMatch && selectedMatch.sport === 'Basketball') {
      const squad = bbTeam === 'home'
        ? selectedMatch.statistics?.home_squad || []
        : selectedMatch.statistics?.away_squad || [];
      setBbPlayer(squad[0] || '');
    }
  }, [bbTeam, selectedMatch?.statistics?.home_squad, selectedMatch?.statistics?.away_squad, selectedMatchId]);

  useEffect(() => {
    if (selectedMatch && selectedMatch.sport === 'Football') {
      const squad = fbTeam === 'home'
        ? selectedMatch.statistics?.home_squad || []
        : selectedMatch.statistics?.away_squad || [];
      setFbPlayer(squad[0] || '');
    }
  }, [fbTeam, selectedMatch?.statistics?.home_squad, selectedMatch?.statistics?.away_squad, selectedMatchId]);

  useEffect(() => {
    if (selectedMatch && selectedMatch.sport === 'Basketball') {
      const squad = bbTeam === 'home'
        ? selectedMatch.statistics?.home_squad || []
        : selectedMatch.statistics?.away_squad || [];
      setBbPlayer(squad[0] || '');
    }
  }, [bbTeam, selectedMatch?.statistics?.home_squad, selectedMatch?.statistics?.away_squad, selectedMatchId]);

  useEffect(() => {
    if (!selectedMatch || selectedMatch.sport !== 'Cricket') {
      setStriker('');
      setNonStriker('');
      return;
    }
    const squad = activeBattingTeam === 'home'
      ? selectedMatch.statistics?.home_squad || []
      : selectedMatch.statistics?.away_squad || [];
    
    const batsmenStats = selectedMatch.statistics?.batsmen || {};
    const activeBatsmen = squad.filter(player => !batsmenStats[player]?.out);
    
    setStriker(prev => {
      if (prev && squad.includes(prev) && !batsmenStats[prev]?.out) return prev;
      return activeBatsmen[0] || '';
    });
    setNonStriker(prev => {
      // Find what striker is going to be
      const nextStriker = (striker && squad.includes(striker) && !batsmenStats[striker]?.out) 
        ? striker 
        : (activeBatsmen[0] || '');
      if (prev && squad.includes(prev) && !batsmenStats[prev]?.out && prev !== nextStriker) return prev;
      const nextNonStriker = activeBatsmen.find(p => p !== nextStriker) || activeBatsmen[1] || '';
      return nextNonStriker;
    });
  }, [selectedMatchId, activeBattingTeam, selectedMatch?.statistics?.batsmen, selectedMatch?.statistics?.home_squad, selectedMatch?.statistics?.away_squad, striker]);
  useEffect(() => {
    if (!selectedMatch || selectedMatch.sport !== 'Cricket') {
      setActiveBowler('');
      return;
    }
    const bowlingSquad = activeBattingTeam === 'home'
      ? selectedMatch.statistics?.away_squad || []
      : selectedMatch.statistics?.home_squad || [];
    
    setActiveBowler(prev => {
      if (prev && bowlingSquad.includes(prev)) return prev;
      return bowlingSquad[0] || '';
    });
  }, [selectedMatchId, activeBattingTeam, selectedMatch?.statistics?.home_squad, selectedMatch?.statistics?.away_squad]);
  const handleResetDb = async () => {
    if (!window.confirm('Are you sure you want to reset the database? All live states will be cleared.')) return;
    setResetting(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/reset`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer admin123' }
      });
      if (res.ok) {
        alert('Database reset successful!');
        setSelectedMatchId('');
        // Re-fetch matches
        const matchesRes = await fetch(`http://${window.location.hostname}:5000/api/matches`);
        const matchesData = await matchesRes.json();
        setMatches(matchesData);
      }
    } catch (err) {
      console.error(err);
      alert('Error resetting database');
    } finally {
      setResetting(false);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      let finalHomeId = parseInt(homeTeamId);
      let finalAwayId = parseInt(awayTeamId);

      if (useCustomTeams) {
        if (!customHomeTeamName || !customHomeTeamShort || !customAwayTeamName || !customAwayTeamShort) {
          alert('Please fill out all custom team name and short name fields.');
          setCreating(false);
          return;
        }

        // Create Home Team
        const homeRes = await fetch(`http://${window.location.hostname}:5000/api/teams`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer admin123'
          },
          body: JSON.stringify({
            name: customHomeTeamName,
            short_name: customHomeTeamShort,
            logo: customHomeTeamLogo || '🏁',
            sport
          })
        });
        if (!homeRes.ok) throw new Error('Failed to create custom home team');
        const createdHome = await homeRes.json();
        finalHomeId = createdHome.id;

        // Create Away Team
        const awayRes = await fetch(`http://${window.location.hostname}:5000/api/teams`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer admin123'
          },
          body: JSON.stringify({
            name: customAwayTeamName,
            short_name: customAwayTeamShort,
            logo: customAwayTeamLogo || '🏁',
            sport
          })
        });
        if (!awayRes.ok) throw new Error('Failed to create custom away team');
        const createdAway = await awayRes.json();
        finalAwayId = createdAway.id;
      }

      if (finalHomeId === finalAwayId) {
        alert('Home and Away teams cannot be the same!');
        setCreating(false);
        return;
      }
      
      // Set up default stats schemas depending on sport
      let statistics = {};
      if (sport === 'Football') {
        statistics = { possession: [50, 50], shots_on_target: [0, 0], shots_off_target: [0, 0], fouls: [0, 0], yellow_cards: [0, 0], red_cards: [0, 0], ball_x: 50, ball_y: 50, telemetry: { heart_rates: { home: [80, 81], away: [79, 82] }, ball_speed: 0 } };
      } else if (sport === 'Basketball') {
        statistics = { possession: [50, 50], field_goals: [0, 0], three_pointers: [0, 0], rebounds: [0, 0], timeouts: [4, 4], ball_x: 50, ball_y: 25, telemetry: { heart_rates: { home: [80, 81], away: [79, 82] }, ball_speed: 0 } };
      } else if (sport === 'Tennis') {
        statistics = { current_game_score: ['0', '0'], aces: [0, 0], double_faults: [0, 0], unforced_errors: [0, 0], sets_score: [], ball_x: 50, ball_y: 25, telemetry: { heart_rates: { home: [80, 81], away: [79, 82] }, ball_speed: 0 } };
      } else if (sport === 'Cricket') {
        statistics = { runs: [0, 0], wickets: [0, 0], overs: [0.0, 0.0], ball_x: 50, ball_y: 50, telemetry: { heart_rates: { home: [72, 75], away: [70, 71] }, ball_speed: 0 } };
      } else {
        // Fallback for general matches (Chess, Esports, Snooker, Carrom, Volleyball, etc.)
        statistics = { possession: [50, 50], ball_x: 50, ball_y: 25, telemetry: { heart_rates: { home: [80, 81], away: [79, 82] } } };
      }

      // Add squad lists to statistics
      statistics.home_squad = homeSquad.split(',').map(s => s.trim()).filter(Boolean);
      statistics.away_squad = awaySquad.split(',').map(s => s.trim()).filter(Boolean);

      const newMatch = {
        sport,
        home_team_id: finalHomeId,
        away_team_id: finalAwayId,
        scheduled_time: new Date().toISOString(),
        status: 'scheduled',
        home_score: 0,
        away_score: 0,
        current_time: 0,
        autopilot: matchStartMode === 'autopilot',
        autoIncrementClock: matchStartMode === 'autopilot',
        events: [],
        statistics
      };

      const res = await fetch(`http://${window.location.hostname}:5000/api/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin123'
        },
        body: JSON.stringify(newMatch)
      });
      if (res.ok) {
        const createdMatch = await res.json();
        // Fetch new list
        const matchesRes = await fetch(`http://${window.location.hostname}:5000/api/matches`);
        const matchesData = await matchesRes.json();
        setMatches(matchesData);
        // Refresh team list to include custom teams if they were added
        fetchTeams();
        setSelectedMatchId(createdMatch.id.toString());
        
        // Reset custom fields
        setCustomHomeTeamName('');
        setCustomHomeTeamShort('');
        setCustomHomeTeamLogo('');
        setCustomAwayTeamName('');
        setCustomAwayTeamShort('');
        setCustomAwayTeamLogo('');
        
        alert('Match created successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating match');
    } finally {
      setCreating(false);
    }
  };

  const handleStartSimulation = () => {
    if (!selectedMatchId || !socket) return;
    socket.emit('adminStartMatch', { matchId: selectedMatchId, speedMs: simSpeed, token: 'admin123' });
    setIsSimulating(true);
  };

  const handlePauseSimulation = () => {
    if (!selectedMatchId || !socket) return;
    socket.emit('adminPauseMatch', { matchId: selectedMatchId, token: 'admin123' });
    setIsSimulating(false);
  };

  const handleSpeedChange = (e) => {
    const val = parseInt(e.target.value);
    setSimSpeed(val);
    if (isSimulating && socket && selectedMatchId) {
      socket.emit('adminChangeSpeed', { matchId: selectedMatchId, speedMs: val, token: 'admin123' });
    }
  };

  const handleTriggerEvent = (type, details = {}) => {
    if (!selectedMatchId || !socket) return;
    socket.emit('adminTriggerEvent', {
      matchId: selectedMatchId,
      type,
      details,
      token: 'admin123'
    });
  };

  const handleUpdateMatchState = (updates) => {
    if (!selectedMatchId || !socket) return;
    socket.emit('adminUpdateMatchState', {
      matchId: selectedMatchId,
      updates,
      token: 'admin123'
    });
  };

  const handleUpdateStatistics = (statKey, teamIndex, delta) => {
    if (!selectedMatch || !selectedMatch.statistics) return;
    const stats = { ...selectedMatch.statistics };
    if (Array.isArray(stats[statKey])) {
      const arr = [...stats[statKey]];
      arr[teamIndex] = Math.max(0, arr[teamIndex] + delta);
      stats[statKey] = arr;
    } else {
      stats[statKey] = Math.max(0, (stats[statKey] || 0) + delta);
    }
    handleUpdateMatchState({ statistics: stats });
  };

  const handleCricketScoreChange = (team, val) => {
    const idx = team === 'home' ? 0 : 1;
    const stats = { ...selectedMatch.statistics };
    const currentRuns = [...(stats.runs || [0, 0])];
    currentRuns[idx] = Math.max(0, val);
    stats.runs = currentRuns;
    handleUpdateMatchState({
      [team === 'home' ? 'home_score' : 'away_score']: Math.max(0, val),
      statistics: stats
    });
  };

  const handleCricketOversChange = (team, deltaBall, deltaOver) => {
    const idx = team === 'home' ? 0 : 1;
    const stats = { ...selectedMatch.statistics };
    const currentOvers = [...(stats.overs || [0.0, 0.0])];
    let overs = currentOvers[idx];

    if (deltaBall !== 0) {
      let oversInt = Math.floor(overs);
      let balls = Math.round((overs - oversInt) * 10) + deltaBall;
      if (balls >= 6) {
        oversInt += 1;
        balls = 0;
      } else if (balls < 0) {
        if (oversInt > 0) {
          oversInt -= 1;
          balls = 5;
        } else {
          oversInt = 0;
          balls = 0;
        }
      }
      overs = parseFloat(`${oversInt}.${balls}`);
    }

    if (deltaOver !== 0) {
      overs = Math.max(0, parseFloat((overs + deltaOver).toFixed(1)));
    }

    currentOvers[idx] = overs;
    stats.overs = currentOvers;
    handleUpdateMatchState({ statistics: stats });
  };

  const handleCricketBall = (runs, isWicket) => {
    if (!selectedMatch) return;
    const isHome = activeBattingTeam === 'home';
    const idx = isHome ? 0 : 1;
    const teamShort = isHome ? selectedMatch.home_team_short : selectedMatch.away_team_short;
    
    const stats = { ...selectedMatch.statistics };
    const currentRuns = [...(stats.runs || [0, 0])];
    const currentWickets = [...(stats.wickets || [0, 0])];
    const currentOvers = [...(stats.overs || [0.0, 0.0])];

    // Track batsman scorecard
    const batsmen = { ...(stats.batsmen || {}) };
    let strikerText = '';
    
    if (striker) {
      if (!batsmen[striker]) {
        batsmen[striker] = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false };
      }
      const bStats = { ...batsmen[striker] };
      bStats.balls += 1;
      bStats.runs += runs;
      if (runs === 4) bStats.fours += 1;
      if (runs === 6) bStats.sixes += 1;
      if (isWicket) bStats.out = true;
      batsmen[striker] = bStats;
      strikerText = ` (${striker} ${bStats.runs} off ${bStats.balls}b)`;
    }
    stats.batsmen = batsmen;

    // Track bowler scorecard
    const bowlers = { ...(stats.bowlers || {}) };
    let bowlerText = '';
    
    if (activeBowler) {
      if (!bowlers[activeBowler]) {
        bowlers[activeBowler] = { overs: 0.0, runs: 0, wickets: 0 };
      }
      const bStats = { ...bowlers[activeBowler] };
      bStats.runs += runs;
      if (isWicket) {
        bStats.wickets += 1;
      }
      
      let bOversVal = bStats.overs || 0.0;
      let bOversInt = Math.floor(bOversVal);
      let bBalls = Math.round((bOversVal - bOversInt) * 10) + 1;
      if (bBalls >= 6) {
        bOversInt += 1;
        bBalls = 0;
      }
      bStats.overs = parseFloat(`${bOversInt}.${bBalls}`);
      bowlers[activeBowler] = bStats;
      
      const totalBowlerBalls = bOversInt * 6 + bBalls;
      const econ = totalBowlerBalls > 0 
        ? ((bStats.runs / (totalBowlerBalls / 6))).toFixed(2)
        : '0.00';
      bowlerText = ` (Bowler: ${activeBowler} ${bStats.wickets}/${bStats.runs} in ${bStats.overs} ov, Econ: ${econ})`;
    }
    stats.bowlers = bowlers;

    // Update Runs
    currentRuns[idx] = Math.max(0, currentRuns[idx] + runs);
    stats.runs = currentRuns;

    // Update Wickets
    if (isWicket) {
      currentWickets[idx] = Math.min(10, currentWickets[idx] + 1);
    }
    stats.wickets = currentWickets;

    // Progress ball count in overs (6 balls = 1 over)
    let currentOverVal = currentOvers[idx] || 0.0;
    let oversInt = Math.floor(currentOverVal);
    let balls = Math.round((currentOverVal - oversInt) * 10) + 1;
    if (balls >= 6) {
      oversInt += 1;
      balls = 0;
    }
    currentOvers[idx] = parseFloat(`${oversInt}.${balls}`);
    stats.overs = currentOvers;

    // Auto-swap strike on odd runs (1 or 3)
    if ((runs === 1 || runs === 3) && !isWicket) {
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    }

    // Create custom event text
    const displayScore = `${currentRuns[idx]}/${currentWickets[idx]}`;
    const displayOvers = `${currentOvers[idx]}`;
    let eventText = `🏏 ${teamShort}: ${runs} run(s) scored${strikerText}${bowlerText}. Score: ${displayScore} (${displayOvers} ov)`;
    if (runs === 0 && !isWicket) {
      eventText = `🏏 ${teamShort}: Dot ball${strikerText}${bowlerText}. Score: ${displayScore} (${displayOvers} ov)`;
    } else if (runs === 4 && !isWicket) {
      eventText = `🏏 BOUNDARY! Four runs for ${striker || teamShort}!${bowlerText} Score: ${displayScore} (${displayOvers} ov)`;
    } else if (runs === 6 && !isWicket) {
      eventText = `🏏 SIX! Magnificent hit by ${striker || teamShort}!${bowlerText} Score: ${displayScore} (${displayOvers} ov)`;
    } else if (isWicket) {
      eventText = `🔴 WICKET! ${striker || 'Batsman'} from ${teamShort} is OUT!${bowlerText} Score: ${displayScore} (${displayOvers} ov)`;
    }

    const newEvent = {
      time: `Over ${displayOvers}`,
      type: isWicket ? 'wicket' : 'runs',
      text: eventText
    };

    handleUpdateMatchState({
      home_score: currentRuns[0],
      away_score: currentRuns[1],
      statistics: stats,
      events: [newEvent]
    });
  };

  const handleAddCustomEvent = (e) => {
    e.preventDefault();
    if (!selectedMatchId || !socket || !customEventText.trim()) return;

    let timeLabel = customEventTime.trim();
    if (!timeLabel) {
      if (selectedMatch.sport === 'Football') {
        timeLabel = `${Math.floor(selectedMatch.current_time / 60)}'`;
      } else if (selectedMatch.sport === 'Basketball') {
        const quarter = Math.min(4, Math.ceil(selectedMatch.current_time / 720) || 1);
        const minLeft = Math.floor((selectedMatch.current_time % 720) / 60);
        timeLabel = `Q${quarter} - ${minLeft}m`;
      } else if (selectedMatch.sport === 'Tennis') {
        timeLabel = 'Live';
      } else if (selectedMatch.sport === 'Cricket') {
        const battingIdx = (selectedMatch.statistics?.wickets?.[0] || 0) < 10 ? 0 : 1;
        timeLabel = `Over ${selectedMatch.statistics?.overs?.[battingIdx] || '0.0'}`;
      } else {
        timeLabel = 'Live';
      }
    }

    const teamShort = customEventTeam === 'home' 
      ? selectedMatch.home_team_short 
      : customEventTeam === 'away' 
        ? selectedMatch.away_team_short 
        : '';
        
    let prefixedText = customEventText;
    if (customEventType === 'goal') {
      prefixedText = `⚽ GOAL for ${teamShort}! ${customEventText}`;
    } else if (customEventType === 'wicket') {
      prefixedText = `🔴 WICKET! ${teamShort}: ${customEventText}`;
    } else if (customEventType === 'yellow_card') {
      prefixedText = `🟨 Yellow Card: ${customEventText}`;
    } else if (customEventType === 'red_card') {
      prefixedText = `🟥 Red Card: ${customEventText}`;
    } else if (customEventType === 'boundary') {
      prefixedText = `🏏 Boundary! ${teamShort}: ${customEventText}`;
    } else if (customEventType === 'point') {
      prefixedText = `🏀 Point! ${teamShort}: ${customEventText}`;
    }

    socket.emit('adminUpdateMatchState', {
      matchId: selectedMatchId,
      updates: {
        events: [{
          time: timeLabel,
          type: customEventType,
          text: prefixedText
        }]
      }
    });

    setCustomEventText('');
  };

  return (
    <div className="admin-grid">
      {/* Left Column: Match Creator and Reset controls */}
      <div>
        <div className="panel">
          <h3 className="panel-title" style={{ color: 'var(--color-accent)' }}>
            <Trash2 size={18} /> System Operations
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '15px' }}>
            Clears all running active simulations and resets the leagues, teams, and schedule back to initial seed data.
          </p>
          <button className="btn btn-danger" onClick={handleResetDb} disabled={resetting}>
            <RefreshCw size={16} className={resetting ? 'heart-rate-pulse' : ''} /> {resetting ? 'Resetting DB...' : 'Reset Database to Seed'}
          </button>
        </div>

        <div className="panel">
          <h3 className="panel-title">
            <Plus size={18} /> Schedule New Match Event
          </h3>
          <form onSubmit={handleCreateMatch}>
            <div className="form-group">
              <label>Select Sport</label>
              <select value={sport} onChange={(e) => setSport(e.target.value)}>
                <option value="Football">⚽ Football</option>
                <option value="Basketball">🏀 Basketball</option>
                <option value="Tennis">🎾 Tennis</option>
                <option value="Cricket">🏏 Cricket</option>
                <option value="Volleyball">🏐 Volleyball</option>
                <option value="Chess">♟️ Chess</option>
                <option value="Esports">🎮 Esports</option>
                <option value="Table Tennis">🏓 Table Tennis</option>
                <option value="Carrom">🎯 Carrom</option>
                <option value="Snooker">🎱 Snooker</option>
                <option value="Badminton">🏸 Badminton</option>
                <option value="Kabaddi">🤼 Kabaddi</option>
                <option value="Athletics">🏃 Athletics</option>
                <option value="Kho Kho">🏃‍♂️ Kho Kho</option>
                <option value="Lawn Tennis">🎾 Lawn Tennis</option>
                <option value="Gymnasium">🤸 Gymnasium</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <input 
                type="checkbox" 
                id="useCustomTeamsCheckbox" 
                checked={useCustomTeams} 
                onChange={(e) => setUseCustomTeams(e.target.checked)} 
              />
              <label htmlFor="useCustomTeamsCheckbox" style={{ marginBottom: 0, cursor: 'pointer' }}>Enter Custom Teams Manually</label>
            </div>

            {!useCustomTeams ? (
              <>
                <div className="form-group">
                  <label>Home Team / Player A</label>
                  <select value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)}>
                    {filteredTeams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Away Team / Player B</label>
                  <select value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)}>
                    {filteredTeams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '15px', border: '1px dashed var(--border-color)' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--color-secondary)' }}>🏠 Custom Home Team Details</h5>
                  <div className="form-group">
                    <label style={{ fontSize: '11px' }}>Team Name (e.g. Mumbai Indians)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mumbai Indians" 
                      value={customHomeTeamName} 
                      onChange={(e) => setCustomHomeTeamName(e.target.value)} 
                      style={{ padding: '6px 10px', fontSize: '12px', width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '11px' }}>Short Name (e.g. MI)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MI" 
                      value={customHomeTeamShort} 
                      onChange={(e) => setCustomHomeTeamShort(e.target.value)} 
                      style={{ padding: '6px 10px', fontSize: '12px', width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '11px' }}>Logo Emoji (e.g. 🌀)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 🌀" 
                      value={customHomeTeamLogo} 
                      onChange={(e) => setCustomHomeTeamLogo(e.target.value)} 
                      style={{ padding: '6px 10px', fontSize: '12px', width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                    />
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '15px', border: '1px dashed var(--border-color)' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--color-accent)' }}>🦁 Custom Away Team Details</h5>
                  <div className="form-group">
                    <label style={{ fontSize: '11px' }}>Team Name (e.g. Chennai Super Kings)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Chennai Super Kings" 
                      value={customAwayTeamName} 
                      onChange={(e) => setCustomAwayTeamName(e.target.value)} 
                      style={{ padding: '6px 10px', fontSize: '12px', width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '11px' }}>Short Name (e.g. CSK)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CSK" 
                      value={customAwayTeamShort} 
                      onChange={(e) => setCustomAwayTeamShort(e.target.value)} 
                      style={{ padding: '6px 10px', fontSize: '12px', width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '11px' }}>Logo Emoji (e.g. 🦁)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 🦁" 
                      value={customAwayTeamLogo} 
                      onChange={(e) => setCustomAwayTeamLogo(e.target.value)} 
                      style={{ padding: '6px 10px', fontSize: '12px', width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Match Control Mode</label>
              <select value={matchStartMode} onChange={(e) => setMatchStartMode(e.target.value)} style={{ padding: '6px 10px', fontSize: '12px', width: '100%' }}>
                <option value="manual">🎯 Manual Scorer (Completely Manual updates)</option>
                <option value="autopilot">🤖 Autopilot Simulation (Automated background ticks)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Home Team Squad Players (comma separated)</label>
              <textarea 
                rows="3" 
                style={{ width: '100%', padding: '8px', fontSize: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                value={homeSquad} 
                onChange={(e) => setHomeSquad(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Away Team Squad Players (comma separated)</label>
              <textarea 
                rows="3" 
                style={{ width: '100%', padding: '8px', fontSize: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                value={awaySquad} 
                onChange={(e) => setAwaySquad(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', width: '100%' }} disabled={creating}>
              <Plus size={16} /> {creating ? 'Scheduling...' : 'Create Scheduled Match'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Live Match Simulation panel */}
      <div>
        <div className="panel">
          <h3 className="panel-title" style={{ color: 'var(--color-primary)' }}>
            <Gauge size={18} /> Live Match Telemetry Simulator
          </h3>

          <div className="form-group">
            <label>Select Match to Monitor</label>
            <select value={selectedMatchId} onChange={(e) => setSelectedMatchId(e.target.value)}>
              <option value="">-- Choose a Match --</option>
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  [{m.sport.toUpperCase()}] {m.home_team_short} vs {m.away_team_short} ({m.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {selectedMatch && (
            <div>
              {/* Control Mode Toggle */}
              <div className="control-mode-selector">
                <div 
                  className={`mode-card ${selectedMatch.autopilot !== false ? 'active autopilot' : ''}`}
                  onClick={() => handleUpdateMatchState({ autopilot: true })}
                >
                  <div className="mode-title">Autopilot</div>
                  <div className="mode-desc">Simulation mode. Automated updates.</div>
                </div>
                <div 
                  className={`mode-card ${selectedMatch.autopilot === false ? 'active' : ''}`}
                  onClick={() => handleUpdateMatchState({ autopilot: false })}
                >
                  <div className="mode-title">Manual Scorer</div>
                  <div className="mode-desc">Live match mode. Admin updates.</div>
                </div>
              </div>

              {selectedMatch.autopilot !== false ? (
                /* --- AUTOPILOT (SIMULATOR) MODE VIEW --- */
                <div>
                  <div className="simulation-control-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                          Status: {selectedMatch.status.toUpperCase()}
                        </span>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Score: {selectedMatch.home_score} - {selectedMatch.away_score}
                        </div>
                      </div>
                      
                      {isSimulating ? (
                        <button className="btn btn-accent" onClick={handlePauseSimulation}>
                          <Pause size={16} /> Pause Live Loop
                        </button>
                      ) : (
                        <button className="btn btn-primary" onClick={handleStartSimulation} disabled={selectedMatch.status === 'finished'}>
                          <Play size={16} /> Start Live Loop
                        </button>
                      )}
                    </div>

                    <div className="slider-group">
                      <div style={{ display: 'flex', justifySelf: 'space-between', width: '100%', alignItems: 'center' }}>
                        <label>Broadcast Broadcast Interval: {simSpeed}ms</label>
                        <span style={{ marginLeft: 'auto', background: 'rgba(0,229,255,0.1)', color: 'var(--color-secondary)', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>
                          {Math.round(1000 / simSpeed)} Updates/Sec
                        </span>
                      </div>
                      
                      <input
                        type="range"
                        min="10"
                        max="1000"
                        step="10"
                        value={simSpeed}
                        onChange={handleSpeedChange}
                        disabled={selectedMatch.status === 'finished'}
                      />
                      <div className="slider-labels">
                        <span>Ultra-Low Latency (10ms)</span>
                        <span>Standard (1000ms)</span>
                      </div>
                    </div>
                  </div>

                  {/* Event Triggers based on sport */}
                  <div>
                    <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                      Trigger Real-time Events
                    </h4>

                    {/* Football Event Triggers */}
                    {selectedMatch.sport === 'Football' && (
                      <div className="event-triggers-grid">
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('goal', { team: 'home' })}>
                          ⚽ Goal {selectedMatch.home_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('goal', { team: 'away' })}>
                          ⚽ Goal {selectedMatch.away_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('shot', { team: 'home', onTarget: true })}>
                          🧤 Shot Target Home
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('shot', { team: 'away', onTarget: true })}>
                          🧤 Shot Target Away
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('yellow_card', { team: 'home' })}>
                          🟨 Yellow Home
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('yellow_card', { team: 'away' })}>
                          🟨 Yellow Away
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('red_card', { team: 'home' })}>
                          🟥 Red Home
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('red_card', { team: 'away' })}>
                          🟥 Red Away
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('foul', { team: 'home' })}>
                          ⚠️ Foul Home
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('foul', { team: 'away' })}>
                          ⚠️ Foul Away
                        </button>
                      </div>
                    )}

                    {/* Basketball Event Triggers */}
                    {selectedMatch.sport === 'Basketball' && (
                      <div className="event-triggers-grid">
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('point', { team: 'home', points: 2 })}>
                          🏀 +2 Pts {selectedMatch.home_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('point', { team: 'away', points: 2 })}>
                          🏀 +2 Pts {selectedMatch.away_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('point', { team: 'home', points: 3 })}>
                          🏀 +3 Pts {selectedMatch.home_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('point', { team: 'away', points: 3 })}>
                          🏀 +3 Pts {selectedMatch.away_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('rebound', { team: 'home' })}>
                          🏀 Rebound Home
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('rebound', { team: 'away' })}>
                          🏀 Rebound Away
                        </button>
                      </div>
                    )}

                    {/* Tennis Event Triggers */}
                    {selectedMatch.sport === 'Tennis' && (
                      <div className="event-triggers-grid">
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('point', { team: 'home' })}>
                          🎾 Point {selectedMatch.home_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('point', { team: 'away' })}>
                          🎾 Point {selectedMatch.away_team_short}
                        </button>
                      </div>
                    )}

                    {/* Cricket Event Triggers */}
                    {selectedMatch.sport === 'Cricket' && (
                      <div className="event-triggers-grid">
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('runs', { team: 'home', runs: 1 })}>
                          🏏 Run {selectedMatch.home_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('runs', { team: 'away', runs: 1 })}>
                          🏏 Run {selectedMatch.away_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('runs', { team: 'home', runs: 4 })}>
                          🏏 4 Runs {selectedMatch.home_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('runs', { team: 'away', runs: 4 })}>
                          🏏 4 Runs {selectedMatch.away_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('runs', { team: 'home', runs: 6 })}>
                          🏏 6 Runs {selectedMatch.home_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('runs', { team: 'away', runs: 6 })}>
                          🏏 6 Runs {selectedMatch.away_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('wicket', { team: 'home' })}>
                          🔴 Wicket {selectedMatch.home_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('wicket', { team: 'away' })}>
                          🔴 Wicket {selectedMatch.away_team_short}
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('over_increment', { team: 'home' })}>
                          🏏 Ball bowled Home
                        </button>
                        <button className="event-trigger-btn" onClick={() => handleTriggerEvent('over_increment', { team: 'away' })}>
                          🏏 Ball bowled Away
                        </button>
                      </div>
                    )}

                    <button
                      className="btn btn-danger"
                      style={{ width: '100%', marginTop: '20px' }}
                      onClick={() => handleTriggerEvent('finish')}
                      disabled={selectedMatch.status === 'finished'}
                    >
                      🏆 Finish Match (Lock Score)
                    </button>
                  </div>
                </div>
              ) : (
                /* --- MANUAL SCORER VIEW --- */
                <div className="scorer-layout">
                  {/* Match status toggle */}
                  <div className="score-editor-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                        Match Clock Status: {isSimulating ? 'TICKING' : 'PAUSED'}
                      </span>
                    </div>
                    {isSimulating ? (
                      <button className="btn btn-accent" onClick={handlePauseSimulation}>
                        <Pause size={14} /> Pause Clock
                      </button>
                    ) : (
                      <button className="btn btn-primary" onClick={handleStartSimulation} disabled={selectedMatch.status === 'finished'}>
                        <Play size={14} /> Start Clock
                      </button>
                    )}
                  </div>

                  {/* Dedicated Cricket Ball-by-Ball Scorer */}
                  {selectedMatch.sport === 'Cricket' && (
                    <div className="score-editor-card">
                      <h4 className="scorer-heading">🏏 Cricket Ball-by-Ball Scorer</h4>
                      
                      {/* Innings Selector */}
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <button 
                          className={`btn ${activeBattingTeam === 'home' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                          onClick={() => setActiveBattingTeam('home')}
                        >
                          🏏 {selectedMatch.home_team_short} Batting
                        </button>
                        <button 
                          className={`btn ${activeBattingTeam === 'away' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                          onClick={() => setActiveBattingTeam('away')}
                        >
                          🏏 {selectedMatch.away_team_short} Batting
                        </button>
                      </div>

                      {/* Active Batsmen selectors */}
                      {(() => {
                        const squad = activeBattingTeam === 'home'
                          ? selectedMatch.statistics?.home_squad || []
                          : selectedMatch.statistics?.away_squad || [];
                        const bowlingSquad = activeBattingTeam === 'home'
                          ? selectedMatch.statistics?.away_squad || []
                          : selectedMatch.statistics?.home_squad || [];
                        const batsmenStats = selectedMatch.statistics?.batsmen || {};
                        return (
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Striker (On Strike)</label>
                              <select 
                                style={{ width: '100%', marginTop: '4px', padding: '6px 10px', fontSize: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                                value={striker}
                                onChange={(e) => setStriker(e.target.value)}
                              >
                                <option value="">-- Select Striker --</option>
                                {squad.map((player) => (
                                  <option key={player} value={player} disabled={player === nonStriker || batsmenStats[player]?.out}>
                                    {player} {batsmenStats[player]?.out ? '(Out)' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Non-Striker</label>
                              <select 
                                style={{ width: '100%', marginTop: '4px', padding: '6px 10px', fontSize: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                                value={nonStriker}
                                onChange={(e) => setNonStriker(e.target.value)}
                              >
                                <option value="">-- Select Non-Striker --</option>
                                {squad.map((player) => (
                                  <option key={player} value={player} disabled={player === striker || batsmenStats[player]?.out}>
                                    {player} {batsmenStats[player]?.out ? '(Out)' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Bowler</label>
                              <select 
                                style={{ width: '100%', marginTop: '4px', padding: '6px 10px', fontSize: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                                value={activeBowler}
                                onChange={(e) => setActiveBowler(e.target.value)}
                              >
                                <option value="">-- Select Bowler --</option>
                                {bowlingSquad.map((player) => (
                                  <option key={player} value={player}>
                                    {player}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Active Batsmen live status */}
                      {striker && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-primary)', marginBottom: '6px', padding: '6px 10px', background: 'rgba(0, 255, 136, 0.08)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: '6px' }}>
                          <span>★ {striker} (Striker):</span>
                          <span style={{ fontWeight: 'bold' }}>{selectedMatch.statistics?.batsmen?.[striker]?.runs || 0} runs ({selectedMatch.statistics?.batsmen?.[striker]?.balls || 0} balls)</span>
                        </div>
                      )}
                      {nonStriker && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-main)', marginBottom: '6px', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                          <span>{nonStriker} (Non-Striker):</span>
                          <span style={{ fontWeight: 'bold' }}>{selectedMatch.statistics?.batsmen?.[nonStriker]?.runs || 0} runs ({selectedMatch.statistics?.batsmen?.[nonStriker]?.balls || 0} balls)</span>
                        </div>
                      )}
                      {activeBowler && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-secondary)', marginBottom: '15px', padding: '6px 10px', background: 'rgba(0, 198, 255, 0.08)', border: '1px solid rgba(0, 198, 255, 0.2)', borderRadius: '6px' }}>
                          <span>{activeBowler} (Bowler):</span>
                          <span style={{ fontWeight: 'bold' }}>{selectedMatch.statistics?.bowlers?.[activeBowler]?.wickets || 0} / {selectedMatch.statistics?.bowlers?.[activeBowler]?.runs || 0} ({selectedMatch.statistics?.bowlers?.[activeBowler]?.overs || '0.0'} ov)</span>
                        </div>
                      )}

                      {/* Score display for active batting team */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Current Innings Score:</span>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-secondary)', marginTop: '4px' }}>
                            {selectedMatch.statistics?.runs?.[activeBattingTeam === 'home' ? 0 : 1] || 0} / {selectedMatch.statistics?.wickets?.[activeBattingTeam === 'home' ? 0 : 1] || 0}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Overs Bowled:</span>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-main)', marginTop: '4px' }}>
                            {selectedMatch.statistics?.overs?.[activeBattingTeam === 'home' ? 0 : 1] || 0.0}
                          </div>
                        </div>
                      </div>

                      {/* Quick Ball Actions */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '15px' }}>
                        <button className="event-trigger-btn" style={{ padding: '10px' }} onClick={() => handleCricketBall(0, false)}>
                          Dot Ball
                        </button>
                        <button className="event-trigger-btn" style={{ padding: '10px' }} onClick={() => handleCricketBall(1, false)}>
                          +1 Run
                        </button>
                        <button className="event-trigger-btn" style={{ padding: '10px' }} onClick={() => handleCricketBall(2, false)}>
                          +2 Runs
                        </button>
                        <button className="event-trigger-btn" style={{ padding: '10px' }} onClick={() => handleCricketBall(3, false)}>
                          +3 Runs
                        </button>
                        <button className="event-trigger-btn" style={{ padding: '10px' }} onClick={() => handleCricketBall(4, false)}>
                          🏏 +4 Runs
                        </button>
                        <button className="event-trigger-btn" style={{ padding: '10px' }} onClick={() => handleCricketBall(6, false)}>
                          🏏 +6 Runs
                        </button>
                        <button className="event-trigger-btn btn-danger" style={{ padding: '10px', gridColumn: 'span 2', background: 'rgba(255, 65, 54, 0.15)', border: '1px solid #ff4136', color: '#ff4136' }} onClick={() => handleCricketBall(0, true)}>
                          🔴 Out (Wicket)
                        </button>
                      </div>

                      {/* Direct Manual Overs & Wickets adjusters */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Direct Overs (e.g. 15.2)</label>
                          <input 
                            type="number" 
                            step="0.1" 
                            style={{ width: '100%', marginTop: '4px', padding: '6px 10px', fontSize: '12px' }}
                            value={selectedMatch.statistics?.overs?.[activeBattingTeam === 'home' ? 0 : 1] || 0.0}
                            onChange={(e) => {
                              const stats = { ...selectedMatch.statistics };
                              const currentOvers = [...(stats.overs || [0.0, 0.0])];
                              const val = parseFloat(e.target.value || 0.0);
                              currentOvers[activeBattingTeam === 'home' ? 0 : 1] = val;
                              stats.overs = currentOvers;
                              handleUpdateMatchState({ statistics: stats });
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Direct Wickets</label>
                          <input 
                            type="number" 
                            min="0" 
                            max="10" 
                            style={{ width: '100%', marginTop: '4px', padding: '6px 10px', fontSize: '12px' }}
                            value={selectedMatch.statistics?.wickets?.[activeBattingTeam === 'home' ? 0 : 1] || 0}
                            onChange={(e) => {
                              const stats = { ...selectedMatch.statistics };
                              const currentWickets = [...(stats.wickets || [0, 0])];
                              const val = parseInt(e.target.value || 0);
                              currentWickets[activeBattingTeam === 'home' ? 0 : 1] = Math.max(0, Math.min(10, val));
                              stats.wickets = currentWickets;
                              handleUpdateMatchState({ statistics: stats });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dedicated Football Scorer */}
                  {selectedMatch.sport === 'Football' && (
                    <div className="score-editor-card">
                      <h4 className="scorer-heading">⚽ Football Event & Player Logger</h4>
                      
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <button 
                          className={`btn ${fbTeam === 'home' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                          onClick={() => setFbTeam('home')}
                        >
                          ⚽ ${selectedMatch.home_team_short} Squad
                        </button>
                        <button 
                          className={`btn ${fbTeam === 'away' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                          onClick={() => setFbTeam('away')}
                        >
                          ⚽ ${selectedMatch.away_team_short} Squad
                        </button>
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Select Player</label>
                        <select 
                          style={{ width: '100%', marginTop: '4px', padding: '6px 10px', fontSize: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                          value={fbPlayer}
                          onChange={(e) => setFbPlayer(e.target.value)}
                        >
                          <option value="">-- Select Player --</option>
                          {(fbTeam === 'home' ? selectedMatch.statistics?.home_squad || [] : selectedMatch.statistics?.away_squad || []).map((player) => (
                            <option key={player} value={player}>{player}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        <button 
                          className="event-trigger-btn" 
                          onClick={() => handleTriggerEvent('goal', { team: fbTeam, player: fbPlayer })}
                          disabled={!fbPlayer}
                        >
                          ⚽ Goal
                        </button>
                        <button 
                          className="event-trigger-btn"
                          onClick={() => handleTriggerEvent('shot', { team: fbTeam, player: fbPlayer, onTarget: true })}
                          disabled={!fbPlayer}
                        >
                          🧤 Shot Target
                        </button>
                        <button 
                          className="event-trigger-btn"
                          onClick={() => handleTriggerEvent('shot', { team: fbTeam, player: fbPlayer, onTarget: false })}
                          disabled={!fbPlayer}
                        >
                          💨 Shot Off Target
                        </button>
                        <button 
                          className="event-trigger-btn"
                          onClick={() => handleTriggerEvent('foul', { team: fbTeam, player: fbPlayer })}
                          disabled={!fbPlayer}
                        >
                          ⚠️ Foul
                        </button>
                        <button 
                          className="event-trigger-btn"
                          style={{ color: 'var(--color-warning)', borderColor: 'var(--color-warning)' }}
                          onClick={() => handleTriggerEvent('yellow_card', { team: fbTeam, player: fbPlayer })}
                          disabled={!fbPlayer}
                        >
                          🟨 Yellow Card
                        </button>
                        <button 
                          className="event-trigger-btn btn-danger"
                          onClick={() => handleTriggerEvent('red_card', { team: fbTeam, player: fbPlayer })}
                          disabled={!fbPlayer}
                        >
                          🟥 Red Card
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dedicated Basketball Scorer */}
                  {selectedMatch.sport === 'Basketball' && (
                    <div className="score-editor-card">
                      <h4 className="scorer-heading">🏀 Basketball Event & Player Logger</h4>
                      
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <button 
                          className={`btn ${bbTeam === 'home' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                          onClick={() => setBbTeam('home')}
                        >
                          🏀 ${selectedMatch.home_team_short} Squad
                        </button>
                        <button 
                          className={`btn ${bbTeam === 'away' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                          onClick={() => setBbTeam('away')}
                        >
                          🏀 ${selectedMatch.away_team_short} Squad
                        </button>
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Select Player</label>
                        <select 
                          style={{ width: '100%', marginTop: '4px', padding: '6px 10px', fontSize: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                          value={bbPlayer}
                          onChange={(e) => setBbPlayer(e.target.value)}
                        >
                          <option value="">-- Select Player --</option>
                          {(bbTeam === 'home' ? selectedMatch.statistics?.home_squad || [] : selectedMatch.statistics?.away_squad || []).map((player) => (
                            <option key={player} value={player}>{player}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        <button 
                          className="event-trigger-btn" 
                          onClick={() => handleTriggerEvent('point', { team: bbTeam, player: bbPlayer, points: 2 })}
                          disabled={!bbPlayer}
                        >
                          🏀 +2 Pts
                        </button>
                        <button 
                          className="event-trigger-btn"
                          onClick={() => handleTriggerEvent('point', { team: bbTeam, player: bbPlayer, points: 3 })}
                          disabled={!bbPlayer}
                        >
                          🏀 +3 Pts
                        </button>
                        <button 
                          className="event-trigger-btn"
                          onClick={() => handleTriggerEvent('rebound', { team: bbTeam, player: bbPlayer })}
                          disabled={!bbPlayer}
                        >
                          🏀 Rebound
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dedicated Tennis Scorer */}
                  {selectedMatch.sport === 'Tennis' && (
                    <div className="score-editor-card">
                      <h4 className="scorer-heading">🎾 Tennis Event Logger</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-primary)' }}>
                            ${selectedMatch.home_team_name} (Home)
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('point', { team: 'home' })}>
                              🎾 Win Point
                            </button>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('ace', { team: 'home' })}>
                              ⚡ Ace
                            </button>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('double_fault', { team: 'home' })}>
                              ❌ Double Fault
                            </button>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('unforced_error', { team: 'home' })}>
                              ⚠️ Unforced Error
                            </button>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-secondary)' }}>
                            ${selectedMatch.away_team_name} (Away)
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('point', { team: 'away' })}>
                              🎾 Win Point
                            </button>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('ace', { team: 'away' })}>
                              ⚡ Ace
                            </button>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('double_fault', { team: 'away' })}>
                              ❌ Double Fault
                            </button>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('unforced_error', { team: 'away' })}>
                              ⚠️ Unforced Error
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dedicated Football Scorer */}
                  {selectedMatch.sport === 'Football' && (
                    <div className="score-editor-card">
                      <h4 className="scorer-heading">⚽ Football Event & Player Logger</h4>
                      
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <button 
                          className={`btn ${fbTeam === 'home' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                          onClick={() => setFbTeam('home')}
                        >
                          ⚽ ${selectedMatch.home_team_short} Squad
                        </button>
                        <button 
                          className={`btn ${fbTeam === 'away' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                          onClick={() => setFbTeam('away')}
                        >
                          ⚽ ${selectedMatch.away_team_short} Squad
                        </button>
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Select Player</label>
                        <select 
                          style={{ width: '100%', marginTop: '4px', padding: '6px 10px', fontSize: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                          value={fbPlayer}
                          onChange={(e) => setFbPlayer(e.target.value)}
                        >
                          <option value="">-- Select Player --</option>
                          {(fbTeam === 'home' ? selectedMatch.statistics?.home_squad || [] : selectedMatch.statistics?.away_squad || []).map((player) => (
                            <option key={player} value={player}>{player}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        <button 
                          className="event-trigger-btn" 
                          onClick={() => handleTriggerEvent('goal', { team: fbTeam, player: fbPlayer })}
                          disabled={!fbPlayer}
                        >
                          ⚽ Goal
                        </button>
                        <button 
                          className="event-trigger-btn"
                          onClick={() => handleTriggerEvent('shot', { team: fbTeam, player: fbPlayer, onTarget: true })}
                          disabled={!fbPlayer}
                        >
                          🧤 Shot Target
                        </button>
                        <button 
                          className="event-trigger-btn"
                          onClick={() => handleTriggerEvent('shot', { team: fbTeam, player: fbPlayer, onTarget: false })}
                          disabled={!fbPlayer}
                        >
                          💨 Shot Off Target
                        </button>
                        <button 
                          className="event-trigger-btn"
                          onClick={() => handleTriggerEvent('foul', { team: fbTeam, player: fbPlayer })}
                          disabled={!fbPlayer}
                        >
                          ⚠️ Foul
                        </button>
                        <button 
                          className="event-trigger-btn"
                          style={{ color: 'var(--color-warning)', borderColor: 'var(--color-warning)' }}
                          onClick={() => handleTriggerEvent('yellow_card', { team: fbTeam, player: fbPlayer })}
                          disabled={!fbPlayer}
                        >
                          🟨 Yellow Card
                        </button>
                        <button 
                          className="event-trigger-btn btn-danger"
                          onClick={() => handleTriggerEvent('red_card', { team: fbTeam, player: fbPlayer })}
                          disabled={!fbPlayer}
                        >
                          🟥 Red Card
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dedicated Basketball Scorer */}
                  {selectedMatch.sport === 'Basketball' && (
                    <div className="score-editor-card">
                      <h4 className="scorer-heading">🏀 Basketball Event & Player Logger</h4>
                      
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <button 
                          className={`btn ${bbTeam === 'home' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                          onClick={() => setBbTeam('home')}
                        >
                          🏀 ${selectedMatch.home_team_short} Squad
                        </button>
                        <button 
                          className={`btn ${bbTeam === 'away' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                          onClick={() => setBbTeam('away')}
                        >
                          🏀 ${selectedMatch.away_team_short} Squad
                        </button>
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Select Player</label>
                        <select 
                          style={{ width: '100%', marginTop: '4px', padding: '6px 10px', fontSize: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)' }}
                          value={bbPlayer}
                          onChange={(e) => setBbPlayer(e.target.value)}
                        >
                          <option value="">-- Select Player --</option>
                          {(bbTeam === 'home' ? selectedMatch.statistics?.home_squad || [] : selectedMatch.statistics?.away_squad || []).map((player) => (
                            <option key={player} value={player}>{player}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        <button 
                          className="event-trigger-btn" 
                          onClick={() => handleTriggerEvent('point', { team: bbTeam, player: bbPlayer, points: 2 })}
                          disabled={!bbPlayer}
                        >
                          🏀 +2 Pts
                        </button>
                        <button 
                          className="event-trigger-btn"
                          onClick={() => handleTriggerEvent('point', { team: bbTeam, player: bbPlayer, points: 3 })}
                          disabled={!bbPlayer}
                        >
                          🏀 +3 Pts
                        </button>
                        <button 
                          className="event-trigger-btn"
                          onClick={() => handleTriggerEvent('rebound', { team: bbTeam, player: bbPlayer })}
                          disabled={!bbPlayer}
                        >
                          🏀 Rebound
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dedicated Tennis Scorer */}
                  {selectedMatch.sport === 'Tennis' && (
                    <div className="score-editor-card">
                      <h4 className="scorer-heading">🎾 Tennis Event Logger</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-primary)' }}>
                            ${selectedMatch.home_team_name} (Home)
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('point', { team: 'home' })}>
                              🎾 Win Point
                            </button>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('ace', { team: 'home' })}>
                              ⚡ Ace
                            </button>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('double_fault', { team: 'home' })}>
                              ❌ Double Fault
                            </button>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('unforced_error', { team: 'home' })}>
                              ⚠️ Unforced Error
                            </button>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-secondary)' }}>
                            ${selectedMatch.away_team_name} (Away)
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('point', { team: 'away' })}>
                              🎾 Win Point
                            </button>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('ace', { team: 'away' })}>
                              ⚡ Ace
                            </button>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('double_fault', { team: 'away' })}>
                              ❌ Double Fault
                            </button>
                            <button className="event-trigger-btn" onClick={() => handleTriggerEvent('unforced_error', { team: 'away' })}>
                              ⚠️ Unforced Error
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Clock Controls */}
                  <div className="score-editor-card">
                    <h4 className="scorer-heading">⏱️ Match Clock Controls</h4>
                    <div className="switch-container">
                      <span className="switch-label">Auto-Increment Clock (Real-Time)</span>
                      <input 
                        type="checkbox" 
                        className="switch-input"
                        checked={selectedMatch.autoIncrementClock !== false}
                        onChange={(e) => handleUpdateMatchState({ autoIncrementClock: e.target.checked })}
                      />
                    </div>

                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label>Set Time Manually</label>
                      <div className="time-adjuster-controls">
                        {selectedMatch.sport !== 'Cricket' ? (
                          <>
                            <button className="btn-circle" style={{ width: 'auto', padding: '0 8px', borderRadius: '8px' }} onClick={() => handleUpdateMatchState({ current_time: Math.max(0, selectedMatch.current_time - 60) })}>-1m</button>
                            <input 
                              type="number" 
                              style={{ width: '80px', textAlign: 'center' }} 
                              value={Math.floor(selectedMatch.current_time / 60)} 
                              onChange={(e) => handleUpdateMatchState({ current_time: Math.max(0, parseInt(e.target.value || 0) * 60) })}
                            />
                            <span style={{ color: 'var(--color-text-muted)' }}>min</span>
                            <button className="btn-circle" style={{ width: 'auto', padding: '0 8px', borderRadius: '8px' }} onClick={() => handleUpdateMatchState({ current_time: selectedMatch.current_time + 60 })}>+1m</button>
                          </>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                            <div>
                              <div className="team-label-mini" style={{ textAlign: 'left', marginBottom: '4px' }}>{selectedMatch.home_team_short} Overs:</div>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button className="btn-circle" style={{ width: 'auto', padding: '0 6px', borderRadius: '8px', fontSize: '11px' }} onClick={() => handleCricketOversChange('home', -1, 0)}>-1 Ball</button>
                                <button className="btn-circle" style={{ width: 'auto', padding: '0 6px', borderRadius: '8px', fontSize: '11px' }} onClick={() => handleCricketOversChange('home', 0, -1)}>-1 Over</button>
                                <input 
                                  type="number" 
                                  step="0.1"
                                  style={{ width: '70px', textAlign: 'center' }} 
                                  value={selectedMatch.statistics?.overs?.[0] || 0.0} 
                                  onChange={(e) => {
                                    const stats = { ...selectedMatch.statistics };
                                    const currentOvers = [...(stats.overs || [0.0, 0.0])];
                                    currentOvers[0] = parseFloat(e.target.value || 0.0);
                                    stats.overs = currentOvers;
                                    handleUpdateMatchState({ statistics: stats });
                                  }}
                                />
                                <button className="btn-circle" style={{ width: 'auto', padding: '0 6px', borderRadius: '8px', fontSize: '11px' }} onClick={() => handleCricketOversChange('home', 0, 1)}>+1 Over</button>
                                <button className="btn-circle" style={{ width: 'auto', padding: '0 6px', borderRadius: '8px', fontSize: '11px' }} onClick={() => handleCricketOversChange('home', 1, 0)}>+1 Ball</button>
                              </div>
                            </div>

                            <div>
                              <div className="team-label-mini" style={{ textAlign: 'left', marginBottom: '4px' }}>{selectedMatch.away_team_short} Overs:</div>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button className="btn-circle" style={{ width: 'auto', padding: '0 6px', borderRadius: '8px', fontSize: '11px' }} onClick={() => handleCricketOversChange('away', -1, 0)}>-1 Ball</button>
                                <button className="btn-circle" style={{ width: 'auto', padding: '0 6px', borderRadius: '8px', fontSize: '11px' }} onClick={() => handleCricketOversChange('away', 0, -1)}>-1 Over</button>
                                <input 
                                  type="number" 
                                  step="0.1"
                                  style={{ width: '70px', textAlign: 'center' }} 
                                  value={selectedMatch.statistics?.overs?.[1] || 0.0} 
                                  onChange={(e) => {
                                    const stats = { ...selectedMatch.statistics };
                                    const currentOvers = [...(stats.overs || [0.0, 0.0])];
                                    currentOvers[1] = parseFloat(e.target.value || 0.0);
                                    stats.overs = currentOvers;
                                    handleUpdateMatchState({ statistics: stats });
                                  }}
                                />
                                <button className="btn-circle" style={{ width: 'auto', padding: '0 6px', borderRadius: '8px', fontSize: '11px' }} onClick={() => handleCricketOversChange('away', 0, 1)}>+1 Over</button>
                                <button className="btn-circle" style={{ width: 'auto', padding: '0 6px', borderRadius: '8px', fontSize: '11px' }} onClick={() => handleCricketOversChange('away', 1, 0)}>+1 Ball</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scoreboard Editor */}
                  <div className="score-editor-card">
                    <h4 className="scorer-heading">📊 Live Match Scoreboard</h4>
                    <div className="score-adjuster-grid">
                      <div className="score-adjuster-team">
                        <div className="team-label-mini">{selectedMatch.home_team_short}</div>
                        <div className="score-adjuster-controls">
                          <button className="btn-circle" onClick={() => {
                            if (selectedMatch.sport === 'Cricket') {
                              handleCricketScoreChange('home', selectedMatch.home_score - 1);
                            } else {
                              handleUpdateMatchState({ home_score: Math.max(0, selectedMatch.home_score - 1) });
                            }
                          }}>-</button>
                          <input 
                            type="number" 
                            className="score-input-mini"
                            value={selectedMatch.home_score}
                            onChange={(e) => {
                              const val = parseInt(e.target.value || 0);
                              if (selectedMatch.sport === 'Cricket') {
                                handleCricketScoreChange('home', val);
                              } else {
                                handleUpdateMatchState({ home_score: Math.max(0, val) });
                              }
                            }}
                          />
                          <button className="btn-circle" onClick={() => {
                            if (selectedMatch.sport === 'Cricket') {
                              handleCricketScoreChange('home', selectedMatch.home_score + 1);
                            } else {
                              handleUpdateMatchState({ home_score: selectedMatch.home_score + 1 });
                            }
                          }}>+</button>
                        </div>
                        {selectedMatch.sport === 'Cricket' && (
                          <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                            <button className="btn" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => handleCricketScoreChange('home', selectedMatch.home_score + 4)}>+4</button>
                            <button className="btn" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => handleCricketScoreChange('home', selectedMatch.home_score + 6)}>+6</button>
                          </div>
                        )}
                      </div>

                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>VS</div>

                      <div className="score-adjuster-team">
                        <div className="team-label-mini">{selectedMatch.away_team_short}</div>
                        <div className="score-adjuster-controls">
                          <button className="btn-circle" onClick={() => {
                            if (selectedMatch.sport === 'Cricket') {
                              handleCricketScoreChange('away', selectedMatch.away_score - 1);
                            } else {
                              handleUpdateMatchState({ away_score: Math.max(0, selectedMatch.away_score - 1) });
                            }
                          }}>-</button>
                          <input 
                            type="number" 
                            className="score-input-mini"
                            value={selectedMatch.away_score}
                            onChange={(e) => {
                              const val = parseInt(e.target.value || 0);
                              if (selectedMatch.sport === 'Cricket') {
                                handleCricketScoreChange('away', val);
                              } else {
                                handleUpdateMatchState({ away_score: Math.max(0, val) });
                              }
                            }}
                          />
                          <button className="btn-circle" onClick={() => {
                            if (selectedMatch.sport === 'Cricket') {
                              handleCricketScoreChange('away', selectedMatch.away_score + 1);
                            } else {
                              handleUpdateMatchState({ away_score: selectedMatch.away_score + 1 });
                            }
                          }}>+</button>
                        </div>
                        {selectedMatch.sport === 'Cricket' && (
                          <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                            <button className="btn" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => handleCricketScoreChange('away', selectedMatch.away_score + 4)}>+4</button>
                            <button className="btn" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => handleCricketScoreChange('away', selectedMatch.away_score + 6)}>+6</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sport Specific Stats Editor */}
                  <div className="score-editor-card">
                    <h4 className="scorer-heading">📈 Sport Statistics</h4>
                    
                    {/* Football specific stats */}
                    {selectedMatch.sport === 'Football' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                          <label>Possession: {selectedMatch.statistics?.possession?.[0] || 50}% - {selectedMatch.statistics?.possession?.[1] || 50}%</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={selectedMatch.statistics?.possession?.[0] || 50}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              handleUpdateMatchState({
                                statistics: {
                                  ...selectedMatch.statistics,
                                  possession: [val, 100 - val]
                                }
                              });
                            }}
                          />
                        </div>

                        {/* Shots on Target */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>Shots on Target:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('shots_on_target', 0, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.shots_on_target?.[0] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('shots_on_target', 0, 1)}>+</button>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('shots_on_target', 1, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.shots_on_target?.[1] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('shots_on_target', 1, 1)}>+</button>
                          </div>
                        </div>

                        {/* Shots off Target */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>Shots off Target:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('shots_off_target', 0, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.shots_off_target?.[0] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('shots_off_target', 0, 1)}>+</button>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('shots_off_target', 1, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.shots_off_target?.[1] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('shots_off_target', 1, 1)}>+</button>
                          </div>
                        </div>

                        {/* Fouls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>Fouls:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('fouls', 0, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.fouls?.[0] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('fouls', 0, 1)}>+</button>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('fouls', 1, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.fouls?.[1] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('fouls', 1, 1)}>+</button>
                          </div>
                        </div>

                        {/* Yellow Cards */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>🟨 Yellow Cards:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('yellow_cards', 0, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.yellow_cards?.[0] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('yellow_cards', 0, 1)}>+</button>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('yellow_cards', 1, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.yellow_cards?.[1] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('yellow_cards', 1, 1)}>+</button>
                          </div>
                        </div>

                        {/* Red Cards */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>🟥 Red Cards:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('red_cards', 0, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.red_cards?.[0] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('red_cards', 0, 1)}>+</button>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('red_cards', 1, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.red_cards?.[1] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('red_cards', 1, 1)}>+</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Basketball specific stats */}
                    {selectedMatch.sport === 'Basketball' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                          <label>Possession: {selectedMatch.statistics?.possession?.[0] || 50}% - {selectedMatch.statistics?.possession?.[1] || 50}%</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={selectedMatch.statistics?.possession?.[0] || 50}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              handleUpdateMatchState({
                                statistics: {
                                  ...selectedMatch.statistics,
                                  possession: [val, 100 - val]
                                }
                              });
                            }}
                          />
                        </div>

                        {/* Field Goals */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>Field Goals:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('field_goals', 0, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.field_goals?.[0] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('field_goals', 0, 1)}>+</button>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('field_goals', 1, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.field_goals?.[1] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('field_goals', 1, 1)}>+</button>
                          </div>
                        </div>

                        {/* Three Pointers */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>Three Pointers:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('three_pointers', 0, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.three_pointers?.[0] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('three_pointers', 0, 1)}>+</button>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('three_pointers', 1, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.three_pointers?.[1] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('three_pointers', 1, 1)}>+</button>
                          </div>
                        </div>

                        {/* Rebounds */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>Rebounds:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('rebounds', 0, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.rebounds?.[0] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('rebounds', 0, 1)}>+</button>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('rebounds', 1, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.rebounds?.[1] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('rebounds', 1, 1)}>+</button>
                          </div>
                        </div>

                        {/* Timeouts */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>Timeouts:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('timeouts', 0, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.timeouts?.[0] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('timeouts', 0, 1)}>+</button>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('timeouts', 1, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.timeouts?.[1] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('timeouts', 1, 1)}>+</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tennis specific stats */}
                    {selectedMatch.sport === 'Tennis' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Current Game Score */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>Current Game Score:</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <select 
                              style={{ padding: '4px 8px', fontSize: '12px', width: '70px' }}
                              value={selectedMatch.statistics?.current_game_score?.[0] || '0'}
                              onChange={(e) => {
                                const stats = { ...selectedMatch.statistics };
                                const score = [...(stats.current_game_score || ['0', '0'])];
                                score[0] = e.target.value;
                                stats.current_game_score = score;
                                handleUpdateMatchState({ statistics: stats });
                              }}
                            >
                              <option value="0">0</option>
                              <option value="15">15</option>
                              <option value="30">30</option>
                              <option value="40">40</option>
                              <option value="Ad">Ad</option>
                            </select>
                            <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>-</span>
                            <select 
                              style={{ padding: '4px 8px', fontSize: '12px', width: '70px' }}
                              value={selectedMatch.statistics?.current_game_score?.[1] || '0'}
                              onChange={(e) => {
                                const stats = { ...selectedMatch.statistics };
                                const score = [...(stats.current_game_score || ['0', '0'])];
                                score[1] = e.target.value;
                                stats.current_game_score = score;
                                handleUpdateMatchState({ statistics: stats });
                              }}
                            >
                              <option value="0">0</option>
                              <option value="15">15</option>
                              <option value="30">30</option>
                              <option value="40">40</option>
                              <option value="Ad">Ad</option>
                            </select>
                          </div>
                        </div>

                        {/* Sets Score (e.g. ['6-4', '3-6']) */}
                        <div>
                          <label>Sets Score History (e.g. 6-4, 3-6)</label>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <input 
                              type="text" 
                              placeholder="6-4, 3-6"
                              style={{ flex: 1, padding: '6px 10px', fontSize: '12px' }}
                              defaultValue={selectedMatch.statistics?.sets_score?.join(', ') || ''}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                const setsArray = val ? val.split(',').map(s => s.trim()) : [];
                                const stats = { ...selectedMatch.statistics, sets_score: setsArray };
                                handleUpdateMatchState({ statistics: stats });
                              }}
                            />
                          </div>
                        </div>

                        {/* Aces */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>Aces:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('aces', 0, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.aces?.[0] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('aces', 0, 1)}>+</button>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('aces', 1, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.aces?.[1] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('aces', 1, 1)}>+</button>
                          </div>
                        </div>

                        {/* Double Faults */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>Double Faults:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('double_faults', 0, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.double_faults?.[0] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('double_faults', 0, 1)}>+</button>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('double_faults', 1, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.double_faults?.[1] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('double_faults', 1, 1)}>+</button>
                          </div>
                        </div>

                        {/* Unforced Errors */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>Unforced Errors:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('unforced_errors', 0, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.unforced_errors?.[0] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('unforced_errors', 0, 1)}>+</button>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('unforced_errors', 1, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.unforced_errors?.[1] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('unforced_errors', 1, 1)}>+</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cricket specific stats */}
                    {selectedMatch.sport === 'Cricket' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Wickets */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>Wickets:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('wickets', 0, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.wickets?.[0] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('wickets', 0, 1)}>+</button>
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('wickets', 1, -1)}>-</button>
                            <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{selectedMatch.statistics?.wickets?.[1] || 0}</span>
                            <button className="btn-circle" onClick={() => handleUpdateStatistics('wickets', 1, 1)}>+</button>
                          </div>
                        </div>

                        {/* Target Score */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px' }}>Target Runs:</span>
                          <input 
                            type="number"
                            style={{ width: '80px', padding: '4px 8px', fontSize: '12px' }}
                            value={selectedMatch.statistics?.target || 0}
                            onChange={(e) => {
                              const stats = { ...selectedMatch.statistics, target: parseInt(e.target.value || 0) };
                              handleUpdateMatchState({ statistics: stats });
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Commentary Event Creator */}
                  <div className="score-editor-card">
                    <h4 className="scorer-heading">✍️ Add Custom Timeline Event</h4>
                    <form onSubmit={handleAddCustomEvent} className="commentary-form">
                      <textarea 
                        className="commentary-textarea"
                        placeholder="Type commentary details here... (e.g. 'A stunning header from Rashford finds the back of the net!')"
                        value={customEventText}
                        onChange={(e) => setCustomEventText(e.target.value)}
                        required
                      />
                      
                      <div className="commentary-row-fields">
                        <div className="form-group">
                          <label style={{ fontSize: '10px' }}>Type</label>
                          <select 
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            value={customEventType}
                            onChange={(e) => setCustomEventType(e.target.value)}
                          >
                            <option value="custom">📝 Custom Text</option>
                            <option value="goal">⚽ Goal / Point</option>
                            <option value="wicket">🔴 Wicket</option>
                            <option value="boundary">🏏 Boundary</option>
                            <option value="yellow_card">🟨 Yellow Card</option>
                            <option value="red_card">🟥 Red Card</option>
                            <option value="foul">⚠️ Foul</option>
                            <option value="system">⚙️ System Info</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '10px' }}>Assoc. Team</label>
                          <select 
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            value={customEventTeam}
                            onChange={(e) => setCustomEventTeam(e.target.value)}
                          >
                            <option value="none">None</option>
                            <option value="home">{selectedMatch.home_team_short}</option>
                            <option value="away">{selectedMatch.away_team_short}</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '10px' }}>Time Label</label>
                          <input 
                            type="text" 
                            placeholder="Auto"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            value={customEventTime}
                            onChange={(e) => setCustomEventTime(e.target.value)}
                          />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center' }}>
                        <Send size={14} /> Log Commentary Event
                      </button>
                    </form>
                  </div>

                  {/* Team Squads Editor */}
                  <div className="score-editor-card">
                    <h4 className="scorer-heading">👥 Team Squads & Lineups</h4>
                    
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{selectedMatch.home_team_short} Squad (comma separated)</label>
                      <textarea 
                        rows="3" 
                        style={{ width: '100%', padding: '8px', fontSize: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)', marginTop: '4px' }}
                        value={editingHomeSquad} 
                        onChange={(e) => setEditingHomeSquad(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{selectedMatch.away_team_short} Squad (comma separated)</label>
                      <textarea 
                        rows="3" 
                        style={{ width: '100%', padding: '8px', fontSize: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-text-main)', marginTop: '4px' }}
                        value={editingAwaySquad} 
                        onChange={(e) => setEditingAwaySquad(e.target.value)}
                      />
                    </div>

                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', fontSize: '12px', padding: '8px' }}
                      onClick={() => {
                        const stats = {
                          ...selectedMatch.statistics,
                          home_squad: editingHomeSquad.split(',').map(s => s.trim()).filter(Boolean),
                          away_squad: editingAwaySquad.split(',').map(s => s.trim()).filter(Boolean)
                        };
                        handleUpdateMatchState({ statistics: stats });
                        alert('Squad lineups updated!');
                      }}
                    >
                      Update Squad Lineups
                    </button>
                  </div>

                  {/* Lock score / Complete Match */}
                  <button 
                    className="btn btn-danger" 
                    style={{ width: '100%' }}
                    onClick={() => {
                      if (window.confirm('Finish match? This will lock the score and mark the match as finished.')) {
                        handleUpdateMatchState({ status: 'finished' });
                      }
                    }}
                    disabled={selectedMatch.status === 'finished'}
                  >
                    🏆 Finish Match (Lock Score)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSimulator;
