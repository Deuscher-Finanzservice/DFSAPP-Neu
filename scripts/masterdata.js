const VERSION = window.DFS_VERSION || '0';
const ROOT = location.pathname.split('/modules/')[0] || '';

function cacheKey(name){ return `${name}@${VERSION}`; }

async function load(name, file){
  const key = cacheKey(name);
  try{
    const cached = sessionStorage.getItem(key);
    if(cached){ return JSON.parse(cached); }
  }catch{}
  const res = await fetch(`${ROOT}/assets/data/${file}?v=${VERSION}`);
  const data = await res.json();
  try{ sessionStorage.setItem(key, JSON.stringify(data)); }catch{}
  return data;
}

export function loadInsurers(){ return load('insurers','insurers.json'); }
export function loadLines(){ return load('lines','lines.json'); }
