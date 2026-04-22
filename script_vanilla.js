import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* SENTINEL-X | 4K TACTICAL SKYSCRAPER ENGINE */
const COLORS = {
    cyan: 0x00d2ff, red: 0xff3b3b, green: 0x00ff88, orange: 0xff9500,
    glass: 0x112233, floor: 0x0a1428, shaft: 0x1a2b3c, path: 0x00ff88, bg: 0x05080f
};

const NUM_FLOORS = 10;
const FLOOR_HEIGHT = 5; 
const ROOM_BASE = [
    {id:1,x:-6,z:-6},{id:2,x:-2,z:-6},{id:3,x:2,z:-6},{id:4,x:6,z:-6},
    {id:5,x:-6,z:0}, {id:6,x:-2,z:0}, {id:7,x:2,z:0}, {id:8,x:6,z:0},
    {id:9,x:-6,z:6}, {id:10,x:-2,z:6},{id:11,x:2,z:6},{id:12,x:6,z:6}
];

let scene, camera, renderer, controls;
let floorGroups = {};
let occupantGroup = new THREE.Group();
let pathGroup = new THREE.Group();
let xrayActive = true;
let sensorData = []; 
let targetRoom = { floor: 8, id: 804 };
let floorTextures = {}; 
let activeFloor = 8;
window.analyticsEngines = { heatmap: null, path: null };

async function init() {
    const container = document.getElementById('canvasContainer');
    if (!container) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.bg);
    scene.fog = new THREE.FogExp2(COLORS.bg, 0.002);

    camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(45, 30, 45);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 25, 0);

    const grid = new THREE.GridHelper(100, 50, 0x112233, 0x08111a);
    scene.add(grid);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const point = new THREE.PointLight(0x00d2ff, 1.5, 200); point.position.set(20, 100, 20); scene.add(point);

    buildSkyscraper();
    scene.add(occupantGroup);
    scene.add(pathGroup);
    
    drawSafePath();
    initInteractivity();
    isolateFloor(8); 
    initAnalytics();
    animate();
}

function initAnalytics() {
    ['heatmap', 'path'].forEach(type => {
        const container = document.getElementById(type === 'heatmap' ? 'analyticsHeatmap' : 'analyticsPath');
        if (!container) return;
        const scene = new THREE.Scene(); scene.background = new THREE.Color(0x02060c);
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 45, 0); camera.lookAt(0,0,0);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);
        
        const grid = new THREE.GridHelper(40, 20, 0x1a2b3c, 0x0a1428); scene.add(grid);
        
        ROOM_BASE.forEach(room => {
            const geo = new THREE.BoxGeometry(4, 0.1, 6);
            const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0.1, wireframe: true }));
            mesh.position.set(room.x, 0, room.z); scene.add(mesh);
        });

        const dynamicGroup = new THREE.Group(); scene.add(dynamicGroup);
        window.analyticsEngines[type] = { scene, camera, renderer, container, dynamicGroup };
        
        if (type === 'path') {
             const radar = new THREE.Mesh(new THREE.RingGeometry(2, 2.2, 32), new THREE.MeshBasicMaterial({ color: COLORS.red, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
             radar.rotation.x = -Math.PI/2; radar.position.set(6, 0.1, -6); scene.add(radar);
             window.analyticsRadar = radar;
        }
    });
}

function updateAnalyticsHUD() {
    const analytView = document.getElementById('analyticsView');
    if (!analytView || analytView.style.display !== 'grid') return;

    if (window.analyticsEngines.heatmap) {
        const hGroup = window.analyticsEngines.heatmap.dynamicGroup;
        hGroup.clear();
        sensorData.forEach(d => {
            const r = ROOM_BASE.find(b => b.id === (d.room % 100)); if (!r) return;
            const blob = new THREE.Mesh(new THREE.CircleGeometry(4, 32), new THREE.MeshBasicMaterial({ 
                color: d.type === 'threat' ? COLORS.red : COLORS.green, 
                transparent: true, opacity: 0.5, side: THREE.DoubleSide
            }));
            blob.rotation.x = -Math.PI/2; blob.position.set(r.x, 0.2, r.z);
            hGroup.add(blob);
        });
    }

    if (window.analyticsEngines.path) {
        const pGroup = window.analyticsEngines.path.dynamicGroup;
        if (pGroup.children.length === 0) {
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 10), new THREE.Vector3(0, 0, 0), new THREE.Vector3(6, 0, 0), new THREE.Vector3(6, 0, -6)
            ]);
            const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.25, 8, false), new THREE.MeshBasicMaterial({ color: COLORS.green, transparent: true, opacity: 0.9 }));
            pGroup.add(tube);
            const start = new THREE.Mesh(new THREE.SphereGeometry(0.6), new THREE.MeshBasicMaterial({ color: COLORS.green }));
            start.position.set(0, 0, 10); pGroup.add(start);
            const target = new THREE.Mesh(new THREE.SphereGeometry(0.8), new THREE.MeshBasicMaterial({ color: COLORS.red }));
            target.position.set(6, 0, -6); pGroup.add(target);
        }
    }
}

