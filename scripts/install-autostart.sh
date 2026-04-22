#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LABEL="com.web25.console"
LAUNCH_AGENTS_DIR="${HOME}/Library/LaunchAgents"
PLIST_PATH="${LAUNCH_AGENTS_DIR}/${LABEL}.plist"
LOG_DIR="${HOME}/Library/Logs/web2.5"
RUN_SCRIPT="${ROOT_DIR}/scripts/backend-run.sh"
USER_ID="$(id -u)"
PRINT_ONLY=0

for arg in "$@"; do
  case "$arg" in
    --print)
      PRINT_ONLY=1
      ;;
    *)
      echo "未知参数: $arg" >&2
      exit 1
      ;;
  esac
done

mkdir -p "${LAUNCH_AGENTS_DIR}" "${LOG_DIR}"

PLIST_CONTENT="$(cat <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${RUN_SCRIPT}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${ROOT_DIR}</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ThrottleInterval</key>
  <integer>5</integer>
  <key>StandardOutPath</key>
  <string>${LOG_DIR}/backend.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/backend.log</string>
</dict>
</plist>
EOF
)"

if [[ "${PRINT_ONLY}" == "1" ]]; then
  printf '%s\n' "${PLIST_CONTENT}"
  exit 0
fi

printf '%s\n' "${PLIST_CONTENT}" > "${PLIST_PATH}"
plutil -lint "${PLIST_PATH}" >/dev/null

launchctl bootout "gui/${USER_ID}" "${PLIST_PATH}" >/dev/null 2>&1 || true
launchctl bootstrap "gui/${USER_ID}" "${PLIST_PATH}"
launchctl kickstart -k "gui/${USER_ID}/${LABEL}" >/dev/null 2>&1 || true

echo "web2.5 已配置为开机自动启动。"
echo "控制台地址：http://127.0.0.1:8787/console/"
