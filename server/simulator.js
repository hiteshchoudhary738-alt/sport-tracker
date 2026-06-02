import { getCachedMatch, updateCachedMatch } from './cache.js';

// Map to store active simulation timers
const activeSimulations = new Map();

// Map to store last clock tick times for real-time manual matches
const lastClockTicks = new Map();

// Map to store last autopilot event trigger times
const lastAutopilotEvents = new Map();

// Helper to get random integer
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate simulated telemetry updates based on sport
const generateTelemetry = (sport, currentStats) => {
  const telemetry = currentStats.telemetry || { heart_rates: { home: [80, 80], away: [80, 80] }, ball_speed: 0 };
  
  // Simulated heart rates (elevated during live play)
  const homeHR = (telemetry.heart_rates.home || [130, 135, 140]).map(hr => {
    const delta = randInt(-5, 5);
    return Math.max(100, Math.min(195, hr + delta));
  });
  
  const awayHR = (telemetry.heart_rates.away || [130, 135, 140]).map(hr => {
    const delta = randInt(-5, 5);
    return Math.max(100, Math.min(195, hr + delta));
  });

  // Simulated ball speed
  const ball_speed = randInt(0, 1) === 0 ? telemetry.ball_speed : randInt(10, 120);

  // Ball Coordinates
  let ball_x = currentStats.ball_x !== undefined ? currentStats.ball_x : 50;
  let ball_y = currentStats.ball_y !== undefined ? currentStats.ball_y : 50;

  // Move ball depending on sport
  if (sport === 'Football') {
    // Smooth random walk within pitch 0-100
    ball_x = Math.max(5, Math.min(95, ball_x + randInt(-8, 8)));
    ball_y = Math.max(5, Math.min(95, ball_y + randInt(-8, 8)));
  } else if (sport === 'Basketball') {
    // Faster, wider movements
    ball_x = Math.max(5, Math.min(95, ball_x + randInt(-15, 15)));
    ball_y = Math.max(5, Math.min(45, ball_y + randInt(-10, 10)));
  } else if (sport === 'Tennis') {
    // Back and forth across the net (x=50 is net)
    if (ball_x < 50) {
      ball_x = randInt(55, 90); // Volley to right side
    } else {
      ball_x = randInt(10, 45); // Volley to left side
    }
    ball_y = randInt(10, 40);
  } else if (sport === 'Cricket') {
    // Circular bounds, moves from center outwards (bowler to batsman)
    if (randInt(0, 5) === 0) {
      // Bowled! Reset to pitch center
      ball_x = 50;
      ball_y = 50;
    } else {
      ball_x = Math.max(15, Math.min(85, ball_x + randInt(-12, 12)));
      ball_y = Math.max(15, Math.min(85, ball_y + randInt(-12, 12)));
    }
  }

  return {
    ...currentStats,
    ball_x,
    ball_y,
    telemetry: {
      heart_rates: { home: homeHR, away: awayHR },
      ball_speed
    }
  };
};

