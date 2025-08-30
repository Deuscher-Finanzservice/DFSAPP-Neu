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

// === KPI Summe (EUR) ===
function calcAnnualSum(){
  const list = (window.dfsStore?.get('dfs.contracts', []) || JSON.parse(localStorage.getItem('dfs.contracts')||'[]') || []).filter(Boolean);
  const sum = list.reduce((acc, c) => acc + (window.dfsFmt?.parseDE(c.jahresbeitragBrutto) || Number(c.jahresbeitragBrutto)||0), 0);
  return sum;
}
function renderKpis(){
  try{
    const sum = calcAnnualSum();
    const el = document.getElementById('kpi-sum-annual'); if(el) el.textContent = window.dfsFmt? window.dfsFmt.fmtEUR(sum) : String(sum);
    const pct = Number(window.localStorage.getItem('dfs.targetSavingsPct') || 0);
    const monthlySaving = (sum - (sum * (1 - pct/100))) / 12;
    const msEl = document.getElementById('kpi-monthly-saving'); if(msEl) msEl.textContent = window.dfsFmt? window.dfsFmt.fmtEUR(monthlySaving) : String(monthlySaving);
  }catch(e){}
}
document.addEventListener('DOMContentLoaded', renderKpis);
window.addEventListener('dfs.contracts-changed', renderKpis);
window.addEventListener('storage', (e)=>{ if(e && e.key && ['dfs.contracts','dfs.targetSavingsPct'].includes(e.key)) renderKpis(); });

// === Analyse-Ergebnisse (KPI, Warnungen, Empfehlungen) ===
function renderAnalysisOnDashboard(){
  try{
    const res = (window.dfsStore && dfsStore.get) ? dfsStore.get('dfs.analysis', null) : JSON.parse(localStorage.getItem('dfs.analysis')||'null');
    const kpiBox = document.getElementById('analysis-kpis-dash');
    const warnBox = document.getElementById('analysis-warnings-dash');
    const recoBox = document.getElementById('analysis-recos-dash');
    if(!kpiBox || !warnBox || !recoBox) return;
    if(!res){ kpiBox.innerHTML = '<p class="text-secondary">Noch keine Analyse durchgeführt.</p>'; warnBox.innerHTML=''; recoBox.innerHTML=''; return; }
    kpiBox.innerHTML = `
      <div class="card"><div class="label">Summe Jahresbeiträge</div><strong>${window.dfsFmt? dfsFmt.fmtEUR(res.sumAnnual||0): String(res.sumAnnual||0)}</strong></div>
      <div class="card"><div class="label">Einsparziel</div><strong>${res.targetPct??0}%</strong></div>
      <div class="card"><div class="label">Monatliche Ersparnis</div><strong>${window.dfsFmt? dfsFmt.fmtEUR(res.monthlySaving||0): String(res.monthlySaving||0)}</strong></div>
      <div class="card"><div class="label">Risiko-Score</div><strong>${res.riskScore??'–'}/100</strong></div>
    `;
    warnBox.innerHTML = (Array.isArray(res.warnings) && res.warnings.length)
      ? res.warnings.map(w=>`<span class="badge" style="border-color:#D97706;color:#D97706">${w}</span>`).join('')
      : '<p class="text-secondary">Keine Warnungen</p>';
    recoBox.innerHTML = (Array.isArray(res.recommendations) && res.recommendations.length)
      ? res.recommendations.map(r=>`<span class="badge">${r}</span>`).join('')
      : '<p class="text-secondary">Keine Empfehlungen</p>';
  }catch(e){}
}
document.addEventListener('DOMContentLoaded', renderAnalysisOnDashboard);
window.addEventListener('dfs.analysis-changed', renderAnalysisOnDashboard);
window.addEventListener('storage', (e)=>{ if(e && e.key==='dfs.analysis') renderAnalysisOnDashboard(); });

// === Cloud-first counts and KPIs ===
async function renderCounts(){
  try{
    const customers = await (window.dfsData&&dfsData.getAllCustomers ? dfsData.getAllCustomers() : Promise.resolve([]));
    const contracts = await (window.dfsData&&dfsData.getAllContracts ? dfsData.getAllContracts() : Promise.resolve([]));
    const cEl = document.getElementById('nCustomers') || document.getElementById('kpi-customers-count');
    const vEl = document.getElementById('nContracts') || document.getElementById('kpi-contracts-count');
    if(cEl) cEl.textContent = customers.length; if(vEl) vEl.textContent = contracts.length;
  }catch{}
}
async function renderKpisCloudFirst(){
  try{
    const contracts = await (window.dfsData&&dfsData.getAllContracts ? dfsData.getAllContracts() : Promise.resolve([]));
    const sum = contracts.reduce((a,c)=> a + (window.dfsFmt?.parseDE(c.jahresbeitragBrutto)||0), 0);
    const el = document.getElementById('kpi-sum-annual'); if(el) el.textContent = window.dfsFmt? window.dfsFmt.fmtEUR(sum) : String(sum);
    const pct = Number(localStorage.getItem('dfs.targetSavingsPct')||0);
    const monthlySaving = (sum - (sum * (1 - pct/100))) / 12;
    const msEl = document.getElementById('kpi-monthly-saving'); if(msEl) msEl.textContent = window.dfsFmt? window.dfsFmt.fmtEUR(monthlySaving) : String(monthlySaving);
  }catch{}
}
document.addEventListener('DOMContentLoaded', ()=>{ renderCounts(); renderKpisCloudFirst(); });
