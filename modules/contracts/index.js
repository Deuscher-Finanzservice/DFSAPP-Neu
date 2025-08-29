const LS_KEY = "dfs.contracts";
let contracts = [];

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
  const payCycle = document.getElementById('payCycle').value;
  let premiumYear = normalizeNumber(document.getElementById('premiumYear').value);
  if(isNaN(premiumYear) || premiumYear < 0) premiumYear = 0;
  const cov = normalizeNumber(document.getElementById('coverage').value);
  const coverage = isNaN(cov) ? null : cov;
  const ded = normalizeNumber(document.getElementById('deductible').value);
  const deductible = isNaN(ded) ? null : ded;
  const now = new Date().toISOString();
  contracts.push({insurer,policyNo,product,lines,beginISO,payCycle,premiumYear,coverage,deductible,createdAt:now,updatedAt:now});
  writeContracts(contracts);
  renderTable();
  ['insurer','policyNo','product','lines','begin','premiumYear','coverage','deductible'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';});
  document.getElementById('payCycle').value='jährlich';
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
}
document.addEventListener('DOMContentLoaded', setup);
