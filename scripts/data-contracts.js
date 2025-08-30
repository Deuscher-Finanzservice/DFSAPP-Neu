// scripts/data-contracts.js
// Cloud-only data accessors for contracts
export async function loadAllContracts(){
  try{
    const arr = await dfsCloud.loadAll('dfs.contracts');
    const result = Array.isArray(arr) ? arr : [];
    try{ if(window.dfs && window.dfs.debug) console.info('[DFS] contracts loaded:', result.length, result); }catch{}
    return result;
  }catch(e){ console.error('[DFS] loadAllContracts error', e); return []; }
}

export async function loadContractsByCustomer(customerId){
  try{
    const all = await dfsCloud.loadAll('dfs.contracts');
    const list = (Array.isArray(all) ? all : []);
    try{ if(window.dfs && window.dfs.debug) console.info('[DFS] contracts loaded:', list.length, list); }catch{}
    return list.filter(c => String(c?.customerId||'') === String(customerId||''));
  }catch(e){ console.error('[DFS] loadContractsByCustomer error', e); return []; }
}

// Backwards-compatible global for non-module scripts
if(typeof window !== 'undefined'){
  window.dfsDataContracts = { loadAllContracts, loadContractsByCustomer };
}
