// scripts/ui.js
window.dfsUI = (function(){
  function ensureModalRoot(){
    if(document.getElementById('dfs-modal-root')) return;
    const root = document.createElement('div');
    root.id = 'dfs-modal-root';
    root.className = 'modal-backdrop';
    root.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <h3 id="dfs-modal-title"></h3>
        <p id="dfs-modal-text" class="hint"></p>
        <label style="display:flex;gap:8px;align-items:center;margin-top:8px;">
          <input type="checkbox" id="dfs-modal-check">
          <span id="dfs-modal-checktext">Ja, ich will löschen.</span>
        </label>
        <div class="modal-actions">
          <button class="btn-ghost" id="dfs-modal-cancel">Abbrechen</button>
          <button class="btn btn-primary" id="dfs-modal-ok" disabled>Endgültig löschen</button>
        </div>
      </div>`;
    document.body.appendChild(root);
    const chk = root.querySelector('#dfs-modal-check');
    const ok  = root.querySelector('#dfs-modal-ok');
    chk.addEventListener('change', ()=> ok.disabled = !chk.checked);
    root.querySelector('#dfs-modal-cancel').addEventListener('click', hide);
    root.addEventListener('click', (e)=>{ if(e.target===root) hide(); });
  }
  function show({title,text,checkText,onOk}){
    ensureModalRoot();
    const root = document.getElementById('dfs-modal-root');
    root.querySelector('#dfs-modal-title').textContent = title || 'Löschen bestätigen';
    root.querySelector('#dfs-modal-text').textContent  = text  || 'Diese Aktion kann nicht rückgängig gemacht werden.';
    root.querySelector('#dfs-modal-check').checked = false;
    const ok = root.querySelector('#dfs-modal-ok');
    ok.disabled = true;
    root.querySelector('#dfs-modal-checktext').textContent = checkText || 'Ja, ich will löschen.';
    ok.onclick = ()=>{ hide(); onOk && onOk(); };
    root.classList.add('show');
  }
  function hide(){ const root = document.getElementById('dfs-modal-root'); if(root) root.classList.remove('show'); }
  return { show, hide };
})();

// Online/Offline banner (global)
(function(){
  let el = document.getElementById('net-status');
  if(!el){
    el = document.createElement('div');
    el.id = 'net-status';
    el.style.cssText = 'position:fixed;bottom:12px;right:12px;padding:6px 10px;border-radius:8px;background:#D97706;color:#041018;font-size:12px;z-index:9999;display:none';
    el.textContent = 'Offline – Daten werden später synchronisiert';
    document.body.appendChild(el);
  }
  function render(){ el.style.display = navigator.onLine ? 'none' : 'block'; }
  window.addEventListener('online', render);
  window.addEventListener('offline', render);
  render();
})();
