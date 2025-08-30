# DFS Versicherungsanalyse – Statische Web‑App

Leichtgewichtiges Analyse‑Tool für Berater. Reines Frontend (HTML/CSS/JS), Speicherung lokal im Browser (`localStorage`). Deployment via GitHub Actions auf Firebase Hosting.

## Struktur

.
├── index.html                # Shell (Sidebar + iframe)
├── assets/
├── styles/
│   ├── base.css              # DFS-CI (Dark Theme)
│   └── print.css             # A4-optimierte Druckansicht
├── scripts/
│   ├── storage.js            # get/set/remove mit Quota-Toast
│   ├── format.js             # de-DE/EUR Format/Parse
│   ├── date.js               # ISO <-> Date Utilities
│   ├── toast.js              # Toast-UI
│   ├── io.js                 # Export/Import JSON
│   ├── firebaseClient.js     # (optional) Firebase Bootstrap
│   └── firebase.js           # (optional) Cloud-CRUD
└── modules/
    ├── customers/           # Kundenliste & Detail
    ├── contracts/           # Verträge (CRUD, Laufzeit/Enddatum/Reminder)
    ├── dashboard/           # KPIs + Reminder (≤90 Tage)
    ├── analysis/            # Analyse-Wizard (Heuristiken/KPIs)
    └── print/               # Druckbericht

## CI/CD
- GitHub Actions deployen automatisch nach Push auf `main` zu Firebase Hosting (Production/Preview je nach Workflow).

## localStorage-Keys
- `dfs.customers` — Array aller Kunden
- `dfs.contracts` — Array aller Verträge
- `dfs.analysis` — Analyse-Blob (KPI, Warnungen, Empfehlungen)
- `dfs.version` — optionaler Migrationsstand (String)
- `dfs.targetSavingsPct` — Zielersparnis in Prozent (UI)

## Datenmodelle (DE‑Felder)

### Kunde (`dfs.customers[]`)
```json
{
  "id": "string",
  "firma": "string",
  "ansprech": "string",
  "email": "string (optional)",
  "telefon": "string",
  "branche": "string (optional)",
  "mitarbeiter": 0,
  "umsatz": 0,
  "gruendung": 0,
  "standort": "string (optional)",
  "createdAt": "ISOString (optional)",
  "updatedAt": "ISOString (optional)"
}
```

### Vertrag (`dfs.contracts[]`)
```json
{
  "id": "string",
  "customerId": "string (optional)",
  "sparten": ["string"],
  "versicherer": "string",
  "produkt": "string (optional)",
  "policeNr": "string",
  "beginn": "YYYY-MM-DD",
  "zahlweise": "jährlich|halbjährlich|vierteljährlich|monatlich",
  "jahresbeitragBrutto": 0,
  "deckungssumme": 0,
  "selbstbehalt": 0,
  "gefahren": ["string"],
  "hinweiseVertrag": "string (optional)",
  "internVermerk": "string (optional)",
  "laufzeit": 3,
  "endDate": "YYYY-MM-DD",
  "reminderDate": "YYYY-MM-DD",
  "createdAt": "ISOString (optional)",
  "updatedAt": "ISOString (optional)"
}
```

### Analyse (`dfs.analysis`)
```json
{
  "warnings": ["string"],
  "recommendations": ["string"],
  "sumAnnual": 0,
  "targetPct": 10,
  "monthlySaving": 0,
  "riskScore": 80,
  "ts": "ISOString"
}
```

## Features
- Kundenverwaltung (CRUD, E‑Mail optional)
- Verträge (CRUD, Sparten, Gefahren, Zahlweise, Laufzeit 3/5 Jahre, Enddatum automatisch, Reminder)
- Dashboard (KPIs, Reminder in ≤ 90 Tagen)
- Analyse (Heuristiken → Warnungen, Empfehlungen, Risiko‑Score)
- Import/Export JSON (Kunden/Verträge)
- Druckansicht (A4, interner Vermerk wird nicht gedruckt)
- UI‑Polish: Toasts, Fokuszustände, Suche und sortierbare Tabellen

## Schnelltests
1. Seite hard‑reload (ggf. `?v=<timestamp>` anhängen)
2. Kunde anlegen (E‑Mail optional)
3. Vertrag anlegen: `beginn` setzen, `laufzeit` = 3|5 → `endDate` & `reminderDate` füllen sich
4. Dashboard prüfen: Abschnitt „Demnächst fällig (≤ 90 Tage)“
5. Analyse öffnen: KPIs, Warnungen/Empfehlungen sichtbar
6. Druckvorschau (Print‑Button): helle A4‑Ansicht, interner Vermerk fehlt
