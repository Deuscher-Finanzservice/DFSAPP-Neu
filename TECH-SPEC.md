# DFS Versicherungsanalyse -- Technische Spezifikation

## Stand

2025-08-24

------------------------------------------------------------------------

## Architektur

-   **Frontend only**: statisch, Deploy via Netlify (ZIP-Upload oder
    GitHub → Netlify)
-   **Shell**: Lädt Module via `<iframe>` (/modules/.../index.html)
-   **Persistenz aktuell**: `localStorage`
-   **Zukunft**: Supabase/Postgres mit Auth & Row-Level-Security
    (bereits vorbereitet, noch nicht aktiv)

------------------------------------------------------------------------

## Module (Phase 1)

1.  **Basis-Shell** (Sidebar + Iframe Loader)
2.  **Kundenstammdaten** (dfs.customer)
3.  **Verträge/Sparten** (dfs.contracts)
4.  **Analyse-Wizard**
5.  **Ergebnis-Dashboard**
6.  **PDF-/Print-Export**

------------------------------------------------------------------------

## Datenmodelle

### Kunde (`dfs.customer`)

``` json
{
  "firma": "string",
  "branche": "string",
  "email": "string?",
  "telefon": "string?",
  "mitarbeiter": "number?",
  "umsatz": "number?",
  "gruendung": "number?",
  "standort": "string?"
}
```

### Vertrag (`dfs.contracts[]`)

``` json
{
  "id": "string",
  "sparten": ["string"],
  "versicherer": "string",
  "produkt": "string?",
  "policenNr": "string",
  "beginn": "YYYY-MM-DD",
  "ende": "YYYY-MM-DD?",
  "hauptfaellig": "string",
  "zahlweise": "jährlich|halbjährlich|vierteljährlich|monatlich",
  "jahrespraemieBrutto": "number",
  "deckungssumme": "number?",
  "selbstbehalt": "number?",
  "kuendigungsfrist": "string?",
  "gefahren": ["string"],
  "empfehlungen": ["string"],
  "hinweisVertrag": "string?",
  "internVermerk": "string?"
}
```

------------------------------------------------------------------------

## Supabase-Anbindung

-   `.env` Variablen via Netlify (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)
-   `functions/public-config.js` liefert Keys per JSON an Client
-   Client lädt Verbindung via `/scripts/supabase-env-loader.js`

------------------------------------------------------------------------

## Projekt-Setup

-   **GitHub Desktop** für Commits & Push
-   **VS Code** für Bearbeitung
-   ZIPs nur noch optional → Standardweg: GitHub → Netlify Auto-Deploy

------------------------------------------------------------------------
