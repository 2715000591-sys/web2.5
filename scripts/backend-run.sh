#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

find_node_bin() {
  if [[ -n "${NODE_BIN:-}" ]] && [[ -x "${NODE_BIN}" ]]; then
    printf '%s\n' "${NODE_BIN}"
    return 0
  fi

  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi

  for candidate in /usr/local/bin/node /opt/homebrew/bin/node /usr/bin/node; do
    if [[ -x "${candidate}" ]]; then
      printf '%s\n' "${candidate}"
      return 0
    fi
  done

  return 1
}

NODE_PATH="$(find_node_bin || true)"

if [[ -z "${NODE_PATH}" ]]; then
  echo "web2.5 没找到 Node.js，后台没法启动。" >&2
  exit 1
fi

cd "${ROOT_DIR}"
exec "${NODE_PATH}" "${ROOT_DIR}/backend/server.mjs"
