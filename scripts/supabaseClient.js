// scripts/supabaseClient.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Deine echten Supabase-Zugangsdaten
const SUPABASE_URL = "https://guzrujufvayujqpwtix.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_m66OvSIQzzStuvGz4HRQ_G41o_V3i";

// Supabase-Client erstellen
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);