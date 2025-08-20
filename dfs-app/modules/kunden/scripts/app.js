(function() {
  const KEY = 'dfs.customer';
  const $ = (id) => document.getElementById(id);

  const fields = ['companyName','contactName','email','phone','industry','employees','revenue','foundedYear'];

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch(e) { return null; }
  }

  function write(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      showSaved();
      updatePreview();
    } catch(e) {
      toast('Speichern im Browser nicht möglich.');
    }
  }

  function collect() {
    const data = {};
    fields.forEach(f => data[f] = (document.getElementById(f).value || '').trim());
    const now = new Date().toISOString();
    data.updatedAt = now;
    if(!read()) data.createdAt = now; else data.createdAt = read().createdAt || now;
    // Normalize numeric
    if (data.employees !== '') data.employees = parseInt(data.employees, 10);
    if (data.revenue !== '') data.revenue = parseFloat(data.revenue);
    if (data.foundedYear !== '') data.foundedYear = parseInt(data.foundedYear, 10);
    return data;
  }

  function fill(data) {
    if (!data) return;
    fields.forEach(f => {
      if (data[f] !== undefined && data[f] !== null) {
        document.getElementById(f).value = data[f];
      }
    });
    updatePreview();
  }

  function validate() {
    let ok = true;
    const company = $('companyName').value.trim();
    const email = $('email').value.trim();

    $('err_companyName').style.display = company ? 'none' : 'block';
    if (!company) ok = false;

    const emailValid = !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    $('err_email').style.display = emailValid ? 'none' : 'block';
    if (!emailValid) ok = false;

    return ok;
  }

  function showSaved() {
    const box = $('saveSuccess');
    box.style.display = 'block';
    setTimeout(() => box.style.display = 'none', 1500);
  }

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 2000);
  }

  function updatePreview() {
    const tbody = document.querySelector('#previewTable tbody');
    tbody.innerHTML = '';
    const data = read();
    if (!data) return;
    Object.keys(data).forEach(k => {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td'); td1.textContent = k;
      const td2 = document.createElement('td'); td2.textContent = String(data[k]);
      tr.appendChild(td1); tr.appendChild(td2);
      tbody.appendChild(tr);
    });
  }

  // Autosave on change
  fields.forEach(f => {
    const el = $(f);
    el.addEventListener('change', () => {
      if (validate()) write(collect());
      else updatePreview();
    });
  });

  $('btnSave').addEventListener('click', () => {
    if (!validate()) { toast('Bitte Pflichtfelder prüfen.'); return; }
    write(collect());
  });

  $('btnReset').addEventListener('click', () => {
    if (confirm('Alle Eingaben zurücksetzen?')) {
      localStorage.removeItem(KEY);
      fields.forEach(f => $(f).value = '');
      updatePreview();
      toast('Zurückgesetzt.');
    }
  });

  // Export
  $('btnExport').addEventListener('click', () => {
    const data = read() || collect();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'dfs_customer.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  });

  // Import
  $('fileImport').addEventListener('change', (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        write(data);
        fill(data);
        toast('Import erfolgreich.');
      } catch(e) {
        toast('Ungültige JSON-Datei.');
      }
    };
    reader.readAsText(file);
  });

  // Navigation to Verträge (works in Shell-iframe, falls vorhanden)
  $('btnNext').addEventListener('click', () => {
    if (!validate()) { toast('Bitte Pflichtfelder prüfen.'); return; }
    write(collect());
    // Try to go to sibling module path relative to this module location:
    // If this module is under /modules/kunden/, then ../vertraege/index.html exists.
    const target = '../vertraege/index.html';
    try {
      // Navigate the current browsing context (works inside iframe)
      window.location.assign(target);
    } catch(e) {
      toast('Konnte nicht navigieren – bitte in der Shell „Verträge“ öffnen.');
    }
  });

  // Show "Zur Shell" button only if the shell is reachable
  (async () => {
    try {
      const res = await fetch('../../index.html', { method: 'HEAD' });
      if (!res.ok) throw 0;
      // okay, keep visible
    } catch(e) {
      // hide button if running standalone without shell
      const btn = document.getElementById('btnToShell');
      if (btn) btn.style.display = 'none';
    }
  })();

  // Initial fill & preview
  fill(read());
  updatePreview();
})();