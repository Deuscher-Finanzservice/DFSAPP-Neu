#!/usr/bin/env bash
set -euo pipefail

# Repo-Root ermitteln (läuft egal von wo du das Skript startest)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "→ Remote prüfen:"
git remote -v || true

# Auf main arbeiten (falls nicht bereits aktiv)
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "→ Wechsle auf 'main' (war: $CURRENT_BRANCH)"
  git checkout main
fi

echo "→ Hole Änderungen von origin/main (rebase):"
git pull --rebase origin main || true

echo "→ Stage alle Änderungen:"
git add -A

# Commit nur, wenn es wirklich Änderungen gibt
if git diff --cached --quiet; then
  echo "✓ Keine Änderungen zu committen."
else
  TS="$(date '+%Y-%m-%d %H:%M:%S')"
  MSG="chore(deploy): push via script @ ${TS}"
  echo "→ Commit: ${MSG}"
  git commit -m "${MSG}"
fi

echo "→ Push nach origin/main (SSH empfohlen):"
git push -u origin main

echo
echo "✓ Fertig. GitHub Actions startet jetzt das Deploy nach Firebase Hosting."
echo "  Tip: Öffne GitHub → Actions → der neueste Workflow sollte 'in progress' sein."