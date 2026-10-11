import React, { useState, useEffect } from 'react';
import { Server, Database, Cpu, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';

export default function ArchitectureInfo() {
  const [cacheData, setCacheData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStats = () => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:5000/api/cache-stats').then(r => r.json()),
      fetch('http://localhost:5000/api/health').then(r => r.json())
    ])
      .then(([cache, health]) => {
        setCacheData(cache);
        setHealthData(health);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/cache/clear', { method: 'POST' });
      const data = await res.json();
      setMessage(data.message);
      fetchStats();
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      padding: '1.5rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server color="var(--accent-blue)" size={22} />
            System Architecture & Live Cache Monitor
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
            Demonstrates rate-limit protection and multi-tier backend orchestration
          </span>
        </div>

        <button
          onClick={handleClearCache}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Trash2 size={14} />
          Flush Server Cache
        </button>
      </div>

      {message && (
        <div style={{
          backgroundColor: 'var(--accent-green-bg)',
          color: 'var(--accent-green)',
          padding: '0.6rem 1rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      {/* Tech Stack Pillars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Cpu size={18} color="#61dafb" />
            <b style={{ fontSize: '0.9rem' }}>React 19 + Vite</b>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Modular components, custom CSS tokens, live polling tickers.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Server size={18} color="#68a063" />
            <b style={{ fontSize: '0.9rem' }}>Node.js / Express</b>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            API Gateway, secret key isolation, proxy caching with NodeCache.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Database size={18} color="#f59e0b" />
            <b style={{ fontSize: '0.9rem' }}>Python 3.14 Engine</b>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Data scraper, statistical metrics exporter, fallback JSON generator.
          </p>
        </div>
      </div>

      {/* Real-time Cache Statistics */}
      {cacheData && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            ⚡ In-Memory Cache Performance
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>CACHE HITS</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                {cacheData.stats?.hits ?? 0}
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>CACHE MISSES</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                {cacheData.stats?.misses ?? 0}
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>ACTIVE KEYS</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                {cacheData.keys?.length ?? 0}
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>SERVER MODE</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: healthData?.keyConfigured ? 'var(--accent-green)' : 'var(--accent-amber)', marginTop: '4px' }}>
                {healthData?.mode ?? 'mock'}
              </div>
            </div>
          </div>

          {/* Cached Keys Tags */}
          {cacheData.keys && cacheData.keys.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginBottom: '4px' }}>
                CURRENTLY CACHED KEYS IN RAM:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {cacheData.keys.map((k, i) => (
                  <span key={i} style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    color: '#93c5fd',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
