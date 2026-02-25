
#!/bin/bash
# Ralph Wiggum - Long-running AI agent loop with auto-commit
# Usage: bash ralph.sh [--tool amp|claude|aider] [max_iterations]

set -e

# -------------------------
# Argument parsing
# -------------------------

TOOL="amp"
MAX_ITERATIONS=10

while [[ $# -gt 0 ]]; do
  case $1 in
    --tool)
      TOOL="$2"
      shift 2
      ;;
    --tool=*)
      TOOL="${1#*=}"
      shift
      ;;
    *)
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        MAX_ITERATIONS="$1"
      fi
      shift
      ;;
  esac
done

# -------------------------
# Validate tool
# -------------------------

if [[ "$TOOL" != "amp" && "$TOOL" != "claude" && "$TOOL" != "aider" ]]; then
  echo "Error: Invalid tool '$TOOL'. Must be 'amp', 'claude', or 'aider'."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"

# -------------------------
# Initialize progress file
# -------------------------

if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

echo "Starting Ralph - Tool: $TOOL - Max iterations: $MAX_ITERATIONS"

# -------------------------
# Main Loop
# -------------------------

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "==============================================================="
  echo "  Ralph Iteration $i of $MAX_ITERATIONS ($TOOL)"
  echo "==============================================================="

  # -------------------------
  # Run selected tool
  # -------------------------

  if [[ "$TOOL" == "amp" ]]; then
    OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" | amp --dangerously-allow-all 2>&1 | tee /dev/stderr) || true

  elif [[ "$TOOL" == "claude" ]]; then
    OUTPUT=$(claude --dangerously-skip-permissions --print < "$SCRIPT_DIR/CLAUDE.md" 2>&1 | tee /dev/stderr) || true

  elif [[ "$TOOL" == "aider" ]]; then
    PROMPT_CONTENT=$(cat "$SCRIPT_DIR/prompt.md")
    OUTPUT=$(aider \
      --model ollama/qwen3:14b \
      --yes-always \
      --no-git \
      --no-show-model-warnings \
      --no-browser \
      --file "$PRD_FILE" \
      --message "$PROMPT_CONTENT" 2>&1) || true
  fi

  # -------------------------
  # Check completion signal
  # -------------------------

  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "Ralph completed all tasks!"
    echo "Completed at iteration $i of $MAX_ITERATIONS"
    break
  fi

  # -------------------------
  # Auto Commit Logic
  # -------------------------

  if [ -n "$(git status --porcelain)" ]; then
    echo "Changes detected. Auto committing..."

    git add .

    git commit -m "ralph: iteration $i auto-commit" || true

    git push origin main || echo "Warning: git push failed."

  else
    echo "No changes detected. Skipping commit."
  fi

  echo "Iteration $i complete."
  sleep 2
done

echo ""
echo "Ralph finished execution."
