# Working-Mode & Checklisten (Stand: 2025-08-30)

## Prinzipien
- Cloud-only (keine lokalen Fallbacks).
- Kleine, abgeschlossene Blöcke (PR/Commit pro Block).
- Immer mit Debug-Mode testen.

## Tagesroutine (kurz)
1. Branch erstellen (z. B. `feat/...` oder `fix/...`).
2. Ändern → `./push-now.sh` auf `main` (oder Branch + PR).
3. Firebase Hosting Deployment prüfen (GitHub Actions → ✅).
4. App mit `?v=<timestamp>` hart neu laden.

## Quick-Test (nach jedem Deploy)
- Kunden anlegen/bearbeiten → Status „Gespeichert“ erscheint.
- Vertrag anlegen → Enddatum/Reminder korrekt.
- Dashboard zeigt korrekte Zähler & „Demnächst fällig“-Listen.
- Debug-Overlay: Logs sichtbar, Kopieren/TXT ok.
- Kein „client is offline“ in Konsole (falls doch → Seite neu laden; Long-Polling aktiv).

## Fehlerleitfaden
- RPC Write/Listen transport errored / client offline  
  → Firestore Init prüfen (Long-Polling an, Persistence aus), Netz/Adblocker checken.
- Spinner hängt  
  → Fehlerpfad muss `withSpinnerOn` setzen; `isSaving` Guard prüfen.

## Commit-Konvention
`type(scope): summary`  
Typen: `feat`, `fix`, `chore`, `docs`, `refactor`.

## Branch-Namen
`feat/contracts-reminders`, `fix/customers-save-spinner`, `docs/refresh-YYYYMMDD`.
