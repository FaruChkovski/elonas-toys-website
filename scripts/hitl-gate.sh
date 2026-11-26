#!/bin/bash
# =============================================================================
# HITL Gate Script
# =============================================================================
# Validates a HITL approval file for commit/push actions.
#
# Usage: ./scripts/hitl-gate.sh <commit|push> <approval-file>
# =============================================================================

set -euo pipefail

ACTION="${1:-}"
APPROVAL_FILE="${2:-}"

if [[ -z "$ACTION" || -z "$APPROVAL_FILE" ]]; then
  echo "Usage: $0 <commit|push> <approval-file>"
  exit 1
fi

if [[ ! -f "$APPROVAL_FILE" ]]; then
  echo "HITL GATE: Approval file not found: $APPROVAL_FILE"
  exit 1
fi

APPROVED=$(python3 -c "import json; d=json.load(open('$APPROVAL_FILE')); print(d.get('approved', False))" 2>/dev/null || echo "False")

if [[ "$APPROVED" == "True" ]]; then
  echo "HITL GATE: $ACTION approved."
  exit 0
else
  echo "HITL GATE: Not approved."
  exit 1
fi