# Projekt-Guide – DFS Analyse (Stand: 2025-08-30)

## Ziel
Kompakte CRM/Analyse-App für Versicherungsverträge im Firmenkunden-Segment:
Kunden & Verträge verwalten, Reminder für Abläufe, Jahresumsätze/KPIs, PDF-Export.

## Scope (aktuell)
- Kunden/Verträge (CRUD) mit Cloud-Save (Firestore).
- Reminder-Logik (90/60/30 Tage).
- Globales Dashboard + Kunden-Dashboard.
- Debug-Mode mit exportierbaren Logs.

## Nicht-Ziele
- Kein Multi-Tenant / kein öffentlicher Vertrieb.
- Kein Offline-Modus (Cloud-only by design).

## Firestore – Collections
Siehe TECH-SPEC.md (Schemas & Indizes).

## Save-Flow (praktisch)
- Autosave: Debounce 800 ms; Statusleiste oben rechts (unsaved → saved/Fehler).
- Manuell: Buttons „Speichern“ pro View; identischer Codepfad.
- Fehler: klarer Status + Retry (niemals Spinner hängen lassen).

## Debug-Mode
- Umschalter rechts oben.
- Buttons: Kopieren, Als TXT, Pause, Erneut senden.
- Filter: Info/Warn/Error.

## Domains
- Prod: https://deutscher-finanzservice.web.app ✅ (verwenden)
- Legacy: https://deutscher-finanzservice.firebaseapp.com (nicht nutzen)

## CI/CD
- GitHub Actions Workflows (deploy on push/merge/PR preview).
- `push-now.sh` push’t auf `main` → auto Deploy.

## Backlog (Kurz)
1. Kunden-Dashboard weiter ausbauen (Einsparziel/Score kontextbezogen).
2. Tabellen-Export (CSV) für Kunden/Verträge.
3. Upload-UX verfeinern (Drag&Drop, Mehrfach-Uploads).
4. Optionale Auth (Allow-List) für Firestore Rules.

## Changelog (letzte Iterationen)
- Cloud-only umgestellt, LocalStorage-Reste entfernt.
- Einheitliche Cloud-API `dfsCloud.saveOne`.
- Debug-Overlay überarbeitet (sichtbar, kopierbar).
- Save-Flow stabilisiert (Debounce, Guards, Statusfixes).
