
# DFS Versicherungsanalyse-Tool (Netlify Drop)

**Struktur (ZIP-Inhalt):**
```
dfs-versicherungsmodul/
├── index.html
├── assets/
│   └── logo.png
├── styles/
│   └── main.css
├── scripts/
│   ├── storage.js
│   └── util.js
└── modules/
    ├── home/
    │   └── index.html
    ├── customer/
    │   └── index.html
    ├── contracts/
    │   └── index.html
    ├── analysis/
    │   └── index.html
    ├── dashboard/
    │   └── index.html
    ├── print/
    │   └── index.html
    └── tools/
        └── index.html
```

**Nutzung:**
- Öffne `index.html`. Die Shell lädt die Module in ein `<iframe id="content">`.
- Navigation in der Sidebar.
- **Speicherung:** ausschließlich `localStorage` im Browser. Keine externen Calls, keine Cookies.

**Import/Export:**
- Hauptmenü: `Export` erzeugt `dfs_export.json` mit allen Schlüsseln.
- `Import` akzeptiert JSON gleicher Struktur und überschreibt bestehende Werte.
- `Reset` löscht alle `dfs.*` Keys.

**localStorage Keys:**
- `dfs.customer` – Objekt mit Stammdaten
- `dfs.contracts` – Array der Verträge
- `dfs.analysis` – Objekt letzter Analyse
- `dfs.targetSavingsPct` – gewünschte Einsparquote (0–50)
- `dfs.tool.basispriv`, `dfs.tool.gkvpkv`, `dfs.tool.vorsorge` – reserviert
- `dfs.docs.checklists` – Inhalte Hilfen/Vorlagen
- `dfs.version` – Zeitstempel

**Datenmodelle:**
- Entsprechen der Projektvorgabe (siehe `scripts/storage.js`, Funktion `analyze` & Formulare).

**Design & CI:**
- Farben: Hintergrund `#00223B`, Gold `#896c20`, Text `#ffffff`, Sekundär `#C0C0C0`, Warnung `#D97706`
- Karten: dunkler Hintergrund, 1px Border, Radius 16px
- Fonts: Inter/Roboto via Google Fonts

**Druck (A4):**
- Modul **PDF-Export** bietet eine druckoptimierte Seite (Browser `Drucken` → „Als PDF sichern“).
- In Print: helle Darstellung, klare Tabellen, Chips als einfache Aufzählung.

**Hinweise:**
- Alle Pfade sind **relativ** (`./…`). Jede Unterseite funktioniert standalone.
- Keine externen JS-Libraries, nur Google Fonts im CSS.
- Fehlerfälle `localStorage` werden mit Toast-Hinweisen abgefangen.
- „Interner Vermerk“ wird aktuell nicht in Print geführt (nicht implementiert).

**Version:** 20250820.2104
