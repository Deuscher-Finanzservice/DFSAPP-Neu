#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------
# DFSAPP-Neu · Push & Deploy Helper
# - läuft von überall (springt ins Repo-Root)
# - sync:  git fetch + pull --rebase origin/main
# - commit: nur wenn Änderungen; sonst Empty-Commit (CI trigger)
# - push:   origin/main
# ---------------------------------------------

# 1) Ins Verzeichnis der Datei, dann ins Repo-Root wechseln
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Dieses Verzeichnis ist kein Git-Repo: $PWD"
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# 2) Checks/Info
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "❌ Kein 'origin' Remote konfiguriert. Bitte einmal 'git remote -v' prüfen."
  exit 1
fi

DEFAULT_BRANCH="main"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "➡️  Repo: $REPO_ROOT"
echo "➡️  Aktueller Branch: $CURRENT_BRANCH"

# 3) Auf main arbeiten (falls nicht bereits)
if [[ "$CURRENT_BRANCH" != "$DEFAULT_BRANCH" ]]; then
  echo "ℹ️  Wechsle zu '$DEFAULT_BRANCH' (war: '$CURRENT_BRANCH')"
  git checkout "$DEFAULT_BRANCH"
fi

# 4) Upstream holen (rebase-Workflow)
echo "➡️  Hole Änderungen von origin/$DEFAULT_BRANCH (rebase):"
git fetch origin
git pull --rebase origin "$DEFAULT_BRANCH"

# 5) Änderungen stage'n
echo "➡️  Stage alle Änderungen:"
git add -A

# 6) Commit: nur wenn staged Änderungen, sonst empty commit zum CI-Triggern
if git diff --cached --quiet; then
  echo "ℹ️  Keine Änderungen gefunden – erzeuge Empty-Commit (CI-Trigger)."
  git commit --allow-empty -m "ci: trigger deploy"
else
  TS="$(date +"%Y-%m-%d %H:%M:%S")"
  MSG="chore(deploy): push via script @ ${TS}"
  echo "➡️  Commit: ${MSG}"
  git commit -m "${MSG}"
fi

# 7) Push
echo "➡️  Push nach origin/$DEFAULT_BRANCH:"
git push -u origin "$DEFAULT_BRANCH"

# 8) Hinweis auf GitHub Actions
REPO_URL="$(git config --get remote.origin.url | sed -E 's/\.git$//' | sed -E 's#^git@github.com:#https://github.com/#')"
echo "✅ Fertig. GitHub Actions startet jetzt das Deploy nach Firebase Hosting."
echo "🔗 Actions-Übersicht: ${REPO_URL}/actions"