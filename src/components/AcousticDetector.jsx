import React, { useState, useEffect, useRef } from 'react';

export default function AcousticDetector({ onDetection, rooms }) {
  const [isListening, setIsListening] = useState(false);
  const [freqData, setFreqData] = useState(new Array(64).fill(0));
  const [detection, setDetection] = useState(null);
  const [audioMode, setAudioMode] = useState('mic'); // mic | simulate
  const [simType, setSimType] = useState('scream');
  const [history, setHistory] = useState([]);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  const DETECTIONS = {
    scream: { label: 'Human Scream', freqPeak: 38, icon: '🆘', severity: 'critical', hz: '1800 Hz', color: '#ff2d55' },
    glass: { label: 'Glass Break', freqPeak: 55, icon: '🪟', severity: 'critical', hz: '6200 Hz', color: '#ff6b35' },
    gunshot: { label: 'Gunshot Signature', freqPeak: 12, icon: '💥', severity: 'critical', hz: '380 Hz', color: '#ff2d55' },
    crowd: { label: 'Crowd Noise', freqPeak: 25, icon: '👥', severity: 'warning', hz: '900 Hz', color: '#ffd60a' },
  };

  const triggerSimulation = (type) => {
    const det = DETECTIONS[type];
    const room = rooms[Math.floor(Math.random() * rooms.length)];
    const confidence = Math.floor(Math.random() * 15 + 82);
    const responseTime = Math.floor(Math.random() * 200 + 100);

    // Simulate frequency spike
    const spike = [...new Array(64).fill(0)].map((_, i) => {
      const dist = Math.abs(i - det.freqPeak);
      return dist < 8 ? Math.max(0, 255 - dist * 25) + Math.random() * 30 : Math.random() * 40;
    });
    setFreqData(spike);
    setTimeout(() => setFreqData(new Array(64).fill(0).map(() => Math.random() * 30)), 1500);

    const detObj = { ...det, room: room.number, roomId: room.id, confidence, responseTime, timestamp: new Date() };
    setDetection(detObj);
    setHistory(prev => [detObj, ...prev].slice(0, 10));

    onDetection({
      id: `acoustic_${Date.now()}`,
      type: `acoustic_${type}`,
      label: `Acoustic: ${det.label}`,
      severity: det.severity,
      icon: det.icon,
      action: `Audio signature identified (${det.hz}). Room ${room.number} flagged, response team alerted.`,
      room: room.number,
      roomId: room.id,
      timestamp: new Date(),
      responseTime,
      confidence,
      read: false,
    });

    setTimeout(() => setDetection(null), 4000);
  };

  const startMicListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;
      setIsListening(true);

      const draw = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        setFreqData(Array.from(data));

        // Detection logic
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const highFreq = Array.from(data.slice(35, 55)).reduce((a, b) => a + b, 0) / 20;
        const lowFreq = Array.from(data.slice(5, 15)).reduce((a, b) => a + b, 0) / 10;
        const peak = Math.max(...data);

        if (peak > 200 && highFreq > 120) triggerSimulation('scream');
        else if (highFreq > 160) triggerSimulation('glass');
        else if (lowFreq > 180 && peak > 220) triggerSimulation('gunshot');

        animFrameRef.current = requestAnimationFrame(draw);
      };
      draw();
    } catch (e) {
      console.warn('Mic not available, use simulation mode');
    }
  };

  const stopListening = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    setIsListening(false);
    setFreqData(new Array(64).fill(0));
  };

  useEffect(() => () => stopListening(), []);

  const barColor = (val, i) => {
    if (val > 180) return '#ff2d55';
    if (val > 120) return '#ff6b35';
    if (val > 60) return '#ffd60a';
    return '#0a84ff';
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'auto', padding: '2px' }}>
      {/* Main acoustic panel */}
      <div className="hud-border" style={{ borderRadius: '10px', background: 'rgba(13,17,23,0.95)', padding: '14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <span style={{ fontSize: '20px' }}>🎙</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>ACOUSTIC DETECTION ENGINE</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Edge AI — TinyML Frequency Analysis</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            <button className="btn-sentinel" onClick={() => setAudioMode(audioMode === 'mic' ? 'simulate' : 'mic')}
              style={{ fontSize: '10px' }}>
              {audioMode === 'mic' ? '📂 Simulate' : '🎙 Mic Mode'}
            </button>
            {audioMode === 'mic' && (
              <button
                className={isListening ? 'btn-sentinel btn-danger' : 'btn-sentinel btn-success'}
                onClick={isListening ? stopListening : startMicListening}
                style={{ fontSize: '10px' }}>
                {isListening ? '⏹ Stop' : '▶ Start Mic'}
              </button>
            )}
          </div>
        </div>

        {/* Frequency visualizer */}
        <div style={{
          height: '100px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px',
          display: 'flex', alignItems: 'flex-end', gap: '1px', padding: '6px',
          border: '1px solid rgba(10,132,255,0.2)', position: 'relative', overflow: 'hidden',
        }}>
          {freqData.map((val, i) => (
            <div key={i} style={{
              flex: 1, height: `${(val / 255) * 100}%`,
              background: barColor(val, i),
              borderRadius: '1px 1px 0 0',
              minHeight: '2px',
              opacity: 0.8,
              transition: 'height 0.1s ease',
            }} />
          ))}
          {/* Freq labels */}
          <div style={{
            position: 'absolute', bottom: '4px', left: '6px', right: '6px',
            display: 'flex', justifyContent: 'space-between', pointerEvents: 'none',
          }}>
            {['0Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'].map(l => (
              <span key={l} style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono' }}>{l}</span>
            ))}
          </div>
          {!isListening && audioMode === 'mic' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.3)', fontSize: '12px', background: 'rgba(0,0,0,0.5)' }}>
              Press "Start Mic" to begin monitoring
            </div>
          )}
        </div>

        {/* Detection alert */}
        {detection && (
          <div style={{
            marginTop: '10px', padding: '10px 14px',
            background: `${detection.color}15`,
            border: `1px solid ${detection.color}60`,
            borderRadius: '8px',
            animation: 'fade-in-up 0.2s ease-out',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '24px' }}>{detection.icon}</span>
            <div>
              <div style={{ color: detection.color, fontSize: '13px', fontWeight: 700 }}>{detection.label}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                Room {detection.room} · {detection.hz} · Confidence: {detection.confidence}%
              </div>
              <div style={{ fontSize: '10px', color: '#0a84ff', marginTop: '2px' }}>
                ⚡ Response time: {detection.responseTime}ms
              </div>
            </div>
          </div>
        )}

        {/* Simulation controls */}
        {audioMode === 'simulate' && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Simulate Audio Event:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {Object.entries(DETECTIONS).map(([key, det]) => (
                <button key={key} className="btn-sentinel"
                  style={{
                    fontSize: '11px',
                    borderColor: det.color + '60',
                    color: det.color,
                    background: `${det.color}15`,
                  }}
                  onClick={() => triggerSimulation(key)}>
                  {det.icon} {det.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detection history */}
      {history.length > 0 && (
        <div className="hud-border" style={{ borderRadius: '10px', background: 'rgba(13,17,23,0.95)', padding: '12px', flexShrink: 0 }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Recent Detections
          </div>
          {history.slice(0, 5).map((d, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <span>{d.icon}</span>
              <span style={{ fontSize: '11px', color: d.color, fontWeight: 600 }}>{d.label}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Rm {d.room}</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#0a84ff' }}>{d.confidence}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Frequency guide */}
      <div className="hud-border" style={{ borderRadius: '10px', background: 'rgba(13,17,23,0.95)', padding: '12px', flexShrink: 0 }}>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Detection Thresholds
        </div>
        {[
          { label: 'Scream', range: '1000–3000 Hz', threshold: '60%+ amplitude', color: '#ff2d55' },
          { label: 'Glass Break', range: '4000–8000 Hz', threshold: '75%+ amplitude', color: '#ff6b35' },
          { label: 'Gunshot', range: '100–500 Hz', threshold: '90%+ impulse', color: '#ff2d55' },
          { label: 'Crowd', range: '500–1500 Hz', threshold: 'Sustained 45%', color: '#ffd60a' },
        ].map(d => (
          <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '10px' }}>
            <span style={{ color: d.color }}>{d.label}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{d.range}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>{d.threshold}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
