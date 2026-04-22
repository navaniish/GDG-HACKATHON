import React, { useState, useEffect, useRef, useCallback } from 'react';

const ZONES = [
  { id: 'z1', name: 'Lobby A', x: 10, y: 10, w: 40, h: 35 },
  { id: 'z2', name: 'West Corridor', x: 10, y: 55, w: 30, h: 35 },
  { id: 'z3', name: 'Elevator Hall', x: 50, y: 10, w: 40, h: 80 },
];

export default function CrowdDensity({ offlineMode, onEvent, rooms }) {
  const [agents, setAgents] = useState([]);
  const [blockedZones, setBlockedZones] = useState([]);
  const [stampedeRisk, setStampedeRisk] = useState(false);
  const containerRef = useRef(null);

  // Initialize agents
  useEffect(() => {
    const initial = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      targetIdx: 0,
      speed: 0.2 + Math.random() * 0.3,
      panic: false,
    }));
    setAgents(initial);
  }, []);

  // Structural Failure & Dynamic Rerouting Logic
  const toggleStructuralFailure = () => {
    const isBlocking = blockedZones.length === 0;
    if (isBlocking) {
      setBlockedZones(['z2']); // Block West Corridor
      onEvent({
        id: `fail_${Date.now()}`,
        type: 'structural',
        label: 'Structural Failure',
        severity: 'critical',
        icon: '⚠️',
        action: 'Dynamic Reroute: West corridor blocked. Recalculating path to South-Exit B in 0.8s.',
        room: '102',
        timestamp: new Date(),
        responseTime: 800,
        confidence: 94
      });
    } else {
      setBlockedZones([]);
    }
  };

  // Agent movement loop
  useEffect(() => {
    const t = setInterval(() => {
      setAgents(prev => prev.map(a => {
        let tx = 80, ty = 80; // Safe Exit B
        
        // If West corridor is blocked, recalculate
        if (blockedZones.includes('z2') && a.x < 40 && a.y > 50) {
          // Reroute toward Elevator Hall instead of West Corridor
          tx = 60; ty = 30; 
        }

        const dx = tx - a.x;
        const dy = ty - a.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 5) return { ...a, x: 20 + Math.random() * 20, y: 10 + Math.random() * 20 }; // Reset for loop simulation
        
        const speed = a.speed * (stampedeRisk ? 2.5 : 1);
        return {
          ...a,
          x: a.x + (dx/dist) * speed,
          y: a.y + (dy/dist) * speed,
          panic: stampedeRisk
        };
      }));
    }, 50);
    return () => clearInterval(t);
  }, [blockedZones, stampedeRisk]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(100,210,255,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>👥</span>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff' }}>AGENTIC NAV & CROWD FLOW</div>
            <div style={{ fontSize: '8px', color: '#64d2ff' }}>Dynamic 3D Rerouting Engine</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={toggleStructuralFailure} className="btn-sentinel" 
            style={{ fontSize: '9px', background: blockedZones.length > 0 ? 'rgba(255,45,85,0.2)' : 'none', color: blockedZones.length > 0 ? '#ff2d55' : 'inherit' }}>
            {blockedZones.length > 0 ? 'FIX STRUCTURE' : 'FAIL STRUCTURE'}
          </button>
          <button onClick={() => setStampedeRisk(!stampedeRisk)} className="btn-sentinel" style={{ fontSize: '9px' }}>
            {stampedeRisk ? 'CALM' : 'SIM PANIC'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', background: '#090c14' }}>
        {/* Zones */}
        {ZONES.map(z => (
          <div key={z.id} style={{
            position: 'absolute', left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%`,
            border: `1px dashed ${blockedZones.includes(z.id) ? '#ff2d55' : 'rgba(100,210,255,0.2)'}`,
            background: blockedZones.includes(z.id) ? 'rgba(255,45,85,0.1)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '8px', color: blockedZones.includes(z.id) ? 'var(--accent-red)' : 'rgba(255,255,255,0.2)', textTransform: 'uppercase', fontWeight: 'bold' }}>
              {blockedZones.includes(z.id) ? '⚠️ STAMPEDE_RISK: DETECTED' : z.name}
            </span>
            {blockedZones.includes(z.id) && <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--accent-red)', animation: 'evacuation-flash 0.5s infinite' }} />}
          </div>
        ))}

        {/* The "Green Path" Navigation */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#30d158" />
              </marker>
            </defs>
            <path 
              d={blockedZones.includes('z2') ? "M 20 20 L 60 30 L 80 80" : "M 20 20 L 20 70 L 80 80"} 
              stroke="#30d158" strokeWidth="4" fill="none" opacity="0.3" markerEnd="url(#arrowhead)" 
            />
        </svg>

        {/* Agents */}
        {agents.map(a => (
          <div key={a.id} style={{
            position: 'absolute', left: `${a.x}%`, top: `${a.y}%`,
            width: '6px', height: '6px', background: a.panic ? '#ff2d55' : '#0a84ff', borderRadius: '50%',
            transition: 'background 0.3s ease',
            boxShadow: a.panic ? '0 0 10px #ff2d55' : 'none'
          }} />
        ))}
      </div>

      <div style={{ padding: '8px 14px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
          CALCULATING SAFE EXIT PATH... <span style={{ color: '#30d158' }}>0.8s LATENCY</span>
        </div>
        <div style={{ fontSize: '9px', color: '#ff2d55', fontWeight: 'bold' }}>
          {stampedeRisk ? '⚠️ STAMPEDE RISK: HIGH' : '✅ FLOW: NOMINAL'}
        </div>
      </div>
    </div>
  );
}
