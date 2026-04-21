#!/usr/bin/env bash
# Installs the repo's git hooks by symlinking them into .git/hooks.
# Idempotent — re-run after a fresh clone or when new hooks are added.

set -e

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

hooks_src="scripts/hooks"
hooks_dst=".git/hooks"

if [ ! -d "$hooks_dst" ]; then
  echo "install-hooks: $hooks_dst not found — is this a git repo?" >&2
  exit 1
fi

for hook in "$hooks_src"/*; do
  name="$(basename "$hook")"
  target="$hooks_dst/$name"
  chmod +x "$hook"
  ln -sf "../../$hook" "$target"
  echo "installed: $target → $hook"
done
