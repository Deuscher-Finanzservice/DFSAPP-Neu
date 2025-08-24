// scripts/supabaseClient.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔑 Deine echten Zugangsdaten
const SUPABASE_URL = "https://guzrujufvayujqpwtitx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1enJ1anVmdmF5dWpxcHd0aXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMjY1MzksImV4cCI6MjA3MTYwMjUzOX0.ZQ64MC0Hgaxk6ZIFG-BILfGyULdi1wkgTNDTtZYz14c";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);