# DFS Versicherungsanalyse — Web App

Ein leichtgewichtiges, modulbasiertes Frontend für die interne Versicherungsanalyse.
- **Stack:** Vanilla HTML/CSS/JS, lokale Persistenz via `localStorage`, optionaler **Cloud-Sync via Firebase**.
- **CI/CD:** GitHub Actions → Firebase Hosting (Preview + Live Deploys).
- **Agent-Support:** Codex (lokal & Cloud) für wiederholbare Entwicklungsblöcke.

## Live
- Prod: `https://deutscher-finanzservice.web.app`  
- Preview Channels: siehe GitHub Actions (automatisch pro PR/Branch)

---

## Features (aktuell)
- **Kunden** (`dfs.customers`): CRUD lokal, Export/Import (JSON), optional Cloud-Sync.
- **Verträge** (`dfs.contracts`): UI-Form mit Validierung, Liste, Summenfeld; lokales CRUD (Block 2), Cloud-Sync (geplant/Block 3).
- **Analysen**: Platzhalter (Folgeblöcke).
- **PDF-Export**: Platzhalter.
- **Versioning/Cache-Busting**: `window.DFS_VERSION` + Querystring.

## Projektstruktur
assets/              # Logos, Icons
modules/
dashboard/         # Startübersicht
customers/         # Kundenliste & -editor
contracts/         # Verträge UI + LS-CRUD (Block 2)
scripts/
firebaseClient.js  # Firebase bootstrap (config, app, db)
firebase.js        # Firestore-Helper (CRUD, merge, conflict policy)
styles/              # Base Styles (DFS CI)
index.html           # Shell + Sidebar +  loader
## Datenmodell (lokal)
- **Schlüssel im `localStorage`:**
  - `dfs.customers` → `Array<Customer>`
  - `dfs.contracts` → `Array<Contract>`
- **Customer (Beispiel)**
  ```json
  {
    "id": "c_1701",
    "companyName": "Muster GmbH",
    "contactName": "Max Muster",
    "email": "max@muster.de",
    "phone": "",
    "industry": "",
    "employees": 0,
    "revenue": 0,
    "foundedYear": 2005,
    "createdAt": "2025-08-29T07:47:41.614Z",
    "updatedAt": "2025-08-29T09:15:48.483Z"
    Contract (Beispiel)
    {
  "id": "p_2001",
  "insurer": "HanseMerkur",
  "policyNo": "AB-12345",
  "product": "BHV",
  "risks": ["BHV", "Inhalt", "Cyber"],
  "startDate": "2025-08-29",
  "payCycle": "jaehrlich",         // monatlich | vierteljährlich | halbjährlich | jährlich
  "premiumGross": 1200.00,
  "coverage": 5000000,
  "deductible": 500,
  "notes": "",
  "createdAt": "...",
  "updatedAt": "..."
}
  }
  Entwicklung

Schnellstart (lokal)
	1.	Repo klonen und im Browser öffnen (reines Frontend).
	2.	Cache busting: window.DFS_VERSION in index.html erhöhen (oder neu deployen).
	3.	Dev-Workflow:
	•	Änderungen in modules/...
	•	Manuelle Tests im Browser (DevTools → „Speicher“ für localStorage)
	•	Optional: mini-Migrations in der Console ausführen (siehe PROJECT-GUIDE.md).

Cloud-Agent (Codex)
	•	Modus: Non-interactive (keine Rückfragen) + Auto.
	•	Status prüfen: „Codex → Aufgaben → letzter Task“; grüne Häkchen bedeuten fertig.
	•	Mini-Prompt für Status (kurz posten):
    STATUS-CHECK (Cloud)
- git status
- diff header der geänderten Dateien
- wenn ok: Commit & Push
- antworte: [DONE] oder was fehlt
Deploy

Einmalig
	•	Firebase CLI einrichten und Projekt binden.
	•	GitHub Actions via firebase init hosting:github verbinden.
	•	.firebaserc und firebase.json im Repo (liegen bereits drin).

Laufend
	•	Push auf main → GitHub Action baut & deployed automatisch.
	•	Preview Channels per PR.

Qualität / Konventionen
	•	Keine Fremd-Libs im Frontend (bewusst Vanilla).
	•	IDs im DOM sind fix (z. B. c-insurer, insurer-list, c-policy, sum-cell).
	•	Zeitstempel immer ISO 8601; Summen immer als Zahl (intern), Anzeige via Locale.

Roadmap (Kurz)
	•	Kunden: lokales CRUD
	•	Verträge: lokales CRUD (Block 2)
	•	Cloud-Sync Verträge (Block 3)
	•	Analyse-Module (Block 4)
	•	PDF-Export
	•	Zugriff/Policies (Firestore Security Rules)

Lizenz

Internes Projekt (Deutscher Finanzservice). Kein öffentlicher Vertrieb.