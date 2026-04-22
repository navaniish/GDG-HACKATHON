import React, { useState, useEffect, useRef } from 'react';

// Simulated sensor fusion — thermal + WiFi + door + motion
const generateFusedReading = (roomId) => ({
  thermal: Math.floor(Math.random() * 4 + 1),
  wifi: Math.floor(Math.random() * 3),
  door: Math.random() > 0.15 ? 'closed' : Math.random() > 0.5 ? 'open' : 'forced',
  motion: Math.random() > 0.6 ? 'detected' : 'none',
  smoke: Math.floor(Math.random() * 15 + 4),
  water_leak: Math.random() > 0.97,
  timestamp: new Date(),
});

// Responder Task Assignment simulation
const TASKS = [
  { id: 't1', room: '204', incident: 'Acoustic Scream', assignee: 'Alpha Team', eta: '45s', status: 'en_route', priority: 'critical' },
  { id: 't2', room: '107', incident: 'Smoke Detected', assignee: 'Bravo Team', eta: '1m 20s', status: 'dispatched', priority: 'critical' },
  { id: 't3', room: 'Lobby', incident: 'Crowd Density', assignee: 'Delta Team', eta: '30s', status: 'on_scene', priority: 'warning' },
];

// Decision support context
const DECISIONS = [
  { trigger: 'Fire on Floor 2', question: 'Should I evacuate Floor 3?', recommendation: 'YES — Evacuate Floor 3. Smoke rises; thermal shows 48°C at stairwell. Use East stairwell only.', confidence: 94 },
  { trigger: 'SOS in Room 204', question: 'Nearest available responder?', recommendation: 'Alpha Team (23m, Floor 2 corridor). Bravo Team backup (67m, Floor 1). ETA: 38 seconds.', confidence: 98 },
  { trigger: 'High crowd density lobby', question: 'Which exit should I open?', recommendation: 'Open South Exit (Exit B). North exit is 12m narrower. Crowd flow model predicts 40% faster clearance.', confidence: 89 },
];

// Incident replay data
const REPLAY_EVENTS = [
  { time: 0, label: 'System boot — All sensors nominal', type: 'info', icon: '✅' },
  { time: 5, label: 'Crowd density rising in Lobby Zone A', type: 'warning', icon: '👥' },
  { time: 12, label: 'Guest SOS — Room 204 (via app)', type: 'critical', icon: '🆘' },
  { time: 18, label: 'Acoustic: Scream detected Room 204 — 91% confidence', type: 'critical', icon: '🎙' },
  { time: 21, label: 'Alpha Team dispatched — ETA 45s', type: 'info', icon: '🧑‍✈️' },
  { time: 34, label: 'Door auto-unlocked Room 204', type: 'info', icon: '🔓' },
  { time: 48, label: 'Alpha Team on scene — Room 204 cleared', type: 'info', icon: '✅' },
  { time: 62, label: 'Crowd density normalized — Laser path deactivated', type: 'info', icon: '👥' },
  { time: 78, label: 'All rooms secured — Incident resolved', type: 'info', icon: '🛡' },
];

