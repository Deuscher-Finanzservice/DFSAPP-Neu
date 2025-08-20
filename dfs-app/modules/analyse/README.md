# DFS – Modul 4: Analyse-Wizard (Standalone)

**Ziel:** Regelbasierte Analyse von Kunden- und Vertragsdaten (aus `localStorage`) mit Risiko-Score, Lücken/Warnungen und Einsparungs-Schätzung. Export als JSON und Speicherung unter `dfs.analysis`.

## Struktur
```
.
├── index.html
├── assets/
│   ├── logo.png
│   └── rules.json
├── styles/
│   └── styles.css
└── scripts/
    └── wizard.js
```

## Datenquellen (Browser `localStorage`)
- `dfs.customer` – Objekt aus Modul 2
- `dfs.contracts` – Array aus Modul 3
- `dfs.targetSavingsPct` – Einsparziel in %, optional (sonst Default 8 %)

## Regeln (vereinfachte DSL in `assets/rules.json`)
- `cyber_missing_high`: Cyber fehlt bei Branchen IT/E-Commerce/Gesundheitswesen → hoch
- `bhv_coverage_low_for_revenue`: Umsatz ≥ 2 Mio & BHV-Deckung < 5 Mio → mittel
- `do_missing_mid`: D&O ab 20 MA empfohlen → mittel
- `business_interruption_missing`: Inhalt/Gebäude vorhanden aber Ertragsausfall/BU fehlt → mittel
- `cancellation_window`: Ende <120 Tage & Kündigungsfrist ≥90 Tage → niedrig

**Score:** Start 85; Abzüge hoch −15, mittel −8, niedrig −3.

**Einsparung:** Summe Beiträge × Ziel%; Bandbreite 5–12 % als Orientierung.

## Integration in die Shell
- Ordner als `/modules/analyse/` einfügen/ersetzen. Sidebar-Link lädt `./modules/analyse/index.html`.