
import { createClient } from '@supabase/supabase-js';

// ΣΗΜΕΙΩΣΗ: Σε παραγωγικό περιβάλλον, αυτά θα πρέπει να είναι σε .env αρχείο.
// Για την άμεση ενεργοποίηση που ζητήσατε, τα ενσωματώνουμε εδώ.
const SUPABASE_URL = 'https://wvozewbbahewhiqojxbl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2b3pld2JiYWhld2hpcW9qeGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjQ1NzgsImV4cCI6MjA4NjQwMDU3OH0.-XonBJCeqzhBKygezPgT7v09lIe6AXnaWAUy5Mjyi-w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
