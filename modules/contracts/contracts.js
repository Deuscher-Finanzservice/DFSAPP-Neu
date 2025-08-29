// modules/contracts/contracts.js
// Grundgerüst Verträge: LS-CRUD, Render, Summen. Keine externen Libs.

const FREQ = ['jährlich','halbjährlich','vierteljährlich','monatlich'];
const TERM_YEARS = [3,5];

const INSURERS = [
  'Allianz','AXA','HDI','HUK-Coburg','R+V','DEVK','Gothaer','Signal Iduna','Zurich','Württembergische'
];

const RISK_CATALOG = [
  'Betriebshaftpflicht (BHV)','Inhaltsversicherung','Cyber','Vermögensschadenhaftpflicht',
  'Rechtsschutz','Elektronik','Transport','Gebäude','Maschinen','Unfall'
];

let contracts = readLS();

initUI();
migrateList(contracts);
renderTable();
wireEvents();

// ===== Helpers =====
function readLS(){
  try{ const arr = JSON.parse(localStorage.getItem('dfs.contracts')||'[]'); return Array.isArray(arr)?arr:[]; }
  catch{ return []; }
}
function writeLS(){ localStorage.setItem('dfs.contracts', JSON.stringify(contracts)); }

function $(id){ return document.getElementById(id); }
function fmtEUR(n){ return (Number(n)||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'}); }
function esc(s){ return (s??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }

function parseDate(v){ if(!v) return null; const d=new Date(v); return isNaN(d)?null:d; }
function formatDate(d,forInput=false){ if(!d) return ''; const p=n=>String(n).padStart(2,'0'); return forInput?`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`:`${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()}`; }
function addYears(d,y){ const r=new Date(d); r.setFullYear(r.getFullYear()+y); return r; }
function addDays(d,days){ const r=new Date(d); r.setDate(r.getDate()+days); return r; }
function computeEndAndReminders(start,termYears){
  if(!start) return {endDate:null,cancelableFrom:null,reminders:[],nextReminderAt:null};
  const endDate=addYears(start,termYears);
  const cancelableFrom=addYears(start,3);
  const reminders=[90,60,30].map(d=>addDays(endDate,-d));
  const now=new Date();
  const nextReminderAt=reminders.find(r=>r>now)||null;
  return {endDate,cancelableFrom,reminders,nextReminderAt};
}

// ===== UI Init =====
function initUI(){
  const dl=$('insurer-list');
  if(dl) dl.innerHTML=INSURERS.map(v=>`<option value="${esc(v)}">`).join('');
  const sel=$('c-freq');
  if(sel) sel.innerHTML=FREQ.map(f=>`<option>${f}</option>`).join('');
  const box=$('risk-boxes');
  if(box) box.innerHTML=RISK_CATALOG.map(r=>`<label class="chip"><input type="checkbox" value="${esc(r)}"><span>${esc(r)}</span></label>`).join('');
}

function wireEvents(){
  const add=$('btn-add'); if(add) add.onclick=addContract;
  const exp=$('btn-export'); if(exp) exp.onclick=exportJSON;
  const imp=$('btn-import'); if(imp) imp.onclick=()=>$('file-import').click();
  const fi=$('file-import'); if(fi) fi.onchange=importJSON;
  const cStart=$('c-start'); const cTerm=$('c-term');
  if(cStart) cStart.addEventListener('change',updateDates);
  if(cTerm) cTerm.addEventListener('change',updateDates);
  const sC=$('btn-save-cloud'); if(sC) sC.onclick=()=>alert('Cloud-Speichern kommt in Block 3');
  const lC=$('btn-load-cloud'); if(lC) lC.onclick=()=>alert('Cloud-Laden kommt in Block 3');
}

function updateDates(){
  const start=parseDate($('c-start')?.value);
  const term=Number($('c-term')?.value)||3;
  const {endDate,cancelableFrom}=computeEndAndReminders(start,term);
  const cEnd=$('c-end'); if(cEnd) cEnd.value=formatDate(endDate,true);
  const cCanc=$('c-cancelable'); if(cCanc) cCanc.value=cancelableFrom?formatDate(cancelableFrom):'';
}

// ===== Form <-> Objekt =====
function getForm(){
  const risks=[...document.querySelectorAll('#risk-boxes input[type=checkbox]:checked')].map(x=>x.value);
  const num=v=>(v===''||v==null)?null:Number(String(v).replace(',','.'))||0;
  const start=$('c-start')?.value||'';
  const termYears=Number($('c-term')?.value)||3;
  const {endDate,cancelableFrom,reminders,nextReminderAt}=computeEndAndReminders(parseDate(start),termYears);
  return {
    insurer:$('c-insurer')?.value?.trim()||'',
    policyNumber:$('c-policy')?.value?.trim()||'',
    product:$('c-product')?.value?.trim()||'',
    risks,
    startDate:start,
    termYears,
    endDate:formatDate(endDate,true),
    cancelableFrom:formatDate(cancelableFrom,true),
    paymentFrequency:$('c-freq')?.value||FREQ[0],
    annualPremium:num($('c-premium')?.value)||0,
    coverage:num($('c-coverage')?.value),
    deductible:num($('c-deductible')?.value),
    notes:$('c-notes')?.value?.trim()||null,
    reminders:reminders.map(d=>formatDate(d,true)),
    nextReminderAt:nextReminderAt?formatDate(nextReminderAt,true):null
  };
}
function clearForm(){
  ['c-insurer','c-policy','c-product','c-start','c-premium','c-coverage','c-deductible','c-notes','c-end','c-cancelable']
    .forEach(id=>{const el=$(id); if(el) el.value='';});
  if($('c-freq')) $('c-freq').value=FREQ[0];
  if($('c-term')) $('c-term').value='3';
  document.querySelectorAll('#risk-boxes input[type=checkbox]').forEach(cb=>cb.checked=false);
}

// ===== CRUD =====
function addContract(){
  const d=getForm();
  if(!d.insurer||!d.policyNumber){alert('Bitte Versicherer und Police-Nr. ausfüllen.');return;}
  const now=new Date().toISOString();
  contracts.push({id:crypto.randomUUID(),...d,createdAt:now,updatedAt:now});
  writeLS();renderTable();clearForm();
}

function editContract(id){
  const it=contracts.find(c=>c.id===id); if(!it) return;
  $('c-insurer').value=it.insurer||'';
  $('c-policy').value=it.policyNumber||'';
  $('c-product').value=it.product||'';
  $('c-start').value=(it.startDate||'').slice(0,10);
  $('c-term').value=String(it.termYears||3);
  $('c-end').value=it.endDate||'';
  $('c-cancelable').value=it.cancelableFrom?formatDate(parseDate(it.cancelableFrom)):'';
  $('c-freq').value=it.paymentFrequency||FREQ[0];
  $('c-premium').value=it.annualPremium??0;
  $('c-coverage').value=it.coverage??'';
  $('c-deductible').value=it.deductible??'';
  $('c-notes').value=it.notes??'';
  document.querySelectorAll('#risk-boxes input[type=checkbox]').forEach(cb=>cb.checked=(it.risks||[]).includes(cb.value));
  const btn=$('btn-add');
  btn.textContent='Vertrag speichern';
  btn.onclick=()=>{
    const d=getForm();
    Object.assign(it,d,{updatedAt:new Date().toISOString()});
    writeLS();renderTable();clearForm();
    btn.textContent='Vertrag hinzufügen';
    btn.onclick=addContract;
  };
}

function deleteContract(id){
  contracts=contracts.filter(c=>c.id!==id);
  writeLS();renderTable();
}

// ===== Tabelle & Summe =====
function renderTable(){
  const tb=document.querySelector('#contracts-table tbody');
  if(!tb) return;
  tb.innerHTML=contracts.map(c=>{
    const end=formatDate(parseDate(c.endDate));
    const nextRem=c.nextReminderAt?formatDate(parseDate(c.nextReminderAt)):'–';
    return `<tr>
      <td>${esc(c.insurer||'')}</td>
      <td>${esc(c.policyNumber||'')}</td>
      <td>${esc((c.risks||[]).join(', '))}</td>
      <td>${esc(c.paymentFrequency||'')}</td>
      <td>${esc(end)}</td>
      <td>${esc(nextRem)}</td>
      <td style="text-align:right;">${fmtEUR(c.annualPremium)}</td>
      <td><button class="btn sm" data-edit="${c.id}">Bearbeiten</button>
          <button class="btn sm outline" data-del="${c.id}">Löschen</button></td>
    </tr>`;
  }).join('');
  tb.querySelectorAll('button[data-edit]').forEach(b=>b.onclick=()=>editContract(b.dataset.edit));
  tb.querySelectorAll('button[data-del]').forEach(b=>b.onclick=()=>deleteContract(b.dataset.del));
  const sum=contracts.reduce((a,c)=>a+(Number(c.annualPremium)||0),0);
  const sumCell=$('sum-cell'); if(sumCell) sumCell.textContent=fmtEUR(sum);
}

// ===== Export/Import (lokal) =====
function exportJSON(){
  const blob=new Blob([JSON.stringify(contracts,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='contracts.json'; a.click();
  URL.revokeObjectURL(a.href);
}
function importJSON(e){
  const f=e.target.files?.[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ try{
    const arr=JSON.parse(r.result||'[]'); if(!Array.isArray(arr)) throw 0;
    contracts=migrateList(arr); writeLS(); renderTable(); e.target.value='';
  }catch{ alert('Ungültige JSON-Datei.'); } };
  r.readAsText(f);
}

function migrateList(list){
  if(!Array.isArray(list)) return [];
  let changed=false; const now=new Date().toISOString();
  list.forEach(c=>{
    if(c.termYears==null) c.termYears=Number(c.termYears)===5?5:3;
    const start=parseDate(c.startDate);
    const {endDate,cancelableFrom,reminders,nextReminderAt}=computeEndAndReminders(start,c.termYears);
    if(!c.endDate||!c.cancelableFrom){
      c.endDate=formatDate(endDate,true);
      c.cancelableFrom=formatDate(cancelableFrom,true);
      c.updatedAt=now; changed=true;
    }
    c.reminders=Array.isArray(c.reminders)?c.reminders:reminders.map(d=>formatDate(d,true));
    c.nextReminderAt=c.nextReminderAt?c.nextReminderAt:(nextReminderAt?formatDate(nextReminderAt,true):null);
    if(!c.createdAt) c.createdAt=now;
  });
  if(changed) localStorage.setItem('dfs.contracts', JSON.stringify(list));
  return list;
}
