
import { Property, CMSState, RealBooking, BookingStatus } from '../types';
import { INITIAL_PROPERTIES, getImages } from '../constants';
import { supabase } from './supabase';
import { hosthubService } from './hosthubService';

// Helper to map DB snake_case to TS camelCase
const mapPropertyFromDB = (row: any): Property => {
  let images = row.images || [];
  
  if (images.length === 0 || images.some((img: string) => img.startsWith('/') || img.includes('localhost'))) {
    images = getImages(row.id);
  }

  return {
    id: row.id,
    hosthubListingId: row.hosthub_listing_id || '',
    title: row.title,
    titleEl: row.title_el || row.title,
    category: row.category,
    categoryEl: row.category_el || row.category,
    description: row.description || '',
    descriptionEl: row.description_el || row.description,
    shortDescription: row.short_description || '',
    shortDescriptionEl: row.short_description_el || row.short_description,
    images: images,
    amenities: row.amenities || [],
    amenitiesEl: row.amenities_el || row.amenities,
    capacity: row.capacity,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    houseRules: row.house_rules || [],
    cancellationPolicy: row.cancellation_policy || '',
    location: row.location || '',
    pricePerNightBase: row.price_per_night_base,
    cleaningFee: row.cleaning_fee || 30, 
    climateCrisisTax: row.climate_crisis_tax || 1.5
  };
};

const mapPropertyToDB = (p: Property) => ({
  id: p.id,
  hosthub_listing_id: p.hosthubListingId,
  title: p.title,
  title_el: p.titleEl,
  category: p.category,
  category_el: p.categoryEl,
  description: p.description,
  description_el: p.descriptionEl,
  short_description: p.shortDescription,
  short_description_el: p.shortDescriptionEl,
  images: p.images,
  amenities: p.amenities,
  amenities_el: p.amenitiesEl,
  capacity: p.capacity,
  bedrooms: p.bedrooms,
  bathrooms: p.bathrooms,
  house_rules: p.houseRules,
  cancellation_policy: p.cancellationPolicy,
  location: p.location,
  price_per_night_base: p.pricePerNightBase,
  cleaning_fee: p.cleaningFee,
  climate_crisis_tax: p.climateCrisisTax
});

// Strictly defined legacy mapper
const mapPropertyToLegacyDB = (p: Property) => {
  // We create a new object explicitly to avoid any prototype pollution or extra keys
  return {
    id: p.id,
    hosthub_listing_id: p.hosthubListingId,
    title: p.title,
    category: p.category,
    description: p.description,
    short_description: p.shortDescription,
    images: p.images,
    amenities: p.amenities,
    capacity: p.capacity,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    house_rules: p.houseRules,
    cancellation_policy: p.cancellationPolicy,
    location: p.location,
    price_per_night_base: p.pricePerNightBase
  };
};

