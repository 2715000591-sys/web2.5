#!/usr/bin/env bash

set -euo pipefail

PORT="${WEB25_PORT:-8787}"
BASE_URL="http://127.0.0.1:${PORT}"
CONSOLE_URL="${BASE_URL}/console/"
HEALTH_URL="${BASE_URL}/api/health"
LABEL="com.web25.console"
PLIST_PATH="${HOME}/Library/LaunchAgents/${LABEL}.plist"
LOG_FILE="${HOME}/Library/Logs/web2.5/backend.log"

if curl --silent --show-error --fail "${HEALTH_URL}" >/dev/null 2>&1; then
  echo "web2.5 后台：已运行"
  echo "控制台地址：${CONSOLE_URL}"
else
  echo "web2.5 后台：未运行"
  echo "控制台地址：${CONSOLE_URL}"
fi

if [[ -f "${PLIST_PATH}" ]]; then
  echo "开机自动启动：已配置"
else
  echo "开机自动启动：未配置"
fi

if [[ -f "${LOG_FILE}" ]]; then
  echo "后台日志：${LOG_FILE}"
fi
