// scripts/save-status.js
window.dfsSaveStatus = (function(){
  function bind(elId){
    const el = document.getElementById(elId);
    function set(state){
      if(!el) return;
      let text = '—';
      if(state==='dirty') text='Ungespeichert';
      else if(state==='saving') text='Speichert…';
      else if(state==='saved') text='Gespeichert';
      else if(state==='error') text='Fehler';
      el.textContent = text;
      if(state==='saved'){
        setTimeout(()=>{ try{ if(el.textContent==='Gespeichert') el.textContent='—'; }catch{} }, 3000);
      }
    }
    return { set };
  }
  return { bind };
})();

