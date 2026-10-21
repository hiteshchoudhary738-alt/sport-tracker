import React, { useState, useEffect } from 'react';
import { Activity, Award, Calendar, CheckCircle, RefreshCw, Cpu, Radio, Shield } from 'lucide-react';
import LiveMatchCard from './components/LiveMatchCard';
import RankingsTable from './components/RankingsTable';
import ArchitectureInfo from './components/ArchitectureInfo';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loadingLive, setLoadingLive] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  // Fetch live matches
  const fetchLive = () => {
    fetch(`${API_BASE_URL}/api/matches/live`)
      .then(r => r.json())
      .then(json => {
        setLiveMatches(json.data || []);
        setLastRefreshed(new Date().toLocaleTimeString());
      })
      .catch(console.error)
      .finally(() => setLoadingLive(false));
  };

  // Fetch upcoming fixtures & recent results
  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 30000); // 30s poll

    fetch(`${API_BASE_URL}/api/matches/upcoming`)
      .then(r => r.json())
      .then(json => setUpcomingMatches(json.data || []))
      .catch(console.error);

    fetch(`${API_BASE_URL}/api/matches/recent`)
      .then(r => r.json())
      .then(json => setRecentMatches(json.data || []))
      .catch(console.error);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Main Navbar (Cricbuzz Green) */}
      <header style={{
        backgroundColor: 'var(--cb-green)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '52px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🏏</span>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#ffffff', letterSpacing: '-0.03em' }}>
              cric<span style={{ backgroundColor: 'rgba(0,0,0,0.18)', color: '#a7f3d0', padding: '1px 6px', borderRadius: '4px', fontSize: '0.85em', marginLeft: '3px' }}>buzz</span>
            </div>
            <span style={{
              fontSize: '0.65rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              LIVE
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav style={{ display: 'flex', height: '100%', gap: '2px' }}>
            <button
              onClick={() => setActiveTab('live')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 16px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem',
                backgroundColor: activeTab === 'live' ? 'var(--cb-green-dark)' : 'transparent',
                color: '#ffffff',
                borderBottom: activeTab === 'live' ? '3px solid #ffffff' : '3px solid transparent',
                transition: 'background-color 0.15s ease'
              }}
            >
              <Activity size={16} />
              Live Scores & Matches
            </button>

            <button
              onClick={() => setActiveTab('rankings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 16px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem',
                backgroundColor: activeTab === 'rankings' ? 'var(--cb-green-dark)' : 'transparent',
                color: '#ffffff',
                borderBottom: activeTab === 'rankings' ? '3px solid #ffffff' : '3px solid transparent',
                transition: 'background-color 0.15s ease'
              }}
            >
              <Award size={16} />
              ICC Rankings
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 16px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem',
                backgroundColor: activeTab === 'architecture' ? 'var(--cb-green-dark)' : 'transparent',
                color: '#ffffff',
                borderBottom: activeTab === 'architecture' ? '3px solid #ffffff' : '3px solid transparent',
                transition: 'background-color 0.15s ease'
              }}
            >
              <Cpu size={16} />
              Architecture & Cache
            </button>
          </nav>

          {/* External links or status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={fetchLive}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
              title="Refresh Live Scores"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Cricbuzz Sub-Header Match Ticker Strip */}
      <div style={{
        backgroundColor: 'var(--cb-subnav)',
        color: '#ffffff',
        fontSize: '0.8rem',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          height: '38px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <div style={{
            backgroundColor: 'var(--cb-subnav-active)',
            padding: '0 12px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.5px'
          }}>
            MATCHES
          </div>
          {liveMatches.length > 0 ? (
            liveMatches.map((m, idx) => (
              <div key={idx} style={{
                padding: '0 14px',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem'
              }}>
                <span style={{ color: '#ff6b6b', fontWeight: 800, fontSize: '0.7rem' }}>● LIVE</span>
                <span style={{ fontWeight: 600 }}>{m.team1?.name} vs {m.team2?.name}</span>
                <span style={{ color: '#cbd5e1' }}>({m.team2?.score || m.team1?.score})</span>
              </div>
            ))
          ) : (
            <div style={{ padding: '0 14px', color: '#94a3b8', fontSize: '0.78rem' }}>
              IND vs AUS • SA vs ENG (SA won by 42 runs) • PAK vs AFG
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container" style={{ flex: 1, padding: '2rem 1.25rem' }}>
        {/* Top Status Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span className="pulse-badge pulse-green"></span>
            Backend: <b style={{ color: '#fff' }}>http://localhost:5000</b>
            <span style={{ color: 'var(--text-sub)' }}>• Refreshed: {lastRefreshed}</span>
          </div>

          <button
            onClick={fetchLive}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <RefreshCw size={12} />
            Refresh Now
          </button>
        </div>

        {/* Tab 1: Live Matches & Fixtures */}
        {activeTab === 'live' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>
                🔴 Live Cricket Center
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Real-time scores, active batsman strike rate, current bowler spells and ball-by-ball circles
              </p>
            </div>

            {loadingLive ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 10px', display: 'block' }} />
                Fetching live scores...
              </div>
            ) : liveMatches.length === 0 ? (
              <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}>
                No live matches underway right now. Check upcoming fixtures below!
              </div>
            ) : (
              liveMatches.map((m, i) => <LiveMatchCard key={m.id || i} match={m} />)
            )}

            {/* Upcoming Fixtures Section */}
            <div style={{ marginTop: '2.5rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="var(--accent-blue)" />
                Upcoming International Fixtures
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
              marginBottom: '2.5rem'
            }}>
              {upcomingMatches.map((match, idx) => (
                <div key={idx} style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.75rem' }}>
                    <span>{match.series}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{match.matchFormat}</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {match.team1?.name} vs {match.team2?.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    📍 {match.venue}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Results Section */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} color="var(--accent-green)" />
                Recent Match Results
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem'
            }}>
              {recentMatches.map((match, idx) => (
                <div key={idx} style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
                    <span>{match.series} • {match.matchDesc}</span>
                    <span style={{ fontWeight: 700 }}>{match.matchFormat}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                    <span style={{ fontWeight: 600 }}>{match.team1?.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{match.team1?.score}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                    <span style={{ fontWeight: 600 }}>{match.team2?.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{match.team2?.score}</span>
                  </div>
                  <div style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    color: 'var(--accent-green)',
                    fontWeight: 600
                  }}>
                    {match.stateTitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: ICC Rankings */}
        {activeTab === 'rankings' && <RankingsTable />}

        {/* Tab 3: Architecture & Monitor */}
        {activeTab === 'architecture' && <ArchitectureInfo />}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '1.25rem 0',
        backgroundColor: '#1b2430',
        color: '#cbd5e1',
        marginTop: '3rem'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: '#ffffff' }}>cric<span style={{ color: '#6ee7b7' }}>buzz</span></span>
            <span style={{ color: '#94a3b8' }}>• React 19 Live Cricket Platform</span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            Inspired by Cricbuzz.com • Live Scores, ICC Rankings & Ball-by-Ball Analytics
          </div>
        </div>
      </footer>
    </div>
  );
}
