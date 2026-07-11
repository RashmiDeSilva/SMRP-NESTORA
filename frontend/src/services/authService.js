import { Platform } from 'react-native';

// NOTE: When testing on a physical phone via Expo Go, replace this with your computer's local IP address (e.g. 192.168.1.x)
const DEV_IP = '192.168.1.100'; 

// Android emulator accesses the host machine's localhost via 10.0.2.2, iOS emulator uses localhost
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

const BACKEND_URLS = [
  `http://${HOST}:5000/api/auth`,
  `http://${DEV_IP}:5000/api/auth`,
];

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
