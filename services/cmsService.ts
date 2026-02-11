
import { Property, CMSState, RealBooking, BookingStatus } from '../types';
import { INITIAL_PROPERTIES } from '../constants';
import { supabase } from './supabase';

// Helper to map DB snake_case to TS camelCase
const mapPropertyFromDB = (row: any): Property => ({
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
  images: row.images || [],
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
});

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

export const cmsService = {
  // Φόρτωση όλων των δεδομένων από Supabase
  loadContent: async (): Promise<CMSState> => {
    try {
      // 1. Load Properties
      const { data: propsData, error: propsError } = await supabase
        .from('properties')
        .select('*');

      if (propsError) throw propsError;

      let properties: Property[] = [];
      
      // Bootstrap: Αν η βάση είναι άδεια, ανέβασε τα αρχικά δεδομένα
      if (!propsData || propsData.length === 0) {
        console.log("Database empty. Bootstrapping initial properties...");
        const initialRows = INITIAL_PROPERTIES.map(mapPropertyToDB);
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
    const dbRow = mapPropertyToDB(property);
    const { error } = await supabase
      .from('properties')
      .upsert(dbRow)
      .eq('id', property.id);
    
    if (error) throw new Error(`Αποτυχία αποθήκευσης: ${error.message}`);
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
      brandName: "Loading...",
      stripePublicKey: "",
      hosthubApiKey: ""
    };
  }
};
