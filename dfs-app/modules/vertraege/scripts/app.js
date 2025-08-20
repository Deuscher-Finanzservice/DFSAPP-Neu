(function() {
  const KEY_CONTRACTS = 'dfs.contracts';
  const KEY_TARGET = 'dfs.targetSavingsPct';

  const $ = (id) => document.getElementById(id);
  const tblBody = document.querySelector('#tbl tbody');
  const toastEl = $('toast');
  const modal = $('modalBackdrop');
  const mode = { current: 'create', editId: null };

  function uuid() { return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36); }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.style.display = 'block';
    setTimeout(()=> toastEl.style.display='none', 2000);
  }

  function readContracts() {
    try { return JSON.parse(localStorage.getItem(KEY_CONTRACTS) || '[]'); } catch(e) { return []; }
  }
  function writeContracts(arr) {
    try { localStorage.setItem(KEY_CONTRACTS, JSON.stringify(arr)); } catch(e) {}
  }

  function readTarget() {
    try {
      const v = localStorage.getItem(KEY_TARGET);
      if (v === null || v === undefined || v === '') return '';
      return String(parseFloat(v));
    } catch(e) { return ''; }
  }
  function writeTarget(v) {
    try { localStorage.setItem(KEY_TARGET, String(v)); } catch(e) {}
  }

  function formatEuro(n) {
    if (n === null || n === undefined || isNaN(n)) return '0,00';
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function sumPremium(arr) {
    return arr.reduce((acc, x) => acc + (Number(x.jahresbeitragBrutto) || 0), 0);
  }

  function mapFormToObj() {
    let sparte = $('m_sparte').value;
    if (sparte === '__free') sparte = $('m_sparte_free').value.trim();

    const obj = {
      id: mode.current === 'edit' ? mode.editId : uuid(),
      sparten: sparte ? [sparte] : [],
      versicherer: $('m_versicherer').value.trim(),
      produkt: $('m_produkt').value.trim(),
      policeNr: $('m_police').value.trim(),
      beginn: $('m_beginn').value,
      hauptfaellig: $('m_hauptfaellig').value.trim(),
      ende: $('m_ende').value,
      zahlweise: $('m_zahlweise').value,
      jahresbeitragBrutto: $('m_beitrag').value ? parseFloat($('m_beitrag').value) : null,
      deckungssumme: $('m_deckung').value ? parseFloat($('m_deckung').value) : null,
      selbstbehalt: $('m_sb').value ? parseFloat($('m_sb').value) : null,
      kuendigungsfrist: $('m_fr').value.trim(),
      risikostandort: $('m_risiko').value.trim(),
      vermittlernummer: $('m_vermittler').value.trim(),
      notizen: $('m_notes').value.trim(),
      updatedAt: new Date().toISOString()
    };
    if (!obj.createdAt) obj.createdAt = new Date().toISOString();
    return obj;
  }

  function validateObj(o) {
    const errs = [];
    if (!o.sparten || o.sparten.length === 0) errs.push('Sparte fehlt');
    if (!o.versicherer) errs.push('Versicherer fehlt');
    if (!o.policeNr) errs.push('Police-Nr. fehlt');
    if (!o.beginn) errs.push('Beginn fehlt');
    if (o.jahresbeitragBrutto === null || isNaN(o.jahresbeitragBrutto)) errs.push('Jahresbeitrag fehlt');
    return errs;
  }

  function openModal(o) {
    $('m_sparte').value = '';
    $('m_sparte_free').style.display = 'none';
    $('m_sparte_free').value = '';
    ['m_versicherer','m_produkt','m_police','m_beginn','m_ende','m_hauptfaellig','m_zahlweise','m_beitrag','m_deckung','m_sb','m_fr','m_risiko','m_vermittler','m_notes']
      .forEach(id => $(id).value = '');
    $('m_delete').style.display = 'none';

    if (o) {
      const sparte = (o.sparten && o.sparten[0]) || '';
      const known = Array.from($('m_sparte').options).some(opt => opt.value === sparte || opt.text === sparte);
      if (known) {
        $('m_sparte').value = sparte;
        $('m_sparte_free').style.display = 'none';
      } else if (sparte) {
        $('m_sparte').value = '__free';
        $('m_sparte_free').style.display = 'block';
        $('m_sparte_free').value = sparte;
      }

      $('m_versicherer').value = o.versicherer || '';
      $('m_produkt').value = o.produkt || '';
      $('m_police').value = o.policeNr || '';
      $('m_beginn').value = o.beginn || '';
      $('m_ende').value = o.ende || '';
      $('m_hauptfaellig').value = o.hauptfaellig || '';
      $('m_zahlweise').value = o.zahlweise || 'jährlich';
      $('m_beitrag').value = (o.jahresbeitragBrutto ?? '') === '' ? '' : o.jahresbeitragBrutto;
      $('m_deckung').value = (o.deckungssumme ?? '') === '' ? '' : o.deckungssumme;
      $('m_sb').value = (o.selbstbehalt ?? '') === '' ? '' : o.selbstbehalt;
      $('m_fr').value = o.kuendigungsfrist || '';
      $('m_risiko').value = o.risikostandort || '';
      $('m_vermittler').value = o.vermittlernummer || '';
      $('m_notes').value = o.notizen || '';
      $('m_delete').style.display = 'inline-flex';
    }

    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  $('m_sparte').addEventListener('change', () => {
    $('m_sparte_free').style.display = $('m_sparte').value === '__free' ? 'block' : 'none';
  });

  $('btnAdd').addEventListener('click', () => { mode.current='create'; mode.editId=null; openModal(null); });

  $('btnClose').addEventListener('click', closeModal);
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

  $('m_save').addEventListener('click', () => {
    const obj = mapFormToObj();
    const errs = validateObj(obj);
    if (errs.length) { toast('Bitte prüfen: ' + errs.join(', ')); return; }

    const arr = readContracts();
    if (mode.current === 'edit') {
      const idx = arr.findIndex(x => x.id === mode.editId);
      if (idx >= 0) arr[idx] = { ...arr[idx], ...obj, id: mode.editId };
    } else {
      arr.push(obj);
    }
    writeContracts(arr);
    render();
    closeModal();
    toast('Gespeichert.');
  });

  $('m_delete').addEventListener('click', () => {
    if (!mode.editId) return;
    if (!confirm('Diesen Vertrag löschen?')) return;
    const arr = readContracts().filter(x => x.id !== mode.editId);
    writeContracts(arr);
    render();
    closeModal();
    toast('Gelöscht.');
  });

  function render() {
    const arr = readContracts();
    tblBody.innerHTML = '';
    arr.forEach(x => {
      const tr = document.createElement('tr');
      const tds = [];
      const sparteTxt = (x.sparten && x.sparten[0]) || '';
      tds.push(sparteTxt || '');
      tds.push(`${x.versicherer || ''}${x.produkt ? ' / ' + x.produkt : ''}`);
      tds.push(`${x.policeNr || ''}`);
      tds.push(`${x.beginn || ''}${x.ende ? ' – ' + x.ende : ''}`);
      tds.push(`${x.hauptfaellig || ''}`);
      tds.push(`${x.zahlweise || ''}`);
      tds.push(formatEuro(Number(x.jahresbeitragBrutto) || 0));
      tds.push(x.deckungssumme ? x.deckungssumme.toLocaleString('de-DE') : '');
      tds.push(x.selbstbehalt ? x.selbstbehalt.toLocaleString('de-DE') : '');
      tds.push(`${x.kuendigungsfrist || ''}`);
      tds.forEach(val => {
        const td = document.createElement('td'); td.textContent = val; tr.appendChild(td);
      });
      const tdAct = document.createElement('td');
      const edit = document.createElement('span'); edit.className = 'link'; edit.textContent = 'Bearbeiten';
      edit.addEventListener('click', () => { mode.current='edit'; mode.editId=x.id; openModal(x); });
      const del = document.createElement('span'); del.className = 'link'; del.style.marginLeft='8px'; del.textContent = 'Löschen';
      del.addEventListener('click', () => {
        if (!confirm('Diesen Vertrag löschen?')) return;
        writeContracts(readContracts().filter(y => y.id !== x.id)); render(); toast('Gelöscht.');
      });
      tdAct.appendChild(edit); tdAct.appendChild(del);
      tr.appendChild(tdAct);
      tblBody.appendChild(tr);
    });

    $('sum').textContent = formatEuro(sumPremium(arr));
  }

  // Target savings
  $('btnSaveTarget').addEventListener('click', () => {
    const v = $('targetPct').value.trim();
    if (v === '' || isNaN(parseFloat(v))) { toast('Ungültiger Wert.'); return; }
    writeTarget(parseFloat(v));
    $('targetSaved').style.display = 'inline';
    setTimeout(()=> $('targetSaved').style.display = 'none', 1200);
  });

  // Export/Import
  $('btnExport').addEventListener('click', () => {
    const data = readContracts();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'dfs_contracts.json';
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 500);
  });
  $('fileImport').addEventListener('change', (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(reader.result);
        if (!Array.isArray(arr)) throw 0;
        writeContracts(arr);
        render();
        toast('Import erfolgreich.');
      } catch(e) { toast('Ungültige JSON-Datei.'); }
    };
    reader.readAsText(file);
  });

  // To Analyse
  $('btnToAnalyse').addEventListener('click', () => {
    try { window.location.assign('../analyse/index.html'); }
    catch(e) { toast('Navigation nicht möglich.'); }
  });

  // Init
  (function init(){
    // fill target field
    const t = readTarget();
    if (t !== '') $('targetPct').value = t;
    render();
  })();
})();