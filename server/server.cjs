require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// BUILDING MAP FOUNDATION (Floor 2 specifically as requested)
// Room layout with actual floor-plan coordinates
const ROOM_MAP = [
  // Top Row (201-206)
  { id: "201", x: -15, z: -10, w: 5, h: 7 }, { id: "202", x: -9, z: -10, w: 5, h: 7 },
  { id: "203", x: -3, z: -10, w: 5, h: 7 }, { id: "204", x: 3, z: -10, w: 5, h: 7 }, // DISTRESS
  { id: "205", x: 9, z: -10, w: 5, h: 7 }, { id: "206", x: 15, z: -10, w: 5, h: 7 },
  // Row 2 (207-210)
  { id: "207", x: -15, z: 0, w: 5, h: 7 }, { id: "208", x: -9, z: 0, w: 5, h: 7 },
  { id: "209", x: 9, z: 0, w: 5, h: 7 }, { id: "210", x: 15, z: 0, w: 5, h: 7 },
  // Bottom Row (211-214)
  { id: "211", x: -15, z: 10, w: 5, h: 7 }, { id: "212", x: -9, z: 10, w: 5, h: 7 },
  { id: "213", x: 9, z: 10, w: 5, h: 7 }, { id: "214", x: 15, z: 10, w: 5, h: 7 }
];

let buildingState = {
  alert: true,
  distressRoom: "204",
  rooms: ROOM_MAP.map(r => ({
    ...r,
    people: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
      type: (r.id === "204" && Math.random() > 0.5) ? "threat" : (Math.random() > 0.8 ? "threat" : "survivor"),
      x: (Math.random() - 0.5) * (r.w - 1),
      z: (Math.random() - 0.5) * (r.h - 1)
    }))
  }))
};

// Periodic Data update for Fetch simulation
setInterval(() => {
  buildingState.rooms.forEach(r => {
    r.people.forEach(p => {
      // Small random movement
      p.x += (Math.random() - 0.5) * 0.5;
      p.z += (Math.random() - 0.5) * 0.5;
      // Boundaries
      if (Math.abs(p.x) > r.w / 2 - 0.5) p.x *= -0.9;
      if (Math.abs(p.z) > r.h / 2 - 0.5) p.z *= -0.9;
    });
  });
  io.emit('data_update', buildingState);
}, 2000);

// API Endpoint requested
app.get('/data', (req, res) => {
  console.log("LOG: ALERT STATUS POLLING...");
  res.json(buildingState);
});

const PORT = 3001;
server.listen(PORT, () => console.log(`SENTINEL-X Backend Running on http://localhost:${PORT}`));