function initInteractivity() {
    const navActions = {
        '🏠 DASHBOARD': () => { window.toggleView && window.toggleView('main'); camera.position.lerp(new THREE.Vector3(45, 30, 45), 1); controls.target.set(0, 25, 0); },
        '👁️ 3D X-RAY VIEW': () => { window.toggleView && window.toggleView('main'); camera.position.lerp(new THREE.Vector3(50, 40, 50), 1); controls.target.set(0, 25, 0); },
        '🧭 TACTICAL MAP': () => { window.toggleView && window.toggleView('main'); camera.position.set(0, 100, 1); controls.target.set(0, 0, 0); },
        '👥 CROWD ANALYTICS': () => { window.toggleView && window.toggleView('analytics'); }
    };

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const btnText = item.innerText.trim();
            for (let label in navActions) {
                if (btnText.includes(label.split(' ')[1])) {
                    navActions[label]();
                }
            }
        });
    });

    document.querySelectorAll('.floor-btn').forEach(btn => {
        const fText = btn.innerText;
        if (fText.includes('FLOOR')) {
            const f = parseInt(fText.split(' ')[1]);
            btn.addEventListener('click', () => {
                document.querySelectorAll('.floor-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                isolateFloor(f);
            });
        }
    });

    const xrayBtn = document.getElementById('xrayBtn');
    if (xrayBtn) {
        xrayBtn.addEventListener('click', () => {
            xrayActive = !xrayActive;
            xrayBtn.innerText = xrayActive ? 'ON' : 'OFF';
            xrayBtn.style.background = xrayActive ? 'var(--green)' : '#444';
            toggleXRay();
        });
    }
}

function isolateFloor(floor) {
    activeFloor = floor;
    for (let f in floorGroups) {
        const group = floorGroups[f];
        if (f > floor) {
            group.visible = false;
        } else if (f == floor) {
            group.visible = true;
            group.traverse(obj => { if (obj.isMesh) obj.material.opacity = 1.0; });
        } else {
            group.visible = true;
            group.traverse(obj => { if (obj.isMesh) obj.material.opacity = 0.1; });
        }
    }
    const detailHeader = document.querySelector('.panel-header[style*="red"]');
    if (detailHeader) detailHeader.innerText = `FLOOR ${floor} - DETAILS`;
}

function toggleXRay() {
    for (let f in floorGroups) {
        floorGroups[f].traverse(obj => {
            if (obj.isMesh && obj.material.type === 'MeshPhysicalMaterial') {
                obj.material.transmission = xrayActive ? 0.9 : 0.0;
                obj.material.opacity = xrayActive ? 0.1 : 1.0;
                obj.material.transparent = true;
            }
        });
    }
}

