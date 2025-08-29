# TECH-SPEC – DFS Versicherungsanalyse
**Stand:** 2025-08-29 07:16

## Laufzeitumgebung
- reine **ESM**‑Module, **keine Build‑Steps**.
- Firebase SDK via CDN:
  - `https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js`
  - `https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js`

## Firestore Schema
- **kv** (docId = `${clientId}__${key}`): `{ key, clientId, data, updatedAt }`
- **contracts**: vollständige Vertragsdokumente inkl. `clientId`, `createdAt` (ISO), `updatedAt` (serverTimestamp).

## Öffentliche API (scripts/firebase.js)
- `saveToCloud(key, data)` / `loadFromCloud(key)`
- `saveContractToCloud(contract)` / `loadContractsFromCloud({limitTo})` / `deleteContractFromCloud(id)`
- `saveAllDFSBlobs({customer,contracts,analysis})` / `loadAllDFSBlobs()`

## Fehlerbehandlung
- Cloud‑Calls try/catch im UI, Toast‑Feedback.
- localStorage unter Quota → Hinweis + Export anbieten.

## Barrierefreiheit
- AA‑Kontrast, sichtbarer Fokus, Tastatur‑Nutzung.

## Druck
- `@page A4; margin:14mm` – helle Darstellung für Print.
