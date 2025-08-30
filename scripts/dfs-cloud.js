// scripts/dfs-cloud.js
// Hardened cloud API: structured save/load helpers without local fallbacks
(function(){
  // Centralized collection names
  window.DFS_COLLECTIONS = window.DFS_COLLECTIONS || {
    customers: 'dfs.customers',
    contracts: 'dfs.contracts',
    diag: '__diagnostic.ping'
  };
  function sanitizeForFirestore(input){
    if(input === undefined) return null;
    if(input === null) return null;
    const t = typeof input;
    if(t==='number' && !Number.isFinite(input)) return null;
    if(t==='bigint' || t==='function' || t==='symbol') return null;
    if(Array.isArray(input)) return input.map(v=> sanitizeForFirestore(v));
    if(t==='object'){
      const out={};
      for(const [k,v] of Object.entries(input)) out[k]=sanitizeForFirestore(v);
      return out;
    }
    return input; // string/boolean/finite number
  }
  async function saveOne(collection, id, data){
    try{
      const obj = { ...(data||{}) };
      if(!obj.id) obj.id = id || (crypto.randomUUID? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      const now = new Date().toISOString();
      if(!obj.createdAt) obj.createdAt = now;
      obj.updatedAt = now;
      // normalize known numeric fields if present
      if(obj.mitarbeiter != null) obj.mitarbeiter = Number(obj.mitarbeiter);
      if(obj.umsatz != null) obj.umsatz = Number(obj.umsatz);
      if(obj.gruendung != null) obj.gruendung = Number(obj.gruendung);
      const clean = sanitizeForFirestore(obj);
      if(!(window.dfsCloud && window.dfsCloud.save)) throw new Error('dfsCloud.save unavailable');
      const ok = await window.dfsCloud.save(collection, clean);
      if(!ok) return { ok:false, code:'unknown', message:'save returned false', id: obj.id };
      return { ok:true, id: obj.id };
    }catch(e){
      try{ window.dfs?.captureFsError?.(e, { fn:'saveOne', collection, id }); }catch{}
      const code = e?.code || (e?.message?.includes('permission') ? 'permission-denied' : 'unknown');
      const message = e?.message || (()=>{ try{ return JSON.stringify(e); }catch{ return String(e||'error'); } })();
      console.error('[DFS] saveOne error', { collection, id, code, message });
      return { ok:false, code, message, id };
    }
  }
  async function loadAll(collection){
    try{
      if(!(window.dfsCloud && window.dfsCloud.loadAll)) throw new Error('dfsCloud.loadAll unavailable');
      const arr = await window.dfsCloud.loadAll(collection);
      return Array.isArray(arr) ? arr : [];
    }catch(e){ console.error('[DFS] loadAll error', e); return []; }
  }
  window.dfsCloud = window.dfsCloud || {};
  window.dfsCloud.saveOne = window.dfsCloud.saveOne || saveOne;
  window.dfsCloud.loadAll = window.dfsCloud.loadAll || loadAll;
})();
