import React, { useState, useEffect } from 'react';

// QR Code SVG generator (simple matrix pattern for demo)
function QRCode({ data, size = 120 }) {
  const cells = 21;
  const cell = size / cells;
  // Generate a deterministic-looking pattern from the data string
  const hash = (data || '').split('').reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0);
  const bits = Array.from({ length: cells * cells }, (_, i) => {
    const x = i % cells;
    const y = Math.floor(i / cells);
    // Finder patterns
    if ((x < 7 && y < 7) || (x > cells - 8 && y < 7) || (x < 7 && y > cells - 8)) return 1;
    // Timing
    if ((x === 6 || y === 6) && x > 7 && x < cells - 8) return (x + y) % 2 === 0 ? 1 : 0;
    // Data
    return (Math.abs(hash * (i + 1)) >> (i % 8)) & 1;
  });
  return (
    <svg width={size} height={size} style={{ borderRadius: '4px', background: '#fff' }}>
      {bits.map((b, i) => {
        if (!b) return null;
        const x = (i % cells) * cell;
        const y = Math.floor(i / cells) * cell;
        return <rect key={i} x={x} y={y} width={cell} height={cell} fill="#090c14" />;
      })}
    </svg>
  );
}

// Edge AI on-device processing log
const EDGE_LOGS = [
  { time: 0.12, msg: 'Acoustic buffer captured (512ms window)', node: 'Jetson Orin' },
  { time: 0.18, msg: 'FFT analysis complete — 64 frequency bins', node: 'TinyML Edge' },
  { time: 0.23, msg: 'Peak detected: 1847 Hz / 78% amplitude', node: 'TinyML Edge' },
  { time: 0.29, msg: 'Model inference: scream_v2.tflite (91% conf.)', node: 'Jetson Orin' },
  { time: 0.31, msg: 'Alert dispatched — no cloud needed', node: 'LoRa Bridge' },
  { time: 0.35, msg: 'Room 204 flagged — response initiated', node: 'SENTINEL-X' },
];

const PRIVACY_CHECKS = [
  { label: 'Biometric data stored', value: 'NO — Processed at edge only', ok: true },
  { label: 'Audio uploaded to cloud', value: 'NO — On-device FFT only', ok: true },
  { label: 'Face recognition', value: 'DISABLED — Heat signatures only', ok: true },
  { label: 'Guest identity logged', value: 'Room number only (no PII)', ok: true },
  { label: 'IT Act 2023 compliance', value: '✅ Compliant', ok: true },
  { label: 'GDPR Article 2023', value: '✅ Compliant', ok: true },
  { label: 'Data retention', value: 'Event logs — 30 days, then purged', ok: true },
];

