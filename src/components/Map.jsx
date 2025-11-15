import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet.heat';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  campusBounds,
  buildings,
  gates,
  safeZones,
  securityOffices,
  highTrafficAreas,
  crowdDensityData,
  campusPaths
} from './campusData.js';

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const gateIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const safeZoneIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const securityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Map = () => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  const [heatLayer, setHeatLayer] = useState(null);
  const [showCrowdDensity, setShowCrowdDensity] = useState(true);
  const [activeRoute, setActiveRoute] = useState(null);
  const mapRef = useRef(null);

  // Existing loadshedding state
  const [safeSpaces, setSafeSpaces] = useState([]);
  const [panicAlerts, setPanicAlerts] = useState([]);
  const [loadsheddingSchedule, setLoadsheddingSchedule] = useState([]);
  const [currentLoadshedding, setCurrentLoadshedding] = useState(null);
  const [showLoadsheddingForm, setShowLoadsheddingForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    area: '',
    startTime: '',
    endTime: '',
    stage: ''
  });

  useEffect(() => {
    // Mock safe spaces
    const mockSpaces = [
      { id: '1', name: 'Student Center', location: { lat: -26.192, lng: 28.030 }, description: 'Safe space for students' },
      { id: '2', name: 'Security Office', location: { lat: -26.193, lng: 28.031 }, description: 'Contact security' },
    ];
    setSafeSpaces(mockSpaces);
    // Load panic alerts
    const alerts = JSON.parse(localStorage.getItem('panicAlerts') || '[]');
    setPanicAlerts(alerts);
    // Load loadshedding schedule
    const schedule = JSON.parse(localStorage.getItem('loadsheddingSchedule') || '[]');
    setLoadsheddingSchedule(schedule);
    checkCurrentLoadshedding(schedule);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Fallback to campus center
          setUserLocation([-26.190, 28.030]);
        }
      );
    }
  }, []);

  const checkCurrentLoadshedding = (schedule) => {
    const now = new Date();
    const current = schedule.find(s => {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      return now >= start && now <= end;
    });
    setCurrentLoadshedding(current);

    // Send loadshedding notifications
    if (current) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');

      users.forEach(user => {
        // Check if notification already exists for this loadshedding event
        const existingNotification = notifications.find(n =>
          n.userId === user.id &&
          n.type === 'loadshedding' &&
          n.message.includes(current.area) &&
          new Date(n.date) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
        );

        if (!existingNotification) {
          notifications.push({
            id: Date.now().toString() + Math.random(),
            userId: user.id,
            message: `⚡ Loadshedding Alert: ${current.area} is experiencing Stage ${current.stage} loadshedding until ${new Date(current.endTime).toLocaleTimeString()}. Stay safe and plan accordingly.`,
            date: new Date().toISOString(),
            type: 'loadshedding',
            read: false
          });
        }
      });

      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  };

  const handleAddLoadshedding = () => {
    if (!newSchedule.area || !newSchedule.startTime || !newSchedule.endTime) return;

    const updatedSchedule = [...loadsheddingSchedule, {
      ...newSchedule,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }];
    setLoadsheddingSchedule(updatedSchedule);
    localStorage.setItem('loadsheddingSchedule', JSON.stringify(updatedSchedule));
    setNewSchedule({ area: '', startTime: '', endTime: '', stage: '' });
    setShowLoadsheddingForm(false);
    checkCurrentLoadshedding(updatedSchedule);
  };

  const getSpaceStatus = (space) => {
    if (currentLoadshedding && currentLoadshedding.area === space.name) {
      return 'amber'; // Loadshedding area
    }
    return 'green'; // Safe
  };

  const handleDirections = (space) => {
    alert(`Directions to ${space.name}`);
  };

  // Calculate distance between two points
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2[0] - point1[0]) * Math.PI / 180;
    const dLon = (point2[1] - point1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distance in meters
  };

  // Find nearest security office
  const findNearestSecurity = (userPos) => {
    let nearest = null;
    let minDistance = Infinity;
    securityOffices.forEach(office => {
      const distance = calculateDistance(userPos, office.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = office;
      }
    });
    return nearest;
  };

  // Contact Security feature for students
  const handleContactSecurity = () => {
    if (!userLocation) {
      alert('Unable to get your location. Please enable GPS.');
      return;
    }

    const nearestSecurity = findNearestSecurity(userLocation);
    if (nearestSecurity) {
      const distance = calculateDistance(userLocation, nearestSecurity.coordinates);
      const estimatedTime = Math.round(distance / 80 * 60); // Assuming 80m/min walking speed

      // Create route
      if (routingControl) {
        mapRef.current.removeControl(routingControl);
      }

      const newRoutingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLocation[0], userLocation[1]),
          L.latLng(nearestSecurity.coordinates[0], nearestSecurity.coordinates[1])
        ],
        routeWhileDragging: false,
        createMarker: () => null, // Don't create default markers
        lineOptions: {
          styles: [{ color: 'blue', weight: 4 }]
        }
      }).addTo(mapRef.current);

      setRoutingControl(newRoutingControl);
      setActiveRoute({ type: 'security', destination: nearestSecurity });

      // Accessibility: Text-to-speech
      const message = `Route to ${nearestSecurity.name}. Distance: ${Math.round(distance)} meters. Estimated time: ${estimatedTime} minutes.`;
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        window.speechSynthesis.speak(utterance);
      }

      alert(message);
    }
  };

  // Panic Alert feature for security
  const handlePanicAlert = () => {
    if (user?.role !== 'security' && user?.role !== 'admin') {
      alert('Only security personnel can activate panic alerts.');
      return;
    }

    // Mock panic alert location (in real app, this would come from alert data)
    const alertLocation = [-26.191, 28.029]; // Near cafeteria

    if (routingControl) {
      mapRef.current.removeControl(routingControl);
    }

    const newRoutingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation ? userLocation[0] : -26.190, userLocation ? userLocation[1] : 28.030),
        L.latLng(alertLocation[0], alertLocation[1])
      ],
      routeWhileDragging: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: 'red', weight: 6 }]
      }
    }).addTo(mapRef.current);

    setRoutingControl(newRoutingControl);
    setActiveRoute({ type: 'panic', destination: { name: 'Panic Alert Location', coordinates: alertLocation } });

    // Mock additional info
    const hazards = ['High crowd density', 'Potential bottleneck at cafeteria entrance'];
    const coordinationPoints = ['Security Post Alpha', 'Medical Team Beta'];

    const message = `Routing to panic alert location. Hazards: ${hazards.join(', ')}. Coordination points: ${coordinationPoints.join(', ')}.`;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    }

    alert(message);
  };

  // Toggle crowd density heatmap
  const toggleCrowdDensity = () => {
    if (showCrowdDensity) {
      if (heatLayer) {
        mapRef.current.removeLayer(heatLayer);
        setHeatLayer(null);
      }
    } else {
      const newHeatLayer = L.heatLayer(crowdDensityData.map(point => [point.lat, point.lng, point.intensity]), {
        radius: 25,
        blur: 15,
        maxZoom: 18,
        gradient: { 0.2: 'blue', 0.4: 'lime', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red' }
      }).addTo(mapRef.current);
      setHeatLayer(newHeatLayer);
    }
    setShowCrowdDensity(!showCrowdDensity);
  };

  return (
    <div>
      <h2>Safety Map</h2>

      {/* Control buttons */}
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {user?.role === 'student' && (
          <button
            onClick={handleContactSecurity}
            style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
            aria-label="Contact security for directions to nearest safe point"
          >
            📞 Contact Security
          </button>
        )}
        {(user?.role === 'security' || user?.role === 'admin') && (
          <button
            onClick={handlePanicAlert}
            style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
            aria-label="Activate panic alert routing"
          >
            🚨 Panic Alert
          </button>
        )}
        <button
          onClick={toggleCrowdDensity}
          style={{ backgroundColor: showCrowdDensity ? '#28a745' : '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          aria-label={showCrowdDensity ? 'Hide crowd density overlay' : 'Show crowd density overlay'}
        >
          👥 {showCrowdDensity ? 'Hide' : 'Show'} Crowd Density
        </button>
      </div>

      {activeRoute && (
        <div style={{
          backgroundColor: activeRoute.type === 'panic' ? '#f8d7da' : '#d1ecf1',
          border: `1px solid ${activeRoute.type === 'panic' ? '#f5c6cb' : '#bee5eb'}`,
          padding: '10px',
          marginBottom: '10px',
          borderRadius: '4px'
        }}>
          <strong>{activeRoute.type === 'panic' ? '🚨 Panic Alert Route' : '📞 Security Route'}:</strong> Routing to {activeRoute.destination.name}
        </div>
      )}

      {currentLoadshedding && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          padding: '10px',
          marginBottom: '10px',
          borderRadius: '4px'
        }}>
          <strong>⚠️ Active Loadshedding Alert:</strong> {currentLoadshedding.area} is currently experiencing Stage {currentLoadshedding.stage} loadshedding until {new Date(currentLoadshedding.endTime).toLocaleTimeString()}
        </div>
      )}

      {user?.role === 'admin' && (
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setShowLoadsheddingForm(!showLoadsheddingForm)}>
            {showLoadsheddingForm ? 'Cancel' : 'Add Loadshedding Schedule'}
          </button>

          {showLoadsheddingForm && (
            <div style={{
              border: '1px solid #ccc',
              padding: '15px',
              marginTop: '10px',
              backgroundColor: '#f9f9f9'
            }}>
              <h4>Add Loadshedding Schedule</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Area (e.g., Student Center)"
                  value={newSchedule.area}
                  onChange={(e) => setNewSchedule({...newSchedule, area: e.target.value})}
                />
                <input
                  type="datetime-local"
                  placeholder="Start Time"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                />
                <input
                  type="datetime-local"
                  placeholder="End Time"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                />
                <select
                  value={newSchedule.stage}
                  onChange={(e) => setNewSchedule({...newSchedule, stage: e.target.value})}
                >
                  <option value="">Select Stage</option>
                  <option value="1">Stage 1</option>
                  <option value="2">Stage 2</option>
                  <option value="3">Stage 3</option>
                  <option value="4">Stage 4</option>
                  <option value="5">Stage 5</option>
                  <option value="6">Stage 6</option>
                </select>
                <button onClick={handleAddLoadshedding}>Add Schedule</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{
        width: '100%',
        height: window.innerWidth < 768 ? '300px' : '500px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <MapContainer
          center={[-26.190, 28.030]}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          maxBounds={campusBounds}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Buildings */}
          {buildings.map(building => (
            <Polygon
              key={building.id}
              positions={building.coordinates}
              pathOptions={{
                color: building.type === 'dining' ? '#ff6b6b' : '#4ecdc4',
                fillColor: building.type === 'dining' ? '#ff6b6b' : '#4ecdc4',
                fillOpacity: 0.3,
                weight: 2
              }}
            >
              <Popup>
                <strong>{building.name}</strong><br />
                {building.description}
              </Popup>
            </Polygon>
          ))}

          {/* High traffic areas */}
          {highTrafficAreas.map(area => (
            <Polygon
              key={area.id}
              positions={area.coordinates}
              pathOptions={{
                color: area.density === 'high' ? '#e74c3c' : area.density === 'medium' ? '#f39c12' : '#27ae60',
                fillColor: area.density === 'high' ? '#e74c3c' : area.density === 'medium' ? '#f39c12' : '#27ae60',
                fillOpacity: 0.1,
                weight: 1,
                dashArray: '5, 5'
              }}
            >
              <Popup>
                <strong>{area.name}</strong><br />
                {area.description}<br />
                Density: {area.density}
              </Popup>
            </Polygon>
          ))}

          {/* Gates */}
          {gates.map(gate => (
            <Marker key={gate.id} position={gate.coordinates} icon={gateIcon}>
              <Popup>
                <strong>{gate.name}</strong><br />
                Type: {gate.type}
              </Popup>
            </Marker>
          ))}

          {/* Safe Zones */}
          {safeZones.map(zone => (
            <Marker key={zone.id} position={zone.coordinates} icon={safeZoneIcon}>
              <Popup>
                <strong>{zone.name}</strong><br />
                {zone.description}
              </Popup>
            </Marker>
          ))}

          {/* Security Offices */}
          {securityOffices.map(office => (
            <Marker key={office.id} position={office.coordinates} icon={securityIcon}>
              <Popup>
                <strong>{office.name}</strong><br />
                {office.description}
              </Popup>
            </Marker>
          ))}

          {/* User Location */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Panic Alerts */}
          {panicAlerts.map(alert => (
            <Marker key={alert.id} position={[alert.lat || -26.191, alert.lng || 28.029]}>
              <Popup>
                <strong>🚨 Panic Alert</strong><br />
                {alert.description || 'Emergency situation reported'}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div>
        <h3>Safe Spaces Status</h3>
        <ul>
          {safeSpaces.map(space => {
            const status = getSpaceStatus(space);
            return (
              <li key={space.id} style={{ marginBottom: '10px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: status === 'amber' ? '#ffc107' : '#28a745',
                  marginRight: '8px'
                }}></span>
                <strong>{space.name}</strong>: {space.description}
                {status === 'amber' && <span style={{ color: '#856404', marginLeft: '10px' }}>⚠️ Loadshedding in progress</span>}
                <button onClick={() => handleDirections(space)} style={{ marginLeft: '10px' }}>Get Directions</button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3>Loadshedding Schedule</h3>
        {loadsheddingSchedule.length > 0 ? (
          <ul>
            {loadsheddingSchedule.map(schedule => (
              <li key={schedule.id}>
                <strong>{schedule.area}</strong> - Stage {schedule.stage} from {new Date(schedule.startTime).toLocaleString()} to {new Date(schedule.endTime).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No loadshedding scheduled</p>
        )}
      </div>
    </div>
  );
};

export default Map;