import { Review, Ride, User, Vehicle } from '../types/models';

// Mock users with different roles
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 98765 43210',
    avatar: '👩‍💼',
    rating: 4.8,
    reviewCount: 127,
    verified: true,
    memberSince: '2022-03',
    bio: 'Professional driver with 10+ years experience. Safe and punctual!',
    role: 'driver',
    licenseNumber: 'DL123456',
    licenseExpiry: '2028-12-31',
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 98765 43211',
    avatar: '👨‍💻',
    rating: 4.9,
    reviewCount: 203,
    verified: true,
    memberSince: '2021-06',
    bio: 'Love to travel and meet new people. Regular route: Hyderabad-Vijayawada.',
    role: 'driver',
    licenseNumber: 'DL789012',
    licenseExpiry: '2027-06-30',
  },
  {
    id: '3',
    name: 'Anitha Reddy',
    email: 'anitha@example.com',
    phone: '+91 98765 43212',
    avatar: '👩‍🎨',
    rating: 4.7,
    reviewCount: 89,
    verified: true,
    memberSince: '2023-01',
    role: 'customer',
    licenseNumber: 'DL345678',
    licenseExpiry: '2029-03-15',
    bio: 'Offering private rides for small groups. Comfortable and reliable.',
  },
  {
    id: '4',
    name: 'Suresh Naidu',
    email: 'suresh@example.com',
    phone: '+91 98765 43213',
    avatar: '👨‍🔬',
    rating: 4.6,
    reviewCount: 45,
    verified: false,
    memberSince: '2023-09',
    role: 'passenger',
    emergencyContact: {
      name: 'Ramesh Naidu',
      phone: '+91 90000 11111',
    },
  },
  {
    id: '5',
    name: 'Lakshmi Devi',
    email: 'lakshmi@example.com',
    phone: '+91 98765 43214',
    avatar: '👩‍⚕️',
    rating: 4.5,
    reviewCount: 32,
    verified: true,
    memberSince: '2023-05',
    role: 'passenger',
    emergencyContact: {
      name: 'Sita Devi',
      phone: '+91 90000 22222',
    },
  },
];

// Mock vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    ownerId: '1',
    make: 'Toyota',
    model: 'Innova',
    color: 'Silver',
    year: 2020,
    licensePlate: 'TS 09 AB 1234',
    capacity: 7,
    vehicleType: 'suv',
    registrationNumber: 'REG123456',
    insuranceExpiry: '2025-12-31',
    verified: true,
  },
  {
    id: 'v2',
    ownerId: '2',
    make: 'Honda',
    model: 'City',
    color: 'Blue',
    year: 2021,
    licensePlate: 'AP 16 CD 5678',
    capacity: 5,
    vehicleType: 'sedan',
    registrationNumber: 'REG789012',
    insuranceExpiry: '2026-06-30',
    verified: true,
  },
  {
    id: 'v3',
    ownerId: '3',
    make: 'Tata',
    model: 'Winger',
    color: 'White',
    year: 2022,
    licensePlate: 'TS 09 EF 9012',
    capacity: 12,
    vehicleType: 'van',
    registrationNumber: 'REG345678',
    insuranceExpiry: '2026-12-31',
    verified: true,
  },
  {
    id: 'v4',
    ownerId: '1',
    make: 'Maruti',
    model: 'Swift',
    color: 'Red',
    year: 2019,
    licensePlate: 'AP 16 GH 3456',
    capacity: 4,
    vehicleType: 'economy',
    registrationNumber: 'REG901234',
    insuranceExpiry: '2025-08-31',
    verified: true,
  },
  {
    id: 'v5',
    ownerId: '1',
    make: 'Toyota',
    model: 'Innova Crysta',
    color: 'White',
    year: 2023,
    licensePlate: 'TS 09 JK 7890',
    capacity: 8,
    vehicleType: 'suv',
    registrationNumber: 'REG567890',
    insuranceExpiry: '2026-12-31',
    verified: true,
  },
  {
    id: 'v6',
    ownerId: '2',
    make: 'Mahindra',
    model: 'Xylo',
    color: 'Silver',
    year: 2021,
    licensePlate: 'AP 31 LM 4567',
    capacity: 7,
    vehicleType: 'suv',
    registrationNumber: 'REG123456',
    insuranceExpiry: '2025-09-30',
    verified: true,
  },
  {
    id: 'v7',
    ownerId: '3',
    make: 'Ford',
    model: 'EcoSport',
    color: 'Blue',
    year: 2022,
    licensePlate: 'TS 08 PQ 8901',
    capacity: 5,
    vehicleType: 'suv',
    registrationNumber: 'REG789012',
    insuranceExpiry: '2026-03-31',
    verified: true,
  },
];

