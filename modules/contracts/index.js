const LS_KEY = "dfs.contracts";
let contracts = [];
let sortKey = null; let sortDir = 'asc';
const urlParams = new URLSearchParams(location.search);
const currentCustomerId = urlParams.get('cid') || urlParams.get('customerId') || null;

function readContracts(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    return Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
  }catch{
    return [];
  }
}
function writeContracts(arr){
  try{
    if(window.dfsStore && typeof window.dfsStore.set==='function') window.dfsStore.set(LS_KEY, arr);
    else localStorage.setItem(LS_KEY, JSON.stringify(arr));
  }catch(e){ try{ if(window.dfsToast) dfsToast('Speicherlimit erreicht! Bitte Daten exportieren.','error',4000); }catch{} }
  try{ window.dispatchEvent(new Event('dfs.contracts-changed')); }catch{}
}
function normalizeNumber(str){
  if(typeof str !== 'string') str = String(str||'');
  const s = str.trim().replace(/\./g,'').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? NaN : n;
}
function fmtCurrency(n){
  if(window.dfsFmt && window.dfsFmt.fmtEUR) return window.dfsFmt.fmtEUR(n);
  return (Number(n)||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
}
function linesToArray(s){
  return (s||'').split(',').map(t=>t.trim()).filter(Boolean);
}
function computeEndAndReminder(beginnISO, laufzeitNum){
  if(!beginnISO) return {endDate:'', reminderDate:''};
  const b = new Date(beginnISO+'T00:00:00');
  const end = (window.dfsDate? window.dfsDate.addYears(b, Number(laufzeitNum)||3) : (d=>{const n=new Date(d);n.setFullYear(n.getFullYear()+Number(laufzeitNum)||3);return n;})(b));
  const reminder = (window.dfsDate? window.dfsDate.minusMonths(window.dfsDate.addYears(b,3), 3) : (d=>{const n=new Date(d); n.setFullYear(n.getFullYear()+3); n.setMonth(n.getMonth()-3); return n;})(b));
  const toISO = (window.dfsDate? window.dfsDate.toISO : (d=>{const p=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;}));
  return { endDate: toISO(end), reminderDate: toISO(reminder) };
}
function normalizeToGerman(c){
  if(!c || typeof c !== 'object') return null;
  const id = c.id || (crypto && typeof crypto.randomUUID==='function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const versicherer = c.versicherer ?? c.insurer ?? '';
  const produkt = c.produkt ?? c.product ?? '';
  const policeNr = c.policeNr ?? c.policyNo ?? c.policyNumber ?? c.policy ?? '';
  const sparten = Array.isArray(c.sparten) ? c.sparten : (Array.isArray(c.lines)? c.lines : linesToArray(c.risks || c.lines || ''));
  const beginn = c.beginn ?? c.beginISO ?? c.begin ?? '';
  const zahlweise = c.zahlweise ?? c.payCycle ?? c.paymentFrequency ?? c.pay ?? 'jährlich';
  const jahresbeitragBrutto = Number(c.jahresbeitragBrutto ?? c.premiumYear ?? c.annualPremium ?? c.annual ?? c.premium ?? 0) || 0;
  const deckungssumme = c.deckungssumme ?? c.coverage ?? null;
  const selbstbehalt = c.selbstbehalt ?? c.deductible ?? null;
  const gefahren = Array.isArray(c.gefahren)? c.gefahren : (Array.isArray(c.risks)? c.risks : undefined);
  const hinweiseVertrag = c.hinweiseVertrag ?? c.notes ?? c.hinweise ?? undefined;
  const internVermerk = c.internVermerk ?? c.internal ?? c.vermerk ?? undefined;
  const laufzeit = Number(c.laufzeit ?? 3) || 3;
  let endDate = c.endDate || '';
  let reminderDate = c.reminderDate || '';
  if((!endDate || !reminderDate) && beginn){ const r = computeEndAndReminder(beginn, laufzeit); endDate = r.endDate; reminderDate = r.reminderDate; }
  const createdAt = c.createdAt || new Date().toISOString();
  const updatedAt = c.updatedAt || new Date().toISOString();
  const out = { id, versicherer, produkt, policeNr, sparten, beginn, zahlweise, jahresbeitragBrutto, deckungssumme, selbstbehalt, gefahren, hinweiseVertrag, internVermerk, laufzeit, endDate, reminderDate, createdAt, updatedAt };
  if(c.customerId) out.customerId = c.customerId;
  return out;
}
function calcDates(){
  const beginStr = document.getElementById('begin').value;
  const laufzeit = Number(document.getElementById('laufzeit').value||'3');
  if(!beginStr){ document.getElementById('endDate').value=''; document.getElementById('reminderDate').value=''; return {laufzeit,endDate:'',reminderDate:''}; }
  const b = new Date(beginStr+'T00:00:00');
  const end = window.dfsDate? window.dfsDate.addYears(b, laufzeit) : b;
  const reminder = window.dfsDate? window.dfsDate.minusMonths(window.dfsDate.addYears(b,3), 3) : b;
  const toISO = window.dfsDate? window.dfsDate.toISO : (d=>{const p=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;});
  const endISO = toISO(end);
  const remISO = toISO(reminder);
  document.getElementById('endDate').value = endISO;
  document.getElementById('reminderDate').value = remISO;
  return { laufzeit, endDate: endISO, reminderDate: remISO };
}
function getFilteredSortedContracts(){
  const q = (document.getElementById('contracts-search')?.value||'').toLowerCase();
  let rows = (contracts||[]).filter(Boolean).filter(c=>{
    const hay = ((c.versicherer||'')+' '+(c.produkt||'')).toLowerCase();
    return !q || hay.includes(q);
  });
  if(sortKey){
    rows.sort((a,b)=>{
      if(sortKey==='jahresbeitragBrutto'){
        const na = Number(a.jahresbeitragBrutto||0); const nb = Number(b.jahresbeitragBrutto||0);
        return sortDir==='asc'? (na-nb) : (nb-na);
      }
      const av = (a[sortKey]??'').toString().toLowerCase();
      const bv = (b[sortKey]??'').toString().toLowerCase();
      if(av<bv) return sortDir==='asc'?-1:1; if(av>bv) return sortDir==='asc'?1:-1; return 0;
    });
  }
  return rows;
}
function renderTable(){
  const tbody = document.getElementById('tblBody');
  const rows = getFilteredSortedContracts();
  tbody.innerHTML = rows.map((c,i)=>`<tr>
    <td>${c.versicherer||''}</td>
    <td>${c.policeNr||''}</td>
    <td>${Array.isArray(c.sparten)?c.sparten.join(', '):''}</td>
    <td class="num">${fmtCurrency(c.jahresbeitragBrutto)}</td>
    <td><button data-row="${i}" class="btnDel">Löschen</button></td>
  </tr>`).join('');
  tbody.querySelectorAll('.btnDel').forEach(btn=>btn.addEventListener('click',e=>onDelete(parseInt(btn.dataset.row))));
  const sum = rows.reduce((a,c)=>a+(Number(c.jahresbeitragBrutto)||0),0);
  document.getElementById('sumPremium').textContent = fmtCurrency(sum);
}
function onAdd(){
  const insurer = document.getElementById('insurer').value.trim();
  const policyNo = document.getElementById('policyNo').value.trim();
  const beginISO = document.getElementById('begin').value || "";
  let premIn = document.getElementById('premiumYear').value;
  let premiumYear = (window.dfsFmt? window.dfsFmt.parseDE(premIn) : normalizeNumber(premIn));
  if(!insurer){ try{ window.dfsToast('Bitte Versicherer angeben.','error'); }catch{} return; }
  if(!policyNo){ try{ window.dfsToast('Bitte Policen-Nummer angeben.','error'); }catch{} return; }
  if(!beginISO){ try{ window.dfsToast('Bitte Beginn-Datum setzen.','error'); }catch{} return; }
  if(!(premiumYear>0)){ try{ window.dfsToast('Jahresbeitrag (brutto) muss > 0 sein.','error'); }catch{} return; }
  const product = document.getElementById('product').value.trim();
  const lines = linesToArray(document.getElementById('lines').value);
  const { laufzeit, endDate, reminderDate } = calcDates();
  const payCycle = document.getElementById('payCycle').value;
  const cov = (window.dfsFmt? window.dfsFmt.parseDE(document.getElementById('coverage').value) : normalizeNumber(document.getElementById('coverage').value));
  const coverage = isNaN(cov) ? null : cov;
  const ded = (window.dfsFmt? window.dfsFmt.parseDE(document.getElementById('deductible').value) : normalizeNumber(document.getElementById('deductible').value));
  const deductible = isNaN(ded) ? null : ded;
  const now = new Date().toISOString();
  const hiddenCustomerId = (document.getElementById('c-customerId')?.value || '').trim();
  const german = normalizeToGerman({
    id: undefined,
    insurer,
    policyNo,
    product,
    lines,
    beginISO,
    payCycle,
    premiumYear,
    coverage,
    deductible,
    laufzeit,
    endDate,
    reminderDate,
    createdAt: now,
    updatedAt: now,
    customerId: (currentCustomerId || hiddenCustomerId || undefined)
  });
  contracts.push(german);
  writeContracts(contracts);
  renderTable();
  ['insurer','policyNo','product','lines','begin','premiumYear','coverage','deductible','endDate','reminderDate'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';});
  document.getElementById('payCycle').value='jährlich';
  document.getElementById('laufzeit').value='3';
  try{ window.dfsToast('Vertrag gespeichert.','success'); }catch{}
}
function onDelete(idx){
  contracts.splice(idx,1);
  writeContracts(contracts);
  renderTable();
}
function exportJSON(){
  const blob = new Blob([JSON.stringify(contracts,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='contracts.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
function importJSON(){
  const txt = window.prompt('JSON Import');
  if(!txt) return;
  try{
    const arr = JSON.parse(txt);
    if(Array.isArray(arr)){
      contracts = arr.map(normalizeToGerman).filter(Boolean);
      writeContracts(contracts);
      renderTable();
    }
  }catch{}
}
function collectContractFromForm(){
  const idEl = document.getElementById('c-contractId');
  let id = (idEl && idEl.value) ? idEl.value : (crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`);
  if(idEl && !idEl.value) idEl.value = id;
  const insurer = document.getElementById('insurer').value.trim();
  const policyNo = document.getElementById('policyNo').value.trim();
  const product = document.getElementById('product').value.trim();
  const lines = linesToArray(document.getElementById('lines').value);
  const beginISO = document.getElementById('begin').value || "";
  const { laufzeit, endDate, reminderDate } = calcDates();
  const payCycle = document.getElementById('payCycle').value;
  let premiumYear = (window.dfsFmt? window.dfsFmt.parseDE(document.getElementById('premiumYear').value) : normalizeNumber(document.getElementById('premiumYear').value));
  if(isNaN(premiumYear) || premiumYear < 0) premiumYear = 0;
  const cov = (window.dfsFmt? window.dfsFmt.parseDE(document.getElementById('coverage').value) : normalizeNumber(document.getElementById('coverage').value));
  const coverage = isNaN(cov) ? null : cov;
  const ded = (window.dfsFmt? window.dfsFmt.parseDE(document.getElementById('deductible').value) : normalizeNumber(document.getElementById('deductible').value));
  const deductible = isNaN(ded) ? null : ded;
  const now = new Date().toISOString();
  const hiddenCustomerId = (document.getElementById('c-customerId')?.value || '').trim();
  const obj = normalizeToGerman({ id, insurer, policyNo, product, lines, beginISO, payCycle, premiumYear, coverage, deductible, laufzeit, endDate, reminderDate, createdAt: now, updatedAt: now, customerId: (currentCustomerId || hiddenCustomerId || undefined) });
  return obj;
}
function autoBindContractForm(){
  const ids=['insurer','policyNo','product','lines','begin','laufzeit','payCycle','premiumYear','coverage','deductible'];
  ids.forEach(k=>{ const el=document.getElementById(k); if(!el) return; el.addEventListener('input', ()=>{
    const c = collectContractFromForm();
    let arr = (window.dfsStore&&dfsStore.get)? dfsStore.get(LS_KEY,[]) : readContracts();
    const idx = arr.findIndex(x=>x.id===c.id);
    if(idx>=0) arr[idx] = {...arr[idx], ...c, updatedAt:new Date().toISOString()}; else arr.push({...c, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()});
    writeContracts(arr);
    contracts = arr;
    renderTable();
    try{ window.dfsToast('Auto-Save Vertrag','success'); }catch{}
  }); });
}
function setup(){
  // migrate to German schema if needed
  contracts = readContracts().map(normalizeToGerman).filter(Boolean);
  writeContracts(contracts);
  renderTable();
  document.getElementById('btnAdd').addEventListener('click', onAdd);
  document.getElementById('btnExport').addEventListener('click', exportJSON);
  document.getElementById('btnImport').addEventListener('click', importJSON);
  // removed placeholder log
  // Recalculate dates on change
  document.getElementById('begin').addEventListener('change', calcDates);
  document.getElementById('laufzeit').addEventListener('change', calcDates);
  const premEl = document.getElementById('premiumYear');
  const premHint = document.getElementById('c-jahresbeitragBrutto-hint');
  if(premEl && premHint){ premEl.addEventListener('input', ()=>{ const val = window.dfsFmt? window.dfsFmt.parseDE(premEl.value) : normalizeNumber(premEl.value); premHint.textContent = (window.dfsFmt? window.dfsFmt.fmtEUR(val) : fmtCurrency(val)); }); }
  // Initialize calculated fields if begin preset
  calcDates();
  // Prefill hidden customerId if present
  const hid = document.getElementById('c-customerId');
  if(hid && currentCustomerId){ hid.value = currentCustomerId; }
  // Search & sort bindings
  const search = document.getElementById('contracts-search'); if(search) search.addEventListener('input', renderTable);
  document.querySelectorAll('th.sortable').forEach(th=>{
    th.addEventListener('click', ()=>{
      const key = th.dataset.key;
      const current = th.classList.contains('asc')?'asc': th.classList.contains('desc')?'desc':'';
      document.querySelectorAll('th.sortable').forEach(x=>x.classList.remove('asc','desc'));
      sortKey = key; sortDir = current==='asc'?'desc':'asc'; th.classList.add(sortDir); renderTable();
    });
  });
  // Auto-Save bind
  autoBindContractForm();
  // Initial cloud→local sync
  (async ()=>{ try{ if(window.dfsStore&&dfsStore.syncFromCloud){ await dfsStore.syncFromCloud('dfs.contracts'); contracts = readContracts().map(normalizeToGerman).filter(Boolean); renderTable(); } }catch{} })();
}
document.addEventListener('DOMContentLoaded', setup);
