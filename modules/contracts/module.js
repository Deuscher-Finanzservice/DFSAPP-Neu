
(function(){
  const get = k=> JSON.parse(localStorage.getItem(k)||'null');
  const set = (k,v)=> localStorage.setItem(k, JSON.stringify(v));
  const uid = ()=> Math.random().toString(36).slice(2,10);
  let rows = get('dfs.contracts')||[];
  const tbody = document.querySelector('#table tbody');
  const modal = document.getElementById('modal');
  const form = document.getElementById('m-form');

  function render(){
    rows = get('dfs.contracts')||[];
    tbody.innerHTML = rows.map((r,i)=>{
      const neu = r.empfehlungBeitrag ?? r.vergleichDirektBeitrag;
      const ersp = (neu!=null)? (r.jahresbeitragBrutto - neu) : 0;
      const pct = (neu!=null && r.jahresbeitragBrutto) ? Math.round((ersp/r.jahresbeitragBrutto)*100) : 0;
      return `<tr>
        <td>${r.versicherer||''}</td>
        <td>${(r.sparten||[]).join(', ')}</td>
        <td>${fmtEur(r.jahresbeitragBrutto||0)}</td>
        <td>${neu!=null? fmtEur(neu): '—'}</td>
        <td>${neu!=null? fmtEur(ersp)+` (${pct}%)` : '—'}</td>
        <td style="text-align:right;">
          <button class="btn" data-edit="${r.id}">Bearbeiten</button>
          <button class="btn" data-del="${r.id}">Löschen</button>
        </td>
      </tr>`;
    }).join('');
  }
  function fmtEur(n){ return (n||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'}); }

  document.getElementById('add').onclick = ()=> openModal();
  document.getElementById('export').onclick = ()=>{
    const blob = new Blob([JSON.stringify(rows,null,2)], {type:'application/json'});
    const a = Object.assign(document.createElement('a'), {href:URL.createObjectURL(blob), download:'dfs_contracts.json'});
    a.click(); URL.revokeObjectURL(a.href);
  };
  document.getElementById('import').onclick = ()=> document.getElementById('file').click();
  document.getElementById('file').onchange = (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const arr = JSON.parse(reader.result);
        if(Array.isArray(arr)){
          const cleaned = arr.map(x=>({...x,
            id: x.id || uid(),
            sparten: Array.isArray(x.sparten)? x.sparten : [],
            gefahren: Array.isArray(x.gefahren)? x.gefahren : [],
            empfehlungen: Array.isArray(x.empfehlungen)? x.empfehlungen : (x.empfehlungen? String(x.empfehlungen).split(',').map(s=>s.trim()): []),
            jahresbeitragBrutto: Number(x.jahresbeitragBrutto)||0
          }));
          set('dfs.contracts', cleaned); render(); parent.postMessage({type:'toast', value:'Import erfolgreich.'}, '*');
        } else { throw new Error('Format ungültig'); }
      }catch(err){ parent.postMessage({type:'toast', value:'Import fehlgeschlagen.'}, '*'); }
    };
    reader.readAsText(file);
  };

  function openModal(id){
    modal.style.display='flex';
    form.reset();
    form.dataset.id = id || '';
    let data = {sparten:[], gefahren:[], zahlweise:'jährlich', empfehlungen:[]};
    if(id){ data = rows.find(r=>r.id===id) || data; }
    // fill
    [...form.elements].forEach(el=>{
      if(!el.name) return;
      const v = data[el.name];
      if(el.name==='sparten' || el.name==='gefahren'){
        [...el.options].forEach(o=> o.selected = Array.isArray(v) && v.includes(o.value));
      } else if (el.name==='empfehlungen'){
        el.value = Array.isArray(data.empfehlungen)? data.empfehlungen.join(', ') : (data.empfehlungen || '');
      } else {
        if(v!=null) el.value = v;
      }
    });
  }
  function closeModal(){ modal.style.display='none'; }
  document.getElementById('m-close').onclick = closeModal;
  document.getElementById('m-cancel').onclick = closeModal;
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

  tbody.addEventListener('click', (e)=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const id = btn.getAttribute('data-edit')||btn.getAttribute('data-del');
    if(btn.hasAttribute('data-edit')) openModal(id);
    else if(btn.hasAttribute('data-del')){
      const next = rows.filter(r=>r.id!==id);
      set('dfs.contracts', next); render(); parent.postMessage({type:'toast', value:'Vertrag gelöscht.'}, '*');
    }
  });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const o = { id: form.dataset.id || uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    [...form.elements].forEach(el=>{
      if(!el.name) return;
      if(el.name==='sparten' || el.name==='gefahren'){
        o[el.name] = [...el.selectedOptions].map(o=>o.value);
      } else if (el.name==='empfehlungen') {
        o[el.name] = el.value ? el.value.split(',').map(s=>s.trim()).filter(Boolean) : [];
      } else if (el.type==='number') {
        o[el.name] = el.value? Number(el.value): null;
      } else {
        o[el.name] = el.value;
      }
    });
    // upsert
    const idx = rows.findIndex(r=>r.id===o.id);
    if(idx>=0) rows[idx] = {...rows[idx], ...o, updatedAt:new Date().toISOString()}; else rows.push(o);
    set('dfs.contracts', rows); render(); closeModal(); parent.postMessage({type:'toast', value:'Gespeichert.'}, '*');
  });

  render();
})();