(function(){
  const $ = (id)=>document.getElementById(id);
  function euro(n){ return (n||0).toLocaleString('de-DE',{minimumFractionDigits:2, maximumFractionDigits:2})+' €'; }
  function read(key, def){ try{ const raw=localStorage.getItem(key); return raw? JSON.parse(raw): def; }catch(e){ return def; } }

  const analysis = read('dfs.analysis', null) || {};
  const contracts = read('dfs.contracts', []);
  const targetPct = (localStorage.getItem('dfs.targetSavingsPct')!=null) ? (parseFloat(localStorage.getItem('dfs.targetSavingsPct'))/100) : (analysis.targetSavingsPct ?? 0.08);

  const sum = contracts.reduce((a,c)=> a + (Number(c.jahresbeitragBrutto)||0), 0);
  const recSum = sum * (1 - (isNaN(targetPct)?0.08:targetPct));
  const saving = sum - recSum;

  $('score').textContent = analysis.score != null ? String(analysis.score) : '–';
  $('sumBestand').textContent = euro(sum);
  $('zielPct').textContent = ((isNaN(targetPct)?0.08:targetPct)*100).toFixed(1).replace('.',',')+' %';
  $('ersparnis').textContent = euro(saving);

  // Chart bars (2 columns)
  const chart = $('chartBars');
  const maxVal = Math.max(sum, recSum, 1);
  function col(h){ const div=document.createElement('div'); div.className='col'; div.style.height = (h/maxVal*160)+'px'; return div; }
  chart.appendChild(col(sum));    // Bestand
  const c2 = col(recSum); c2.style.background='rgba(192,192,192,.6)'; c2.style.border='1px solid rgba(192,192,192,1)';
  chart.appendChild(c2);

  // Hints / warnings
  const hints = $('hints');
  const warns = analysis.warnings || [];
  if (!warns.length) {
    const p = document.createElement('p'); p.textContent = 'Keine Warnungen erkannt.'; p.className='small'; hints.appendChild(p);
  } else {
    warns.slice(0,5).forEach(w=>{
      const div = document.createElement('div');
      div.className = w.level==='hoch' ? 'warn-item' : (w.level==='mittel' ? 'mid-item' : 'low-item');
      div.textContent = `${w.level.toUpperCase()}: ${w.message}`;
      hints.appendChild(div);
    });
  }

  // Table rows
  const tbody = document.querySelector('#tbl tbody');
  contracts.slice(0,50).forEach((c,i)=>{
    const tr = document.createElement('tr');
    const best = Number(c.jahresbeitragBrutto)||0;
    const proj = best * (1 - (isNaN(targetPct)?0.08:targetPct));
    tr.innerHTML = `<td>${i+1}</td>
                    <td>${(c.sparten&&c.sparten[0])||''}</td>
                    <td>${c.versicherer||''}${c.produkt?' / '+c.produkt:''}</td>
                    <td>${c.policeNr||''}</td>
                    <td>${euro(best)}</td>
                    <td>${euro(proj)}</td>`;
    tbody.appendChild(tr);
  });
})();