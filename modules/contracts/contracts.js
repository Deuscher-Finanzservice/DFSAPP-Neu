// modules/contracts/contracts.js
// Grundgerüst Verträge: LS-CRUD, Render, Summen. Keine externen Libs.

const FREQ = ['jährlich','halbjährlich','vierteljährlich','monatlich'];

const INSURERS = [
  'Allianz','AXA','HDI','HUK-Coburg','R+V','DEVK','Gothaer','Signal Iduna','Zurich','Württembergische'
];

const RISK_CATALOG = [
  'Betriebshaftpflicht (BHV)','Inhaltsversicherung','Cyber','Vermögensschadenhaftpflicht',
  'Rechtsschutz','Elektronik','Transport','Gebäude','Maschinen','Unfall'
];

let contracts = readLS();

initUI();
renderTable();
wireEvents();
calculateDates();

// ===== Helpers =====
function readLS() {
  try { return JSON.parse(localStorage.getItem('dfs.contracts') || '[]'); }
  catch { return []; }
}
function writeLS() { localStorage.setItem('dfs.contracts', JSON.stringify(contracts)); }

function $(id){ return document.getElementById(id); }
function fmtEUR(n){ return (Number(n)||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'}); }
function esc(s){ return (s??'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[m])); }

// ===== UI Init =====
function initUI(){
  // Versicherer datalist
  const dl = $('insurer-list');
  if (dl) dl.innerHTML = INSURERS.map(v=>`<option value="${esc(v)}">`).join('');

  // Zahlweise
  const sel = $('c-freq');
  if (sel) sel.innerHTML = FREQ.map(f=>`<option>${f}</option>`).join('');

  // Laufzeit (3/5 Jahre)
  const term = $('c-term');
  if (term) term.innerHTML = '<option value="3">3 Jahre</option><option value="5">5 Jahre</option>';

  // Risiken-Checkboxen
  const box = $('risk-boxes');
  if (box) box.innerHTML = RISK_CATALOG.map(r=>`
    <label class="chip"><input type="checkbox" value="${esc(r)}"><span>${esc(r)}</span></label>
  `).join('');
}

function wireEvents(){
  const add = $('btn-add');
  if (add) add.onclick = addContract;

  const exp = $('btn-export'); if (exp) exp.onclick = exportJSON;
  const imp = $('btn-import'); if (imp) imp.onclick = ()=>$('file-import').click();
  const fi  = $('file-import'); if (fi) fi.onchange = importJSON;

  // Platzhalter: werden in späteren Blocks befüllt
  const sC = $('btn-save-cloud'); if (sC) sC.onclick = ()=>alert('Cloud-Speichern kommt in Block 3');
  const lC = $('btn-load-cloud'); if (lC) lC.onclick = ()=>alert('Cloud-Laden kommt in Block 3');

  const start = $('c-start'); if (start) start.addEventListener('change', calculateDates);
  const term = $('c-term'); if (term) term.addEventListener('change', calculateDates);
}

// ===== Form <-> Objekt =====
function getForm(){
  const risks = [...document.querySelectorAll('#risk-boxes input[type=checkbox]:checked')].map(x=>x.value);
  const num = v => (v===''||v==null) ? null : Number(String(v).replace(',','.'))||0;

  const startVal = $('c-start')?.value || new Date().toISOString().slice(0,10);
  const termYears = parseInt($('c-term')?.value || '3', 10);
  const endDate = new Date(startVal);
  endDate.setFullYear(endDate.getFullYear() + termYears);
  const reminderDate = new Date(endDate);
  reminderDate.setMonth(reminderDate.getMonth() - 3);

  return {
    insurer: $('c-insurer')?.value?.trim()||'',
    policyNumber: $('c-policy')?.value?.trim()||'',
    product: $('c-product')?.value?.trim()||'',
    risks,
    startDate: startVal,
    termYears,
    endDate: endDate.toISOString().split('T')[0],
    reminderDate: reminderDate.toISOString().split('T')[0],
    paymentFrequency: $('c-freq')?.value || FREQ[0],
    annualPremium: num($('c-premium')?.value)||0,
    coverage: num($('c-coverage')?.value),
    deductible: num($('c-deductible')?.value),
    notes: $('c-notes')?.value?.trim() || null
  };
}
function clearForm(){
  ['c-insurer','c-policy','c-product','c-start','c-premium','c-coverage','c-deductible','c-notes','c-end','c-reminder']
    .forEach(id=>{ const el=$(id); if(el) el.value=''; });
  if ($('c-freq')) $('c-freq').value = FREQ[0];
  if ($('c-term')) $('c-term').value = '3';
  document.querySelectorAll('#risk-boxes input[type=checkbox]').forEach(cb=>cb.checked=false);
}

// ===== CRUD =====
function addContract(){
  const d = getForm();
  if (!d.insurer || !d.policyNumber){ alert('Bitte Versicherer und Police-Nr. ausfüllen.'); return; }
  const now = new Date().toISOString();
  contracts.push({ id: crypto.randomUUID(), ...d, createdAt: now, updatedAt: now });
  writeLS(); renderTable(); clearForm();
}

function editContract(id){
  const it = contracts.find(c=>c.id===id); if(!it) return;
  $('c-insurer').value = it.insurer||''; $('c-policy').value=it.policyNumber||''; $('c-product').value=it.product||'';
  $('c-start').value = (it.startDate||'').slice(0,10);
  $('c-term').value = String(it.termYears||3);
  $('c-end').value = (it.endDate||'').slice(0,10);
  $('c-reminder').value = (it.reminderDate||'').slice(0,10);
  $('c-freq').value = it.paymentFrequency||FREQ[0];
  $('c-premium').value = it.annualPremium??0; $('c-coverage').value = it.coverage??''; $('c-deductible').value = it.deductible??'';
  $('c-notes').value = it.notes??'';
  document.querySelectorAll('#risk-boxes input[type=checkbox]').forEach(cb=>cb.checked = (it.risks||[]).includes(cb.value));

  const btn = $('btn-add');
  btn.textContent = 'Vertrag speichern';
  btn.onclick = ()=>{
    const d = getForm();
    Object.assign(it, d, { updatedAt: new Date().toISOString() });
    writeLS(); renderTable(); clearForm();
    btn.textContent = 'Vertrag hinzufügen';
    btn.onclick = addContract;
  };
}

function deleteContract(id){
  contracts = contracts.filter(c=>c.id!==id);
  writeLS(); renderTable();
}

// ===== Tabelle & Summe =====
function renderTable(){
  const tb = document.querySelector('#contracts-table tbody');
  if (!tb) return;
  tb.innerHTML = contracts.map(c=>`
    <tr>
      <td>${esc(c.insurer||'')}</td>
      <td>${esc(c.policyNumber||'')}</td>
      <td>${esc((c.risks||[]).join(', '))}</td>
      <td>${esc(c.paymentFrequency||'')}</td>
      <td style="text-align:right;">${fmtEUR(c.annualPremium)}</td>
      <td>
        <button class="btn sm" data-edit="${c.id}">Bearbeiten</button>
        <button class="btn sm outline" data-del="${c.id}">Löschen</button>
      </td>
    </tr>
  `).join('');

  tb.querySelectorAll('button[data-edit]').forEach(b=>b.onclick=()=>editContract(b.dataset.edit));
  tb.querySelectorAll('button[data-del]').forEach(b=>b.onclick=()=>deleteContract(b.dataset.del));

  const sum = contracts.reduce((a,c)=>a+(Number(c.annualPremium)||0),0);
  const sumCell = $('sum-cell'); if (sumCell) sumCell.textContent = fmtEUR(sum);
}

// ===== Export/Import (lokal) =====
function exportJSON(){
  const blob = new Blob([JSON.stringify(contracts,null,2)],{type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'contracts.json'; a.click();
  URL.revokeObjectURL(a.href);
}

// ===== Laufzeit-Berechnung =====
function calculateDates(){
  const startInput = $('c-start');
  const termInput = $('c-term');
  const endInput = $('c-end');
  const reminderInput = $('c-reminder');

  if (!startInput || !termInput || !endInput || !reminderInput) return;
  if (!startInput.value || !termInput.value) return;

  const startDate = new Date(startInput.value);
  const termYears = parseInt(termInput.value, 10);

  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + termYears);

  const reminderDate = new Date(endDate);
  reminderDate.setMonth(reminderDate.getMonth() - 3);

  endInput.value = endDate.toISOString().split('T')[0];
  reminderInput.value = reminderDate.toISOString().split('T')[0];
}
function importJSON(e){
  const f = e.target.files?.[0]; if(!f) return;
  const r = new FileReader();
  r.onload = ()=>{ try{
    const arr = JSON.parse(r.result||'[]'); if(!Array.isArray(arr)) throw 0;
    contracts = arr; writeLS(); renderTable(); e.target.value='';
  }catch{ alert('Ungültige JSON-Datei.'); } };
  r.readAsText(f);
}

