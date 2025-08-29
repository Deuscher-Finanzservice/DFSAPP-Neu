Upgrade: Kundenliste (CRUD + Suche)

- NEU: /modules/customers/index.html – Liste mit Suche, Öffnen, Löschen, Cloud-Sync
- Editor: /modules/customer/index.html – lädt/speichert per id (Query-Param ?id=...)
- LocalStorage:
  - dfs.customers  (Array mehrerer Kunden)
  - (dfs.customer bleibt ungenutzt; optional migrierbar)
- Firestore:
  - Collection 'customers' (id, clientId, createdAt, updatedAt, ...)

Navi-Hinweis:
- Setze in deiner Shell-Navigation einen Link auf './modules/customers/index.html'
