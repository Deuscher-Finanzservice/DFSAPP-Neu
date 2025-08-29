#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1

# Branch
BR="apply-codex-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BR"

# Patch aus Clipboard
pbpaste > /tmp/codex.patch

# Anwenden
git apply --reject --whitespace=fix /tmp/codex.patch || true

echo
echo "✅ Patch angewendet (ggf. *.rej manuell mergen)."
git status
echo
echo "Wenn alles gut: git add -A && git commit -m \"chore(codex): apply patch\" && git push -u origin $BR"