(function(){
  async function runAnalysis(){
    const contracts = await (window.dfsData && dfsData.getAllContracts ? dfsData.getAllContracts() : Promise.resolve(dfsStore.get('dfs.contracts', [])||[]));
    const warnings = [];
    const recos = [];

    contracts.forEach(c=>{
      const sp = c.sparten||[]; const gf=c.gefahren||[];
      if(sp.includes('Betriebshaftpflicht') && (Number(c.deckungssumme)||0) < 5000000){ warnings.push(`BHV-Deckungssumme unter 5 Mio. (Police ${c.policeNr||'—'})`); }
      if(sp.includes('Inhalt')  && gf.length<3){ warnings.push(`Inhaltspolice mit weniger als 3 Gefahren (Police ${c.policeNr||'—'})`); }
      if(sp.includes('Gebäude') && gf.length<3){ warnings.push(`Gebäudeversicherung mit zu wenig Gefahren (Police ${c.policeNr||'—'})`); }
      if(sp.includes('Cyber')   && gf.length===0){ warnings.push(`Cyber ohne Bausteine (Police ${c.policeNr||'—'})`); }
    });

    const allSpar = contracts.flatMap(c=> c.sparten||[]);
    if(!allSpar.includes('Cyber'))            recos.push('Cyber ergänzen (Haftpflicht, Eigenschäden etc.)');
    if(!allSpar.includes('Ertragsausfall/BU'))recos.push('Betriebsunterbrechung absichern');
    if(!allSpar.includes('Rechtsschutz'))     recos.push('Rechtsschutz prüfen');

    const sumAnnual = contracts.reduce((acc,c)=> acc + (dfsFmt.parseDE(c.jahresbeitragBrutto)||0),0);
    const targetPct = Number(localStorage.getItem('dfs.targetSavingsPct')||10);
    const monthlySaving = (sumAnnual - (sumAnnual*(1 - targetPct/100))) / 12;
    const riskScore = Math.max(5, 95 - 10*warnings.length);

    const result = { warnings, recommendations: recos, sumAnnual, targetPct, monthlySaving, riskScore, ts: new Date().toISOString() };
    dfsStore.set('dfs.analysis', result);
    try{ await (window.dfsCloud && dfsCloud.save ? dfsCloud.save('dfs.analysis', { id:'latest', ...result }) : Promise.resolve()); }catch{}
    try{ window.dispatchEvent(new Event('dfs.analysis-changed')); }catch{}
    return result;
  }

  async function render(){
    const kpiBox = document.getElementById('analysis-kpis');
    const warnBox = document.getElementById('analysis-warnings');
    const recoBox = document.getElementById('analysis-recos');
    if(kpiBox) kpiBox.innerHTML = '<p class="text-secondary">Lade…</p>';
    if(warnBox) warnBox.innerHTML=''; if(recoBox) recoBox.innerHTML='';
    const res = await runAnalysis();

    if(kpiBox){
      kpiBox.innerHTML = `
        <div class="card"><div class="label">Summe Jahresbeiträge</div><strong>${dfsFmt.fmtEUR(res.sumAnnual)}</strong></div>
        <div class="card"><div class="label">Einsparziel</div><strong>${res.targetPct}%</strong></div>
        <div class="card"><div class="label">Monatliche Ersparnis</div><strong>${dfsFmt.fmtEUR(res.monthlySaving)}</strong></div>
        <div class="card"><div class="label">Risiko-Score</div><strong>${res.riskScore}/100</strong></div>
      `;
    }
    if(warnBox){ warnBox.innerHTML = res.warnings.length ? res.warnings.map(w=>`<span class="badge" style="border-color:#D97706;color:#D97706">${w}</span>`).join('') : '<p class="text-secondary">Keine Warnungen</p>'; }
    if(recoBox){ recoBox.innerHTML = res.recommendations.length ? res.recommendations.map(r=>`<span class="badge">${r}</span>`).join('') : '<p class="text-secondary">Keine Empfehlungen</p>'; }
  }

  document.addEventListener('DOMContentLoaded', ()=>{ render(); });
})();
