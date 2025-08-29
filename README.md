# DFS Versicherungsanalyse – Clean Rename auf Firebase (Firestore)
**Stand:** 2025-08-29 07:16

Dieses Projekt ist ein rein statisches Web‑Tool (HTML/CSS/JS) mit Browser‑Storage (localStorage) und optionaler Cloud‑Synchronisation über **Firebase Firestore**. Build‑Schritte sind nicht nötig; alle Pfade sind **relativ**.

## Struktur
```
/
├─ index.html                   # Shell (Sidebar + iframe)
├─ favicon.ico
├─ assets/logo.png
├─ styles/base.css
├─ scripts/firebaseClient.js    # Firebase Init (ersetzen: supabaseClient.js)
├─ scripts/firebase.js          # Firestore‑Wrapper (ersetzen: supabase.js)
└─ modules/
   ├─ dashboard/
   ├─ customer/
   ├─ contracts/
   ├─ analysis/
   └─ print/
```

## Wichtige Änderungen (Migration)
- **Dateinamen:** `supabaseClient.js` → `firebaseClient.js`, `supabase.js` → `firebase.js`
- **Imports in Modulen:** auf `../../scripts/firebase.js` umgestellt.
- **Cloud‑Buttons:** Shell speichert/lädt `dfs.customer`, `dfs.contracts`, `dfs.analysis`.
- **Verträge:** `saveContractToCloud()` ist aktiv; Collection **contracts**.

## Firebase Konfiguration
In `scripts/firebaseClient.js`:
```js
const firebaseConfig = { apiKey: "…", authDomain: "deutscher-finanzservice.firebaseapp.com",
  projectId: "deutscher-finanzservice", storageBucket: "deutscher-finanzservice.appspot.com",
  messagingSenderId: "…", appId: "…" };
```
> `apiKey`, `messagingSenderId`, `appId` müssen zu deinem Projekt passen (öffentlich, nicht geheim).

## LocalStorage Keys
- `dfs.customer` (Objekt), `dfs.contracts` (Array), `dfs.analysis` (Objekt)
- `dfs.targetSavingsPct` (Number), `dfs.cloud.clientId` (automatisch)

## Deploy
- **Firebase Hosting:** Ordner deployen, keine Rewrites nötig (statisch).
- **Netlify:** Drag‑&‑drop möglich (keine Build‑Steps).

## Commit
```bash
git add .
git commit -m "Refactor: supabase → firebase (clean rename) + Firestore bridge"
git push
```
