(function(){
  async function loadAllCustomers(){ try{ const arr = await dfsCloud.loadAll('dfs.customers'); return Array.isArray(arr)? arr : []; }catch(e){ console.error('[DFS] loadAllCustomers error', e); return []; } }
  async function loadCustomer(id){ try{ return await dfsCloud.loadOne('dfs.customers', id); }catch(e){ console.error('[DFS] loadCustomer error', e); return null; } }
  window.dfsDataCustomers = { loadAllCustomers, loadCustomer };
})();

