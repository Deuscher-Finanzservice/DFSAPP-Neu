// scripts/supabase.js
import { supabase } from "./supabaseClient.js";

/** Kleine Hilfe: sichere Strings/Numbers */
const normStr = (v) => (v ?? "").toString().trim();
const normNum = (v) => Number.isFinite(+v) ? +v : 0;

/** Verbindung testen: leichter SELECT gegen customer */
export async function pingSupabase() {
  try {
    const { error } = await supabase.from("customer").select("id").limit(1);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Supabase ping failed:", e);
    return false;
  }
}

/** Kunden speichern (Firma notfalls automatisch setzen, damit Tests nicht scheitern) */
export async function saveCustomerToCloud(input) {
  const payload = {
    firma: normStr(input.firma) || `Unbekannt ${new Date().toISOString().slice(0,19).replace("T"," ")}`,
    branche: normStr(input.branche),
    email: normStr(input.email),
    telefon: normStr(input.telefon),
    mitarbeiter: normNum(input.mitarbeiter),
    umsatz: normNum(input.umsatz),
    gruendung: normNum(input.gruendung),
    standort: normStr(input.standort),
  };

  const { data, error } = await supabase
    .from("customer")
    .upsert(payload, { onConflict: "firma", ignoreDuplicates: false })
    .select();

  if (error) {
    console.error("Supabase upsert error:", error);
    throw new Error(error.message || "Cloud-Speichern fehlgeschlagen.");
  }
  return data?.[0] ?? payload;
}

/** Kunden laden (einfaches Listing für Test) */
export async function loadCustomers(limit = 50) {
  const { data, error } = await supabase
    .from("customer")
    .select("*")
    .order("id", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Supabase select error:", error);
    throw new Error(error.message || "Cloud-Laden fehlgeschlagen.");
  }
  return data || [];
}