// Helper function to get dates
const getDateString = (daysFromToday: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0];
};

export const mockRides: Ride[] = [
  // TODAY (Day 0)
  {
    id: '1',
    publisherId: '1',
    publisher: mockUsers[0],
    publisherRole: 'driver',
    from: {
      city: 'Hyderabad',
      address: 'Secunderabad Railway Station',
      coordinates: { lat: 17.4399, lng: 78.4983 },
    },
    to: {
      city: 'Vijayawada',
      address: 'Vijayawada Bus Stand',
      coordinates: { lat: 16.5062, lng: 80.6480 },
    },
    date: getDateString(0),
    time: '05:30 AM',
    price: 450,
    seats: 8,
    availableSeats: 6,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 30m',
    vehicleId: 'v5',
    vehicle: mockVehicles[4],
    preferences: { smoking: false, pets: true, music: true, chatty: 'moderate' },
    description: 'Early morning 8-seater ride. Perfect for families!',
    status: 'upcoming',
  },
  {
    id: '1b',
    publisherId: '2',
    publisher: mockUsers[1],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'HITEC City' },
    to: { city: 'Vijayawada', address: 'Vijayawada Railway Station' },
    date: getDateString(0),
    time: '08:00 AM',
    price: 480,
    seats: 7,
    availableSeats: 5,
    type: 'private',
    distance: '275 km',
    duration: '4h 15m',
    vehicleId: 'v6',
    vehicle: mockVehicles[5],
    preferences: { smoking: false, pets: false, music: true, chatty: 'quiet' },
    description: 'Premium 7-seater service. Business travelers welcome.',
    status: 'upcoming',
  },
  {
    id: '1c',
    publisherId: '1',
    publisher: mockUsers[0],
    publisherRole: 'driver',
    from: { city: 'Vijayawada', address: 'Vijayawada Bus Stand' },
    to: { city: 'Hyderabad', address: 'Gachibowli' },
    date: getDateString(0),
    time: '11:30 AM',
    price: 470,
    seats: 8,
    availableSeats: 7,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 20m',
    vehicleId: 'v5',
    vehicle: mockVehicles[4],
    preferences: { smoking: false, pets: true, music: false, chatty: 'moderate' },
    description: 'Late morning ride. Spacious and comfortable.',
    status: 'upcoming',
  },
  {
    id: '1d',
    publisherId: '3',
    publisher: mockUsers[2],
    publisherRole: 'customer',
    from: { city: 'Hyderabad', address: 'MGBS' },
    to: { city: 'Vijayawada', address: 'Vijayawada Railway Station' },
    date: getDateString(0),
    time: '02:00 PM',
    price: 500,
    seats: 4,
    availableSeats: 3,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 30m',
    vehicleId: 'v2',
    vehicle: mockVehicles[1],
    preferences: { smoking: false, pets: false, music: true, chatty: 'moderate' },
    description: 'Afternoon ride with experienced driver.',
    status: 'upcoming',
  },
  {
    id: '1e',
    publisherId: '2',
    publisher: mockUsers[1],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'Kukatpally' },
    to: { city: 'Vijayawada', address: 'Vijayawada Bus Stand' },
    date: getDateString(0),
    time: '05:00 PM',
    price: 490,
    seats: 7,
    availableSeats: 6,
    type: 'private',
    distance: '275 km',
    duration: '4h 25m',
    vehicleId: 'v6',
    vehicle: mockVehicles[5],
    preferences: { smoking: false, pets: false, music: true, chatty: 'quiet' },
    description: 'Evening 7-seater. Comfortable journey.',
    status: 'upcoming',
  },
  {
    id: '1f',
    publisherId: '1',
    publisher: mockUsers[0],
    publisherRole: 'driver',
    from: { city: 'Vijayawada', address: 'Vijayawada Railway Station' },
    to: { city: 'Hyderabad', address: 'Secunderabad' },
    date: getDateString(0),
    time: '08:30 PM',
    price: 520,
    seats: 8,
    availableSeats: 8,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 30m',
    vehicleId: 'v5',
    vehicle: mockVehicles[4],
    preferences: { smoking: false, pets: true, music: false, chatty: 'quiet' },
    description: 'Late evening ride. Full 8-seater available.',
    status: 'upcoming',
  },
  {
    id: '1g',
    publisherId: '3',
    publisher: mockUsers[2],
    publisherRole: 'customer',
    from: { city: 'Hyderabad', address: 'Airport' },
    to: { city: 'Vijayawada', address: 'Vijayawada' },
    date: getDateString(0),
    time: '11:00 PM',
    price: 550,
    seats: 5,
    availableSeats: 4,
    type: 'private',
    distance: '275 km',
    duration: '4h 15m',
    vehicleId: 'v7',
    vehicle: mockVehicles[6],
    preferences: { smoking: false, pets: false, music: false, chatty: 'quiet' },
    description: 'Night ride from airport. Safe and comfortable.',
    status: 'upcoming',
  },
  
  // DAY 1 (Tomorrow)
  {
    id: '2a',
    publisherId: '1',
    publisher: mockUsers[0],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'Secunderabad' },
    to: { city: 'Vijayawada', address: 'Vijayawada Railway Station' },
    date: getDateString(1),
    time: '06:00 AM',
    price: 450,
    seats: 8,
    availableSeats: 7,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 30m',
    vehicleId: 'v5',
    vehicle: mockVehicles[4],
    preferences: { smoking: false, pets: true, music: true, chatty: 'moderate' },
    description: 'Morning 8-seater. Early start for your journey.',
    status: 'upcoming',
  },
  {
    id: '2b',
    publisherId: '2',
    publisher: mockUsers[1],
    publisherRole: 'driver',
    from: { city: 'Vijayawada', address: 'Vijayawada Bus Stand' },
    to: { city: 'Hyderabad', address: 'HITEC City' },
    date: getDateString(1),
    time: '09:30 AM',
    price: 470,
    seats: 7,
    availableSeats: 6,
    type: 'private',
    distance: '275 km',
    duration: '4h 20m',
    vehicleId: 'v6',
    vehicle: mockVehicles[5],
    preferences: { smoking: false, pets: false, music: true, chatty: 'quiet' },
    description: '7-seater private ride. Professional service.',
    status: 'upcoming',
  },
  {
    id: '2c',
    publisherId: '3',
    publisher: mockUsers[2],
    publisherRole: 'customer',
    from: { city: 'Hyderabad', address: 'Gachibowli' },
    to: { city: 'Vijayawada', address: 'Vijayawada' },
    date: getDateString(1),
    time: '01:00 PM',
    price: 490,
    seats: 5,
    availableSeats: 4,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 25m',
    vehicleId: 'v7',
    vehicle: mockVehicles[6],
    preferences: { smoking: false, pets: true, music: true, chatty: 'moderate' },
    description: 'Afternoon departure. Comfortable ride.',
    status: 'upcoming',
  },
  {
    id: '2d',
    publisherId: '1',
    publisher: mockUsers[0],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'Kukatpally' },
    to: { city: 'Vijayawada', address: 'Vijayawada Railway Station' },
    date: getDateString(1),
    time: '06:00 PM',
    price: 500,
    seats: 8,
    availableSeats: 8,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 30m',
    vehicleId: 'v5',
    vehicle: mockVehicles[4],
    preferences: { smoking: false, pets: false, music: true, chatty: 'quiet' },
    description: 'Evening 8-seater. Full capacity available.',
    status: 'upcoming',
  },

  // DAY 2
  {
    id: '3a',
    publisherId: '2',
    publisher: mockUsers[1],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'HITEC City' },
    to: { city: 'Vijayawada', address: 'Vijayawada Bus Stand' },
    date: getDateString(2),
    time: '07:00 AM',
    price: 460,
    seats: 7,
    availableSeats: 5,
    type: 'private',
    distance: '275 km',
    duration: '4h 20m',
    vehicleId: 'v6',
    vehicle: mockVehicles[5],
    preferences: { smoking: false, pets: false, music: true, chatty: 'moderate' },
    description: 'Morning 7-seater. Professional service.',
    status: 'upcoming',
  },
  {
    id: '3b',
    publisherId: '1',
    publisher: mockUsers[0],
    publisherRole: 'driver',
    from: { city: 'Vijayawada', address: 'Vijayawada Railway Station' },
    to: { city: 'Hyderabad', address: 'Secunderabad' },
    date: getDateString(2),
    time: '10:30 AM',
    price: 450,
    seats: 8,
    availableSeats: 7,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 30m',
    vehicleId: 'v5',
    vehicle: mockVehicles[4],
    preferences: { smoking: false, pets: true, music: false, chatty: 'moderate' },
    description: 'Late morning 8-seater. Spacious and comfortable.',
    status: 'upcoming',
  },
  {
    id: '3c',
    publisherId: '3',
    publisher: mockUsers[2],
    publisherRole: 'customer',
    from: { city: 'Hyderabad', address: 'MGBS' },
    to: { city: 'Vijayawada', address: 'Vijayawada' },
    date: getDateString(2),
    time: '03:00 PM',
    price: 510,
    seats: 4,
    availableSeats: 2,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 25m',
    vehicleId: 'v2',
    vehicle: mockVehicles[1],
    preferences: { smoking: false, pets: false, music: true, chatty: 'quiet' },
    description: 'Afternoon ride. Comfortable sedan.',
    status: 'upcoming',
  },
  {
    id: '3d',
    publisherId: '2',
    publisher: mockUsers[1],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'Airport' },
    to: { city: 'Vijayawada', address: 'Vijayawada Bus Stand' },
    date: getDateString(2),
    time: '08:00 PM',
    price: 540,
    seats: 7,
    availableSeats: 6,
    type: 'private',
    distance: '275 km',
    duration: '4h 15m',
    vehicleId: 'v6',
    vehicle: mockVehicles[5],
    preferences: { smoking: false, pets: false, music: false, chatty: 'quiet' },
    description: 'Late evening 7-seater from airport.',
    status: 'upcoming',
  },

  // DAY 3
  {
    id: '4a',
    publisherId: '1',
    publisher: mockUsers[0],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'Secunderabad' },
    to: { city: 'Vijayawada', address: 'Vijayawada Railway Station' },
    date: getDateString(3),
    time: '05:00 AM',
    price: 440,
    seats: 8,
    availableSeats: 8,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 30m',
    vehicleId: 'v5',
    vehicle: mockVehicles[4],
    preferences: { smoking: false, pets: true, music: true, chatty: 'moderate' },
    description: 'Early morning 8-seater. Perfect start to your day.',
    status: 'upcoming',
  },
  {
    id: '4b',
    publisherId: '3',
    publisher: mockUsers[2],
    publisherRole: 'customer',
    from: { city: 'Vijayawada', address: 'Vijayawada Bus Stand' },
    to: { city: 'Hyderabad', address: 'Gachibowli' },
    date: getDateString(3),
    time: '12:00 PM',
    price: 480,
    seats: 5,
    availableSeats: 3,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 25m',
    vehicleId: 'v7',
    vehicle: mockVehicles[6],
    preferences: { smoking: false, pets: false, music: true, chatty: 'moderate' },
    description: 'Noon departure. Comfortable journey.',
    status: 'upcoming',
  },
  {
    id: '4c',
    publisherId: '2',
    publisher: mockUsers[1],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'HITEC City' },
    to: { city: 'Vijayawada', address: 'Vijayawada' },
    date: getDateString(3),
    time: '05:30 PM',
    price: 500,
    seats: 7,
    availableSeats: 5,
    type: 'private',
    distance: '275 km',
    duration: '4h 20m',
    vehicleId: 'v6',
    vehicle: mockVehicles[5],
    preferences: { smoking: false, pets: false, music: true, chatty: 'quiet' },
    description: 'Evening 7-seater. Premium experience.',
    status: 'upcoming',
  },

  // DAY 4
  {
    id: '5a',
    publisherId: '1',
    publisher: mockUsers[0],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'Kukatpally' },
    to: { city: 'Vijayawada', address: 'Vijayawada Railway Station' },
    date: getDateString(4),
    time: '08:00 AM',
    price: 460,
    seats: 8,
    availableSeats: 6,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 30m',
    vehicleId: 'v5',
    vehicle: mockVehicles[4],
    preferences: { smoking: false, pets: true, music: true, chatty: 'moderate' },
    description: 'Morning 8-seater. Great for groups.',
    status: 'upcoming',
  },
  {
    id: '5b',
    publisherId: '3',
    publisher: mockUsers[2],
    publisherRole: 'customer',
    from: { city: 'Vijayawada', address: 'Vijayawada' },
    to: { city: 'Hyderabad', address: 'MGBS' },
    date: getDateString(4),
    time: '02:00 PM',
    price: 490,
    seats: 4,
    availableSeats: 3,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 25m',
    vehicleId: 'v2',
    vehicle: mockVehicles[1],
    preferences: { smoking: false, pets: false, music: true, chatty: 'moderate' },
    description: 'Afternoon sedan ride. Comfortable and affordable.',
    status: 'upcoming',
  },
  {
    id: '5c',
    publisherId: '2',
    publisher: mockUsers[1],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'Secunderabad' },
    to: { city: 'Vijayawada', address: 'Vijayawada Bus Stand' },
    date: getDateString(4),
    time: '07:00 PM',
    price: 520,
    seats: 7,
    availableSeats: 7,
    type: 'private',
    distance: '275 km',
    duration: '4h 20m',
    vehicleId: 'v6',
    vehicle: mockVehicles[5],
    preferences: { smoking: false, pets: false, music: false, chatty: 'quiet' },
    description: 'Evening 7-seater private ride.',
    status: 'upcoming',
  },

  // DAY 5
  {
    id: '6a',
    publisherId: '1',
    publisher: mockUsers[0],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'HITEC City' },
    to: { city: 'Vijayawada', address: 'Vijayawada Railway Station' },
    date: getDateString(5),
    time: '06:30 AM',
    price: 470,
    seats: 8,
    availableSeats: 5,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 30m',
    vehicleId: 'v5',
    vehicle: mockVehicles[4],
    preferences: { smoking: false, pets: true, music: true, chatty: 'moderate' },
    description: 'Morning 8-seater. Comfortable group travel.',
    status: 'upcoming',
  },
  {
    id: '6b',
    publisherId: '3',
    publisher: mockUsers[2],
    publisherRole: 'customer',
    from: { city: 'Vijayawada', address: 'Vijayawada Railway Station' },
    to: { city: 'Hyderabad', address: 'Gachibowli' },
    date: getDateString(5),
    time: '11:00 AM',
    price: 480,
    seats: 5,
    availableSeats: 4,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 25m',
    vehicleId: 'v7',
    vehicle: mockVehicles[6],
    preferences: { smoking: false, pets: false, music: true, chatty: 'moderate' },
    description: 'Late morning departure. Smooth ride.',
    status: 'upcoming',
  },
  {
    id: '6c',
    publisherId: '2',
    publisher: mockUsers[1],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'MGBS' },
    to: { city: 'Vijayawada', address: 'Vijayawada Bus Stand' },
    date: getDateString(5),
    time: '03:30 PM',
    price: 500,
    seats: 7,
    availableSeats: 6,
    type: 'private',
    distance: '275 km',
    duration: '4h 20m',
    vehicleId: 'v6',
    vehicle: mockVehicles[5],
    preferences: { smoking: false, pets: false, music: true, chatty: 'quiet' },
    description: 'Afternoon 7-seater. Premium comfort.',
    status: 'upcoming',
  },
  {
    id: '6d',
    publisherId: '1',
    publisher: mockUsers[0],
    publisherRole: 'driver',
    from: { city: 'Vijayawada', address: 'Vijayawada' },
    to: { city: 'Hyderabad', address: 'Airport' },
    date: getDateString(5),
    time: '09:00 PM',
    price: 530,
    seats: 8,
    availableSeats: 7,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 15m',
    vehicleId: 'v5',
    vehicle: mockVehicles[4],
    preferences: { smoking: false, pets: true, music: false, chatty: 'quiet' },
    description: 'Night ride to airport. Safe and reliable.',
    status: 'upcoming',
  },

  // DAY 6
  {
    id: '7a',
    publisherId: '2',
    publisher: mockUsers[1],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'Secunderabad' },
    to: { city: 'Vijayawada', address: 'Vijayawada Railway Station' },
    date: getDateString(6),
    time: '05:00 AM',
    price: 450,
    seats: 7,
    availableSeats: 7,
    type: 'private',
    distance: '275 km',
    duration: '4h 20m',
    vehicleId: 'v6',
    vehicle: mockVehicles[5],
    preferences: { smoking: false, pets: false, music: true, chatty: 'quiet' },
    description: 'Early morning 7-seater. Start your weekend right!',
    status: 'upcoming',
  },
  {
    id: '7b',
    publisherId: '1',
    publisher: mockUsers[0],
    publisherRole: 'driver',
    from: { city: 'Vijayawada', address: 'Vijayawada Bus Stand' },
    to: { city: 'Hyderabad', address: 'HITEC City' },
    date: getDateString(6),
    time: '09:00 AM',
    price: 470,
    seats: 8,
    availableSeats: 6,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 30m',
    vehicleId: 'v5',
    vehicle: mockVehicles[4],
    preferences: { smoking: false, pets: true, music: true, chatty: 'moderate' },
    description: 'Morning 8-seater. Perfect for families.',
    status: 'upcoming',
  },
  {
    id: '7c',
    publisherId: '3',
    publisher: mockUsers[2],
    publisherRole: 'customer',
    from: { city: 'Hyderabad', address: 'Gachibowli' },
    to: { city: 'Vijayawada', address: 'Vijayawada' },
    date: getDateString(6),
    time: '01:30 PM',
    price: 495,
    seats: 5,
    availableSeats: 4,
    type: 'carpool',
    distance: '275 km',
    duration: '4h 25m',
    vehicleId: 'v7',
    vehicle: mockVehicles[6],
    preferences: { smoking: false, pets: false, music: true, chatty: 'moderate' },
    description: 'Afternoon ride. Relaxing journey.',
    status: 'upcoming',
  },
  {
    id: '7d',
    publisherId: '2',
    publisher: mockUsers[1],
    publisherRole: 'driver',
    from: { city: 'Hyderabad', address: 'Kukatpally' },
    to: { city: 'Vijayawada', address: 'Vijayawada Railway Station' },
    date: getDateString(6),
    time: '06:30 PM',
    price: 510,
    seats: 7,
    availableSeats: 5,
    type: 'private',
    distance: '275 km',
    duration: '4h 20m',
    vehicleId: 'v6',
    vehicle: mockVehicles[5],
    preferences: { smoking: false, pets: false, music: true, chatty: 'quiet' },
    description: 'Weekend evening ride. 7-seater comfort.',
    status: 'upcoming',
  },
];

