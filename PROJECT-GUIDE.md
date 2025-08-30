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
# PROJECT-GUIDE — DFSAPP-Neu (Betrieb, Workflows, CI/CD)

## 1. Repositories & Hosting
- Repo: `github.com/Deuscher-Finanzservice/DFSAPP-Neu`
- Hosting: Firebase Hosting
- Primäre Domain (benutzen!): `https://deutscher-finanzservice.web.app`
- Alternative Domain (`firebaseapp.com`) NICHT nutzen (getrennte Caches/Verwirrung).

## 2. Arbeiten mit Codex (Empfehlung)
- Pro Block ein kurzer, präziser Prompt.
- Nach jedem Block: Commit + Push auf `main` explizit anweisen.
- Bei „context zu lang“ → neuen Codex-Chat starten (weiße Oberfläche).

## 3. Branching / Commit
- Standard: direkt auf `main`.
- Commit-Format: `feat|fix|refactor|docs|chore(scope): message`
- Beispiel: `fix(customers): cloud-loader vereinheitlicht`

## 4. Lokales Arbeiten / Push
- Variante A: Codex committed/pusht.
- Variante B: GitHub Desktop → Änderungen sehen → Commit → Push `main`.

## 5. CI/CD
- GitHub Actions (Hosting Deploy) aktiv (Workflows im Repo).
- Deploy erfolgt automatisch bei Push auf `main`.

## 6. Cloud-only Prinzipien (wichtig)
- Kunden/Verträge/Analyse nur in Firestore, keine localStorage Spiegelung.
- Storage für Policen & Kundendokumente.
- Buttons „In Cloud speichern / Aus Cloud laden“ sind entfernt (vereinfachtes UX).

## 7. Module / Navigation
- Shell/Sidebar lädt Module via `<iframe id="content">` mit relativen Pfaden.
- Konsistente Navigation: Dashboard global, Kundenliste, Verträge, Analyse, Konfiguration.

## 8. Dashboards (global & kundenspezifisch)
- Global: operative KPIs + Widget „Demnächst fällig 90/60/30“ inkl. Umsatzsumme & Fokus-Kunden.
- Kunde: KPIs, Warnungen/Empfehlungen, Verträge, Delta, Dokumente, Print.

## 9. Save-Flow
- Explizit speichern (Button, `Ctrl/Cmd+S`), Autosave (Config-gesteuert).
- Status-Badge, Spinner, „zuletzt gespeichert HH:MM“.
- Autosave-Erfolg leise (keine Toast-Flut), Fehler rate-limited.

## 10. Formulare & Felder
- Kunde: E-Mail nicht Pflicht; Branche = Dropdown (30 Optionen); Standort = Adresse/PLZ/Ort (strukturiert).
- Vertrag: Laufzeit optional, Reminder berechnet; Vergleich/Empfehlung möglich; Upload Policen.
- Löschen: Confirm-Modal mit Checkbox, kaskadierend optional.

## 11. Print/PDF
- Kunden-Dashboard print-optimiert, hell, A4, 2 Logos, Footertext aus Config; interne Felder werden ausgeblendet.
- `window.print()` als „Als PDF speichern“.

## 12. DEV / Diagnose
- Debug-Logs in Konsole (über ⚙️ schaltbar).
- Hard-Reload (cache-bust) via DEV-Menü.
- Version/Buildzeit im Footer (optional).

## 13. Fehler-Checkliste (häufige Ursachen)
- Falsche Domain genutzt → immer `.web.app`.
- Suchfeld mit Leerzeichen filtert alles weg → trimmen.
- Collections singular/plural verwechselt → `dfs.customers` / `dfs.contracts`.
- Firestore-Regeln blocken → Network-Tab prüfen.
- `jahresbeitragBrutto` als String nicht geparst → Summen `NaN`.
