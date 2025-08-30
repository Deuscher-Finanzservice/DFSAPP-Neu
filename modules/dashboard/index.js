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

// remove localStorage-based contracts helpers; use cloud-only loaders

// Tabs 90/60/30 cloud-only widget
async function renderUpcomingWindow(days){
  const sumEl = document.getElementById('upcoming-sum');
  const listEl = document.getElementById('upcoming-list');
  const focusEl = document.getElementById('upcoming-focus');
  if(sumEl) sumEl.textContent = 'Zu sichernde Jahresbeiträge: Lade…';
  if(listEl) listEl.innerHTML = '<p class="text-secondary">Lade…</p>';
  if(focusEl) focusEl.innerHTML = '';
  try{
    const [contracts, customers] = await Promise.all([
      (window.dfsDataContracts?.loadAllContracts
        ? window.dfsDataContracts.loadAllContracts()
        : (window.dfsData?.getAllContracts ? window.dfsData.getAllContracts() : Promise.resolve([]))),
      (window.dfsDataCustomers?.loadAllCustomers
        ? window.dfsDataCustomers.loadAllCustomers()
        : (window.dfsData?.getAllCustomers ? window.dfsData.getAllCustomers() : Promise.resolve([])))
    ]);
    const now = new Date();
    const withinDays = (iso, d)=>{ if(!iso) return false; const dt=new Date(iso); if(isNaN(dt)) return false; const diff=(dt-now)/(1000*60*60*24); return diff>=0 && diff<=d; };
    const items = (contracts||[]).filter(c=> withinDays(c.reminderDate, Number(days))).sort((a,b)=> new Date(a.reminderDate)-new Date(b.reminderDate));
    const sum = items.reduce((a,c)=> a + (window.dfsFmt?.parseDE(c.jahresbeitragBrutto)||0), 0);
    if(sumEl) sumEl.textContent = `Zu sichernde Jahresbeiträge: ${window.dfsFmt? dfsFmt.fmtEUR(sum): String(sum)}`;
    const custById = new Map((customers||[]).map(x=>[x.id, x]));
    if(listEl){
      if(items.length===0){ listEl.innerHTML = '<p class="text-secondary">Keine Reminder im ausgewählten Zeitraum.</p>'; }
      else{
        listEl.innerHTML = items.map(c=>{
          const cust = custById.get(c.customerId||'');
          const name = cust?.firma || '—';
          const dt = window.dfsFmt?.fmtDateDE(c.reminderDate)||c.reminderDate||'—';
          const prem = window.dfsFmt? dfsFmt.fmtEUR(c.jahresbeitragBrutto||0) : String(c.jahresbeitragBrutto||0);
          return `<div class="doc-row"><div>${c.versicherer||'—'} · <span class="text-secondary">${c.policeNr||'—'}</span><br><small class="text-secondary">${name}</small></div><div style="text-align:right">${dt}<br><strong>${prem}</strong></div></div>`;
        }).join('');
      }
    }
    if(focusEl){
      const agg = new Map();
      for(const c of items){ const id=c.customerId||''; const cust=custById.get(id); const name=cust?.firma||'—'; const val=(window.dfsFmt?.parseDE(c.jahresbeitragBrutto)||0); const cur=agg.get(id)||{name,count:0,sum:0}; cur.count+=1; cur.sum+=val; cur.name=name; agg.set(id,cur); }
      const top = Array.from(agg.values()).sort((a,b)=> b.sum-a.sum).slice(0,10);
      focusEl.innerHTML = top.length? top.map(r=>`<tr><td>${r.name}</td><td>${r.count}</td><td style="text-align:right">${window.dfsFmt? dfsFmt.fmtEUR(r.sum): String(r.sum)}</td></tr>`).join('') : '<tr><td colspan="3" class="text-secondary">Keine Daten</td></tr>';
    }
  }catch(e){ console.error(e); if(listEl) listEl.innerHTML='<p class="text-secondary">Fehler beim Laden</p>'; }
}

