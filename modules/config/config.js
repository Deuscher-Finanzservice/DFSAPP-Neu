(function(){
  function load(){
    const cfg = (window.dfsStore && dfsStore.get) ? dfsStore.get('dfs.config.print', {
      logos: ["./assets/logo.png"],
      headerText: "DFS Versicherungsanalyse",
      footerText: "DFSAPP – Deutscher Finanzservice"
    }) : { logos: ["./assets/logo.png"], headerText: "DFS Versicherungsanalyse", footerText: "DFSAPP – Deutscher Finanzservice" };
    document.getElementById('cfg-logos').value = (cfg.logos||[]).join(', ');
    document.getElementById('cfg-header').value = cfg.headerText||'';
    document.getElementById('cfg-footer').value = cfg.footerText||'';

    const saveCfg = (window.dfsStore && dfsStore.get) ? dfsStore.get('dfs.config.save', {
      autoSaveMode: 'immediate', autoSaveInterval: 10, cloudSync: true
    }) : { autoSaveMode: 'immediate', autoSaveInterval: 10, cloudSync: true };
    const modeEl = document.getElementById('cfg-autosave');
    const intEl = document.getElementById('cfg-interval');
    const csEl  = document.getElementById('cfg-cloudsync');
    if(modeEl) modeEl.value = saveCfg.autoSaveMode;
    if(intEl) intEl.value = saveCfg.autoSaveInterval;
    if(csEl) csEl.checked = !!saveCfg.cloudSync;
  }

  function save(){
    const logos = document.getElementById('cfg-logos').value.split(',').map(s=>s.trim()).filter(Boolean);
    const headerText = document.getElementById('cfg-header').value.trim();
    const footerText = document.getElementById('cfg-footer').value.trim();
    const cfg = { logos, headerText, footerText };
    if(window.dfsStore && dfsStore.set){ dfsStore.set('dfs.config.print', cfg); }
    else { localStorage.setItem('dfs.config.print', JSON.stringify(cfg)); }

    const saveCfg = {
      autoSaveMode: (document.getElementById('cfg-autosave')?.value)||'immediate',
      autoSaveInterval: Number(document.getElementById('cfg-interval')?.value||10),
      cloudSync: !!(document.getElementById('cfg-cloudsync')?.checked)
    };
    if(window.dfsStore && dfsStore.set){ dfsStore.set('dfs.config.save', saveCfg); }
    else { localStorage.setItem('dfs.config.save', JSON.stringify(saveCfg)); }

    try{ dfsToast('Konfiguration gespeichert.','success'); }catch{}
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    load();
    document.getElementById('cfg-save').addEventListener('click', save);
  });
})();
