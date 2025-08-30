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