export const mockReviews: Review[] = [
  {
    id: '1',
    fromUserId: '4',
    fromUser: mockUsers[3],
    toUserId: '1',
    toUser: mockUsers[0],
    rideId: '1',
    rating: 5,
    comment: 'Great driver! Very punctual and friendly. Smooth ride.',
    date: '2025-09-15',
    reviewType: 'driver-review',
  },
  {
    id: '2',
    fromUserId: '5',
    fromUser: mockUsers[4],
    toUserId: '1',
    toUser: mockUsers[0],
    rideId: '1',
    rating: 4,
    comment: 'Nice ride, comfortable car. Would book again.',
    date: '2025-09-20',
    reviewType: 'driver-review',
  },
  {
    id: '3',
    fromUserId: '4',
    fromUser: mockUsers[3],
    toUserId: '3',
    toUser: mockUsers[2],
    rideId: '3',
    rating: 5,
    comment: 'Excellent luxury service! Very professional.',
    date: '2025-09-25',
    reviewType: 'driver-review',
  },
];

export const popularRoutes = [
  { from: 'Hyderabad', to: 'Vijayawada', price: 450 },
  { from: 'Vijayawada', to: 'Hyderabad', price: 450 },
  { from: 'Visakhapatnam', to: 'Hyderabad', price: 800 },
  { from: 'Hyderabad', to: 'Visakhapatnam', price: 800 },
  { from: 'Hyderabad', to: 'Bangalore', price: 600 },
  { from: 'Warangal', to: 'Hyderabad', price: 350 },
  { from: 'Tirupati', to: 'Hyderabad', price: 500 },
  { from: 'Hyderabad', to: 'Chennai', price: 700 },
];

