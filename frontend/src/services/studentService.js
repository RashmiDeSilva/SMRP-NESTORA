import { API_URLS, API_URLS_DEV } from './apiConfig';

const BACKEND_URLS = [API_URLS.boardings, API_URLS_DEV.boardings];

/**
 * Fetches ALL boarding listings from the database (for students to browse).
 * Falls back to an empty list if the backend is offline.
 */
export async function getAllBoardingsApi(token) {
  for (const url of BACKEND_URLS) {
    try {
      console.log(`Student: Fetching all boardings from: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
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
