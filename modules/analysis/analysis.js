(function(){
  function runAnalysis(){
    const contracts = (dfsStore.get('dfs.contracts', [])||[]).filter(Boolean);
    const warnings = [];
    const recos = [];

    // Heuristiken
    contracts.forEach(c=>{
      if(c.sparten?.includes('Betriebshaftpflicht') && (c.deckungssumme||0) < 5000000){
        warnings.push(`BHV-Deckungssumme unter 5 Mio. (Police ${c.policeNr||'—'})`);
      }
      if((c.sparten||[]).includes('Inhalt') && (c.gefahren||[]).length < 3){
        warnings.push(`Inhaltspolice mit weniger als 3 Gefahren (Police ${c.policeNr||'—'})`);
      }
      if((c.sparten||[]).includes('Gebäude') && (c.gefahren||[]).length < 3){
        warnings.push(`Gebäudeversicherung mit zu wenig Gefahren (Police ${c.policeNr||'—'})`);
      }
      if((c.sparten||[]).includes('Cyber') && (!c.gefahren || c.gefahren.length===0)){
        warnings.push(`Cyber ohne Bausteine (Police ${c.policeNr||'—'})`);
      }
    });

    // Fehlende Sparten (Empfehlungen)
    const allSpar = contracts.flatMap(c=>c.sparten||[]);
    if(!allSpar.includes('Cyber')) recos.push('Cyber ergänzen (Haftpflicht, Eigenschäden etc.)');
    if(!allSpar.includes('Ertragsausfall/BU')) recos.push('Betriebsunterbrechung absichern');
    if(!allSpar.includes('Rechtsschutz')) recos.push('Rechtsschutz prüfen');

    // KPIs
    const sumAnnual = contracts.reduce((acc,c)=> acc + (dfsFmt.parseDE(c.jahresbeitragBrutto)||0),0);
    const targetPct = Number(localStorage.getItem('dfs.targetSavingsPct')||10); // Default 10 %
    const monthlySaving = (sumAnnual - (sumAnnual*(1 - targetPct/100))) / 12;
    const riskScore = Math.max(5, 95 - 10*warnings.length);

    const result = {
      warnings, recommendations: recos,
      sumAnnual, targetPct, monthlySaving, riskScore,
      ts: new Date().toISOString()
    };
    dfsStore.set('dfs.analysis', result);
    try{ window.dispatchEvent(new Event('dfs.analysis-changed')); }catch{}
    return result;
  }

  function render(){
    const res = runAnalysis();

    // KPIs
    const kpiBox = document.getElementById('analysis-kpis');
    kpiBox.innerHTML = `
      <div class="card"><div class="label">Summe Jahresbeiträge</div><strong>${dfsFmt.fmtEUR(res.sumAnnual)}</strong></div>
      <div class="card"><div class="label">Einsparziel</div><strong>${res.targetPct}%</strong></div>
      <div class="card"><div class="label">Monatliche Ersparnis</div><strong>${dfsFmt.fmtEUR(res.monthlySaving)}</strong></div>
      <div class="card"><div class="label">Risiko-Score</div><strong>${res.riskScore}/100</strong></div>
    `;

    // Warnungen
    const warnBox = document.getElementById('analysis-warnings');
    warnBox.innerHTML = res.warnings.length
      ? res.warnings.map(w=>`<span class="badge" style="border-color:#D97706;color:#D97706">${w}</span>`).join('')
      : '<p class="text-secondary">Keine Warnungen</p>';

    // Empfehlungen
    const recoBox = document.getElementById('analysis-recos');
    recoBox.innerHTML = res.recommendations.length
      ? res.recommendations.map(r=>`<span class="badge">${r}</span>`).join('')
      : '<p class="text-secondary">Keine Empfehlungen</p>';
  }

  document.addEventListener('DOMContentLoaded', render);
})();

