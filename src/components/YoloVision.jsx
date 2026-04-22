import React, { useState, useEffect } from 'react';

export default function YoloVision({ activeCrisis }) {
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDetections(prev => {
        const newDets = [...prev];
        if (Math.random() > 0.7) {
          newDets.push({
            id: Math.random(),
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            type: activeCrisis ? 'THREAT' : 'PERSON',
            life: 20
          });
        }
        return newDets.map(d => ({ ...d, life: d.life - 1 })).filter(d => d.life > 0);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [activeCrisis]);

  return (
    <div className="glass-panel" style={{ width: '100%', height: '140px', background: '#05070a', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Thermal Grid Background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(rgba(0,210,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,255,0.1) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
      
      <div className="flex justify-around items-center h-full">
         {/* Static Thermal Figures (Mocks based on screenshot) */}
         <div style={{ position: 'relative', width: '40px', height: '80px', background: 'rgba(255, 59, 48, 0.4)', borderRadius: '20px 20px 5px 5px', filter: 'blur(4px)', boxShadow: '0 0 15px var(--accent-red)' }}>
            <div style={{ position: 'absolute', top: '-10px', left: '10px', width: '20px', height: '20px', background: 'var(--accent-red)', borderRadius: '50%' }} />
         </div>
         <div style={{ position: 'relative', width: '40px', height: '80px', background: 'rgba(255, 59, 48, 0.3)', borderRadius: '20px 20px 5px 5px', filter: 'blur(6px)', boxShadow: '0 0 15px var(--accent-red)' }}>
            <div style={{ position: 'absolute', top: '-10px', left: '10px', width: '20px', height: '20px', background: 'var(--accent-red)', borderRadius: '50%' }} />
         </div>
      </div>

      <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
         <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-red)', animation: 'pulse-red 1s infinite' }} />
         <span className="tactical-font" style={{ fontSize: '8px', color: 'var(--accent-red)' }}>DETECTION_ACTIVE</span>
      </div>

      <div style={{ position: 'absolute', bottom: '5px', right: '10px', fontSize: '7px', color: 'rgba(255,255,255,0.3)' }}>
        INFRARED_SCAN_9.4μm
      </div>
    </div>
  );
}
