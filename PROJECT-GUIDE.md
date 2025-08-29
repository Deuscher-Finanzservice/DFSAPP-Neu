---

### 2) `PROJECT-GUIDE.md` (ersetzen)

```markdown
# PROJECT GUIDE

## Ziel
Schnelle, robuste Datenerfassung (Kunden, Verträge) mit lokalem Arbeiten und optionalem Cloud-Sync. Fokus: klare UI, null Abhängigkeiten, nachvollziehbarer Code.

## Module & Navigation
- **Shell**: `index.html` (Sidebar, lädt Module per `<iframe>` / `src=./modules/.../index.html?v=DFS_VERSION`)
- **Dashboard**: Kennzahlen + Links
- **Kunden**: Liste/Editor → `dfs.customers`
- **Verträge**: Editor + Tabelle → `dfs.contracts`
- **Analysen/PDF**: Platzhalter

## Wichtige DOM-IDs (Verträge)
Form:
- `c-insurer`, `insurer-list`, `c-policy`, `c-product`, `risk-boxes`,  
  `c-start`, `c-freq`, `c-premium`, `c-coverage`, `c-deductible`, `c-notes`
Buttons:
- `btn-add`, `btn-export`, `btn-import`, `btn-save-cloud`, `btn-load-cloud`
Tabelle:
- `contracts-table` (mit `<tbody>`), Summenzelle: `sum-cell`

> **Hinweis:** Die Script-Einbindung am Ende von `modules/contracts/index.html` zeigt auf:
> ```html
> <script type="module" src="./contracts.js"></script>
> ```

## LocalStorage-Konventionen
- Keynamen: `dfs.customers` / `dfs.contracts`
- Immer **Array** speichern.
- Objekte enthalten `id`, `createdAt`, `updatedAt`.
- Migrations-Snippet (bei Strukturänderungen) lieber **einmalig** in der Console laufen lassen und danach entfernen.

## Cloud-Sync (Firebase)
- `scripts/firebaseClient.js` initialisiert App + liefert `db`.
- `scripts/firebase.js` enthält Hilfsfunktionen (load/save, merge, Konfliktstrategie).
- Standard-Sammlungen: `customers`, `contracts` (pro Projekt/Umgebung konfigurierbar).
- GitHub Actions deployen automatisch nach `main`.

## Versions-/Cache-Busting
- `window.DFS_VERSION = "YYYYMMDD.HHMM"` in `index.html`.
- Helper `withVersion(url)` hängt `?v=DFS_VERSION` an.

## Arbeitsweise mit Codex (Cloud)
- **Blöcke**: 1) Navigation/Versioning, 2) Verträge-CRUD, 3) Cloud-Sync Verträge, 4) Analyse
- **Modus**: Non-interactive + Auto
- **Status-Prompt** (Quick):
STATUS-CHECK (Cloud)
	•	git status
	•	kurz diff header (3-5 Zeilen)
	•	wenn ok: commit “feat: block X ready” & push
	•	antworte [DONE]
    ## Qualitätssicherung (leichtgewichtig)
- Manuelle Checks:
- Eingaben bleiben bei Reload erhalten (LS).
- Export/Import JSON funktioniert.
- Summen aktualisieren korrekt.
- Cloud-Buttons: keine Fehler in Console.
- Bei UI-Änderungen: IDs unverändert lassen oder an allen Stellen refaktorieren.

## Troubleshooting
- **Nichts aktualisiert sich?** → `DFS_VERSION` hochziehen und hart neu laden.
- **Firebase 404/favicon** → ignorierbar; prüfe Hosting-Deploys.
- **Git fragt nach Passwort** → auf **SSH** umstellen; Key unter GitHub „SSH and GPG keys“ hinterlegen.

## Arbeitsmodus mit Codex

- **Blöcke**: Alle Änderungen werden als komplette, zusammenhängende Blöcke geliefert („Codex-ready“), sodass sie direkt in Codex eingefügt werden können.  
- **Keine Snippets**: Keine losen Code-Schnipsel, sondern immer vollständige Blöcke.  
- **Commit/Push**: Standardmäßig ohne Commit. Status-Check + Commit-Push-Anweisungen kommen nur auf Wunsch und werden als **Anhang 3** markiert.  
- **Ablauf**:  
  1. Block wird in Codex eingefügt.  
  2. Codex führt Änderungen durch.  
  3. Wenn geprüft → optionaler Commit mit Anhang 3.  
- **Vorteil**: Klare Trennung zwischen Umsetzung und Versionskontrolle. Flexibler Workflow mit höchster Geschwindigkeit.