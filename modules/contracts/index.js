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
    <td>${c.insurer}</td>
    <td>${c.policyNo}</td>
    <td>${c.lines.join(', ')}</td>
    <td class="num">${fmtCurrency(c.premiumYear)}</td>
    <td><button data-row="${i}" class="btnDel">Löschen</button></td>
  </tr>`).join('');
  tbody.querySelectorAll('.btnDel').forEach(btn=>btn.addEventListener('click',e=>onDelete(parseInt(btn.dataset.row))));
  const sum = contracts.reduce((a,c)=>a+(Number(c.premiumYear)||0),0);
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
  const base = {insurer,policyNo,product,lines,beginISO,payCycle,premiumYear,coverage,deductible,laufzeit,endDate,reminderDate,createdAt:now,updatedAt:now};
  if(currentCustomerId) base.customerId = currentCustomerId;
  contracts.push(base);
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
      contracts = arr;
      writeContracts(contracts);
      renderTable();
    }
  }catch{}
}
function setup(){
  contracts = readContracts();
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
