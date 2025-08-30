// scripts/analysis.js
(function(){
  function parseDE(n){ try{ return window.dfsFmt? dfsFmt.parseDE(n) : (Number(n)||0); }catch{ return Number(n)||0; } }
  function runContractAnalysis(contracts, targetPct){
    const warnings=[]; const recos=[];
    (contracts||[]).forEach(c=>{
      const sp=c.sparten||[]; const gf=c.gefahren||[];
      if(sp.includes('Betriebshaftpflicht') && (Number(c.deckungssumme)||0) < 5000000) warnings.push(`BHV-Deckungssumme unter 5 Mio. (Police ${c.policeNr||'—'})`);
      if(sp.includes('Inhalt')  && gf.length<3) warnings.push(`Inhaltspolice mit weniger als 3 Gefahren (Police ${c.policeNr||'—'})`);
      if(sp.includes('Gebäude') && gf.length<3) warnings.push(`Gebäudeversicherung mit zu wenig Gefahren (Police ${c.policeNr||'—'})`);
      if(sp.includes('Cyber')   && gf.length===0) warnings.push(`Cyber ohne Bausteine (Police ${c.policeNr||'—'})`);
    });
    const allS = (contracts||[]).flatMap(c=> c.sparten||[]);
    if(!allS.includes('Cyber'))            recos.push('Cyber ergänzen (Haftpflicht, Eigenschäden etc.)');
    if(!allS.includes('Ertragsausfall/BU'))recos.push('Betriebsunterbrechung absichern');
    if(!allS.includes('Rechtsschutz'))     recos.push('Rechtsschutz prüfen');
    const sumAnnual = (contracts||[]).reduce((a,c)=> a + parseDE(c.jahresbeitragBrutto), 0);
    const tp = Number(targetPct||10);
    const monthlySaving = (sumAnnual - (sumAnnual * (1 - tp/100))) / 12;
    const riskScore = Math.max(5, 95 - 10*warnings.length);
    const sumDelta = (contracts||[]).reduce((a,c)=>{ const emp=parseDE(c.empfehlungBeitrag); if(emp>0){ const d = Math.max(0, parseDE(c.jahresbeitragBrutto)-emp); return a + d; } return a; }, 0);
    const res = { warnings, recommendations: recos, sumAnnual, targetPct: tp, monthlySaving, riskScore, ts: new Date().toISOString() };
    if(sumDelta>0) res.sumDelta = sumDelta;
    return res;
  }
  async function analyzeGlobal(){
    const contracts = await (window.dfsCloud&&dfsCloud.loadAll? dfsCloud.loadAll('dfs.contracts') : Promise.resolve([]));
    const cfg = (window.dfsStore&&dfsStore.get)? dfsStore.get('dfs.config.default', {analysisTargetPct:10}) : {analysisTargetPct:10};
    const res = runContractAnalysis(contracts, cfg.analysisTargetPct||10);
    try{ await dfsCloud.save('dfs.analysis', { id:'latest', ...res }); }catch{}
    return res;
  }
  async function analyzeCustomer(customerId){
    const all = await (window.dfsCloud&&dfsCloud.loadAll? dfsCloud.loadAll('dfs.contracts') : Promise.resolve([]));
    const contracts = (all||[]).filter(c=> String(c.customerId||'')===String(customerId));
    const cfg = (window.dfsStore&&dfsStore.get)? dfsStore.get('dfs.config.default', {analysisTargetPct:10}) : {analysisTargetPct:10};
    const res = runContractAnalysis(contracts, cfg.analysisTargetPct||10);
    try{ await dfsCloud.save('dfs.analysis.customer', { id:String(customerId), ...res }); }catch{}
    return res;
  }
  window.dfsAnalysis = { runContractAnalysis, analyzeGlobal, analyzeCustomer };
})();

