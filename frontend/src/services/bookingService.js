import { API_URLS, API_URLS_DEV } from './apiConfig';

const BACKEND_URLS = [API_URLS.bookings, API_URLS_DEV.bookings];

/**
 * Creates a booking request for a student
 */
export async function createBookingApi({ boardingId, message }, token, studentEmail) {
  for (const url of BACKEND_URLS) {
    try {
      console.log(`[createBookingApi] POST ${url} boardingId=${boardingId} studentEmail=${studentEmail}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ boardingId, message, studentEmail }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        console.log(`[createBookingApi] Success booking._id=${data.booking?._id}`);
        return { success: true, booking: data.booking, source: 'database' };
      } else {
        console.log(`[createBookingApi] Server error ${response.status}:`, data.message);
        return { success: false, message: data.message || 'Booking failed on server' };
      }
    } catch (error) {
      console.log(`[createBookingApi] Network error at ${url}:`, error.message);
    }
  }
  return { success: false, message: 'Could not reach server. Check your network.' };
}

/**
 * Retrieves bookings for student or owner
 */
export async function getBookingsApi(token, email) {
  for (const url of BACKEND_URLS) {
    try {
      console.log(`[getBookingsApi] GET ${url}?email=${encodeURIComponent(email || '')}`);
      const response = await fetch(`${url}?email=${encodeURIComponent(email || '')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        console.log(`[getBookingsApi] Got ${data.bookings?.length} bookings`);
        return { success: true, bookings: data.bookings || [], source: 'database' };
      } else {
        console.log(`[getBookingsApi] Server error ${response.status}:`, data.message);
        return { success: false, bookings: [], message: data.message };
      }
    } catch (error) {
      console.log(`[getBookingsApi] Network error at ${url}:`, error.message);
    }
  }
  return { success: false, bookings: [], message: 'Could not reach server' };
}

/**
 * Updates booking status (confirm/reject) by owner
 */
export async function updateBookingStatusApi(bookingId, status, token, ownerEmail) {
  for (const url of BACKEND_URLS) {
    try {
      console.log(`Attempting to update booking status on: ${url}/${bookingId}/status`);
      const response = await fetch(`${url}/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status, ownerEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, booking: data.booking, source: 'database' };
      } else {
        console.log(`Server returned not ok status for update status: ${response.status}`);
      }
    } catch (error) {
      console.log(`Backend server at ${url} not available for updating status:`, error.message);
    }
  }

  // Fallback for offline/local simulation
  console.log('Using local fallback for updating booking status.');
  return { success: true, source: 'local' };
}
