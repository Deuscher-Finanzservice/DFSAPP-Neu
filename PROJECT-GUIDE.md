# PROJECT-GUIDE — Leitfaden (Stand Block 10)

## Projektziel & Nutzen
DFS Versicherungsanalyse unterstützt Berater dabei, Deckungslücken und Einsparpotenziale schnell sichtbar zu machen und strukturiert mit Kunden zu besprechen.

## Zielgruppe
Gewerbekunden (KMU).

## Workflow (Empfohlen)
1. Kunden anlegen (Firma, Ansprechpartner; E‑Mail optional).
2. Verträge anlegen (Sparten, Gefahren, Zahlweise, Laufzeit 3/5). Beginn setzen → Enddatum/Reminder berechnet sich.
3. Analyse starten → Heuristiken erzeugen Warnungen/Empfehlungen; KPIs prüfen.
4. Dashboard ansehen → KPIs & Reminder (≤ 90 Tage) im Blick behalten.
5. Export/Druck für Kundengespräch (JSON‑Export; A4‑Druck, interner Vermerk wird nicht gedruckt).

## Rollen
- Berater = Nutzer der App
- Kunde = Datensatz in `dfs.customers`

## CI/CD
Push auf `main` → GitHub Actions deployen automatisch zu Firebase Hosting.

## Entwickler‑How‑To
- Module sind standalone (`modules/<slug>/index.html` + ggf. `<slug>.js`).
- Neue Features in kleinen Blöcken entwickeln; Commit‑Messages nach Typ (feat/chore/fix/docs).
- Cache‑Bust für manuelles Testen: `?v=<timestamp>` an Modul‑URL anhängen.
- Datenhaltung: Nur `localStorage` (siehe `scripts/storage.js`); Normalisierung EN→DE im Contracts‑Modul.
- Utilities: `scripts/format.js` (de‑DE), `scripts/date.js`, `scripts/toast.js`, `scripts/io.js`.

## Offene Punkte (nächste Schritte)
- Block 11: Dashboard zeigt Analyse‑KPIs + Warnungen/Empfehlungen direkt.
