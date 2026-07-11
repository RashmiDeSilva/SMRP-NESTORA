import { Platform } from 'react-native';

// NOTE: When testing on a physical phone via Expo Go, replace this with your computer's local IP address (e.g. 192.168.1.x)
const DEV_IP = '192.168.1.100';

const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

const BACKEND_URLS = [
  `http://${HOST}:5000/api/boardings`,
  `http://${DEV_IP}:5000/api/boardings`,
];

/**
 * Fetches ALL boarding listings from the database (for students to browse).
 * Falls back to an empty list if the backend is offline.
 */
export async function getAllBoardingsApi() {
  for (const url of BACKEND_URLS) {
    try {
      console.log(`Student: Fetching all boardings from: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, boardings: data.boardings, source: 'database' };
      } else {
        console.log(`Server returned ${response.status} for getAllBoardings`);
      }
    } catch (error) {
      console.log(`Backend at ${url} not available for student boardings:`, error.message);
    }
  }

  // Network fallback – return empty array so the UI renders gracefully
  console.log('Falling back to empty list for student boardings.');
  return { success: true, boardings: [], source: 'local' };
}