// Start simulation loop
export const startMatchSimulation = (matchId, io, intervalMs = 100) => {
  const id = parseInt(matchId);
  
  // Stop existing if any
  if (activeSimulations.has(id)) {
    clearInterval(activeSimulations.get(id));
  }
  lastClockTicks.delete(id); // Reset tick tracker
  lastAutopilotEvents.delete(id); // Reset autopilot event tracker

  console.log(`[Simulator] Starting simulation for match ${id} at ${intervalMs}ms intervals`);

  const intervalId = setInterval(() => {
    const match = getCachedMatch(id);
    if (!match || match.status !== 'live') {
      stopMatchSimulation(id);
      return;
    }

    // Increment Match Clock
    let { current_time, sport, statistics, events } = match;
    const isAutomated = match.autopilot !== false;
    
    // Time increment logic
    const now = Date.now();
    const lastTick = lastClockTicks.get(id) || now;
    const deltaMs = now - lastTick;

    if (isAutomated) {
      if (sport === 'Football') {
        current_time += 1; // 1 second increments
        if (current_time >= 5400) { // 90 mins
          // Automatically finish match
          triggerEvent(id, io, 'finish', { text: 'Full Time! Match ended.' });
          return;
        }
      } else if (sport === 'Basketball') {
        current_time += 1;
        if (current_time >= 2880) { // 48 mins
          triggerEvent(id, io, 'finish', { text: 'Game Over! Match ended.' });
          return;
        }
      } else if (sport === 'Tennis') {
        current_time += 1;
      } else if (sport === 'Cricket') {
        current_time += 1;
      } else {
        current_time += 1;
      }
      lastClockTicks.set(id, now);
    } else {
      if (match.autoIncrementClock !== false) {
        if (deltaMs >= 1000) {
          current_time += Math.floor(deltaMs / 1000);
          lastClockTicks.set(id, now - (deltaMs % 1000));
        }
      } else {
        lastClockTicks.set(id, now);
      }
    }

    // Update Telemetry & Ball Position
    const updatedStats = generateTelemetry(sport, statistics);

    // Random auto-pilot events (every 1 second of real-time)
    let extraUpdates = {};
    const lastEventTime = lastAutopilotEvents.get(id) || 0;
    if (isAutomated && (now - lastEventTime >= 1000)) {
      extraUpdates = triggerRandomAutopilotEvent(match);
      lastAutopilotEvents.set(id, now);
    }

    // Combine updates
    const finalStats = {
      ...updatedStats,
      ...(extraUpdates.statistics || {})
    };

    const finalEvents = extraUpdates.events ? [extraUpdates.events] : [];

    const updatedMatch = updateCachedMatch(id, {
      current_time,
      statistics: finalStats,
      events: finalEvents.length > 0 ? finalEvents : undefined,
      ...(extraUpdates.home_score !== undefined ? { home_score: extraUpdates.home_score } : {}),
      ...(extraUpdates.away_score !== undefined ? { away_score: extraUpdates.away_score } : {})
    });

    // Broadcast to room subscription
    io.to(`match:${id}`).emit('matchUpdate', updatedMatch);
    
    // Broadcast lightweight dashboard update
    io.emit('dashboardUpdate', {
      id: updatedMatch.id,
      status: updatedMatch.status,
      home_score: updatedMatch.home_score,
      away_score: updatedMatch.away_score,
      current_time: updatedMatch.current_time,
      statistics: updatedMatch.statistics
    });

  }, intervalMs);

  activeSimulations.set(id, intervalId);
};

// Stop simulation loop
export const stopMatchSimulation = (matchId) => {
  const id = parseInt(matchId);
  if (activeSimulations.has(id)) {
    clearInterval(activeSimulations.get(id));
    activeSimulations.delete(id);
    lastClockTicks.delete(id);
    lastAutopilotEvents.delete(id);
    console.log(`[Simulator] Stopped simulation for match ${id}`);
  }
};

