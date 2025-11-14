import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Map = () => {
  const { user } = useAuth();
  const [safeSpaces, setSafeSpaces] = useState([]);
  const [panicAlerts, setPanicAlerts] = useState([]);

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
  }, []);

  const handleDirections = (space) => {
    alert(`Directions to ${space.name}`);
  };

  return (
    <div>
      <h2>Safety Map</h2>
      <div style={{ width: '100%', height: '400px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', position: 'relative' }}>
        {/* Mock map */}
        <p>Campus Map</p>
        {safeSpaces.map(space => (
          <div key={space.id} style={{ position: 'absolute', top: '50%', left: '50%', background: 'green', padding: '5px', borderRadius: '50%' }}>
            <button onClick={() => handleDirections(space)}>{space.name}</button>
          </div>
        ))}
        {panicAlerts.map(alert => (
          <div key={alert.id} style={{ position: 'absolute', top: '30%', left: '30%', background: 'red', padding: '5px', borderRadius: '50%' }}>
            Panic Alert
          </div>
        ))}
      </div>
      <div>
        <h3>Safe Spaces</h3>
        <ul>
          {safeSpaces.map(space => (
            <li key={space.id}>
              {space.name}: {space.description}
              <button onClick={() => handleDirections(space)}>Get Directions</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Map;