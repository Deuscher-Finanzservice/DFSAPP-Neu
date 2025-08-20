# DFS – Modul 3: Verträge & Sparten (Standalone)

**Ziel:** Verwaltung mehrerer Versicherungsverträge (CRUD), Import/Export (JSON), Summenberechnung. Speicherung lokal in `localStorage` unter **`dfs.contracts`**. Optionales **Einsparziel (%)** unter **`dfs.targetSavingsPct`**.

## Struktur
```
.
├── index.html
├── assets/
│   └── logo.png
├── styles/
│   └── styles.css
└── scripts/
    └── app.js
```

## Felder je Vertrag (MVP)
- Sparte* (vorgegeben + Freitext), Versicherer*, Produkt, Police-Nr.*, Beginn*, Ende, Hauptfälligkeit, Zahlweise, Jahresbeitrag (brutto)*, Deckungssumme, Selbstbehalt, Kündigungsfrist, Risikostandort, Vermittlernummer, Notizen

## Funktionen
- **Hinzufügen / Bearbeiten / Löschen** (modales Formular)
- **Autosave** nach Aktionen
- **Summe Jahresbeiträge** im Tabellen-Footer
- **Einsparziel (%)** separat pflegen → `dfs.targetSavingsPct`
- **Export/Import** als JSON
- **Weiter zur Analyse** → `../analyse/index.html` (für Shell-Integration)

## Integration in Shell
- Ordner als `/modules/vertraege/` einfügen/ersetzen. Sidebar-Link lädt `./modules/vertraege/index.html`.