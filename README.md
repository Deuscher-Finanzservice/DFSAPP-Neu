# DFSAPP-Neu — Statische DFS Versicherungsanalyse

Statische Web-App (HTML/CSS/JS), Speicherung nur lokal (localStorage), CI via GitHub Actions, Hosting via Firebase.

## Struktur

.
├── index.html                # Shell (Sidebar + iframe)
├── assets/
├── styles/
│   ├── base.css              # DFS-CI (Dark Theme)
│   └── print.css             # A4-optimierte Druckansicht
├── scripts/
│   ├── firebaseClient.js     # Firebase Bootstrap (App/DB)
│   └── firebase.js           # Cloud-CRUD (optional)
└── modules/
    ├── customers/           # Kundenliste & Detail
    ├── contracts/           # Verträge (CRUD, Laufzeit/Enddatum/Reminder)
    ├── dashboard/           # KPIs + Reminder (≤90 Tage)
    ├── analysis/            # Auswertung (Summe, Zielersparnis)
    └── print/               # Druckbericht

## DFS-CI
- Hintergrund `#00223B`, Akzent `#896c20`, Text `#ffffff`, Sekundär `#C0C0C0`, Warnung `#D97706`
- Fonts: Inter/Roboto (Google Fonts)
- Karten: dunkler Hintergrund, dünne Border, Radius 16px

## localStorage-Keys
- `dfs.customers` — Array aller Kunden
- `dfs.contracts` — Array aller Verträge
- `dfs.analysis` — Analyse-Blob (Summe, Ziele, etc.)
- `dfs.targetSavingsPct` — Zielersparnis in Prozent (UI)
- (optional UI-State Keys)

## Datenmodelle

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
  "standort": "string (optional)"
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

## Reminder-Logik
- Enddatum = beginn + laufzeit (3 oder 5 Jahre)
- Reminder = beginn + 3 Jahre − 3 Monate
- Dashboard zeigt Verträge mit `reminderDate` in ≤ 90 Tagen

## Import/Export
- Export: JSON-Download der Tabelleninhalte
- Import: JSON einfügen → Verträge/Kunden werden auf DE-Schema normalisiert (Migration aktiv)

## Druck/PDF
- `styles/print.css` aktiviert helle A4-Ansicht
- Interner Vermerk (`internVermerk`) wird nicht gedruckt (`.intern-only`)
- Button „Als PDF speichern“ ruft `window.print()` auf

## Schnellstart / Kurztests
1. Seite hard-reload (ggf. `?v=<timestamp>` anhängen)
2. Kunde anlegen (E-Mail optional)
3. Vertrag anlegen: beginn setzen, laufzeit = 3|5 → `endDate` & `reminderDate` werden automatisch gefüllt
4. Dashboard prüfen: Abschnitt „Demnächst fällig (≤ 90 Tage)“
5. Druckvorschau (Print-Button): helle A4-Ansicht, interner Vermerk fehlt

## CI/CD
- Push auf `main` → GitHub Actions deployen automatisch zu Firebase Hosting
- Falls Cache: URL mit `?v=<timestamp>` neu laden

## Troubleshooting
- Kein Speicher: Browser-Quota voll → Export durchführen, localStorage leeren
- Altdaten: Migration hebt EN-Felder auf DE-Schema (normalisiert beim Laden/Speichern)
- PR-Banner: direkt auf `main` arbeiten oder Branches zeitnah mergen/löschen

---

## Commit (direkt auf `main`)

docs: README aktualisiert (datenmodell DE, keys, reminder-flow, druck, kurztests)

---

## Quick-Check nach Push
- README auf GitHub öffnen → neue Abschnitte sichtbar.
- App kurz durchklicken nach obiger Kurztestliste.
