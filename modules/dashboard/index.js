// === Dashboard: Reminder-Liste (≤ 90 Tage) ===
function withinDays(iso, days){
  if(!iso) return false;
  const d = new Date(iso);
  if(isNaN(d.getTime())) return false;
  const now = new Date();
  const diffDays = (d - now) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
}

function fmtDate(iso){
  if(!iso) return '';
  const d = new Date(iso);
  if(isNaN(d.getTime())) return iso;
  const p = n => String(n).padStart(2,'0');
  return `${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()}`;
}

function getContracts(){
  try{
    if(window.dfsStore && typeof window.dfsStore.get === 'function'){
      return window.dfsStore.get('dfs.contracts', []) || [];
    }
  }catch{}
  try{ return JSON.parse(localStorage.getItem('dfs.contracts')||'[]'); }catch{ return []; }
}

function renderUpcoming(){
  const listEl = document.getElementById('upcoming-list');
  if(!listEl) return;

  const contracts = (getContracts() || [])
    .filter(c => c && withinDays(c.reminderDate, 90))
    .sort((a,b)=> new Date(a.reminderDate) - new Date(b.reminderDate));

  if(contracts.length === 0){
    listEl.innerHTML = `<p class="text-secondary">Keine Reminder in den nächsten 90 Tagen.</p>`;
    return;
  }

  listEl.innerHTML = contracts.map(c => `
    <div class="row" style="display:flex;gap:12px;align-items:center;justify-content:space-between;border:1px solid rgba(255,255,255,0.08);padding:10px;border-radius:12px;background:rgba(255,255,255,0.04);">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <span class="chip" style="padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);">${c.versicherer || '—'}</span>
        <span>${(c.produkt || '')}</span>
        <span class="text-secondary">#${c.policeNr || '—'}</span>
      </div>
      <strong style="min-width:110px;text-align:right;color:#C0C0C0;">${fmtDate(c.reminderDate)}</strong>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', renderUpcoming);
window.addEventListener('dfs.contracts-changed', renderUpcoming);
window.addEventListener('storage', (e)=>{ if(e && e.key==='dfs.contracts') renderUpcoming(); });

