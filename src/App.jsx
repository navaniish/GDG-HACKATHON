import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { analyzeDistressSignal } from './services/nvidia';
import FloorMap from './components/FloorMap';
import TacticalThreeMap from './components/TacticalThreeMap';
import ResponderPanel from './components/ResponderPanel';
import GuestPhonePanel from './components/GuestPhonePanel';
import SensorHealth from './components/SensorHealth';
import SMSAlert from './components/SMSAlert';
import AIIntelligence from './components/AIIntelligence';
import CommunicationBridge from './components/CommunicationBridge';
import CoordinationPanel from './components/CoordinationPanel';
import ResiliencePrivacy from './components/ResiliencePrivacy';
import SatelliteMap from './components/SatelliteMap';
import Auth from './components/Auth';
import YoloVision from './components/YoloVision';
import {
  generateRooms, generateResponders, generateSensors,
  generateEvent, updateSensorValue, DEMO_SEQUENCE, generateSMSAlert,
} from './simulation';

export default function App() {
  const [rooms, setRooms] = useState(generateRooms);
  const [responders, setResponders] = useState(generateResponders);
  const [sensors, setSensors] = useState(generateSensors);
  const [events, setEvents] = useState([]);
  const [blackBox, setBlackBox] = useState([]); 
  const [offlineMode, setOfflineMode] = useState(false);
  const [activeFloor, setActiveFloor] = useState(2);
  const [activeView, setActiveView] = useState('01_TACTICAL_XRAY');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [socket, setSocket] = useState(null);
  const [hazardZones, setHazardZones] = useState([]);
  const [activeCrisis, setActiveCrisis] = useState(false);
  const [panicMode, setPanicMode] = useState(false);
  const [blueprintActive, setBlueprintActive] = useState(false);
  const [buildingMetadata, setBuildingMetadata] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiBriefing, setAiBriefing] = useState("");
  const [session, setSession] = useState(null);
  const [smsAlert, setSmsAlert] = useState(null);

  useEffect(() => {
    if (!session) return;
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);
    
    newSocket.on('initial_state', (state) => {
      setHazardZones(state.hazardZones || []);
      setActiveCrisis(state.activeCrisis || false);
      if (state.rooms?.length > 0) setRooms(state.rooms);
    });

    newSocket.on('occupancy_update', (updatedRooms) => {
      setRooms(updatedRooms);
    });

    newSocket.on('crisis_event', async (data) => {
      setHazardZones(data.state.hazardZones);
      setActiveCrisis(true);
      if (data.state.rooms) setRooms(data.state.rooms);
      try {
        const briefResult = await analyzeDistressSignal(`CRITICAL INCIDENT: ${data.log}`);
        setAiBriefing(briefResult.responder_brief || briefResult.brief);
      } catch (err) {
        setAiBriefing("CRITICAL: AI PILOT OFFLINE.");
      }
    });

    newSocket.on('crisis_resolved', (state) => {
      setHazardZones([]);
      setActiveCrisis(false);
      setAiBriefing("");
      if (state.rooms) setRooms(state.rooms);
    });

    newSocket.emit('DASHBOARD_BOOT', { timestamp: Date.now(), tenant_id: session.tenant_id });

    return () => newSocket.close();
  }, [session]);

  const addEvent = useCallback((event) => {
    setEvents(prev => [event, ...prev].slice(0, 50));
    setBlackBox(prev => [{ timestamp: new Date().toISOString(), action: event.label.toUpperCase() }, ...prev]);
    if (event.severity === 'critical') {
      setActiveCrisis(true);
      setSmsAlert(generateSMSAlert(event));
      setTimeout(() => setSmsAlert(null), 6000);
    }
  }, []);

  const handleFetchBuildingMetadata = async (lat = 19.0760, lng = 72.8777) => {
    setIsScanning(true);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/building?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      setBuildingMetadata(data);
      setBlueprintActive(true);
    } catch(err) {
      console.error('Sentinel-X API Error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (session) handleFetchBuildingMetadata(19.0760, 72.8777);
  }, [session]);

  if (!session) {
    return <Auth onLogin={(userConf) => setSession(userConf)} />;
  }

  return (
    <div className="sentinel-grid">
      {/* HEADER: High-Intensity Distress (Image Match) */}
      <header className="header-main">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
           <div style={{ width: '30px', height: '30px', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>👁️</div>
           <div className="flex flex-col">
              <span className="tactical-font" style={{ fontSize: '18px', fontWeight: 'bold' }}>SENTINEL-X</span>
              <span style={{ fontSize: '8px', color: 'var(--text-dim)', letterSpacing: '2px' }}>AUTONOMOUS AI SECURITY SYSTEM</span>
           </div>
        </div>

        <div className="alert-banner">
           <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--accent-red)' }}>⚠️ DISTRESS DETECTED</div>
              <div className="tactical-font" style={{ fontSize: '16px', fontWeight: 'bold' }}>ROOM 204</div>
           </div>
        </div>

        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
           <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '7px', color: 'var(--text-dim)' }}>RESPONSE TIME</div>
              <div className="tactical-font" style={{ fontSize: '18px' }}>0.32s</div>
           </div>
           <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '7px', color: 'var(--text-dim)' }}>10:24:37 AM</div>
              <div style={{ fontSize: '9px', color: 'var(--accent-green)', fontWeight: 'bold' }}>MESH NETWORK ACTIVE</div>
           </div>
        </div>
      </header>

      {/* LEFT SIDEBAR: Nav & Floor Selection */}
      <aside className="sidebar-left">
        <nav className="glass-panel" style={{ padding: '8px 0', flex: 'none' }}>
           <div className={`nav-item ${activeView === 'DASHBOARD' ? 'active' : ''}`} onClick={() => setActiveView('DASHBOARD')}>🏠 DASHBOARD</div>
           <div className={`nav-item ${activeView === '01_TACTICAL_XRAY' ? 'active' : ''}`} onClick={() => setActiveView('01_TACTICAL_XRAY')}>👁️ 3D X-RAY VIEW</div>
           <div className="nav-item">🧭 TACTICAL MAP</div>
           <div className="nav-item">⚠️ ALERTS <span style={{ background: 'var(--accent-red)', borderRadius: '10px', padding: '0 5px', fontSize: '8px', marginLeft: 'auto' }}>3</span></div>
           <div className="nav-item">🖥️ DEVICES</div>
           <div className="nav-item">⚙️ SETTINGS</div>
        </nav>

        <div className="glass-panel" style={{ padding: '15px' }}>
           <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '10px', fontWeight: 'bold' }}>FLOOR SELECTION</div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {['ROOF', 'FLOOR 3', 'FLOOR 2', 'FLOOR 1', 'BASEMENT'].map((f, i) => (
                <button key={f} className={`floor-btn ${activeFloor === (3-i) ? 'active' : ''}`} onClick={() => setActiveFloor(3-i)}>{f}</button>
              ))}
           </div>
        </div>

        <div className="glass-panel" style={{ padding: '15px', flex: 1 }}>
           <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '10px', fontWeight: 'bold' }}>LEGEND</div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <LegendItem color="var(--accent-green)" label="SURVIVOR" />
              <LegendItem color="var(--accent-red)" label="THREAT" />
              <LegendItem color="var(--accent-orange)" label="UNKNOWN" />
              <LegendItem color="var(--accent-cyan)" label="RESPONDER" />
              <LegendItem color="#fff" label="EXIT" />
           </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="main-view glass-panel">
         <TacticalThreeMap rooms={rooms} activeFloor={activeFloor} onRoomSelect={setSelectedRoom} />
      </main>

      {/* RIGHT SIDEBAR: Tactical HUD */}
      <aside className="sidebar-right">
        <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
           <div className="tactical-font" style={{ fontSize: '12px', color: 'var(--accent-red)', marginBottom: '15px' }}>ROOM 204 DETAILS</div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>STATUS</span><span style={{ color: 'var(--accent-red)' }}>DISTRESS DETECTED</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>OCCUPANTS</span><span style={{ color: 'var(--accent-red)' }}>2 THREATS</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span></span><span style={{ color: 'var(--accent-green)' }}>0 SURVIVORS</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>RISK LEVEL</span><span style={{ color: 'var(--accent-red)' }}>HIGH [----]</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>LAST UPDATE</span><span style={{ color: 'var(--text-dim)' }}>10:24:36 AM</span></div>
              
              <div style={{ marginTop: '20px', fontSize: '8px', color: 'var(--text-dim)' }}>SENSOR FEED</div>
              <div style={{ height: '100px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                 <YoloVision activeCrisis={true} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                 <span style={{ fontSize: '8px' }}>WIFI SIGNAL STRENGTH</span>
                 <span style={{ color: 'var(--accent-green)' }}>📡 -45 dBm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ fontSize: '8px' }}>MOTION DETECTED</span>
                 <span style={{ color: 'var(--accent-green)' }}>YES</span>
              </div>
           </div>
        </div>

        <div className="glass-panel" style={{ height: '220px', padding: '15px' }}>
           <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', marginBottom: '10px', fontWeight: 'bold' }}>SAFE PATH SUGGESTION</div>
           <div style={{ height: '140px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 10, border: '1px solid var(--border-dim)', opacity: 0.3 }}>
                 <div style={{ position: 'absolute', top: '20px', left: '20px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }} />
                 <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-red)', animation: 'heartbeat 1s infinite' }} />
                 <svg width="100%" height="100%"><path d="M 20 20 L 100 20 L 100 80 L 140 100" stroke="var(--accent-green)" strokeWidth="2" fill="none" strokeDasharray="4,4" /></svg>
              </div>
           </div>
           <div style={{ fontSize: '8px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '5px' }}>RECOMMENDED ROUTE (ENTRANCE → ROOM 204)</div>
        </div>
      </aside>

      {/* BOTTOM PANELS (Logs, Alerts, Heatmap) */}
      <footer className="bottom-panels">
         <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '5px 15px', fontSize: '9px', fontWeight: 'bold', color: 'var(--text-dim)' }}>SYSTEM LOGS</div>
            <div style={{ flex: 1, padding: '10px', fontSize: '9px', color: 'var(--accent-green)', fontFamily: 'monospace', overflowY: 'auto' }}>
               <div>[10:24:36 AM] Distress sound detected in Room 204</div>
               <div>[10:24:36 AM] Doors unlocked - Room 204</div>
               <div>[10:24:36 AM] Beacon activated</div>
               <div>[10:24:37 AM] Tactical map updated</div>
               <div>[10:24:37 AM] Mesh network stable</div>
            </div>
         </div>

         <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '5px 15px', fontSize: '9px', fontWeight: 'bold', color: 'var(--text-dim)' }}>LIVE ALERTS</div>
            <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-red)', animation: 'heartbeat 1s infinite' }} />
                  <span style={{ fontSize: '9px', color: 'var(--accent-red)', fontWeight: 'bold' }}>DISTRESS DETECTED - ROOM 204</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-orange)' }} />
                  <span style={{ fontSize: '9px', color: 'var(--accent-orange)' }}>Crowd density high - Corridor B</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }} />
                  <span style={{ fontSize: '9px', color: '#fff' }}>Exit 2 Clear</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }} />
                  <span style={{ fontSize: '9px', color: '#fff' }}>System Check Completed</span>
               </div>
            </div>
         </div>

         <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '5px 15px', fontSize: '9px', fontWeight: 'bold', color: 'var(--text-dim)' }}>CROWD DENSITY HEATMAP</div>
            <div style={{ flex: 1, display: 'flex' }}>
               <div style={{ flex: 1, position: 'relative', background: 'rgba(0,210,255,0.05)' }}>
                  <div style={{ position: 'absolute', top: '20%', left: '30%', width: '40px', height: '40px', background: 'radial-gradient(circle, var(--accent-red) 0%, transparent 70%)', opacity: 0.6 }} />
                  <div style={{ position: 'absolute', bottom: '30%', right: '20%', width: '60px', height: '60px', background: 'radial-gradient(circle, var(--accent-orange) 0%, transparent 70%)', opacity: 0.4 }} />
               </div>
               <div style={{ width: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', fontSize: '7px' }}>
                  <span style={{ color: 'var(--accent-red)' }}>HIGH</span>
                  <div style={{ width: '6px', flex: 1, background: 'linear-gradient(to top, var(--accent-green), var(--accent-orange), var(--accent-red))', borderRadius: '3px', margin: '3px 0' }} />
                  <span style={{ color: 'var(--accent-green)' }}>LOW</span>
               </div>
            </div>
         </div>
      </footer>

      <GuestPhonePanel onSOS={(type) => addEvent({ id: Date.now(), label: `${type.toUpperCase()} SIGNAL DETECTED`, severity: 'critical', timestamp: new Date() })} offlineMode={offlineMode} />
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
       <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
       <span style={{ fontSize: '9px', color: '#fff', fontWeight: 'bold' }}>{label}</span>
    </div>
  );
}

function DetailRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
       <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{label}</span>
       <span style={{ fontSize: '10px', color: color, fontWeight: 'bold' }}>{value}</span>
    </div>
  );
}
