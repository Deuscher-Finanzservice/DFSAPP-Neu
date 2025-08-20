
(function() {
  const nav = document.getElementById('nav');
  const frame = document.getElementById('content');
  const title = document.getElementById('title');
  const toast = document.getElementById('toast');
  const setActive = (btn)=>{
    [...nav.children].forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  };
  function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){ showToast('Speicher voll – bitte Export nutzen.'); } }
  function showToast(msg){ toast.textContent = msg; toast.style.display='block'; setTimeout(()=>toast.style.display='none', 2200); }
  window.addEventListener('message', (e)=>{
    if(e.data && e.data.type === 'set-title') title.textContent = e.data.value;
    if(e.data && e.data.type === 'toast') showToast(e.data.value);
  });
  nav.addEventListener('click', (ev)=>{
    const btn = ev.target.closest('button'); if(!btn) return;
    const href = btn.getAttribute('data-href');
    if(href){ frame.src = href; setActive(btn); title.textContent = btn.textContent.replace(/^[^\s]+\s/,''); localStorage.setItem('dfs.last', href); }
  });
  // restore last module
  const last = localStorage.getItem('dfs.last');
  if(last){ frame.src = last; [...nav.children].forEach(b=>{ if(b.getAttribute('data-href')===last) setActive(b); }); title.textContent = (last.split('/').slice(-2)[0]).toUpperCase(); }
  // set version
  localStorage.setItem('dfs.version', '20250820.2232');
})();
