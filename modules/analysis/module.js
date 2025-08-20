
(function(){
  const get = k=> JSON.parse(localStorage.getItem(k)||'null');
  const set = (k,v)=> localStorage.setItem(k, JSON.stringify(v));
  const fmt = n => (n||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
  document.getElementById('run').onclick = ()=>{
    const rows = get('dfs.contracts')||[];
    const analysis = get('dfs.analysis')||{warnings:[],recommendations:[]};
    const sumAnnual = rows.reduce((a,c)=>a+(c.jahresbeitragBrutto||0),0);
    const targetPct = Number(localStorage.getItem('dfs.targetSavingsPct')||'15');
    const monthlySaving = (sumAnnual - (sumAnnual*(1 - targetPct/100)))/12;
    const warnCount = (analysis.warnings||[]).length;
    const riskScore = Math.max(5, 95 - 10*warnCount);
    const out = document.getElementById('out');
    const newA = {...analysis, sumAnnual, targetPct, monthlySaving, riskScore, ts: new Date().toISOString()};
    set('dfs.analysis', newA);
    out.innerHTML = `<div class="card">
      <div><b>Summe Beiträge:</b> ${fmt(sumAnnual)}</div>
      <div><b>Ziel-Ersparnis (%):</b> ${targetPct}%</div>
      <div><b>Monatliche Ziel-Ersparnis:</b> ${fmt(monthlySaving)}</div>
      <div><b>Risiko-Score:</b> ${riskScore}/100</div>
    </div>`;
    parent.postMessage({type:'toast', value:'Analyse aktualisiert.'}, '*');
  };
})();