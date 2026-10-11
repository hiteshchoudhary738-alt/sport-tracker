import React from 'react';
import { Activity, Flame, Shield, Clock } from 'lucide-react';

export default function LiveMatchCard({ match }) {
  if (!match) return null;

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.85rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '999px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <span className="pulse-badge"></span>
            LIVE
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {match.series} • {match.matchDesc}
          </span>
        </div>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          backgroundColor: 'var(--border)',
          color: 'var(--text-main)',
          padding: '3px 8px',
          borderRadius: '6px'
        }}>
          {match.matchFormat}
        </span>
      </div>

      {/* Teams & Scores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        {/* Team 1 */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.3rem' }}>{match.team1.flag || '🏏'}</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{match.team1.name}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{match.team1.overs} Overs</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800 }}>
              {match.team1.score}
            </div>
          </div>
        </div>

        {/* Team 2 */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--accent-green-bg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.3rem' }}>{match.team2.flag || '🏏'}</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{match.team2.name}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{match.team2.overs} Overs</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-green)' }}>
              {match.team2.score}
            </div>
          </div>
        </div>
      </div>

      {/* State / Result Banner */}
      <div style={{
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderLeft: '4px solid var(--accent-amber)',
        padding: '0.6rem 1rem',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#fbbf24',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Flame size={16} />
        {match.stateTitle}
      </div>

      {/* Current Batters & Bowler Grid */}
      {match.currentBatters && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          borderTop: '1px solid var(--border)',
          paddingTop: '1rem',
          marginBottom: '1rem'
        }}>
          {/* Batters */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Batting
            </div>
            {match.currentBatters.map((b, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.35rem 0',
                fontSize: '0.88rem',
                borderBottom: i === 0 ? '1px dashed var(--border)' : 'none'
              }}>
                <span style={{ fontWeight: b.onStrike ? 700 : 400, color: b.onStrike ? 'var(--accent-green)' : 'inherit' }}>
                  {b.name} {b.onStrike && '★'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  <b>{b.runs}</b> ({b.balls}) <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem' }}>SR: {b.sr}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Bowler */}
          {match.currentBowler && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Bowling
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.35rem 0',
                fontSize: '0.88rem'
              }}>
                <span style={{ fontWeight: 600 }}>{match.currentBowler.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  <b>{match.currentBowler.wickets}/{match.currentBowler.runs}</b> ({match.currentBowler.overs} ov)
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '4px' }}>
                Econ: {match.currentBowler.economy} • Maidens: {match.currentBowler.maidens}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Balls Tracker */}
      {match.recentBalls && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderTop: '1px solid var(--border)',
          paddingTop: '0.85rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>Recent Over:</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {match.recentBalls.map((ball, idx) => {
              let bg = 'var(--border)';
              let color = 'var(--text-main)';
              if (ball === '4') { bg = '#059669'; color = '#fff'; }
              else if (ball === '6') { bg = '#d97706'; color = '#fff'; }
              else if (ball === 'W') { bg = '#dc2626'; color = '#fff'; }

              return (
                <div key={idx} style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: bg,
                  color: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)'
                }}>
                  {ball}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
