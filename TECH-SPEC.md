# TECH-SPEC – DFS Versicherungsanalyse
Version: 1.3.0
Stand: 2025-08-29 07:44
Autor: Björn Weber

## Runtime
- Statisch, Netlify/Firebase Hosting
- Firebase SDK via CDN
- Modules in /modules/*

## Firestore Schema
- kv (Key/Value pro Client)
- contracts (Dokumente mit clientId, createdAt, updatedAt)

## API (scripts/firebase.js)
- saveToCloud / loadFromCloud
- saveContractToCloud / loadContractsFromCloud / deleteContractFromCloud
- saveAllDFSBlobs / loadAllDFSBlobs

## Version
- current: 1.3.0
- localStorage: dfs.version = "1.3.0"
