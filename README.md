# DFS Versicherungsanalyse – Version 1.3.0
Stand: 2025-08-29 07:44
Autor: Björn Weber

Komplette, statische App im DFS-CI mit Firebase Firestore Cloud-Sync.

## Features bis Version 1.3.0
- Clean Rename Supabase → Firebase
- Kunden-Modul
- Verträge CRUD + Cloud-Sync
- Analyse-Wizard mit Heuristiken
- Dashboard mit KPI
- PDF-/Druckseite (A4)

## Nutzung
- Shell lädt Module via iframe
- Cloud-Buttons speichern/laden `dfs.customer`, `dfs.contracts`, `dfs.analysis`
- Version wird im Footer von index.html angezeigt