// Popular timeslots for quick booking (aligned with 3-hour slot system)
export const popularTimeslots = [
  {
    id: 'ts1',
    time: '05:30 AM', // Early Morning slot (4-7 AM)
    from: 'Hyderabad',
    to: 'Vijayawada',
    price: 450,
    availableSeats: 2,
    totalSeats: 6,
    driverName: 'Priya Sharma',
    vehicleType: 'Carpool',
    rideId: '1',
    timeslot: 'early-morning',
  },
  {
    id: 'ts2',
    time: '08:30 AM', // Morning slot (7-10 AM)
    from: 'Hyderabad',
    to: 'Vijayawada',
    price: 500,
    availableSeats: 3,
    totalSeats: 4,
    driverName: 'Rajesh Kumar',
    vehicleType: 'Carpool',
    rideId: '2',
    timeslot: 'morning',
  },
  {
    id: 'ts3',
    time: '11:30 AM', // Late Morning slot (10 AM-1 PM)
    from: 'Hyderabad',
    to: 'Vijayawada',
    price: 480,
    availableSeats: 4,
    totalSeats: 6,
    driverName: 'Priya Sharma',
    vehicleType: 'Carpool',
    rideId: '6',
    timeslot: 'late-morning',
  },
  {
    id: 'ts4',
    time: '02:30 PM', // Afternoon slot (1-4 PM)
    from: 'Hyderabad',
    to: 'Vijayawada',
    price: 520,
    availableSeats: 3,
    totalSeats: 4,
    driverName: 'Rajesh Kumar',
    vehicleType: 'Carpool',
    rideId: '5',
    timeslot: 'afternoon',
  },
  {
    id: 'ts5',
    time: '05:30 PM', // Evening slot (4-7 PM)
    from: 'Hyderabad',
    to: 'Vijayawada',
    price: 550,
    availableSeats: 4,
    totalSeats: 6,
    driverName: 'Priya Sharma',
    vehicleType: 'Carpool',
    rideId: '6',
    timeslot: 'evening',
  },
  {
    id: 'ts6',
    time: '08:30 PM', // Late Evening slot (7-10 PM)
    from: 'Hyderabad',
    to: 'Vijayawada',
    price: 600,
    availableSeats: 8,
    totalSeats: 11,
    driverName: 'Anitha Reddy',
    vehicleType: 'Private',
    rideId: '7',
    timeslot: 'late-evening',
  },
  {
    id: 'ts7',
    time: '11:30 PM', // Night slot (10 PM-1 AM)
    from: 'Hyderabad',
    to: 'Bangalore',
    price: 650,
    availableSeats: 2,
    totalSeats: 4,
    driverName: 'Priya Sharma',
    vehicleType: 'Bus',
    rideId: '4',
    timeslot: 'night',
  },
];

