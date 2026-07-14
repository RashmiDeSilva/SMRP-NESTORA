import { API_URLS, API_URLS_DEV } from './apiConfig';

const BACKEND_URLS = [API_URLS.auth, API_URLS_DEV.auth];

/**
 * Sends sign up data to the Node/Express/MongoDB backend database.
 * If the server is offline or network fails, it falls back to the frontend local state database.
 */
export async function signUpApi(userData) {
  for (const url of BACKEND_URLS) {
    try {
      console.log(`Attempting Signup on: ${url}/signup`);
      const response = await fetch(`${url}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      if (response.ok) {
        return { success: true, user: data.user, token: data.token, source: 'database' };
      } else {
        return { success: false, message: data.message || 'Signup failed on server' };
      }
    } catch (error) {
      console.log(`Backend server at ${url} not available, trying next...`);
    }
  }

  // Network Fallback: if backend is not running/accessible, return success using local DB fallback
  console.log('Using local state database fallback for signup.');
  return { success: true, user: userData, source: 'local' };
}

/**
 * Sends login credentials to the Node/Express/MongoDB backend database.
 * If the server is offline or network fails, it falls back to the frontend local state database.
 */
export async function loginApi(email, password, registeredUser) {
  for (const url of BACKEND_URLS) {
    try {
      console.log(`Attempting Login on: ${url}/login`);
      const response = await fetch(`${url}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        return { success: true, user: data.user, token: data.token, source: 'database' };
      } else {
        return { success: false, message: data.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.log(`Backend server at ${url} not available, trying next...`);
    }
  }

  // Network Fallback: evaluate login against the registered user stored in local state database
  console.log('Using local state database fallback for login.');
  
  // Check against email and password stored during signup in App.js
  if (registeredUser && registeredUser.email.toLowerCase() === email.toLowerCase()) {
    if (registeredUser.password === password) {
      return { 
        success: true, 
        user: { email: registeredUser.email, role: registeredUser.role }, 
        source: 'local' 
      };
    } else {
      return { success: false, message: 'Invalid password' };
    }
  } else if (email.toLowerCase().includes('owner')) {
    // Convenient developer backdoor: typing "owner" in email logs in as owner
    return {
      success: true,
      user: { email: email, role: 'Boarding Owner' },
      source: 'local_backdoor'
    };
  }

  return { success: false, message: 'User not found in local database. Please sign up first!' };
}

/**
 * Persists saving/toggling a boarding ID in the database
 */
export async function toggleSavedBoardingApi(boardingId, token, email) {
  for (const url of BACKEND_URLS) {
    try {
      console.log(`Attempting to toggle saved boarding on: ${url}/saved`);
      const response = await fetch(`${url}/saved`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ boardingId, email }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, savedBoardingIds: data.savedBoardingIds };
      } else {
        const err = await response.json().catch(() => ({}));
        console.log(`toggleSavedBoardingApi error ${response.status}:`, err.message);
        return { success: false, message: err.message };
      }
    } catch (error) {
      console.log(`Backend server at ${url} not available for saved toggle:`, error.message);
    }
  }
  return { success: false };
}

/**
 * Fetches the persistent saved boarding IDs list
 */
export async function getSavedBoardingsApi(token, email) {
  for (const url of BACKEND_URLS) {
    try {
      console.log(`Attempting to fetch saved boardings from: ${url}/saved`);
      const response = await fetch(`${url}/saved?email=${encodeURIComponent(email || '')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, savedBoardingIds: data.savedBoardingIds };
      } else {
        const err = await response.json().catch(() => ({}));
        console.log(`getSavedBoardingsApi error ${response.status}:`, err.message);
        return { success: false, message: err.message };
      }
    } catch (error) {
      console.log(`Backend server at ${url} not available for fetching saveds:`, error.message);
    }
  }
  return { success: false };
}
