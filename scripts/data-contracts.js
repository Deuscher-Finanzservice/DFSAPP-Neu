// scripts/data-contracts.js
// Cloud-only data accessors for contracts
export async function loadAllContracts(){
  try{
    const arr = await dfsCloud.loadAll('dfs.contracts');
    return Array.isArray(arr) ? arr : [];
  }catch(e){ console.error('[DFS] loadAllContracts error', e); return []; }
}

export async function loadContractsByCustomer(customerId){
  try{
    const all = await dfsCloud.loadAll('dfs.contracts');
    return (Array.isArray(all) ? all : []).filter(c => String(c?.customerId||'') === String(customerId||''));
  }catch(e){ console.error('[DFS] loadContractsByCustomer error', e); return []; }
}

// Backwards-compatible global for non-module scripts
if(typeof window !== 'undefined'){
  window.dfsDataContracts = { loadAllContracts, loadContractsByCustomer };
}

