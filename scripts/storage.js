// scripts/storage.js
window.dfsStore = (function(){
  function get(key, fallback){
    try{ const raw = localStorage.getItem(key); if(raw==null) return fallback; return JSON.parse(raw); }
    catch(e){ console.warn('dfsStore.get error', e); return fallback; }
  }
  function set(key, val){
    try{
      localStorage.setItem(key, JSON.stringify(val));
      if(Array.isArray(val)){
        const saveCfg = (typeof window!=='undefined' && window.dfsStore && dfsStore.get)? dfsStore.get('dfs.config.save',{cloudSync:true}) : {cloudSync:true};
        if(saveCfg.cloudSync){
          val.forEach(o=>{ try{ if(o && o.id) syncWithCloud(key,o); }catch(e){} });
        }
      }
      return true;
    }
    catch(e){ console.warn('dfsStore.set error', e); try{ if(window.dfsToast) dfsToast('Speicherlimit erreicht! Bitte Daten exportieren.', 'error', 4000); }catch{} return false; }
  }
  function remove(key){
    try{ localStorage.removeItem(key); return true; }
    catch(e){ console.warn('dfsStore.remove error', e); return false; }
  }
  async function syncFromCloud(key){
    try{
      if(!(window.dfsCloud && typeof window.dfsCloud.loadAll==='function')) return [];
      const list = await window.dfsCloud.loadAll(key);
      if(Array.isArray(list) && list.length){ localStorage.setItem(key, JSON.stringify(list)); }
      return Array.isArray(list)?list:[];
    }catch(e){ console.warn('dfsStore.syncFromCloud error', e); return []; }
  }
  return { get, set, remove, syncFromCloud };
})();

// --- Offline Sync Queue ---
async function syncWithCloud(key,obj){
  try{
    if(!(window.dfsCloud && typeof window.dfsCloud.save==='function')) throw new Error('dfsCloud unavailable');
    const ok = await window.dfsCloud.save(key,obj);
    if(!ok) throw new Error('cloud save failed');
  }catch(e){
    console.warn('Sync fehlgeschlagen → Queue', e);
    queueSync(key,obj);
    try{ if(window.dfsToast) dfsToast('Offline gespeichert – Sync folgt später','error',4000); }catch{}
  }
}
function queueSync(key,obj){
  try{
    const q = JSON.parse(localStorage.getItem('dfs.syncQueue')||'[]');
    const idKey = `${key}:${obj?.id||''}`;
    const idx = q.findIndex(it=> it && it.idKey===idKey);
    const item = {key,obj,idKey,ts:new Date().toISOString()};
    if(idx>=0) q[idx]=item; else q.push(item);
    localStorage.setItem('dfs.syncQueue', JSON.stringify(q));
  }catch(e){ console.warn('queueSync error', e); }
}
window.dfsSync = window.dfsSync || {
  async processQueue(){
    try{
      let q = JSON.parse(localStorage.getItem('dfs.syncQueue')||'[]');
      if(!Array.isArray(q) || q.length===0) return;
      const remaining=[];
      for(const item of q){
        try{
          if(!(window.dfsCloud && typeof window.dfsCloud.save==='function')) throw new Error('dfsCloud unavailable');
          const ok = await window.dfsCloud.save(item.key,item.obj);
          if(!ok) throw new Error('fail');
        }catch(e){ remaining.push(item); }
      }
      if(remaining.length){
        localStorage.setItem('dfs.syncQueue', JSON.stringify(remaining));
        console.warn('Noch offen in Queue:', remaining.length);
      } else {
        localStorage.removeItem('dfs.syncQueue');
        try{ if(window.dfsToast) dfsToast('Alle Offline-Änderungen synchronisiert','success'); }catch{}
      }
    }catch(e){ console.warn('processQueue error', e); }
  }
};
