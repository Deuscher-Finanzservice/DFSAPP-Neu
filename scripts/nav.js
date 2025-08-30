// scripts/nav.js
window.dfsNav = (function(){
  function backOr(href){
    try { if (history.length > 1) { history.back(); return; } } catch(_) {}
    if (href) location.href = href;
  }
  function openInSidebar(href){
    const iframe = document.getElementById('content');
    if (iframe && iframe.tagName === 'IFRAME') iframe.src = href; else location.href = href;
  }
  return { backOr, openInSidebar };
})();

