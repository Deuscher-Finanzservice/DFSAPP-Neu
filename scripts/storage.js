
window.DFS = (function(){
  const KEYS = {
    customer: 'dfs.customer',
    contracts: 'dfs.contracts',
    analysis: 'dfs.analysis',
    targetSavingsPct: 'dfs.targetSavingsPct',
    docsChecklists: 'dfs.docs.checklists',
    toolBasisPriv: 'dfs.tool.basispriv',
    toolGkvPkv: 'dfs.tool.gkvpkv',
    toolVorsorge: 'dfs.tool.vorsorge',
    version: 'dfs.version'
  };

  function safeGet(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      if(!raw) return fallback;
      return JSON.parse(raw);
    }catch(e){ return fallback; }
  }
  function safeSet(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }catch(e){
      toast('Speicher voll. Bitte Export durchführen und Speicher leeren.');
      return false;
    }
  }

  // Defaults
  function ensureDefaults(){
    if(safeGet(KEYS.contracts,null)===null) safeSet(KEYS.contracts, []);
    if(safeGet(KEYS.customer,null)===null) safeSet(KEYS.customer, {"firma":"","ansprech":"","email":"","telefon":"","branche":"","mitarbeiter":null,"umsatz":null,"gruendung":null,"standort":""});
    if(safeGet(KEYS.targetSavingsPct,null)===null) safeSet(KEYS.targetSavingsPct, 15);
  }
  ensureDefaults();

  function exportAll(){
    return {
      [KEYS.customer]: safeGet(KEYS.customer, null),
      [KEYS.contracts]: safeGet(KEYS.contracts, []),
      [KEYS.analysis]: safeGet(KEYS.analysis, null),
      [KEYS.targetSavingsPct]: safeGet(KEYS.targetSavingsPct, 0),
      [KEYS.docsChecklists]: safeGet(KEYS.docsChecklists, {}),
      [KEYS.toolBasisPriv]: safeGet(KEYS.toolBasisPriv, {}),
      [KEYS.toolGkvPkv]: safeGet(KEYS.toolGkvPkv, {}),
      [KEYS.toolVorsorge]: safeGet(KEYS.toolVorsorge, {}),
      [KEYS.version]: localStorage.getItem(KEYS.version)
    };
  }

  function importAll(json){
    const allowed = Object.values(KEYS);
    Object.keys(json||{}).forEach(k=>{
      if(allowed.includes(k)){
        try{ localStorage.setItem(k, typeof json[k]==='string' ? json[k] : JSON.stringify(json[k])); }catch(e){}
      }
    });
  }

  function resetAll(){
    Object.values(KEYS).forEach(k=> localStorage.removeItem(k));
  }

  function toast(msg){
    const el = document.getElementById('toast') || (parent && parent.document.getElementById('toast'));
    if(!el){ alert(msg); return; }
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'), 2000);
  }

  // Data helpers
  function getCustomer(){ return safeGet(KEYS.customer, null); }
  function setCustomer(obj){ return safeSet(KEYS.customer, obj); }

  function getContracts(){ return safeGet(KEYS.contracts, []); }
  function setContracts(arr){ return safeSet(KEYS.contracts, arr); }

  function getTargetPct(){ return safeGet(KEYS.targetSavingsPct, 0); }
  function setTargetPct(v){ return safeSet(KEYS.targetSavingsPct, v); }

  function setAnalysis(obj){ return safeSet(KEYS.analysis, obj); }
  function getAnalysis(){ return safeGet(KEYS.analysis, null); }

  const STD = {
    gefahrenBySparte: {
      "Betriebshaftpflicht (BHV)":["Personen-/Sachschäden","Vermögensfolgeschäden","Produkthaftpflicht","Mietsachschäden","Umwelt-Haftpflicht"],
      "Inhalt":["Feuer","Leitungswasser","Einbruchdiebstahl","Sturm/Hagel","Elementar"],
      "Gebäude":["Feuer","Leitungswasser","Sturm/Hagel","Elementar"],
      "Ertragsausfall/BU":["Feuer","Leitungswasser","Sturm/Hagel","Elementar","Betriebsunterbrechung nach Sachschaden"],
      "Cyber":["Haftpflicht","Eigenschäden","Forensik","Datenwiederherstellung","Betriebsunterbrechung"],
      "Rechtsschutz":["Arbeits-RS","Vertrags-RS","Straf-RS"],
      "D&O":["Organhaftung","Anstellungsvertrags-RS"],
      "Gruppenunfall":["Unfalltod","Invalidität","Krankenhaustagegeld"]
    },
    defaultGefahren:["Feuer","Leitungswasser","Sturm/Hagel","Einbruchdiebstahl","Elementar"],
    empfehlungenChecklist:[
      "Versicherungssumme prüfen",
      "Erhöhung Versicherungssumme",
      "Rückwirkungsschäden Zulieferer/Abnehmer mitversichert",
      "Vertragsstrafen bis 1,5 Mio. € mitversichert",
      "Viele Deckungserweiterungen",
      "Umstellung ins neue Tarifwerk prüfen"
    ]
  };

  function currencyDE(n){ try{ return (n||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});}catch(e){ return n; } }
  function parseNum(v){ const x = (v||'').toString().replace(/\./g,'').replace(',','.'); const n = parseFloat(x); return isNaN(n) ? 0 : n; }

  function analyze(){
    const contracts = getContracts();
    const warnings = [];
    // Heuristics
    contracts.forEach(c=>{
      const sparten = c.sparten||[];
      sparten.forEach(s=>{
        if(s.includes("Betriebshaftpflicht") && (c.deckungssumme||0) < 5000000){
          warnings.push("BHV: Deckungssumme < 5 Mio.");
        }
        if((s==="Inhalt"||s==="Gebäude") && ((c.gefahren||[]).length < 3)){
          warnings.push(s+": weniger als 3 Gefahren gewählt");
        }
        if(s==="Cyber" && (!c.gefahren || c.gefahren.length===0)){
          warnings.push("Cyber vorhanden, aber keine Bausteine gewählt");
        }
      });
    });

    // Missing lines of business
    const spartenSet = new Set(contracts.flatMap(c=>c.sparten||[]));
    const recommendations = [];
    if(!spartenSet.has("Cyber")) recommendations.push("Cyber ergänzen (Haftpflicht, Eigenschäden, Forensik…).");
    if(!spartenSet.has("Ertragsausfall/BU")) recommendations.push("Betriebsunterbrechung absichern.");
    if(!spartenSet.has("Rechtsschutz")) recommendations.push("Rechtsschutz prüfen und ergänzen.");

    // KPIs
    const sumAnnual = contracts.reduce((acc,c)=>acc + (c.jahresbeitragBrutto||0), 0);
    const targetPct = getTargetPct();
    const monthlySaving = (sumAnnual - (sumAnnual * (1 - targetPct/100))) / 12;
    const riskScore = Math.max(5, 95 - 10*warnings.length);

    const analysis = {warnings, recommendations, sumAnnual, targetPct, monthlySaving, riskScore, ts:new Date().toISOString()};
    setAnalysis(analysis);
    return analysis;
  }

  return {
    KEYS, safeGet, safeSet,
    exportAll, importAll, resetAll,
    toast, currencyDE, parseNum, analyze,
    getCustomer, setCustomer, getContracts, setContracts,
    getTargetPct, setTargetPct, getAnalysis, STD
  };
})();
