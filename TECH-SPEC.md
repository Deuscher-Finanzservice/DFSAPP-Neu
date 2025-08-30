# TECH-SPEC — DFS Versicherungsanalyse (Stand Block 10)

## Architektur
- Statische App (HTML/CSS/JS), kein Bundler/Framework.
- Shell `index.html` (Sidebar + `<iframe>`) lädt Module.
- Persistenz: `localStorage` (nur lokal). Normalisierung/„Migration“ im Contracts‑Modul (EN→DE Mapping).
- CI/CD: GitHub Actions → Firebase Hosting (Push/Merge/Preview Workflows).

## Module
- `modules/customers/` — Kundenliste, Detail/CRUD, Cloud‑Import/Export.
- `modules/contracts/` — Verträge (CRUD), Laufzeit 3/5, Enddatum auto, Reminder, Summe.
- `modules/dashboard/` — KPIs + Reminder‑Liste (≤ 90 Tage).
- `modules/analysis/` — Analyse‑Wizard (Heuristiken, KPIs) schreibt `dfs.analysis`.
- `modules/print/` — Druck (A4‑optimiert).

## Scripts
- `storage.js` — `dfsStore.get/set/remove` mit Quota‑Toast.
- `format.js` — `dfsFmt.fmtEUR/parseDE/fmtDateDE`.
- `date.js` — `dfsDate.parseISO/toISO/addYears/minusMonths`.
- `toast.js` — `dfsToast(msg,type,ttl)`.
- `io.js` — JSON Export/Import (FileReader + Downloads).
- `firebaseClient.js`, `firebase.js` — optionaler Cloud‑Layer (KV, Kunden/Verträge CRUD).

## Styles
- `base.css` (Dark, DFS‑CI) inkl. Fokuszustände, Tabellen, Badges.
- `print.css` (A4 hell, klare Ränder, `.no-print`/`.intern-only` ausgeblendet).

## Persistenz/Keys
- `dfs.customers` (Array), `dfs.contracts` (Array), `dfs.analysis` (Objekt), `dfs.targetSavingsPct` (Number), `dfs.version` (String, optional).

## Fehlerbehandlung
- Toasts statt Alerts; Quota‑Guard in `dfsStore.set` (Toast „Speicherlimit erreicht…“).
- Guards in Renderpfaden (Filter, Fallbacks) verhindern JS‑Fehler bei leeren Daten.

## Heuristiken (Analyse)
- BHV mit Deckungssumme < 5 Mio → Warnung.
- Inhalt/Gebäude mit < 3 Gefahren → Warnung.
- Cyber ohne Bausteine → Warnung.

## KPIs
- Summe Jahresbeiträge aus `jahresbeitragBrutto` (de‑DE Parsen bei Strings).
- Einsparziel `dfs.targetSavingsPct` (Default 10%).
- Monatliche Ersparnis = (Summe − Summe*(1−Ziel%))/12.
- Risiko‑Score = 95 − 10×Warnungen; min 5.

## Security/Privacy
- Keine Serverabhängigkeit im Kern (nur Browser). Optional Firestore mit `clientId`‑Isolierung.
- Keine Tracking‑Skripte.

## Accessibility
- Sichtbarer Fokus, gute Kontraste, Tastaturbedienung.

## Print
- A4‑Layout, helle Farben, klare Tabellenränder, interne Inhalte (`.intern-only`) werden nicht gedruckt.
# DFS Versicherungsanalyse – TECH-SPEC (Cloud-only, Stand: 2025-08-30)

## 1. Zielbild & Architektur
- Statische Web-App (HTML/CSS/JS), Deployment: Firebase Hosting.
- Cloud-only Datenhaltung: Firestore (Daten), Firebase Storage (Dateien). Kein localStorage für Kunden/Verträge (nur Mini-Settings).
- Module:
  1) Shell & Sidebar (iframe-basiert)
  2) Kunden (CRUD, Suche, strukturierte Adresse)
  3) Verträge (CRUD, Reminder, Upload Policen)
  4) Analyse (global + pro Kunde, gemeinsame Engine)
  5) Dashboards: global + kundenbezogen (print-ready)
  6) Print/PDF (Browser-Print, A4 hell)
  7) Konfiguration (Cloud, inkl. Logos, Footer, Autosave)
  8) DEV-Tools (Debug-Logs, Gear-Menü)

Domains: primär `deutscher-finanzservice.web.app` (nur hier arbeiten).

## 2. Design / CI
- Farben: Hintergrund #00223B, Akzent/Gold #896c20, Text #ffffff, Sekundär #C0C0C0, Warnung #D97706.
- Fonts: Inter/Roboto via Google Fonts.
- Komponenten: dunkle Karten (rgba-weiß 0.04), 1px border (rgba-weiß 0.08), r=16px, klare Labels.
- Print: hell, A4, ~14mm Ränder, keine dunklen Flächen.

