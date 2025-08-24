
window.DFS=(function(){
  const KEYS={customer:'dfs.customer',contracts:'dfs.contracts',analysis:'dfs.analysis',targetSavingsPct:'dfs.targetSavingsPct'};
  function toast(m){const el=parent.document.getElementById('toast')||document.getElementById('toast'); if(!el){alert(m);return;} el.textContent=m; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1800);}
  function get(key,f){try{const r=localStorage.getItem(key);return r?JSON.parse(r):f}catch(e){return f}}
  function set(key,v){try{localStorage.setItem(key,JSON.stringify(v));}catch(e){toast('Speicher voll');}}
  const STD={gefahrenBySparte:{"Betriebshaftpflicht (BHV)":["Personen-/Sachschäden","Vermögensfolgeschäden","Produkthaftpflicht","Mietsachschäden","Umwelt-Haftpflicht"],"Inhalt":["Feuer","Leitungswasser","Einbruchdiebstahl","Sturm/Hagel","Elementar"],"Gebäude":["Feuer","Leitungswasser","Sturm/Hagel","Elementar"],"Ertragsausfall/BU":["Feuer","Leitungswasser","Sturm/Hagel","Elementar","Betriebsunterbrechung nach Sachschaden"],"Cyber":["Haftpflicht","Eigenschäden","Forensik","Datenwiederherstellung","Betriebsunterbrechung"],"Rechtsschutz":["Arbeits-RS","Vertrags-RS","Straf-RS"],"D&O":["Organhaftung","Anstellungsvertrags-RS"],"Gruppenunfall":["Unfalltod","Invalidität","Krankenhaustagegeld"]},
    alteEmpfehlungenBySparte:{
      "Betriebshaftpflicht (BHV)":["sonstige Tätigkeitsschäden mitversichert","viele Deckungserweiterungen","höhere Deckungssumme","Spezielles Deckungskonzept","erweiterte Produkthaftung","Nachbesserungsbegleitschäden mitversichert","Obhutsschäden mitversichert","Be- und Entladeschäden mitversichert","Privat-/ Hundehalterhaftpflicht inklusive","Basis Deckung","Premium Deckung","Umstellung ins neue Tarifwerk prüfen"],
      "Inhalt":["Versicherungssumme prüfen","Erhöhung Versicherungssumme","Betriebsunterbrechung mitversichert","Vers.summe Betriebsunterbrechung erhöht","viele Deckungserweiterungen","erweiterte Neuwertentschädigung","Sachen auf Baustellen (5.000 € bis 15.000 €) mitversichert","Umstellung ins neue Tarifwerk prüfen"]
    },
    defaultGefahren:["Feuer","Leitungswasser","Sturm/Hagel","Einbruchdiebstahl","Elementar"]};
  function getRecs(sparten){const s=new Set();(sparten||[]).forEach(x=>{(STD.alteEmpfehlungenBySparte[x]||[]).forEach(y=>s.add(y))}); return Array.from(s);}
  function currencyDE(n){try{return (n||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'})}catch(e){return n}}
  function parseNum(v){const x=(v||'').toString().replace('.','').replace(',','.');const n=parseFloat(x);return isNaN(n)?0:n}
  return {KEYS,STD,toast,get,set,getRecs,currencyDE,parseNum};
})();