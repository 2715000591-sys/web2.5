#!/usr/bin/env bash

set -euo pipefail

LABEL="com.web25.console"
PLIST_PATH="${HOME}/Library/LaunchAgents/${LABEL}.plist"
USER_ID="$(id -u)"

launchctl bootout "gui/${USER_ID}" "${PLIST_PATH}" >/dev/null 2>&1 || true
rm -f "${PLIST_PATH}"

echo "web2.5 的开机自动启动已经移除。"
