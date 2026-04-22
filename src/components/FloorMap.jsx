import React, { useMemo } from 'react';

const STATUS_CONFIG = {
  safe: { color: 'rgba(0, 242, 255, 0.4)', label: 'IDLE', dot: '#00f2ff' },
  distress: { color: '#ff2d55', label: 'CRITICAL', dot: '#ff2d55' },
  threat: { color: '#ff9f0a', label: 'THREAT', dot: '#ff9f0a' },
  evacuating: { color: '#30d158', label: 'EXITING', dot: '#30d158' },
};

export default function FloorMap({ rooms, responders, activeFloor, onSelectRoom, offlineMode }) {
  const floorRooms = useMemo(() => rooms.filter(r => r.floor === parseInt(activeFloor)), [rooms, activeFloor]);
  const floorResponders = useMemo(() => responders.filter(r => r.floor === parseInt(activeFloor)), [responders, activeFloor]);

  const criticalRoom = floorRooms.find(r => r.status === 'distress');
  let zoomScale = 1;
  let offsetX = 0;
  let offsetY = 0;

  if (criticalRoom) {
    zoomScale = 1.6;
    const col = floorRooms.indexOf(criticalRoom) % 5;
    offsetX = (2 - col) * 12;
    offsetY = 10;
  }

  const mapTransform = `rotateX(45deg) rotateZ(-35deg) scale(${zoomScale}) translate(${offsetX}%, ${offsetY}%)`;

  return (
    <div style={{
      width: '100%', height: '100%', minHeight: '400px',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      perspective: '1200px',
      background: 'radial-gradient(circle at 50% 50%, rgba(0, 242, 255, 0.08) 0%, transparent 90%)'
    }}>
      {/* HUD Metadata */}
      <div style={{ position: 'absolute', top: '20px', left: '25px', zIndex: 100, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="status-badge status-cyan" style={{ fontSize: '10px', boxShadow: '0 0 15px rgba(0, 210, 255, 0.3)' }}>TACTICAL_PROJECTION_0{activeFloor}</div>
          <div className="font-mono" style={{ fontSize: '10px', color: 'rgba(0, 210, 255, 0.7)', fontWeight: 'bold' }}>LIDAR_SCAN: ONLINE</div>
        </div>
      </div>

      {/* Map Projection */}
      <div style={{
        width: '85%', height: '75%',
        transition: 'all 1s cubic-bezier(0.23, 1, 0.32, 1)',
        transform: mapTransform,
        transformStyle: 'preserve-3d',
        position: 'relative'
      }}>
        {/* Reinforced Grid Base */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(0, 242, 255, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 255, 0.12) 1px, transparent 1px)`,
          backgroundSize: '10% 25%',
          border: '2px solid rgba(0, 242, 255, 0.25)',
          backgroundPadding: '10px',
          boxShadow: '0 0 60px rgba(0, 242, 255, 0.05)',
          transform: 'translateZ(-2px)',
          background: 'rgba(5, 7, 10, 0.4)'
        }} />

        {floorRooms.map((room, i) => {
          const col = i % 5;
          const row = Math.floor(i / 5);
          const x = 2 + col * 20;
          const y = 8 + row * 45;
          const isDistress = room.status === 'distress';
          
          return (
            <div
              key={room.id || i}
              onClick={() => onSelectRoom(room)}
              className={`room-block ${isDistress ? 'room-xray' : ''}`}
              style={{
                position: 'absolute', left: `${x}%`, top: `${y}%`,
                width: '18%', height: '38%',
                background: 'rgba(10, 15, 25, 0.92)',
                border: `1px solid ${isDistress ? 'var(--accent-red)' : 'rgba(0, 242, 255, 0.25)'}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', padding: '12px',
                zIndex: isDistress ? 20 : 1,
                transform: 'translateZ(0px)',
                transformStyle: 'preserve-3d',
                boxShadow: isDistress ? '0 0 30px rgba(255, 45, 85, 0.3)' : 'none'
              }}
            >
              <div style={{ fontSize: '9px', color: isDistress ? 'var(--accent-red)' : 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>
                {isDistress ? 'SENSORY_TRIGGER: SCREAM' : `RM_${room.number}`}
              </div>

              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {Array.from({ length: room.occupants }).map((_, idx) => (
                  <div key={idx} style={{ 
                    width: '5px', height: '5px', 
                    background: isDistress ? 'var(--accent-red)' : 'var(--accent-cyan)', 
                    borderRadius: '50%', boxShadow: isDistress ? '0 0 8px var(--accent-red)' : 'none'
                  }} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Safe Path SVG */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', transform: 'translateZ(5px)' }}>
          <defs>
             <style>{`
                @keyframes path-dash { to { stroke-dashoffset: 0; } }
             `}</style>
          </defs>
          <path 
            d="M 50 10 Q 50 50 10 90" 
            stroke="var(--accent-green)" 
            strokeWidth="3" 
            fill="none" 
            strokeDasharray="10"
            style={{ animation: 'path-dash 2s linear infinite' }}
            opacity="0.8"
          />
        </svg>

        {/* Responders */}
        {floorResponders.map(r => (
          <div key={r.id} style={{
            position: 'absolute', left: `${r.x}%`, top: `${r.y}%`,
            width: '12px', height: '12px', background: 'var(--accent-blue)',
            borderRadius: '50%', boxShadow: '0 0 20px var(--accent-blue)',
            transform: 'translateZ(30px)', transition: 'all 2s linear',
            zIndex: 100, border: '2px solid #fff'
          }}>
             <div style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', color: 'var(--accent-blue)', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
               UNIT_0{r.id}
             </div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: '25px', right: '30px', display: 'flex', gap: '20px', pointerEvents: 'none' }}>
         {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
           <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.dot }} />
              <span className="font-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>{cfg.label}</span>
           </div>
         ))}
      </div>
    </div>
  );
}