// Autopilot random event generator
const triggerRandomAutopilotEvent = (match) => {
  const isHome = randInt(0, 1) === 0;
  const teamName = isHome ? match.home_team_short : match.away_team_short;
  const stats = { ...match.statistics };
  stats.players = stats.players || {};
  const homeSquad = stats.home_squad || [];
  const awaySquad = stats.away_squad || [];
  const squad = isHome ? homeSquad : awaySquad;
  
  if (match.sport === 'Football') {
    const eventType = randInt(1, 10);
    if (eventType <= 4) { // Shot
      const target = randInt(0, 1) === 0;
      const idx = isHome ? 0 : 1;
      const shooter = squad.length > 0 ? squad[randInt(0, squad.length - 1)] : null;
      if (shooter) {
        stats.players[shooter] = { ...(stats.players[shooter] || {}), shots: ((stats.players[shooter]?.shots || 0) + 1) };
      }
      const shooterText = shooter || teamName;

      if (target) {
        stats.shots_on_target[idx] += 1;
        // Check if goal
        if (randInt(0, 2) === 0) {
          const newScore = isHome ? match.home_score + 1 : match.away_score + 1;
          const assister = (shooter && squad.length > 1) ? squad.filter(p => p !== shooter)[randInt(0, squad.length - 2)] : null;
          if (shooter) {
            stats.players[shooter].goals = (stats.players[shooter].goals || 0) + 1;
          }
          if (assister) {
            stats.players[assister] = { ...(stats.players[assister] || {}), assists: ((stats.players[assister]?.assists || 0) + 1) };
          }
          return {
            home_score: isHome ? newScore : match.home_score,
            away_score: !isHome ? newScore : match.away_score,
            statistics: stats,
            events: {
              time: `${Math.floor(match.current_time / 60)}'`,
              type: 'goal',
              text: `⚽ GOAL! Great finish by ${shooter || teamName}${assister ? ' (assist by ' + assister + ')' : ''}! Score: ${isHome ? newScore : match.home_score} - ${!isHome ? newScore : match.away_score}`
            }
          };
        } else {
          return {
            statistics: stats,
            events: {
              time: `${Math.floor(match.current_time / 60)}'`,
              type: 'shot_saved',
              text: `🧤 Shot on target from ${shooterText}! Saved by the goalkeeper.`
            }
          };
        }
      } else {
        stats.shots_off_target[idx] += 1;
        return {
          statistics: stats,
          events: {
            time: `${Math.floor(match.current_time / 60)}'`,
            type: 'shot_missed',
            text: `💨 Shot by ${shooterText} goes wide off the post.`
          }
        };
      }
    } else if (eventType <= 8) { // Foul
      const idx = isHome ? 0 : 1;
      stats.fouls[idx] += 1;
      const player = squad.length > 0 ? squad[randInt(0, squad.length - 1)] : null;
      if (player) {
        stats.players[player] = { ...(stats.players[player] || {}), fouls: ((stats.players[player]?.fouls || 0) + 1) };
      }
      const playerText = player || teamName;
      
      const isCard = randInt(0, 3) === 0;
      if (isCard) {
        stats.yellow_cards[idx] += 1;
        if (player) {
          stats.players[player].yellow_cards = (stats.players[player].yellow_cards || 0) + 1;
        }
        return {
          statistics: stats,
          events: {
            time: `${Math.floor(match.current_time / 60)}'`,
            type: 'yellow_card',
            text: `🟨 Yellow Card! Booked ${playerText} for a bad tackle.`
          }
        };
      }
      return {
        statistics: stats,
        events: {
          time: `${Math.floor(match.current_time / 60)}'`,
          type: 'foul',
          text: `⚠️ Foul committed by ${playerText} in the midfield.`
        }
      };
    } else { // Possession flip
      const homePoss = randInt(35, 65);
      stats.possession = [homePoss, 100 - homePoss];
      return { statistics: stats };
    }
  } else if (match.sport === 'Basketball') {
    const pts = randInt(2, 3);
    const isThree = pts === 3;
    const newScore = isHome ? match.home_score + pts : match.away_score + pts;
    
    const idx = isHome ? 0 : 1;
    stats.field_goals[idx] += 1;
    if (isThree) stats.three_pointers[idx] += 1;

    const scorer = squad.length > 0 ? squad[randInt(0, squad.length - 1)] : null;
    const assister = (scorer && squad.length > 1) ? squad.filter(p => p !== scorer)[randInt(0, squad.length - 2)] : null;
    if (scorer) {
      stats.players[scorer] = { ...(stats.players[scorer] || {}), points: ((stats.players[scorer]?.points || 0) + pts) };
    }
    if (assister && randInt(0, 1) === 0) {
      stats.players[assister] = { ...(stats.players[assister] || {}), assists: ((stats.players[assister]?.assists || 0) + 1) };
    }

    const timeString = `${Math.floor((2880 - match.current_time) / 60)}m Q${Math.ceil(match.current_time / 720)}`;

    return {
      home_score: isHome ? newScore : match.home_score,
      away_score: !isHome ? newScore : match.away_score,
      statistics: stats,
      events: {
        time: timeString,
        type: 'point',
        text: `🏀 ${scorer || teamName} scores ${pts} points!${assister ? ' (assist by ' + assister + ')' : ''} Score: ${isHome ? newScore : match.home_score} - ${!isHome ? newScore : match.away_score}`
      }
    };
  } else if (match.sport === 'Tennis') {
    const points = ['0', '15', '30', '40', 'Ad', 'Game'];
    let curPoints = stats.current_game_score || ['0', '0'];
    let homePtIdx = points.indexOf(curPoints[0]);
    let awayPtIdx = points.indexOf(curPoints[1]);
    
    let homeScore = match.home_score;
    let awayScore = match.away_score;
    let setsScore = stats.sets_score || [];
    let isGameWon = false;
    let isSetWon = false;

    const player = isHome ? match.home_team_name : match.away_team_name;
    const opponent = isHome ? match.away_team_name : match.home_team_name;
    stats.players[player] = stats.players[player] || { aces: 0, double_faults: 0, unforced_errors: 0, points_won: 0 };
    stats.players[opponent] = stats.players[opponent] || { aces: 0, double_faults: 0, unforced_errors: 0, points_won: 0 };
    
    stats.players[player].points_won += 1;

    let subText = '';
    const pointRoll = randInt(1, 20);
    if (pointRoll === 1) { // Ace
      stats.players[player].aces += 1;
      stats.aces = stats.aces || [0, 0];
      stats.aces[isHome ? 0 : 1] += 1;
      subText = ' (Ace)';
    } else if (pointRoll === 2) { // Double fault for opponent
      stats.players[opponent].double_faults += 1;
      stats.double_faults = stats.double_faults || [0, 0];
      stats.double_faults[isHome ? 1 : 0] += 1;
      subText = ' (Double Fault)';
    } else if (pointRoll >= 3 && pointRoll <= 5) {
      stats.players[opponent].unforced_errors += 1;
      stats.unforced_errors = stats.unforced_errors || [0, 0];
      stats.unforced_errors[isHome ? 1 : 0] += 1;
      subText = ' (Unforced Error)';
    }

    if (isHome) {
      if (curPoints[0] === '40' && curPoints[1] === '40') {
        curPoints[0] = 'Ad';
      } else if (curPoints[0] === 'Ad') {
        curPoints = ['0', '0'];
        homeScore += 1;
        isGameWon = true;
      } else if (curPoints[1] === 'Ad') {
        curPoints[1] = '40'; // Deuce
      } else {
        curPoints[0] = points[homePtIdx + 1];
        if (curPoints[0] === 'Game') {
          curPoints = ['0', '0'];
          homeScore += 1;
          isGameWon = true;
        }
      }
    } else {
      if (curPoints[0] === '40' && curPoints[1] === '40') {
        curPoints[1] = 'Ad';
      } else if (curPoints[1] === 'Ad') {
        curPoints = ['0', '0'];
        awayScore += 1;
        isGameWon = true;
      } else if (curPoints[0] === 'Ad') {
        curPoints[0] = '40';
      } else {
        curPoints[1] = points[awayPtIdx + 1];
        if (curPoints[1] === 'Game') {
          curPoints = ['0', '0'];
          awayScore += 1;
          isGameWon = true;
        }
      }
    }

    if (isGameWon) {
      if (homeScore >= 6 && homeScore - awayScore >= 2) {
        setsScore.push(`${homeScore}-${awayScore}`);
        homeScore = 0;
        awayScore = 0;
        isSetWon = true;
      } else if (awayScore >= 6 && awayScore - homeScore >= 2) {
        setsScore.push(`${homeScore}-${awayScore}`);
        homeScore = 0;
        awayScore = 0;
        isSetWon = true;
      }
    }

    stats.current_game_score = curPoints;
    stats.sets_score = setsScore;

    let eventText = `🎾 Point to ${player}${subText}. Game score: ${curPoints[0]} - ${curPoints[1]}`;
    if (isGameWon) {
      eventText = `🎾 Game won by ${player}! Current Set Score: ${homeScore} - ${awayScore}`;
    }
    if (isSetWon) {
      eventText = `🏆 Set completed! Score: ${setsScore.join(', ')}`;
    }

    return {
      home_score: homeScore,
      away_score: awayScore,
      statistics: stats,
      events: {
        time: `Set ${setsScore.length + 1}`,
        type: isSetWon ? 'set' : (isGameWon ? 'game' : 'point'),
        text: eventText
      }
    };
  } else if (match.sport === 'Cricket') {
    // Ball bowled in Cricket
    const stats = { ...match.statistics };
    
    // In cricket: home is batting first, or away.
    // Let's assume team 1 (Home) bats first. When 10 wickets fall or 20 overs, team 2 (Away) bats.
    const battingIdx = stats.wickets[0] < 10 && stats.overs[0] < 20 ? 0 : 1;
    const battingTeam = battingIdx === 0 ? match.home_team_short : match.away_team_short;
    
    const outcome = randInt(0, 10);
    let runScored = 0;
    let wicketFallen = false;
    let desc = '';

    if (outcome <= 5) { // Dot, 1, 2, or 3 runs
      runScored = randInt(0, 3);
      desc = runScored === 0 ? 'No run, defended solidly.' : `${runScored} run(s) taken.`;
    } else if (outcome <= 7) { // Boundary 4 or 6
      runScored = randInt(0, 1) === 0 ? 4 : 6;
      desc = runScored === 4 ? '🏏 FOUR! Beautiful drive to the boundary!' : '🏏 SIX! Massive strike over the ropes!';
    } else if (outcome === 8) { // Wicket
      wicketFallen = true;
      desc = '🔴 OUT! Clean bowled, spectacular delivery!';
    } else { // Extras / wide
      runScored = 1;
      desc = 'Wide ball. Extra run.';
    }

    // Select striker from squad
    const squad = battingIdx === 0 ? stats.home_squad : stats.away_squad;
    const bowlingSquad = battingIdx === 0 ? stats.away_squad : stats.home_squad;
    const batsmen = { ...(stats.batsmen || {}) };
    const bowlers = { ...(stats.bowlers || {}) };
    
    let striker = stats.striker;
    let nonStriker = stats.nonStriker;
    
    if (squad && squad.length > 0) {
      const activeBatsmen = squad.filter(player => !batsmen[player]?.out);
      if (!striker || batsmen[striker]?.out || !squad.includes(striker)) {
        striker = activeBatsmen[0] || '';
      }
      if (!nonStriker || batsmen[nonStriker]?.out || !squad.includes(nonStriker) || nonStriker === striker) {
        nonStriker = activeBatsmen.find(p => p !== striker) || activeBatsmen[1] || '';
      }
    }
    
    stats.striker = striker;
    stats.nonStriker = nonStriker;
    
    // Select bowler and update bowler statistics
    let activeBowler = stats.activeBowler;
    const currentOversVal = stats.overs[battingIdx] || 0.0;
    const currentOversInt = Math.floor(currentOversVal);
    const currentBalls = Math.round((currentOversVal - currentOversInt) * 10);
    const totalBallsBowled = currentOversInt * 6 + currentBalls;

    if (bowlingSquad && bowlingSquad.length > 0) {
      if (!activeBowler || totalBallsBowled % 6 === 0) {
        const bowlerIndex = Math.floor(totalBallsBowled / 6) % bowlingSquad.length;
        activeBowler = bowlingSquad[bowlerIndex];
      }
    }
    stats.activeBowler = activeBowler || '';

    let strikerText = '';
    if (striker && !desc.includes('Wide')) {
      if (!batsmen[striker]) {
        batsmen[striker] = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false };
      }
      const bStats = { ...batsmen[striker] };
      bStats.balls += 1;
      bStats.runs += runScored;
      if (runScored === 4) bStats.fours += 1;
      if (runScored === 6) bStats.sixes += 1;
      if (wicketFallen) {
        bStats.out = true;
        stats.striker = ''; // Clear so next ball selects a new one
      }
      batsmen[striker] = bStats;
      strikerText = ` (${striker} ${bStats.runs} off ${bStats.balls}b)`;
    }
    stats.batsmen = batsmen;

    let bowlerText = '';
    if (activeBowler && !desc.includes('Wide')) {
      if (!bowlers[activeBowler]) {
        bowlers[activeBowler] = { overs: 0.0, runs: 0, wickets: 0 };
      }
      const bStats = { ...bowlers[activeBowler] };
      bStats.runs += runScored;
      if (wicketFallen) {
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
      bowlerText = ` [Bowler: ${activeBowler} ${bStats.wickets}/${bStats.runs} in ${bStats.overs} ov, Econ: ${econ}]`;
    }
    stats.bowlers = bowlers;

    // Rotate strike on odd runs (1 or 3)
    if ((runScored === 1 || runScored === 3) && !wicketFallen && !desc.includes('Wide')) {
      const temp = stats.striker;
      stats.striker = stats.nonStriker;
      stats.nonStriker = temp;
    }

    stats.runs[battingIdx] += runScored;
    if (wicketFallen) stats.wickets[battingIdx] += 1;
    
    // Increment overs (0.1, 0.2 ... 0.6 -> next over 1.0)
    let currentOvers = stats.overs[battingIdx];
    let oversInt = Math.floor(currentOvers);
    let balls = Math.round((currentOvers - oversInt) * 10);
    
    if (!desc.includes('Wide')) { // Wides don't count towards over balls
      balls += 1;
      if (balls === 6) {
        oversInt += 1;
        balls = 0;
      }
    }
    stats.overs[battingIdx] = parseFloat(`${oversInt}.${balls}`);

    // Update scores for display
    const finalScoreHome = stats.runs[0];
    const finalScoreAway = stats.runs[1];

    return {
      home_score: finalScoreHome,
      away_score: finalScoreAway,
      statistics: stats,
      events: {
        time: `Over ${stats.overs[battingIdx]}`,
        type: wicketFallen ? 'wicket' : 'runs',
        text: `🏏 ${battingTeam}: ${desc}${strikerText} Score: ${stats.runs[battingIdx]}/${stats.wickets[battingIdx]}`
      }
    };
  }
  return {};
};

