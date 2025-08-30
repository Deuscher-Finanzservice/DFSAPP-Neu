// scripts/io.js
(function(){
  function download(filename, text){
    const blob = new Blob([text], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  }

  function exportJson(key, filename){
    try {
      const data = (window.dfsStore && window.dfsStore.get) ? window.dfsStore.get(key, []) : JSON.parse(localStorage.getItem(key)||'[]');
      download(filename, JSON.stringify(data, null, 2));
      try{ if(window.dfsToast) dfsToast(`Export erfolgreich: ${filename}`, 'success'); }catch{}
    } catch(e){
      console.error(e);
      try{ if(window.dfsToast) dfsToast(`Export fehlgeschlagen: ${filename}`, 'error'); }catch{}
    }
  }

  function importJson(key, file){
    if(!file){ try{ if(window.dfsToast) dfsToast('Keine Datei gewählt.', 'error'); }catch{} return; }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        if(!Array.isArray(parsed)){
          try{ if(window.dfsToast) dfsToast('Import abgebrochen: JSON ist kein Array.', 'error'); }catch{}
          return;
        }
        const ok = (window.dfsStore && window.dfsStore.set) ? window.dfsStore.set(key, parsed) : (localStorage.setItem(key, JSON.stringify(parsed)), true);
        if(ok){
          try{ if(window.dfsToast) dfsToast(`Import erfolgreich (${parsed.length} Einträge).`, 'success'); }catch{}
          // Trigger UI updates where listeners exist
          if(key==='dfs.contracts'){
            try{ window.dispatchEvent(new Event('dfs.contracts-changed')); }catch{}
          }
        }
      } catch(err){
        console.error(err);
        try{ if(window.dfsToast) dfsToast('Fehler beim JSON-Import.', 'error'); }catch{}
      }
    };
    reader.readAsText(file);
  }

  window.dfsIO = { exportJson, importJson };
})();