// Helper function to parse hour from time string
const parseHourFromTime = (time: string): number => {
  // Handle AM/PM format
  const amPmMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (amPmMatch) {
    let hour = parseInt(amPmMatch[1]);
    const period = amPmMatch[3].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour;
  }
  // Handle 24-hour format
  const hourMatch = time.match(/(\d+):(\d+)/);
  return hourMatch ? parseInt(hourMatch[1]) : 0;
};

// New 3-hour slot system
export const earlyMorningTimeslots = popularTimeslots.filter(ts => ts.timeslot === 'early-morning'); // 4-7 AM
export const morningTimeslots = popularTimeslots.filter(ts => ts.timeslot === 'morning'); // 7-10 AM
export const lateMorningTimeslots = popularTimeslots.filter(ts => ts.timeslot === 'late-morning'); // 10 AM-1 PM
export const afternoonTimeslots = popularTimeslots.filter(ts => ts.timeslot === 'afternoon'); // 1-4 PM
export const eveningTimeslots = popularTimeslots.filter(ts => ts.timeslot === 'evening'); // 4-7 PM
export const lateEveningTimeslots = popularTimeslots.filter(ts => ts.timeslot === 'late-evening'); // 7-10 PM
export const nightTimeslots = popularTimeslots.filter(ts => ts.timeslot === 'night'); // 10 PM-1 AM