export const cmsService = {
  loadContent: async (): Promise<CMSState> => {
    try {
      const { data: propsData, error: propsError } = await supabase
        .from('properties')
        .select('*');

      if (propsError) {
         console.warn("DB Load Error, using initial data.");
         return cmsService.getInitialState();
      }

      let properties: Property[] = [];
      
      if (!propsData || propsData.length === 0) {
        console.log("Bootstrapping initial properties...");
        const initialRows = INITIAL_PROPERTIES.map(mapPropertyToLegacyDB);
        await supabase.from('properties').insert(initialRows);
        properties = INITIAL_PROPERTIES;
      } else {
        properties = propsData.map(mapPropertyFromDB);
      }

      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      const settings = settingsData || {};

      return {
        properties,
        brandName: settings.brand_name || 'TOWER 15 Suites',
        stripePublicKey: settings.stripe_public_key || '',
        hosthubApiKey: settings.hosthub_api_key || '',
        mydataUserId: settings.mydata_user_id || '',
        mydataApiKey: settings.mydata_api_key || '',
        vatNumber: settings.vat_number || ''
      };

    } catch (error) {
      console.error("CMS Load Error:", error);
      return cmsService.getInitialState();
    }
  },

  updateProperty: async (property: Property) => {
    // 1. Try Modern Save
    try {
      const dbRow = mapPropertyToDB(property);
      const { error } = await supabase
        .from('properties')
        .upsert(dbRow);

      if (error) throw error;
      return; // Success
    } catch (error: any) {
      // 2. Fallback to Legacy Save
      const isSchemaError = error.code === '42703' || // Undefined column
                           error.message?.includes('column') || 
                           error.message?.includes('cleaning_fee') ||
                           error.message?.includes('amenities_el') ||
                           error.message?.includes('schema') ||
                           error.code === 'PGRST100' || // PostgREST error
                           error.message?.includes('Bad Request'); // 400

      if (isSchemaError) {
         console.warn(`Schema mismatch for ${property.id}. Attempting raw REST fallback to bypass client cache.`);
         
         const legacyRow = mapPropertyToLegacyDB(property);
         
         // Use raw fetch to avoid supabase-js schema caching issues
         const SUPABASE_URL = (supabase as any).supabaseUrl;
         const SUPABASE_KEY = (supabase as any).supabaseKey;

         if (!SUPABASE_URL || !SUPABASE_KEY) {
            throw new Error("Critical: Missing Supabase credentials for fallback save.");
         }
         
         // Try PATCH first (Update)
         let response = await fetch(`${SUPABASE_URL}/rest/v1/properties?id=eq.${property.id}`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               'apikey': SUPABASE_KEY,
               'Authorization': `Bearer ${SUPABASE_KEY}`,
               'Prefer': 'return=minimal'
            },
            body: JSON.stringify(legacyRow)
         });

         // If PATCH fails (e.g. 404 Not Found implies new record), try POST (Insert)
         if (!response.ok) {
            console.log(`PATCH failed with ${response.status}. Trying POST (Upsert)...`);
            
            response = await fetch(`${SUPABASE_URL}/rest/v1/properties`, {
                method: 'POST',
                headers: {
                   'Content-Type': 'application/json',
                   'apikey': SUPABASE_KEY,
                   'Authorization': `Bearer ${SUPABASE_KEY}`,
                   'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(legacyRow)
             });
         }
         
         if (!response.ok) {
           const errText = await response.text();
           console.error("Legacy Save Failed (Raw):", errText);
           throw new Error(`Legacy Save Failed: ${errText}`);
         }
         
         return; // Success legacy save
      }
      
      throw new Error(`Save Failed: ${error.message}`);
    }
  },

  /**
   * Syncs properties from Hosthub to Supabase.
   * Merges remote data with local data to preserve Greek translations.
   */
  syncAllPropertiesFromHosthub: async (): Promise<{ updated: number, created: number }> => {
    try {
      // 1. Fetch current local properties (to preserve Greek translations and other local fields)
      const currentState = await cmsService.loadContent();
      const localProps = currentState.properties;

      // 2. Fetch all listings from Hosthub
      // The hosthubService must have the getAllListings method (implemented in Step 1)
      const hosthubListings = await hosthubService.getAllListings();
      
      if (!hosthubListings || !Array.isArray(hosthubListings)) {
        throw new Error("Invalid response from Hosthub API");
      }

      let updatedCount = 0;
      let createdCount = 0;

      // 3. Iterate and Merge
      for (const listing of hosthubListings) {
        // Find if we already have this property locally (match by Hosthub ID)
        const existingProp = localProps.find(p => p.hosthubListingId === listing.id || p.hosthubListingId === listing.listing_id);
        
        // Map Hosthub images (assuming they return an array of objects or strings)
        const rawImages = listing.photos || listing.images || [];
        const mappedImages = Array.isArray(rawImages) 
          ? rawImages.map((img: any) => typeof img === 'string' ? img : img.url || img.large || '').filter(Boolean)
          : [];

        // Prepare the new data object
        // We prioritize Hosthub data for operational fields (price, availability details, main title)
        // We prioritize Local data for translations and static content not in Hosthub
        
        let propertyToUpsert: Property;

        if (existingProp) {
          // UPDATE EXISTING: Merge Hosthub data on top, but keep local overrides (Greek fields)
          propertyToUpsert = {
            ...existingProp,
            // Update fields from Hosthub
            title: listing.name || listing.title || existingProp.title,
            description: listing.description || existingProp.description,
            pricePerNightBase: listing.base_rate || listing.price || existingProp.pricePerNightBase,
            capacity: listing.max_guests || listing.capacity || existingProp.capacity,
            bedrooms: listing.bedrooms || existingProp.bedrooms,
            bathrooms: listing.bathrooms || existingProp.bathrooms,
            // Update images only if Hosthub has them, otherwise keep local
            images: mappedImages.length > 0 ? mappedImages : existingProp.images,
            // Keep existing IDs
            id: existingProp.id,
            hosthubListingId: listing.id || existingProp.hosthubListingId
          };
          updatedCount++;
        } else {
          // CREATE NEW: Map fresh from Hosthub
          propertyToUpsert = {
            id: `t15-${Math.random().toString(36).substr(2, 5)}`, // Generate new internal ID
            hosthubListingId: listing.id,
            title: listing.name || "New Listing",
            titleEl: listing.name || "New Listing", // Default Greek title to English initially
            category: "Uncategorized",
            categoryEl: "Χωρίς Κατηγορία",
            description: listing.description || "",
            descriptionEl: listing.description || "",
            shortDescription: (listing.description || "").substring(0, 150),
            shortDescriptionEl: (listing.description || "").substring(0, 150),
            images: mappedImages.length > 0 ? mappedImages : getImages("new"),
            amenities: [], // Hosthub amenities mapping is complex, leaving empty for manual review
            amenitiesEl: [],
            capacity: listing.max_guests || 2,
            bedrooms: listing.bedrooms || 1,
            bathrooms: listing.bathrooms || 1,
            houseRules: [],
            cancellationPolicy: "Standard",
            location: listing.address || "Thessaloniki Center",
            pricePerNightBase: listing.base_rate || 100,
            cleaningFee: listing.cleaning_fee || 30,
            climateCrisisTax: 1.5
          };
          createdCount++;
        }

        // Perform Upsert
        await cmsService.updateProperty(propertyToUpsert);
      }

      return { updated: updatedCount, created: createdCount };

    } catch (error: any) {
      console.error("Sync Logic Error:", error);
      throw new Error(`Sync Failed: ${error.message}`);
    }
  },

  saveSettings: async (state: CMSState) => {
    const { error } = await supabase
      .from('settings')
      .upsert({
        id: 1, 
        brand_name: state.brandName,
        stripe_public_key: state.stripePublicKey,
        hosthub_api_key: state.hosthubApiKey,
        mydata_user_id: state.mydataUserId,
        mydata_api_key: state.mydataApiKey,
        vat_number: state.vatNumber,
        updated_at: new Date().toISOString()
      });

    if (error) throw new Error(`Settings Save Failed: ${error.message}`);
  },

  fetchBookings: async (): Promise<RealBooking[]> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];

    return data.map((b: any) => ({
      id: b.id,
      propertyId: b.property_id,
      propertyName: b.property_name,
      checkIn: b.check_in,
      checkOut: b.check_out,
      amount: b.amount,
      status: b.status as BookingStatus,
      guestEmail: b.guest_email,
      createdAt: b.created_at,
      transactionId: b.transaction_id
    }));
  },

  addBooking: async (booking: RealBooking) => {
    const { error } = await supabase
      .from('bookings')
      .insert({
        id: booking.id,
        property_id: booking.propertyId,
        property_name: booking.propertyName,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        amount: booking.amount,
        status: booking.status,
        guest_email: booking.guestEmail,
        transaction_id: booking.transactionId,
        created_at: booking.createdAt
      });

    if (error) throw new Error(`Booking Error: ${error.message}`);
  },
  
  getInitialState: (): CMSState => {
    return {
      properties: INITIAL_PROPERTIES,
      brandName: "TOWER 15 Suites",
      stripePublicKey: "",
      hosthubApiKey: ""
    };
  }
};
