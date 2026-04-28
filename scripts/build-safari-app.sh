#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DERIVED_DATA_PATH="/tmp/web25-derived"
OUTPUT_DIR="$ROOT_DIR/dist"
APP_PATH="$DERIVED_DATA_PATH/Build/Products/Debug/web2.5.app"
ZIP_PATH="$OUTPUT_DIR/web2.5-safari-debug.zip"

rm -rf "$DERIVED_DATA_PATH"
mkdir -p "$OUTPUT_DIR"

xcodebuild \
  -project "$ROOT_DIR/web2.5/web2.5.xcodeproj" \
  -scheme web2.5 \
  -configuration Debug \
  -derivedDataPath "$DERIVED_DATA_PATH" \
  build

rm -f "$ZIP_PATH"
ditto -c -k --keepParent "$APP_PATH" "$ZIP_PATH"

echo "Built Safari app: $APP_PATH"
echo "Packaged zip: $ZIP_PATH"