// Admin triggered manual events
export const triggerEvent = (matchId, io, type, details) => {
  const id = parseInt(matchId);
  const match = getCachedMatch(id);
  if (!match) return null;

  let { home_score, away_score, statistics, events, sport } = match;
  const isHome = details.team === 'home';
  const teamName = isHome ? match.home_team_short : match.away_team_short;
  let eventText = details.text || '';
  let eventType = type;

  statistics.players = statistics.players || {};
  const squad = isHome ? statistics.home_squad : statistics.away_squad;
  const player = details.player || (squad && squad.length > 0 ? squad[Math.floor(Math.random() * squad.length)] : null);

  if (sport === 'Football') {
    const idx = isHome ? 0 : 1;
    if (type === 'goal') {
      if (isHome) home_score += 1;
      else away_score += 1;
      if (player) {
        statistics.players[player] = { ...(statistics.players[player] || {}), goals: ((statistics.players[player]?.goals || 0) + 1) };
      }
      eventText = `⚽ GOAL for ${teamName}! ${player ? 'Scored by ' + player + '.' : ''} Score: ${home_score} - ${away_score}`;
    } else if (type === 'yellow_card') {
      statistics.yellow_cards[idx] += 1;
      if (player) {
        statistics.players[player] = { ...(statistics.players[player] || {}), yellow_cards: ((statistics.players[player]?.yellow_cards || 0) + 1) };
      }
      eventText = `🟨 Yellow Card! Booked ${player || 'player'} from ${teamName} for a caution.`;
    } else if (type === 'red_card') {
      statistics.red_cards[idx] += 1;
      if (player) {
        statistics.players[player] = { ...(statistics.players[player] || {}), red_cards: ((statistics.players[player]?.red_cards || 0) + 1) };
      }
      eventText = `🟥 Red Card! Sent off ${player || 'player'} from ${teamName}!`;
    } else if (type === 'foul') {
      statistics.fouls[idx] += 1;
      if (player) {
        statistics.players[player] = { ...(statistics.players[player] || {}), fouls: ((statistics.players[player]?.fouls || 0) + 1) };
      }
      eventText = `⚠️ Foul committed by ${player || teamName}.`;
    } else if (type === 'shot') {
      const onTarget = details.onTarget !== false;
      if (player) {
        statistics.players[player] = { ...(statistics.players[player] || {}), shots: ((statistics.players[player]?.shots || 0) + 1) };
      }
      if (onTarget) {
        statistics.shots_on_target[idx] += 1;
        eventText = `🧤 Shot on target by ${player || teamName}, saved by goalkeeper.`;
      } else {
        statistics.shots_off_target[idx] += 1;
        eventText = `💨 Shot by ${player || teamName} sails high and wide.`;
      }
    }
  } else if (sport === 'Basketball') {
    const idx = isHome ? 0 : 1;
    if (type === 'point') {
      const points = parseInt(details.points || 2);
      if (isHome) home_score += points;
      else away_score += points;
      statistics.field_goals[idx] += 1;
      if (points === 3) statistics.three_pointers[idx] += 1;
      if (player) {
        statistics.players[player] = { ...(statistics.players[player] || {}), points: ((statistics.players[player]?.points || 0) + points) };
      }
      eventText = `🏀 ${player || teamName} scores ${points} points! Score: ${home_score} - ${away_score}`;
    } else if (type === 'rebound') {
      statistics.rebounds[idx] += 1;
      if (player) {
        statistics.players[player] = { ...(statistics.players[player] || {}), rebounds: ((statistics.players[player]?.rebounds || 0) + 1) };
      }
      eventText = `🏀 Rebound secured by ${player || teamName}.`;
    }
  } else if (sport === 'Tennis') {
    const idx = isHome ? 0 : 1;
    if (type === 'point' || type === 'ace' || type === 'double_fault' || type === 'unforced_error') {
      let pointTeamHome = isHome;
      if (type === 'double_fault' || type === 'unforced_error') {
        pointTeamHome = !isHome;
      }
      
      const tennisPlayer = isHome ? match.home_team_name : match.away_team_name;
      const tennisOpponent = isHome ? match.away_team_name : match.home_team_name;
      
      statistics.players = statistics.players || {};
      statistics.players[tennisPlayer] = statistics.players[tennisPlayer] || { aces: 0, double_faults: 0, unforced_errors: 0, points_won: 0 };
      statistics.players[tennisOpponent] = statistics.players[tennisOpponent] || { aces: 0, double_faults: 0, unforced_errors: 0, points_won: 0 };

      if (type === 'ace') {
        statistics.players[tennisPlayer].aces += 1;
        statistics.aces = statistics.aces || [0, 0];
        statistics.aces[isHome ? 0 : 1] += 1;
        eventText = `🎾 Ace by ${tennisPlayer}!`;
      } else if (type === 'double_fault') {
        statistics.players[tennisPlayer].double_faults += 1;
        statistics.double_faults = statistics.double_faults || [0, 0];
        statistics.double_faults[isHome ? 0 : 1] += 1;
        eventText = `🎾 Double Fault by ${tennisPlayer}!`;
      } else if (type === 'unforced_error') {
        statistics.players[tennisPlayer].unforced_errors += 1;
        statistics.unforced_errors = statistics.unforced_errors || [0, 0];
        statistics.unforced_errors[isHome ? 0 : 1] += 1;
        eventText = `🎾 Unforced Error by ${tennisPlayer}!`;
      }

      const pointWinner = pointTeamHome ? tennisPlayer : tennisOpponent;
      statistics.players[pointWinner].points_won += 1;

      const points = ['0', '15', '30', '40', 'Ad', 'Game'];
      let curPoints = statistics.current_game_score || ['0', '0'];
      let homeScore = home_score;
      let awayScore = away_score;
      let setsScore = statistics.sets_score || [];
      let isGameWon = false;
      let isSetWon = false;

      let homePtIdx = points.indexOf(curPoints[0]);
      let awayPtIdx = points.indexOf(curPoints[1]);

      if (pointTeamHome) {
        if (curPoints[0] === '40' && curPoints[1] === '40') curPoints[0] = 'Ad';
        else if (curPoints[0] === 'Ad') {
          curPoints = ['0', '0'];
          homeScore += 1;
          isGameWon = true;
        } else if (curPoints[1] === 'Ad') curPoints[1] = '40';
        else {
          curPoints[0] = points[homePtIdx + 1];
          if (curPoints[0] === 'Game') {
            curPoints = ['0', '0'];
            homeScore += 1;
            isGameWon = true;
          }
        }
      } else {
        if (curPoints[0] === '40' && curPoints[1] === '40') curPoints[1] = 'Ad';
        else if (curPoints[1] === 'Ad') {
          curPoints = ['0', '0'];
          awayScore += 1;
          isGameWon = true;
        } else if (curPoints[0] === 'Ad') curPoints[0] = '40';
        else {
          curPoints[1] = points[awayPtIdx + 1];
          if (curPoints[1] === 'Game') {
            curPoints = ['0', '0'];
            awayScore += 1;
            isGameWon = true;
          }
        }
      }

      if (isGameWon) {
        if (homeScore >= 6 && homeScore - awayScore >= 2) {
          setsScore.push(`${homeScore}-${awayScore}`);
          homeScore = 0;
          awayScore = 0;
          isSetWon = true;
        } else if (awayScore >= 6 && awayScore - homeScore >= 2) {
          setsScore.push(`${homeScore}-${awayScore}`);
          homeScore = 0;
          awayScore = 0;
          isSetWon = true;
        }
      }

      statistics.current_game_score = curPoints;
      statistics.sets_score = setsScore;
      home_score = homeScore;
      away_score = awayScore;

      if (!eventText) {
        eventText = `🎾 Point to ${pointWinner}. Game score: ${curPoints[0]} - ${curPoints[1]}`;
      } else {
        eventText += ` Point to ${pointWinner}. Game score: ${curPoints[0]} - ${curPoints[1]}`;
      }
      if (isGameWon) {
        eventText = `🎾 Game won by ${pointWinner}! Current Set Score: ${homeScore} - ${awayScore}`;
      }
      if (isSetWon) {
        eventText = `🏆 Set completed! Score: ${setsScore.join(', ')}`;
      }
    }
  } else if (sport === 'Cricket') {
    const idx = isHome ? 0 : 1;
    const stats = {
      ...statistics,
      runs: [...(statistics.runs || [0, 0])],
      wickets: [...(statistics.wickets || [0, 0])],
      overs: [...(statistics.overs || [0.0, 0.0])]
    };

    if (type === 'runs') {
      const runVal = parseInt(details.runs || 0);
      stats.runs[idx] += runVal;
      if (isHome) home_score = stats.runs[0];
      else away_score = stats.runs[1];
      
      let strikerText = '';
      let bowlerText = '';

      if (details.batsman) {
        const b = details.batsman;
        stats.batsmen = stats.batsmen || {};
        stats.batsmen[b] = stats.batsmen[b] || { runs: 0, balls: 0, fours: 0, sixes: 0, out: false };
        stats.batsmen[b].runs += runVal;
        stats.batsmen[b].balls += 1;
        if (runVal === 4) stats.batsmen[b].fours += 1;
        if (runVal === 6) stats.batsmen[b].sixes += 1;
        strikerText = ` (${b} ${stats.batsmen[b].runs} off ${stats.batsmen[b].balls}b)`;
      }
      
      if (details.bowler) {
        const bowlerName = details.bowler;
        stats.bowlers = stats.bowlers || {};
        stats.bowlers[bowlerName] = stats.bowlers[bowlerName] || { overs: 0, runs: 0, wickets: 0 };
        stats.bowlers[bowlerName].runs += runVal;
        
        const oInt = Math.floor(stats.bowlers[bowlerName].overs);
        const oBalls = Math.round((stats.bowlers[bowlerName].overs - oInt) * 10);
        let nextBalls = oBalls + 1;
        let nextOvers = oInt;
        if (nextBalls >= 6) {
          nextBalls = 0;
          nextOvers += 1;
        }
        stats.bowlers[bowlerName].overs = parseFloat(`${nextOvers}.${nextBalls}`);
        bowlerText = ` (Bowler: ${bowlerName} ${stats.bowlers[bowlerName].wickets}/${stats.bowlers[bowlerName].runs} in ${stats.bowlers[bowlerName].overs} ov)`;
      }
      
      eventText = `🏏 ${teamName}: ${runVal} run(s) scored${strikerText}${bowlerText}. Score: ${stats.runs[idx]}/${stats.wickets[idx]}`;
      if (runVal === 0) {
        eventText = `🏏 ${teamName}: Dot ball${strikerText}${bowlerText}. Score: ${stats.runs[idx]}/${stats.wickets[idx]}`;
      }
    } else if (type === 'wicket') {
      stats.wickets[idx] += 1;
      let strikerText = '';
      let bowlerText = '';

      if (details.batsman) {
        const b = details.batsman;
        stats.batsmen = stats.batsmen || {};
        stats.batsmen[b] = stats.batsmen[b] || { runs: 0, balls: 0, fours: 0, sixes: 0, out: false };
        stats.batsmen[b].out = true;
        stats.batsmen[b].balls += 1;
        strikerText = ` (${b} ${stats.batsmen[b].runs} off ${stats.batsmen[b].balls}b, OUT)`;
      }
      
      if (details.bowler) {
        const bowlerName = details.bowler;
        stats.bowlers = stats.bowlers || {};
        stats.bowlers[bowlerName] = stats.bowlers[bowlerName] || { overs: 0, runs: 0, wickets: 0 };
        stats.bowlers[bowlerName].wickets += 1;
        
        const oInt = Math.floor(stats.bowlers[bowlerName].overs);
        const oBalls = Math.round((stats.bowlers[bowlerName].overs - oInt) * 10);
        let nextBalls = oBalls + 1;
        let nextOvers = oInt;
        if (nextBalls >= 6) {
          nextBalls = 0;
          nextOvers += 1;
        }
        stats.bowlers[bowlerName].overs = parseFloat(`${nextOvers}.${nextBalls}`);
        bowlerText = ` (Bowler: ${bowlerName} ${stats.bowlers[bowlerName].wickets}/${stats.bowlers[bowlerName].runs} in ${stats.bowlers[bowlerName].overs} ov)`;
      }

      eventText = `🔴 WICKET! ${teamName} loses a wicket!${strikerText}${bowlerText}. Score: ${stats.runs[idx]}/${stats.wickets[idx]}`;
    } else if (type === 'over_increment') {
      let currentOverVal = stats.overs[idx] || 0.0;
      let oversInt = Math.floor(currentOverVal);
      let balls = Math.round((currentOverVal - oversInt) * 10) + 1;
      if (balls >= 6) {
        oversInt += 1;
        balls = 0;
      }
      stats.overs[idx] = parseFloat(`${oversInt}.${balls}`);
      eventText = `🏏 Ball bowled for ${teamName}. Current Overs: ${stats.overs[idx]}`;
    }
    
    if (isHome) home_score = stats.runs[0];
    else away_score = stats.runs[1];

    statistics = stats;
  }

  const timeLabel = sport === 'Football' ? `${Math.floor(match.current_time / 60)}'` : 'Live';
  const newEvent = {
    time: timeLabel,
    type: eventType,
    text: eventText
  };

  const updatedMatch = updateCachedMatch(id, {
    home_score,
    away_score,
    statistics,
    events: [newEvent]
  });

  io.to(`match:${id}`).emit('matchUpdate', updatedMatch);
  io.emit('dashboardUpdate', {
    id: updatedMatch.id,
    status: updatedMatch.status,
    home_score: updatedMatch.home_score,
    away_score: updatedMatch.away_score,
    current_time: updatedMatch.current_time,
    statistics: updatedMatch.statistics
  });

  return updatedMatch;
};
