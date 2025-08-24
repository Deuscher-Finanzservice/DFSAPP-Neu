
// Lightweight Supabase connector (no build).
// Reads keys from localStorage: dfs.supabase.url, dfs.supabase.key
// Provides DFS.sb client and helper methods.
;(async function(){
  const url = localStorage.getItem('dfs.supabase.url');
  const key = localStorage.getItem('dfs.supabase.key');
  // load sdk
  const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  const createClient = mod.createClient;
  if(url && key){
    window.DFS = window.DFS || {};
    window.DFS.sb = createClient(url, key);
  }
  window.DFS = window.DFS || {};
  window.DFS.setSupabaseKeys = function(u,k){
    localStorage.setItem('dfs.supabase.url', u);
    localStorage.setItem('dfs.supabase.key', k);
    location.reload();
  }
  window.DFS.hasSupabase = ()=> !!window.DFS.sb;
})();
