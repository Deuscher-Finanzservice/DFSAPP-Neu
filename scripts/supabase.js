// scripts/supabase.js
import { supabase } from './supabaseClient.js';

/** Customer + (optional) Contract speichern */
export async function saveCustomerToCloud(payload) {
  // payload = { firma, branche, email, telefon, mitarbeiter, umsatz, gruendung, standort }
  const { data, error } = await supabase
    .from('customer')
    .insert([payload])
    .select('id,firma')
    .single();

  if (error) throw error;
  return data; // { id, firma }
}

/** Kunden + Verträge gemeinsam laden (View) */
export async function loadCustomerContractDetails() {
  // View, die wir gerade angelegt haben:
  const { data, error } = await supabase
    .from('customer_contract_details')
    .select('*')
    .limit(100);

  if (error) throw error;
  return data;
}

/** Nur Kunden-Tabelle laden (falls du erst mal Basis willst) */
export async function loadCustomers() {
  const { data, error } = await supabase
    .from('customer')
    .select('*')
    .order('firma', { ascending: true })
    .limit(100);

  if (error) throw error;
  return data;
}