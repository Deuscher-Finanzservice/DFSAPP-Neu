
(function(){
  const get = k=> JSON.parse(localStorage.getItem(k)||'null');
  const fmt = n => (n||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
  const contracts = get('dfs.contracts')||[];
  const analysis = get('dfs.analysis')||{warnings:[],recommendations:[]};
  const sumActual = contracts.reduce((a,c)=>a+(c.jahresbeitragBrutto||0),0);
  const recTotal = contracts.reduce((a,c)=>a+ (c.empfehlungBeitrag ?? c.vergleichDirektBeitrag ?? c.jahresbeitragBrutto || 0),0);
  const delta = sumActual - recTotal;
  document.getElementById('kpis').innerHTML = `<div class="row">
    <div class="col-3"><div class="card">Aktuell<br><b>${fmt(sumActual)}</b></div></div>
    <div class="col-3"><div class="card">Empfehlung<br><b>${fmt(recTotal)}</b></div></div>
    <div class="col-3"><div class="card">Ersparnis/Jahr<br><b>${fmt(delta)}</b></div></div>
    <div class="col-3"><div class="card">Warnungen<br><b>${analysis.warnings?.length||0}</b></div></div>
  </div>`;
  document.getElementById('warn').innerHTML = (analysis.warnings||[]).map(w=>`<span class="badge warn">⚠ ${w}</span>`).join('')||'<span class="badge">—</span>';
  document.getElementById('recs').innerHTML = (analysis.recommendations||[]).map(w=>`<span class="badge gold">★ ${w}</span>`).join('')||'<span class="badge">—</span>';
  const tb = document.querySelector('#t tbody');
  tb.innerHTML = contracts.map(r=>{
    const neu = r.empfehlungBeitrag ?? r.vergleichDirektBeitrag ?? r.jahresbeitragBrutto;
    const delta = (r.jahresbeitragBrutto||0)-(neu||0);
    return `<tr><td>${r.versicherer||''}</td><td>${(r.sparten||[]).join(', ')}</td><td>${fmt(r.jahresbeitragBrutto||0)}</td><td>${fmt(neu||0)}</td><td>${fmt(delta)}</td></tr>`;
  }).join('');
})();