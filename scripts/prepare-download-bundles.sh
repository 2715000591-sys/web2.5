#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOWNLOAD_DIR="$ROOT_DIR/site/downloads"
DIST_DIR="$ROOT_DIR/dist"
SAFARI_APP_PATH="/tmp/web25-derived/Build/Products/Debug/web2.5.app"
SAFARI_ZIP_SOURCE="$DIST_DIR/web2.5-safari-debug.zip"
TMP_DIR="$(mktemp -d /tmp/colorful-toilet-downloads.XXXXXX)"

cleanup() {
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

mkdir -p "$DOWNLOAD_DIR" "$DIST_DIR"

bash "$ROOT_DIR/scripts/build-safari-app.sh"

MANIFEST_VERSION="$(node --input-type=module -e "import fs from 'fs'; const manifest = JSON.parse(fs.readFileSync('$ROOT_DIR/extension/manifest.json', 'utf8')); process.stdout.write(String(manifest.version || '0.0.0'));" )"
BUILD_ID="$(node --input-type=module -e "import fs from 'fs'; const source = fs.readFileSync('$ROOT_DIR/extension/content/content.js', 'utf8'); const match = source.match(/const BUILD_ID = \\\"([^\\\"]+)\\\"/); process.stdout.write(match ? match[1] : 'unknown');" )"
GENERATED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

cp "$SAFARI_ZIP_SOURCE" "$DOWNLOAD_DIR/colorful-toilet-safari.zip"

SAFARI_STAGE_DIR="$TMP_DIR/Colorful Toilet for Safari"
mkdir -p "$SAFARI_STAGE_DIR"
cp -R "$SAFARI_APP_PATH" "$SAFARI_STAGE_DIR/Colorful Toilet.app"
ln -s /Applications "$SAFARI_STAGE_DIR/Applications"
cat > "$SAFARI_STAGE_DIR/打开前先看.txt" <<'EOF'
Colorful Toilet 安装说明

1. 把 Colorful Toilet.app 拖到 Applications。
2. 打开 Colorful Toilet.app。
3. 打开 Safari -> 设置 -> 扩展，开启 Colorful Toilet。
4. 打开 x.com，用自己的邮箱登录控制台。

如果 macOS 拦一下，右键点 app，再点“打开”。
EOF

rm -f "$DOWNLOAD_DIR/colorful-toilet-safari.dmg"
hdiutil create \
  -quiet \
  -volname "Colorful Toilet for Safari" \
  -srcfolder "$SAFARI_STAGE_DIR" \
  -ov \
  -format UDZO \
  "$DOWNLOAD_DIR/colorful-toilet-safari.dmg"

CHROMIUM_STAGE_DIR="$TMP_DIR/Colorful Toilet Chrome-Edge Extension"
mkdir -p "$CHROMIUM_STAGE_DIR"
cp -R "$ROOT_DIR/extension/." "$CHROMIUM_STAGE_DIR/"
cat > "$CHROMIUM_STAGE_DIR/安装说明.txt" <<'EOF'
Colorful Toilet 安装说明

Chrome:
1. 解压这个包。
2. 打开 chrome://extensions/
3. 打开“开发者模式”。
4. 点“加载已解压的扩展程序”。
5. 选择解压出来的插件文件夹。

Edge:
1. 解压这个包。
2. 打开 edge://extensions/
3. 打开“开发人员模式”。
4. 点“加载解压缩的扩展”。
5. 选择解压出来的插件文件夹。

最后打开 x.com，用自己的邮箱登录控制台。
EOF

rm -f "$DOWNLOAD_DIR/colorful-toilet-chrome-edge.zip"
ditto -c -k --keepParent "$CHROMIUM_STAGE_DIR" "$DOWNLOAD_DIR/colorful-toilet-chrome-edge.zip"

SAFARI_DMG_SIZE="$(stat -f%z "$DOWNLOAD_DIR/colorful-toilet-safari.dmg")"
SAFARI_ZIP_SIZE="$(stat -f%z "$DOWNLOAD_DIR/colorful-toilet-safari.zip")"
CHROMIUM_ZIP_SIZE="$(stat -f%z "$DOWNLOAD_DIR/colorful-toilet-chrome-edge.zip")"

cat > "$DOWNLOAD_DIR/latest.json" <<EOF
{
  "generatedAt": "$GENERATED_AT",
  "extensionVersion": "$MANIFEST_VERSION",
  "buildId": "$BUILD_ID",
  "downloads": {
    "safari": {
      "href": "/downloads/colorful-toilet-safari.dmg",
      "fallbackHref": "/downloads/colorful-toilet-safari.zip",
      "sizeBytes": $SAFARI_DMG_SIZE
    },
    "chromeEdge": {
      "href": "/downloads/colorful-toilet-chrome-edge.zip",
      "sizeBytes": $CHROMIUM_ZIP_SIZE
    },
    "safariZip": {
      "href": "/downloads/colorful-toilet-safari.zip",
      "sizeBytes": $SAFARI_ZIP_SIZE
    }
  }
}
EOF

INSTALLED_APP_PATH="/Applications/web2.5.app"
LSREGISTER="/System/Library/Frameworks/CoreServices.framework/Versions/Current/Frameworks/LaunchServices.framework/Versions/Current/Support/lsregister"
if [[ -d "$INSTALLED_APP_PATH" ]]; then
  "$LSREGISTER" -f -R -trusted "$INSTALLED_APP_PATH" >/dev/null 2>&1 || true
  pluginkit -e use -i com.yourCompany.web25.extension >/dev/null 2>&1 || true
fi

echo "Prepared download bundles in $DOWNLOAD_DIR"
