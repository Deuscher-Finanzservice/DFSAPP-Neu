// scripts/format.js
window.dfsFmt = (function(){
  const nfEUR = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  const nfDE  = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });

  function fmtEUR(n){ const v = Number(n ?? 0); return nfEUR.format(isFinite(v) ? v : 0); }
  function fmtNum(n){ const v = Number(n ?? 0); return nfDE.format(isFinite(v) ? v : 0); }

  // "1.234,56" -> 1234.56  ;  toleriert Leerzeichen
  function parseDE(s){
    if (s == null) return 0;
    if (typeof s === 'number') return s;
    const t = String(s).trim().replace(/\./g,'').replace(',', '.');
    const v = Number(t);
    return isFinite(v) ? v : 0;
  }

  // "YYYY-MM-DD" -> "DD.MM.YYYY"
  function fmtDateDE(iso){
    if(!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const p = n => String(n).padStart(2,'0');
    return `${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()}`;
  }

  return { fmtEUR, fmtNum, parseDE, fmtDateDE };
})();

