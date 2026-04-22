import React, { useState, useEffect, useRef } from 'react';
import { analyzeDistressSignal } from '../services/nvidia';

// Simulated Claude AI - Building Pilot specialized responses
const PILOT_CATEGORIES = {
  'fire': { priority: 9, actions: ['Arm Zone-B Sprinklers', 'Expose Emergency Exits', 'Positive Pressure HVAC'], brief: 'FIRE: FLOOR 2 RM 201. SPREADING EAST. EVACUATE ADJACENT ROOMS.' },
  'terrorist': { priority: 10, actions: ['Hard Lockdown Level 3', 'Muffle Hallway Lights', 'Unlock Safe Room 402'], brief: 'THREAT: ACTIVE INTRUDER LOBBY. CCTV COORDINATES STORED. DISPATCH ARMED RESPONSE.' },
  'shooter': { priority: 10, actions: ['Seal Lift Shafts', 'Flood Perimeter Fog', 'Unlock All Emergency Exits'], brief: 'THREAT: ACTIVE SHOOTER F1. 2 SUSPECTS. 14 CIVILIANS PINNED.' },
  'medical': { priority: 8, actions: ['Unlock Main Entrance', 'Hold Service Lift', 'Illuminate Room AED Path'], brief: 'MEDICAL: CARDIAC ARREST RM 302. ETA 3m. AED DEPLOYED.' },
  'structural': { priority: 7, actions: ['Block East Stairwell', 'Recalculate Evac Route', 'Seal Underground Pipes'], brief: 'STRUCTURAL: GAS LEAK BASEMENT. CRITICAL RISK. SEAL VENTILATION.' },
};

