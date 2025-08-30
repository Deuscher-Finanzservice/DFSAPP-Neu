// scripts/storage.js
window.dfsStore = (function(){
  function get(key, fallback){
    try{ const raw = localStorage.getItem(key); if(raw==null) return fallback; return JSON.parse(raw); }
    catch(e){ console.warn('dfsStore.get error', e); return fallback; }
  }
  function set(key, val){
    try{
      localStorage.setItem(key, JSON.stringify(val));
      if(Array.isArray(val) && window.dfsCloud && typeof window.dfsCloud.save==='function'){
        val.forEach(o=>{ try{ if(o && o.id) window.dfsCloud.save(key,o); }catch(e){} });
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
