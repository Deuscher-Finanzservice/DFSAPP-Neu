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
  }

  function save(){
    const logos = document.getElementById('cfg-logos').value.split(',').map(s=>s.trim()).filter(Boolean);
    const headerText = document.getElementById('cfg-header').value.trim();
    const footerText = document.getElementById('cfg-footer').value.trim();
    const cfg = { logos, headerText, footerText };
    if(window.dfsStore && dfsStore.set){ dfsStore.set('dfs.config.print', cfg); }
    else { localStorage.setItem('dfs.config.print', JSON.stringify(cfg)); }
    try{ dfsToast('Konfiguration gespeichert.','success'); }catch{}
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    load();
    document.getElementById('cfg-save').addEventListener('click', save);
  });
})();

