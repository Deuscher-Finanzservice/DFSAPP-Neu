(function(){
  const KEY_CUSTOMER='dfs.customer', KEY_CONTRACTS='dfs.contracts', KEY_TARGET='dfs.targetSavingsPct', KEY_ANALYSIS='dfs.analysis';
  const $ = (id)=>document.getElementById(id);
  function euro(n){ return (n||0).toLocaleString('de-DE',{minimumFractionDigits:2, maximumFractionDigits:2}) + ' €'; }

  function load(key, def){ try{ const raw=localStorage.getItem(key); return raw? JSON.parse(raw): def; }catch(e){ return def; } }

  function ampel(score){
    if(score>=80) return {text:'Grün', cls:'pill green'};
    if(score>=60) return {text:'Orange', cls:'pill orange'};
    return {text:'Rot', cls:'pill red'};
  }

  function buildRecs(warns){
    const rows=[];
    warns.forEach(w=>{
      if(/Cyber/.test(w.message)) rows.push(['Cyber', 'Police ergänzen mit angemessener Deckung (inkl. BU/Forensik, mind. 1–2 Mio).']);
      if(/BHV-Deckungssumme/.test(w.message)) rows.push(['BHV', 'Deckungssumme auf ≥ 5 Mio erhöhen.']);
      if(/D&O/.test(w.message)) rows.push(['D&O', 'D&O-Deckung einführen (GF/Organe).']);
      if(/Ertragsausfall/.test(w.message)) rows.push(['Ertragsausfall/BU', 'Ertragsausfall/BU zur Inhalts-/Gebäudeversicherung ergänzen.']);
      if(/Wechselfenster/.test(w.message)) rows.push(['Laufzeiten', 'Kündigungs- & Wechseloptionen zeitnah prüfen.']);
    });
    // deduplicate
    const seen=new Set(); const out=[];
    rows.forEach(r=>{ const k=r[0]; if(!seen.has(k)){ seen.add(k); out.push(r); } });
    return out;
  }

  function init(){
    const analysis = load(KEY_ANALYSIS, {});
    const contracts = load(KEY_CONTRACTS, []);

    const sum = contracts.reduce((a,c)=> a + (Number(c.jahresbeitragBrutto)||0), 0);
    const targetPct = localStorage.getItem(KEY_TARGET)!=null ? (parseFloat(localStorage.getItem(KEY_TARGET)) / 100) : 0.08;
    const yearlySave = sum * targetPct;
    const monthlySave = yearlySave/12;

    // KPIs
    $('kpiScore').textContent = analysis.score!=null? String(analysis.score) : '–';
    $('kpiSum').textContent = euro(sum);
    $('kpiTarget').textContent = (targetPct*100).toFixed(1).replace('.',',') + ' %';
    $('kpiMonthly').textContent = euro(monthlySave);

    // Score bar + Ampel
    const pct = Math.max(0, Math.min(100, analysis.score||0));
    document.getElementById('scoreBar').style.width = pct + '%';
    const a = ampel(pct);
    const ampelEl = document.getElementById('ampel');
    ampelEl.textContent = a.text; ampelEl.className = a.cls;

    // Warnungen
    const warnWrap = document.getElementById('warnList');
    warnWrap.innerHTML = '';
    (analysis.warnings||[]).forEach(w=>{
      const div = document.createElement('div');
      div.className = /hoch/.test(w.level)? 'pill red' : (/mittel/.test(w.level)? 'pill orange':'pill');
      div.textContent = `${w.level.toUpperCase()}: ${w.message}`;
      div.style.display='inline-block'; div.style.margin='2px';
      warnWrap.appendChild(div);
    });

    // Empfehlungen
    const recs = buildRecs(analysis.warnings||[]);
    const tbody = document.querySelector('#tblRecs tbody'); tbody.innerHTML='';
    recs.forEach(([area, text])=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${area}</td><td>${text}</td>`;
      tbody.appendChild(tr);
    });
    if (!recs.length){
      const tr=document.createElement('tr'); tr.innerHTML='<td colspan="2">Keine konkreten Empfehlungen basierend auf den Regeln.</td>';
      tbody.appendChild(tr);
    }

    // Verträge
    const tbody2 = document.querySelector('#tblContracts tbody'); tbody2.innerHTML='';
    contracts.forEach(c=>{
      const sparte=(c.sparten&&c.sparten[0])||'';
      const tr=document.createElement('tr');
      tr.innerHTML = `<td>${sparte}</td>
        <td>${c.versicherer||''}${c.produkt?' / '+c.produkt:''}</td>
        <td>${c.policeNr||''}</td>
        <td>${c.beginn||''}${c.ende?' – '+c.ende:''}</td>
        <td>${c.jahresbeitragBrutto!=null? (Number(c.jahresbeitragBrutto).toLocaleString('de-DE',{minimumFractionDigits:2}))+' €':''}</td>
        <td>${c.deckungssumme? c.deckungssumme.toLocaleString('de-DE'):''}</td>
        <td>${c.selbstbehalt? c.selbstbehalt.toLocaleString('de-DE'):''}</td>`;
      tbody2.appendChild(tr);
    });
  }

  init();
})();