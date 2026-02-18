import { HosthubAvailability } from '../types';
import { cmsService } from './cmsService';
import { supabase } from './supabase';

/**
 * PRODUCTION READY SERVICE
 * Αυτή η υπηρεσία συνδέεται με το API της Hosthub.
 */

// Βασικό URL της Hosthub
const HOSTHUB_API_URL = 'https://api.hosthub.com/v1';

// Helper για δημιουργία Proxy URL (AllOrigins)
const getProxyUrl = (targetUrl: string) => {
  return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(targetUrl);
};

export const hosthubService = {
  /**
   * Φέρνει τη διαθεσιμότητα. 
   * Αυτή η μέθοδος είναι δημόσια (για τους επισκέπτες), οπότε ΔΕΝ ζητάμε admin login,
   * αλλά χρησιμοποιούμε το AllOrigins Proxy για να μην έχουμε CORS errors.
   */
  getAvailability: async (listingId: string, start: string, end: string): Promise<HosthubAvailability[]> => {
    const { hosthubApiKey } = await cmsService.loadContent();
    
    if (!hosthubApiKey) {
      console.warn("No Hosthub API Key found. Using simulation.");
      return simulateAvailability(start, end);
    }

    try {
      const targetUrl = `${HOSTHUB_API_URL}/listings/${listingId}/calendar?from=${start}&to=${end}`;
      const url = getProxyUrl(targetUrl);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${hosthubApiKey}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error(`Hosthub API Error: ${response.status}`);
      
      const data = await response.json();
      const days = Array.isArray(data) ? data : (data.data || []);

      return days.map((day: any) => ({
        date: day.date,
        available: day.status === 'available',
        price: day.price || 0,
        minStay: day.min_stay || 1
      }));
    } catch (error) {
      console.error("Availability Sync Error:", error);
      return [];
    }
  },

  /**
   * Fetch all listings from Hosthub to sync content.
   * SECURITY: Απαιτεί σύνδεση Admin στο Supabase.
   * Χρησιμοποιεί AllOrigins Proxy για CORS.
   */
  getAllListings: async () => {
    // 1. Security Check: Verify Admin Session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Απαιτείται σύνδεση διαχειριστή για τον συγχρονισμό.');
    }

    // 2. Load API Key
    const { hosthubApiKey } = await cmsService.loadContent();
    if (!hosthubApiKey) {
      console.warn("Missing Hosthub API Key in Settings");
      return [];
    }

    try {
      // 3. Prepare Proxy URL (AllOrigins)
      const targetUrl = `${HOSTHUB_API_URL}/listings`;
      const url = getProxyUrl(targetUrl);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${hosthubApiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Hosthub Listings Fetch Error: ${response.status}`);
      }

      const json = await response.json();
      return json.data || json; 
    } catch (error) {
      console.error("Hosthub Sync Error:", error);
      throw error; // Πετάμε το error για να το δει το UI του Admin
    }
  },

  /**
   * Push Booking.
   * Σημείωση: Το AllOrigins υποστηρίζει κυρίως GET. Για POST χρησιμοποιούμε εναλλακτικό Proxy
   * ή απευθείας κλήση αν το υποστηρίζει ο server (συνήθως τα POST bookings απαιτούν backend).
   */
  pushBooking: async (bookingData: any) => {
    const { hosthubApiKey } = await cmsService.loadContent();
    
    if (!hosthubApiKey) {
      console.log("Simulation: Booking stored locally only (No Hosthub Key).");
      return { status: 'success', simulation: true };
    }

    try {
      const targetUrl = `${HOSTHUB_API_URL}/bookings`;
      // Χρησιμοποιούμε corsproxy.io για POST καθώς το AllOrigins είναι συχνά read-only (GET)
      const url = 'https://corsproxy.io/?' + targetUrl;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hosthubApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listing_id: bookingData.listingId,
          check_in: bookingData.checkIn,
          check_out: bookingData.checkOut,
          guest_name: bookingData.guestName,
          guest_email: bookingData.guestEmail,
          total_price: bookingData.totalAmount,
          currency: 'EUR',
          status: 'confirmed',
          source: 'Website-Direct'
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Hosthub Push Failed: ${err}`);
      }
      
      return await response.json();
    } catch (error) {
       console.error("Hosthub Push Booking Error:", error);
       throw error;
    }
  },
  
  // Legacy method wrapper (αν χρησιμοποιείται αλλού)
  syncBookings: async (apiKey: string) => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('Απαιτείται σύνδεση διαχειριστή');

          const targetUrl = `${HOSTHUB_API_URL}/bookings`; // GET bookings
          const url = getProxyUrl(targetUrl);

          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          const data = await response.json();
          return { success: true, message: 'Sync complete', data };
      } catch (e: any) {
          return { success: false, message: e.message };
      }
  }
};

async function simulateAvailability(start: string, end: string): Promise<HosthubAvailability[]> {
  const dates: HosthubAvailability[] = [];
  const curr = new Date(start);
  const stop = new Date(end);
  while (curr <= stop) {
    dates.push({
      date: curr.toISOString().split('T')[0],
      available: Math.random() > 0.3,
      price: 150 + Math.floor(Math.random() * 100),
      minStay: 2
    });
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}
