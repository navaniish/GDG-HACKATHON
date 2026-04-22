import React from 'react';

export default function TopBar({ offlineMode, kpis, onToggleOffline }) {
  const { totalIncidents, avgResponseTime, guestsAtRisk, meshStatus } = kpis;

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(9,12,20,0.98) 0%, rgba(13,17,23,0.98) 100%)',
      borderBottom: '1px solid rgba(10,132,255,0.2)',
      padding: '0 16px',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      zIndex: 20,
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '8px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #0a84ff, #bf5af2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', boxShadow: '0 0 20px rgba(10,132,255,0.4)',
        }}>🛡</div>
        <div>
          <div className="font-orbitron" style={{ fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', lineHeight: 1 }}>
            SENTINEL-X
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Autonomous AI Guardian
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }} />

      {/* KPIs */}
      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        <KPI label="Total Incidents" value={totalIncidents} color="#ff2d55" accent />
        <KPI label="Avg AI Response" value={`${avgResponseTime || 0}ms`} color="#0a84ff" />
        <KPI label="Guests at Risk" value={guestsAtRisk} color="#ff6b35" />
        <KPI label="Mesh Status" value={offlineMode ? '⚡ MESH' : '✓ ONLINE'} color={offlineMode ? '#ff6b35' : '#30d158'} />
        <KPI label="Intelligence" value="NVIDIA NIM" color="#76b900" isLive />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Offline toggle */}
        <button
          onClick={onToggleOffline}
          style={{
            background: offlineMode ? 'rgba(255,107,53,0.2)' : 'rgba(48,209,88,0.1)',
            border: `1px solid ${offlineMode ? 'rgba(255,107,53,0.6)' : 'rgba(48,209,88,0.4)'}`,
            borderRadius: '6px',
            padding: '5px 12px',
            color: offlineMode ? 'var(--sentinel-orange)' : 'var(--sentinel-green)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            letterSpacing: '0.04em',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.3s ease',
            animation: offlineMode ? 'evacuation-flash 1s infinite' : 'none',
          }}
        >
          <span>{offlineMode ? '📴' : '🌐'}</span>
          {offlineMode ? 'Cut Internet: ON' : 'Simulate Disaster'}
        </button>

        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
          background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.3)', borderRadius: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff2d55', animation: 'pulse-red 1.2s infinite' }} />
          <span style={{ fontSize: '10px', color: '#ff2d55', fontWeight: 700, letterSpacing: '0.1em' }}>LIVE</span>
        </div>

        {/* Time */}
        <div className="font-mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', minWidth: '80px', textAlign: 'right' }}>
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, color, accent, isLive }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span className={accent ? 'font-orbitron' : ''} style={{
          fontSize: accent ? '18px' : '15px',
          fontWeight: 700,
          color,
          lineHeight: 1.2,
          fontFamily: accent ? 'Orbitron, monospace' : 'Inter, sans-serif',
        }}>
          {value}
        </span>
        {isLive && (
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, animation: 'pulse-green 1.5s infinite' }} />
        )}
      </div>
    </div>
  );
}
