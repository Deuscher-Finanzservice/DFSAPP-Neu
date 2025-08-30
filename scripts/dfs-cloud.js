// scripts/dfs-cloud.js
// Hardened cloud API: structured save/load helpers without local fallbacks
(function(){
  async function saveOne(collection, id, data){
    try{
      const obj = { ...(data||{}) };
      if(!obj.id) obj.id = id || (crypto.randomUUID? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      const now = new Date().toISOString();
      if(!obj.createdAt) obj.createdAt = now;
      obj.updatedAt = now;
      if(!(window.dfsCloud && window.dfsCloud.save)) throw new Error('dfsCloud.save unavailable');
      const ok = await window.dfsCloud.save(collection, obj);
      if(!ok) return { ok:false, code:'unknown', message:'save returned false', id: obj.id };
      return { ok:true, id: obj.id };
    }catch(e){
      try{ window.dfs?.captureFsError?.(e, { fn:'saveOne', collection, id }); }catch{}
      const code = (e && e.code) ? e.code : (e && e.name) ? e.name : 'error';
      return { ok:false, code, message: (e && e.message) ? e.message : String(e||'error'), id };
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
