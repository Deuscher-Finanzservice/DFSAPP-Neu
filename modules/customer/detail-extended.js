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
    try{ dfsCloud && dfsCloud.save && dfsCloud.save('dfs.customerFiles', { id: `${id}:${meta.id}`, customerId: id, ...meta }); }catch{}
  }
  async function renderDocs(){
    let list=[];
    try{ const all = await (window.dfsCloud&&dfsCloud.loadAll? dfsCloud.loadAll('dfs.customerFiles') : Promise.resolve([])); list = (all||[]).filter(m=> String(m.customerId||'')===String(customerId)); }catch{}
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
      try{ dfsCloud && dfsCloud.delete && dfsCloud.delete('dfs.customerFiles', `${customerId}:${path}`); }catch{}
      try{ dfsToast('Dokument gelöscht','success'); }catch{}
      renderDocs();
    }));
  }

  function currentCustomer(){ return { id: customerId }; }
  async function saveCustomer(cust){ try{ await (window.dfsCloud&&dfsCloud.saveOne? dfsCloud.saveOne('dfs.customers', cust.id, cust):Promise.resolve()); }catch(e){ console.error(e); } }

  document.addEventListener('DOMContentLoaded', ()=>{
    const c = currentCustomer();
    if(c.bank){ if(c.bank.iban) document.getElementById('cust-bank-iban').value=c.bank.iban; if(c.bank.bic) document.getElementById('cust-bank-bic').value=c.bank.bic; if(c.bank.name) document.getElementById('cust-bank-name').value=c.bank.name; }
    if(c.tax){ if(c.tax.steuernummer) document.getElementById('cust-tax-steuernr').value=c.tax.steuernummer; if(c.tax.ustId) document.getElementById('cust-tax-ustid').value=c.tax.ustId; }
    renderRisk(c.risikoAdressen||[]);
    renderDocs();
  });
})();
