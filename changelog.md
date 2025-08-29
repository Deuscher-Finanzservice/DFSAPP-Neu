# Changelog – DFS Versicherungsanalyse

Alle relevanten Änderungen am Projekt werden hier dokumentiert.  
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

## [1.3.0] – 2025-08-29
### Added
- **Kundenliste** (`/modules/customers/`): Übersicht aller Kunden mit Suche, CRUD und Cloud-Sync.
- **Kundeneditor** (`/modules/customer/`): erweitert, arbeitet per `id` (Query-Param), unterstützt Bearbeiten und Nachtragen von Daten.
- **Firebase-Bridge** (`scripts/firebase.js`): neue Methoden für Kunden:
  - `saveCustomerToCloud(customer)`
  - `loadCustomersFromCloud({limitTo})`
  - `deleteCustomerFromCloud(id)`
- **Shell-Navigation**: Link auf Kundenliste ergänzt.
- **Versionierung** eingeführt: `1.3.0`, inkl. Anzeige im Footer.
- **Dokumentation** (README, PROJECT-GUIDE.md, TECH-SPEC.md) mit Version und Autor aktualisiert.

### Changed
- `dfs.customer` wird künftig nicht mehr allein genutzt → stattdessen `dfs.customers` (Array).  
- Editor-Ansicht lädt/speichert Kunden in `dfs.customers` und synchronisiert zusätzlich in Firestore.

### Notes
- Migration alter `dfs.customer` Einträge in `dfs.customers` ist aktuell **manuell** erforderlich (wird in einem späteren Release automatisiert).
- Fokus auf Kernmodule: Kunden, Verträge, Analyse, Dashboard, Print.

---

## [1.2.0] – 2025-08-28
### Added
- **Analyse-Wizard**: Heuristiken (Warnungen, Empfehlungen, KPI) implementiert.

---

## [1.1.0] – 2025-08-27
### Added
- **Verträge-Modul**: CRUD, Import/Export, Cloud-Sync via Firestore.

---

## [1.0.0] – 2025-08-26
### Added
- Initialversion mit:
  - Shell & Layout
  - Kundenstammdaten (Einzelmaske, localStorage)
  - Firebase-Config integriert (Supabase → Firestore Clean Rename)
  - Dashboard
  - Print-Export (A4-optimiert)e