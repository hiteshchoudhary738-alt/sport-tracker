import React, { useState, useEffect, useRef } from 'react';
import { Heart, Activity, Compass, ShieldAlert, Award, ArrowLeft, Send } from 'lucide-react';

const MatchDetail = ({ matchId, socket, setSelectedMatchId, setActiveTab }) => {
  const [match, setMatch] = useState(null);
  const [heartRateHistory, setHeartRateHistory] = useState({ home: [], away: [] });
  const [selectedCareerPlayer, setSelectedCareerPlayer] = useState(null);
  const [allMatches, setAllMatches] = useState([]);
  const canvasRef = useRef(null);

  // Subscribe to match specific room on mount and unsubscribe on unmount
  useEffect(() => {
    if (!matchId || !socket) return;

    // Fetch initial details
    fetch(`http://localhost:5000/api/matches/${matchId}`)
      .then(res => res.json())
      .then(data => {
        setMatch(data);
        if (data.statistics?.telemetry?.heart_rates) {
          const hr = data.statistics.telemetry.heart_rates;
          setHeartRateHistory({
            home: [hr.home[0]],
            away: [hr.away[0]]
          });
        }
      })
      .catch(err => console.error('Error fetching match details:', err));

    socket.emit('subscribeMatch', matchId);

    const handleMatchUpdate = (updatedMatch) => {
      if (parseInt(updatedMatch.id) === parseInt(matchId)) {
        setMatch(updatedMatch);
        
        // Append heart rate values to history for graphing
        if (updatedMatch.statistics?.telemetry?.heart_rates) {
          const hr = updatedMatch.statistics.telemetry.heart_rates;
          setHeartRateHistory(prev => {
            const nextHome = [...prev.home, hr.home[0]].slice(-50); // Keep last 50 points
            const nextAway = [...prev.away, hr.away[0]].slice(-50);
            return { home: nextHome, away: nextAway };
          });
        }
      }
    };

    socket.on('matchUpdate', handleMatchUpdate);

    return () => {
      socket.emit('unsubscribeMatch', matchId);
      socket.off('matchUpdate', handleMatchUpdate);
    };
  }, [matchId, socket]);

  useEffect(() => {
    if (!selectedCareerPlayer) return;
    fetch('http://localhost:5000/api/matches')
      .then(res => res.json())
      .then(data => setAllMatches(data))
      .catch(err => console.error('Error fetching matches for career stats:', err));
  }, [selectedCareerPlayer]);

  // Draw real-time canvas heart rate tracker graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || heartRateHistory.home.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 30) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    const drawLine = (history, color) => {
      if (history.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = color;

      const pointsCount = 50;
      const xStep = width / (pointsCount - 1);
      
      const minHR = 60;
      const maxHR = 200;

      history.forEach((hr, index) => {
        const x = index * xStep;
        // Normalize y to fit canvas height (inverted)
        const y = height - ((hr - minHR) / (maxHR - minHR)) * height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    };

    // Draw Home Heart Rate (Cyan)
    drawLine(heartRateHistory.home, '#00e5ff');
    // Draw Away Heart Rate (Pink/Crimson)
    drawLine(heartRateHistory.away, '#ff007f');

  }, [heartRateHistory]);

  if (!match) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--color-text-muted)' }}>
        <p>Loading real-time match statistics...</p>
      </div>
    );
  }

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  const formatClock = () => {
    if (match.status === 'scheduled') return 'Upcoming';
    if (match.status === 'finished') return 'Full Time';
    
    const sec = match.current_time || 0;
    if (match.sport === 'Football') {
      return `${Math.floor(sec / 60)}'`;
    }
    if (match.sport === 'Basketball') {
      const min = Math.floor(sec / 60);
      const remainingSec = sec % 60;
      const quarter = Math.min(4, Math.ceil(sec / 720) || 1);
      return `Q${quarter} - ${min % 12}:${remainingSec.toString().padStart(2, '0')}`;
    }
    return 'Live';
  };

  // Render SVG Pitch overlays depending on the sport type
  const renderInteractivePitch = () => {
    const ballX = match.statistics?.ball_x !== undefined ? match.statistics.ball_x : 50;
    const ballY = match.statistics?.ball_y !== undefined ? match.statistics.ball_y : 50;

    switch (match.sport) {
      case 'Football':
        return (
          <div className="pitch-container">
            <svg viewBox="0 0 100 100" className="pitch-svg">
              {/* Outer boundary */}
              <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              {/* Half-way line */}
              <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              {/* Center Circle */}
              <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.8)" />
              {/* Left Penalty Area */}
              <rect x="2" y="25" width="16" height="50" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <rect x="2" y="38" width="6" height="24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <path d="M 18,42 A 10,10 0 0,1 18,58" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              {/* Right Penalty Area */}
              <rect x="82" y="25" width="16" height="50" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <rect x="92" y="38" width="6" height="24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <path d="M 82,42 A 10,10 0 0,0 82,58" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              
              {/* Moving Ball */}
              {isLive && <circle cx={ballX} cy={ballY} r="2.2" className="pitch-ball" />}
            </svg>
          </div>
        );
      case 'Basketball':
        return (
          <div className="pitch-container court-basketball">
            <svg viewBox="0 0 100 50" className="pitch-svg">
              {/* Boundary */}
              <rect x="2" y="2" width="96" height="46" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              {/* Midcourt Line */}
              <line x1="50" y1="2" x2="50" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <circle cx="50" cy="25" r="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              {/* Left Key */}
              <rect x="2" y="17" width="19" height="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <path d="M 21,17 A 8,8 0 0,1 21,33" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              {/* Left 3pt arc */}
              <path d="M 2,5 C 25,12 25,38 2,45" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              {/* Right Key */}
              <rect x="79" y="17" width="19" height="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <path d="M 79,17 A 8,8 0 0,0 79,33" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              {/* Right 3pt arc */}
              <path d="M 98,5 C 75,12 75,38 98,45" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

              {/* Moving Ball */}
              {isLive && <circle cx={ballX} cy={ballY} r="2.5" fill="#e65c00" stroke="#000000" strokeWidth="0.8" style={{ transition: 'all 0.1s linear' }} />}
            </svg>
          </div>
        );
      case 'Tennis':
        return (
          <div className="pitch-container court-tennis">
            <svg viewBox="0 0 100 50" className="pitch-svg">
              {/* Baseline and court limits */}
              <rect x="10" y="5" width="80" height="40" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              {/* Net line */}
              <line x1="50" y1="3" x2="50" y2="47" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeDasharray="1.5 1" />
              {/* Singles lines */}
              <line x1="10" y1="9" x2="90" y2="9" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <line x1="10" y1="41" x2="90" y2="41" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              {/* Service boxes */}
              <line x1="25" y1="9" x2="25" y2="41" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <line x1="75" y1="9" x2="75" y2="41" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <line x1="25" y1="25" x2="75" y2="25" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

              {/* Moving Ball */}
              {isLive && <circle cx={ballX} cy={ballY} r="2" fill="#ccff00" stroke="#000000" strokeWidth="0.5" style={{ transition: 'all 0.1s linear' }} />}
            </svg>
          </div>
        );
      case 'Cricket':
        return (
          <div className="pitch-container court-cricket">
            <svg viewBox="0 0 100 100" className="pitch-svg">
              {/* Circular grass boundary */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              {/* Center Pitch box */}
              <rect x="44" y="32" width="12" height="36" fill="rgba(196,160,116,0.3)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
              <line x1="44" y1="36" x2="56" y2="36" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
              <line x1="44" y1="64" x2="56" y2="64" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />

              {/* Moving Ball */}
              {isLive && <circle cx={ballX} cy={ballY} r="2.2" fill="#d90429" stroke="#ffffff" strokeWidth="0.5" style={{ transition: 'all 0.1s linear' }} />}
            </svg>
          </div>
        );
      default:
        return (
          <div className="pitch-container court-generic">
            <svg viewBox="0 0 100 50" className="pitch-svg">
              {/* Outer border */}
              <rect x="2" y="2" width="96" height="46" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              {/* Center dividing net/line */}
              <line x1="50" y1="2" x2="50" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="50" cy="25" r="8" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              {/* Left & Right inner zones */}
              <rect x="15" y="10" width="20" height="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <rect x="65" y="10" width="20" height="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Telemetry Ball tracking */}
              {isLive && <circle cx={ballX} cy={ballY} r="2" fill="var(--color-primary)" stroke="#000000" strokeWidth="0.5" style={{ transition: 'all 0.1s linear' }} />}
            </svg>
          </div>
        );
    }
  };


  const renderCareerModal = () => {
    if (!selectedCareerPlayer) return null;

    // Detect Player Sport by scanning allMatches
    let playerSport = 'Cricket';
    for (const m of allMatches) {
      if (m.statistics?.home_squad?.includes(selectedCareerPlayer) || 
          m.statistics?.away_squad?.includes(selectedCareerPlayer) ||
          m.home_team_name === selectedCareerPlayer ||
          m.away_team_name === selectedCareerPlayer) {
        playerSport = m.sport;
        break;
      }
    }

    if (playerSport === 'Cricket') {
      let gamesBatted = 0;
      let totalRuns = 0;
      let totalBalls = 0;
      let totalFours = 0;
      let totalSixes = 0;
      let dismissals = 0;
      let highScore = 0;

      let gamesBowled = 0;
      let totalRunsConceded = 0;
      let totalWickets = 0;
      let totalBowlerBalls = 0;

      allMatches.forEach(m => {
        if (m.sport !== 'Cricket' || !m.statistics) return;
        const battingStats = m.statistics.batsmen?.[selectedCareerPlayer];
        if (battingStats) {
          gamesBatted += 1;
          totalRuns += battingStats.runs || 0;
          totalBalls += battingStats.balls || 0;
          totalFours += battingStats.fours || 0;
          totalSixes += battingStats.sixes || 0;
          if (battingStats.out) dismissals += 1;
          if ((battingStats.runs || 0) > highScore) highScore = battingStats.runs;
        }

        const bowlingStats = m.statistics.bowlers?.[selectedCareerPlayer];
        if (bowlingStats) {
          gamesBowled += 1;
          totalRunsConceded += bowlingStats.runs || 0;
          totalWickets += bowlingStats.wickets || 0;
          const oInt = Math.floor(bowlingStats.overs || 0);
          const oBalls = Math.round(((bowlingStats.overs || 0) - oInt) * 10);
          totalBowlerBalls += oInt * 6 + oBalls;
        }
      });

      const battingSR = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(2) : '0.00';
      const battingAvg = dismissals > 0 ? (totalRuns / dismissals).toFixed(2) : totalRuns.toFixed(2);
      const bowlerOvers = `${Math.floor(totalBowlerBalls / 6)}.${totalBowlerBalls % 6}`;
      const bowlingEcon = totalBowlerBalls > 0 ? ((totalRunsConceded / (totalBowlerBalls / 6))).toFixed(2) : '0.00';

      return renderModalWrapper(
        'Cricket Player Profile',
        gamesBowled > 0 ? 'All-Rounder' : 'Batsman',
        <>
          {/* Batting Card */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '12px', letterSpacing: '1px' }}>
              🏏 Career Batting
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Matches</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{gamesBatted}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Runs</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{totalRuns}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>High Score</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{highScore}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Average</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{battingAvg}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Strike Rate</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{battingSR}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>4s / 6s</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{totalFours} / {totalSixes}</span>
              </div>
            </div>
          </div>

          {/* Bowling Card */}
          <div>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '12px', letterSpacing: '1px' }}>
              🎯 Career Bowling
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Matches</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{gamesBowled}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Wickets</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{totalWickets}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Overs</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{bowlerOvers}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Runs Conc.</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{totalRunsConceded}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Economy</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{bowlingEcon}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Avg / SR</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {totalWickets > 0 ? (totalRunsConceded / totalWickets).toFixed(2) : '-'} / {totalWickets > 0 ? (totalBowlerBalls / totalWickets).toFixed(1) : '-'}
                </span>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (playerSport === 'Football') {
      let matchesPlayed = 0;
      let goals = 0;
      let assists = 0;
      let yellowCards = 0;
      let redCards = 0;
      let shots = 0;

      allMatches.forEach(m => {
        if (m.sport !== 'Football' || !m.statistics) return;
        const isPart = m.statistics.home_squad?.includes(selectedCareerPlayer) || 
                       m.statistics.away_squad?.includes(selectedCareerPlayer);
        if (isPart) {
          matchesPlayed += 1;
          const pStats = m.statistics.players?.[selectedCareerPlayer];
          if (pStats) {
            goals += pStats.goals || 0;
            assists += pStats.assists || 0;
            yellowCards += pStats.yellow_cards || 0;
            redCards += pStats.red_cards || 0;
            shots += pStats.shots || 0;
          }
        }
      });

      return renderModalWrapper(
        'Football Player Profile',
        goals > assists ? 'Forward' : 'Midfielder',
        <div style={{ marginBottom: '10px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '12px', letterSpacing: '1px' }}>
            ⚽ Career Football Stats
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Matches</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{matchesPlayed}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Goals</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{goals}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Assists</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{assists}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Shots</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{shots}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Yellows</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-warning)' }}>{yellowCards}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Reds</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444' }}>{redCards}</span>
            </div>
          </div>
        </div>
      );
    }

    if (playerSport === 'Basketball') {
      let matchesPlayed = 0;
      let totalPoints = 0;
      let highScore = 0;
      let rebounds = 0;
      let assists = 0;

      allMatches.forEach(m => {
        if (m.sport !== 'Basketball' || !m.statistics) return;
        const isPart = m.statistics.home_squad?.includes(selectedCareerPlayer) || 
                       m.statistics.away_squad?.includes(selectedCareerPlayer);
        if (isPart) {
          matchesPlayed += 1;
          const pStats = m.statistics.players?.[selectedCareerPlayer];
          if (pStats) {
            const pts = pStats.points || 0;
            totalPoints += pts;
            if (pts > highScore) highScore = pts;
            rebounds += pStats.rebounds || 0;
            assists += pStats.assists || 0;
          }
        }
      });

      const ppg = matchesPlayed > 0 ? (totalPoints / matchesPlayed).toFixed(1) : '0.0';

      return renderModalWrapper(
        'Basketball Player Profile',
        rebounds > totalPoints / 2 ? 'Center / Forward' : 'Guard',
        <div style={{ marginBottom: '10px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '12px', letterSpacing: '1px' }}>
            🏀 Career Basketball Stats
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Matches</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{matchesPlayed}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total PTS</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{totalPoints}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>High Score</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{highScore}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>PPG</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{ppg}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Rebounds</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{rebounds}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Assists</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{assists}</span>
            </div>
          </div>
        </div>
      );
    }

    if (playerSport === 'Tennis') {
      let matchesPlayed = 0;
      let wins = 0;
      let aces = 0;
      let doubleFaults = 0;
      let unforcedErrors = 0;
      let pointsWon = 0;

      allMatches.forEach(m => {
        if (m.sport !== 'Tennis' || !m.statistics) return;
        const isHome = m.home_team_name === selectedCareerPlayer;
        const isAway = m.away_team_name === selectedCareerPlayer;
        if (isHome || isAway) {
          matchesPlayed += 1;
          if (m.status === 'finished') {
            if (isHome && m.home_score > m.away_score) wins += 1;
            if (isAway && m.away_score > m.home_score) wins += 1;
          }
          const pStats = m.statistics.players?.[selectedCareerPlayer];
          if (pStats) {
            aces += pStats.aces || 0;
            doubleFaults += pStats.double_faults || 0;
            unforcedErrors += pStats.unforced_errors || 0;
            pointsWon += pStats.points_won || 0;
          }
        }
      });

      return renderModalWrapper(
        'Tennis Player Profile',
        'Singles Player',
        <div style={{ marginBottom: '10px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '12px', letterSpacing: '1px' }}>
            🎾 Career Tennis Stats
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Matches</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{matchesPlayed}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Wins</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{wins}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Aces</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{aces}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Double Faults</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{doubleFaults}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Unforced Err</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{unforcedErrors}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Points Won</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{pointsWon}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderModalWrapper = (title, subtitle, content) => {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(20,22,28,0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          color: 'var(--color-text-main)',
          position: 'relative'
        }}>
          <button 
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--color-text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}
            onClick={() => {
              setSelectedCareerPlayer(null);
              setAllMatches([]);
            }}
          >
            ✕
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '20px',
              color: '#000'
            }}>
              {selectedCareerPlayer[0].toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{selectedCareerPlayer}</h2>
              <span style={{ fontSize: '12px', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {subtitle}
              </span>
            </div>
          </div>

          {content}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Return to Dashboard */}
      <button className="nav-btn" style={{ marginBottom: '20px' }} onClick={() => { setSelectedMatchId(null); setActiveTab('dashboard'); }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="detail-layout">
        {/* Left Side: Scoreboard, Live Court, and Graphs */}
        <div>
          {/* Large Scoreboard panel */}
          <div className="panel">
            <div className="scoreboard-large">
              <div className="team-info">
                <span className="team-logo">{match.home_team_logo}</span>
                <span className="team-name" style={{ fontSize: '22px' }}>{match.home_team_name}</span>
              </div>

              <div className="score-container" style={{ width: '40%' }}>
                {!isFinished && match.status === 'scheduled' ? (
                  <span className="match-clock" style={{ fontSize: '18px' }}>Upcoming Match</span>
                ) : (
                  <>
                    <div className="score-value" style={{ fontSize: '56px' }}>
                      <span>{match.home_score}</span>
                      <span className="score-divider">-</span>
                      <span>{match.away_score}</span>
                    </div>
                    <span className="match-clock live-clock" style={{ fontSize: '15px' }}>
                      {formatClock()}
                    </span>
                  </>
                )}
              </div>

              <div className="team-info">
                <span className="team-logo">{match.away_team_logo}</span>
                <span className="team-name" style={{ fontSize: '22px' }}>{match.away_team_name}</span>
              </div>
            </div>
          </div>

          {/* Interactive Pitch visualization */}
          <div className="panel">
            <h3 className="panel-title">
              <Compass size={18} className="heart-rate-pulse" style={{ color: 'var(--color-primary)' }} /> 
              Real-Time Match Field Monitor
            </h3>
            
            {renderInteractivePitch()}
            
            {isLive && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '15px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                <span>Ball Position: X={match.statistics?.ball_x || 50}, Y={match.statistics?.ball_y || 50}</span>
                <span>•</span>
                <span>Avg Ball Velocity: {match.statistics?.telemetry?.ball_speed || 0} km/h</span>
              </div>
            )}
          </div>

          {/* Real-time telemetry monitoring */}
          <div className="panel">
            <h3 className="panel-title">
              <Activity size={18} className="heart-rate-pulse" /> 
              Player Biometric Telemetry Graph (Real-time Live Feed)
            </h3>
            
            <div className="telemetry-row">
              <div className="telemetry-card">
                <span className="telemetry-label">Home Player HR</span>
                <span className={`telemetry-value ${isLive ? 'live-value' : ''}`}>
                  <Heart size={16} className="heart-rate-pulse" style={{ marginRight: '6px' }} />
                  {match.statistics?.telemetry?.heart_rates?.home?.[0] || '--'} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>BPM</span>
                </span>
              </div>
              <div className="telemetry-card">
                <span className="telemetry-label">Away Player HR</span>
                <span className={`telemetry-value ${isLive ? 'live-value' : ''}`} style={{ color: 'var(--color-accent)' }}>
                  <Heart size={16} className="heart-rate-pulse" style={{ marginRight: '6px' }} />
                  {match.statistics?.telemetry?.heart_rates?.away?.[0] || '--'} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>BPM</span>
                </span>
              </div>
              <div className="telemetry-card">
                <span className="telemetry-label">Signal Status</span>
                <span className="telemetry-value" style={{ color: isLive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                  {isLive ? '📡 0.8ms Latency' : 'OFFLINE'}
                </span>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={750}
              height={200}
              style={{
                width: '100%',
                height: '180px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                display: 'block'
              }}
            />
          </div>

          {/* Team Squads & Lineups */}
          <div className="panel">
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: 'var(--color-primary)' }} /> 
              Team Squads & Lineups
            </h3>
            <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
              {/* Home Team Squad */}
              <div style={{ flex: 1, padding: '15px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{match.home_team_logo}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--color-secondary)' }}>{match.home_team_name}</span>
                </div>
                {match.statistics?.home_squad && match.statistics.home_squad.length > 0 ? (
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {match.statistics.home_squad.map((player, idx) => {
                      const pStats = match.statistics.players?.[player];
                      return (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '6px 10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', minWidth: '16px' }}>{idx + 1}</span>
                          <span style={{ fontWeight: '500' }}>
                            <button 
                              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 'inherit', textAlign: 'left', outline: 'none' }}
                              onClick={() => setSelectedCareerPlayer(player)}
                              title="View Career Statistics"
                            >
                              {player}
                            </button>
                          </span>
                          {pStats && match.sport === 'Football' && (
                            <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--color-text-muted)', alignItems: 'center' }}>
                              {pStats.goals > 0 && <span title="Goals">⚽ {pStats.goals}</span>}
                              {pStats.assists > 0 && <span title="Assists">👟 {pStats.assists}</span>}
                              {pStats.yellow_cards > 0 && <span style={{ background: 'var(--color-warning)', color: '#000', padding: '0 4px', borderRadius: '2px', fontWeight: 'bold', fontSize: '9px' }} title="Yellow Cards">Y</span>}
                              {pStats.red_cards > 0 && <span style={{ background: '#ef4444', color: '#fff', padding: '0 4px', borderRadius: '2px', fontWeight: 'bold', fontSize: '9px' }} title="Red Cards">R</span>}
                            </span>
                          )}
                          {pStats && match.sport === 'Basketball' && (
                            <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {pStats.points > 0 && <span>{pStats.points} PTS</span>}
                              {pStats.rebounds > 0 && <span>{pStats.rebounds} REB</span>}
                              {pStats.assists > 0 && <span>{pStats.assists} AST</span>}
                            </span>
                          )}
                          {pStats && match.sport === 'Tennis' && (
                            <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {pStats.aces > 0 && <span>{pStats.aces} Aces</span>}
                              {pStats.double_faults > 0 && <span>{pStats.double_faults} DF</span>}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No players submitted.</span>
                )}
              </div>

              {/* Away Team Squad */}
              <div style={{ flex: 1, padding: '15px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{match.away_team_logo}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--color-accent)' }}>{match.away_team_name}</span>
                </div>
                {match.statistics?.away_squad && match.statistics.away_squad.length > 0 ? (
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {match.statistics.away_squad.map((player, idx) => {
                      const pStats = match.statistics.players?.[player];
                      return (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '6px 10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', minWidth: '16px' }}>{idx + 1}</span>
                          <span style={{ fontWeight: '500' }}>
                            <button 
                              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 'inherit', textAlign: 'left', outline: 'none' }}
                              onClick={() => setSelectedCareerPlayer(player)}
                              title="View Career Statistics"
                            >
                              {player}
                            </button>
                          </span>
                          {pStats && match.sport === 'Football' && (
                            <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--color-text-muted)', alignItems: 'center' }}>
                              {pStats.goals > 0 && <span title="Goals">⚽ {pStats.goals}</span>}
                              {pStats.assists > 0 && <span title="Assists">👟 {pStats.assists}</span>}
                              {pStats.yellow_cards > 0 && <span style={{ background: 'var(--color-warning)', color: '#000', padding: '0 4px', borderRadius: '2px', fontWeight: 'bold', fontSize: '9px' }} title="Yellow Cards">Y</span>}
                              {pStats.red_cards > 0 && <span style={{ background: '#ef4444', color: '#fff', padding: '0 4px', borderRadius: '2px', fontWeight: 'bold', fontSize: '9px' }} title="Red Cards">R</span>}
                            </span>
                          )}
                          {pStats && match.sport === 'Basketball' && (
                            <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {pStats.points > 0 && <span>{pStats.points} PTS</span>}
                              {pStats.rebounds > 0 && <span>{pStats.rebounds} REB</span>}
                              {pStats.assists > 0 && <span>{pStats.assists} AST</span>}
                            </span>
                          )}
                          {pStats && match.sport === 'Tennis' && (
                            <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {pStats.aces > 0 && <span>{pStats.aces} Aces</span>}
                              {pStats.double_faults > 0 && <span>{pStats.double_faults} DF</span>}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No players submitted.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Game Stats and commentary timeline */}
        <div>
          {/* Match statistics summary */}
          <div className="panel">
            <h3 className="panel-title"><Award size={18} /> Game Statistics</h3>

            {/* Render Football Statistics */}
            {match.sport === 'Football' && (
              <div>
                <div className="stat-item">
                  <div className="stat-label-container">
                    <span>{match.statistics?.possession?.[0] || 50}%</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Ball Possession</span>
                    <span>{match.statistics?.possession?.[1] || 50}%</span>
                  </div>
                  <div className="stat-bar-outer">
                    <div className="stat-bar-home" style={{ width: `${match.statistics?.possession?.[0] || 50}%` }}></div>
                    <div className="stat-bar-away" style={{ width: `${match.statistics?.possession?.[1] || 50}%` }}></div>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-label-container">
                    <span>{match.statistics?.shots_on_target?.[0] || 0}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Shots on Target</span>
                    <span>{match.statistics?.shots_on_target?.[1] || 0}</span>
                  </div>
                  <div className="stat-bar-outer">
                    {/* Simple ratio percentage */}
                    {(() => {
                      const h = match.statistics?.shots_on_target?.[0] || 0;
                      const a = match.statistics?.shots_on_target?.[1] || 0;
                      const tot = (h + a) || 1;
                      return (
                        <>
                          <div className="stat-bar-home" style={{ width: `${(h/tot)*100}%` }}></div>
                          <div className="stat-bar-away" style={{ width: `${(a/tot)*100}%` }}></div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-label-container">
                    <span>{match.statistics?.fouls?.[0] || 0}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Fouls Committed</span>
                    <span>{match.statistics?.fouls?.[1] || 0}</span>
                  </div>
                  <div className="stat-bar-outer">
                    {(() => {
                      const h = match.statistics?.fouls?.[0] || 0;
                      const a = match.statistics?.fouls?.[1] || 0;
                      const tot = (h + a) || 1;
                      return (
                        <>
                          <div className="stat-bar-home" style={{ width: `${(h/tot)*100}%` }}></div>
                          <div className="stat-bar-away" style={{ width: `${(a/tot)*100}%` }}></div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="stat-item" style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '13px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>🟨 {match.statistics?.yellow_cards?.[0] || 0}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Yellows</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#ef4444', fontWeight: 'bold' }}>🟥 {match.statistics?.red_cards?.[0] || 0}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Reds</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>🟨 {match.statistics?.yellow_cards?.[1] || 0}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Yellows</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#ef4444', fontWeight: 'bold' }}>🟥 {match.statistics?.red_cards?.[1] || 0}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Reds</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Render Basketball Statistics */}
            {match.sport === 'Basketball' && (
              <div>
                <div className="stat-item">
                  <div className="stat-label-container">
                    <span>{match.statistics?.field_goals?.[0] || 0}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Field Goals Scored</span>
                    <span>{match.statistics?.field_goals?.[1] || 0}</span>
                  </div>
                  <div className="stat-bar-outer">
                    {(() => {
                      const h = match.statistics?.field_goals?.[0] || 0;
                      const a = match.statistics?.field_goals?.[1] || 0;
                      const tot = (h + a) || 1;
                      return (
                        <>
                          <div className="stat-bar-home" style={{ width: `${(h/tot)*100}%` }}></div>
                          <div className="stat-bar-away" style={{ width: `${(a/tot)*100}%` }}></div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-label-container">
                    <span>{match.statistics?.three_pointers?.[0] || 0}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>3-Pointers</span>
                    <span>{match.statistics?.three_pointers?.[1] || 0}</span>
                  </div>
                  <div className="stat-bar-outer">
                    {(() => {
                      const h = match.statistics?.three_pointers?.[0] || 0;
                      const a = match.statistics?.three_pointers?.[1] || 0;
                      const tot = (h + a) || 1;
                      return (
                        <>
                          <div className="stat-bar-home" style={{ width: `${(h/tot)*100}%` }}></div>
                          <div className="stat-bar-away" style={{ width: `${(a/tot)*100}%` }}></div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-label-container">
                    <span>{match.statistics?.rebounds?.[0] || 0}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Rebounds</span>
                    <span>{match.statistics?.rebounds?.[1] || 0}</span>
                  </div>
                  <div className="stat-bar-outer">
                    {(() => {
                      const h = match.statistics?.rebounds?.[0] || 0;
                      const a = match.statistics?.rebounds?.[1] || 0;
                      const tot = (h + a) || 1;
                      return (
                        <>
                          <div className="stat-bar-home" style={{ width: `${(h/tot)*100}%` }}></div>
                          <div className="stat-bar-away" style={{ width: `${(a/tot)*100}%` }}></div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Render Tennis Statistics */}
            {match.sport === 'Tennis' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Current Game Score</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'var(--font-display)', marginTop: '5px' }}>
                    {match.statistics?.current_game_score?.join(' - ') || '0 - 0'}
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-label-container">
                    <span>{match.statistics?.aces?.[0] || 0}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Aces</span>
                    <span>{match.statistics?.aces?.[1] || 0}</span>
                  </div>
                  <div className="stat-bar-outer">
                    {(() => {
                      const h = match.statistics?.aces?.[0] || 0;
                      const a = match.statistics?.aces?.[1] || 0;
                      const tot = (h + a) || 1;
                      return (
                        <>
                          <div className="stat-bar-home" style={{ width: `${(h/tot)*100}%` }}></div>
                          <div className="stat-bar-away" style={{ width: `${(a/tot)*100}%` }}></div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {match.statistics?.sets_score && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Set History</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {match.statistics.sets_score.map((set, idx) => (
                        <div key={idx} style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                          S{idx+1}: {set}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Render Cricket Statistics */}
            {match.sport === 'Cricket' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{match.home_team_short} Runs</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-secondary)', marginTop: '4px' }}>
                      {match.statistics?.runs?.[0]}/{match.statistics?.wickets?.[0]}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {match.statistics?.overs?.[0]} Overs
                    </div>
                  </div>

                  <div style={{ flex: 1, padding: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{match.away_team_short} Runs</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-accent)', marginTop: '4px' }}>
                      {match.statistics?.runs?.[1]}/{match.statistics?.wickets?.[1]}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {match.statistics?.overs?.[1]} Overs
                    </div>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-label-container">
                    <span>{match.statistics?.runs?.[0] || 0}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Total Score Comparison</span>
                    <span>{match.statistics?.runs?.[1] || 0}</span>
                  </div>
                  <div className="stat-bar-outer">
                    {(() => {
                      const h = match.statistics?.runs?.[0] || 0;
                      const a = match.statistics?.runs?.[1] || 0;
                      const tot = (h + a) || 1;
                      return (
                        <>
                          <div className="stat-bar-home" style={{ width: `${(h/tot)*100}%` }}></div>
                          <div className="stat-bar-away" style={{ width: `${(a/tot)*100}%` }}></div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Individual Batsman Scorecard */}
                {match.statistics?.batsmen && Object.keys(match.statistics.batsmen).length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em', fontWeight: 'bold' }}>🏏 Batsman Scorecard</div>
                    
                    {/* Home Team Batsmen */}
                    {match.statistics?.home_squad && match.statistics.home_squad.length > 0 && (
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: 'bold', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{match.home_team_name} Batting</span>
                          <span>{match.statistics.runs[0]}/{match.statistics.wickets[0]} ({match.statistics.overs[0]} ov)</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-muted)' }}>
                              <th style={{ padding: '6px 10px' }}>Batsman</th>
                              <th style={{ padding: '6px 10px' }}>Status</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>R</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>B</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>4s</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>6s</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>SR</th>
                            </tr>
                          </thead>
                          <tbody>
                            {match.statistics.home_squad.map((player) => {
                              const stats = match.statistics.batsmen[player];
                              if (!stats) return null;
                              const sr = stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : '0.0';
                              return (
                                <tr key={player} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                  <td style={{ padding: '6px 10px', fontWeight: '500' }}><button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 'inherit', textAlign: 'left', outline: 'none' }} onClick={() => setSelectedCareerPlayer(player)} title="View Career Statistics">{player}</button></td>
                                  <td style={{ padding: '6px 10px' }}>
                                    {stats.out ? (
                                      <span style={{ color: '#ff4136', background: 'rgba(255,65,54,0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>Out</span>
                                    ) : (
                                      <span style={{ color: 'var(--color-primary)', background: 'rgba(0,255,136,0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Batting *</span>
                                    )}
                                  </td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-text-main)' }}>{stats.runs}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{stats.balls}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{stats.fours}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{stats.sixes}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--color-text-muted)' }}>{sr}</td>
                                </tr>
                              );
                            })}
                            {(() => {
                              const didNotBat = match.statistics.home_squad.filter(player => !match.statistics.batsmen?.[player]);
                              if (didNotBat.length === 0) return null;
                              return (
                                <tr style={{ background: 'rgba(0,0,0,0.1)' }}>
                                  <td colSpan="7" style={{ padding: '8px 10px', color: 'var(--color-text-muted)', fontSize: '11px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <strong style={{ color: 'var(--color-text-muted)' }}>Did not bat:</strong> {didNotBat.join(', ')}
                                  </td>
                                </tr>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Away Team Bowlers (Bowling to Home Team) */}
                    {match.statistics?.away_squad && match.statistics.bowlers && Object.keys(match.statistics.bowlers).some(name => match.statistics.away_squad.includes(name)) && (
                      <div style={{ marginBottom: '20px', marginTop: '10px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 'bold', marginBottom: '6px' }}>
                          <span>{match.away_team_name} Bowling</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-muted)' }}>
                              <th style={{ padding: '6px 10px' }}>Bowler</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>O</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>R</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>W</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>Econ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {match.statistics.away_squad.map((player) => {
                              const stats = match.statistics.bowlers[player];
                              if (!stats) return null;
                              const oInt = Math.floor(stats.overs || 0);
                              const oBalls = Math.round(((stats.overs || 0) - oInt) * 10);
                              const totalBalls = oInt * 6 + oBalls;
                              const econ = totalBalls > 0 ? ((stats.runs / (totalBalls / 6))).toFixed(2) : '0.00';
                              return (
                                <tr key={player} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                  <td style={{ padding: '6px 10px', fontWeight: '500' }}><button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 'inherit', textAlign: 'left', outline: 'none' }} onClick={() => setSelectedCareerPlayer(player)} title="View Career Statistics">{player}</button></td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{stats.overs || '0.0'}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--color-text-main)' }}>{stats.runs || 0}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{stats.wickets || 0}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--color-text-muted)' }}>{econ}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Away Team Batsmen */}
                    {match.statistics?.away_squad && match.statistics.away_squad.length > 0 && (
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 'bold', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{match.away_team_name} Batting</span>
                          <span>{match.statistics.runs[1]}/{match.statistics.wickets[1]} ({match.statistics.overs[1]} ov)</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-muted)' }}>
                              <th style={{ padding: '6px 10px' }}>Batsman</th>
                              <th style={{ padding: '6px 10px' }}>Status</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>R</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>B</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>4s</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>6s</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>SR</th>
                            </tr>
                          </thead>
                          <tbody>
                            {match.statistics.away_squad.map((player) => {
                              const stats = match.statistics.batsmen[player];
                              if (!stats) return null;
                              const sr = stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : '0.0';
                              return (
                                <tr key={player} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                  <td style={{ padding: '6px 10px', fontWeight: '500' }}><button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 'inherit', textAlign: 'left', outline: 'none' }} onClick={() => setSelectedCareerPlayer(player)} title="View Career Statistics">{player}</button></td>
                                  <td style={{ padding: '6px 10px' }}>
                                    {stats.out ? (
                                      <span style={{ color: '#ff4136', background: 'rgba(255,65,54,0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>Out</span>
                                    ) : (
                                      <span style={{ color: 'var(--color-primary)', background: 'rgba(0,255,136,0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Batting *</span>
                                    )}
                                  </td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-text-main)' }}>{stats.runs}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{stats.balls}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{stats.fours}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{stats.sixes}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--color-text-muted)' }}>{sr}</td>
                                </tr>
                              );
                            })}
                            {(() => {
                              const didNotBat = match.statistics.away_squad.filter(player => !match.statistics.batsmen?.[player]);
                              if (didNotBat.length === 0) return null;
                              return (
                                <tr style={{ background: 'rgba(0,0,0,0.1)' }}>
                                  <td colSpan="7" style={{ padding: '8px 10px', color: 'var(--color-text-muted)', fontSize: '11px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <strong style={{ color: 'var(--color-text-muted)' }}>Did not bat:</strong> {didNotBat.join(', ')}
                                  </td>
                                </tr>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Home Team Bowlers (Bowling to Away Team) */}
                    {match.statistics?.home_squad && match.statistics.bowlers && Object.keys(match.statistics.bowlers).some(name => match.statistics.home_squad.includes(name)) && (
                      <div style={{ marginBottom: '20px', marginTop: '10px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: 'bold', marginBottom: '6px' }}>
                          <span>{match.home_team_name} Bowling</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-muted)' }}>
                              <th style={{ padding: '6px 10px' }}>Bowler</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>O</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>R</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>W</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>Econ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {match.statistics.home_squad.map((player) => {
                              const stats = match.statistics.bowlers[player];
                              if (!stats) return null;
                              const oInt = Math.floor(stats.overs || 0);
                              const oBalls = Math.round(((stats.overs || 0) - oInt) * 10);
                              const totalBalls = oInt * 6 + oBalls;
                              const econ = totalBalls > 0 ? ((stats.runs / (totalBalls / 6))).toFixed(2) : '0.00';
                              return (
                                <tr key={player} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                  <td style={{ padding: '6px 10px', fontWeight: '500' }}><button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 'inherit', textAlign: 'left', outline: 'none' }} onClick={() => setSelectedCareerPlayer(player)} title="View Career Statistics">{player}</button></td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{stats.overs || '0.0'}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--color-text-main)' }}>{stats.runs || 0}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{stats.wickets || 0}</td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--color-text-muted)' }}>{econ}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Fallback Statistics for General Sports */}
            {!['Football', 'Basketball', 'Tennis', 'Cricket'].includes(match.sport) && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Match Score</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'var(--font-display)', marginTop: '5px' }}>
                    {match.home_score} - {match.away_score}
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-label-container">
                    <span>{match.home_score}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Score Comparison</span>
                    <span>{match.away_score}</span>
                  </div>
                  <div className="stat-bar-outer">
                    {(() => {
                      const h = match.home_score || 0;
                      const a = match.away_score || 0;
                      const tot = (h + a) || 1;
                      return (
                        <>
                          <div className="stat-bar-home" style={{ width: `${(h/tot)*100}%` }}></div>
                          <div className="stat-bar-away" style={{ width: `${(a/tot)*100}%` }}></div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chronological events comment section */}
          <div className="panel">
            <h3 className="panel-title">
              <ShieldAlert size={18} style={{ color: 'var(--color-secondary)' }} /> Live Commentary
            </h3>
            
            <div className="events-timeline">
              {match.events && match.events.length > 0 ? (
                // Reverse to display newest event on top
                [...match.events].reverse().map((event, idx) => {
                  const isGoal = event.type === 'goal';
                  const isWicket = event.type === 'wicket';
                  const classNm = `event-node ${isGoal ? 'goal' : ''} ${isWicket ? 'wicket' : ''}`;

                  return (
                    <div key={idx} className={classNm}>
                      <span className="event-time">{event.time}</span>
                      <span className="event-text">{event.text}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  <p>Commentary will start when match kicks off.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {renderCareerModal()}
    </div>
  );
};

export default MatchDetail;
