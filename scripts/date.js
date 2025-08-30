// scripts/date.js
window.dfsDate = (function(){
  function parseISO(s){
    if(!s) return null;
    const [y,m,d] = String(s).split('-').map(Number);
    return new Date(y, (m||1)-1, d||1);
  }
  function toISO(d){
    if(!(d instanceof Date) || isNaN(d)) return '';
    const p = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  }
  function addYears(d,y){ const n=new Date(d); n.setFullYear(n.getFullYear()+y); return n; }
  function minusMonths(d,m){ const n=new Date(d); n.setMonth(n.getMonth()-m); return n; }
  return { parseISO, toISO, addYears, minusMonths };
})();