## 3. Datenmodell (Firestore, Collections)
### 3.1 Kunden `dfs.customers`
```json
{
  "id": "cust_...",
  "firma": "string",
  "ansprech": "string",
  "email": "string?",      // optional
  "telefon": "string?",
  "branche": "string?",     // Dropdown (30 Optionen)
  "standort": { "adresse": "string", "plz": "string", "ort": "string" },
  "standortLegacy": "string?",
  "createdAt": "ISOString",
  "updatedAt": "ISOString"
}

3.2 Verträge dfs.contracts

{
  "id": "cont_...",
  "customerId": "cust_...",
  "sparten": ["string"],
  "versicherer": "string",
  "produkt": "string?",
  "policeNr": "string",
  "beginn": "YYYY-MM-DD",
  "ende": "YYYY-MM-DD?",
  "laufzeitJahre": 3|5?,
  "reminderDate": "YYYY-MM-DD",      // i.d.R. beginn + 3J - 3M
  "zahlweise": "jährlich|halbjährlich|vierteljährlich|monatlich",
  "jahresbeitragBrutto": "number | string(€)",
  "deckungssumme": "number?",
  "selbstbehalt": "number?",
  "kuendigungsfrist": "string?",
  "gefahren": ["string"],
  "empfehlungen": ["string"],
  "hinweiseVertrag": "string?",
  "internVermerk": "string?",         // NICHT drucken
  "vergleichDirektVersicherer": "string?",
  "vergleichDirektBeitrag": "number?",
  "empfehlungVersicherer": "string?",
  "empfehlungBeitrag": "number?",
  "createdAt": "ISOString",
  "updatedAt": "ISOString"
}

3.3 Analyse (Snapshots)
	• Global: dfs.analysis mit id: "latest".
	• Pro Kunde: dfs.analysis.customer mit id = customerId.

{
  "id": "latest|<customerId>",
  "warnings": ["string"],
  "recommendations": ["string"],
  "sumAnnual": 0,
  "targetPct": 0,
  "monthlySaving": 0,
  "riskScore": 0,
  "sumDelta": 0?,
  "ts": "ISOString"
}

3.4 Dateien (Storage)
	• Kundenbezogene Dokumente: Metadaten in dfs.customerFiles (optional), Dateien in Storage-Pfad je Kunde.
	• Vertragsdokumente (Policen): Metadaten in dfs.contractFiles, Dateien in Storage.

4. Business-Logik (Heuristiken & Reminder)
	• Reminder: reminderDate = beginn + 3 Jahre − 3 Monate (sofern nicht manuell gesetzt).
	• Warnungen:
	• BHV deckungssumme < 5 Mio → Warnung
	• Inhalt/Gebäude: < 3 Gefahren → Warnung
	• Cyber vorhanden aber keine Bausteine → Warnung
	• Empfehlungen (fehlende Sparten):
	• Kein Cyber → „Cyber ergänzen …”
	• Kein Ertragsausfall/BU → „Betriebsunterbrechung absichern”
	• Kein Rechtsschutz → „Rechtsschutz prüfen …”
	• KPIs:
	• sumAnnual = Σ jahresbeitragBrutto (de→Number)
	• monthlySaving = (sumAnnual − sumAnnual*(1 − targetPct/100)) / 12
	• riskScore = max(5, 95 − 10*#Warnungen)
	• Optional sumDelta falls empfehlungBeitrag je Vertrag vorhanden.

5. Dashboards

5.1 Globales Dashboard (Management)
	• KPIs: Kunden gesamt, aktive Verträge, Verträge fällig ≤90 Tage, offene Next Steps (wenn vorhanden).
	• Widget „Demnächst fällig 90/60/30“: Tabs mit Summe Jahresbeiträge im Fenster + Vertragsliste + Fokus-Kunden (aggregiert nach customerId).
	• Cloud-only Loader: dfs.customers, dfs.contracts.

5.2 Kunden-Dashboard
	• KPIs: sumAnnual (Kunde), Einsparziel (€/Monat), Risiko-Score, fällig ≤90 Tage.
	• Sektionen: Verträge (kompakt), Warnungen/Empfehlungen, Einsparungs-Delta, Dokumente, Standorte.
	• Print A4 (hell): 2 Logos aus Config (DFS + Handwerk), Footer-Text aus Config, interne Felder ausgeblendet.

6. Konfiguration (Cloud)

Sammlung: dfs.config, Dokument id: "default"

{
  "id": "default",
  "autoSaveMode": "immediate|interval|manual",
  "autoSaveInterval": 2-120,
  "quietAutosave": true,
  "footerText": "string",
  "logos": ["url1","url2?"]
}

	• Footer überall aus Cloud übernommen, Logos für Print/Kopfzeile.

7. Save-Flow (Cloud-only)
	• Explizit speichern: Button oben rechts + Ctrl/Cmd+S.
	• Autosave: je Config
	• immediate (debounce ~600ms),
	• interval (2–120s, nur bei dirty),
	• manual (nur explizit).
	• Status-Badge: Ungespeichert → Speichert… → Gespeichert/Fehler; Timestamp „zuletzt gespeichert HH:MM“; Spinner im Button.
	• Autosave-Feedback: leise (keine Toast-Flut); explizite Saves zeigen 1 Toast.
	• Flush on unload: bei dirty einmal Speicherversuch.

8. Löschen & Dateien
	• Kunden/Verträge löschen via Confirm-Modal (Checkbox + Button).
	• Optional kaskadierend Verträge beim Kundenlöschen entfernen.
	• Zugehörige Dokumente in Storage mit löschen.

9. DEV / Diagnose
	• Debug-Logs (nur bei dfs.debug === true): Loader- und Render-Infos in Konsole.
	• DEV-Menü (⚙️): Debug-Flag togglen, Hard-Reload (cache-bust), Quick-Links (Firestore), Env/Version-Infos.
	• Arbeitsdomain: ausschließlich deutscher-finanzservice.web.app.

10. Sicherheits-/Privatheitshinweise
	• Keine sensiblen Daten außerhalb Firestore/Storage.
	• Print blendet interne Vermerke aus.
	• Nur authentifizierte Zugriffe (Regeln je Projektkonfiguration, getrennt gepflegt).