// Legacy groupings for backward compatibility
export const allMorningTimeslots = [...earlyMorningTimeslots, ...morningTimeslots, ...lateMorningTimeslots];
export const allAfternoonTimeslots = [...afternoonTimeslots, ...eveningTimeslots];
export const allEveningTimeslots = [...lateEveningTimeslots, ...nightTimeslots];

// Helper function to check if time matches timeslot (new 3-hour slot system)
const matchesTimeslot = (time: string, timeslot?: 'any' | 'early-morning' | 'morning' | 'late-morning' | 'afternoon' | 'evening' | 'late-evening' | 'night'): boolean => {
  if (!timeslot || timeslot === 'any') return true;
  
  let hour: number;
  
  // Handle AM/PM format (e.g., "09:00 AM" or "2:30 PM")
  const amPmMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (amPmMatch) {
    hour = parseInt(amPmMatch[1]);
    const period = amPmMatch[3].toUpperCase();
    
    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
  } 
  // Handle 24-hour format (e.g., "09:00" or "14:30")
  else {
    const hourMatch = time.match(/(\d+):(\d+)/);
    if (hourMatch) {
      hour = parseInt(hourMatch[1]);
    } else {
      return true; // If can't parse, include it
    }
  }
  
  // Check if time falls in restricted period (1-4 AM)
  if (hour >= 1 && hour < 4) {
    return false; // No booking allowed between 1-4 AM
  }
  
  switch (timeslot) {
    case 'early-morning': return hour >= 4 && hour < 7; // 4-7 AM
    case 'morning': return hour >= 7 && hour < 10; // 7-10 AM
    case 'late-morning': return hour >= 10 && hour < 13; // 10 AM-1 PM
    case 'afternoon': return hour >= 13 && hour < 16; // 1-4 PM
    case 'evening': return hour >= 16 && hour < 19; // 4-7 PM
    case 'late-evening': return hour >= 19 && hour < 22; // 7-10 PM
    case 'night': return hour >= 22 || hour < 1; // 10 PM-1 AM
    default: return true;
  }
};

