
# DFS Versicherungsanalyse-Tool

## Management-Zusammenfassung

### Ziel
Ein modulares, statisches Web-Tool zur Analyse gewerblicher Versicherungen im DFS-Corporate Design.  
Einsatz in Beratungsgesprächen, zur Bestandserfassung, Deckungslücken-Analyse, KPI-Darstellung und druckoptimierten Ausgaben (PDF/Print).

### Status quo (fertig umgesetzt)
- **Basis-Shell** mit Sidebar + `<iframe>` (lädt Module).
- **Module:**
  1. Home (Übersicht, letzter Kunde/Analyse)
  2. Kundenstammdaten (CRUD, Speicherung localStorage)
  3. Verträge & Sparten (Standard-Sparten, Gefahren, Checklisten-Empfehlungen)
  4. Analyse-Wizard (Heuristiken + KPIs)
  5. Ergebnis-Dashboard (KPIs + Vertragsliste)
  6. PDF-Export (druckoptimiert, A4)
  7. Hilfen & Vorlagen (Textbausteine, persistiert)

- **Technik:**
  - Statisch, Vanilla-JS, keine externen Libs außer Google Fonts
  - Persistenz: aktuell `localStorage`
  - Import/Export: JSON-Dateien
  - CI: Hintergrund #00223B, Gold #896c20, Text #fff, Sekundär #C0C0C0, Warnung #D97706

- **Deployment:**
  - Netlify (statisch, direkt aus GitHub Repo)
  - Live-URL: https://deutscher-finanzservice.netlify.app/

### Nächste geplante Schritte
1. **Feinschliff (Phase 1.5):**
   - 404-Seite
   - Footer mit `dfs.version`

2. **Erweiterungen (Phase 2):**
   - Vertrags-Editor (Bearbeiten, nicht nur Löschen)
   - Vergleichsmodul (Alternativ-Versicherer + Beiträge)
   - Tools: GKV vs PKV, Basis vs Privat, Vorsorge-Preview

3. **Cloud-Edition (Phase 3):**
   - Supabase/Postgres mit Auth (E-Mail/Magic-Link)
   - Multiuser-Fähigkeit (gemeinsames Arbeiten, z. B. du + Frau)
   - RLS-Policies für Mandantentrennung
   - Weiterhin statisches Hosting (Netlify + GitHub)

---

## Arbeitsweise
- Updates erfolgen als ZIP mit Projektstruktur (Netlify-Drop-ready).
- Nutzung: ZIP entpacken → Repo-Ordner (GitHub Desktop) → Commit & Push.
- Fokus: einfache Bedienung, modulare Erweiterbarkeit, jederzeit auf Cloud erweiterbar.

---

**Version:** 20250820.2126
