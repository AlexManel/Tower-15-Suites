
import { Property, CMSState, RealBooking, BookingStatus } from '../types';
import { INITIAL_PROPERTIES, getImages } from '../constants';
import { supabase } from './supabase';

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
      // FIXED: Removed .eq('id', property.id) because upsert works on the primary key in the body
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
         // Note: We use the ID in the URL to target the row.
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
