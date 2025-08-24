// Lädt die Netlify-ENV-Werte und legt sie in localStorage ab
;(async () => {
  try {
    const r = await fetch('/.netlify/functions/public-config', { cache: 'no-store' });
    if (!r.ok) throw new Error('request failed');
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = await r.json();

    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      localStorage.setItem('dfs.supabase.url', SUPABASE_URL);
      localStorage.setItem('dfs.supabase.key', SUPABASE_ANON_KEY);
      console.log('[DFS] Supabase config loaded from Netlify env');
    } else {
      console.warn('[DFS] Missing env values; fallback = manueller Connect');
    }
  } catch (e) {
    console.warn('[DFS] Could not load Netlify env', e);
  }
})();