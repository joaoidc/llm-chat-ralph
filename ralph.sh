#!/bin/bash
# Ralph Autonomous Agent Loop
# Usage: bash ralph.sh [--tool aider] [MAX_ITERATIONS]

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

# Garantir que arquivos aider e lixo nunca entrem no repo
cat > .gitignore << 'GITIGNORE'
.aider.chat.history.md
.aider.input.history
.aider*
node_modules/
dist/
build/
vendor/
.env
*.log
GITIGNORE

echo "Starting Ralph - Tool: $TOOL - Max iterations: $MAX_ITERATIONS"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "==============================================================="
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "==============================================================="

  CURRENT_STORY=$(jq -c '.userStories | map(select(.passes == false)) | sort_by(.priority) | .[0]' prd.json)

  if [ "$CURRENT_STORY" == "null" ] || [ -z "$CURRENT_STORY" ]; then
    echo "All user stories completed."
    break
  fi

  STORY_ID=$(echo "$CURRENT_STORY" | jq -r '.id')
  STORY_DESC=$(echo "$CURRENT_STORY" | jq -r '.description')

  echo "Working on story ID: $STORY_ID"
  echo "Description: $STORY_DESC"

  # Coletar apenas arquivos de código reais
  FILES=$(find . -type f \( \
    -name "*.ts" -o \
    -name "*.tsx" -o \
    -name "*.vue" -o \
    -name "*.js" -o \
    -name "*.jsx" -o \
    -name "*.json" \
  \) \
    | grep -v node_modules \
    | grep -v .git \
    | grep -v ".aider" \
    | grep -v dist \
    | grep -v build \
    | grep -v vendor \
    | head -40 \
    | tr '\n' ' ')

  MESSAGE="You are an autonomous developer agent. Implement the following user story by editing the necessary project files. User Story ID: ${STORY_ID}. Description: ${STORY_DESC}. After implementing, update prd.json setting passes=true for story id '${STORY_ID}'. Only modify existing files or create new files inside backend/ or frontend/ folders. Do not output loose text or code outside of file edits."

  echo "Running aider..."
  aider \
    --model ollama/qwen3:14b \
    --edit-format whole \
    --yes-always \
    --no-auto-commits \
    --no-show-model-warnings \
    --message "$MESSAGE" \
    $FILES prd.json 2>&1 || true

  # Remover arquivos lixo que o modelo possa ter criado
  find . -maxdepth 1 -type f \( \
    -name "---" -o \
    -name "}" -o \
    -name "})" -o \
    -name ".~" -o \
    -name "~" \
  \) -delete 2>/dev/null || true

  # Unstage arquivos aider
  git restore --staged .aider.chat.history.md 2>/dev/null || true
  git restore --staged .aider.input.history 2>/dev/null || true

  # Verificar se story foi marcada como completa
  PASSES=$(jq -r --arg id "$STORY_ID" '.userStories | map(select(.id == $id)) | .[0].passes' prd.json)

  if [ "$PASSES" != "true" ]; then
    echo "WARNING: Story $STORY_ID not marked as passes=true. Continuing anyway."
  else
    echo "Story $STORY_ID marked as complete."
  fi

  # Commitar apenas arquivos reais (sem lixo e sem aider)
  CHANGED_FILES=$(git status --porcelain | grep -v '.aider' | grep -v '^?? ---' | grep -v '^?? }' | grep -v '^?? .~' | awk '{print $2}')

  if [ -n "$CHANGED_FILES" ]; then
    echo "Changes detected. Committing..."
    echo "$CHANGED_FILES" | xargs git add
    git commit -m "ralph($STORY_ID): $(echo "$STORY_DESC" | cut -c1-60)"
    git push origin main
  else
    echo "No meaningful code changes detected for iteration $i."
  fi

  echo "Iteration $i complete."
  sleep 2
done

echo ""
echo "Ralph finished execution."
