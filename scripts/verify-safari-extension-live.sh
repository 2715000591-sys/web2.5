#!/usr/bin/env bash
set -euo pipefail

APP_PATH="${WEB25_APP_PATH:-/Applications/web2.5.app}"
CONTENT_DIR="$APP_PATH/Contents/PlugIns/web2.5 Extension.appex/Contents/Resources/content"
EXPECTED_BUILD="${1:-}"

if [[ -z "$EXPECTED_BUILD" ]]; then
  EXPECTED_BUILD="$(sed -n 's/.*const BUILD_ID = "\([^"]*\)".*/\1/p' extension/content/content.js | head -n 1)"
fi

if [[ -z "$EXPECTED_BUILD" ]]; then
  echo "Could not determine expected BUILD_ID from extension/content/content.js" >&2
  exit 1
fi

if [[ ! -d "$APP_PATH" ]]; then
  echo "Safari app is not installed at $APP_PATH" >&2
  exit 1
fi

if [[ ! -f "$CONTENT_DIR/content.js" ]]; then
  echo "Installed extension content.js was not found at $CONTENT_DIR/content.js" >&2
  exit 1
fi

echo "Expected BUILD_ID: $EXPECTED_BUILD"
codesign --verify --deep --strict --verbose=2 "$APP_PATH"

if ! rg -q "BUILD_ID = \"$EXPECTED_BUILD\"" "$CONTENT_DIR/content.js"; then
  echo "Installed app does not contain expected BUILD_ID=$EXPECTED_BUILD" >&2
  exit 1
fi

open "$APP_PATH"

echo "Reloading open x.com / twitter.com Safari tabs and checking live injection..."
RESULT="$(osascript <<'OSA'
tell application "Safari"
  set foundXTab to false

  repeat with w in windows
    repeat with t in tabs of w
      set u to URL of t
      if u starts with "https://x.com" or u starts with "https://twitter.com" then
        set foundXTab to true
        try
          do JavaScript "location.reload()" in t
        end try
      end if
    end repeat
  end repeat

  if foundXTab then
    delay 6
  end if

  set out to ""
  repeat with w in windows
    repeat with t in tabs of w
      set u to URL of t
      if u starts with "https://x.com" or u starts with "https://twitter.com" then
        try
          set info to do JavaScript "(function(){const visible=function(el){const r=el.getBoundingClientRect();const s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};const root=document.documentElement;const build=root.dataset.web25Build||'NO_WEB25_BUILD';const flushes=Array.from(document.querySelectorAll('.web25-action-hide')).filter(visible).length;const side=Array.from(document.querySelectorAll('.web25-sidebar-close,[data-web25-sidebar-close]')).filter(visible).length;const detail=root.dataset.web25Detail||(location.href.indexOf('/status/')>=0?'1':'0');const sidebarColumn=document.querySelector('[data-testid=sidebarColumn]');const sidebar=sidebarColumn&&sidebarColumn.innerText.trim()?(root.dataset.web25SidebarColumn||'1'):'0';const manual=root.dataset.web25ManualButtons||'0';const marking=root.dataset.web25MarkingEnabled||'0';const articles=root.dataset.web25Articles||'0';const stage=root.dataset.web25Stage||'';return 'build='+build+';detail='+detail+';sidebar='+sidebar+';flushes='+flushes+';sideButtons='+side+';manualButtons='+manual+';marking='+marking+';articles='+articles+';stage='+stage;})()" in t
          set out to out & u & " | " & info & linefeed
        on error errMsg number errNum
          set out to out & u & " | " & "JS_ERROR=" & errNum & ":" & errMsg & linefeed
        end try
      end if
    end repeat
  end repeat

  if out is "" then
    return "NO_X_TABS"
  end if
  return out
end tell
OSA
)"

printf '%s\n' "$RESULT"

if [[ "$RESULT" == "NO_X_TABS" ]]; then
  echo "No open x.com/twitter.com Safari tabs were found; app bundle verification passed, but live page injection was not tested."
  exit 0
fi

if grep -q "JS_ERROR=" <<<"$RESULT"; then
  echo "Safari JavaScript verification failed. Check Safari's Apple Events JavaScript permission." >&2
  exit 1
fi

if grep -q "NO_WEB25_BUILD" <<<"$RESULT"; then
  echo "At least one X/Twitter tab did not load the extension content script." >&2
  exit 1
fi

if ! grep -q "build=$EXPECTED_BUILD" <<<"$RESULT"; then
  echo "No X/Twitter tab reported expected BUILD_ID=$EXPECTED_BUILD." >&2
  exit 1
fi

DETAIL_MARKING_OFF="$(awk '/detail=1/ && /marking=0/ {print}' <<<"$RESULT")"
if [[ -n "$DETAIL_MARKING_OFF" && "${WEB25_ALLOW_MARKING_OFF:-}" != "1" ]]; then
  echo "At least one detail page has the 冲走 button preference off; expected it to be on by default:" >&2
  printf '%s\n' "$DETAIL_MARKING_OFF" >&2
  exit 1
fi

DETAIL_WITHOUT_FLUSH="$(awk '/detail=1/ && /marking=1/ && /flushes=0/ && !/articles=0/ && !/articles=1/ {print}' <<<"$RESULT")"
if [[ -n "$DETAIL_WITHOUT_FLUSH" ]]; then
  echo "At least one detail page has replies but no visible 冲走 buttons:" >&2
  printf '%s\n' "$DETAIL_WITHOUT_FLUSH" >&2
  exit 1
fi

SIDEBAR_WITHOUT_BUTTONS="$(awk '/sidebar=1/ && /sideButtons=0/ {print}' <<<"$RESULT")"
if [[ -n "$SIDEBAR_WITHOUT_BUTTONS" ]]; then
  echo "Sidebar controls were not visible immediately; waiting for X sidebar hydration..."
  sleep 15
  STABILIZED_RESULT="$(osascript <<'OSA'
tell application "Safari"
  set out to ""
  repeat with w in windows
    repeat with t in tabs of w
      set u to URL of t
      if u starts with "https://x.com" or u starts with "https://twitter.com" then
        try
          set info to do JavaScript "(function(){const visible=function(el){const r=el.getBoundingClientRect();const s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};const root=document.documentElement;const build=root.dataset.web25Build||'NO_WEB25_BUILD';const flushes=Array.from(document.querySelectorAll('.web25-action-hide')).filter(visible).length;const side=Array.from(document.querySelectorAll('.web25-sidebar-close,[data-web25-sidebar-close]')).filter(visible).length;const detail=root.dataset.web25Detail||(location.href.indexOf('/status/')>=0?'1':'0');const sidebarColumn=document.querySelector('[data-testid=sidebarColumn]');const sidebar=sidebarColumn&&sidebarColumn.innerText.trim()?(root.dataset.web25SidebarColumn||'1'):'0';const manual=root.dataset.web25ManualButtons||'0';const marking=root.dataset.web25MarkingEnabled||'0';const articles=root.dataset.web25Articles||'0';const stage=root.dataset.web25Stage||'';return 'build='+build+';detail='+detail+';sidebar='+sidebar+';flushes='+flushes+';sideButtons='+side+';manualButtons='+manual+';marking='+marking+';articles='+articles+';stage='+stage;})()" in t
          set out to out & u & " | " & info & linefeed
        on error errMsg number errNum
          set out to out & u & " | " & "JS_ERROR=" & errNum & ":" & errMsg & linefeed
        end try
      end if
    end repeat
  end repeat

  if out is "" then
    return "NO_X_TABS"
  end if
  return out
end tell
OSA
)"
  printf '%s\n' "$STABILIZED_RESULT"
  if [[ "$STABILIZED_RESULT" != "NO_X_TABS" ]] && ! grep -q "JS_ERROR=" <<<"$STABILIZED_RESULT"; then
    RESULT="$STABILIZED_RESULT"
    SIDEBAR_WITHOUT_BUTTONS="$(awk '/sidebar=1/ && /sideButtons=0/ {print}' <<<"$RESULT")"
  fi
fi
if [[ -n "$SIDEBAR_WITHOUT_BUTTONS" ]]; then
  echo "Warning: at least one page has a sidebar but no visible sidebar close buttons yet:" >&2
  printf '%s\n' "$SIDEBAR_WITHOUT_BUTTONS" >&2
fi

echo "Safari extension live verification finished."
