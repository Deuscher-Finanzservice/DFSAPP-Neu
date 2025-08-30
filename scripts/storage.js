// scripts/storage.js
// Global DFS flags
window.dfs = window.dfs || {};
window.dfs.debug = (window.dfs.debug!==undefined)? window.dfs.debug : true; // set to false for production
// Enforce cloud-only to avoid local<->cloud ping-pong for customers/contracts
window.dfs.cloudOnly = true;
window.dfsStore = (function(){
  function get(_key, fallback){ return fallback; }
  function set(_key, _val){ return true; }
  function remove(_key){ return true; }
  async function syncFromCloud(_key){ return []; }
  return { get, set, remove, syncFromCloud };
})();

// --- Offline Sync Queue ---
window.dfsSync = window.dfsSync || { async processQueue(){ /* noop */ } };

// ---- Cloud-first Data Loader + Safe Merge ----
window.dfsData = window.dfsData || {
  async getAllCustomers(){ return safeLoadAll('dfs.customers'); },
  async getAllContracts(){ return safeLoadAll('dfs.contracts'); }
};

async function safeLoadAll(key){
  try{ const arr = await (window.dfsCloud?.loadAll(key)); return Array.isArray(arr)? arr.filter(Boolean) : []; }
  catch{ return []; }
}
