
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

  function toast(msg){
    const el = document.getElementById('toast') || (parent && parent.document.getElementById('toast'));
    if(!el){ try{ alert(msg); }catch(e){} return; }
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'), 2000);
  }

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

  // === Standards & Empfehlungen pro Sparte ===
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
    // Basiselemente, die (fast) immer sinnvoll sind
    empfehlungenBase:[
      "Versicherungssumme prüfen",
      "Umstellung ins neue Tarifwerk prüfen"
    ],
    // Kontextspezifische Empfehlungen pro Sparte
    empfehlungenBySparte:{
      "Betriebshaftpflicht (BHV)": [
        "Deckungssumme mind. 10 Mio. pauschal",
        "Produkthaftpflicht einschließen/prüfen",
        "Tätigkeits-/Bearbeitungsschäden einschließen",
        "Mietsachschäden an Räumen ausreichend",
        "Schlüsselverlust (fremde Schlüssel) mitversichern",
        "Umwelt-Haftpflicht/-Schaden einschließen",
        "Subunternehmer mitversichert",
        "Ausland/USA-Kanada-Klausel prüfen"
      ],
      "Inhalt":[
        "Neuwert / Unterversicherungsschutz vereinbaren",
        "Elementar inkl. Starkregen/Rückstau prüfen",
        "Einbruchdiebstahl + Vandalismus nach Einbruch",
        "Überspannung/Induktionsschäden einschließen",
        "Außenversicherung (weltweit) und Transport mitversichern",
        "Kühlgut/Kälteanlagen (Verderb) prüfen",
        "Allgefahren/All-Risk-Deckung prüfen"
      ],
      "Gebäude":[
        "Grobe Fahrlässigkeit bis 100%",
        "Rückstau ausreichend versichert",
        "Ableitungsrohre innen/außen einschließen",
        "Photovoltaik/Solarthermie mitversichern",
        "Mietausfall/Mietwert absichern",
        "Glasbausteine/Glasschäden regeln"
      ],
      "Ertragsausfall/BU":[
        "Haftzeit auf 18/24/36 Monate prüfen",
        "Deckungsbasis: entgangener Gewinn + fortlaufende Kosten + Mehrkosten",
        "Rückwirkungsschäden Zulieferer/Abnehmer einschließen",
        "Behördliche Anordnungen (Seuchen/AVB-Klauseln) prüfen",
        "Wiederanlauffrist und Sublimits prüfen"
      ],
      "Cyber":[
        "Bausteine: Haftpflicht, Eigenschäden, Forensik, BU vollständig",
        "Social Engineering/CEO-Fraud abdecken",
        "Datenwiederherstellung & Forensik ausreichend",
        "Ransomware/Lösegeld-Kosten (rechtlich zulässig) regeln",
        "Mindestanforderungen (MFA/Backups/Patching) erfüllen",
        "Krisenkommunikation & PR einschließen"
      ],
      "Rechtsschutz":[
        "Arbeits-, Vertrags- und Straf-Rechtsschutz einschließen",
        "Spezial-Straf-Rechtsschutz für Organe",
        "Vertrags-RS für gewerbliche Verträge prüfen",
        "Mediation/Schlichtung optional vereinbaren"
      ],
      "D&O":[
        "Deckungssumme & Selbstbehalt prüfen",
        "Nachmeldefrist/Nachhaftung mind. 5 Jahre",
        "Innen- und Außenhaftung einschließen",
        "Anstellungsvertrags-RS ergänzen"
      ],
      "Gruppenunfall":[
        "Invaliditätssumme & Progression (350%/500%)",
        "Unfallrente prüfen",
        "Krankenhaus-/Genesungsgeld",
        "24/7-Deckung statt nur Dienst",
        "Wegeunfälle mitversichern"
      ]
    }
  };

  function getEmpfehlungenForSparten(sparten){
    const set = new Set(STD.empfehlungenBase);
    (sparten||[]).forEach(s=>{
      (STD.empfehlungenBySparte[s]||[]).forEach(x=>set.add(x));
    });
    return Array.from(set);
  }

  // Formatting helpers & math
  function currencyDE(n){ try{ return (n||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});}catch(e){ return n; } }
  function parseNum(v){ const x = (v||'').toString().replace(/\./g,'').replace(',','.'); const n = parseFloat(x); return isNaN(n) ? 0 : n; }

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

  // Data helpers
  function getCustomer(){ return safeGet(KEYS.customer, null); }
  function setCustomer(obj){ return safeSet(KEYS.customer, obj); }

  function getContracts(){ return safeGet(KEYS.contracts, []); }
  function setContracts(arr){ return safeSet(KEYS.contracts, arr); }

  function getTargetPct(){ return safeGet(KEYS.targetSavingsPct, 0); }
  function setTargetPct(v){ return safeSet(KEYS.targetSavingsPct, v); }

  function setAnalysis(obj){ return safeSet(KEYS.analysis, obj); }
  function getAnalysis(){ return safeGet(KEYS.analysis, null); }

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
    KEYS, STD,
    safeGet, safeSet,
    exportAll, importAll, resetAll,
    toast, currencyDE, parseNum, analyze,
    getCustomer, setCustomer, getContracts, setContracts,
    getTargetPct, setTargetPct, getAnalysis,
    getEmpfehlungenForSparten
  };
})();