function buildSkyscraper() {
    const shaftGeo = new THREE.BoxGeometry(4, NUM_FLOORS * FLOOR_HEIGHT, 4);
    const shaftMat = new THREE.MeshPhysicalMaterial({ color: COLORS.shaft, transparent: true, opacity: 0.1, wireframe: true });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = (NUM_FLOORS * FLOOR_HEIGHT) / 2;
    scene.add(shaft);

    for (let f = 1; f <= NUM_FLOORS; f++) {
        const floorGroup = new THREE.Group();
        const floorY = (f - 1) * FLOOR_HEIGHT;

        ROOM_BASE.forEach(base => {
            const roomId = (f * 100) + base.id;
            const roomGroup = new THREE.Group();

            const roomGeo = new THREE.BoxGeometry(3.6, 3, 5.6);
            const roomMat = new THREE.MeshPhysicalMaterial({
                color: (f === 8 && roomId === 804) ? COLORS.red : COLORS.glass,
                transparent: true, opacity: (f === 8) ? 0.3 : 0.1,
                transmission: 0.5, roughness: 0.1, 
                thickness: 0.5, emissive: (f === 8) ? COLORS.red : COLORS.cyan,
                emissiveIntensity: (f === 8) ? 0.3 : 0.1
            });
            const roomMesh = new THREE.Mesh(roomGeo, roomMat); roomGroup.add(roomMesh);

            const edges = new THREE.EdgesGeometry(roomGeo);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
                color: (f === 8) ? COLORS.red : COLORS.cyan, transparent: true, opacity: 0.6
            }));
            roomGroup.add(line);

            const bed = new THREE.Mesh(new THREE.BoxGeometry(1, 0.4, 2), new THREE.MeshBasicMaterial({ color: 0x444444, wireframe: true }));
            bed.position.set(-0.8, -1.2, -1.2); roomGroup.add(bed);

            if (f === 8 && roomId === 804) {
               const circleGeo = new THREE.RingGeometry(2, 2.2, 32);
               const circleMat = new THREE.MeshBasicMaterial({ color: COLORS.red, side: THREE.DoubleSide });
               const circle = new THREE.Mesh(circleGeo, circleMat);
               circle.rotation.x = Math.PI/2; circle.position.y = -1.4;
               roomGroup.add(circle);
               setInterval(() => { circle.scale.setScalar(1 + Math.sin(Date.now() / 200) * 0.2); }, 50);
            }

            roomGroup.position.set(base.x, 1.5, base.z);
            floorGroup.add(roomGroup);
        });

        const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
        const tex = new THREE.CanvasTexture(canvas);
        floorTextures[f] = { canvas, tex };

        const plate = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
        );
        plate.rotation.x = -Math.PI/2; floorGroup.add(plate);

        floorGroup.position.y = floorY;
        scene.add(floorGroup);
        floorGroups[f] = floorGroup;
    }
    
    const scanGeo = new THREE.PlaneGeometry(30, 2);
    const scanMat = new THREE.MeshBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    const scanLine = new THREE.Mesh(scanGeo, scanMat);
    scanLine.rotation.x = Math.PI/2;
    scene.add(scanLine);
    window.scanLine = scanLine;
}

function drawSafePath() {
    pathGroup.clear();
    const points = [
        new THREE.Vector3(0, 0, 15),
        new THREE.Vector3(-10, 0, 10), 
        new THREE.Vector3(-12, 0, 0), 
        new THREE.Vector3(-10, 7 * FLOOR_HEIGHT + 1.5, -5),
        new THREE.Vector3(targetRoom.id % 100 === 4 ? 6 : -6, 7 * FLOOR_HEIGHT + 1.5, 0)
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.15, 8, false);
    
    const texture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/snowflake1.png'); 
    texture.wrapS = THREE.RepeatWrapping;
    const tubeMat = new THREE.MeshBasicMaterial({ 
        color: COLORS.green, 
        transparent: true, 
        opacity: 0.9, 
        map: texture,
        blending: THREE.AdditiveBlending
    });
    
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    pathGroup.add(tube);
    window.pathTexture = texture;
    
    addOccupant(8, 804, COLORS.red);
    addOccupant(8, 804, COLORS.red);
    addOccupant(8, 804, COLORS.red); 
}

function createPersonTexture(color) {
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
    canvas.width = 64; canvas.height = 64;
    ctx.fillStyle = '#' + (color.toString(16).padStart(6, '0'));
    ctx.beginPath(); ctx.arc(32, 20, 10, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(24, 32, 16, 25);
    return new THREE.CanvasTexture(canvas);
}

function addOccupant(f, id, color) {
    const tex = createPersonTexture(color);
    const mat = new THREE.SpriteMaterial({ map: tex, color: 0xffffff, transparent: true, opacity: 0.9 });
    const sprite = new THREE.Sprite(mat);
    const base = ROOM_BASE.find(r => (f * 100 + r.id) === id) || ROOM_BASE[0];
    sprite.position.set(base.x + (Math.random()-0.5)*2, (f-1)*FLOOR_HEIGHT + 1.5, base.z + (Math.random()-0.5)*2);
    sprite.scale.set(1.5, 1.5, 1);
    occupantGroup.add(sprite);

    if (color === COLORS.red) {
        const boxGeo = new THREE.BoxGeometry(1.5, 2.5, 1.5);
        const boxMat = new THREE.MeshBasicMaterial({ color: COLORS.red, wireframe: true, transparent: true, opacity: 0.5 });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.copy(sprite.position);
        occupantGroup.add(box);
        
        const circle = new THREE.Mesh(new THREE.RingGeometry(1, 1.2, 16), new THREE.MeshBasicMaterial({ color: COLORS.red, side: THREE.DoubleSide }));
        circle.rotation.x = Math.PI/2; circle.position.copy(sprite.position); circle.position.y -= 1.4;
        occupantGroup.add(circle);
    }
}

function updateMiniMap() {
    const mini = document.getElementById('miniMap'); if (!mini) return;
    let canvas = mini.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas'); mini.appendChild(canvas);
        canvas.style.width = "100%"; canvas.style.height = "100%";
    }
    const ctx = canvas.getContext('2d');
    canvas.width = mini.clientWidth; canvas.height = mini.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = 8; const offX = canvas.width / 2; const offY = canvas.height / 2;
    const project = (x, z) => ({
        px: offX + (x - z) * Math.cos(Math.PI/6) * scale,
        py: offY + (x + z) * Math.sin(Math.PI/6) * scale
    });

    ctx.strokeStyle = "rgba(0, 210, 255, 0.15)"; ctx.lineWidth = 1;
    ROOM_BASE.forEach(base => {
        const p1 = project(base.x-2, base.z-3); const p2 = project(base.x+2, base.z-3);
        const p3 = project(base.x+2, base.z+3); const p4 = project(base.x-2, base.z+3);
        ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py);
        ctx.lineTo(p3.px, p3.py); ctx.lineTo(p4.px, p4.py); ctx.closePath(); ctx.stroke();
    });

    const points = [project(0, 10), project(0, 0), project(6, 0), project(6, -6)];
    ctx.strokeStyle = COLORS.green; ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.shadowBlur = 10; ctx.shadowColor = COLORS.green;
    ctx.beginPath(); ctx.moveTo(points[0].px, points[0].py);
    points.forEach(p => ctx.lineTo(p.px, p.py)); ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = COLORS.green; ctx.beginPath(); ctx.arc(points[0].px, points[0].py, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = COLORS.red; ctx.shadowBlur = 10; ctx.shadowColor = COLORS.red;
    ctx.beginPath(); ctx.arc(points[points.length-1].px, points[points.length-1].py, 6, 0, Math.PI*2); ctx.fill();
}

