
(function(){
  const el = document.getElementById('f');
  const get = k=> JSON.parse(localStorage.getItem(k)||'null');
  const set = (k,v)=> localStorage.setItem(k, JSON.stringify(v));
  const data = get('dfs.customer')||{};
  [...el.elements].forEach(i=>{ if(i.name && data[i.name]!=null) i.value = data[i.name]; });
  el.addEventListener('submit',(e)=>{
    e.preventDefault();
    const o = {}; [...el.elements].forEach(i=>{ if(i.name){ o[i.name] = i.type==='number'? (i.value? Number(i.value): null) : i.value; } });
    set('dfs.customer', o); parent.postMessage({type:'toast', value:'Kunde gespeichert.'}, '*');
  });
  document.getElementById('fill').addEventListener('click', (e)=>{
    e.preventDefault();
    const demo = { firma:'Beispiel Bau GmbH', ansprech:'Anna Beispiel', telefon:'+49 69 123456', email:'', branche:'Handwerk', standort:'60311 Frankfurt', mitarbeiter:18, gruendung:2009 };
    set('dfs.customer', demo); [...el.elements].forEach(i=>{ if(i.name && demo[i.name]!=null) i.value = demo[i.name]; });
    parent.postMessage({type:'toast', value:'Demo-Kunde geladen.'}, '*');
  });
})();