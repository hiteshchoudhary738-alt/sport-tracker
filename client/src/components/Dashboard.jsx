import React, { useState } from 'react';
import { ChevronRight, Calendar, Play, CheckCircle2 } from 'lucide-react';

const Dashboard = ({ matches, setSelectedMatchId, setActiveTab }) => {
  const [activeMainTab, setActiveMainTab] = useState('live'); // 'live' | 'scheduled' | 'finished'
  const [activeFilter, setActiveFilter] = useState('All');

  const sportsList = ['All', 'Football', 'Basketball', 'Tennis', 'Cricket', 'Volleyball', 'Chess', 'Esports', 'Table Tennis', 'Carrom', 'Snooker', 'Badminton', 'Kabaddi', 'Athletics', 'Kho Kho', 'Lawn Tennis', 'Gymnasium'];

  const handleMatchClick = (id) => {
    setSelectedMatchId(id);
    setActiveTab('match-detail');
  };

  // 1. First filter by status/tab
  const matchesByStatus = matches.filter(m => m.status === activeMainTab);

  // 2. Second filter by selected sport pill
  const filteredMatches = activeFilter === 'All'
    ? matchesByStatus
    : matchesByStatus.filter(m => m.sport.toLowerCase() === activeFilter.toLowerCase());

  // Helper to format match clock / time
  const formatTime = (match) => {
    if (match.status === 'scheduled') {
      const date = new Date(match.scheduled_time);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    if (match.status === 'finished') return 'FT';

    const sec = match.current_time || 0;
    if (match.sport === 'Football') {
      const min = Math.floor(sec / 60);
      return `${min}'`;
    }
    if (match.sport === 'Basketball') {
      const min = Math.floor(sec / 60);
      const remainingSec = sec % 60;
      const quarter = Math.min(4, Math.ceil(sec / 720) || 1);
      return `Q${quarter} - ${min % 12}:${remainingSec.toString().padStart(2, '0')}`;
    }
    return 'Live';
  };

  const getSportEmoji = (sport) => {
    switch (sport) {
      case 'Football': return '⚽';
      case 'Basketball': return '🏀';
      case 'Tennis': return '🎾';
      case 'Cricket': return '🏏';
      case 'Volleyball': return '🏐';
      case 'Chess': return '♟️';
      case 'Esports': return '🎮';
      case 'Table Tennis': return '🏓';
      case 'Carrom': return '🎯';
      case 'Snooker': return '🎱';
      case 'Badminton': return '🏸';
      case 'Kabaddi': return '🤼';
      case 'Athletics': return '🏃';
      case 'Kho Kho': return '🏃‍♂️';
      case 'Lawn Tennis': return '🎾';
      case 'Gymnasium': return '🤸';
      default: return '🏆';
    }
  };

  // Group scheduled matches by Series/League
  const getGroupedUpcomingMatches = () => {
    const groups = {};
    filteredMatches.forEach(match => {
      const leagueName = match.league_name || 'Other Leagues & Series';
      if (!groups[leagueName]) {
        groups[leagueName] = {
          name: leagueName,
          logo: match.league_logo || '🏆',
          sport: match.sport,
          matches: []
        };
      }
      groups[leagueName].matches.push(match);
    });
    return Object.values(groups);
  };

  // Calculate final match outcomes for past results
  const getMatchOutcome = (match) => {
    if (match.sport === 'Cricket' && match.statistics?.runs) {
      const runs = match.statistics.runs;
      const wickets = match.statistics.wickets;
      if (runs && runs.length === 2) {
        const scoreHome = runs[0];
        const scoreAway = runs[1];
        if (scoreHome > scoreAway) {
          return { text: `${match.home_team_short} won by ${scoreHome - scoreAway} runs`, type: 'home' };
        } else if (scoreAway > scoreHome) {
          const wkts = wickets ? wickets[1] : 0;
          return { text: `${match.away_team_short} won by ${10 - wkts} wickets`, type: 'away' };
        }
      }
    }
    
    if (match.home_score > match.away_score) {
      return { text: `${match.home_team_name} won`, type: 'home' };
    } else if (match.away_score > match.home_score) {
      return { text: `${match.away_team_name} won`, type: 'away' };
    } else {
      return { text: 'Match drawn', type: 'draw' };
    }
  };

  const groupedUpcoming = getGroupedUpcomingMatches();

  return (
    <div>
      {/* 1. Main Dashboard Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab ${activeMainTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('live')}
        >
          <Play size={16} style={{ color: activeMainTab === 'live' ? 'var(--color-primary)' : 'inherit' }} /> Live Scores
        </button>
        <button
          className={`dashboard-tab ${activeMainTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('scheduled')}
        >
          <Calendar size={16} style={{ color: activeMainTab === 'scheduled' ? 'var(--color-upcoming)' : 'inherit' }} /> Upcoming Schedule
        </button>
        <button
          className={`dashboard-tab ${activeMainTab === 'finished' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('finished')}
        >
          <CheckCircle2 size={16} style={{ color: activeMainTab === 'finished' ? 'var(--color-secondary)' : 'inherit' }} /> Completed Results
        </button>
      </div>

      {/* 2. Sport filter pills */}
      <div className="filter-bar">
        {sportsList.map(sport => (
          <button
            key={sport}
            className={`filter-btn ${activeFilter === sport ? 'active' : ''}`}
            onClick={() => setActiveFilter(sport)}
          >
            {sport === 'All' ? '🌐 All Sports' : `${getSportEmoji(sport)} ${sport}`}
          </button>
        ))}
      </div>

      {/* 3. Empty States */}
      {filteredMatches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)', backdropFilter: 'blur(12px)' }}>
          <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-main)' }}>
            No {activeFilter !== 'All' ? activeFilter : ''} matches here!
          </p>
          <p style={{ fontSize: '13px' }}>
            {activeMainTab === 'live' && "There are no matches currently running live. Try switching to the 'Upcoming Schedule' tab."}
            {activeMainTab === 'scheduled' && "No upcoming events scheduled. Keep monitoring the database simulator."}
            {activeMainTab === 'finished' && "No historical results found. Run some live simulations to generate completed games."}
          </p>
        </div>
      )}

      {/* 4. Tab Renders */}
      {filteredMatches.length > 0 && (
        <>
          {/* A. Live Scores Tab */}
          {activeMainTab === 'live' && (
            <div className="matches-grid">
              {filteredMatches.map(match => {
                let secondaryText = '';
                if (match.sport === 'Football' && match.statistics?.possession) {
                  secondaryText = `Possession: ${match.statistics.possession[0]}% - ${match.statistics.possession[1]}%`;
                } else if (match.sport === 'Cricket' && match.statistics?.runs) {
                  const runs = match.statistics.runs;
                  const wickets = match.statistics.wickets;
                  const overs = match.statistics.overs;
                  const battingIdx = wickets[0] < 10 && overs[0] < 20 ? 0 : 1;
                  secondaryText = `${battingIdx === 0 ? 'Home' : 'Away'} batting: ${runs[battingIdx]}/${wickets[battingIdx]} (${overs[battingIdx]} ov)`;
                } else if (match.sport === 'Basketball') {
                  secondaryText = `FG: ${match.statistics?.field_goals?.[0] || 0} - ${match.statistics?.field_goals?.[1] || 0}`;
                } else if (match.sport === 'Tennis' && match.statistics?.current_game_score) {
                  secondaryText = `Game Score: ${match.statistics.current_game_score[0]} - ${match.statistics.current_game_score[1]}`;
                }

                return (
                  <div
                    key={match.id}
                    className="match-card live-card"
                    onClick={() => handleMatchClick(match.id)}
                  >
                    <div className="match-header">
                      <span className="sport-badge">
                        {getSportEmoji(match.sport)} {match.sport} • <span style={{ color: 'var(--color-secondary)' }}>{match.league_name}</span>
                      </span>
                      <span className="status-badge live">
                        <span className="pulse-dot"></span> Live
                      </span>
                    </div>

                    <div className="match-body">
                      <div className="team-info">
                        <span className="team-logo">{match.home_team_logo || '🏠'}</span>
                        <span className="team-name">{match.home_team_short || 'Home'}</span>
                      </div>

                      <div className="score-container">
                        <div className="score-value">
                          <span id={`score-home-${match.id}`}>{match.home_score}</span>
                          <span className="score-divider">-</span>
                          <span id={`score-away-${match.id}`}>{match.away_score}</span>
                        </div>
                        <span className="match-clock live-clock">
                          {formatTime(match)}
                        </span>
                      </div>

                      <div className="team-info">
                        <span className="team-logo">{match.away_team_logo || '✈️'}</span>
                        <span className="team-name">{match.away_team_short || 'Away'}</span>
                      </div>
                    </div>

                    <div className="match-footer">
                      <span>{secondaryText}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-secondary)' }}>
                        Monitor Live <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* B. Upcoming Matches Grouped by League/Series */}
          {activeMainTab === 'scheduled' && (
            <div>
              {groupedUpcoming.map(group => (
                <div key={group.name} className="series-group">
                  <div className={`series-header ${group.sport.toLowerCase()}-series`}>
                    <div className="series-title">
                      <span style={{ fontSize: '18px' }}>{group.logo}</span>
                      <span>{group.name}</span>
                    </div>
                    <span className="series-sport-badge">{group.sport}</span>
                  </div>

                  <div className="series-matches-grid">
                    {group.matches.map(match => (
                      <div
                        key={match.id}
                        className="match-card"
                        onClick={() => handleMatchClick(match.id)}
                      >
                        <div className="match-header">
                          <span className="sport-badge">
                            {getSportEmoji(match.sport)} {match.sport}
                          </span>
                          <span className="status-badge upcoming">
                            Upcoming
                          </span>
                        </div>

                        <div className="match-body">
                          <div className="team-info">
                            <span className="team-logo">{match.home_team_logo || '🏠'}</span>
                            <span className="team-name">{match.home_team_short || 'Home'}</span>
                          </div>

                          <div className="score-container">
                            <span className="match-clock">{formatTime(match)}</span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                              {new Date(match.scheduled_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          <div className="team-info">
                            <span className="team-logo">{match.away_team_logo || '✈️'}</span>
                            <span className="team-name">{match.away_team_short || 'Away'}</span>
                          </div>
                        </div>

                        <div className="match-footer">
                          <span>Starts soon</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-secondary)' }}>
                            View Details <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* C. Completed Results Tab */}
          {activeMainTab === 'finished' && (
            <div className="matches-grid">
              {filteredMatches.map(match => {
                const outcome = getMatchOutcome(match);
                let secondaryText = '';
                if (match.sport === 'Tennis' && match.statistics?.sets_score) {
                  secondaryText = `Sets: ${match.statistics.sets_score.join(', ')}`;
                } else if (match.sport === 'Cricket' && match.statistics?.runs) {
                  secondaryText = `${match.home_team_short} ${match.statistics.runs[0]}/${match.statistics.wickets[0]} vs ${match.away_team_short} ${match.statistics.runs[1]}/${match.statistics.wickets[1]}`;
                } else {
                  secondaryText = 'Match Completed';
                }

                return (
                  <div
                    key={match.id}
                    className="match-card"
                    onClick={() => handleMatchClick(match.id)}
                  >
                    <div className="match-header">
                      <span className="sport-badge">
                        {getSportEmoji(match.sport)} {match.sport} • <span style={{ color: 'var(--color-text-muted)' }}>{match.league_name}</span>
                      </span>
                      <span className="status-badge finished">
                        Finished
                      </span>
                    </div>

                    <div className="match-body">
                      <div className="team-info">
                        <span className="team-logo">{match.home_team_logo || '🏠'}</span>
                        <span className="team-name">{match.home_team_short || 'Home'}</span>
                      </div>

                      <div className="score-container">
                        <div className="score-value">
                          <span>{match.home_score}</span>
                          <span className="score-divider">-</span>
                          <span>{match.away_score}</span>
                        </div>
                        <span className="match-clock">FT</span>
                      </div>

                      <div className="team-info">
                        <span className="team-logo">{match.away_team_logo || '✈️'}</span>
                        <span className="team-name">{match.away_team_short || 'Away'}</span>
                      </div>
                    </div>

                    <div className="match-footer" style={{ flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        <span>{secondaryText}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-secondary)' }}>
                          View Stats <ChevronRight size={14} />
                        </span>
                      </div>
                      <div className={`match-outcome winner-${outcome.type}`}>
                        🏆 {outcome.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
