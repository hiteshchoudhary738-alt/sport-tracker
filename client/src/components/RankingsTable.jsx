import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  { id: 'batsmen', label: 'Batsmen' },
  { id: 'bowlers', label: 'Bowlers' },
  { id: 'allrounders', label: 'All-rounders' },
  { id: 'teams', label: 'Teams' }
];

const FORMATS = [
  { id: 'test', label: 'Test' },
  { id: 'odi', label: 'ODI' },
  { id: 't20', label: 'T20I' }
];

export default function RankingsTable() {
  const [category, setCategory] = useState('batsmen');
  const [format, setFormat] = useState('odi');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`http://localhost:5000/api/rankings/${category}/${format}`)
      .then(res => res.json())
      .then(json => {
        if (!isMounted) return;
        setRankings(json.data || []);
        setDataSource(json.source || 'cache');
      })
      .catch(err => {
        console.error('Failed to load rankings:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [category, format]);

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      padding: '1.5rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award color="var(--accent-amber)" size={22} />
            ICC Official Rankings
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
            Source: <b style={{ color: dataSource === 'rapidapi' ? 'var(--accent-green)' : 'var(--accent-amber)' }}>{dataSource.toUpperCase()}</b> (Cached in Node.js)
          </span>
        </div>

        {/* Format Selector (Test / ODI / T20) */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          {FORMATS.map(f => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
                backgroundColor: format === f.id ? 'var(--accent-green)' : 'transparent',
                color: format === f.id ? '#000' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills (Batsmen / Bowlers / All-rounders / Teams) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              border: `1px solid ${category === c.id ? 'var(--accent-green)' : 'var(--border)'}`,
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: category === c.id ? 'var(--accent-green-bg)' : 'var(--bg-surface)',
              color: category === c.id ? 'var(--accent-green)' : 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      {loading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 10px', display: 'block' }} />
          Loading rankings...
        </div>
      ) : rankings.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-sub)' }}>
          No rankings data available for this selection.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-sub)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.75rem 1rem', width: '70px' }}>Rank</th>
                <th style={{ padding: '0.75rem 1rem' }}>{category === 'teams' ? 'Team' : 'Player'}</th>
                {category !== 'teams' && <th style={{ padding: '0.75rem 1rem' }}>Country</th>}
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Rating</th>
                {category !== 'teams' && <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '80px' }}>Trend</th>}
              </tr>
            </thead>
            <tbody>
              {rankings.map((item, idx) => {
                const rankNum = item.rank || idx + 1;
                let rankBadgeBg = 'transparent';
                let rankTextColor = 'var(--text-muted)';
                if (rankNum === 1) { rankBadgeBg = 'rgba(234, 179, 8, 0.2)'; rankTextColor = '#fbbf24'; }
                else if (rankNum === 2) { rankBadgeBg = 'rgba(203, 213, 225, 0.2)'; rankTextColor = '#e2e8f0'; }
                else if (rankNum === 3) { rankBadgeBg = 'rgba(217, 119, 6, 0.2)'; rankTextColor = '#f97316'; }

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: rankBadgeBg,
                        color: rankTextColor,
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.82rem'
                      }}>
                        {rankNum}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {item.name}
                    </td>
                    {category !== 'teams' && (
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                        {item.country}
                      </td>
                    )}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-green)' }}>
                      {item.rating || item.points || '-'}
                    </td>
                    {category !== 'teams' && (
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        {item.trend === 'up' && <TrendingUp size={16} color="var(--accent-green)" />}
                        {item.trend === 'down' && <TrendingDown size={16} color="var(--accent-red)" />}
                        {item.trend === 'same' && <Minus size={16} color="var(--text-sub)" />}
                        {!item.trend && <Minus size={16} color="var(--text-sub)" />}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
