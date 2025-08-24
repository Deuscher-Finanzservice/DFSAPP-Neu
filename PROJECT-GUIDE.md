
# PROJECT-GUIDE.md

## Projekt: DFS Versicherungsanalyse-Tool

### 1. Zielsetzung
- Modulares, rein statisches Web-Tool zur Analyse gewerblicher Versicherungen.
- Funktionen: Deckungslücken erkennen, Einsparpotenziale berechnen, Vergleiche darstellen, druckoptimierte Reports erzeugen.
- Klare Verkaufspsychologie, Management-Nutzen, schneller ROI.

---

### 2. Architektur
- **Frontend**: statisch, Vanilla JS, HTML, CSS.
- **Deployment**: Netlify (alternativ Vercel).
- **Quellcode-Verwaltung**: GitHub Desktop (Repo „DFSAPP-Neu“).
- **Persistenz**: zunächst `localStorage`, mittelfristig Supabase (Postgres + Auth).
- **Shell**: Sidebar + `<iframe id="content">`, lädt Module unter `/modules/<slug>/index.html`.

---

### 3. Module (Phase 1)
1. Shell & Layout
2. Kundenstammdaten
3. Verträge/Sparten (mit Gefahren, Deckung, Vergleich)
4. Analyse-Wizard (Heuristiken)
5. Ergebnis-Dashboard (KPIs, Warnungen, Empfehlungen)
6. PDF-/Druckexport
7. Hilfen, Tools, Vorlagen (z. B. Telefonleitfaden, Beratungsablauf, Quittung, Beratungsverzicht)

---

### 4. Design & CI
- **Farben**:  
  - Hintergrund: `#00223B`  
  - Akzent/Gold: `#896c20`  
  - Text: `#ffffff`  
  - Sekundär: `#C0C0C0`  
  - Warnung: `#D97706`
- **Fonts**: Inter/Roboto (Google Fonts).
- **Komponenten-Stil**: dunkle Karten (`rgba(255,255,255,0.04)`), Border 1px (`rgba(255,255,255,0.08)`), r=16px.

---

### 5. Datenmodelle
**Kunde (`dfs.customer`)**
```json
{
  "firma": "string",
  "ansprech": "string",
  "email": "string?",
  "telefon": "string",
  "branche": "string?",
  "mitarbeiter": "number?",
  "umsatz": "number?",
  "gruendung": "number?",
  "standort": "string?"
}
```

**Vertrag (`dfs.contracts[]`)**
```json
{
  "id": "string",
  "sparten": ["string"],
  "versicherer": "string",
  "produkt": "string?",
  "policeNr": "string",
  "beginn": "YYYY-MM-DD",
  "ende": "YYYY-MM-DD?",
  "hauptfaellig": "string?",
  "zahlweise": "jährlich|halbjährlich|vierteljährlich|monatlich",
  "jahresbeitragBrutto": "number",
  "deckungssumme": "number?",
  "selbstbehalt": "number?",
  "kuendigungsfrist": "string?",
  "gefahren": ["string"],
  "empfehlungen": ["string"],
  "hinweiseVertrag": "string?",
  "internVermerk": "string?",
  "vergleichDirektVersicherer": "string?",
  "vergleichDirektBeitrag": "number?",
  "empfehlungVersicherer": "string?",
  "empfehlungBeitrag": "number?",
  "createdAt": "ISOString",
  "updatedAt": "ISOString"
}
```

**Analyse (`dfs.analysis`)**
```json
{
  "warnings": ["string"],
  "recommendations": ["string"],
  "sumAnnual": "number",
  "targetPct": "number",
  "monthlySaving": "number",
  "riskScore": "number",
  "ts": "ISOString"
}
```

---

### 6. Heuristiken (Analyse)
- **Warnungen**:
  - BHV Deckungssumme < 5 Mio. → Warnung.
  - Inhalt/Gebäude: weniger als 3 Gefahren → Warnung.
  - Cyber vorhanden, aber keine Bausteine → Warnung.
- **Empfehlungen (fehlende Sparten)**:
  - Falls kein Cyber → „Cyber ergänzen …“
  - Falls kein Ertragsausfall/BU → „Betriebsunterbrechung absichern“
  - Falls kein Rechtsschutz → „Rechtsschutz prüfen …“
- **KPIs**:
  - `sumAnnual` = Summe aller `jahresbeitragBrutto`
  - `monthlySaving` = Berechnung anhand Ziel-Sparquote
  - `riskScore` = `95 - (10 * Anzahl Warnungen)` (min. 5)

---

### 7. Standard-Checklisten pro Sparte
- **Betriebshaftpflicht (BHV)**  
  - Tätigkeitsschäden mitversichert  
  - Produkthaftpflicht prüfen  
  - Umwelthaftpflicht  
  - Obhutschäden  

- **Inhaltsversicherung**  
  - Versicherungssumme prüfen  
  - Betriebsunterbrechung  
  - Sachen auf Baustellen mitversichert  
  - erweiterte Neuwertentschädigung  

- **Gebäudeversicherung**  
  - Feuer- und Elementarschäden prüfen  
  - Mietausfall mitversichert  
  - Glasbruchoption  

- **Cyberversicherung**  
  - Haftpflichtbaustein enthalten?  
  - Eigenschäden mitversichert  
  - Datenwiederherstellung  
  - Betriebsunterbrechung nach Cyber-Schaden  

(→ später erweiterbar für Rechtsschutz, D&O, Gruppenunfall, etc.)

---

### 8. Print / PDF
- `@page` Format A4, Ränder ~14mm.  
- Dunkle Flächen im Druck auf weiß umstellen.  
- Tabellen mit klaren Grenzen (1px grau).  
- Chips für Warnungen & Empfehlungen.

---

### 9. localStorage Keys
- `dfs.customer` → Kundenstammdaten  
- `dfs.contracts` → Verträge  
- `dfs.analysis` → Analyse  
- `dfs.targetSavingsPct` → Ziel-Sparquote  
- `dfs.tool.*` → Tools  
- `dfs.docs.checklists` → Checklisten  
- `dfs.version` → Versionstempel

---

### 10. Nächste Schritte
1. Mapping der Empfehlungen je Sparte finalisieren.  
2. Supabase-Anbindung für gemeinsame Nutzung.  
3. PDF/Print-Layout testen und optimieren.  
4. Langfristig: KI-gestützte Empfehlungen.  

---

© Deutscher Finanzservice · Projektstand aktuell
