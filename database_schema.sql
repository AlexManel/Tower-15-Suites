
-- SQL Kώδικας για το TOWER 15 Suites
-- Τρέξτε αυτό το script στο SQL Editor της Supabase ή της PostgreSQL βάσης σας.

-- 1. ΠΙΝΑΚΑΣ ΑΚΙΝΗΤΩΝ (PROPERTIES)
-- Αποθηκεύει όλα τα δεδομένα των δωματίων
CREATE TABLE IF NOT EXISTS public.properties (
    id text PRIMARY KEY, -- Χρησιμοποιούμε text για να κρατήσουμε τα IDs τύπου "t15-01"
    hosthub_listing_id text,
    title text NOT NULL,
    title_el text, -- Greek
    category text, 
    category_el text, -- Greek
    description text,
    description_el text, -- Greek
    short_description text,
    short_description_el text, -- Greek
    images text[], 
    amenities text[],
    amenities_el text[], -- Greek
    capacity integer DEFAULT 2,
    bedrooms integer DEFAULT 1,
    bathrooms integer DEFAULT 1,
    house_rules text[],
    cancellation_policy text,
    location text DEFAULT 'Thessaloniki Center',
    price_per_night_base integer DEFAULT 100,
    cleaning_fee integer DEFAULT 30,
    climate_crisis_tax decimal(10,2) DEFAULT 1.5,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ενεργοποίηση Row Level Security (RLS) - Προαιρετικό για αρχή
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Πολιτική: Όλοι μπορούν να βλέπουν (Select) τα ακίνητα
CREATE POLICY "Public properties are viewable by everyone" 
ON public.properties FOR SELECT 
USING (true);

-- Πολιτική: Μόνο ο Admin μπορεί να αλλάζει (Insert/Update/Delete)
CREATE POLICY "Enable insert for authenticated users only" 
ON public.properties FOR INSERT 
WITH CHECK (true); 

CREATE POLICY "Enable update for users based on email" 
ON public.properties FOR UPDATE 
USING (true);

-- 2. ΠΙΝΑΚΑΣ ΚΡΑΤΗΣΕΩΝ (BOOKINGS)
CREATE TABLE IF NOT EXISTS public.bookings (
    id text PRIMARY KEY,
    property_id text REFERENCES public.properties(id),
    property_name text,
    check_in date NOT NULL,
    check_out date NOT NULL,
    amount decimal(10,2) NOT NULL,
    status text CHECK (status IN ('PENDING', 'PAID', 'CONFIRMED', 'FAILED')),
    guest_email text NOT NULL,
    transaction_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for everyone" 
ON public.bookings FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable select for everyone" 
ON public.bookings FOR SELECT 
USING (true);

-- 3. ΠΙΝΑΚΑΣ ΡΥΘΜΙΣΕΩΝ (SETTINGS)
CREATE TABLE IF NOT EXISTS public.settings (
    id integer PRIMARY KEY DEFAULT 1,
    brand_name text DEFAULT 'TOWER 15 Suites',
    stripe_public_key text,
    hosthub_api_key text,
    mydata_user_id text,
    mydata_api_key text,
    vat_number text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT single_row_const CHECK (id = 1) 
);

INSERT INTO public.settings (id, brand_name)
VALUES (1, 'TOWER 15 Suites')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable access to all users" 
ON public.settings FOR ALL 
USING (true);

-- MIGRATION COMMANDS (Run these to fix "Legacy Save Failed" errors)
-- Ensure all missing columns are added if they don't exist
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS cleaning_fee integer DEFAULT 30;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS climate_crisis_tax decimal(10,2) DEFAULT 1.5;

-- Localization Columns
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS title_el text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS category_el text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS description_el text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS short_description_el text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS amenities_el text[];
