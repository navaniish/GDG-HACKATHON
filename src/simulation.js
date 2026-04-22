// SENTINEL-X Simulation Engine
// Provides realistic mock data streams for all sensors and events

export const FLOORS = [1, 2];
export const ROOMS_PER_FLOOR = 10;

// Level 1 Tactical Floor Plan: Structured Spatial Data
const HOTEL_PLAN_SPECS = [
  { num: '01', x: -16, z: -10, w: 7, h: 9 }, { num: '02', x: -8, z: -10, w: 7, h: 9 },
  { num: '03', x: 0, z: -10, w: 7, h: 9 }, { num: '04', x: 8, z: -10, w: 7, h: 9 },
  { num: '05', x: 16, z: -10, w: 7, h: 9 }, { num: '06', x: 24, z: -10, w: 7, h: 9 },
  { num: '07', x: -16, z: 0, w: 7, h: 9 }, { num: '08', x: -8, z: 0, w: 7, h: 9 },
  { num: '09', x: 8, z: 0, w: 7, h: 9 }, { num: '10', x: 16, z: 0, w: 7, h: 9 },
  { num: '11', x: -16, z: 10, w: 7, h: 9 }, { num: '12', x: -8, z: 10, w: 7, h: 9 },
  { num: '13', x: 0, z: 10, w: 7, h: 9 }, { num: '14', x: 8, z: 10, w: 7, h: 9 }
];

export const generateRooms = () => {
  const rooms = [];
  [1, 2, 3].forEach(floor => {
    HOTEL_PLAN_SPECS.forEach(p => {
      const roomNum = `${floor}${p.num}`;
      const survivors = Math.floor(Math.random() * 3);
      const threats = roomNum === '204' ? 2 : 0;
      rooms.push({
        id: `R${floor}${p.num}`,
        number: roomNum,
        floor,
        survivors,
        threats,
        occupants: survivors + threats,
        status: threats > 0 ? 'threat' : 'safe',
        riskLevel: threats > 0 ? 'CRITICAL' : survivors > 0 ? 'STABLE' : 'NONE',
        spatial: { x: p.x, z: p.z, w: p.w, h: p.h } // SPATIAL DATA ADDED
      });
    });
  });
  return rooms;
};

// Responder positions
export const generateResponders = () => [
  { id: 'R1', name: 'Alpha Team', x: 45, y: 40, floor: 1, status: 'active' },
  { id: 'R2', name: 'Bravo Team', x: 60, y: 20, floor: 2, status: 'active' },
  { id: 'R3', name: 'Delta Team', x: 30, y: 50, floor: 1, status: 'standby' },
];

// Crowd zones for lobby simulation
export const CROWD_ZONES = [
  { id: 'lobby', name: 'Main Lobby', x: 5, y: 82, w: 55, h: 15, capacity: 50 },
  { id: 'corridor_a', name: 'Corridor A', x: 5, y: 55, w: 25, h: 8, capacity: 20 },
  { id: 'corridor_b', name: 'Corridor B', x: 40, y: 55, w: 25, h: 8, capacity: 20 },
  { id: 'exit_main', name: 'Main Exit', x: 62, y: 82, w: 13, h: 15, capacity: 30 },
];

// Generate crowd agents
export const generateCrowdAgents = (count = 40) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 60 + 5,
    y: Math.random() * 15 + 82,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.1,
    status: 'normal', // normal | panic | evacuating
  }));
};

