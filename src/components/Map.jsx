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
  buildingFloorPlans,
  securityLocations,
  safeZones,
  highTrafficAreas,
  crowdDensityData
} from './campusData.js';

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.7/images/marker-shadow.png',
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
  const [currentFloor, setCurrentFloor] = useState('ground');
  const [helpRequests, setHelpRequests] = useState([]);
  const [activeHelpRequest, setActiveHelpRequest] = useState(null);
  const [securityLocations, setSecurityLocations] = useState([]);
  const [viewMode, setViewMode] = useState('campus'); // 'campus', 'building', or 'yard'
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [textDirections, setTextDirections] = useState([]);
  const [routingMachineControl, setRoutingMachineControl] = useState(null);
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
    // Hard-coded safe spaces
    const hardcodedSafeSpaces = [
      { id: '1', name: 'Student Center', location: { lat: -26.192, lng: 28.030 }, description: 'Main safe space for students with 24/7 access' },
      { id: '2', name: 'Library Safe Room', location: { lat: -26.188, lng: 28.028 }, description: 'Secure room in the central library' },
      { id: '3', name: 'Cafeteria Emergency Area', location: { lat: -26.194, lng: 28.029 }, description: 'Designated safe area in the cafeteria' },
      { id: '4', name: 'Sports Center Safe Zone', location: { lat: -26.196, lng: 28.033 }, description: 'Emergency safe zone in the sports center' },
      { id: '5', name: 'Dormitory A Lobby', location: { lat: -26.186, lng: 28.035 }, description: 'Safe lobby area in Dormitory A' },
    ];
    setSafeSpaces(hardcodedSafeSpaces);
    // Load panic alerts
    const alerts = JSON.parse(localStorage.getItem('panicAlerts') || '[]');
    setPanicAlerts(alerts);
    // Load loadshedding schedule
    const schedule = JSON.parse(localStorage.getItem('loadsheddingSchedule') || '[]');
    setLoadsheddingSchedule(schedule);
    checkCurrentLoadshedding(schedule);

    // Load help requests
    const requests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
    setHelpRequests(requests);

    // Initialize security locations
    setSecurityLocations([
      { id: 'security_office', name: 'Security Office', building: 'security_center', floor: 'ground', coordinates: [25, 22.5], type: 'stationary' },
      { id: 'security_guard_1', name: 'Security Guard 1', building: 'academic_hall_a', floor: 'ground', coordinates: [50, 25], type: 'mobile' },
      { id: 'security_guard_2', name: 'Security Guard 2', building: 'library', floor: 'ground', coordinates: [60, 25], type: 'mobile' },
      { id: 'security_guard_3', name: 'Security Guard 3', building: 'dormitory_a', floor: 'ground', coordinates: [40, 17.5], type: 'mobile' }
    ]);

    // Get user location (simulated within building)
    // In real app, this would use indoor positioning
    const simulateLocation = () => {
      // Always use GPS coordinates for consistency across views
      const lat = -26.195 + Math.random() * 0.008; // Within campus bounds
      const lng = 28.025 + Math.random() * 0.012;
      setUserLocation([lat, lng]);
    };

    simulateLocation();

    // Simulate security guard movement and live user location
    const interval = setInterval(() => {
      // Update user location slightly for "live" effect
      setUserLocation(prev => {
        if (prev) {
          const newLat = prev[0] + (Math.random() - 0.5) * 0.0001; // Small movement
          const newLng = prev[1] + (Math.random() - 0.5) * 0.0001;
          // Keep within campus bounds
          const boundedLat = Math.max(-26.200, Math.min(-26.180, newLat));
          const boundedLng = Math.max(28.020, Math.min(28.040, newLng));
          return [boundedLat, boundedLng];
        }
        return prev;
      });

      setSecurityLocations(prev => prev.map(guard => {
        if (guard.type === 'mobile') {
          // Simulate guard movement
          const newX = guard.coordinates[0] + (Math.random() - 0.5) * 10;
          const newY = guard.coordinates[1] + (Math.random() - 0.5) * 10;
          return {
            ...guard,
            coordinates: [
              Math.max(0, Math.min(100, newX)),
              Math.max(0, Math.min(100, newY))
            ]
          };
        }
        return guard;
      }));
    }, 3000); // Update every 3 seconds for more responsive "live" location

    return () => clearInterval(interval);
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
    securityLocations.forEach(office => {
      const distance = calculateDistance(userPos, office.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = office;
      }
    });
    return nearest;
  };

  // Find nearby security guards within 1km
  const findNearbySecurityGuards = (userPos) => {
    const maxDistance = 1000; // 1km in meters
    return securityLocations
      .filter(guard => guard.type === 'mobile' && calculateDistance(userPos, guard.gpsCoordinates) <= maxDistance)
      .sort((a, b) => calculateDistance(userPos, a.gpsCoordinates) - calculateDistance(userPos, b.gpsCoordinates));
  };

  // Generate path with turns for realistic navigation
  const generatePathWithTurns = (start, end) => {
    const waypoints = [start];

    // Add intermediate waypoints to simulate turns
    const midX = (start[0] + end[0]) / 2;
    const midY = (start[1] + end[1]) / 2;

    // Add some variation for turns
    waypoints.push([midX + 0.0005, start[1]]);
    waypoints.push([midX + 0.0005, midY]);
    waypoints.push([end[0], midY]);
    waypoints.push(end);

    return waypoints;
  };

  // Generate concise text directions
  const generateTextDirections = (start, end, person) => {
    const directions = [];
    const distance = calculateDistance(start, end);

    directions.push(`${person}: Start at your current location.`);
    directions.push(`${person}: Head north for 200 meters along the main path.`);
    directions.push(`${person}: After passing the central fountain (on your right), turn left.`);
    directions.push(`${person}: Continue straight for 150 meters, then turn right at the oak tree.`);
    directions.push(`${person}: Walk 100 meters to reach the meeting point in the campus yard.`);

    return directions;
  };

  // Get directions to safe places
  const handleGetDirectionsToSafePlaces = () => {
    if (!userLocation) {
      alert('Unable to determine your location.');
      return;
    }

    // Find nearest safe space
    const nearestSafeSpace = findNearestSafeSpace(userLocation);
    if (!nearestSafeSpace) {
      alert('No safe spaces found nearby.');
      return;
    }

    // Switch to yard view for navigation
    setViewMode('yard');

    // Clear existing routes
    if (routingMachineControl) {
      mapRef.current.removeControl(routingMachineControl);
      setRoutingMachineControl(null);
    }
    if (routingControl) {
      routingControl.forEach(route => {
        mapRef.current.removeLayer(route);
      });
      setRoutingControl(null);
    }

    // Create routing control
    const control = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(nearestSafeSpace.location.lat, nearestSafeSpace.location.lng)
      ],
      routeWhileDragging: false,
      createMarker: () => null, // Don't create default markers
      lineOptions: {
        styles: [{ color: 'green', weight: 4, opacity: 0.8 }]
      }
    }).addTo(mapRef.current);

    setRoutingMachineControl(control);

    // Style the routing instructions to have black text and blurred background
    setTimeout(() => {
      const routingContainer = mapRef.current?.getContainer()?.querySelector('.leaflet-routing-container');
      if (routingContainer) {
        routingContainer.style.color = '#000000';
        routingContainer.style.fontWeight = 'bold';
        routingContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        routingContainer.style.backdropFilter = 'blur(8px)';
        routingContainer.style.WebkitBackdropFilter = 'blur(8px)';
        routingContainer.style.borderRadius = '6px';
        routingContainer.style.padding = '8px';
        routingContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        const instructions = routingContainer.querySelectorAll('.leaflet-routing-alt, .leaflet-routing-instruction');
        instructions.forEach(el => {
          el.style.color = '#000000';
          el.style.fontWeight = 'bold';
        });
      }
    }, 100);

    // Generate directions
    const directions = generateSafeSpaceDirections(userLocation, [nearestSafeSpace.location.lat, nearestSafeSpace.location.lng], nearestSafeSpace.name);
    setTextDirections(directions);
    setActiveRoute({
      type: 'safe_space',
      destination: nearestSafeSpace,
      directions
    });

    alert(`Directions to ${nearestSafeSpace.name} calculated.`);
  };

  // Contact security
  const handleContactSecurity = () => {
    if (!userLocation) {
      alert('Unable to determine your location.');
      return;
    }

    // Find nearest security guard or office
    const nearestSecurity = findNearestSecurityGuard(userLocation);
    if (!nearestSecurity) {
      alert('No security personnel found nearby.');
      return;
    }

    // Switch to yard view for navigation
    setViewMode('yard');

    // Clear existing routes
    if (routingMachineControl) {
      mapRef.current.removeControl(routingMachineControl);
      setRoutingMachineControl(null);
    }
    if (routingControl) {
      routingControl.forEach(route => {
        mapRef.current.removeLayer(route);
      });
      setRoutingControl(null);
    }

    // Create routing control
    const control = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(nearestSecurity.gpsCoordinates[0], nearestSecurity.gpsCoordinates[1])
      ],
      routeWhileDragging: false,
      createMarker: () => null, // Don't create default markers
      lineOptions: {
        styles: [{ color: 'red', weight: 4, opacity: 0.8 }]
      }
    }).addTo(mapRef.current);

    setRoutingMachineControl(control);

    // Style the routing instructions to have black text and blurred background
    setTimeout(() => {
      const routingContainer = mapRef.current?.getContainer()?.querySelector('.leaflet-routing-container');
      if (routingContainer) {
        routingContainer.style.color = '#000000';
        routingContainer.style.fontWeight = 'bold';
        routingContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        routingContainer.style.backdropFilter = 'blur(8px)';
        routingContainer.style.WebkitBackdropFilter = 'blur(8px)';
        routingContainer.style.borderRadius = '6px';
        routingContainer.style.padding = '8px';
        routingContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        const instructions = routingContainer.querySelectorAll('.leaflet-routing-alt, .leaflet-routing-instruction');
        instructions.forEach(el => {
          el.style.color = '#000000';
          el.style.fontWeight = 'bold';
        });
      }
    }, 100);

    // Generate directions
    const directions = generateSecurityDirections(userLocation, nearestSecurity.gpsCoordinates, nearestSecurity.name);
    setTextDirections(directions);
    setActiveRoute({
      type: 'contact_security',
      destination: nearestSecurity,
      directions
    });

    alert(`Contacting ${nearestSecurity.name}. Directions calculated.`);
  };

  // Find nearest safe space
  const findNearestSafeSpace = (userPos) => {
    let nearest = null;
    let minDistance = Infinity;
    safeSpaces.forEach(space => {
      const distance = calculateDistance(userPos, [space.location.lat, space.location.lng]);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = space;
      }
    });
    return nearest;
  };

  // Find nearest security guard
  const findNearestSecurityGuard = (userPos) => {
    let nearest = null;
    let minDistance = Infinity;
    securityLocations.forEach(guard => {
      const pos = guard.gpsCoordinates || [buildings.find(b => b.id === guard.building)?.coordinates[0] || 0, buildings.find(b => b.id === guard.building)?.coordinates[1] || 0];
      const distance = calculateDistance(userPos, pos);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = guard;
      }
    });
    return nearest;
  };

  // Generate directions to safe space
  const generateSafeSpaceDirections = (start, end, destinationName) => {
    const directions = [];

    // Use specific Wits campus directions
    directions.push(`Wits West Campus Internal Road, Yale Road 880.5 m, 3 min 30 s`);
    directions.push(`Head south 80 m`);
    directions.push(`Turn left 150 m`);
    directions.push(`Make a slight left 100 m`);
    directions.push(`Turn left 450 m`);
    directions.push(`Turn right onto Wits West Campus Internal Road 90 m`);
    directions.push(`Turn right onto Yale Road 15 m`);
    directions.push(`You have arrived at your destination, on the left 0 m`);

    return directions;
  };

  // Generate directions to security
  const generateSecurityDirections = (start, end, securityName) => {
    const directions = [];
    const distance = calculateDistance(start, end);

    directions.push(`You: Start at your current location.`);
    directions.push(`You: Head towards ${securityName} (${Math.round(distance)} meters away).`);
    directions.push(`You: Follow the highlighted red route on the map.`);
    directions.push(`You: Contact ${securityName} when you arrive.`);

    return directions;
  };

  // Request Help feature for students
  const handleRequestHelp = () => {
    if (!userLocation) {
      alert('Unable to determine your location.');
      return;
    }

    // Switch to yard view for campus navigation
    setViewMode('yard');

    const requestId = Date.now().toString();
    const newRequest = {
      id: requestId,
      userId: user.id,
      userName: user.name || 'Student',
      location: userLocation,
      timestamp: new Date().toISOString(),
      status: 'pending', // pending, accepted, completed
      assignedSecurity: null
    };

    // Add to help requests
    const updatedRequests = [...helpRequests, newRequest];
    setHelpRequests(updatedRequests);
    localStorage.setItem('helpRequests', JSON.stringify(updatedRequests));

    // Notify security (in real app, this would send push notifications)
    alert('Help request sent! Security has been notified and will meet you at a central location in the campus yard.');

    // Simulate security accepting request
    setTimeout(() => {
      // Find nearby security guards within 1km
      const nearbyGuards = findNearbySecurityGuards(userLocation);
      const assignedGuards = nearbyGuards.slice(0, 2); // Assign up to 2 guards

      const acceptedRequest = {
        ...newRequest,
        status: 'accepted',
        assignedSecurity: assignedGuards.map(g => g.id)
      };
      const updated = helpRequests.map(req =>
        req.id === requestId ? acceptedRequest : req
      );
      setHelpRequests(updated);
      setActiveHelpRequest(acceptedRequest);
      localStorage.setItem('helpRequests', JSON.stringify(updated));

      // Calculate meeting point and routes
      calculateYardMeetingPoint(acceptedRequest, assignedGuards);
    }, 2000);
  };

  // Calculate meeting point in the middle
  const calculateMeetingPoint = (request) => {
    const securityGuard = securityLocations.find(s => s.id === request.assignedSecurity);
    if (!securityGuard) return;

    const userPos = request.location;
    const securityPos = securityGuard.coordinates;

    // Calculate midpoint
    const meetingPoint = [
      (userPos[0] + securityPos[0]) / 2,
      (userPos[1] + securityPos[1]) / 2
    ];

    // Create routes for both parties
    if (routingControl) {
      routingControl.forEach(route => {
        mapRef.current.removeLayer(route);
      });
    }

    // Route for user to meeting point (simple polyline for indoor navigation)
    const userRoute = L.polyline([userPos, meetingPoint], {
      color: 'blue',
      weight: 4,
      opacity: 0.8
    }).addTo(mapRef.current);

    // Route for security to meeting point
    const securityRoute = L.polyline([securityPos, meetingPoint], {
      color: 'red',
      weight: 4,
      opacity: 0.8
    }).addTo(mapRef.current);

    setRoutingControl([userRoute, securityRoute]);
    setActiveRoute({
      type: 'meeting',
      meetingPoint,
      userRoute,
      securityRoute
    });

    // Accessibility announcement
    const message = `Meeting point calculated. Both you and security are navigating to the central location.`;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    }

    alert(`Meeting point set at coordinates (${meetingPoint[0].toFixed(1)}, ${meetingPoint[1].toFixed(1)}). Both parties are navigating there.`);
  };

  // Calculate meeting point in the yard with routes and directions
  const calculateYardMeetingPoint = (request, assignedGuards) => {
    const userPos = request.location;

    // Calculate central meeting point in the yard
    const meetingPoint = [-26.190, 28.030]; // Central yard location

    // Clear existing routes
    if (routingControl) {
      routingControl.forEach(route => {
        mapRef.current.removeLayer(route);
      });
      setRoutingControl(null);
    }
    if (routingMachineControl) {
      mapRef.current.removeControl(routingMachineControl);
      setRoutingMachineControl(null);
    }

    const directions = [];

    // Create route for user to meeting point using routing machine
    const userControl = L.Routing.control({
      waypoints: [
        L.latLng(userPos[0], userPos[1]),
        L.latLng(meetingPoint[0], meetingPoint[1])
      ],
      routeWhileDragging: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: 'blue', weight: 4, opacity: 0.8 }]
      }
    }).addTo(mapRef.current);

    // Style the routing instructions to have black text and blurred background
    setTimeout(() => {
      const routingContainers = mapRef.current?.getContainer()?.querySelectorAll('.leaflet-routing-container');
      routingContainers.forEach(container => {
        container.style.color = '#000000';
        container.style.fontWeight = 'bold';
        container.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        container.style.backdropFilter = 'blur(8px)';
        container.style.WebkitBackdropFilter = 'blur(8px)';
        container.style.borderRadius = '6px';
        container.style.padding = '8px';
        container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        const instructions = container.querySelectorAll('.leaflet-routing-alt, .leaflet-routing-instruction');
        instructions.forEach(el => {
          el.style.color = '#000000';
          el.style.fontWeight = 'bold';
        });
      });
    }, 100);

    // Generate user directions
    const userDirections = generateTextDirections(userPos, meetingPoint, 'You');
    directions.push(...userDirections);

    // Create routes for each assigned security guard
    const guardControls = [];
    assignedGuards.forEach((guard, index) => {
      const guardPos = guard.gpsCoordinates;
      const guardControl = L.Routing.control({
        waypoints: [
          L.latLng(guardPos[0], guardPos[1]),
          L.latLng(meetingPoint[0], meetingPoint[1])
        ],
        routeWhileDragging: false,
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: index === 0 ? 'red' : 'orange', weight: 4, opacity: 0.8 }]
        }
      }).addTo(mapRef.current);
      guardControls.push(guardControl);

      // Generate guard directions
      const guardDirections = generateTextDirections(guardPos, meetingPoint, guard.name);
      directions.push(...guardDirections);
    });

    setRoutingMachineControl([userControl, ...guardControls]);
    setTextDirections(directions);
    setActiveRoute({
      type: 'yard_meeting',
      meetingPoint,
      controls: [userControl, ...guardControls],
      directions
    });

    // Accessibility announcement
    const message = `Meeting point set in the campus yard. Security guards are on their way.`;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    }

    alert(`Meeting point set in the campus yard at central location. ${assignedGuards.length} security guard(s) are navigating there.`);
  };

  // Accept help request (for security)
  const handleAcceptHelpRequest = (requestId) => {
    const request = helpRequests.find(r => r.id === requestId);
    if (request) {
      const acceptedRequest = {
        ...request,
        status: 'accepted',
        assignedSecurity: user.id
      };
      const updated = helpRequests.map(req =>
        req.id === requestId ? acceptedRequest : req
      );
      setHelpRequests(updated);
      setActiveHelpRequest(acceptedRequest);
      localStorage.setItem('helpRequests', JSON.stringify(updated));

      calculateMeetingPoint(acceptedRequest);
    }
  };

  // Toggle crowd density heatmap
  const toggleCrowdDensity = () => {
    if (showCrowdDensity) {
      if (heatLayer) {
        mapRef.current.removeLayer(heatLayer);
        setHeatLayer(null);
      }
    } else {
      let floorData = [];
      if (viewMode === 'building' && selectedBuilding) {
        floorData = crowdDensityData[`${selectedBuilding.id}-${currentFloor}`] || [];
      } else {
        // Campus-wide density (simplified)
        floorData = [{ x: 50, y: 50, intensity: 0.3 }];
      }
      const newHeatLayer = L.heatLayer(floorData.map(point => [point.x, point.y, point.intensity]), {
        radius: viewMode === 'building' ? 15 : 25,
        blur: viewMode === 'building' ? 10 : 15,
        maxZoom: viewMode === 'building' ? 10 : 5,
        gradient: { 0.2: 'blue', 0.4: 'lime', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red' }
      }).addTo(mapRef.current);
      setHeatLayer(newHeatLayer);
    }
    setShowCrowdDensity(!showCrowdDensity);
  };

  // Handle building selection with path display
  const handleBuildingClick = (building) => {
    if (!userLocation) {
      alert('Unable to determine your location.');
      return;
    }

    // Clear existing routes
    if (routingControl) {
      routingControl.forEach(route => {
        mapRef.current.removeLayer(route);
      });
      setRoutingControl(null);
    }
    if (routingMachineControl) {
      if (Array.isArray(routingMachineControl)) {
        routingMachineControl.forEach(control => {
          mapRef.current.removeControl(control);
        });
      } else {
        mapRef.current.removeControl(routingMachineControl);
      }
      setRoutingMachineControl(null);
    }

    // Create route to building
    const control = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(building.coordinates[0], building.coordinates[1])
      ],
      routeWhileDragging: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: 'purple', weight: 4, opacity: 0.8 }]
      }
    }).addTo(mapRef.current);

    setRoutingMachineControl(control);

    // Style the routing instructions to have black text and blurred background
    setTimeout(() => {
      const routingContainer = mapRef.current?.getContainer()?.querySelector('.leaflet-routing-container');
      if (routingContainer) {
        routingContainer.style.color = '#000000';
        routingContainer.style.fontWeight = 'bold';
        routingContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        routingContainer.style.backdropFilter = 'blur(8px)';
        routingContainer.style.WebkitBackdropFilter = 'blur(8px)';
        routingContainer.style.borderRadius = '6px';
        routingContainer.style.padding = '8px';
        routingContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        const instructions = routingContainer.querySelectorAll('.leaflet-routing-alt, .leaflet-routing-instruction');
        instructions.forEach(el => {
          el.style.color = '#000000';
          el.style.fontWeight = 'bold';
        });
      }
    }, 100);

    // Generate directions to building
    const directions = generateBuildingDirections(userLocation, building.coordinates, building.name);
    setTextDirections(directions);
    setActiveRoute({
      type: 'building_path',
      destination: building,
      directions
    });

    // Don't switch to building view to avoid map disappearing
    // setSelectedBuilding(building);
    // setViewMode('building');
    // setCurrentFloor('ground');
  };

  // Generate directions to building
  const generateBuildingDirections = (start, end, buildingName) => {
    const directions = [];
    const distance = calculateDistance(start, end);

    directions.push(`You: Start at your current location.`);
    directions.push(`You: Head towards ${buildingName} (${Math.round(distance)} meters away).`);
    directions.push(`You: Follow the highlighted purple route on the map.`);
    directions.push(`You: ${buildingName} is marked with a building icon.`);

    return directions;
  };

  // Return to campus view
  const handleBackToCampus = () => {
    setViewMode('campus');
    setSelectedBuilding(null);
    setCurrentFloor('ground');
    // Reset routing and help requests
    if (routingControl) {
      routingControl.forEach(route => {
        mapRef.current.removeLayer(route);
      });
      setRoutingControl(null);
    }
    if (routingMachineControl) {
      mapRef.current.removeControl(routingMachineControl);
      setRoutingMachineControl(null);
    }
    setActiveRoute(null);
    setActiveHelpRequest(null);
    setTextDirections([]);
  };

  return (
    <div>
      <h2>Safety Map</h2>

      {/* Navigation and control buttons */}
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        {(viewMode === 'building' || viewMode === 'yard') && (
          <button
            onClick={handleBackToCampus}
            style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
            aria-label="Return to campus overview"
          >
            ← Back to Campus
          </button>
        )}

        {viewMode === 'building' && selectedBuilding && (
          <div style={{ fontWeight: 'bold', color: '#333' }}>
            {selectedBuilding.name}
          </div>
        )}

        {viewMode === 'building' && (
          <div>
            <label htmlFor="floor-select" style={{ marginRight: '5px' }}>Floor:</label>
            <select
              id="floor-select"
              value={currentFloor}
              onChange={(e) => setCurrentFloor(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              {selectedBuilding?.floors.map(floor => (
                <option key={floor} value={floor}>
                  {floor === 'ground' ? 'Ground Floor' :
                   floor === 'first' ? 'First Floor' :
                   floor === 'second' ? 'Second Floor' :
                   floor === 'third' ? 'Third Floor' :
                   floor === 'fourth' ? 'Fourth Floor' : floor}
                </option>
              ))}
            </select>
          </div>
        )}

        {user?.role === 'student' && (viewMode === 'campus' || viewMode === 'building' || viewMode === 'yard') && (
          <button
            onClick={handleRequestHelp}
            style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
            aria-label="Request help from security"
          >
            🆘 Request Help
          </button>
        )}

        <button
          onClick={handleGetDirectionsToSafePlaces}
          style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          aria-label="Get directions to safe places"
        >
          🏠 Get Directions to Safe Places
        </button>

        <button
          onClick={handleContactSecurity}
          style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          aria-label="Contact security"
        >
          👮 Contact Security
        </button>

        {(user?.role === 'security' || user?.role === 'admin') && (
          <button
            onClick={() => alert('Panic Alert activated!')}
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
          backgroundColor: activeRoute.type === 'panic' ? '#f8d7da' :
                          activeRoute.type === 'yard_meeting' ? '#d4edda' :
                          activeRoute.type === 'safe_space' ? '#d1ecf1' :
                          activeRoute.type === 'contact_security' ? '#f8d7da' : '#d1ecf1',
          border: `1px solid ${activeRoute.type === 'panic' ? '#f5c6cb' :
                              activeRoute.type === 'yard_meeting' ? '#c3e6cb' :
                              activeRoute.type === 'safe_space' ? '#bee5eb' :
                              activeRoute.type === 'contact_security' ? '#f5c6cb' : '#bee5eb'}`,
          padding: '10px',
          marginBottom: '10px',
          borderRadius: '4px'
        }}>
          <strong>
            {activeRoute.type === 'panic' ? '🚨 Panic Alert Route' :
             activeRoute.type === 'yard_meeting' ? '🆘 Campus Yard Help Request' :
             activeRoute.type === 'safe_space' ? '🏠 Safe Space Directions' :
             activeRoute.type === 'contact_security' ? '👮 Security Contact Route' :
             activeRoute.type === 'building_path' ? '🏢 Building Directions' :
             ' Help Request Route'}
          </strong>
          {activeRoute.type === 'safe_space' && activeRoute.destination && `: Directions to ${activeRoute.destination.name}`}
          {activeRoute.type === 'contact_security' && activeRoute.destination && `: Contacting ${activeRoute.destination.name}`}
          {activeRoute.type === 'building_path' && activeRoute.destination && `: Directions to ${activeRoute.destination.name}`}
          {(activeRoute.type === 'yard_meeting' || activeRoute.type === 'meeting') && ': Navigating to meeting point'}
        </div>
      )}

        {textDirections.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            border: '2px solid rgba(0, 0, 0, 0.2)',
            padding: '12px',
            borderRadius: '8px',
            maxWidth: '300px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            color: '#000000 !important',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
          }}>
            <strong style={{
              color: '#000000 !important',
              fontSize: '16px',
              fontWeight: 'bold',
              textShadow: 'none',
              backgroundColor: 'transparent',
              display: 'block',
              marginBottom: '8px'
            }}>
              <span style={{
                color: '#000000',
                fontWeight: 'bold'
              }}>📋</span>
              <span style={{
                color: '#000000',
                fontWeight: 'bold'
              }}> Directions:</span>
            </strong>
            <ul style={{
              marginTop: '8px',
              paddingLeft: '20px',
              color: '#000000 !important',
              lineHeight: '1.4',
              fontWeight: '500'
            }}>
              {textDirections.map((direction, index) => (
                <li key={index} style={{
                  marginBottom: '4px',
                  color: '#000000 !important',
                  fontWeight: '500'
                }}>{direction}</li>
              ))}
            </ul>
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
        overflow: 'hidden',
        position: 'relative'
      }}>
        <MapContainer
          center={viewMode === 'campus' ? [-26.190, 28.030] : viewMode === 'yard' ? [-26.190, 28.030] : [50, 50]}
          zoom={viewMode === 'campus' ? 16 : viewMode === 'yard' ? 17 : 2}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          maxBounds={viewMode === 'campus' || viewMode === 'yard' ? campusBounds : [[0, 0], [100, 100]]}
          maxBoundsViscosity={1.0}
          crs={viewMode === 'campus' || viewMode === 'yard' ? L.CRS.EPSG3857 : L.CRS.Simple}
        >
          {viewMode === 'campus' ? (
            // Campus view with OpenStreetMap tiles
            <>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Building markers on campus */}
              {buildings.map(building => (
                <Marker
                  key={building.id}
                  position={building.coordinates}
                  eventHandlers={{
                    click: () => handleBuildingClick(building),
                  }}
                >
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <strong>{building.name}</strong><br />
                      <em>{building.description}</em><br />
                      <button
                        onClick={() => handleBuildingClick(building)}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        View Interior
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Campus-wide security locations */}
              {securityLocations.map(loc => (
                <Marker key={loc.id} position={buildings.find(b => b.id === loc.building)?.coordinates || [0, 0]} icon={securityIcon}>
                  <Popup>
                    <strong>{loc.name}</strong><br />
                    Building: {buildings.find(b => b.id === loc.building)?.name}<br />
                    Type: {loc.type}
                  </Popup>
                </Marker>
              ))}
            </>
          ) : viewMode === 'yard' ? (
            // Yard view - simplified campus without buildings
            <>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* User Location */}
              {userLocation && (
                <Marker position={userLocation}>
                  <Popup>
                    <strong>You are here</strong><br />
                    Campus Yard
                  </Popup>
                </Marker>
              )}

              {/* Security Guards in yard */}
              {activeHelpRequest?.assignedSecurity?.map(guardId => {
                const guard = securityLocations.find(g => g.id === guardId);
                return guard ? (
                  <Marker key={guard.id} position={guard.gpsCoordinates} icon={securityIcon}>
                    <Popup>
                      <strong>{guard.name}</strong><br />
                      Security Guard - On the way
                    </Popup>
                  </Marker>
                ) : null;
              })}

              {/* Meeting Point */}
              {activeRoute?.type === 'yard_meeting' && (
                <Marker position={activeRoute.meetingPoint}>
                  <Popup>
                    <strong>📍 Meeting Point</strong><br />
                    Central yard location
                  </Popup>
                </Marker>
              )}
            </>
          ) : (
            // Building interior view
            <>
              {/* White background for indoor map */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#f8f9fa',
                zIndex: 0
              }} />

              {/* Rooms for current building and floor */}
              {selectedBuilding && buildingFloorPlans[selectedBuilding.id]?.[currentFloor]?.map(room => (
                <Polygon
                  key={room.id}
                  positions={room.coords}
                  pathOptions={{
                    color: room.type === 'dining' ? '#ff6b6b' :
                           room.type === 'study' ? '#4ecdc4' :
                           room.type === 'security' ? '#e74c3c' :
                           room.type === 'classroom' ? '#9b59b6' :
                           room.type === 'lab' ? '#f39c12' :
                           room.type === 'office' ? '#3498db' :
                           room.type === 'entrance' ? '#27ae60' :
                           room.type === 'service' ? '#95a5a6' :
                           room.type === 'facility' ? '#9b59b6' :
                           room.type === 'exit' ? '#e74c3c' :
                           room.type === 'storage' ? '#34495e' :
                           room.type === 'meeting' ? '#f1c40f' :
                           room.type === 'outdoor' ? '#2ecc71' :
                           room.type === 'common' ? '#95a5a6' :
                           room.type === 'residential' ? '#3498db' :
                           room.type === 'sports' ? '#e67e22' : '#95a5a6',
                    fillColor: room.type === 'dining' ? '#ff6b6b' :
                              room.type === 'study' ? '#4ecdc4' :
                              room.type === 'security' ? '#e74c3c' :
                              room.type === 'classroom' ? '#9b59b6' :
                              room.type === 'lab' ? '#f39c12' :
                              room.type === 'office' ? '#3498db' :
                              room.type === 'entrance' ? '#27ae60' :
                              room.type === 'service' ? '#95a5a6' :
                              room.type === 'facility' ? '#9b59b6' :
                              room.type === 'exit' ? '#e74c3c' :
                              room.type === 'storage' ? '#34495e' :
                              room.type === 'meeting' ? '#f1c40f' :
                              room.type === 'outdoor' ? '#2ecc71' :
                              room.type === 'common' ? '#95a5a6' :
                              room.type === 'residential' ? '#3498db' :
                              room.type === 'sports' ? '#e67e22' : '#95a5a6',
                    fillOpacity: 0.3,
                    weight: 2
                  }}
                >
                  <Popup>
                    <strong>{room.name}</strong><br />
                    {room.desc}
                  </Popup>
                </Polygon>
              ))}

              {/* High traffic areas for current building/floor */}
              {highTrafficAreas.filter(area => area.building === selectedBuilding?.id && area.floor === currentFloor).map(area => (
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

              {/* Safe Zones for current building/floor */}
              {safeZones.filter(zone => zone.building === selectedBuilding?.id && zone.floor === currentFloor).map(zone => (
                <Marker key={zone.id} position={zone.coordinates} icon={safeZoneIcon}>
                  <Popup>
                    <strong>{zone.name}</strong><br />
                    {zone.description}
                  </Popup>
                </Marker>
              ))}

              {/* Security Locations for current building/floor */}
              {securityLocations.filter(loc => loc.building === selectedBuilding?.id && loc.floor === currentFloor).map(loc => (
                <Marker key={loc.id} position={loc.coordinates} icon={securityIcon}>
                  <Popup>
                    <strong>{loc.name}</strong><br />
                    {loc.description}<br />
                    Type: {loc.type}
                  </Popup>
                </Marker>
              ))}

              {/* User Location */}
              {userLocation && (
                <Marker position={userLocation}>
                  <Popup>
                    <strong>You are here</strong><br />
                    Building: {selectedBuilding?.name}<br />
                    Floor: {currentFloor === 'ground' ? 'Ground Floor' :
                           currentFloor === 'first' ? 'First Floor' :
                           currentFloor === 'second' ? 'Second Floor' :
                           currentFloor === 'third' ? 'Third Floor' :
                           currentFloor === 'fourth' ? 'Fourth Floor' : currentFloor}
                  </Popup>
                </Marker>
              )}

              {/* Active Help Request */}
              {activeHelpRequest && activeHelpRequest.building === selectedBuilding?.id && activeHelpRequest.floor === currentFloor && (
                <Marker position={activeHelpRequest.location}>
                  <Popup>
                    <strong>🆘 Help Request</strong><br />
                    From: {activeHelpRequest.userName}<br />
                    Status: {activeHelpRequest.status}
                  </Popup>
                </Marker>
              )}

              {/* Meeting Point */}
              {activeRoute?.type === 'meeting' && (
                <Marker position={activeRoute.meetingPoint}>
                  <Popup>
                    <strong>📍 Meeting Point</strong><br />
                    Both parties should meet here
                  </Popup>
                </Marker>
              )}

              {/* Help Requests for Security */}
              {(user?.role === 'security' || user?.role === 'admin') &&
                helpRequests.filter(req => req.status === 'pending' && req.building === selectedBuilding?.id && req.floor === currentFloor).map(request => (
                  <Marker key={request.id} position={request.location}>
                    <Popup>
                      <strong>🆘 Help Request</strong><br />
                      From: {request.userName}<br />
                      Time: {new Date(request.timestamp).toLocaleTimeString()}<br />
                      <button
                        onClick={() => handleAcceptHelpRequest(request.id)}
                        style={{ marginTop: '5px', padding: '4px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                      >
                        Accept Request
                      </button>
                    </Popup>
                  </Marker>
                ))
              }
            </>
          )}
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