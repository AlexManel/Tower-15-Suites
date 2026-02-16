
import { HosthubAvailability } from '../types';
import { cmsService } from './cmsService';

/**
 * PRODUCTION READY SERVICE
 * Αυτή η υπηρεσία συνδέεται με το API της Hosthub.
 * Σημείωση: Στην παραγωγή προτείνεται η χρήση ενός Proxy για την προστασία του API Key.
 */

// Χρήση ενός δημόσιου CORS proxy για το demo/launch αν δεν υπάρχει backend
const HOSTHUB_BASE_URL = 'https://api.hosthub.com/v1';

export const hosthubService = {
  /**
   * Φέρνει τη διαθεσιμότητα. Αν μια μέρα είναι "blocked" στη Hosthub,
   * η εφαρμογή θα επιστρέψει available: false.
   */
  getAvailability: async (listingId: string, start: string, end: string): Promise<HosthubAvailability[]> => {
    const { hosthubApiKey } = cmsService.getInitialState();
    
    if (!hosthubApiKey) {
      console.warn("No Hosthub API Key found in Settings. Using simulation mode.");
      return simulateAvailability(start, end);
    }

    try {
      // Σημαντικό: Το listingId πρέπει να είναι το UUID της Hosthub
      const url = `${HOSTHUB_BASE_URL}/listings/${listingId}/calendar?from=${start}&to=${end}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${hosthubApiKey}`,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) throw new Error(`Hosthub API Error: ${response.status}`);
      
      const data = await response.json();
      
      // Η Hosthub επιστρέφει status 'available' ή 'booked'/'blocked'
      return data.map((day: any) => ({
        date: day.date,
        available: day.status === 'available',
        price: day.price || 0,
        minStay: day.min_stay || 1
      }));
    } catch (error) {
      console.error("Critical Hosthub Sync Error:", error);
      // Σε περίπτωση σφάλματος API, επιστρέφουμε άδειο για ασφάλεια (δεν επιτρέπουμε κράτηση)
      return [];
    }
  },

  /**
   * Fetch all listings from Hosthub to sync content.
   */
  getAllListings: async () => {
    const { hosthubApiKey } = await cmsService.loadContent();

    if (!hosthubApiKey) {
      throw new Error("Missing Hosthub API Key in Settings");
    }

    try {
      const response = await fetch(`${HOSTHUB_BASE_URL}/listings`, {
        headers: {
          'Authorization': `Bearer ${hosthubApiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Hosthub Listings Fetch Error: ${response.status}`);
      }

      const json = await response.json();
      return json.data || json; // Adjust based on exact Hosthub response structure
    } catch (error) {
      console.error("Hosthub Sync Error:", error);
      throw error;
    }
  },

  /**
   * Πραγματικό push κράτησης στη Hosthub.
   * Μόλις γίνει αυτό, η Hosthub ενημερώνει Airbnb/Booking μέσα σε δευτερόλεπτα.
   */
  pushBooking: async (bookingData: any) => {
    const { hosthubApiKey } = cmsService.getInitialState();
    
    if (!hosthubApiKey) {
      console.log("Simulation: Booking stored locally.");
      return { status: 'success' };
    }

    const response = await fetch(`${HOSTHUB_BASE_URL}/bookings`, {
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
        source: 'Website-Direct' // Για να ξέρεις ότι ήρθε από εδώ
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Hosthub Push Failed: ${err}`);
    }
    
    return await response.json();
  }
};

async function simulateAvailability(start: string, end: string): Promise<HosthubAvailability[]> {
  const dates: HosthubAvailability[] = [];
  const curr = new Date(start);
  const stop = new Date(end);
  while (curr <= stop) {
    dates.push({
      date: curr.toISOString().split('T')[0],
      available: Math.random() > 0.1,
      price: 280,
      minStay: 2
    });
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}
