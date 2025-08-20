
(function(){
  const get = k=> JSON.parse(localStorage.getItem(k)||'null');
  const set = (k,v)=> localStorage.setItem(k, JSON.stringify(v));
  const std = {
    'Betriebshaftpflicht': ['Personen-/Sachschäden','Vermögensfolgeschäden','Produkthaftpflicht','Mietsachschäden','Umwelt-Haftpflicht'],
    'Inhalt': ['Feuer','Leitungswasser','Einbruchdiebstahl','Sturm/Hagel','Elementar'],
    'Gebäude': ['Feuer','Leitungswasser','Sturm/Hagel','Elementar'],
    'Ertragsausfall/BU': ['Feuer','Leitungswasser','Sturm/Hagel','Elementar','Betriebsunterbrechung nach Sachschaden'],
    'Cyber': ['Haftpflicht','Eigenschäden','Forensik','Datenwiederherstellung','Betriebsunterbrechung'],
    'Rechtsschutz': ['Arbeits-RS','Vertrags-RS','Straf-RS'],
    'D&O': ['Organhaftung','Anstellungsvertrags-RS'],
    'Gruppenunfall': ['Unfalltod','Invalidität','Krankenhaustagegeld']
  };
  const fallback = ['Feuer','Leitungswasser','Sturm/Hagel','Einbruchdiebstahl','Elementar'];
  const rows = get('dfs.contracts')||[];
  const list = document.getElementById('list');
  const warnings = [];
  const recs = [];
  function chip(txt, type){ return `<span class="badge ${type||''}">${txt}</span>`; }
  const html = rows.map(r=>{
    const sparten = r.sparten||['(keine Sparte hinterlegt)'];
    const gf = r.gefahren||[];
    let badges = [];
    sparten.forEach(s=>{
      const catalog = std[s] || fallback;
      const missing = catalog.filter(x=> !gf.includes(x));
      if(s==='Betriebshaftpflicht' && (r.deckungssumme||0) < 5000000){
        badges.push(chip('BHV-Summe < 5 Mio. €', 'warn')); warnings.push('BHV-Deckungssumme unter 5 Mio. €');
      }
      if((s==='Inhalt' || s==='Gebäude') && gf.filter(x=>catalog.includes(x)).length < 3){
        badges.push(chip(`${s}: weniger als 3 Gefahren`, 'warn')); warnings.push(`${s}: weniger als 3 Gefahren versichert`);
      }
      if(s==='Cyber' && !['Eigenschäden','Forensik','Datenwiederherstellung','Betriebsunterbrechung'].some(x=>gf.includes(x))){
        badges.push(chip('Cyber ohne Eigenschaden/Forensik/BU', 'warn')); warnings.push('Cyber ohne zentrale Eigenschaden-Bausteine');
      }
      if(missing.length){
        badges.push(chip(`${s}: fehlt → ${missing.slice(0,3).join(', ')}${missing.length>3?' …':''}`, 'gold'));
      }
    });
    // fehlende Sparten Empfehlungen
    const allS = rows.flatMap(x=>x.sparten||[]);
    if(!allS.includes('Cyber')) { recs.push('Cyber ergänzen (inkl. Eigenschaden/BU)'); }
    if(!allS.includes('Ertragsausfall/BU')) { recs.push('Betriebsunterbrechung absichern'); }
    if(!allS.includes('Rechtsschutz')) { recs.push('Rechtsschutz prüfen'); }

    return `<div class="card" style="margin:8px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div><b>${r.versicherer||'—'}</b> • <small>${(r.sparten||[]).join(', ')||'—'}</small><br/><small>Police ${r.policeNr||'—'}</small></div>
        <div>${badges.join('')}</div>
      </div>
    </div>`;
  }).join('');
  list.innerHTML = html || '<div class="card">Noch keine Verträge erfasst.</div>';
  const a = get('dfs.analysis')||{};
  a.warnings = Array.from(new Set(warnings));
  a.recommendations = Array.from(new Set(recs));
  a.ts = new Date().toISOString();
  set('dfs.analysis', a);
})();