// Multi-building campus data for safety map
export const campusBounds = [
  [-26.200, 28.020], // Southwest
  [-26.180, 28.040]  // Northeast
];

// Campus buildings with GPS coordinates
export const buildings = [
  {
    id: 'academic_hall_a',
    name: 'Academic Hall A',
    type: 'academic',
    coordinates: [-26.190, 28.030], // GPS location
    description: 'Main academic building with classrooms and lecture halls',
    floors: ['ground', 'first', 'second', 'third']
  },
  {
    id: 'science_complex',
    name: 'Science Complex',
    type: 'lab',
    coordinates: [-26.192, 28.032],
    description: 'Science labs and research facilities',
    floors: ['ground', 'first', 'second']
  },
  {
    id: 'library',
    name: 'Central Library',
    type: 'library',
    coordinates: [-26.188, 28.028],
    description: 'Main library with study areas and resources',
    floors: ['ground', 'first', 'second', 'third']
  },
  {
    id: 'cafeteria',
    name: 'Student Cafeteria',
    type: 'dining',
    coordinates: [-26.194, 28.029],
    description: 'Dining hall and food services',
    floors: ['ground', 'first']
  },
  {
    id: 'dormitory_a',
    name: 'Dormitory A',
    type: 'residential',
    coordinates: [-26.186, 28.035],
    description: 'Student residence halls',
    floors: ['ground', 'first', 'second', 'third', 'fourth']
  },
  {
    id: 'sports_center',
    name: 'Sports Center',
    type: 'sports',
    coordinates: [-26.196, 28.033],
    description: 'Gymnasium and sports facilities',
    floors: ['ground', 'first']
  },
  {
    id: 'admin_building',
    name: 'Administrative Building',
    type: 'office',
    coordinates: [-26.189, 28.026],
    description: 'Administrative offices and faculty',
    floors: ['ground', 'first', 'second']
  },
  {
    id: 'security_center',
    name: 'Security Center',
    type: 'security',
    coordinates: [-26.191, 28.027],
    description: 'Campus security headquarters',
    floors: ['ground']
  }
];

