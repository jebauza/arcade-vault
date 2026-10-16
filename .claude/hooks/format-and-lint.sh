#!/usr/bin/env bash
# PostToolUse hook: strip whitespace, then run Prettier and ESLint on files written or edited by Claude.
set -u

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
file="$(jq -r '.tool_input.file_path // empty')"

[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0
case "$file" in
  "$project_dir"/*) ;;
  *) exit 0 ;;
esac

cd "$project_dir" || exit 0

# Prettier removes trailing whitespace and collapses blank lines for the files it supports.
npx --no-install prettier --write --ignore-unknown "$file" >/dev/null 2>&1

# Fallback for files Prettier does not parse (e.g. .sh): strip trailing whitespace,
# leading/trailing blank lines and runs of consecutive blank lines.
parser="$(npx --no-install prettier --file-info "$file" 2>/dev/null | jq -r '.inferredParser // empty')"
if [ -z "$parser" ]; then
  sed -i -e 's/[[:space:]]\+$//' "$file"
  sed -i -e '/./,$!d' "$file"
  sed -i -e :a -e '/^\n*$/{$d;N;ba' -e '}' "$file"
  cat -s "$file" >"$file.tmp" && mv "$file.tmp" "$file"
fi

case "$file" in
  *.js|*.jsx|*.ts|*.tsx|*.mjs|*.cjs)
    if ! output="$(npx --no-install eslint --fix --no-warn-ignored "$file" 2>&1)"; then
      echo "$output" >&2
      exit 2
    fi
    ;;
esac

exit 0
