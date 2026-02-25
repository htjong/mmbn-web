#!/bin/bash
set -euo pipefail
ROOT="${1:-.codex/skills}"
if rg -n "\.claude/" "$ROOT"; then
  echo "Found forbidden .claude path references under $ROOT"
  exit 1
fi
echo "No .claude runtime path references found under $ROOT"
