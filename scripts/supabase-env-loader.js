;(async () => {
  try {
    const res = await fetch('/.netlify/functions/public-config', { cache: 'no-store' });
    if (!res.ok) return;
    const cfg = await res.json();
    if (cfg && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
      localStorage.setItem('dfs.supabase.url', cfg.SUPABASE_URL);
      localStorage.setItem('dfs.supabase.key', cfg.SUPABASE_ANON_KEY);
      console.log('[DFS] Supabase config loaded from Netlify env.');
    }
  } catch (e) {
    console.warn('[DFS] Could not load Netlify env; falling back to manual keys.', e);
  }
})();