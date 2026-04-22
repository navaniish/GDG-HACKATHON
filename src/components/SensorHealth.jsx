import React from 'react';

const SENSOR_ICONS = {
  thermal: '🌡️',
  wifi: '📶',
  smoke: '💨',
  door: '🚪',
  acoustic: '🎙',
  mesh: '📡',
};

export default function SensorHealth({ sensors }) {
  const online = sensors.filter(s => s.status === 'online').length;
  const warning = sensors.filter(s => s.status === 'standby').length;
  const offline = sensors.filter(s => s.status === 'offline').length;

  return (
    <div style={{
      background: 'rgba(13,17,23,0.95)',
      borderRadius: '10px',
      border: '1px solid rgba(10,132,255,0.2)',
      flexShrink: 0,
      maxHeight: '220px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: '8px',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '12px' }}>📡</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Sensor Health
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', fontSize: '10px' }}>
          <span style={{ color: '#30d158' }}>●{online}</span>
          <span style={{ color: '#ffd60a' }}>●{warning}</span>
          {offline > 0 && <span style={{ color: '#ff2d55' }}>●{offline}</span>}
        </div>
      </div>

      {/* Sensor grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {sensors.map(sensor => {
          const isOnline = sensor.status === 'online';
          const isWarning = sensor.status === 'standby';
          const color = isOnline ? '#30d158' : isWarning ? '#ffd60a' : '#ff2d55';
          return (
            <div key={sensor.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '4px 6px', borderRadius: '5px', marginBottom: '2px',
                background: isWarning ? 'rgba(255,214,10,0.04)' : isOnline ? 'transparent' : 'rgba(255,45,85,0.05)',
              }}>
              <span style={{ fontSize: '13px', flexShrink: 0 }}>{SENSOR_ICONS[sensor.type] || '🔌'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sensor.name}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {sensor.value}{sensor.unit}
                </span>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: color,
                  animation: isOnline ? 'pulse-green 2s infinite' : isWarning ? 'pulse-orange 1.5s infinite' : 'pulse-red 1.2s infinite',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
