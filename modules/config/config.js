(function(){
  const status = (window.dfsSaveStatus? dfsSaveStatus.bind('save-status-config','save-meta-config') : {set:()=>{}});
  async function load(){
    const cfg = (window.dfsStore && dfsStore.get) ? dfsStore.get('dfs.config.print', {
      logos: ["./assets/logo.png"],
      headerText: "DFS Versicherungsanalyse",
      footerText: "DFSAPP – Deutscher Finanzservice"
    }) : { logos: ["./assets/logo.png"], headerText: "DFS Versicherungsanalyse", footerText: "DFSAPP – Deutscher Finanzservice" };
    document.getElementById('cfg-logos').value = (cfg.logos||[]).join(', ');
    document.getElementById('cfg-header').value = cfg.headerText||'';
    document.getElementById('cfg-footer').value = cfg.footerText||'';

    let saveCfg = null;
    try{ saveCfg = await dfsCloud.loadOne('dfs.config','default'); }catch{}
    if(!saveCfg) saveCfg = { autoSaveMode:'immediate', autoSaveInterval:10, cloudSync:true };
    const modeEl = document.getElementById('cfg-autosave');
    const intEl = document.getElementById('cfg-interval');
    const csEl  = document.getElementById('cfg-cloudsync');
    if(modeEl) modeEl.value = saveCfg.autoSaveMode;
    if(intEl) intEl.value = saveCfg.autoSaveInterval;
    if(csEl) csEl.checked = !!saveCfg.cloudSync;
  }

  function save(){
    status.set('saving',{withSpinnerOn:'#cfg-save'});
    const logos = document.getElementById('cfg-logos').value.split(',').map(s=>s.trim()).filter(Boolean);
    const headerText = document.getElementById('cfg-header').value.trim();
    const footerText = document.getElementById('cfg-footer').value.trim();
    const cfg = { logos, headerText, footerText };
    if(window.dfsStore && dfsStore.set){ dfsStore.set('dfs.config.print', cfg); }
    else { localStorage.setItem('dfs.config.print', JSON.stringify(cfg)); }

    let saveCfg = {
      autoSaveMode: (document.getElementById('cfg-autosave')?.value)||'immediate',
      autoSaveInterval: Number(document.getElementById('cfg-interval')?.value||10),
      cloudSync: !!(document.getElementById('cfg-cloudsync')?.checked)
    };
    saveCfg.autoSaveInterval = Math.min(120, Math.max(2, Number(saveCfg.autoSaveInterval||10)));
    (async ()=>{ try{ await dfsCloud.save('dfs.config', { id:'default', ...saveCfg }); status.set('saved',{withSpinnerOn:'#cfg-save'}); dfsToast&&dfsToast('Konfiguration gespeichert','success'); }catch(e){ console.error(e); status.set('error',{withSpinnerOn:'#cfg-save'}); dfsToast&&dfsToast('Cloud-Speichern fehlgeschlagen','error'); } })();

    try{ dfsToast('Konfiguration gespeichert.','success'); }catch{}
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    load();
    document.getElementById('cfg-save').addEventListener('click', save);
  });
})();