document.addEventListener('DOMContentLoaded', async ()=>{
  try{
    if(window.dfsFirebase && dfsFirebase.healthcheck){
      const hc = await dfsFirebase.healthcheck();
      if(window.dfsDebug){
        if(hc.ok) window.dfsDebug.log('info','healthcheck ok');
        else window.dfsDebug.log('error','healthcheck failed', hc);
      }
    }
  }catch{}
  const tabs = document.querySelectorAll('#upcoming-tabs [data-window]');
  tabs.forEach(btn=> btn.addEventListener('click', ()=>{ tabs.forEach(b=>b.classList.remove('active')); btn.classList.add('active'); renderUpcomingWindow(Number(btn.dataset.window)); }));
  const first = document.querySelector('#upcoming-tabs [data-window="90"]'); if(first){ first.classList.add('active'); }
  await renderUpcomingWindow(90);
});
// contracts changes: refresh cloud-only widgets
window.addEventListener('dfs.contracts-changed', ()=>renderUpcomingWindow(90));
window.addEventListener('storage', (e)=>{ if(e && e.key==='dfs.contracts') renderUpcomingWindow(90); });

// === KPI Summe (EUR) — cloud-only handled below (renderKpisCloudFirst)

// === Analyse-Ergebnisse (KPI, Warnungen, Empfehlungen) ===
async function renderAnalysisOnDashboard(){
  try{
    const kpiBox = document.getElementById('analysis-kpis-dash');
    const warnBox = document.getElementById('analysis-warnings-dash');
    const recoBox = document.getElementById('analysis-recos-dash');
    if(kpiBox) kpiBox.innerHTML = '<p class="text-secondary">Lade…</p>';
    let res = null;
    try{ const snap = await (window.dfsCloud && dfsCloud.loadOne ? dfsCloud.loadOne('dfs.analysis','latest') : Promise.resolve(null)); if(snap){ res=snap; if(window.dfsStore&&dfsStore.set) dfsStore.set('dfs.analysis', snap); } }catch{}
    if(!res){ res = (window.dfsStore && dfsStore.get) ? dfsStore.get('dfs.analysis', null) : JSON.parse(localStorage.getItem('dfs.analysis')||'null'); }
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
// Recalc global analysis
document.addEventListener('DOMContentLoaded', ()=>{
  const b=document.getElementById('btn-recalc-global');
  if(b && window.dfsAnalysis){
    b.addEventListener('click', async ()=>{
      try{ b.disabled=true; await dfsAnalysis.analyzeGlobal(); await renderAnalysisOnDashboard(); dfsToast&&dfsToast('Analyse aktualisiert','success'); }
      catch(e){ console.error(e); dfsToast&&dfsToast('Analyse-Fehler','error'); }
      finally{ b.disabled=false; }
    });
  }
});

// === Cloud-first counts and KPIs ===
async function renderCounts(){
  try{
    const customers = await (
      window.dfsDataCustomers?.loadAllCustomers
        ? window.dfsDataCustomers.loadAllCustomers()
        : (window.dfsData?.getAllCustomers ? window.dfsData.getAllCustomers() : Promise.resolve([]))
    );
    const contracts = await (
      window.dfsDataContracts?.loadAllContracts
        ? window.dfsDataContracts.loadAllContracts()
        : (window.dfsData?.getAllContracts ? window.dfsData.getAllContracts() : Promise.resolve([]))
    );
    const cEl = document.getElementById('kpi-customers')
            || document.getElementById('nCustomers')
            || document.getElementById('kpi-customers-count');
    const vEl = document.getElementById('kpi-contracts') || document.getElementById('nContracts') || document.getElementById('kpi-contracts-count');
    if(cEl) cEl.textContent = customers.length;
    if(vEl) vEl.textContent = contracts.length;
  }catch(e){ console.error(e); }
}
async function renderKpisCloudFirst(){
  try{
    const contracts = await (
      window.dfsDataContracts?.loadAllContracts
        ? window.dfsDataContracts.loadAllContracts()
        : (window.dfsData&&dfsData.getAllContracts ? dfsData.getAllContracts() : Promise.resolve([]))
    );
    const sum = contracts.reduce((a,c)=> a + (window.dfsFmt?.parseDE(c.jahresbeitragBrutto)||0), 0);
    const el = document.getElementById('kpi-sum-annual'); if(el) el.textContent = window.dfsFmt? window.dfsFmt.fmtEUR(sum) : String(sum);
    const pct = Number(localStorage.getItem('dfs.targetSavingsPct')||0);
    const monthlySaving = (sum - (sum * (1 - pct/100))) / 12;
    const msEl = document.getElementById('kpi-monthly-saving'); if(msEl) msEl.textContent = window.dfsFmt? window.dfsFmt.fmtEUR(monthlySaving) : String(monthlySaving);
  }catch{}
}
document.addEventListener('DOMContentLoaded', ()=>{ renderCounts(); renderKpisCloudFirst(); });
window.addEventListener('dfs.contracts-changed', ()=>{ renderCounts(); renderKpisCloudFirst(); });