function updateHeatmap() {
    const heat = document.getElementById('footerHeatmap'); if(!heat) return;
    let canvas = heat.querySelector('canvas');
    if (!canvas) { canvas = document.createElement('canvas'); heat.appendChild(canvas); }
    canvas.width = heat.clientWidth; canvas.height = heat.clientHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    sensorData.forEach(p => {
        const b = ROOM_BASE.find(r => r.id === (p.room % 100)) || ROOM_BASE[0];
        const x = (b.x + 10) * (canvas.width / 20);
        const y = (b.z + 10) * (canvas.height / 20);
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 40);
        grad.addColorStop(0, 'rgba(255,59,59,0.3)'); grad.addColorStop(1, 'rgba(255,59,59,0)');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI*2); ctx.fill();
    });
}

function update3DHeatmap() {
    for (let f in floorTextures) {
        const { canvas, tex } = floorTextures[f];
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(10, 20, 40, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        sensorData.filter(d => Math.floor(d.room/100) == f).forEach(d => {
            const b = ROOM_BASE.find(r => r.id === (d.room % 100));
            if (!b) return;
            const x = (b.x + 10) * (canvas.width / 20);
            const z = (b.z + 10) * (canvas.height / 20);
            const grad = ctx.createRadialGradient(x, z, 0, x, z, 80);
            const color = d.type === 'threat' ? '255, 59, 59' : '0, 255, 136';
            grad.addColorStop(0, `rgba(${color}, 0.6)`);
            grad.addColorStop(1, `rgba(${color}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(x, z, 80, 0, Math.PI*2); ctx.fill();
        });
        tex.needsUpdate = true;
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    
    if (window.scanLine) {
        window.scanLine.position.y = (Math.sin(Date.now() / 2000) * 25) + 25;
    }

    if (window.pathTexture) {
        window.pathTexture.offset.x -= 0.05;
    }
    
    if (window.analyticsRadar) {
        window.analyticsRadar.scale.setScalar(1 + Math.sin(Date.now() / 300) * 0.3);
        window.analyticsRadar.material.opacity = 0.5 + Math.sin(Date.now() / 300) * 0.2;
    }

    updateMiniMap();
    updateHeatmap();
    update3DHeatmap();
    renderer.render(scene, camera);

    const analytView = document.getElementById('analyticsView');
    if (analytView && analytView.style.display === 'grid') {
        updateAnalyticsHUD();
        Object.values(window.analyticsEngines).forEach(engine => {
            if (engine) engine.renderer.render(engine.scene, engine.camera);
        });
    }
}

window.addEventListener('resize', () => {
    const container = document.getElementById('canvasContainer');
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

async function pollData() {
    sensorData = [
        { room: 804, type: 'threat', risk: 'critical' },
        { room: 801, type: 'survivor', risk: 'low' },
        { room: 202, type: 'survivor', risk: 'low' },
        { room: 505, type: 'unknown', risk: 'medium' }
    ];
}
setInterval(pollData, 2000);

init();