// Sensor health simulation
export const generateSensors = () => [
  { id: 's1', name: 'Thermal Cam - Floor 1', type: 'thermal', status: 'online', value: 23, unit: '°C avg', floor: 1 },
  { id: 's2', name: 'Thermal Cam - Floor 2', type: 'thermal', status: 'online', value: 24, unit: '°C avg', floor: 2 },
  { id: 's3', name: 'WiFi Sniffer - Lobby', type: 'wifi', status: 'online', value: 34, unit: 'MACs', floor: 0 },
  { id: 's4', name: 'WiFi Sniffer - F1', type: 'wifi', status: 'online', value: 12, unit: 'MACs', floor: 1 },
  { id: 's5', name: 'Smoke Detector - F1', type: 'smoke', status: 'online', value: 8, unit: 'PPM', floor: 1 },
  { id: 's6', name: 'Smoke Detector - F2', type: 'smoke', status: 'online', value: 6, unit: 'PPM', floor: 2 },
  { id: 's7', name: 'Door Sensor - Main', type: 'door', status: 'online', value: 'closed', unit: '', floor: 0 },
  { id: 's8', name: 'Acoustic Array - F1', type: 'acoustic', status: 'online', value: 42, unit: 'dB', floor: 1 },
  { id: 's9', name: 'Acoustic Array - F2', type: 'acoustic', status: 'online', value: 38, unit: 'dB', floor: 2 },
  { id: 's10', name: 'LoRa Mesh Node 1', type: 'mesh', status: 'online', value: '-74', unit: 'dBm', floor: 0 },
  { id: 's11', name: 'LoRa Mesh Node 2', type: 'mesh', status: 'online', value: '-68', unit: 'dBm', floor: 0 },
  { id: 's12', name: 'LoRa Mesh Node 3', type: 'mesh', status: 'standby', value: '-82', unit: 'dBm', floor: 0 },
];

// Frequency analysis thresholds for acoustic detection
export const ACOUSTIC_DETECTION = {
  scream: {
    freqRange: [1000, 3000],
    amplitudeThreshold: 0.6,
    label: 'Human Scream Detected',
    severity: 'critical',
    action: 'Auto-unlocked door, beacon activated, responders alerted',
    icon: '🆘',
  },
  glass_break: {
    freqRange: [4000, 8000],
    amplitudeThreshold: 0.75,
    label: 'Glass Break Detected',
    severity: 'critical',
    action: 'Locked adjacent rooms, responders dispatched',
    icon: '🪟',
  },
  gunshot: {
    freqRange: [100, 500],
    amplitudeThreshold: 0.9,
    impulse: true,
    label: 'Gunshot Signature',
    severity: 'critical',
    action: 'LOCKDOWN initiated, all responders mobilized, authorities notified',
    icon: '🔫',
  },
};

// AI action messages
export const AI_ACTIONS = {
  scream: [
    'Triangulating audio source via acoustic array',
    'Cross-referencing Wi-Fi MAC count for room occupancy',
    'Thermal signature confirms human presence',
    'Dispatching Alpha Team to intercept',
    'Broadcasting multilingual alert to floor',
  ],
  glass_break: [
    'High-frequency burst detected at 6.2 kHz',
    'Checking adjacent room door sensors',
    'Thermal camera showing 2 heat signatures',
    'Locking corridor B as precaution',
  ],
  gunshot: [
    'THREAT LEVEL MAXIMUM — All teams mobilize',
    'Initiating building-wide lockdown protocol',
    'Sealing all elevator access points',
    'Emergency services contacted via SOS relay',
    'Calculating safest evacuation routes',
  ],
  fire: [
    'Smoke PPM rising: 8 → 45 PPM',
    'Thermal anomaly: 42°C localized in Room 203',
    'Activating sprinkler system zone 2',
    'Unlocking all exit corridor doors',
    'Broadcasting fire evacuation alert',
  ],
  sos: [
    'Guest SOS received via mesh relay',
    'Locating guest by Wi-Fi fingerprint',
    'Nearest responder: Alpha Team (23m away)',
    'AI assessing threat level from context',
  ],
  crowd: [
    'Density threshold exceeded: 5.2 persons/m²',
    'Crowd flow prediction: potential stampede in 90s',
    'Activating laser guide path to Exit B',
    'Locking Corridor A — redirecting via atrium',
  ],
};