export default function ResiliencePrivacy({ rooms, offlineMode }) {
  const [activeTab, setActiveTab] = useState('p2p');
  const [meshSending, setMeshSending] = useState(false);
  const [meshReceived, setMeshReceived] = useState(false);
  const [meshHops, setMeshHops] = useState([]);
  const [selectedQRRoom, setSelectedQRRoom] = useState(null);
  const [edgeLogs, setEdgeLogs] = useState([]);

  useEffect(() => {
    if (rooms && rooms.length > 0) {
      setSelectedQRRoom(rooms[0]);
    }
  }, [rooms]);
  const [runningEdge, setRunningEdge] = useState(false);

  const simulateMeshHop = () => {
    setMeshSending(true);
    setMeshHops([]);
    setMeshReceived(false);
    const hops = [
      { node: 'Guest Device', status: 'sent', delay: 0, icon: '📱' },
      { node: 'LoRa Node A (Room 101)', status: 'hop', delay: 400, icon: '📡' },
      { node: 'LoRa Node B (Corridor)', status: 'hop', delay: 800, icon: '📡' },
      { node: 'LoRa Node C (Lobby)', status: 'hop', delay: 1200, icon: '📡' },
      { node: 'Responder Dashboard', status: 'received', delay: 1600, icon: '🖥' },
    ];
    hops.forEach((hop, i) => {
      setTimeout(() => {
        setMeshHops(prev => [...prev, hop]);
        if (i === hops.length - 1) { setMeshReceived(true); setMeshSending(false); }
      }, hop.delay);
    });
  };

  const runEdgeInference = () => {
    setRunningEdge(true);
    setEdgeLogs([]);
    EDGE_LOGS.forEach((log, i) => {
      setTimeout(() => {
        setEdgeLogs(prev => [...prev, log]);
        if (i === EDGE_LOGS.length - 1) setRunningEdge(false);
      }, i * 350);
    });
  };

  const TABS = [
    { id: 'p2p', label: '📡 P2P Mesh' },
    { id: 'edge', label: '⚡ Edge AI' },
    { id: 'qr', label: '📷 QR Brief' },
    { id: 'privacy', label: '🔐 Privacy' },
  ];

  const NODE_COLORS = { sent: '#0a84ff', hop: '#64d2ff', received: '#30d158' };

  return (
    <div style={{ height: '100%', background: 'rgba(13,17,23,0.95)', borderRadius: '10px', border: '1px solid rgba(255,107,53,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, background: 'rgba(255,107,53,0.04)' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg,#ff6b35,#ff2d55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🔐</div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>RESILIENCE & PRIVACY</div>
          <div style={{ fontSize: '9px', color: 'rgba(255,107,53,0.8)' }}>P2P Mesh · Edge AI · On-device processing</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: '9px', color: offlineMode ? '#ff6b35' : '#30d158', fontWeight: 600, padding: '2px 6px', background: offlineMode ? 'rgba(255,107,53,0.1)' : 'rgba(48,209,88,0.1)', borderRadius: '4px', border: `1px solid ${offlineMode ? 'rgba(255,107,53,0.3)' : 'rgba(48,209,88,0.3)'}` }}>
            {offlineMode ? '📡 MESH' : '🌐 ONLINE'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, padding: '6px 2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              borderBottom: activeTab === tab.id ? '2px solid #ff6b35' : '2px solid transparent',
              color: activeTab === tab.id ? '#ff6b35' : 'rgba(255,255,255,0.35)',
              fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>

        {/* P2P Mesh Bridge */}
        {activeTab === 'p2p' && (
          <div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
              If internet is cut, SENTINEL-X switches to LoRa/Bluetooth mesh. SOS signals hop device-to-device until they reach the responder tablet.
            </div>

            {/* Status banner */}
            <div style={{ padding: '10px', marginBottom: '12px', background: offlineMode ? 'rgba(255,107,53,0.1)' : 'rgba(48,209,88,0.08)', border: `1px solid ${offlineMode ? 'rgba(255,107,53,0.4)' : 'rgba(48,209,88,0.3)'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>{offlineMode ? '📡' : '🌐'}</span>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: offlineMode ? '#ff6b35' : '#30d158' }}>{offlineMode ? 'OFFLINE MESH ACTIVE' : 'Online Mode — Internet Connected'}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{offlineMode ? 'LoRa 868 MHz · BLE 5.0 · Range: ~2km' : 'WebSocket live · Mesh on standby'}</div>
              </div>
            </div>

            {/* Mesh hop simulator */}
            <button onClick={simulateMeshHop} disabled={meshSending}
              style={{ width: '100%', padding: '9px', background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.4)', borderRadius: '8px', color: '#ff6b35', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: '10px' }}>
              {meshSending ? '📡 Hopping...' : '🧪 Simulate SOS via Mesh'}
            </button>

            {/* Hop visualization */}
            {meshHops.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                {meshHops.map((hop, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', background: `${NODE_COLORS[hop.status]}10`, border: `1px solid ${NODE_COLORS[hop.status]}30`, borderRadius: '8px', animation: 'fade-in-up 0.2s ease-out' }}>
                    <span style={{ fontSize: '16px' }}>{hop.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: NODE_COLORS[hop.status] }}>{hop.node}</div>
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{hop.status === 'hop' ? '→ Relaying signal...' : hop.status === 'sent' ? 'Signal originated' : '✅ Signal received!'}</div>
                    </div>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: NODE_COLORS[hop.status], animation: hop.status === 'hop' ? 'pulse-orange 1s infinite' : 'none' }} />
                  </div>
                ))}
                {i < meshHops.length - 1 && (
                  <div style={{ height: '12px', width: '1px', background: 'rgba(100,210,255,0.4)', margin: '0 auto', borderLeft: '1px dashed rgba(100,210,255,0.4)' }} />
                )}
              </div>
            )}
            {meshReceived && (
              <div style={{ padding: '10px', background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.4)', borderRadius: '8px', animation: 'fade-in-up 0.3s ease-out' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#30d158' }}>✅ SOS Delivered via Mesh in 312ms</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>3 hops · LoRa 868 MHz · Signal strength: -68 dBm</div>
              </div>
            )}

            {/* Specs */}
            <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { label: 'Protocol', value: 'LoRa 868 MHz' },
                { label: 'Backup', value: 'BLE 5.0' },
                { label: 'Range', value: '~2 km urban' },
                { label: 'Max Hops', value: '8 nodes' },
                { label: 'Latency', value: '<500ms' },
                { label: 'Battery', value: '72h standby' },
              ].map(s => (
                <div key={s.label} style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>{s.label}</div>
                  <div style={{ fontSize: '10px', color: '#ff6b35', fontWeight: 600 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edge AI Processing */}
        {activeTab === 'edge' && (
          <div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
              All acoustic inference runs on local Jetson/RPi nodes. No biometric data leaves the building. GDPR & IT Act 2023 compliant.
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              {[
                { label: 'Jetson Orin', status: 'online', color: '#30d158' },
                { label: 'RPi 4 Node', status: 'online', color: '#30d158' },
                { label: 'TinyML v2', status: 'running', color: '#0a84ff' },
              ].map(n => (
                <div key={n.label} style={{ flex: 1, padding: '8px', background: `${n.color}10`, border: `1px solid ${n.color}30`, borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: n.color, fontWeight: 700 }}>{n.label}</div>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{n.status}</div>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: n.color, margin: '4px auto 0', animation: 'pulse-green 2s infinite' }} />
                </div>
              ))}
            </div>
            <button onClick={runEdgeInference} disabled={runningEdge}
              style={{ width: '100%', padding: '9px', background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.4)', borderRadius: '8px', color: '#ff6b35', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: '10px' }}>
              {runningEdge ? '⚡ Running inference...' : '▶ Simulate Edge Inference (Scream)'}
            </button>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px', minHeight: '120px' }}>
              {edgeLogs.length === 0 ? (
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>$ waiting for inference trigger...</span>
              ) : edgeLogs.map((log, i) => (
                <div key={i} style={{ color: log.node === 'SENTINEL-X' ? '#30d158' : log.node === 'LoRa Bridge' ? '#ff6b35' : '#64d2ff', marginBottom: '3px', animation: 'fade-in-up 0.2s ease-out' }}>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>+{log.time.toFixed(2)}s </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>[{log.node}]</span> {log.msg}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(48,209,88,0.06)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: '6px', fontSize: '9px', color: 'rgba(48,209,88,0.8)' }}>
              ✅ Full detection pipeline runs in &lt;350ms. Zero cloud calls. No audio data leaves the premises.
            </div>
          </div>
        )}

        {/* QR Room Briefing */}
        {activeTab === 'qr' && (
          <div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
              QR code per room — responders scan to get instant status briefing including occupant count, sensors, door state, and AI notes.
            </div>
            {/* Room selector */}
            <select onChange={e => setSelectedQRRoom(rooms.find(r => r.id === e.target.value) || rooms[0])}
              value={selectedQRRoom?.id}
              style={{ width: '100%', padding: '7px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '11px', marginBottom: '12px', fontFamily: 'Inter, sans-serif', outline: 'none' }}>
              {rooms.map(r => <option key={r.id} value={r.id} style={{ background: '#090c14' }}>Room {r.number}</option>)}
            </select>

            {selectedQRRoom && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {/* QR Code */}
                <div style={{ padding: '8px', background: '#fff', borderRadius: '8px', flexShrink: 0 }}>
                  <QRCode data={`SENTINEL-X:ROOM:${selectedQRRoom.number}:${selectedQRRoom.floor}`} size={110} />
                </div>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div className="font-orbitron" style={{ fontSize: '14px', fontWeight: 700, color: '#ff6b35', marginBottom: '8px' }}>Rm {selectedQRRoom.number}</div>
                  {[
                    ['Floor', selectedQRRoom.floor],
                    ['Status', (selectedQRRoom.status || 'safe').toUpperCase()],
                    ['Occupants', `${selectedQRRoom.occupants} detected`],
                    ['Door', selectedQRRoom.doorLocked ? '🔒 Locked' : '🔓 Unlocked'],
                    ['Smoke', `${selectedQRRoom.lastSensor?.smoke || 0} PPM`],
                    ['Thermal', `${selectedQRRoom.lastSensor?.thermal || 0} signatures`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '10px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{k}</span>
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: '6px', fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>
              🤖 AI Note: Scan QR on door panel to receive live briefing including incident history and recommended approach.
            </div>
          </div>
        )}

        {/* Privacy & Compliance */}
        {activeTab === 'privacy' && (
          <div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
              On-device edge processing. No biometric data leaves the building. GDPR & IT Act 2023 compliant.
            </div>
            {PRIVACY_CHECKS.map((check, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', maxWidth: '45%' }}>{check.label}</span>
                <span style={{ fontSize: '10px', color: check.ok ? '#30d158' : '#ff2d55', fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{check.value}</span>
              </div>
            ))}
            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(48,209,88,0.06)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#30d158', marginBottom: '4px' }}>🔐 Privacy Architecture</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                All sensor processing occurs on Jetson Orin edge nodes within the building perimeter. Audio data is converted to FFT frequency vectors immediately — raw audio is never stored or transmitted. Room references use anonymized zone IDs unless an incident is confirmed.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
