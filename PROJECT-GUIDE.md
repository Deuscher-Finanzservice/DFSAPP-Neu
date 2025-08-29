# PROJECT-GUIDE – DFS Versicherungsanalyse
**Stand:** 2025-08-29 07:16

## Ziele
- Modulares, statisches Analyse‑Tool im **DFS‑CI**, kein Backend, nur localStorage + optional Firestore.
- Drucken statt großer PDFs (A4 optimiert).

## CI
- Farben: Hintergrund #00223B, Akzent #896c20, Text #ffffff, Sekundär #C0C0C0, Warnung #D97706.
- Fonts: Inter/Roboto per Google Fonts.
- Komponenten: dunkle Karten (rgba‑Weiß 0.04), 1px Border (0.08), Radius 16px.

## Architektur
- **Shell + iframe**: lädt Module aus `/modules/<slug>/index.html`.
- **Firestore Bridge**: `scripts/firebase.js` stellt die Cloud‑Funktionen bereit.
- **Keine externen JS‑Libs** (außer Firebase CDN + Google Fonts).

## Module (Phase 1)
1) Shell & Layout ✔
2) Kundenstammdaten ✔
3) Verträge/Sparten ✔ (inkl. Cloud‑Save)
4) Analyse‑Wizard ✔ (Baseline Heuristiken)
5) Ergebnis‑Dashboard ✔
6) PDF‑Export (druckoptimiert) ✔

## Datenmodell (Kernauszug)
- `dfs.customer` → siehe README
- Vertrag (`contracts`‑Collection & `dfs.contracts`):
  ```json
  { "id": "string", "sparten": ["string"], "versicherer": "string",
    "policeNr": "string", "beginn": "YYYY-MM-DD", "zahlweise": "jährlich|…",
    "jahresbeitragBrutto": 0, "gefahren": [], "empfehlungen": [],
    "createdAt": "ISOString", "updatedAt": "Firestore serverTimestamp" }
  ```

## Heuristiken (Baseline)
- BHV Deckungssumme < 5 Mio. → Warnung
- Inhalt/Gebäude: < 3 Gefahren → Warnung
- Cyber vorhanden ohne Bausteine → Warnung
- Fehlende Sparten: Cyber / BU / Rechtsschutz → Empfehlung
- KPI: sumAnnual, targetPct, monthlySaving, riskScore

## QA‑Checklist
- Shell lädt Module, aktive Navigation ✔
- Kunden: E‑Mail optional, Validierung nur wenn gesetzt ✔
- Verträge: CRUD, Import/Export JSON, Cloud‑Sync ✔
- Analyse: Warnungen/Empfehlungen & KPIs plausibel ✔
- Print: A4, Reihenfolge KPI → Warnungen/Empfehlungen → Tabelle ✔
