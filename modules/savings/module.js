
(function(){
  const get = k=> JSON.parse(localStorage.getItem(k)||'null');
  const set = (k,v)=> localStorage.setItem(k, JSON.stringify(v));
  const fmt = n => (n||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
  const table = document.querySelector('#t tbody');
  const rows = get('dfs.contracts')||[];
  let sumA=0, sumN=0, sumD=0;
  table.innerHTML = rows.map(r=>{
    const neu = r.empfehlungBeitrag ?? r.vergleichDirektBeitrag ?? r.jahresbeitragBrutto;
    const delta = (r.jahresbeitragBrutto||0) - (neu||0);
    sumA += (r.jahresbeitragBrutto||0); sumN += (neu||0); sumD += delta;
    const pct = r.jahresbeitragBrutto? Math.round((delta/r.jahresbeitragBrutto)*100):0;
    return `<tr><td>${r.versicherer||''}</td><td>${r.policeNr||''}</td><td>${fmt(r.jahresbeitragBrutto||0)}</td><td>${fmt(neu||0)}</td><td>${fmt(delta)} (${pct}%)</td></tr>`;
  }).join('');
  document.getElementById('sumAlt').textContent = fmt(sumA);
  document.getElementById('sumNeu').textContent = fmt(sumN);
  document.getElementById('sumDelta').textContent = fmt(sumD);
  // push into dfs.analysis
  const a = get('dfs.analysis')||{}; a.sumAnnual = sumA; a.savingsTotal = sumD; a.ts = new Date().toISOString();
  set('dfs.analysis', a);
})();