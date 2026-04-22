import React, { useState } from 'react';

export default function GuestPhonePanel({ onSOS, offlineMode }) {
  const [sending, setSending] = useState(null);
  const [lastSent, setLastSent] = useState(null);

  const handleAction = (type) => {
    setSending(type);
    setTimeout(() => {
      onSOS(type);
      setLastSent(type);
      setSending(null);
      // Keep lastSent longer if it's SOS to show the Bridge
      if (type !== 'SOS') {
        setTimeout(() => setLastSent(null), 3000);
      }
    }, 800);
  };

  const BUTTONS = [
    { id: 'SOS', label: 'SOS', icon: '🆘', color: '#ff2d55', bg: 'rgba(255,45,85,0.15)', border: 'rgba(255,45,85,0.6)' },
    { id: 'Fire', label: 'Fire', icon: '🔥', color: '#ff6b35', bg: 'rgba(255,107,53,0.12)', border: 'rgba(255,107,53,0.5)' },
    { id: 'Intruder', label: 'Intruder', icon: '⚠️', color: '#ffd60a', bg: 'rgba(255,214,10,0.12)', border: 'rgba(255,214,10,0.5)' },
    { id: 'Help', label: 'I Need Help', icon: '🙋', color: '#0a84ff', bg: 'rgba(10,132,255,0.12)', border: 'rgba(10,132,255,0.5)' },
  ];

  return (
    <div className="phone-ui" style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      width: '160px',
      zIndex: 60,
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      {/* Phone header */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', fontWeight: 600 }}>
          📱 GUEST DEVICE SIM
        </div>
        <div style={{ fontSize: '8px', color: offlineMode ? '#ff6b35' : '#30d158', marginTop: '2px', fontWeight: 600 }}>
          {offlineMode ? '📡 LoRa Mesh' : '🌐 Connected'}
        </div>
      </div>

      {/* Speaker notch */}
      <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '0 auto 6px' }} />

      {/* SOS Buttons */}
      {BUTTONS.map(btn => (
        <button
          key={btn.id}
          onClick={() => handleAction(btn.id)}
          disabled={sending !== null}
          style={{
            width: '100%', padding: '8px 4px',
            background: sending === btn.id ? `${btn.color}30` : btn.bg,
            border: `1px solid ${btn.border}`,
            borderRadius: '8px',
            color: btn.color,
            fontSize: '11px', fontWeight: 700,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s ease',
            transform: sending === btn.id ? 'scale(0.95)' : 'scale(1)',
            animation: btn.id === 'SOS' ? 'none' : 'none',
          }}
        >
          {sending === btn.id ? (
            <span style={{ fontSize: '10px' }}>Sending{offlineMode ? ' via Mesh' : ''}...</span>
          ) : lastSent === btn.id ? (
            <span style={{ fontSize: '10px', color: '#30d158' }}>✅ Sent!</span>
          ) : (
            <><span>{btn.icon}</span><span>{btn.label}</span></>
          )}
        </button>
      ))}

      {/* Tactical Bridge Integration */}
      {lastSent === 'SOS' && (
        <div style={{
          marginTop: '6px', padding: '8px',
          background: 'rgba(48, 209, 88, 0.1)', border: '1px solid rgba(48, 209, 88, 0.4)',
          borderRadius: '8px', animation: 'pulse-green 2s infinite'
        }}>
          <div style={{ fontSize: '9px', color: '#30d158', fontWeight: 'bold', marginBottom: '4px' }}>🛡️ TACTICAL BRIDGE ACTIVE</div>
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>
            UNIT_ALPHA Dispatched<br/>
            Safe Path Received.<br/>
            AI Pilot Monitoring...
          </div>
          <button 
            onClick={() => setLastSent(null)}
            style={{ 
              marginTop: '6px', width: '100%', padding: '2px', 
              background: 'rgba(255,255,255,0.1)', border: 'none', 
              color: '#fff', fontSize: '7px', cursor: 'pointer', borderRadius: '4px' 
            }}
          >
            DISMISS_ALERT
          </button>
        </div>
      )}

      {/* Offline mesh indicator */}
      {offlineMode && !lastSent && (
        <div style={{
          marginTop: '4px', padding: '5px',
          background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: '6px', textAlign: 'center',
          fontSize: '8px', color: '#ff6b35', fontWeight: 600, lineHeight: 1.4,
        }}>
          Signal hopping<br />Node A→B→C
        </div>
      )}

      {/* Battery/status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', padding: '0 2px' }}>
        <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>📶 {offlineMode ? 'Mesh' : '4G'}</span>
        <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>🔋 84%</span>
      </div>
    </div>
  );
}