export default function AIIntelligence({ events, rooms }) {
  const [activeTab, setActiveTab] = useState('pilot');
  const [pilotInput, setPilotInput] = useState('');
  const [pilotOutput, setPilotOutput] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cctvObjects, setCctvObjects] = useState([]);
  const canvasRef = useRef(null);

  // Building Pilot Logic
  const handlePilotAnalysis = async () => {
    if (!pilotInput.trim()) return;
    setScanning(true);
    setPilotOutput(null);
    
    try {
      const result = await analyzeDistressSignal(pilotInput);
      if (result) {
        setPilotOutput(result);
      }
    } catch (error) {
      console.error("Pilot Error:", error);
      // Fallback to simulation if API fails or key is invalid
      setPilotOutput({
        category: "SYSTEM_OFFLINE",
        priority: 0,
        autonomous_actions: ["Check API Key", "Reboot Sentinel-X Node", "Manual Triage Required"],
        responder_brief: "ERROR: BUILDING PILOT LINK DOWN. MANUAL RESPONSE REQUIRED."
      });
    } finally {
      setScanning(false);
    }
  };

  // CCTV Simulation Logic
  useEffect(() => {
    if (activeTab !== 'cctv') return;
    const interval = setInterval(() => {
      const threats = [];
      if (Math.random() > 0.7) {
        threats.push({ x: 30 + Math.random() * 40, y: 40 + Math.random() * 30, type: 'ABANDONED_LUGGAGE', id: Date.now() });
      }
      if (Math.random() > 0.9) {
        threats.push({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, type: 'WEAPON_DETECTED', id: Date.now() + 1 });
      }
      setCctvObjects(threats);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const TABS = [
    { id: 'pilot', label: '🛡 Pilot' },
    { id: 'cctv', label: '👁 Visual' },
    { id: 'briefing', label: '📋 Briefing' },
    { id: 'report', label: '📄 Report' },
  ];

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'rgba(13,17,23,0.98)', 
      borderRadius: '10px', 
      border: '1px solid rgba(191,90,242,0.3)', 
      overflow: 'hidden' 
    }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, background: 'rgba(191,90,242,0.05)' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg,#7928ca,#ff0080)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>🤖</div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }} className="font-orbitron">SENTINEL-X BUILDING PILOT</div>
          <div style={{ fontSize: '8px', color: 'rgba(118, 185, 0, 1)', fontWeight: 'bold' }}>⚡ NVIDIA NIM: LIVE LINKED</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ 
              flex: 1, padding: '8px 2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              borderBottom: activeTab === tab.id ? '2px solid #bf5af2' : '2px solid transparent',
              color: activeTab === tab.id ? '#bf5af2' : 'rgba(255,255,255,0.35)',
              fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' 
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>

        {/* Building Pilot Terminal */}
        {activeTab === 'pilot' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '4px' }}>Analyze Distress Signal</div>
            <div style={{ position: 'relative' }}>
              <textarea 
                value={pilotInput}
                onChange={(e) => setPilotInput(e.target.value)}
                placeholder="Paste Guest Text or Sensor Data packet..."
                style={{
                  width: '100%', height: '80px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(191,90,242,0.2)',
                  borderRadius: '6px', color: '#bf5af2', padding: '10px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none', resize: 'none'
                }}
              />
              <button 
                onClick={handlePilotAnalysis}
                disabled={scanning}
                style={{
                  position: 'absolute', right: '10px', bottom: '10px',
                  background: '#bf5af2', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px',
                  fontSize: '9px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                {scanning ? 'ANALYZING...' : 'RUN CLAUDE AI'}
              </button>
            </div>

            {pilotOutput && (
              <div style={{ 
                animation: 'fade-in-up 0.3s ease',
                background: 'rgba(191,90,242,0.05)', border: '1px solid rgba(191,90,242,0.3)', borderRadius: '8px', padding: '12px'
              }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#bf5af2', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>JSON OUTPUT: PILOT_RESPONSE</span>
                  <span style={{ color: '#ff2d55' }}>PRIORITY {pilotOutput.priority}</span>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#fff', marginBottom: '10px' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(pilotOutput, null, 2)}
                  </pre>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-sentinel" style={{ flex: 1, fontSize: '9px', background: 'rgba(48,209,88,0.1)', color: '#30d158' }}>EXECUTE ACTIONS</button>
                  <button className="btn-sentinel" style={{ flex: 1, fontSize: '9px' }}>LOG DATA</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CCTV Visual Analytics */}
        {activeTab === 'cctv' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Lobby CCTV - CAM_04</div>
              <div style={{ fontSize: '9px', color: '#30d158', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', background: '#30d158', borderRadius: '50%', animation: 'pulse-green 1s infinite' }} />
                AI ANALYTICS: ACTIVE
              </div>
            </div>
            
            {/* Camera View */}
            <div style={{ 
              flex: 1, background: '#111', borderRadius: '8px', position: 'relative', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)', minHeight: '180px'
            }}>
              {/* Scanline and grain */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%', pointerEvents: 'none', zIndex: 1 }} />
              
              <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>
                [ CCTV FEED MOCKED ]
              </div>

              {/* Object Detection Overlays */}
              {cctvObjects.map(obj => (
                <div key={obj.id} style={{
                  position: 'absolute', left: `${obj.x}%`, top: `${obj.y}%`,
                  width: '40px', height: '40px', border: '1px solid #ff2d55',
                  transform: 'translate(-50%, -50%)', animation: 'evacuation-flash 0.5s infinite'
                }}>
                  <div style={{ 
                    position: 'absolute', top: '-15px', whiteSpace: 'nowrap',
                    fontSize: '9px', background: '#ff2d55', color: '#fff', padding: '1px 4px', fontWeight: 'bold'
                  }}>
                    {obj.type} [{Math.round(obj.x)},{Math.round(obj.y)}]
                  </div>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,45,85,0.1)' }} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '9px', fontWeight: 'bold', color: cctvObjects.length > 0 ? '#ff2d55' : '#30d158', marginBottom: '4px' }}>
                {cctvObjects.length > 0 ? `THREAT_DETECTED at [${Math.round(cctvObjects[0].x)},${Math.round(cctvObjects[0].y)}]` : 'SECURE'}
              </div>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>
                Real-time scanning for: Abandoned luggage, visible firearms, lens glint/glare. Speed prioritized.
              </div>
            </div>
          </div>
        )}

        {/* Existing logic could go here or keep it clean for demo */}
        {(activeTab === 'briefing' || activeTab === 'report') && (
           <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '11px', padding: '20px' }}>
             Functionality unified in 🛡 Pilot tab for speed.
           </div>
        )}
      </div>
    </div>
  );
}
