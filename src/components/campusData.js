// Campus layout data for safety map
export const campusBounds = [
  [-26.195, 28.025], // Southwest
  [-26.185, 28.035]  // Northeast
];

export const buildings = [
  {
    id: 'library',
    name: 'Main Library',
    type: 'academic',
    coordinates: [
      [-26.190, 28.028],
      [-26.190, 28.032],
      [-26.188, 28.032],
      [-26.188, 28.028]
    ],
    description: 'Academic building with study areas'
  },
  {
    id: 'cafeteria',
    name: 'Student Cafeteria',
    type: 'dining',
    coordinates: [
      [-26.192, 28.029],
      [-26.192, 28.031],
      [-26.191, 28.031],
      [-26.191, 28.029]
    ],
    description: 'Dining hall, high-traffic area'
  },
  {
    id: 'lecture_hall_a',
    name: 'Lecture Hall A',
    type: 'academic',
    coordinates: [
      [-26.189, 28.026],
      [-26.189, 28.028],
      [-26.187, 28.028],
      [-26.187, 28.026]
    ],
    description: 'Large lecture hall'
  },
  {
    id: 'science_building',
    name: 'Science Building',
    type: 'academic',
    coordinates: [
      [-26.193, 28.030],
      [-26.193, 28.034],
      [-26.191, 28.034],
      [-26.191, 28.030]
    ],
    description: 'Science labs and classrooms'
  }
];

export const gates = [
  {
    id: 'main_gate',
    name: 'Main Gate',
    coordinates: [-26.194, 28.027],
    type: 'entrance'
  },
  {
    id: 'side_gate',
    name: 'Side Gate',
    coordinates: [-26.186, 28.033],
    type: 'exit'
  }
];

export const safeZones = [
  {
    id: 'shelter_1',
    name: 'Emergency Shelter 1',
    coordinates: [-26.1905, 28.0295],
    description: 'Designated safe area during emergencies'
  },
  {
    id: 'shelter_2',
    name: 'Emergency Shelter 2',
    coordinates: [-26.1925, 28.0325],
    description: 'Backup safe zone'
  }
];

export const securityOffices = [
  {
    id: 'security_main',
    name: 'Main Security Office',
    coordinates: [-26.193, 28.028],
    description: 'Primary security headquarters'
  },
  {
    id: 'security_east',
    name: 'East Security Post',
    coordinates: [-26.189, 28.033],
    description: 'Secondary security location'
  }
];

export const highTrafficAreas = [
  {
    id: 'cafeteria_area',
    name: 'Cafeteria Zone',
    coordinates: [
      [-26.193, 28.028],
      [-26.193, 28.032],
      [-26.190, 28.032],
      [-26.190, 28.028]
    ],
    density: 'high', // high, medium, low
    description: 'High traffic during meal times'
  },
  {
    id: 'library_area',
    name: 'Library Zone',
    coordinates: [
      [-26.191, 28.027],
      [-26.191, 28.033],
      [-26.187, 28.033],
      [-26.187, 28.027]
    ],
    density: 'medium',
    description: 'Busy during study hours'
  }
];

// Mock crowd density data (would come from sensors/API in real app)
export const crowdDensityData = [
  { lat: -26.192, lng: 28.030, intensity: 0.8 }, // High density near cafeteria
  { lat: -26.190, lng: 28.030, intensity: 0.6 }, // Medium near library
  { lat: -26.189, lng: 28.027, intensity: 0.3 }  // Low in lecture area
];

// Paths/roads for routing (simplified as waypoints)
export const campusPaths = [
  // Main walkway
  [
    [-26.194, 28.027], // Main gate
    [-26.193, 28.028],
    [-26.192, 28.029],
    [-26.191, 28.030],
    [-26.190, 28.031],
    [-26.189, 28.032],
    [-26.188, 28.033],
    [-26.186, 28.033]  // Side gate
  ]
];