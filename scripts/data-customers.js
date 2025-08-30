// scripts/data-customers.js
// Cloud-only data accessors for customers
export async function loadAllCustomers(){
  try{
    const arr = await dfsCloud.loadAll('dfs.customers');
    return Array.isArray(arr) ? arr : [];
  }catch(e){ console.error('[DFS] loadAllCustomers error', e); return []; }
}

export async function loadCustomer(id){
  try{ return await dfsCloud.loadOne('dfs.customers', id); }
  catch(e){ console.error('[DFS] loadCustomer error', e); return null; }
}

// Backwards-compatible global for non-module scripts
if(typeof window !== 'undefined'){
  window.dfsDataCustomers = { loadAllCustomers, loadCustomer };
}

