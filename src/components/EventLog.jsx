import React from 'react';

export default function EventLog({ events }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {events.map((evt, i) => (
        <div 
          key={evt.id} 
          className="event-log-item"
          style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid rgba(255, 255, 255, 0.05)', 
            padding: '10px',
            borderRadius: '2px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Priority Indicator Stripe */}
          <div style={{ 
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
            background: evt.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-cyan)'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <span className={`status-badge ${evt.severity === 'critical' ? 'status-red' : 'status-cyan'}`} style={{ fontSize: '8px' }}>
              {evt.severity === 'critical' ? '🔴 CRITICAL' : '🔵 SENSOR_IDLE'}
            </span>
            <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)' }}>
              {new Date(evt.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="font-mono" style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>
            {evt.label} Detecting {evt.type === 'sos' ? 'SOS_SIGNAL' : 'ANOMALY'}
          </div>

          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
            LOC: RM_{evt.room || 'UNKNOWN'} • CONF: {evt.confidence || 98}%
          </div>

          {evt.severity === 'critical' && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
               <div className="status-badge status-green" style={{ fontSize: '8px', borderStyle: 'dashed' }}>🟢 ACTION: DOOR_UNLOCKED</div>
               <div className="status-badge status-green" style={{ fontSize: '8px', borderStyle: 'dashed' }}>🟢 ACTION: BEACON_ACTIVE</div>
            </div>
          )}
        </div>
      ))}
      {events.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📡</div>
          <div className="font-mono" style={{ fontSize: '9px', fontWeight: 'bold' }}>SYSTEM_IDLE: SCANNING_ENVIRONMENT</div>
        </div>
      )}
    </div>
  );
}
