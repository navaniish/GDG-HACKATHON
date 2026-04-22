import React from 'react';

const STEPS = [
  { id: 1, label: '🆘 STEP 1: Scream Detection', desc: 'Play scream → Room 204 alerts in 298ms', color: '#ff2d55' },
  { id: 2, label: '🗺 STEP 2: Tactical View', desc: '4 survivors marked + 1 threat in hallway', color: '#ff6b35' },
  { id: 3, label: '📡 STEP 3: Resilience Test', desc: 'Cut internet → Guest SOS via offline mesh', color: '#0a84ff' },
];

export default function DemoControls({ demoStep, onDemo, onEvacuate, onPanic }) {
  return (
    <div style={{
      background: 'rgba(13,17,23,0.95)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      padding: '10px 14px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Label */}
        <div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2px' }}>
            🎬 Demo Sequence
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
            Follow these steps for the hackathon demo
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
          {STEPS.map(step => (
            <button
              key={step.id}
              onClick={() => onDemo(step.id)}
              style={{
                flex: 1,
                padding: '7px 10px',
                background: demoStep === step.id ? `${step.color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${demoStep === step.id ? step.color : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px',
                color: demoStep === step.id ? step.color : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                minWidth: '170px',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700 }}>{step.label}</div>
              <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '2px' }}>{step.desc}</div>
            </button>
          ))}
        </div>

        {/* Quickfire evac */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="btn-sentinel btn-danger" style={{ fontSize: '10px', padding: '6px 10px' }}
            onClick={() => onEvacuate(1)}>
            🚨 Evac F1
          </button>
          <button className="btn-sentinel btn-danger" style={{ fontSize: '10px', padding: '6px 10px' }}
            onClick={() => onEvacuate(2)}>
            🚨 Evac F2
          </button>
          <button style={{ 
            fontSize: '10px', padding: '6px 10px', background: 'rgba(255, 214, 10, 0.2)', 
            border: '1px solid #ffd60a', color: '#ffd60a', borderRadius: '4px', cursor: 'pointer',
            marginLeft: '10px'
          }} onClick={onPanic}>
            ⚡ Trigger Panic Spike
          </button>
        </div>
      </div>
    </div>
  );
}
