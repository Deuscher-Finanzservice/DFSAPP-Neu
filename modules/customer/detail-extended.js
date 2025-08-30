(function(){
  const qs = new URLSearchParams(location.search);
  const customerId = qs.get('id');

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.acc-item .acc-head').forEach(h=>{
      h.addEventListener('click', ()=> h.parentElement.classList.toggle('open'));
    });
  });

  function renderRisk(risks){
    const wrap = document.getElementById('risk-list'); if(!wrap) return;
    wrap.innerHTML = (risks||[]).map((r,i)=>`
      <div class="doc-row">
        <input class="input" data-idx="${i}" data-k="adresse" value="${r.adresse||''}" placeholder="Adresse" style="flex:1">
        <input class="input" data-idx="${i}" data-k="notiz" value="${r.notiz||''}" placeholder="Notiz" style="flex:1">
        <button class="btn-ghost" data-del="${i}">Löschen</button>
      </div>
    `).join('');
    wrap.querySelectorAll('input').forEach(inp=>{
      inp.addEventListener('input', ()=>{
        const idx = Number(inp.dataset.idx), k = inp.dataset.k;
        const cust = currentCustomer();
        cust.risikoAdressen = cust.risikoAdressen||[];
        cust.risikoAdressen[idx] = { ...(cust.risikoAdressen[idx]||{}), [k]: inp.value };
        saveCustomer(cust);
      });
    });
    wrap.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const idx = Number(btn.dataset.del);
        const cust = currentCustomer();
        (cust.risikoAdressen||[]).splice(idx,1);
        saveCustomer(cust);
        renderRisk(cust.risikoAdressen||[]);
      });
    });
  }
  document.getElementById('risk-add')?.addEventListener('click', ()=>{
    const cust = currentCustomer();
    cust.risikoAdressen = cust.risikoAdressen||[];
    cust.risikoAdressen.push({ adresse:'', notiz:'' });
    saveCustomer(cust);
    renderRisk(cust.risikoAdressen);
  });

  ['cust-bank-iban','cust-bank-bic','cust-bank-name','cust-tax-steuernr','cust-tax-ustid']
    .forEach(id=>{
      const el = document.getElementById(id);
      el?.addEventListener('input', ()=>{
        const cust = currentCustomer();
        cust.bank = cust.bank||{}; cust.tax=cust.tax||{};
        if(id==='cust-bank-iban')  cust.bank.iban = el.value.trim();
        if(id==='cust-bank-bic')   cust.bank.bic  = el.value.trim();
        if(id==='cust-bank-name')  cust.bank.name = el.value.trim();
        if(id==='cust-tax-steuernr') cust.tax.steuernummer = el.value.trim();
        if(id==='cust-tax-ustid')    cust.tax.ustId = el.value.trim();
        saveCustomer(cust);
      });
    });

  const fileInput = document.getElementById('cust-file-input');
  fileInput?.addEventListener('change', async (e)=>{
    const f = e.target.files?.[0]; if(!f) return;
    if(!customerId){ try{ dfsToast('Kunde erst speichern/anlegen','error'); }catch{} return; }
    try{
      const meta = await dfsFiles.uploadCustomerFile(customerId, f);
      upsertCustomerFile(customerId, meta);
      try{ dfsToast('Dokument hochgeladen','success'); }catch{}
      renderDocs();
    }catch(err){ console.error(err); try{ dfsToast('Upload fehlgeschlagen','error'); }catch{} }
    finally{ e.target.value=''; }
  });

  function upsertCustomerFile(id, meta){
    const map = dfsStore.get('dfs.customerFiles', {});
    const list = map[id] || []; list.push(meta); map[id] = list;
    dfsStore.set('dfs.customerFiles', map);
    try{ dfsCloud && dfsCloud.save && dfsCloud.save('dfs.customerFiles', { id: `${id}:${meta.id}`, customerId: id, ...meta }); }catch{}
  }
  function renderDocs(){
    const map = dfsStore.get('dfs.customerFiles', {});
    const list = map[customerId] || [];
    const box = document.getElementById('cust-docs'); if(!box) return;
    box.innerHTML = list.length ? list.map(m=>`
      <div class="doc-row">
        <span class="pill">${m.type||'datei'}</span>
        <a href="${m.url}" target="_blank">${m.name}</a>
        <span class="text-secondary">${(m.size/1024).toFixed(0)} KB</span>
        <div class="doc-actions">
          <button class="btn-ghost" data-open="${m.url}">Öffnen</button>
          <button class="btn-ghost" data-del="${m.id}">Löschen</button>
        </div>
      </div>
    `).join('') : '<p class="text-secondary">Keine Dokumente.</p>';
    box.querySelectorAll('[data-open]').forEach(b=> b.addEventListener('click', ()=> window.open(b.dataset.open,'_blank')));
    box.querySelectorAll('[data-del]').forEach(b=> b.addEventListener('click', async ()=>{
      const path = b.dataset.del; if(!confirm('Datei wirklich löschen?')) return;
      await dfsFiles.removeByPath(path);
      const map = dfsStore.get('dfs.customerFiles', {});
      map[customerId] = (map[customerId]||[]).filter(m=>m.id!==path);
      dfsStore.set('dfs.customerFiles', map);
      try{ dfsToast('Dokument gelöscht','success'); }catch{}
      renderDocs();
    }));
  }

  function currentCustomer(){
    const all = dfsStore.get('dfs.customers', []);
    return all.find(c=>c.id===customerId) || { id: customerId };
  }
  function saveCustomer(cust){
    let all = dfsStore.get('dfs.customers', []);
    const i = all.findIndex(x=>x.id===cust.id);
    if(i>=0) all[i] = { ...all[i], ...cust, updatedAt: new Date().toISOString() };
    else all.push({ ...cust, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    dfsStore.set('dfs.customers', all);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const c = currentCustomer();
    if(c.bank){ if(c.bank.iban) document.getElementById('cust-bank-iban').value=c.bank.iban; if(c.bank.bic) document.getElementById('cust-bank-bic').value=c.bank.bic; if(c.bank.name) document.getElementById('cust-bank-name').value=c.bank.name; }
    if(c.tax){ if(c.tax.steuernummer) document.getElementById('cust-tax-steuernr').value=c.tax.steuernummer; if(c.tax.ustId) document.getElementById('cust-tax-ustid').value=c.tax.ustId; }
    renderRisk(c.risikoAdressen||[]);
    renderDocs();
  });
})();