export default function CoordinationPanel({ rooms, events, offlineMode, onEvent }) {
  const [activeTab, setActiveTab] = useState('sensor_fusion');
  const [fusedData, setFusedData] = useState({});
  const [tasks, setTasks] = useState(TASKS);
  const [decisionIdx, setDecisionIdx] = useState(0);
  const [replayPos, setReplayPos] = useState(0);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState([]);
  const replayRef = useRef(null);

  // Fused sensor updates
  useEffect(() => {
    const t = setInterval(() => {
      const sample = rooms.slice(0, 6);
      const updated = {};
      sample.forEach(r => { updated[r.id] = generateFusedReading(r.id); });
      setFusedData(updated);
    }, 2500);
    return () => clearInterval(t);
  }, [rooms]);

  // Replay scrubber
  useEffect(() => {
    if (!replayPlaying) return;
    replayRef.current = setInterval(() => {
      setReplayPos(prev => {
        const next = prev + 1;
        if (next > 78) { setReplayPlaying(false); return 78; }
        const visible = REPLAY_EVENTS.filter(e => e.time <= next);
        setVisibleEvents(visible);
        return next;
      });
    }, 300);
    return () => clearInterval(replayRef.current);
  }, [replayPlaying]);

  const startReplay = () => { setReplayPos(0); setVisibleEvents([]); setReplayPlaying(true); };

  const TABS = [
    { id: 'sensor_fusion', label: '🔬 Fusion' },
    { id: 'tasks', label: '📋 Tasks' },
    { id: 'decision', label: '🧠 Decision' },
    { id: 'replay', label: '⏮ Replay' },
  ];

  const STATUS_COLOR = { en_route: '#0a84ff', dispatched: '#ffd60a', on_scene: '#30d158', completed: '#30d158' };
  const SEVERITY_COLOR = { critical: '#ff2d55', warning: '#ff6b35', info: '#64d2ff' };

  return (
    <div style={{ height: '100%', background: 'rgba(13,17,23,0.95)', borderRadius: '10px', border: '1px solid rgba(48,209,88,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, background: 'rgba(48,209,88,0.04)' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg,#1a3a2a,#30d158)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>⚙️</div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>COORDINATION & RESPONSE</div>
          <div style={{ fontSize: '9px', color: 'rgba(48,209,88,0.8)' }}>Sensor Fusion · Task Assignment · Decision AI</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: '9px', color: '#30d158', fontWeight: 600, padding: '2px 6px', background: 'rgba(48,209,88,0.1)', borderRadius: '4px', border: '1px solid rgba(48,209,88,0.3)' }}>Ops Center</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, padding: '6px 2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              borderBottom: activeTab === tab.id ? '2px solid #30d158' : '2px solid transparent',
              color: activeTab === tab.id ? '#30d158' : 'rgba(255,255,255,0.35)',
              fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>

        {/* Multi-Sensor Fusion */}
        {activeTab === 'sensor_fusion' && (
          <div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
              Thermal · Wi-Fi MAC · Door contacts · Motion · Smoke — correlated anomalies trigger escalation.
            </div>
            {rooms.slice(0, 6).map(room => {
              const d = fusedData[room.id];
              if (!d) return null;
              const anomaly = d.door === 'forced' || d.smoke > 20 || d.water_leak;
              return (
                <div key={room.id} style={{ padding: '8px', marginBottom: '5px', background: anomaly ? 'rgba(255,45,85,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${anomaly ? 'rgba(255,45,85,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: anomaly ? '#ff2d55' : 'rgba(255,255,255,0.8)' }}>Room {room.number}</span>
                    {anomaly && <span style={{ fontSize: '9px', color: '#ff2d55', fontWeight: 700, animation: 'beacon-flash 1s infinite' }}>⚠ ANOMALY</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { icon: '🌡', val: `${d.thermal}p`, label: 'Thermal' },
                      { icon: '📶', val: `${d.wifi}d`, label: 'Wi-Fi' },
                      { icon: '🚪', val: d.door, label: 'Door', alert: d.door !== 'closed' },
                      { icon: '💨', val: `${d.smoke}ppm`, label: 'Smoke', alert: d.smoke > 20 },
                      { icon: '👤', val: d.motion, label: 'Motion' },
                    ].map(s => (
                      <div key={s.label} style={{ fontSize: '9px', color: s.alert ? '#ff6b35' : 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
                        <div>{s.icon} {s.val}</div>
                      </div>
                    ))}
                    {d.water_leak && <span style={{ fontSize: '9px', color: '#0a84ff', fontWeight: 700 }}>💧 LEAK</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Responder Task Assignment */}
        {activeTab === 'tasks' && (
          <div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
              Claude assigns nearest available staff to each incident sub-task with an ETA estimate. Staff receive push notification with route and briefing.
            </div>
            {tasks.map(task => (
              <div key={task.id} style={{ padding: '10px', marginBottom: '6px', background: task.priority === 'critical' ? 'rgba(255,45,85,0.06)' : 'rgba(255,107,53,0.06)', border: `1px solid ${task.priority === 'critical' ? 'rgba(255,45,85,0.3)' : 'rgba(255,107,53,0.3)'}`, borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: task.priority === 'critical' ? '#ff2d55' : '#ff6b35', marginBottom: '2px' }}>
                      {task.incident}
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>🏨 Room {task.room}</div>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: STATUS_COLOR[task.status], padding: '2px 6px', background: `${STATUS_COLOR[task.status]}15`, border: `1px solid ${STATUS_COLOR[task.status]}30`, borderRadius: '4px', textTransform: 'uppercase' }}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span style={{ color: '#0a84ff' }}>🧑‍✈️ {task.assignee}</span>
                  <span style={{ color: '#30d158' }}>⏱ ETA: {task.eta}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  <button onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'on_scene' } : t))}
                    style={{ flex: 1, padding: '5px', background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.3)', borderRadius: '5px', color: '#30d158', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 600 }}>
                    ✅ On Scene
                  </button>
                  <button onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed' } : t))}
                    style={{ flex: 1, padding: '5px', background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.3)', borderRadius: '5px', color: '#0a84ff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 600 }}>
                    🏁 Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Decision Support Assistant */}
        {activeTab === 'decision' && (
          <div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
              Ask Claude a real-time crisis question — get a data-backed recommendation in natural language.
            </div>
            {/* Navigator */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {DECISIONS.map((d, i) => (
                <button key={i} onClick={() => setDecisionIdx(i)}
                  style={{ padding: '4px 8px', background: decisionIdx === i ? 'rgba(48,209,88,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${decisionIdx === i ? 'rgba(48,209,88,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '5px', color: decisionIdx === i ? '#30d158' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '9px' }}>
                  #{i + 1}
                </button>
              ))}
            </div>
            {(() => {
              const d = DECISIONS[decisionIdx];
              return (
                <div style={{ animation: 'fade-in-up 0.3s ease-out' }}>
                  <div style={{ padding: '10px', background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.25)', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,107,53,0.8)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔴 Trigger</div>
                    <div style={{ fontSize: '11px', color: '#ff6b35', fontWeight: 600 }}>{d.trigger}</div>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(10,132,255,0.06)', border: '1px solid rgba(10,132,255,0.2)', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(10,132,255,0.8)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>❓ Question</div>
                    <div style={{ fontSize: '11px', color: '#0a84ff', fontWeight: 600 }}>{d.question}</div>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(48,209,88,0.06)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ fontSize: '9px', color: 'rgba(48,209,88,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🤖 Claude Recommendation</div>
                      <span style={{ fontSize: '9px', color: '#30d158', fontWeight: 700 }}>{d.confidence}% confidence</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{d.recommendation}</div>
                    <div style={{ marginTop: '6px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${d.confidence}%`, background: 'linear-gradient(90deg,#1a3a2a,#30d158)', borderRadius: '2px' }} />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Incident Replay */}
        {activeTab === 'replay' && (
          <div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
              Scrub through any past incident timeline for training. Claude scores staff response time and decision quality.
            </div>
            {/* Timeline scrubber */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
                <span>T+{replayPos}s</span>
                <span>Duration: 78s</span>
              </div>
              <input type="range" min="0" max="78" value={replayPos}
                onChange={e => { const v = parseInt(e.target.value); setReplayPos(v); setVisibleEvents(REPLAY_EVENTS.filter(ev => ev.time <= v)); }}
                style={{ width: '100%', accentColor: '#30d158', cursor: 'pointer' }} />
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <button onClick={startReplay}
                  style={{ flex: 1, padding: '7px', background: 'rgba(48,209,88,0.15)', border: '1px solid rgba(48,209,88,0.4)', borderRadius: '6px', color: '#30d158', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 700 }}>
                  {replayPlaying ? '⏸ Playing...' : '▶ Play Replay'}
                </button>
                <button onClick={() => { setReplayPos(0); setVisibleEvents([]); setReplayPlaying(false); }}
                  style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '10px' }}>
                  ↺ Reset
                </button>
              </div>
            </div>
            {/* Events */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(visibleEvents.length > 0 ? visibleEvents : REPLAY_EVENTS).map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 8px', background: (visibleEvents.length === 0 || visibleEvents.find(v => v.time === ev.time)) ? 'rgba(255,255,255,0.03)' : 'transparent', borderRadius: '6px', opacity: visibleEvents.length === 0 || visibleEvents.find(v => v.time === ev.time) ? 1 : 0.3, transition: 'all 0.3s ease' }}>
                  <span style={{ fontSize: '12px', flexShrink: 0 }}>{ev.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', color: SEVERITY_COLOR[ev.type] || 'rgba(255,255,255,0.7)', fontWeight: ev.type === 'critical' ? 700 : 400 }}>{ev.label}</div>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)' }}>T+{ev.time}s</div>
                  </div>
                </div>
              ))}
            </div>
            {replayPos >= 78 && (
              <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.3)', borderRadius: '8px', animation: 'fade-in-up 0.3s ease-out' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#30d158', marginBottom: '4px' }}>🤖 Claude Performance Score</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 900, color: '#30d158', fontFamily: 'Orbitron' }}>A+</div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>Response Tier</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 900, color: '#0a84ff', fontFamily: 'Orbitron' }}>48s</div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>Avg Response</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 900, color: '#bf5af2', fontFamily: 'Orbitron' }}>96%</div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>AI Accuracy</div></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
