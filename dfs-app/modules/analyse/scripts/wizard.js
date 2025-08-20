(function(){
  const KEY_CUSTOMER = 'dfs.customer';
  const KEY_CONTRACTS = 'dfs.contracts';
  const KEY_TARGET = 'dfs.targetSavingsPct';
  const KEY_ANALYSIS = 'dfs.analysis';

  let rules = null;
  const steps = ['step1','step2','step3','step4'];
  let current = 0;
  const $ = (id)=>document.getElementById(id);

  function loadLocal(key, def=null){
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : def; }
    catch(e){ return def; }
  }
  function saveLocal(key, val){
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){}
  }

  function euro(n){ return (n||0).toLocaleString('de-DE', {minimumFractionDigits:2, maximumFractionDigits:2}); }

  function setProgress(){
    $('progress').style.width = ((current+1)/steps.length*100)+'%';
    // steps pills
    const s = $('steps');
    s.innerHTML='';
    const labels = ['Basisdaten','Risiko-Check','Einsparung','Zusammenfassung'];
    labels.forEach((lab,i)=>{
      const span = document.createElement('div');
      span.className='step'+(i===current?' active':'');
      span.textContent=(i+1)+') '+lab;
      s.appendChild(span);
    });
    steps.forEach((id, i)=> $(id).classList.toggle('hidden', i!==current));
  }

  function renderStep1(){
    const cust = loadLocal(KEY_CUSTOMER, {});
    const cont = loadLocal(KEY_CONTRACTS, []);
    // customer table
    const tbody1 = $('tblCustomer').querySelector('tbody'); tbody1.innerHTML='';
    Object.entries(cust||{}).forEach(([k,v])=>{
      const tr=document.createElement('tr');
      tr.innerHTML = `<td style="color:#C0C0C0">${k}</td><td>${String(v)}</td>`;
      tbody1.appendChild(tr);
    });
    // contracts table
    const tbody2 = $('tblContracts').querySelector('tbody'); tbody2.innerHTML='';
    (cont||[]).forEach((c,i)=>{
      const tr=document.createElement('tr');
      const sparte=(c.sparten&&c.sparten[0])||'';
      tr.innerHTML = `<td style="color:#C0C0C0">#${i+1}</td>
                      <td>${sparte}</td>
                      <td>${c.versicherer||''}${c.produkt?' / '+c.produkt:''}</td>
                      <td>${c.policeNr||''}</td>
                      <td>${c.beginn||''}${c.ende?' – '+c.ende:''}</td>
                      <td>${c.jahresbeitragBrutto!=null? euro(Number(c.jahresbeitragBrutto)) : ''}</td>`;
      tbody2.appendChild(tr);
    });
  }

  function getTextNumberDays(txt){
    if(!txt) return 0;
    // crude parser: look for number and "Monat" ~30 days, else "Tag(e)"
    const num = parseInt(String(txt).replace(/[^\d]/g,''),10);
    if(isNaN(num)) return 0;
    if(/monat/i.test(txt)) return num*30;
    if(/tag/i.test(txt)) return num;
    // else assume days
    return num;
  }

  function existsSparte(contracts, name){
    return (contracts||[]).some(c => (c.sparten&&c.sparten[0])===name);
  }
  function notExistsSparte(contracts,name){ return !existsSparte(contracts,name); }

  function contractFieldLtIfSparte(contracts, sparte, field, val){
    const relevant = (contracts||[]).filter(c => (c.sparten&&c.sparten[0])===sparte);
    if(relevant.length===0) return false;
    const minVal = Math.min(...relevant.map(c => Number(c[field])||Infinity));
    return minVal < Number(val);
  }

  function anyContractEndWithinDays(contracts, days){
    const now = new Date();
    return (contracts||[]).some(c=>{
      if(!c.ende) return false;
      const d = new Date(c.ende);
      const diff = (d - now)/(1000*60*60*24);
      return diff >= 0 && diff < days;
    });
  }

  function anyContractNoticeAtLeastDays(contracts, days){
    return (contracts||[]).some(c => getTextNumberDays(c.kuendigungsfrist) >= days);
  }

  function customerIndustryIn(cust, arr){
    const ind = String(cust.industry||'').toLowerCase();
    return arr.some(x=> ind.includes(String(x).toLowerCase()));
  }

  function evaluateRules(cust, contracts){
    const res = [];
    (rules.rules||[]).forEach(r=>{
      const ok = (r.conditions||[]).every(cond=>{
        switch(cond.type){
          case 'notExistsContractWithSparte': return notExistsSparte(contracts, cond.value);
          case 'existsContractWithSparte': return existsSparte(contracts, cond.value);
          case 'customerIndustryIn': return customerIndustryIn(cust, cond.values||[]);
          case 'customerRevenueGte': return Number(cust.revenue||0) >= Number(cond.value);
          case 'customerEmployeesGte': return Number(cust.employees||0) >= Number(cond.value);
          case 'contractFieldLtIfSparte': return contractFieldLtIfSparte(contracts, cond.sparte, cond.field, cond.value);
          case 'contractEndWithinDays': return anyContractEndWithinDays(contracts, Number(cond.value));
          case 'contractNoticeAtLeastDays': return anyContractNoticeAtLeastDays(contracts, Number(cond.value));
          default: return false;
        }
      });
      if(ok){
        res.push({ level: r.level, message: r.message, id: r.id });
      }
    });
    return res;
  }

  function renderStep2(){
    const cust = loadLocal(KEY_CUSTOMER, {});
    const contracts = loadLocal(KEY_CONTRACTS, []);
    const warn = evaluateRules(cust, contracts);

    const penalties = rules.defaults.penalty;
    let score = rules.defaults.scoreStart;
    let timeCrit = 0;

    warn.forEach(w=>{
      if(w.level==='hoch') score -= penalties.hoch;
      else if(w.level==='mittel') score -= penalties.mittel;
      else score -= penalties.niedrig;
      if(w.id==='cancellation_window') timeCrit++;
    });
    score = Math.max(0, Math.min(100, score));

    $('scoreVal').textContent = String(score);
    $('warnCount').textContent = String(warn.length);
    $('timeCrit').textContent = String(timeCrit);

    const list = $('warnList'); list.innerHTML='';
    warn.forEach(w=>{
      const div = document.createElement('div');
      div.className = w.level==='hoch' ? 'warn-item' : (w.level==='mittel' ? 'mid-item' : 'low-item');
      div.textContent = `${w.level.toUpperCase()}: ${w.message}`;
      list.appendChild(div);
    });

    // stash for later
    window.__dfs_warn = warn;
    window.__dfs_score = score;
  }

  function renderStep3(){
    const contracts = loadLocal(KEY_CONTRACTS, []);
    const sum = (contracts||[]).reduce((a,c)=> a + (Number(c.jahresbeitragBrutto)||0), 0);
    $('sumPremium').textContent = euro(sum)+' €';

    let target = localStorage.getItem(KEY_TARGET);
    target = target!=null ? parseFloat(target) : NaN;
    if (isNaN(target)) target = rules.defaults.targetSavingsDefaultPct*100;
    $('targetPct').textContent = target.toFixed(1).replace('.', ',') + ' %';

    const band = rules.defaults.targetSavingsBand;
    const estLow = sum * band[0];
    const estHigh = sum * band[1];
    $('savingsEst').textContent = `${euro(estLow)} – ${euro(estHigh)} €`;

    // stash
    window.__dfs_sum = sum;
    window.__dfs_targetPct = (localStorage.getItem(KEY_TARGET)!=null) ? (parseFloat(localStorage.getItem(KEY_TARGET))/100) : rules.defaults.targetSavingsDefaultPct;
    window.__dfs_est = [estLow, estHigh];
  }

  function renderStep4(){
    const analysis = {
      timestamp: new Date().toISOString(),
      customerId: null,
      score: window.__dfs_score ?? null,
      warnings: window.__dfs_warn ?? [],
      gaps: (window.__dfs_warn||[]).filter(w => /fehl|empfohlen/i.test(w.message)).map(w => ({ detail: w.message })),
      premiumSum: window.__dfs_sum ?? 0,
      targetSavingsPct: window.__dfs_targetPct ?? rules.defaults.targetSavingsDefaultPct,
      estimatedSavings: window.__dfs_sum ? (window.__dfs_sum * (window.__dfs_targetPct ?? rules.defaults.targetSavingsDefaultPct)) : 0
    };
    saveLocal(KEY_ANALYSIS, analysis);
    $('analysisJson').textContent = JSON.stringify(analysis, null, 2);
  }

  function exportAnalysis(){
    const data = loadLocal(KEY_ANALYSIS, {});
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'dfs_analysis.json';
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 500);
  }

  // Buttons
  $('btnReload').addEventListener('click', renderStep1);
  $('btnNext1').addEventListener('click', ()=>{ current=1; setProgress(); renderStep2(); });
  $('btnBack2').addEventListener('click', ()=>{ current=0; setProgress(); });
  $('btnNext2').addEventListener('click', ()=>{ current=2; setProgress(); renderStep3(); });
  $('btnBack3').addEventListener('click', ()=>{ current=1; setProgress(); });
  $('btnNext3').addEventListener('click', ()=>{ current=3; setProgress(); renderStep4(); });
  $('btnBack4').addEventListener('click', ()=>{ current=2; setProgress(); });

  $('btnExport').addEventListener('click', exportAnalysis);

  // Load rules then init step 1
  fetch('./assets/rules.json').then(r=>r.json()).then(j=>{ rules=j; setProgress(); renderStep1(); });
})();