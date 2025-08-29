// scripts/firebase.js (upgrade with customers CRUD)
import { getDB, getClientId, initFirebase, ts } from './firebaseClient.js';
import { doc,setDoc,getDoc,collection,getDocs,deleteDoc,query,where,orderBy,limit } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js';
initFirebase(); const CLIENT_ID = getClientId();

// --- KV generic ---
export async function saveToCloud(key,data){const db=getDB();const id=`${CLIENT_ID}__${key}`;await setDoc(doc(db,'kv',id),{key,clientId:CLIENT_ID,data,updatedAt:ts()},{merge:true});return{id,ok:true};}
export async function loadFromCloud(key){const db=getDB();const id=`${CLIENT_ID}__${key}`;const snap=await getDoc(doc(db,'kv',id));return snap.exists()?((snap.data()||{}).data??null):null;}

// --- Contracts ---
export async function saveContractToCloud(contract){const db=getDB();let id=contract?.id || (crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`);const sanitized={...contract,id,clientId:CLIENT_ID,updatedAt:ts()};if(!contract?.createdAt) sanitized.createdAt=new Date().toISOString();await setDoc(doc(db,'contracts',id),sanitized,{merge:true});return{id,ok:true};}
export async function loadContractsFromCloud({limitTo}={}){const db=getDB();let q=query(collection(db,'contracts'),where('clientId','==',CLIENT_ID));try{q=query(collection(db,'contracts'),where('clientId','==',CLIENT_ID),orderBy('updatedAt','desc'));}catch{}if(limitTo&&Number.isFinite(limitTo)) q=query(q,limit(limitTo));const snap=await getDocs(q);const arr=[];snap.forEach(d=>arr.push(d.data()));return arr;}
export async function deleteContractFromCloud(id){await deleteDoc(doc(getDB(),'contracts',id));return{id,ok:true};}

// --- Customers ---
export async function saveCustomerToCloud(customer){const db=getDB();let id=customer?.id || (crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`);const sanitized={...customer,id,clientId:CLIENT_ID,updatedAt:ts()};if(!customer?.createdAt) sanitized.createdAt=new Date().toISOString();await setDoc(doc(db,'customers',id),sanitized,{merge:true});return{id,ok:true};}
export async function loadCustomersFromCloud({limitTo}={}){const db=getDB();let q=query(collection(db,'customers'),where('clientId','==',CLIENT_ID));try{q=query(collection(db,'customers'),where('clientId','==',CLIENT_ID),orderBy('updatedAt','desc'));}catch{}if(limitTo&&Number.isFinite(limitTo)) q=query(q,limit(limitTo));const snap=await getDocs(q);const arr=[];snap.forEach(d=>arr.push(d.data()));return arr;}
export async function deleteCustomerFromCloud(id){await deleteDoc(doc(getDB(),'customers',id));return{id,ok:true};}

// --- DFS blobs convenience ---
export async function saveAllDFSBlobs({customers,contracts,analysis}={}){const r={}; if(customers!==undefined) r.customers=await saveToCloud('dfs.customers',customers); if(contracts!==undefined) r.contracts=await saveToCloud('dfs.contracts',contracts); if(analysis!==undefined) r.analysis=await saveToCloud('dfs.analysis',analysis); return r;}
export async function loadAllDFSBlobs(){const [customers,contracts,analysis]=await Promise.all([loadFromCloud('dfs.customers'),loadFromCloud('dfs.contracts'),loadFromCloud('dfs.analysis')]);return{customers,contracts,analysis};}
