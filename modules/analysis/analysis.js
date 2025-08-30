(function(){
  async function runAnalysis(){
    if(window.dfsAnalysis && dfsAnalysis.analyzeGlobal){ const res = await dfsAnalysis.analyzeGlobal(); try{ window.dispatchEvent(new Event('dfs.analysis-changed')); }catch{} return res; }
    return { warnings:[], recommendations:[], sumAnnual:0, targetPct:10, monthlySaving:0, riskScore:95, ts:new Date().toISOString() };
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
