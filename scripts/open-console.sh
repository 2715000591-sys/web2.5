#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${WEB25_PORT:-8787}"
BASE_URL="http://127.0.0.1:${PORT}"
CONSOLE_URL="${BASE_URL}/console/"
HEALTH_URL="${BASE_URL}/api/health"
RUNTIME_DIR="${HOME}/Library/Application Support/web2.5"
LOG_DIR="${HOME}/Library/Logs/web2.5"
PID_FILE="${RUNTIME_DIR}/backend.pid"
LOG_FILE="${LOG_DIR}/backend.log"
NODE_BIN="${NODE_BIN:-$(command -v node || true)}"

mkdir -p "${RUNTIME_DIR}" "${LOG_DIR}"

if [[ -z "${NODE_BIN}" ]]; then
  echo "web2.5 没找到 Node.js，暂时没法启动后台。" >&2
  exit 1
fi

is_backend_up() {
  curl --silent --show-error --fail "${HEALTH_URL}" >/dev/null 2>&1
}

cleanup_stale_pid() {
  if [[ ! -f "${PID_FILE}" ]]; then
    return
  fi

  local pid
  pid="$(cat "${PID_FILE}" 2>/dev/null || true)"
  if [[ -z "${pid}" ]] || ! kill -0 "${pid}" >/dev/null 2>&1; then
    rm -f "${PID_FILE}"
  fi
}

start_backend() {
  cleanup_stale_pid

  if is_backend_up; then
    return
  fi

  echo "正在启动 web2.5 后台..."
  nohup /bin/bash "${ROOT_DIR}/scripts/backend-run.sh" >>"${LOG_FILE}" 2>&1 &
  local pid=$!
  echo "${pid}" >"${PID_FILE}"
  disown "${pid}" >/dev/null 2>&1 || true

  for _ in $(seq 1 20); do
    if is_backend_up; then
      return
    fi
    sleep 0.5
  done

  echo "web2.5 后台启动失败。你可以查看日志：" >&2
  echo "  ${LOG_FILE}" >&2
  exit 1
}

start_backend

echo "正在打开 web2.5 控制台..."
open "${CONSOLE_URL}"
echo "web2.5 控制台已打开：${CONSOLE_URL}"
