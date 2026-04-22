import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const COLORS = {
  wireframe: 0x00d2ff,
  wireframeGlow: 0xffffff,
  hazard: 0xff3b3b,
  survivor: 0x30d158,
  bg: 0x02060c,
  furniture: 0x1a2b3c
};

export default function TacticalThreeMap({ rooms = [], activeFloor = 2, onRoomSelect }) {
  const mountRef = useRef(null);
  const [xray, setXray] = useState(true);
  
  // Three.js Core
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const peopleGroupRef = useRef(new THREE.Group());
  const structureRef = useRef(new THREE.Group());
  const furnitureRef = useRef(new THREE.Group());

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.bg);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(40, 45, 40);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // SCENE LAYERS
    scene.add(structureRef.current);
    scene.add(furnitureRef.current);
    scene.add(peopleGroupRef.current);

    // --- RECONSTRUCT ARCHITECTURE (Exactly as per image) ---
    const buildArchitecture = () => {
      structureRef.current.clear();
      furnitureRef.current.clear();

      const wallMat = new THREE.MeshBasicMaterial({ color: COLORS.wireframe, wireframe: true, transparent: true, opacity: xray ? 0.1 : 0.8 });
      const glowMat = new THREE.LineBasicMaterial({ color: COLORS.wireframeGlow, transparent: true, opacity: xray ? 0.05 : 0.2 });

      rooms.forEach(r => {
        if (!r.spatial || r.floor !== activeFloor) return;

        // Wall Outlines
        const geo = new THREE.BoxGeometry(r.spatial.w, 4, r.spatial.h);
        const wall = new THREE.Mesh(geo, wallMat);
        wall.position.set(r.spatial.x, 2, r.spatial.z);
        structureRef.current.add(wall);

        // White Glow Edge
        const edges = new THREE.EdgesGeometry(geo);
        const edgeLine = new THREE.LineSegments(edges, glowMat);
        edgeLine.position.copy(wall.position);
        structureRef.current.add(edgeLine);

        // Distress Highlighting
        if (r.number === "204") {
          const alertGeo = new THREE.BoxGeometry(r.spatial.w + 0.2, 4.1, r.spatial.h + 0.2);
          const alertMesh = new THREE.Mesh(alertGeo, new THREE.MeshBasicMaterial({ color: COLORS.hazard, transparent: true, opacity: 0.15 }));
          alertMesh.position.copy(wall.position);
          alertMesh.name = "alertVolume";
          structureRef.current.add(alertMesh);
          
          const alertEdges = new THREE.LineSegments(new THREE.EdgesGeometry(alertGeo), new THREE.LineBasicMaterial({ color: COLORS.hazard, transparent: true, opacity: 0.6 }));
          alertEdges.position.copy(wall.position);
          structureRef.current.add(alertEdges);
        }

        // --- INTERIOR FURNITURE (Mimic image silhouettes) ---
        const addFurniture = (x, z, w, d, h = 0.8) => {
          const fGeo = new THREE.BoxGeometry(w, h, d);
          const fMesh = new THREE.Mesh(fGeo, new THREE.MeshBasicMaterial({ color: COLORS.furniture, transparent: true, opacity: 0.2 }));
          fMesh.position.set(r.spatial.x + x, h/2, r.spatial.z + z);
          furnitureRef.current.add(fMesh);
        };

        // Standard Hotel Layout (Bed + Desk)
        addFurniture(-r.spatial.w/4, -r.spatial.h/4, 2, 3, 0.6); // Bed
        addFurniture(r.spatial.w/4, r.spatial.h/4, 1.5, 1, 0.8); // Desk
      });

      // Ground Plane with Grid
      const grid = new THREE.GridHelper(100, 20, 0x112233, 0x050a15);
      grid.position.y = 0.05;
      scene.add(grid);
    };
    buildArchitecture();

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      controls.update();

      // Pulsing Alert
      const alertVolume = scene.getObjectByName("alertVolume");
      if (alertVolume) alertVolume.material.opacity = 0.1 + Math.sin(Date.now() * 0.005) * 0.05;

      // Humanoid Billboarding
      peopleGroupRef.current.children.forEach(p => {
        p.quaternion.copy(camera.quaternion);
      });

      renderer.render(scene, camera);
      return frameId;
    };
    const frameId = animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      while(mountRef.current?.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);
    };
  }, [rooms, activeFloor, xray]);

  // HUMANOID ICONS (Exact Image Match)
  useEffect(() => {
    peopleGroupRef.current.clear();
    rooms.forEach(r => {
      if (r.floor !== activeFloor || !r.spatial) return;
      
      const occupants = [
        ...Array(r.survivors || 0).fill('survivor'),
        ...Array(r.threats || 0).fill('threat')
      ];

      occupants.forEach((type, i) => {
        const color = type === 'survivor' ? COLORS.survivor : COLORS.hazard;
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Draw Human Icon (Level 1 simplicity like image)
        ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
        // Head
        ctx.beginPath(); ctx.arc(32, 15, 10, 0, Math.PI * 2); ctx.fill();
        // Body
        ctx.beginPath(); ctx.moveTo(32, 28); ctx.lineTo(15, 60); ctx.lineTo(49, 60); ctx.closePath(); ctx.fill();

        const tex = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
        sprite.scale.set(1.5, 1.5, 1);
        sprite.position.set(
          r.spatial.x + (Math.random()-0.5) * (r.spatial.w * 0.6),
          1,
          r.spatial.z + (Math.random()-0.5) * (r.spatial.h * 0.6)
        );
        peopleGroupRef.current.add(sprite);
      });
    });
  }, [rooms, activeFloor]);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      
      {/* 3D HUD OVERLAYS (Exactly as per image) */}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 10, display: 'flex', gap: '20px', alignItems: 'center' }}>
         <div className="glass-panel" style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>X-RAY MODE</span>
            <div 
              onClick={() => setXray(!xray)}
              style={{ width: '36px', height: '18px', background: xray ? 'var(--accent-green)' : '#333', borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: '0.2s' }}
            >
              <div style={{ position: 'absolute', width: '14px', height: '14px', background: '#fff', borderRadius: '50%', top: '2px', left: xray ? '20px' : '2px', transition: '0.2s' }} />
            </div>
            <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{xray ? 'ON' : 'OFF'}</span>
         </div>

         <div className="glass-panel tactical-font" style={{ padding: '6px 20px', fontSize: '9px', display: 'flex', gap: '20px', color: 'var(--text-dim)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🖱️ ROTATE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🖱️ ZOOM</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>✋ PAN</div>
         </div>
      </div>

      {/* COMPASS (Bottom Right) */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '100px', height: '100px', opacity: 0.6 }}>
         <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-dim)" strokeWidth="1" />
            <text x="50" y="15" textAnchor="middle" fill="var(--text-dim)" fontSize="10">N</text>
            <text x="50" y="92" textAnchor="middle" fill="var(--text-dim)" fontSize="10">S</text>
            <text x="85" y="54" textAnchor="middle" fill="var(--text-dim)" fontSize="10">E</text>
            <text x="15" y="54" textAnchor="middle" fill="var(--text-dim)" fontSize="10">W</text>
            <line x1="50" y1="50" x2="50" y2="25" stroke="var(--accent-red)" strokeWidth="2" />
            <line x1="50" y1="50" x2="50" y2="75" stroke="var(--text-dim)" strokeWidth="2" />
         </svg>
      </div>

      {/* TACTICAL ROOM LABELS */}
      {rooms.map(r => (
        r.floor === activeFloor && r.spatial && (
          <div key={r.id} style={{ 
            position: 'absolute', 
            top: '50%', left: '50%', 
            transform: `translate(${r.spatial.x * 5}px, ${r.spatial.z * 5}px)`, /* Mock projection math */
            color: '#fff', fontSize: '10px', fontWeight: 'bold', pointerEvents: 'none', opacity: 0.6
          }}>
            {r.number}
          </div>
        )
      ))}
    </div>
  );
}
