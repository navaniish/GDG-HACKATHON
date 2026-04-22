import React from 'react';
import YoloVision from './YoloVision';

export default function ResponderPanel({ rooms, events, selectedRoom, onRoomAction, offlineMode }) {
  const activeIncidents = rooms.filter(r => r.status === 'distress' || r.status === 'threat');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Occupancy Heatmap Visualization */}
      <div style={{ padding: '4px', marginBottom: '15px' }}>
         <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', fontWeight: 'bold' }}>BUILDING_HEATMAP</div>
         <div style={{ height: '40px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dim)', position: 'relative', display: 'flex', alignItems: 'center', padding: '0 10px', gap: '4px' }}>
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} style={{ 
                flex: 1, 
                height: `${20 + Math.random() * 60}%`, 
                background: i === 6 ? '#ff2d55' : 'rgba(0, 242, 255, 0.3)',
                boxShadow: i === 6 ? '0 0 10px #ff2d55' : 'none'
              }} />
            ))}
         </div>
         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>
            <span>WEST_WING</span>
            <span>EAST_WING</span>
         </div>
      </div>

      <div style={{ padding: '12px', background: 'rgba(0, 242, 255, 0.05)', border: '1px solid var(--border-blue)', borderRadius: '2px', marginBottom: '15px' }}>
         <div style={{ fontSize: '9px', color: '#00d2ff', marginBottom: '4px' }}>AI_CONFIDENCE_SCORE</div>
         <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>98.4<span style={{ fontSize: '14px', opacity: 0.5 }}>%</span></span>
            <span style={{ fontSize: '9px', color: '#30d158' }}>+1.2% ↑</span>
         </div>
      </div>

      {activeIncidents.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeIncidents.map(room => (
            <div key={room.id} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-dim)', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                 <span className="font-mono" style={{ fontSize: '11px', fontWeight: 'bold' }}>RM_{room.number}</span>
                 <span className="status-badge status-red" style={{ fontSize: '8px' }}>CRITICAL</span>
              </div>
              
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
                 DETECTED: ACOUSTIC_SCREAM<br/>
                 LAST_COORD: 34.22, -118.04
              </div>

              <div style={{ padding: '8px', background: 'rgba(255, 45, 85, 0.1)', border: '1px solid rgba(255, 45, 85, 0.3)', marginBottom: '10px' }}>
                <div style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>AI_DIRECTED_MISSION</div>
                <div style={{ fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>
                  UNIT_ALPHA: INTERCEPT & EXFIL
                </div>
                <div style={{ fontSize: '8px', color: '#30d158', marginTop: '4px' }}>ETA: 01:24s</div>
              </div>

              <YoloVision activeCrisis={true} />

              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn-sentinel" style={{ flex: 1, fontSize: '9px', padding: '4px 0' }}>COMM_BRIDGE</button>
                <button className="btn-sentinel" style={{ flex: 1, fontSize: '9px', padding: '4px 0' }}>SYNC_GOV</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>
           <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎯</div>
              <div className="font-mono" style={{ fontSize: '9px' }}>NO_ACTIVE_TARGETS</div>
           </div>
        </div>
      )}
    </div>
  );
}