// Detailed floor plans for each building (using local coordinates within each building)
export const buildingFloorPlans = {
  academic_hall_a: {
    ground: [
      { id: 'entrance_a', name: 'Main Entrance', type: 'entrance', coords: [[10,0],[30,0],[30,10],[10,10]], desc: 'Main entrance' },
      { id: 'reception_a', name: 'Reception', type: 'service', coords: [[10,10],[30,10],[30,25],[10,25]], desc: 'Information desk' },
      { id: 'auditorium', name: 'Auditorium', type: 'classroom', coords: [[35,10],[80,10],[80,40],[35,40]], desc: 'Large lecture hall' },
      { id: 'classroom_g1', name: 'Classroom G1', type: 'classroom', coords: [[85,10],[95,10],[95,25],[85,25]], desc: 'Ground floor classroom' },
      { id: 'corridor_a_g', name: 'Ground Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_g1', name: 'Restroom G1', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_g', name: 'Emergency Exit G', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    first: [
      { id: 'classroom_101', name: 'Classroom 101', type: 'classroom', coords: [[10,10],[35,10],[35,30],[10,30]], desc: 'Lecture hall' },
      { id: 'classroom_102', name: 'Classroom 102', type: 'classroom', coords: [[40,10],[65,10],[65,30],[40,30]], desc: 'Computer lab' },
      { id: 'classroom_103', name: 'Classroom 103', type: 'classroom', coords: [[70,10],[95,10],[95,30],[70,30]], desc: 'Seminar room' },
      { id: 'corridor_a_1', name: 'First Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_11', name: 'Restroom 11', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_1', name: 'Emergency Exit 1', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    second: [
      { id: 'classroom_201', name: 'Classroom 201', type: 'classroom', coords: [[10,10],[35,10],[35,30],[10,30]], desc: 'Advanced lecture hall' },
      { id: 'classroom_202', name: 'Classroom 202', type: 'classroom', coords: [[40,10],[65,10],[65,30],[40,30]], desc: 'Interactive classroom' },
      { id: 'faculty_lounge', name: 'Faculty Lounge', type: 'office', coords: [[70,10],[95,10],[95,30],[70,30]], desc: 'Faculty break area' },
      { id: 'corridor_a_2', name: 'Second Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_21', name: 'Restroom 21', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_2', name: 'Emergency Exit 2', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    third: [
      { id: 'classroom_301', name: 'Classroom 301', type: 'classroom', coords: [[10,10],[35,10],[35,30],[10,30]], desc: 'Specialized classroom' },
      { id: 'study_area', name: 'Study Area', type: 'study', coords: [[40,10],[80,10],[80,35],[40,35]], desc: 'Quiet study space' },
      { id: 'corridor_a_3', name: 'Third Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_31', name: 'Restroom 31', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_3', name: 'Emergency Exit 3', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ]
  },
  science_complex: {
    ground: [
      { id: 'entrance_s', name: 'Science Entrance', type: 'entrance', coords: [[10,0],[30,0],[30,10],[10,10]], desc: 'Science building entrance' },
      { id: 'chemistry_lab', name: 'Chemistry Lab', type: 'lab', coords: [[35,10],[70,10],[70,40],[35,40]], desc: 'Chemistry laboratory' },
      { id: 'storage_g', name: 'Chemical Storage', type: 'storage', coords: [[75,10],[95,10],[95,25],[75,25]], desc: 'Chemical storage area' },
      { id: 'corridor_s_g', name: 'Ground Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'emergency_exit_sg', name: 'Emergency Exit SG', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    first: [
      { id: 'physics_lab', name: 'Physics Lab', type: 'lab', coords: [[10,10],[45,10],[45,35],[10,35]], desc: 'Physics laboratory' },
      { id: 'biology_lab', name: 'Biology Lab', type: 'lab', coords: [[50,10],[85,10],[85,35],[50,35]], desc: 'Biology laboratory' },
      { id: 'corridor_s_1', name: 'First Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'emergency_exit_s1', name: 'Emergency Exit S1', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    second: [
      { id: 'research_lab', name: 'Research Lab', type: 'lab', coords: [[10,10],[50,10],[50,35],[10,35]], desc: 'Advanced research facility' },
      { id: 'faculty_offices_s', name: 'Faculty Offices', type: 'office', coords: [[55,10],[90,10],[90,35],[55,35]], desc: 'Science faculty offices' },
      { id: 'corridor_s_2', name: 'Second Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'emergency_exit_s2', name: 'Emergency Exit S2', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ]
  },
  library: {
    ground: [
      { id: 'entrance_l', name: 'Library Entrance', type: 'entrance', coords: [[10,0],[30,0],[30,10],[10,10]], desc: 'Library entrance' },
      { id: 'circulation', name: 'Circulation Desk', type: 'service', coords: [[10,10],[30,10],[30,25],[10,25]], desc: 'Book checkout area' },
      { id: 'reading_room_g', name: 'Reading Room G', type: 'study', coords: [[35,10],[80,10],[80,40],[35,40]], desc: 'Quiet reading area' },
      { id: 'computer_lab_l', name: 'Computer Lab', type: 'study', coords: [[85,10],[95,10],[95,30],[85,30]], desc: 'Computer workstations' },
      { id: 'corridor_l_g', name: 'Ground Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_lg', name: 'Restroom LG', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_lg', name: 'Emergency Exit LG', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    first: [
      { id: 'stacks_1', name: 'Book Stacks 1', type: 'study', coords: [[10,10],[50,10],[50,40],[10,40]], desc: 'Book storage and study' },
      { id: 'stacks_2', name: 'Book Stacks 2', type: 'study', coords: [[55,10],[95,10],[95,40],[55,40]], desc: 'Book storage and study' },
      { id: 'corridor_l_1', name: 'First Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_l1', name: 'Restroom L1', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_l1', name: 'Emergency Exit L1', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    second: [
      { id: 'special_collections', name: 'Special Collections', type: 'study', coords: [[10,10],[45,10],[45,35],[10,35]], desc: 'Rare books and archives' },
      { id: 'group_study', name: 'Group Study Rooms', type: 'study', coords: [[50,10],[90,10],[90,35],[50,35]], desc: 'Group study spaces' },
      { id: 'corridor_l_2', name: 'Second Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_l2', name: 'Restroom L2', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_l2', name: 'Emergency Exit L2', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    third: [
      { id: 'rooftop_terrace', name: 'Rooftop Terrace', type: 'outdoor', coords: [[10,10],[90,10],[90,40],[10,40]], desc: 'Outdoor study terrace' },
      { id: 'corridor_l_3', name: 'Third Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'emergency_exit_l3', name: 'Emergency Exit L3', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ]
  },
  cafeteria: {
    ground: [
      { id: 'entrance_c', name: 'Cafeteria Entrance', type: 'entrance', coords: [[10,0],[30,0],[30,10],[10,10]], desc: 'Cafeteria entrance' },
      { id: 'dining_area', name: 'Dining Area', type: 'dining', coords: [[35,10],[85,10],[85,45],[35,45]], desc: 'Main dining hall' },
      { id: 'kitchen', name: 'Kitchen', type: 'service', coords: [[0,10],[30,10],[30,40],[0,40]], desc: 'Food preparation area' },
      { id: 'corridor_c_g', name: 'Ground Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_cg', name: 'Restroom CG', type: 'facility', coords: [[90,10],[100,10],[100,20],[90,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_cg', name: 'Emergency Exit CG', type: 'exit', coords: [[95,45],[100,45],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    first: [
      { id: 'private_dining', name: 'Private Dining', type: 'dining', coords: [[10,10],[50,10],[50,35],[10,35]], desc: 'Private dining rooms' },
      { id: 'lounge', name: 'Student Lounge', type: 'recreation', coords: [[55,10],[95,10],[95,35],[55,35]], desc: 'Relaxation area' },
      { id: 'corridor_c_1', name: 'First Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_c1', name: 'Restroom C1', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_c1', name: 'Emergency Exit C1', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ]
  },
  dormitory_a: {
    ground: [
      { id: 'entrance_d', name: 'Dorm Entrance', type: 'entrance', coords: [[10,0],[30,0],[30,10],[10,10]], desc: 'Dormitory entrance' },
      { id: 'lobby', name: 'Lobby', type: 'common', coords: [[10,10],[30,10],[30,25],[10,25]], desc: 'Common area' },
      { id: 'laundry', name: 'Laundry Room', type: 'facility', coords: [[35,10],[50,10],[50,20],[35,20]], desc: 'Laundry facilities' },
      { id: 'corridor_d_g', name: 'Ground Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'emergency_exit_dg', name: 'Emergency Exit DG', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    first: [
      { id: 'room_101_110', name: 'Rooms 101-110', type: 'residential', coords: [[10,10],[50,10],[50,40],[10,40]], desc: 'Student rooms' },
      { id: 'common_room_1', name: 'Common Room 1', type: 'common', coords: [[55,10],[90,10],[90,30],[55,30]], desc: 'Floor common area' },
      { id: 'corridor_d_1', name: 'First Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_d1', name: 'Restroom D1', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_d1', name: 'Emergency Exit D1', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    second: [
      { id: 'room_201_210', name: 'Rooms 201-210', type: 'residential', coords: [[10,10],[50,10],[50,40],[10,40]], desc: 'Student rooms' },
      { id: 'common_room_2', name: 'Common Room 2', type: 'common', coords: [[55,10],[90,10],[90,30],[55,30]], desc: 'Floor common area' },
      { id: 'corridor_d_2', name: 'Second Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_d2', name: 'Restroom D2', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_d2', name: 'Emergency Exit D2', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    third: [
      { id: 'room_301_310', name: 'Rooms 301-310', type: 'residential', coords: [[10,10],[50,10],[50,40],[10,40]], desc: 'Student rooms' },
      { id: 'common_room_3', name: 'Common Room 3', type: 'common', coords: [[55,10],[90,10],[90,30],[55,30]], desc: 'Floor common area' },
      { id: 'corridor_d_3', name: 'Third Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_d3', name: 'Restroom D3', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_d3', name: 'Emergency Exit D3', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    fourth: [
      { id: 'room_401_410', name: 'Rooms 401-410', type: 'residential', coords: [[10,10],[50,10],[50,40],[10,40]], desc: 'Student rooms' },
      { id: 'common_room_4', name: 'Common Room 4', type: 'common', coords: [[55,10],[90,10],[90,30],[55,30]], desc: 'Floor common area' },
      { id: 'corridor_d_4', name: 'Fourth Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_d4', name: 'Restroom D4', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_d4', name: 'Emergency Exit D4', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ]
  },
  sports_center: {
    ground: [
      { id: 'entrance_sp', name: 'Sports Entrance', type: 'entrance', coords: [[10,0],[30,0],[30,10],[10,10]], desc: 'Sports center entrance' },
      { id: 'gymnasium', name: 'Gymnasium', type: 'sports', coords: [[35,10],[90,10],[90,50],[35,50]], desc: 'Main basketball court' },
      { id: 'locker_room_g', name: 'Locker Room G', type: 'facility', coords: [[0,10],[30,10],[30,30],[0,30]], desc: 'Changing facilities' },
      { id: 'corridor_sp_g', name: 'Ground Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'emergency_exit_spg', name: 'Emergency Exit SPG', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    first: [
      { id: 'fitness_center', name: 'Fitness Center', type: 'sports', coords: [[10,10],[50,10],[50,40],[10,40]], desc: 'Weight room and cardio' },
      { id: 'dance_studio', name: 'Dance Studio', type: 'sports', coords: [[55,10],[90,10],[90,40],[55,40]], desc: 'Dance and aerobics studio' },
      { id: 'locker_room_1', name: 'Locker Room 1', type: 'facility', coords: [[0,10],[25,10],[25,30],[0,30]], desc: 'Changing facilities' },
      { id: 'corridor_sp_1', name: 'First Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'emergency_exit_sp1', name: 'Emergency Exit SP1', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ]
  },
  admin_building: {
    ground: [
      { id: 'entrance_ad', name: 'Admin Entrance', type: 'entrance', coords: [[10,0],[30,0],[30,10],[10,10]], desc: 'Administrative entrance' },
      { id: 'reception_ad', name: 'Reception', type: 'service', coords: [[10,10],[30,10],[30,25],[10,25]], desc: 'Administrative reception' },
      { id: 'registrar', name: 'Registrar Office', type: 'office', coords: [[35,10],[60,10],[60,30],[35,30]], desc: 'Student records' },
      { id: 'admissions', name: 'Admissions Office', type: 'office', coords: [[65,10],[90,10],[90,30],[65,30]], desc: 'Admissions office' },
      { id: 'corridor_ad_g', name: 'Ground Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_adg', name: 'Restroom ADG', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_adg', name: 'Emergency Exit ADG', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    first: [
      { id: 'dean_office', name: 'Dean Office', type: 'office', coords: [[10,10],[40,10],[40,30],[10,30]], desc: 'Academic dean office' },
      { id: 'faculty_offices_ad', name: 'Faculty Offices', type: 'office', coords: [[45,10],[85,10],[85,35],[45,35]], desc: 'Administrative faculty offices' },
      { id: 'corridor_ad_1', name: 'First Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_ad1', name: 'Restroom AD1', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_ad1', name: 'Emergency Exit AD1', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ],
    second: [
      { id: 'conference_room', name: 'Conference Room', type: 'meeting', coords: [[10,10],[45,10],[45,35],[10,35]], desc: 'Large conference room' },
      { id: 'board_room', name: 'Board Room', type: 'meeting', coords: [[50,10],[85,10],[85,35],[50,35]], desc: 'Board meeting room' },
      { id: 'corridor_ad_2', name: 'Second Floor Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'toilet_ad2', name: 'Restroom AD2', type: 'facility', coords: [[0,10],[10,10],[10,20],[0,20]], desc: 'Restroom facilities' },
      { id: 'emergency_exit_ad2', name: 'Emergency Exit AD2', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ]
  },
  security_center: {
    ground: [
      { id: 'entrance_sec', name: 'Security Entrance', type: 'entrance', coords: [[10,0],[30,0],[30,10],[10,10]], desc: 'Security center entrance' },
      { id: 'control_room', name: 'Control Room', type: 'security', coords: [[10,10],[40,10],[40,35],[10,35]], desc: 'Security monitoring center' },
      { id: 'dispatch', name: 'Dispatch Office', type: 'security', coords: [[45,10],[70,10],[70,30],[45,30]], desc: 'Emergency dispatch' },
      { id: 'equipment_room', name: 'Equipment Room', type: 'storage', coords: [[75,10],[95,10],[95,25],[75,25]], desc: 'Security equipment storage' },
      { id: 'corridor_sec_g', name: 'Ground Corridor', type: 'corridor', coords: [[30,0],[35,0],[35,50],[30,50]], desc: 'Main corridor' },
      { id: 'emergency_exit_sec', name: 'Emergency Exit SEC', type: 'exit', coords: [[95,40],[100,40],[100,50],[95,50]], desc: 'Emergency exit' }
    ]
  }
};

// Security locations across campus
export const securityLocations = [
  { id: 'security_main', name: 'Main Security Office', building: 'security_center', floor: 'ground', coordinates: [25, 22.5], type: 'stationary' },
  { id: 'security_guard_1', name: 'Security Guard 1', building: 'academic_hall_a', floor: 'ground', coordinates: [50, 25], type: 'mobile' },
  { id: 'security_guard_2', name: 'Security Guard 2', building: 'library', floor: 'ground', coordinates: [60, 25], type: 'mobile' },
  { id: 'security_guard_3', name: 'Security Guard 3', building: 'dormitory_a', floor: 'ground', coordinates: [40, 17.5], type: 'mobile' }
];

// Safe zones across campus
export const safeZones = [
  { id: 'safe_room_academic', name: 'Safe Room Academic A', building: 'academic_hall_a', floor: 'ground', coordinates: [85, 80] },
  { id: 'safe_room_library', name: 'Safe Room Library', building: 'library', floor: 'ground', coordinates: [85, 80] },
  { id: 'safe_room_dorm', name: 'Safe Room Dorm A', building: 'dormitory_a', floor: 'ground', coordinates: [85, 80] }
];

// High traffic areas
export const highTrafficAreas = [
  { id: 'cafeteria_area', building: 'cafeteria', floor: 'ground', coordinates: [[35,10],[85,10],[85,45],[35,45]], density: 'high' },
  { id: 'library_area', building: 'library', floor: 'ground', coordinates: [[35,10],[80,10],[80,40],[35,40]], density: 'medium' },
  { id: 'gym_area', building: 'sports_center', floor: 'ground', coordinates: [[35,10],[90,10],[90,50],[35,50]], density: 'high' }
];

// Crowd density data per building/floor
export const crowdDensityData = {
  'academic_hall_a-ground': [{ x: 55, y: 25, intensity: 0.6 }, { x: 20, y: 17.5, intensity: 0.4 }],
  'academic_hall_a-first': [{ x: 22.5, y: 20, intensity: 0.5 }, { x: 52.5, y: 20, intensity: 0.5 }, { x: 82.5, y: 20, intensity: 0.4 }],
  'academic_hall_a-second': [{ x: 22.5, y: 20, intensity: 0.4 }, { x: 52.5, y: 20, intensity: 0.4 }, { x: 82.5, y: 20, intensity: 0.3 }],
  'academic_hall_a-third': [{ x: 22.5, y: 20, intensity: 0.3 }, { x: 60, y: 22.5, intensity: 0.4 }],
  'science_complex-ground': [{ x: 52.5, y: 25, intensity: 0.5 }, { x: 85, y: 17.5, intensity: 0.3 }],
  'science_complex-first': [{ x: 27.5, y: 22.5, intensity: 0.4 }, { x: 67.5, y: 22.5, intensity: 0.4 }],
  'science_complex-second': [{ x: 30, y: 22.5, intensity: 0.3 }, { x: 72.5, y: 22.5, intensity: 0.4 }],
  'library-ground': [{ x: 57.5, y: 25, intensity: 0.7 }, { x: 90, y: 20, intensity: 0.5 }],
  'library-first': [{ x: 30, y: 25, intensity: 0.4 }, { x: 75, y: 25, intensity: 0.4 }],
  'library-second': [{ x: 27.5, y: 22.5, intensity: 0.3 }, { x: 70, y: 22.5, intensity: 0.4 }],
  'library-third': [{ x: 50, y: 25, intensity: 0.2 }],
  'cafeteria-ground': [{ x: 60, y: 27.5, intensity: 0.9 }, { x: 15, y: 25, intensity: 0.6 }],
  'cafeteria-first': [{ x: 30, y: 22.5, intensity: 0.5 }, { x: 75, y: 22.5, intensity: 0.4 }],
  'dormitory_a-ground': [{ x: 20, y: 17.5, intensity: 0.3 }, { x: 42.5, y: 15, intensity: 0.2 }],
  'dormitory_a-first': [{ x: 30, y: 25, intensity: 0.3 }, { x: 72.5, y: 20, intensity: 0.2 }],
  'dormitory_a-second': [{ x: 30, y: 25, intensity: 0.3 }, { x: 72.5, y: 20, intensity: 0.2 }],
  'dormitory_a-third': [{ x: 30, y: 25, intensity: 0.3 }, { x: 72.5, y: 20, intensity: 0.2 }],
  'dormitory_a-fourth': [{ x: 30, y: 25, intensity: 0.3 }, { x: 72.5, y: 20, intensity: 0.2 }],
  'sports_center-ground': [{ x: 62.5, y: 30, intensity: 0.8 }, { x: 15, y: 20, intensity: 0.4 }],
  'sports_center-first': [{ x: 30, y: 25, intensity: 0.5 }, { x: 72.5, y: 25, intensity: 0.4 }],
  'admin_building-ground': [{ x: 47.5, y: 20, intensity: 0.3 }, { x: 77.5, y: 20, intensity: 0.3 }],
  'admin_building-first': [{ x: 25, y: 20, intensity: 0.2 }, { x: 65, y: 22.5, intensity: 0.3 }],
  'admin_building-second': [{ x: 27.5, y: 22.5, intensity: 0.2 }, { x: 67.5, y: 22.5, intensity: 0.3 }],
  'security_center-ground': [{ x: 25, y: 22.5, intensity: 0.2 }, { x: 57.5, y: 20, intensity: 0.1 }]
};