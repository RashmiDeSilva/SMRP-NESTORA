import { Platform } from 'react-native';

// Update DEV_IP to your machine's local IP when testing on a physical device
const DEV_IP = '192.168.1.2';

// For web browser: localhost works directly
// For Android emulator: 10.0.2.2 maps to the host machine's localhost
// For physical device via Expo Go: use DEV_IP
const getHost = () => {
  if (Platform.OS === 'android') return '10.0.2.2';
  return 'localhost';
};

const HOST = getHost();
const BASE = `http://${HOST}:5000`;

export const API_URLS = {
  auth:     `${BASE}/api/auth`,
  boardings:`${BASE}/api/boardings`,
  bookings: `${BASE}/api/bookings`,
  student:  `${BASE}/api/boardings`,
};

// Also export DEV_IP variants for physical device fallback
export const API_URLS_DEV = {
  auth:     `http://${DEV_IP}:5000/api/auth`,
  boardings:`http://${DEV_IP}:5000/api/boardings`,
  bookings: `http://${DEV_IP}:5000/api/bookings`,
  student:  `http://${DEV_IP}:5000/api/boardings`,
};
