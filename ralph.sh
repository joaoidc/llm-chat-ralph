#!/bin/bash
# Ralph Autonomous Loop with Aider + Auto Commit
# Usage: bash ralph.sh --tool aider 20

set -e

TOOL="aider"
MAX_ITERATIONS=10

while [[ $# -gt 0 ]]; do
  case $1 in
    --tool)
      TOOL="$2"
      shift 2
      ;;
    *)
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        MAX_ITERATIONS="$1"
      fi
      shift
      ;;
  esac
done

if [[ "$TOOL" != "aider" ]]; then
  echo "This version only supports --tool aider"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting Ralph - Tool: $TOOL - Max iterations: $MAX_ITERATIONS"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "==============================================================="
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "==============================================================="

  # Run Aider against entire repo
  OUTPUT=$(aider \
    --model ollama/qwen3:14b \
    --yes-always \
    --no-show-model-warnings \
    --message "$(cat prd.json)" \
    . 2>&1) || true

  # Check for completion signal
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo "All tasks complete."
    break
  fi

  # Remove aider internal files from git tracking if present
  git restore --staged .aider.chat.history.md 2>/dev/null || true
  git restore --staged .aider.input.history 2>/dev/null || true

  # Auto commit only if real changes exist
  if [ -n "$(git status --porcelain | grep -v '.aider')" ]; then
    echo "Changes detected. Auto committing..."
    git add .
    git commit -m "ralph: iteration $i auto-commit"
    git push origin main
  else
    echo "No meaningful code changes detected."
  fi

  echo "Iteration $i complete."
  sleep 2
done

echo ""
echo "Ralph finished execution."
