import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const HOTEL_CENTER = [19.0760, 72.8777]; // Grand Hyatt Mumbai Area

// Decentralized Mesh Nodes
const MESH_NODES = [
  [19.0765, 72.8785], [19.0752, 72.8765], [19.0770, 72.8760]
];

export default function SatelliteMap({ hazardZones, activeCrisis, onSelectHotel }) {
  const [routeProgress, setRouteProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState(HOTEL_CENTER);
  const [selectedLoc, setSelectedLoc] = useState(HOTEL_CENTER);
  const [selectedName, setSelectedName] = useState('SITE_ALPHA_SECURE');

  // Animate responder arrival
  useEffect(() => {
    if (activeCrisis) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.05;
        if (progress >= 1) progress = 1;
        setRouteProgress(progress);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setRouteProgress(0);
    }
  }, [activeCrisis]);

  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearching(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`, {
          headers: { 'User-Agent': 'Sentinel-X-Reality-Engine' }
        });
        const data = await response.json();
        
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          const newLoc = [parseFloat(lat), parseFloat(lon)];
          setMapCenter(newLoc);
          setSelectedLoc(newLoc);
          setSelectedName(display_name.split(',')[0].toUpperCase());
        }
      } catch (err) {
        console.error("[GEO_FAIL] Remote routing failure:", err);
      } finally {
        setIsSearching(false);
        setSearchQuery('');
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#05070a] flex">
      <MapContainer 
        center={mapCenter} 
        zoom={18} 
        scrollWheelZoom={true} 
        style={{ width: '100%', height: '100%', minHeight: '500px', flex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        
        <MapFlyTo center={mapCenter} />

        {/* Global building marker logic */}
        <Marker 
          position={selectedLoc} 
          eventHandlers={{ click: () => onSelectHotel(selectedLoc[0], selectedLoc[1]) }}
        >
          <Popup>
             <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#fff' }}>
                DETECTED_INFRASTRUCTURE: {selectedName}
             </div>
             <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px' }}>
               COORD: {selectedLoc[0].toFixed(4)}, {selectedLoc[1].toFixed(4)}
             </div>
             <div 
               style={{ color: '#00d2ff', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }} 
               onClick={() => onSelectHotel(selectedLoc[0], selectedLoc[1])}
             >
               [ INITIATE SPECTRAL X-RAY SCAN ]
             </div>
          </Popup>
        </Marker>

        {/* Perimeter Lockdown Overlay */}
        {activeCrisis && (
          <Circle 
            center={selectedLoc}
            pathOptions={{ color: '#ff2d55', fillColor: '#ff2d55', fillOpacity: 0.15, dashArray: '10, 10' }}
            radius={200}
            className="pulse-map-red"
          />
        )}

        {/* Decentralized Mesh Framework */}
        {MESH_NODES.map((pos, i) => {
           const shiftedPos = [selectedLoc[0] + (pos[0] - HOTEL_CENTER[0]), selectedLoc[1] + (pos[1] - HOTEL_CENTER[1])];
           return (
             <React.Fragment key={`mesh-${i}`}>
               <Circle center={shiftedPos} pathOptions={{ color: '#30d158', weight: 1, fillOpacity: 0.2 }} radius={20} />
               <Polyline positions={[selectedLoc, shiftedPos]} pathOptions={{ color: '#30d158', weight: 2, dashArray: '5, 5', opacity: 0.5 }} />
             </React.Fragment>
           );
        })}

        {/* Dynamic Hazard Sync */}
        {hazardZones.map((h, i) => {
          const lat = selectedLoc[0] + (h.y - 10) * 0.0001;
          const lng = selectedLoc[1] + (h.x - 10) * 0.0001;
          return (
            <React.Fragment key={i}>
              <Circle center={[lat, lng]} pathOptions={{ color: '#ff2d55', fillColor: '#ff2d55', fillOpacity: 0.6 }} radius={8} className="pulse-map-red" />
            </React.Fragment>
          );
        })}

        {/* Search HUD Overlay */}
        <div style={{ position: 'absolute', bottom: '20px', left: '25px', zIndex: 1000 }}>
          <div className="flex flex-col gap-2">
            {isSearching && (
              <div className="text-[#00d2ff] font-mono text-[8px] animate-pulse ml-1">
                UPLINKING_GLOBAL_DATABASE...
              </div>
            )}
            <div className="flex gap-2 p-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-md shadow-2xl">
               <input 
                 type="text" 
                 placeholder="SEARCH GLOBAL ARCHITECTURE..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={handleSearch}
                 className="bg-transparent text-white font-mono text-[10px] px-3 py-1 outline-none pointer-events-auto min-w-[220px]"
                 disabled={isSearching}
               />
            </div>
          </div>
        </div>

        {/* Info HUD */}
        <div style={{ position: 'absolute', top: '20px', left: '25px', zIndex: 1000, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="px-2 py-0.5 bg-[#00d2ff]/20 text-[#00d2ff] rounded border border-[#00d2ff]/30 text-[9px] font-bold">GEO_SATELLITE_UPLINK</div>
            <div className="font-mono text-[9px] text-white/50 font-bold">PROVIDER: ESRI_WORLD_IMAGERY</div>
          </div>
        </div>

        <MapControls origin={HOTEL_CENTER} setCenter={setMapCenter} />
      </MapContainer>

      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container { filter: brightness(0.6) contrast(1.3) saturate(0.7) grayscale(0.2); }
        .pulse-map-red { animation: mapPulse 1.5s infinite; }
        @keyframes mapPulse {
          0% { fill-opacity: 0.7; }
          50% { fill-opacity: 0.2; }
          100% { fill-opacity: 0.7; }
        }
      `}} />
    </div>
  );
}

function MapFlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 18, { duration: 2.5 });
  }, [center, map]);
  return null;
}

function MapControls({ origin, setCenter }) {
  return (
    <div style={{ position: 'absolute', bottom: '25px', right: '30px', zIndex: 1000 }}>
       <button 
         onClick={() => setCenter(origin)}
         style={{ 
           background: 'rgba(5,7,10,0.85)', border: '1px solid #00d2ff', 
           color: '#00d2ff', padding: '6px 14px', fontSize: '9px', 
           fontFamily: 'Roboto Mono', cursor: 'pointer', borderRadius: '4px', 
           backdropFilter: 'blur(10px)', transition: '0.2s'
         }}
         onMouseOver={(e) => e.target.style.background = 'rgba(0, 210, 255, 0.1)'}
         onMouseOut={(e) => e.target.style.background = 'rgba(5,7,10,0.85)'}
       >
         RESET_FOCUS: GLOBAL_ZERO
       </button>
    </div>
  );
}