// Generate random event
const EVENT_TYPES = [
  { type: 'acoustic_scream', label: 'Acoustic: Scream', severity: 'critical', icon: '🆘', action: 'Door unlocked, beacon activated' },
  { type: 'smoke_alert', label: 'Smoke Detected', severity: 'critical', icon: '💨', action: 'Sprinklers armed, exit doors unlocked' },
  { type: 'crowd_density', label: 'High Density Zone', severity: 'warning', icon: '👥', action: 'Corridor locked, laser path projected' },
  { type: 'door_forced', label: 'Door Forced Open', severity: 'warning', icon: '🚪', action: 'Security dispatched, area locked' },
  { type: 'sos_guest', label: 'Guest SOS', severity: 'critical', icon: '📱', action: 'Responder dispatched via mesh' },
  { type: 'thermal_anomaly', label: 'Thermal Anomaly', severity: 'warning', icon: '🌡️', action: 'Thermal scan initiated, team alerted' },
  { type: 'wifi_intrusion', label: 'Unknown MAC Detected', severity: 'info', icon: '📡', action: 'MAC logged, pattern analysis started' },
  { type: 'motion_unusual', label: 'Unusual Motion Pattern', severity: 'info', icon: '👤', action: 'Behavior analytics flagged for review' },
];

export const generateEvent = (rooms) => {
  const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const room = rooms[Math.floor(Math.random() * rooms.length)];
  const responseTime = Math.floor(Math.random() * 400 + 120);
  const confidence = Math.floor(Math.random() * 25 + 72);
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    ...type,
    room: room.number,
    roomId: room.id,
    timestamp: new Date(),
    responseTime,
    confidence,
    read: false,
  };
};

// Demo sequence events
export const DEMO_SEQUENCE = {
  step1: {
    id: 'demo_scream',
    type: 'acoustic_scream',
    label: 'Acoustic: Human Scream',
    severity: 'critical',
    icon: '🆘',
    action: 'Door auto-unlocked, beacon activated, Alpha Team dispatched',
    room: '204',
    roomId: '204',
    responseTime: 298,
    confidence: 91,
    timestamp: new Date(),
    read: false,
    isDemo: true,
  },
  step2_survivors: [
    { roomId: '201', status: 'distress' },
    { roomId: '206', status: 'distress' },
    { roomId: '107', status: 'distress' },
    { roomId: '109', status: 'distress' },
    { roomId: '203', status: 'threat' },
  ],
  step3_offline: true,
};

// Mesh network simulation
export const MESH_NODES = [
  { id: 'n1', name: 'Node A (Room 101)', x: 15, y: 70, active: true },
  { id: 'n2', name: 'Node B (Corridor)', x: 45, y: 60, active: true },
  { id: 'n3', name: 'Node C (Lobby)', x: 70, y: 85, active: true },
];

// Random sensor value update
export const updateSensorValue = (sensor) => {
  if (sensor.type === 'thermal') {
    return { ...sensor, value: Math.floor(Math.random() * 8 + 20) };
  }
  if (sensor.type === 'wifi') {
    return { ...sensor, value: Math.floor(Math.random() * 20 + 25) };
  }
  if (sensor.type === 'smoke') {
    return { ...sensor, value: Math.floor(Math.random() * 15 + 5) };
  }
  if (sensor.type === 'acoustic') {
    return { ...sensor, value: Math.floor(Math.random() * 30 + 35) };
  }
  if (sensor.type === 'mesh') {
    return { ...sensor, value: String(Math.floor(Math.random() * 20 - 80)) };
  }
  return sensor;
};

// Whatsapp mock message generator
export const generateSMSAlert = (event) => ({
  to: '+91-9876543210',
  channel: 'WhatsApp',
  message: `🚨 SENTINEL-X ALERT\nLocation: Hotel Grand, Room ${event.room}\nEvent: ${event.label}\nTime: ${new Date().toLocaleTimeString()}\nAI Action: ${event.action}\nConfidence: ${event.confidence}%\n\nThis is an automated emergency notification.`,
  sent: true,
  timestamp: new Date(),
});
