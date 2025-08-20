
# DFS Versicherungsanalyse-Tool (Netlify Drop)

**Struktur**

```
dfs-versicherungsmodul/
├── index.html                # Shell mit Sidebar + <iframe>
├── assets/
│   └── logo.png
├── styles/
│   └── base.css              # DFS-CI + Print (A4)
├── scripts/
│   └── shell.js
└── modules/
    ├── dashboard/
    ├── customers/
    ├── contracts/
    ├── gaps/                 # NEU: Deckungslücken
    ├── savings/              # NEU: Ersparnisse
    ├── analysis/
    ├── print/
    └── help/
```

**Nutzung**

1. Öffne `index.html` lokal oder lade die ZIP per Netlify **Drop** hoch.
2. In der Sidebar Module wählen:
   - **Kunden** erfassen → `dfs.customer`
   - **Verträge** erfassen → `dfs.contracts` (CRUD, Import/Export JSON)
   - **Deckungslücken** prüfen → erzeugt Warnungen/Empfehlungen
   - **Ersparnisse** → Alt vs. Empfehlung, Summen
   - **Analyse** → KPIs (Zielersparnis, Risiko-Score)
   - **Dashboard** → Management-Summary
   - **PDF-Export** → druckoptimiert (A4), `window.print()`

**localStorage Keys (konform)**

- `dfs.customer` (Objekt)
- `dfs.contracts` (Array)
- `dfs.analysis` (Objekt; enthält warnings, recommendations, sumAnnual, savingsTotal, targetPct, monthlySaving, riskScore, ts)
- `dfs.targetSavingsPct` (Number, Standard 15)
- Tools/Checklisten: `dfs.tool.*`, `dfs.docs.checklists` (noch leer)
- `dfs.version` (z. B. 20250820.2232)

**Zahlen- & Datumsformat**

- Anzeige: `de-DE`, Euro mit 2 Nachkommastellen.
- Speicherung von Daten: `YYYY-MM-DD` in den Feldern, ISO‑Strings in Timestamps.

**Druck (A4)**

- @page A4, Ränder ~14 mm.
- Im Druck: helle Darstellung, 1px graue Grenzen.
- „Interner Vermerk“ wird nicht gedruckt.

**Sicherheit**

- Nur Browser‑Speicher (localStorage).
- Keine externen Requests, keine Cookies.
- Bei Quota‑Fehler: Export nutzen.

**Hinweise**

- Alle Pfade sind **relativ** (./…).
- Jede Unterseite (Modul) ist standalone nutzbar.
