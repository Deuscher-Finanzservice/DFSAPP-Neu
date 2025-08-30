// scripts/storage.js
window.dfsStore = (function(){
  function get(key, fallback){
    try{ const raw = localStorage.getItem(key); if(raw==null) return fallback; return JSON.parse(raw); }
    catch(e){ console.warn('dfsStore.get error', e); return fallback; }
  }
  function set(key, val){
    try{ localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch(e){ console.warn('dfsStore.set error', e); try{ if(window.dfsToast) dfsToast('Speicherlimit erreicht! Bitte Daten exportieren.', 'error', 4000); }catch{} return false; }
  }
  function remove(key){
    try{ localStorage.removeItem(key); return true; }
    catch(e){ console.warn('dfsStore.remove error', e); return false; }
  }
  return { get, set, remove };
})();

