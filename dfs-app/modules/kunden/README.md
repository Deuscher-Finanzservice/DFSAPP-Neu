# DFS – Modul 2: Kundenstammdaten (Standalone)

**Ziel:** Formular zur Erfassung von Kundenstammdaten im DFS-Design. Speicherung im Browser (`localStorage`) unter **`dfs.customer`**. 
Kann **allein** (Netlify Drop) laufen **oder** in der Shell unter `/modules/kunden/` eingebunden werden.

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

## Felder
- Firma (*)  
- Ansprechpartner  
- E-Mail (*)  
- Telefon  
- Branche  
- Mitarbeiter (Number)  
- Umsatz (EUR, Number)  
- Gründungsjahr (Number)

## Funktionen
- **Speichern**: Validiert Pflichtfelder und schreibt JSON nach `localStorage` (Key `dfs.customer`).
- **Autosave**: Speichert bei Feldänderung (falls valide).
- **Zurücksetzen**: Löscht `dfs.customer`.
- **Export `.json`** / **Import `.json`**.
- **Weiter zu Verträge**: Navigiert relativ zu `../vertraege/index.html` (funktioniert im Shell-iframe).

## Integration in die Shell
1. Diesen kompletten Ordner als **`/modules/kunden/`** in dein Shell-Projekt kopieren/ersetzen.
2. In der Shell ist der Sidebar-Link bereits vorhanden und lädt `./modules/kunden/index.html`.

## Hinweise
- Farben/CI: Hintergrund `#00223B`, Akzent `#896c20`, Text `#ffffff`, Sekundär `#C0C0C0`, Warnung `#D97706`.
- Schrift: Inter/Roboto via Google Fonts.
- Nur relative Pfade; keine Build-Schritte.
- Datum: erzeugt `createdAt`/`updatedAt` ISO-Timestamps.