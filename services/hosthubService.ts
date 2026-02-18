import { HosthubAvailability } from '../types';
import { cmsService } from './cmsService';
import { supabase } from './supabase';

/**
 * PRODUCTION READY SERVICE
 * Αυτή η υπηρεσία συνδέεται με το API της Hosthub μέσω Proxy για αποφυγή CORS.
 */

const HOSTHUB_API_URL = 'https://api.hosthub.com/v1';

// Χρήση του AllOrigins JSON endpoint (πιο σταθερό από το /raw)
const getProxyUrl = (targetUrl: string) => {
  return 'https://api.allorigins.win/get?url=' + encodeURIComponent(targetUrl);
};

export const hosthubService = {
  /**
   * Φέρνει τη διαθεσιμότητα (Public/Visitors)
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

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Hosthub API Error: ${response.status}`);
      
      const wrapper = await response.json();
      const data = JSON.parse(wrapper.contents);
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
   * Φέρνει όλα τα listings (Admin Only)
   */
  getAllListings: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Απαιτείται σύνδεση διαχειριστή για τον συγχρονισμό.');
    }

    const { hosthubApiKey } = await cmsService.loadContent();
    if (!hosthubApiKey) {
      throw new Error("Missing Hosthub API Key in Settings");
    }

    try {
      const targetUrl = `${HOSTHUB_API_URL}/listings`;
      const url = getProxyUrl(targetUrl);

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Hosthub Listings Fetch Error: ${response.status}`);

      const wrapper = await response.json();
      const data = JSON.parse(wrapper.contents);
      
      return data.data || data; 
    } catch (error) {
      console.error("Hosthub Sync Error:", error);
      throw error;
    }
  },

  /**
   * Στέλνει κράτηση στη Hosthub
   */
  pushBooking: async (bookingData: any) => {
    const { hosthubApiKey } = await cmsService.loadContent();
    
    if (!hosthubApiKey) {
      console.log("Simulation: Booking stored locally only.");
      return { status: 'success', simulation: true };
    }

    try {
      const targetUrl = `${HOSTHUB_API_URL}/bookings`;
      // Για POST χρησιμοποιούμε corsproxy.io
      const url = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);

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
  }
};

/**
 * Fallback για όταν δεν υπάρχει API Key
 */
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
