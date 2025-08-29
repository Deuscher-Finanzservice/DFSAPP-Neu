// scripts/firebase.js
import { getDB, getClientId, initFirebase, ts } from './firebaseClient.js';
import { doc,setDoc,getDoc,collection,getDocs,deleteDoc,query,where,orderBy,limit } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js';
initFirebase(); const CLIENT_ID=getClientId();
export async function saveToCloud(key,data){const db=getDB();const id=`${CLIENT_ID}__${key}`;await setDoc(doc(db,'kv',id),{key,clientId:CLIENT_ID,data,updatedAt:ts()},{merge:true});}
export async function loadFromCloud(key){const db=getDB();const id=`${CLIENT_ID}__${key}`;const snap=await getDoc(doc(db,'kv',id));return snap.exists()?snap.data().data:null;}
export async function saveContractToCloud(c){const db=getDB();let id=c.id||crypto.randomUUID();c={...c,id,clientId:CLIENT_ID,updatedAt:ts()};if(!c.createdAt)c.createdAt=new Date().toISOString();await setDoc(doc(db,'contracts',id),c,{merge:true});}
export async function loadContractsFromCloud(){const db=getDB();let q=query(collection(db,'contracts'),where('clientId','==',CLIENT_ID));try{q=query(collection(db,'contracts'),where('clientId','==',CLIENT_ID),orderBy('updatedAt','desc'));}catch{}const snap=await getDocs(q);const arr=[];snap.forEach(d=>arr.push(d.data()));return arr;}
export async function deleteContractFromCloud(id){await deleteDoc(doc(getDB(),'contracts',id));}
export async function saveAllDFSBlobs({customer,contracts,analysis}={}){if(customer)await saveToCloud('dfs.customer',customer);if(contracts)await saveToCloud('dfs.contracts',contracts);if(analysis)await saveToCloud('dfs.analysis',analysis);}
export async function loadAllDFSBlobs(){return{customer:await loadFromCloud('dfs.customer'),contracts:await loadFromCloud('dfs.contracts'),analysis:await loadFromCloud('dfs.analysis')};}
