
(function(){
  const fmtEur = n => (n||0).toLocaleString('de-DE', {style:'currency', currency:'EUR'});
  const get = k => JSON.parse(localStorage.getItem(k)||'null');
  const contracts = get('dfs.contracts')||[];
  const analysis = get('dfs.analysis')||{warnings:[], recommendations:[], sumAnnual:0, monthlySaving:0, riskScore:95};
  const sumActual = contracts.reduce((a,c)=>a+(c.jahresbeitragBrutto||0),0);
  const recTotal = contracts.reduce((a,c)=>a+ (c.empfehlungBeitrag ?? c.vergleichDirektBeitrag ?? c.jahresbeitragBrutto || 0),0);
  const delta = sumActual - recTotal;
  document.getElementById('kpi-aktuell').innerHTML = `<div>Aktuell</div><div style="font-size:20px;font-weight:700;">${fmtEur(sumActual)}</div>`;
  document.getElementById('kpi-empfohlen').innerHTML = `<div>Empfehlung</div><div style="font-size:20px;font-weight:700;">${fmtEur(recTotal)}</div>`;
  const pct = sumActual? Math.round((delta/sumActual)*100):0;
  document.getElementById('kpi-ersparnis').innerHTML = `<div>Ersparnis/Jahr</div><div style="font-size:20px;font-weight:700;">${fmtEur(delta)} (${pct}%)</div>`;
  document.getElementById('kpi-warnungen').innerHTML = `<div>Warnungen</div><div style="font-size:20px;font-weight:700;">${analysis.warnings?.length||0}</div>`;
  document.getElementById('warnungen').innerHTML = (analysis.warnings||[]).slice(0,5).map(w=>`<span class="badge warn">⚠ ${w}</span>`).join('')||'<span class="badge">Keine Warnungen</span>';
  document.getElementById('empfehlungen').innerHTML = (analysis.recommendations||[]).slice(0,5).map(w=>`<span class="badge gold">★ ${w}</span>`).join('')||'<span class="badge">Keine Empfehlungen</span>';
  const story = [
    `Aktueller Gesamtbeitrag: <b>${fmtEur(sumActual)}</b>.`,
    `Diese Lücken sehen wir: <b>${(analysis.warnings||[]).length}</b> Warnungen.`,
    `So viel sparen Sie bei Umsetzung der Empfehlungen: <b>${fmtEur(delta)} (${pct}%)</b>.`,
    `Nächste Schritte: <b>Verträge anpassen, Lücken schließen, Beiträge optimieren</b>.`
  ];
  document.getElementById('story').innerHTML = story.map(s=>`<li>${s}</li>`).join('');
})();