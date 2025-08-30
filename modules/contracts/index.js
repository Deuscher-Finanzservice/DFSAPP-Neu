const LS_KEY = "dfs.contracts";
let contracts = [];
const urlParams = new URLSearchParams(location.search);
const currentCustomerId = urlParams.get('cid') || null;

function readContracts(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    return Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
  }catch{
    return [];
  }
}
function writeContracts(arr){
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
  try{ window.dispatchEvent(new Event('dfs.contracts-changed')); }catch{}
}
function normalizeNumber(str){
  if(typeof str !== 'string') str = String(str||'');
  const s = str.trim().replace(/\./g,'').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? NaN : n;
}
function fmtCurrency(n){
  return (Number(n)||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
}
function linesToArray(s){
  return (s||'').split(',').map(t=>t.trim()).filter(Boolean);
}
function pad(n){ return String(n).padStart(2,'0'); }
function toISODateOnly(d){ if(!(d instanceof Date)) return ''; const y=d.getFullYear(); const m=pad(d.getMonth()+1); const da=pad(d.getDate()); return `${y}-${m}-${da}`; }
function addYears(d, y){ const dd = new Date(d.getTime()); dd.setFullYear(dd.getFullYear()+y); return dd; }
function addMonths(d, m){ const dd = new Date(d.getTime()); dd.setMonth(dd.getMonth()+m); return dd; }
function computeEndAndReminder(beginnISO, laufzeitNum){
  if(!beginnISO) return {endDate:'', reminderDate:''};
  const b = new Date(beginnISO+'T00:00:00');
  const end = addYears(b, Number(laufzeitNum)||3);
  const reminder = addMonths(addYears(b, 3), -3);
  return { endDate: toISODateOnly(end), reminderDate: toISODateOnly(reminder) };
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
  const end = addYears(b, laufzeit);
  const reminder = addMonths(addYears(b, 3), -3); // +3 Jahre -3 Monate
  const endISO = toISODateOnly(end);
  const remISO = toISODateOnly(reminder);
  document.getElementById('endDate').value = endISO;
  document.getElementById('reminderDate').value = remISO;
  return { laufzeit, endDate: endISO, reminderDate: remISO };
}
function renderTable(){
  const tbody = document.getElementById('tblBody');
  tbody.innerHTML = contracts.map((c,i)=>`<tr>
    <td>${c.versicherer||''}</td>
    <td>${c.policeNr||''}</td>
    <td>${Array.isArray(c.sparten)?c.sparten.join(', '):''}</td>
    <td class="num">${fmtCurrency(c.jahresbeitragBrutto)}</td>
    <td><button data-row="${i}" class="btnDel">Löschen</button></td>
  </tr>`).join('');
  tbody.querySelectorAll('.btnDel').forEach(btn=>btn.addEventListener('click',e=>onDelete(parseInt(btn.dataset.row))));
  const sum = contracts.reduce((a,c)=>a+(Number(c.jahresbeitragBrutto)||0),0);
  document.getElementById('sumPremium').textContent = fmtCurrency(sum);
}
function onAdd(){
  const insurer = document.getElementById('insurer').value.trim();
  if(!insurer) return;
  const policyNo = document.getElementById('policyNo').value.trim();
  const product = document.getElementById('product').value.trim();
  const lines = linesToArray(document.getElementById('lines').value);
  const beginISO = document.getElementById('begin').value || "";
  const { laufzeit, endDate, reminderDate } = calcDates();
  const payCycle = document.getElementById('payCycle').value;
  let premiumYear = normalizeNumber(document.getElementById('premiumYear').value);
  if(isNaN(premiumYear) || premiumYear < 0) premiumYear = 0;
  const cov = normalizeNumber(document.getElementById('coverage').value);
  const coverage = isNaN(cov) ? null : cov;
  const ded = normalizeNumber(document.getElementById('deductible').value);
  const deductible = isNaN(ded) ? null : ded;
  const now = new Date().toISOString();
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
    customerId: currentCustomerId || undefined
  });
  contracts.push(german);
  writeContracts(contracts);
  renderTable();
  ['insurer','policyNo','product','lines','begin','premiumYear','coverage','deductible','endDate','reminderDate'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';});
  document.getElementById('payCycle').value='jährlich';
  document.getElementById('laufzeit').value='3';
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
function setup(){
  // migrate to German schema if needed
  contracts = readContracts().map(normalizeToGerman).filter(Boolean);
  writeContracts(contracts);
  renderTable();
  document.getElementById('btnAdd').addEventListener('click', onAdd);
  document.getElementById('btnExport').addEventListener('click', exportJSON);
  document.getElementById('btnImport').addEventListener('click', importJSON);
  document.getElementById('btnCloudLoad').addEventListener('click', ()=>console.info('Cloud load placeholder'));
  // Recalculate dates on change
  document.getElementById('begin').addEventListener('change', calcDates);
  document.getElementById('laufzeit').addEventListener('change', calcDates);
  // Initialize calculated fields if begin preset
  calcDates();
}
document.addEventListener('DOMContentLoaded', setup);
