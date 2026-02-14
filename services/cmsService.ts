
import { Property, CMSState, RealBooking, BookingStatus } from '../types';
import { INITIAL_PROPERTIES, getImages } from '../constants';
import { supabase } from './supabase';

// Helper to map DB snake_case to TS camelCase
// Improved to handle STALE images from DB by checking if they are local paths and replacing them
const mapPropertyFromDB = (row: any): Property => {
  let images = row.images || [];
  
  // FIX: If images are local paths (from old DB seed), replace with Unsplash deterministic images
  if (images.length === 0 || images.some((img: string) => img.startsWith('/') || img.includes('localhost'))) {
    images = getImages(row.id);
  }

  return {
    id: row.id,
    hosthubListingId: row.hosthub_listing_id || '',
    title: row.title,
    titleEl: row.title_el || row.title, // Fallback
    category: row.category,
    categoryEl: row.category_el || row.category, // Fallback
    description: row.description || '',
    descriptionEl: row.description_el || row.description, // Fallback
    shortDescription: row.short_description || '',
    shortDescriptionEl: row.short_description_el || row.short_description, // Fallback
    images: images,
    amenities: row.amenities || [],
    amenitiesEl: row.amenities_el || row.amenities, // Fallback
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

// Fallback mapper for when the DB schema is old (missing _el columns and new fee columns)
// CRITICAL FIX: Removed cleaning_fee and climate_crisis_tax to prevent crashes on old schemas
const mapPropertyToLegacyDB = (p: Property) => ({
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
});

export const cmsService = {
  // Φόρτωση όλων των δεδομένων από Supabase
  loadContent: async (): Promise<CMSState> => {
    try {
      // 1. Load Properties
      const { data: propsData, error: propsError } = await supabase
        .from('properties')
        .select('*');

      if (propsError) {
         console.warn("DB Load Error (likely schema mismatch or empty), using initial data.");
         return cmsService.getInitialState();
      }

      let properties: Property[] = [];
      
      // Bootstrap: Αν η βάση είναι άδεια, ανέβασε τα αρχικά δεδομένα
      if (!propsData || propsData.length === 0) {
        console.log("Database empty. Bootstrapping initial properties...");
        // Use legacy mapping for bootstrap to avoid crashing on old schemas
        const initialRows = INITIAL_PROPERTIES.map(mapPropertyToLegacyDB);
        const { error: insertError } = await supabase.from('properties').insert(initialRows);
        if (insertError) console.error("Bootstrap failed:", insertError);
        properties = INITIAL_PROPERTIES;
      } else {
        properties = propsData.map(mapPropertyFromDB);
      }

      // 2. Load Settings
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
      console.error("Critical CMS Load Error:", error);
      // Fallback σε local defaults για να μην κρασάρει το site
      return {
        properties: INITIAL_PROPERTIES,
        brandName: 'TOWER 15 Suites (Offline)',
        stripePublicKey: '',
        hosthubApiKey: ''
      };
    }
  },

  updateProperty: async (property: Property) => {
    // Strategy: Try full update first. If schema mismatch, try legacy update.
    
    // 1. Prepare modern payload
    const dbRow = mapPropertyToDB(property);

    try {
      const { error } = await supabase
        .from('properties')
        .upsert(dbRow)
        .eq('id', property.id);

      if (error) throw error;
    } catch (error: any) {
      // Check for schema/column errors
      if (
        error.code === '42703' || // Undefined column
        error.message?.includes('column') || 
        error.message?.includes('cleaning_fee') ||
        error.message?.includes('amenities_el') ||
        error.message?.includes('schema')
      ) {
         console.warn("Schema mismatch detected (missing columns). Falling back to legacy save.");
         
         // 2. Prepare legacy payload (Strictly without new columns)
         const legacyRow = mapPropertyToLegacyDB(property);
         
         const { error: legacyError } = await supabase
            .from('properties')
            .upsert(legacyRow)
            .eq('id', property.id);
            
         if (legacyError) {
           throw new Error(`Legacy Save Failed: ${legacyError.message}`);
         }
         return;
      }
      
      // Re-throw other errors
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

    if (error) throw new Error(`Αποτυχία αποθήκευσης ρυθμίσεων: ${error.message}`);
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

    if (error) throw new Error(`Booking DB Error: ${error.message}`);
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
