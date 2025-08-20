
function h(tag, attrs={}, ...children){
  const el = document.createElement(tag);
  Object.entries(attrs||{}).forEach(([k,v])=>{
    if(k.startsWith('on') && typeof v==='function') el.addEventListener(k.substring(2), v);
    else if(k==='class') el.className = v;
    else el.setAttribute(k, v);
  });
  children.flat().forEach(ch=>{
    if(ch==null) return;
    if(typeof ch==='string') el.appendChild(document.createTextNode(ch));
    else el.appendChild(ch);
  });
  return el;
}