// Service functions
export const searchRides = (
  from: string,
  to: string,
  date: string,
  passengers: number = 1,
  type?: 'carpool' | 'private' | 'all',
  timeslot?: 'any' | 'early-morning' | 'morning' | 'late-morning' | 'afternoon' | 'evening' | 'late-evening' | 'night'
): Ride[] => {
  const filteredRides = mockRides.filter((ride) => {
    const matchesRoute =
      ride.from.city.toLowerCase().includes(from.toLowerCase()) &&
      ride.to.city.toLowerCase().includes(to.toLowerCase());
    const matchesDate = ride.date === date;
    const hasSeats = ride.availableSeats >= passengers;
    const matchesType = !type || type === 'all' || ride.type === type;
    const matchesTime = matchesTimeslot(ride.time, timeslot);

    return matchesRoute && matchesDate && hasSeats && matchesType && matchesTime;
  });

  // If more than 3 passengers, prioritize 7-8 seater vehicles
  if (passengers > 3) {
    return filteredRides.sort((a, b) => {
      const aIsLargeVehicle = a.seats >= 7;
      const bIsLargeVehicle = b.seats >= 7;
      
      // Large vehicles first
      if (aIsLargeVehicle && !bIsLargeVehicle) return -1;
      if (!aIsLargeVehicle && bIsLargeVehicle) return 1;
      
      // Then sort by available seats (descending)
      return b.availableSeats - a.availableSeats;
    });
  }

  return filteredRides;
};

export const getRideById = (id: string): Ride | undefined => {
  return mockRides.find((ride) => ride.id === id);
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id);
};

export const getVehicleById = (id: string): Vehicle | undefined => {
  return mockVehicles.find((vehicle) => vehicle.id === id);
};

export const getVehiclesForUser = (userId: string): Vehicle[] => {
  return mockVehicles.filter((vehicle) => vehicle.ownerId === userId);
};

export const getReviewsForUser = (userId: string): Review[] => {
  return mockReviews.filter((review) => review.toUserId === userId);
};

export const getRidesForUser = (userId: string): Ride[] => {
  return mockRides.filter((ride) => ride.publisherId === userId);
};

// Current user context (in real app, this would come from auth)
export const getCurrentUser = (): User => {
  return mockUsers[0]; // Return driver by default for demo
};

export const setCurrentUserRole = (role: 'driver' | 'customer' | 'passenger'): User => {
  const user = mockUsers.find(u => u.role === role);
  return user || mockUsers[0];
};
