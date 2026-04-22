import React, { useEffect } from 'react';

export default function SMSAlert({ alert }) {
  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      right: '20px',
      width: '300px',
      background: 'rgba(48,209,88,0.1)',
      border: '1px solid rgba(48,209,88,0.4)',
      borderRadius: '12px',
      padding: '14px',
      zIndex: 100,
      animation: 'slide-in-right 0.3s ease-out',
      boxShadow: '0 10px 40px rgba(48,209,88,0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <span style={{ fontSize: '20px' }}>💬</span>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#30d158' }}>WhatsApp Alert Sent</div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>To: {alert.to} via {alert.channel}</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{new Date().toLocaleTimeString()}</div>
      </div>
      <div style={{
        background: 'rgba(48,209,88,0.06)',
        border: '1px solid rgba(48,209,88,0.2)',
        borderRadius: '8px',
        padding: '10px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '9px',
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
      }}>
        {alert.message}
      </div>
      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#30d158', animation: 'pulse-green 1.5s infinite' }} />
        <span style={{ fontSize: '9px', color: '#30d158', fontWeight: 600 }}>Delivered · Read</span>
      </div>
    </div>
  );
}
