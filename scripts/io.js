// scripts/io.js
(function(){
  function download(filename, text){
    const blob = new Blob([text], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  }

  async function exportJson(key, filename){
    try {
      const data = await (window.dfsCloud && dfsCloud.loadAll ? dfsCloud.loadAll(key) : Promise.resolve([]));
      download(filename, JSON.stringify(Array.isArray(data)?data:[], null, 2));
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
        if(Array.isArray(parsed)){
          (async ()=>{
            for(const obj of parsed){ try{ await (window.dfsCloud && dfsCloud.save ? dfsCloud.save(key,obj) : Promise.resolve()); }catch(e){ console.error('Import save error', e); } }
            try{ if(window.dfsToast) dfsToast(`Import erfolgreich (${parsed.length} Einträge).`, 'success'); }catch{}
          })();
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
