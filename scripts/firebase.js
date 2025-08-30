// scripts/firebase.js (upgrade with customers CRUD)
import { getDB, getClientId, initFirebase, ts } from './firebaseClient.js';
import { doc,setDoc,getDoc,collection,getDocs,deleteDoc,query,where,orderBy,limit } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js';
const { app: __app } = initFirebase(); const CLIENT_ID = getClientId();
const storage = (()=>{ try{ return getStorage(__app); }catch(e){ try{ const { app } = initFirebase(); return getStorage(app); }catch{} return null; }})();

// --- KV generic ---
export async function saveToCloud(key,data){const db=getDB();const id=`${CLIENT_ID}__${key}`;await setDoc(doc(db,'kv',id),{key,clientId:CLIENT_ID,data,updatedAt:ts()},{merge:true});return{id,ok:true};}
export async function loadFromCloud(key){const db=getDB();const id=`${CLIENT_ID}__${key}`;const snap=await getDoc(doc(db,'kv',id));return snap.exists()?((snap.data()||{}).data??null):null;}

// --- Contracts ---
export async function saveContractToCloud(contract){const db=getDB();const col=collection(db,'dfs.contracts');let id=contract?.id||(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`);const sanitized={...contract,id,clientId:CLIENT_ID,updatedAt:ts()};if(!contract?.createdAt) sanitized.createdAt=new Date().toISOString();await setDoc(doc(col,id),sanitized,{merge:true});return{id,ok:true};}
export async function saveContractsToCloud(arr){const list=Array.isArray(arr)?arr:(JSON.parse(localStorage.getItem('dfs.contracts')||'[]'));const db=getDB();const col=collection(db,'dfs.contracts');await Promise.all(list.map(c=>{let id=c?.id||(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`);const sanitized={...c,id,clientId:CLIENT_ID,updatedAt:ts()};if(!c?.createdAt) sanitized.createdAt=new Date().toISOString();return setDoc(doc(col,id),sanitized,{merge:true});}));return{ok:true};}
export async function loadContractsFromCloud({limitTo}={}){const db=getDB();let q=query(collection(db,'dfs.contracts'),where('clientId','==',CLIENT_ID));try{q=query(collection(db,'dfs.contracts'),where('clientId','==',CLIENT_ID),orderBy('updatedAt','desc'));}catch{}if(limitTo&&Number.isFinite(limitTo)) q=query(q,limit(limitTo));const snap=await getDocs(q);const arr=[];snap.forEach(d=>arr.push(d.data()));return arr;}
export async function deleteContractFromCloud(id){await deleteDoc(doc(getDB(),'dfs.contracts',id));return{id,ok:true};}

// --- Customers ---
export async function saveCustomerToCloud(customer){const db=getDB();const col=collection(db,'dfs.customers');let id=customer?.id||(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`);const sanitized={...customer,id,clientId:CLIENT_ID,updatedAt:ts()};if(!customer?.createdAt) sanitized.createdAt=new Date().toISOString();await setDoc(doc(col,id),sanitized,{merge:true});return{id,ok:true};}
export async function saveCustomersToCloud(arr){const list=Array.isArray(arr)?arr:(JSON.parse(localStorage.getItem('dfs.customers')||'[]'));const db=getDB();const col=collection(db,'dfs.customers');await Promise.all(list.map(c=>{let id=c?.id||(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`);const sanitized={...c,id,clientId:CLIENT_ID,updatedAt:ts()};if(!c?.createdAt) sanitized.createdAt=new Date().toISOString();return setDoc(doc(col,id),sanitized,{merge:true});}));return{ok:true};}
export async function loadCustomersFromCloud({limitTo}={}){const db=getDB();let q=query(collection(db,'dfs.customers'),where('clientId','==',CLIENT_ID));try{q=query(collection(db,'dfs.customers'),where('clientId','==',CLIENT_ID),orderBy('updatedAt','desc'));}catch{}if(limitTo&&Number.isFinite(limitTo)) q=query(q,limit(limitTo));const snap=await getDocs(q);const arr=[];snap.forEach(d=>arr.push(d.data()));return arr;}
export async function deleteCustomerFromCloud(id){await deleteDoc(doc(getDB(),'dfs.customers',id));return{id,ok:true};}

// --- DFS blobs convenience ---
export async function saveAllDFSBlobs({customers,contracts,analysis}={}){const r={}; if(customers!==undefined) r.customers=await saveToCloud('dfs.customers',customers); if(contracts!==undefined) r.contracts=await saveToCloud('dfs.contracts',contracts); if(analysis!==undefined) r.analysis=await saveToCloud('dfs.analysis',analysis); return r;}
export async function loadAllDFSBlobs(){const [customers,contracts,analysis]=await Promise.all([loadFromCloud('dfs.customers'),loadFromCloud('dfs.contracts'),loadFromCloud('dfs.analysis')]);return{customers,contracts,analysis};}
// Lightweight cloud facade for generic usage (auto-save)
if(typeof window !== 'undefined'){
  window.dfsCloud = window.dfsCloud || {
    async save(key,obj){
      try{
        const db=getDB();
        const col=collection(db, key);
        let id=obj?.id||(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`);
        const sanitized={...obj,id,clientId:CLIENT_ID,updatedAt:ts()};
        if(!obj?.createdAt) sanitized.createdAt=new Date().toISOString();
        await setDoc(doc(col,id),sanitized,{merge:true});
        return true;
      }catch(e){ console.error('Cloud save error', e); return false; }
    },
    async loadAll(key){ try{ const db=getDB(); const snap=await getDocs(collection(db,key)); const arr=[]; snap.forEach(d=>arr.push(d.data())); return arr; }catch(e){ console.error('Cloud load error', e); try{ if(window.dfsToast) dfsToast('Cloud-Lesen fehlgeschlagen','error'); }catch{} return []; }
    },
    async loadOne(key,id){ try{ const db=getDB(); const ref=doc(db,key,id); const s=await getDoc(ref); return s.exists()? s.data() : null; }catch(e){ console.error('Cloud get error', e); return null; } }
  };
  // --- Storage File helpers ---
  window.dfsFiles = window.dfsFiles || {
    async uploadCustomerFile(customerId, file){
      if(!storage) throw new Error('storage not available');
      const path = `customers/${customerId}/docs/${Date.now()}_${file.name}`;
      const ref = storageRef(storage, path);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      return { id: path, name: file.name, type: file.type, size: file.size, url, uploadedAt: new Date().toISOString() };
    },
    async uploadContractFile(contractId, file){
      if(!storage) throw new Error('storage not available');
      const path = `contracts/${contractId}/docs/${Date.now()}_${file.name}`;
      const ref = storageRef(storage, path);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      return { id: path, name: file.name, type: file.type, size: file.size, url, uploadedAt: new Date().toISOString() };
    },
    async removeByPath(path){ try{ if(!storage) return false; await deleteObject(storageRef(storage, path)); return true; }catch(e){ console.warn('delete failed', e); return false; } }
  };
  // Generic delete helper
  window.dfsCloud = window.dfsCloud || {};
  window.dfsCloud.delete = window.dfsCloud.delete || (async function(key,id){
    try{ const db=getDB(); await deleteDoc(doc(collection(db,key), id)); return true; }
    catch(e){ console.warn('cloud delete error', e); return false; }
  });
  try{
    window.addEventListener('online', ()=>{ try{ window.dfsSync && window.dfsSync.processQueue(); }catch{} });
    document.addEventListener('DOMContentLoaded', ()=>{ try{ window.dfsSync && window.dfsSync.processQueue(); }catch{} });
  }catch{}
}
