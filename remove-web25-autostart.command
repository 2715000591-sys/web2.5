#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
/bin/bash "${ROOT_DIR}/scripts/uninstall-autostart.sh"
