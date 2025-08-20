(function(){
  const KEY_CUSTOMER='dfs.customer', KEY_CONTRACTS='dfs.contracts', KEY_TARGET='dfs.targetSavingsPct', KEY_ANALYSIS='dfs.analysis';
  const $ = (id)=>document.getElementById(id);
  const euro = (n)=> (n||0).toLocaleString('de-DE',{minimumFractionDigits:2, maximumFractionDigits:2}) + ' €';

  function load(key, def){ try{ const raw=localStorage.getItem(key); return raw? JSON.parse(raw): def; }catch(e){ return def; } }

  function buildRecs(warns){
    const rows=[];
    warns.forEach(w=>{
      if(/Cyber/.test(w.message)) rows.push(['Cyber', 'Police ergänzen mit angemessener Deckung (inkl. BU/Forensik).']);
      if(/BHV-Deckungssumme/.test(w.message)) rows.push(['BHV', 'Deckungssumme auf ≥ 5 Mio erhöhen.']);
      if(/D&O/.test(w.message)) rows.push(['D&O', 'D&O-Deckung einführen.']);
      if(/Ertragsausfall/.test(w.message)) rows.push(['Ertragsausfall/BU', 'Ertragsausfall/BU ergänzen.']);
      if(/Wechselfenster/.test(w.message)) rows.push(['Laufzeiten', 'Kündigungs- & Wechseloptionen zeitnah prüfen.']);
    });
    const seen=new Set(); const out=[];
    rows.forEach(r=>{ const k=r[0]; if(!seen.has(k)){ seen.add(k); out.push(r); } });
    return out;
  }

  function init(){
    const now = new Date();
    $('metaDate').textContent = now.toLocaleString('de-DE');
    $('footDate').textContent = now.toLocaleString('de-DE');

    const cust = load(KEY_ANALYSIS, null) ? load(KEY_CUSTOMER, {}) : load(KEY_CUSTOMER, {});
    const analysis = load(KEY_ANALYSIS, {});
    const contracts = load(KEY_CONTRACTS, []);

    // Customer table
    const tbody1 = document.querySelector('#tblCustomer tbody'); tbody1.innerHTML='';
    Object.entries(load(KEY_CUSTOMER, {})||{}).forEach(([k,v])=>{
      if (['createdAt','updatedAt'].includes(k)) return;
      const tr=document.createElement('tr'); tr.innerHTML=`<td style="color:#666">${k}</td><td>${String(v)}</td>`; tbody1.appendChild(tr);
    });

    const sum = contracts.reduce((a,c)=> a + (Number(c.jahresbeitragBrutto)||0), 0);
    const targetPct = localStorage.getItem(KEY_TARGET)!=null ? (parseFloat(localStorage.getItem(KEY_TARGET)) / 100) : 0.08;
    const save = sum * targetPct;

    $('kScore').textContent = analysis.score!=null ? String(analysis.score) : '–';
    $('kSum').textContent = euro(sum);
    $('kTarget').textContent = (targetPct*100).toFixed(1).replace('.',',') + ' %';
    $('kSave').textContent = euro(save);

    // Warn badges
    const warnWrap = $('warnBadges'); warnWrap.innerHTML='';
    (analysis.warnings||[]).forEach(w=>{
      const span=document.createElement('span'); span.className='badge'; span.textContent=`${w.level.toUpperCase()}: ${w.message}`;
      warnWrap.appendChild(span);
    });

    // Recommendations
    const recs = buildRecs(analysis.warnings||[]);
    const tbody2 = document.querySelector('#tblRecs tbody'); tbody2.innerHTML='';
    recs.forEach(([a,t])=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${a}</td><td>${t}</td>`; tbody2.appendChild(tr); });
    if (!recs.length){ const tr=document.createElement('tr'); tr.innerHTML='<td colspan="2">Keine konkreten Empfehlungen.</td>'; tbody2.appendChild(tr); }

    // Contracts
    const tbody3 = document.querySelector('#tblContracts tbody'); tbody3.innerHTML='';
    contracts.forEach((c,i)=>{
      const sparte=(c.sparten&&c.sparten[0])||'';
      const tr=document.createElement('tr'); tr.innerHTML=`
        <td>${i+1}</td><td>${sparte}</td>
        <td>${c.versicherer||''}${c.produkt?' / '+c.produkt:''}</td>
        <td>${c.policeNr||''}</td>
        <td>${c.beginn||''}${c.ende?' – '+c.ende:''}</td>
        <td>${c.jahresbeitragBrutto!=null? (Number(c.jahresbeitragBrutto).toLocaleString('de-DE',{minimumFractionDigits:2}))+' €':''}</td>
        <td>${c.deckungssumme? c.deckungssumme.toLocaleString('de-DE'):''}</td>
        <td>${c.selbstbehalt? c.selbstbehalt.toLocaleString('de-DE'):''}</td>`;
      tbody3.appendChild(tr);
    });
  }

  document.getElementById('btnPrint').addEventListener('click', ()=> {
    window.print();
  });

  init();
})();