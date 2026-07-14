import { API_URLS, API_URLS_DEV } from './apiConfig';

const BACKEND_URLS = [API_URLS.boardings, API_URLS_DEV.boardings];

// Session-based in-memory local fallback list
let localBoardingsList = [];

/**
 * Sends boarding data to the Node/Express/MongoDB backend database.
 * If the server is offline or network fails (or returns an error), it falls back to the local in-memory store.
 */
export async function addBoardingApi(boardingData, token) {
  // Sanitize numeric fields to prevent CastErrors on backend
  const sanitizedData = {
    ...boardingData,
    totalRooms: boardingData.totalRooms && String(boardingData.totalRooms).trim() !== '' ? Number(boardingData.totalRooms) : undefined,
    totalBeds: boardingData.totalBeds && String(boardingData.totalBeds).trim() !== '' ? Number(boardingData.totalBeds) : 0,
    pricePerMonth: boardingData.pricePerMonth && String(boardingData.pricePerMonth).trim() !== '' ? Number(boardingData.pricePerMonth) : undefined,
  };

  for (const url of BACKEND_URLS) {
    try {
      console.log(`Attempting to add boarding on: ${url}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(sanitizedData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, boarding: data.boarding, source: 'database' };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log(`Server error on ${url}:`, errorData.message || 'Unknown server error');
      }
    } catch (error) {
      console.log(`Backend server at ${url} not available for adding boarding:`, error.message);
    }
  }

  // Network Fallback: if all backend servers fail/error out, store it locally
  console.log('Using local state database fallback for adding boarding.');
  const newLocalBoarding = {
    _id: `local_${Date.now()}`,
    ...sanitizedData,
    createdAt: new Date().toISOString(),
  };
  localBoardingsList.unshift(newLocalBoarding); // Add to the front of the list
  return { success: true, boarding: newLocalBoarding, source: 'local' };
}

/**
 * Fetches all boardings for a specific owner from the Node/Express/MongoDB backend database.
 * If the server is offline or network fails, it falls back to the local in-memory store.
 */
export async function getBoardingsApi(ownerIdentifier, token) {
  const normalizedOwner = (ownerIdentifier || '').toLowerCase();
  
  for (const url of BACKEND_URLS) {
    try {
      console.log(`Attempting to fetch boardings from: ${url}?owner=${encodeURIComponent(normalizedOwner)}`);
      const response = await fetch(`${url}?owner=${encodeURIComponent(normalizedOwner)}`, {
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
        console.log(`Server returned not ok status for get boardings: ${response.status}`);
      }
    } catch (error) {
      console.log(`Backend server at ${url} not available for fetching boardings:`, error.message);
    }
  }

  // Network Fallback: filter local memory list
  console.log('Using local state database fallback for fetching boardings.');
  const filtered = localBoardingsList.filter(
    (b) => (b.owner || '').toLowerCase() === normalizedOwner
  );
  return { success: true, boardings: filtered, source: 'local' };
}

/**
 * Deletes a boarding listing from the Node/Express/MongoDB backend database.
 * If the server is offline or network fails, it falls back to removing it from the local in-memory store.
 */
export async function deleteBoardingApi(id, token) {
  for (const url of BACKEND_URLS) {
    try {
      console.log(`Attempting to delete boarding on: ${url}/${id}`);
      const response = await fetch(`${url}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        return { success: true, source: 'database' };
      } else {
        console.log(`Server returned not ok status for delete boarding: ${response.status}`);
      }
    } catch (error) {
      console.log(`Backend server at ${url} not available for deleting boarding:`, error.message);
    }
  }

  // Network Fallback: remove from local memory list
  console.log('Using local state database fallback for deleting boarding.');
  localBoardingsList = localBoardingsList.filter(b => b._id !== id);
  return { success: true, source: 'local' };
}

/**
 * Updates a boarding listing in the Node/Express/MongoDB backend database.
 * If the server is offline or network fails, it falls back to updating the local in-memory store.
 */
export async function updateBoardingApi(id, boardingData, token) {
  // Sanitize numeric fields to prevent CastErrors on backend
  const sanitizedData = {
    ...boardingData,
    totalRooms: boardingData.totalRooms && String(boardingData.totalRooms).trim() !== '' ? Number(boardingData.totalRooms) : undefined,
    totalBeds: boardingData.totalBeds && String(boardingData.totalBeds).trim() !== '' ? Number(boardingData.totalBeds) : 0,
    pricePerMonth: boardingData.pricePerMonth && String(boardingData.pricePerMonth).trim() !== '' ? Number(boardingData.pricePerMonth) : undefined,
  };

  for (const url of BACKEND_URLS) {
    try {
      console.log(`Attempting to update boarding on: ${url}/${id}`);
      const response = await fetch(`${url}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(sanitizedData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, boarding: data.boarding, source: 'database' };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log(`Server error on PUT:`, errorData.message || 'Unknown error');
      }
    } catch (error) {
      console.log(`Backend server at ${url} not available for updating boarding:`, error.message);
    }
  }

  // Network Fallback: update in local memory list
  console.log('Using local state database fallback for updating boarding.');
  const index = localBoardingsList.findIndex(b => b._id === id);
  if (index !== -1) {
    localBoardingsList[index] = {
      ...localBoardingsList[index],
      ...sanitizedData,
    };
    return { success: true, boarding: localBoardingsList[index], source: 'local' };
  }
  
  // If not found in local, create it as fallback
  const newLocal = { _id: id, ...sanitizedData, createdAt: new Date().toISOString() };
  localBoardingsList.unshift(newLocal);
  return { success: true, boarding: newLocal, source: 'local' };
}

/**
 * Fetches boarding places by their exact name.
 */
export async function getBoardingByNameApi(name, token) {
  for (const url of BACKEND_URLS) {
    try {
      console.log(`Attempting to fetch boarding by name on: ${url}/name/${encodeURIComponent(name)}`);
      const response = await fetch(`${url}/name/${encodeURIComponent(name)}`, {
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
        const errorData = await response.json().catch(() => ({}));
        console.log(`Server error fetching by name on ${url}:`, errorData.message || 'Unknown server error');
      }
    } catch (error) {
      console.log(`Backend server at ${url} not available for fetching by name:`, error.message);
    }
  }

  // Fallback: search in local list
  console.log('Using local state database fallback for getBoardingByNameApi.');
  const matches = localBoardingsList.filter(b => b.boardingName?.toLowerCase() === name.toLowerCase());
  return { success: true, boardings: matches, source: 'local' };
}
