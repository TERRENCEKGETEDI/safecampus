import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SouthAfricaMap = ({ incidents = [], missingPersons = [], securityAlerts = [] }) => {
  const [mapCenter, setMapCenter] = useState([-28.5, 24.7]); // Center of South Africa
  const [mapZoom, setMapZoom] = useState(6);

  // South Africa bounds to restrict map
  const southAfricaBounds = [
    [-34.8, 16.4], // Southwest
    [-22.1, 32.9]  // Northeast
  ];

  // Create custom icons
  const incidentIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="white" stroke-width="2"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">!</text>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

  const missingPersonIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="white" stroke-width="2"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">?</text>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

  const securityIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#10b981" stroke="white" stroke-width="2"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold">S</text>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

  // Group incidents by location for heatmap effect
  const getIncidentClusters = () => {
    const clusters = {};
    incidents.forEach(incident => {
      if (incident.latitude && incident.longitude) {
        const key = `${Math.round(incident.latitude * 10) / 10}_${Math.round(incident.longitude * 10) / 10}`;
        if (!clusters[key]) {
          clusters[key] = {
            lat: Math.round(incident.latitude * 10) / 10,
            lng: Math.round(incident.longitude * 10) / 10,
            count: 0,
            incidents: []
          };
        }
        clusters[key].count++;
        clusters[key].incidents.push(incident);
      }
    });
    return Object.values(clusters);
  };

  const incidentClusters = getIncidentClusters();

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        maxBounds={southAfricaBounds}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Incident clusters with varying sizes */}
        {incidentClusters.map((cluster, index) => (
          <Circle
            key={`incident-cluster-${index}`}
            center={[cluster.lat, cluster.lng]}
            radius={Math.sqrt(cluster.count) * 500} // Radius based on incident count
            pathOptions={{
              color: cluster.count > 5 ? '#dc2626' : cluster.count > 2 ? '#ea580c' : '#f59e0b',
              fillColor: cluster.count > 5 ? '#dc2626' : cluster.count > 2 ? '#ea580c' : '#f59e0b',
              fillOpacity: 0.6,
              weight: 2,
            }}
          >
            <Popup>
              <div>
                <h4>Incident Hotspot</h4>
                <p><strong>Incidents:</strong> {cluster.count}</p>
                <p><strong>Categories:</strong></p>
                <ul>
                  {cluster.incidents.slice(0, 3).map((incident, i) => (
                    <li key={i}>{incident.category || incident.type} - {new Date(incident.timestamp || incident.createdAt).toLocaleDateString()}</li>
                  ))}
                  {cluster.incidents.length > 3 && <li>...and {cluster.incidents.length - 3} more</li>}
                </ul>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Individual missing persons markers */}
        {missingPersons.map((person, index) => (
          person.latitude && person.longitude && (
            <Marker
              key={`missing-${index}`}
              position={[person.latitude, person.longitude]}
              icon={missingPersonIcon}
            >
              <Popup>
                <div>
                  <h4>Missing Person</h4>
                  <p><strong>Name:</strong> {person.friendName}</p>
                  <p><strong>Status:</strong> {person.status}</p>
                  <p><strong>Last Seen:</strong> {person.lastSeenLocation}</p>
                  <p><strong>Reported:</strong> {new Date(person.createdAt).toLocaleDateString()}</p>
                  {person.photoUrl && (
                    <img
                      src={person.photoUrl}
                      alt="Missing person"
                      style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '8px' }}
                    />
                  )}
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {/* Security alerts */}
        {securityAlerts.map((alert, index) => (
          alert.location && alert.location.lat && alert.location.lng && (
            <Marker
              key={`alert-${index}`}
              position={[alert.location.lat, alert.location.lng]}
              icon={securityIcon}
            >
              <Popup>
                <div>
                  <h4>Security Alert</h4>
                  <p><strong>Status:</strong> {alert.status}</p>
                  <p><strong>Time:</strong> {new Date(alert.timestamp).toLocaleString()}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '12px'
      }}>
        <h5 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Legend</h5>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', marginRight: '8px' }}></div>
          <span>Missing Persons</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', marginRight: '8px' }}></div>
          <span>Security Alerts</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ width: '20px', height: '12px', background: 'rgba(239, 68, 68, 0.6)', borderRadius: '6px', marginRight: '8px' }}></div>
          <span>Incident Hotspots</span>
        </div>
      </div>
    </div>
  );
};

export default SouthAfricaMap;