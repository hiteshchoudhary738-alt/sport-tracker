import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Dashboard from './components/Dashboard';
import MatchDetail from './components/MatchDetail';
import AdminSimulator from './components/AdminSimulator';
import { Activity, LayoutDashboard, Settings, Lock, Unlock } from 'lucide-react';
import './App.css';

const SOCKET_URL = `http://${window.location.hostname}:5000`;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => sessionStorage.getItem('isAdmin') === 'true');
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [socket, setSocket] = useState(null);

  // 0. Check for secret admin query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      sessionStorage.setItem('isAdmin', 'true');
      setIsAdminAuthenticated(true);
      setActiveTab('admin');
    }
  }, []);

  // 1. Fetch initial match data on mount
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(`${SOCKET_URL}/api/matches`);
        const data = await res.json();
        setMatches(data);
      } catch (err) {
        console.error('Failed to load initial matches:', err);
      }
    };
    
    fetchMatches();
  }, []);

  // 2. Initialize Socket.io connection and listeners
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('📡 Connected to Live Sports WebSocket Server!');
    });

    // Real-time Dashboard Updates (Lightweight payload for grid card metrics)
    newSocket.on('dashboardUpdate', (data) => {
      setMatches(prevMatches => {
        return prevMatches.map(match => {
          if (match.id === data.id) {
            // Check if score changed to apply brief CSS flashing/glowing animations
            const homeChanged = data.home_score !== undefined && match.home_score !== data.home_score;
            const awayChanged = data.away_score !== undefined && match.away_score !== data.away_score;
            
            if (homeChanged || awayChanged) {
              // Trigger score-flash effect on elements
              setTimeout(() => {
                const homeEl = document.getElementById(`score-home-${data.id}`);
                const awayEl = document.getElementById(`score-away-${data.id}`);
                if (homeChanged && homeEl) {
                  homeEl.classList.add('score-flash');
                  setTimeout(() => homeEl.classList.remove('score-flash'), 600);
                }
                if (awayChanged && awayEl) {
                  awayEl.classList.add('score-flash');
                  setTimeout(() => awayEl.classList.remove('score-flash'), 600);
                }
              }, 10);
            }

            return {
              ...match,
              status: data.status || match.status,
              home_score: data.home_score !== undefined ? data.home_score : match.home_score,
              away_score: data.away_score !== undefined ? data.away_score : match.away_score,
              current_time: data.current_time !== undefined ? data.current_time : match.current_time,
              statistics: {
                ...match.statistics,
                ...data.statistics
              }
            };
          }
          return match;
        });
      });
    });

    // If database resets, reload all matches from the API
    newSocket.on('dbReset', () => {
      fetch(`${SOCKET_URL}/api/matches`)
        .then(res => res.json())
        .then(data => setMatches(data))
        .catch(err => console.error(err));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="app-container">
      {/* Premium Header */}
      <header>
        <div className="logo-container">
          <span className="logo-icon">⚡</span>
          <h1>APEX LIVE <span style={{ color: 'var(--color-primary)', fontSize: '11px', verticalAlign: 'middle', background: 'rgba(0,255,136,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(0,255,136,0.2)' }}>0.8MS PUSH</span></h1>
        </div>

        <div className="nav-links">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSelectedMatchId(null); }}
          >
            <LayoutDashboard size={16} /> Live Matches
          </button>
          
          {selectedMatchId && (
            <button 
              className={`nav-btn ${activeTab === 'match-detail' ? 'active' : ''}`}
              onClick={() => setActiveTab('match-detail')}
            >
              <Activity size={16} /> Live Visualizer
            </button>
          )}

          {isAdminAuthenticated && (
            <button 
              className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => {
                if (activeTab === 'admin') {
                  if (window.confirm('Do you want to lock the Admin Panel and logout?')) {
                    sessionStorage.removeItem('isAdmin');
                    setIsAdminAuthenticated(false);
                    setActiveTab('dashboard');
                  }
                } else {
                  setActiveTab('admin');
                }
              }}
            >
              <Unlock size={16} style={{ color: 'var(--color-primary)' }} /> Admin Simulator
            </button>
          )}
        </div>
      </header>

      {/* Main Content Render */}
      <main>
        {activeTab === 'dashboard' && (
          <Dashboard 
            matches={matches} 
            setMatches={setMatches}
            setSelectedMatchId={setSelectedMatchId} 
            setActiveTab={setActiveTab}
          />
        )}
        
        {activeTab === 'match-detail' && selectedMatchId && (
          <MatchDetail 
            matchId={selectedMatchId} 
            socket={socket} 
            setSelectedMatchId={setSelectedMatchId}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'admin' && isAdminAuthenticated && (
          <AdminSimulator 
            matches={matches} 
            socket={socket} 
            setMatches={setMatches}
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '20px 0', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>© 2026 Apex Sports Analytics. All rights reserved.</span>
        <span style={{ color: 'var(--color-primary)' }}>● Ultra-low Latency Websocket Connection Active</span>
      </footer>
    </div>
  );
}

export default App;
