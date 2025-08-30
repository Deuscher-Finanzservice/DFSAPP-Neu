// scripts/firebaseClient.js
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js';
import { initializeFirestore, serverTimestamp, memoryLocalCache } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js';
const firebaseConfig = {
  apiKey: "AIzaSyA77RDdEQEwNpgVtoeaK1E2qTfOz2EkKWY",
  authDomain: "deutscher-finanzservice.firebaseapp.com",
  projectId: "deutscher-finanzservice",
  storageBucket: "deutscher-finanzservice.firebasestorage.app",
  messagingSenderId: "501791748406",
  appId: "1:501791748406:web:2e632167a55973b21b8397"
};
let app, db;
export function initFirebase(){
  if(!getApps().length){ app = initializeApp(firebaseConfig); } else { app = getApp(); }
  // Stabilize Firestore in Safari/Enterprise networks
  // - memoryLocalCache: avoids IndexedDB (no persistence)
  // - experimentalAutoDetectLongPolling: avoids WebChannel in restricted networks
  // - ignoreUndefinedProperties: prevents 400 from undefined payloads
  db = initializeFirestore(app, {
    localCache: memoryLocalCache(),
    experimentalAutoDetectLongPolling: true,
    useFetchStreams: false,
    ignoreUndefinedProperties: true
  });
  try{ console.info('DB: memory cache + auto long-polling aktiv'); }catch{}
  return {app,db};
}
export function getDB(){ if(!db) initFirebase(); return db; }
export function getClientId(){ const KEY='dfs.cloud.clientId'; let id=localStorage.getItem(KEY); if(!id){ id=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`); localStorage.setItem(KEY,id);} return id; }
export function ts(){ return serverTimestamp(); }
