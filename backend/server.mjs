import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, existsSync, createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const SITE_DIR = path.join(ROOT_DIR, "site");
const DATA_DIR = path.join(ROOT_DIR, "backend", "data");
const DB_PATH = path.join(DATA_DIR, "web25.sqlite");
const PORT = Number(process.env.PORT || 8787);
const SERVER_STARTED_AT = new Date().toISOString();
const LAUNCH_AGENT_LABEL = "com.web25.console";
const LAUNCH_AGENT_PATH = path.join(os.homedir(), "Library", "LaunchAgents", `${LAUNCH_AGENT_LABEL}.plist`);
const CONSOLE_URL = `http://127.0.0.1:${PORT}/console/`;
const TRANSPARENT_GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", "base64");

mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS moderation_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_key TEXT NOT NULL,
    device_id TEXT,
    event_type TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'extension',
    thread_url TEXT,
    thread_status_id TEXT,
    reply_status_id TEXT,
    reply_handle TEXT,
    reply_display_name TEXT,
    reply_text TEXT,
    normalized_text TEXT,
    compact_text TEXT,
    account_protected INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_events_sync_key_created_at
  ON moderation_events(sync_key, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_events_sync_key_event_type
  ON moderation_events(sync_key, event_type);
`);

const eventColumns = db.prepare("PRAGMA table_info(moderation_events)").all();
if (!eventColumns.some((column) => column && column.name === "account_protected")) {
  db.exec("ALTER TABLE moderation_events ADD COLUMN account_protected INTEGER NOT NULL DEFAULT 0;");
}

const insertEvent = db.prepare(`
  INSERT INTO moderation_events (
    sync_key,
    device_id,
    event_type,
    source,
    thread_url,
    thread_status_id,
    reply_status_id,
    reply_handle,
    reply_display_name,
    reply_text,
    normalized_text,
    compact_text,
    account_protected,
    created_at
  ) VALUES (
    @syncKey,
    @deviceId,
    @eventType,
    @source,
    @threadUrl,
    @threadStatusId,
    @replyStatusId,
    @replyHandle,
    @replyDisplayName,
    @replyText,
    @normalizedText,
    @compactText,
    @accountProtected,
    @createdAt
  )
`);

const statsStatement = db.prepare(`
  SELECT
    SUM(CASE WHEN event_type IN ('ad_home_hide', 'ad_hide') THEN 1 ELSE 0 END) AS ad_home_hide_events,
    SUM(CASE WHEN event_type = 'ad_reply_hide' THEN 1 ELSE 0 END) AS ad_reply_hide_events,
    SUM(CASE WHEN event_type = 'auto_hide' THEN 1 ELSE 0 END) AS auto_hide_events,
    SUM(CASE WHEN event_type = 'manual_hide' THEN 1 ELSE 0 END) AS manual_hide_events,
    SUM(CASE WHEN event_type = 'manual_allow' THEN 1 ELSE 0 END) AS manual_allow_events,
    COUNT(DISTINCT CASE
      WHEN event_type IN ('manual_hide', 'auto_hide') AND COALESCE(reply_handle, '') != '' THEN reply_handle
      ELSE NULL
    END) AS distinct_hidden_handles,
    COUNT(DISTINCT CASE
      WHEN event_type IN ('manual_hide', 'auto_hide') AND COALESCE(normalized_text, '') != '' THEN normalized_text
      ELSE NULL
    END) AS distinct_hidden_phrases
  FROM moderation_events
  WHERE sync_key = ?
`);

const topPhraseStatement = db.prepare(`
  SELECT
    CASE
      WHEN TRIM(COALESCE(normalized_text, '')) != '' THEN normalized_text
      ELSE TRIM(COALESCE(reply_text, ''))
    END AS label,
    COUNT(*) AS count
  FROM moderation_events
  WHERE
    sync_key = ?
    AND event_type IN ('manual_hide', 'auto_hide')
    AND TRIM(COALESCE(normalized_text, reply_text, '')) != ''
  GROUP BY label
  ORDER BY count DESC, MAX(id) DESC
  LIMIT 12
`);

const autoHideExistsStatement = db.prepare(`
  SELECT id
  FROM moderation_events
  WHERE
    sync_key = @syncKey
    AND event_type = 'auto_hide'
    AND (
      (@replyStatusId != '' AND reply_status_id = @replyStatusId)
      OR (
        @replyStatusId = ''
        AND @threadStatusId != ''
        AND thread_status_id = @threadStatusId
        AND COALESCE(normalized_text, '') = @normalizedText
        AND COALESCE(reply_handle, '') = @replyHandle
      )
    )
  LIMIT 1
`);

const adEventExistsStatement = db.prepare(`
  SELECT id
  FROM moderation_events
  WHERE
    sync_key = @syncKey
    AND event_type = @eventType
    AND (
      (@replyStatusId != '' AND reply_status_id = @replyStatusId)
      OR (
        @replyStatusId = ''
        AND @threadStatusId != ''
        AND thread_status_id = @threadStatusId
      )
      OR (
        @replyStatusId = ''
        AND
        @threadStatusId = ''
        AND COALESCE(normalized_text, '') = @normalizedText
        AND COALESCE(reply_handle, '') = @replyHandle
      )
    )
  LIMIT 1
`);

const recentEventsStatement = db.prepare(`
  SELECT
    id,
    event_type,
    account_protected,
    thread_status_id,
    reply_status_id,
    reply_text,
    normalized_text,
    compact_text,
    reply_handle,
    reply_display_name,
    created_at,
    thread_url
  FROM moderation_events
  WHERE
    sync_key = ?
    AND event_type IN ('auto_hide', 'manual_hide', 'manual_allow')
  ORDER BY id DESC
  LIMIT 20
`);

const allEventsStatement = db.prepare(`
  SELECT
    id,
    event_type,
    source,
    account_protected,
    thread_url,
    thread_status_id,
    reply_status_id,
    reply_handle,
    reply_display_name,
    reply_text,
    normalized_text,
    compact_text,
    created_at
  FROM moderation_events
  WHERE sync_key = ?
  ORDER BY id ASC
`);

const SIMILARITY_TERMS = [
  "线下",
  "附近",
  "离得近",
  "同城",
  "哥哥",
  "弟弟",
  "帅弟",
  "帅哥",
  "主人",
  "领我",
  "养我",
  "真人",
  "找下",
  "找我",
  "私聊",
  "私我",
  "来找",
  "带走",
  "见面",
  "约",
  "上门",
  "想要",
  "小狗",
  "汪汪",
  "搭子",
  "固定搭子",
  "单男",
  "破处",
  "看上我",
  "联系方式",
  "在线等你",
  "取精",
  "固炮",
  "骚"
];

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, statusCode, payload) {
  setCorsHeaders(response);
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body)
  });
  response.end(body);
}

function sendText(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body)
  });
  response.end(body);
}

function sendGif(response, statusCode = 200) {
  response.writeHead(statusCode, {
    "Content-Type": "image/gif",
    "Cache-Control": "no-store",
    "Content-Length": TRANSPARENT_GIF.length
  });
  response.end(TRANSPARENT_GIF);
}

function buildHealthPayload() {
  return {
    ok: true,
    service: "web2.5-backend",
    database: DB_PATH,
    port: PORT,
    consoleUrl: CONSOLE_URL,
    pid: process.pid,
    startedAt: SERVER_STARTED_AT,
    autostartConfigured: existsSync(LAUNCH_AGENT_PATH),
    autostartLabel: LAUNCH_AGENT_LABEL,
    autostartPath: LAUNCH_AGENT_PATH
  };
}

function normalizeBasePath(urlPathname) {
  if (!urlPathname || urlPathname === "/") {
    return "/index.html";
  }

  if (urlPathname === "/console" || urlPathname === "/console/") {
    return "/console.html";
  }

  if (urlPathname === "/app" || urlPathname === "/app/") {
    return "/console.html";
  }

  return urlPathname;
}

function getContentType(filePath) {
  if (filePath.endsWith(".html")) {
    return "text/html; charset=utf-8";
  }
  if (filePath.endsWith(".css")) {
    return "text/css; charset=utf-8";
  }
  if (filePath.endsWith(".js")) {
    return "application/javascript; charset=utf-8";
  }
  if (filePath.endsWith(".json")) {
    return "application/json; charset=utf-8";
  }
  if (filePath.endsWith(".png")) {
    return "image/png";
  }
  if (filePath.endsWith(".svg")) {
    return "image/svg+xml";
  }

  return "application/octet-stream";
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";

    request.on("data", (chunk) => {
      raw += chunk.toString("utf8");
      if (raw.length > 2_000_000) {
        reject(new Error("payload-too-large"));
        request.destroy();
      }
    });

    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("invalid-json"));
      }
    });

    request.on("error", reject);
  });
}

function parseSyncKey(searchParams) {
  const syncKey = String(searchParams.get("syncKey") || "").trim();
  return syncKey;
}

async function serveStatic(response, urlPathname) {
  const normalized = normalizeBasePath(urlPathname);
  const filePath = path.resolve(SITE_DIR, `.${normalized}`);

  if (!filePath.startsWith(SITE_DIR)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  if (!existsSync(filePath)) {
    sendText(response, 404, "Not found");
    return;
  }

  const fileStat = await stat(filePath);
  response.writeHead(200, {
    "Content-Type": getContentType(filePath),
    "Content-Length": fileStat.size
  });
  createReadStream(filePath).pipe(response);
}

function buildDashboard(syncKey) {
  const statsRow = statsStatement.get(syncKey) || {};
  const topPhrases = topPhraseStatement.all(syncKey).map((row) => ({
    label: row.label,
    count: row.count
  }));
  const recent = recentEventsStatement.all(syncKey).map((row) => ({
    id: row.id,
    eventType: row.event_type,
    threadStatusId: row.thread_status_id,
    replyStatusId: row.reply_status_id,
    replyText: row.reply_text,
    normalizedText: row.normalized_text,
    compactText: row.compact_text,
    replyHandle: row.reply_handle,
    replyDisplayName: row.reply_display_name,
    createdAt: row.created_at,
    threadUrl: row.thread_url
  }));
  const derivedState = buildDerivedState(syncKey);

  return {
    stats: {
      activeHiddenCount: derivedState.activeHiddenItems.length,
      activeAutoHidden: Number(derivedState.activeCounts.auto || 0),
      activeManualHidden: Number(derivedState.activeCounts.manual || 0),
      adHomeHideEvents: Number(statsRow.ad_home_hide_events || 0),
      adReplyHideEvents: Number(statsRow.ad_reply_hide_events || 0),
      autoHideEvents: Number(statsRow.auto_hide_events || 0),
      manualHideEvents: Number(statsRow.manual_hide_events || 0),
      manualAllowEvents: Number(statsRow.manual_allow_events || 0),
      distinctHiddenHandles: Number(statsRow.distinct_hidden_handles || 0),
      distinctHiddenPhrases: Number(statsRow.distinct_hidden_phrases || 0)
    },
    topPhrases,
    recent,
    activeHiddenItems: derivedState.activeHiddenItems,
    manualHideKeys: derivedState.manualHideKeys,
    manualAllowKeys: derivedState.manualAllowKeys
  };
}

function matchesActiveItemForAllow(activeItem, keys) {
  if (!activeItem || !keys) {
    return false;
  }

  if (keys.statusKey && activeItem.statusKey === keys.statusKey) {
    return true;
  }

  if (keys.textKey && activeItem.textKey === keys.textKey) {
    return true;
  }

  if (keys.compactKey && activeItem.compactKey === keys.compactKey) {
    return true;
  }

  if (keys.patternKey && activeItem.patternKey === keys.patternKey) {
    return true;
  }

  if (keys.primaryKey && !String(keys.primaryKey).startsWith("account:") && activeItem.primaryKey === keys.primaryKey) {
    return true;
  }

  return false;
}

function buildRowKeys(row) {
  const normalized = String(row.normalized_text || "").trim();
  const compact = String(row.compact_text || "").trim();
  const protectedAccount = Number(row.account_protected || 0) === 1;
  const statusKey = String(row.reply_status_id || "").trim()
    ? "status:" + String(row.reply_status_id || "").trim()
    : "";
  const accountKey = protectedAccount ? "" : (String(row.reply_handle || "").trim()
    ? "account:" + String(row.reply_handle || "").trim().toLowerCase()
    : "");
  const textKey = protectedAccount ? "" : (normalized ? "text:" + normalized : "");
  const compactKey = protectedAccount ? "" : (compact ? "compact:" + compact : "");
  const matchedTerms = protectedAccount
    ? []
    : Array.from(new Set(SIMILARITY_TERMS.filter((term) => normalized.includes(term))));
  const loosePattern = protectedAccount
    ? ""
    : normalized
      .replace(/[^\p{L}\p{N}]+/gu, "")
      .replace(/(有没有|有没|有|没|吗|嘛|呀|啊|呢|哦|啦|哈|个|一个|一下|急需|急找|急|求|蹲|快来|来|谁来|谁|一位|位|的|了|我|你|他|她|它)/g, "");
  const patternKey = protectedAccount
    ? ""
    : (matchedTerms.length > 0
      ? "pattern:" + matchedTerms.join("|")
      : (loosePattern.length >= 4 ? "pattern:" + loosePattern : ""));
  const primaryKey = protectedAccount
    ? (statusKey || "")
    : (statusKey || accountKey || textKey || compactKey || patternKey || normalized);
  const itemKey = statusKey || textKey || compactKey || accountKey || ("event:" + row.id);

  return {
    normalized,
    compact,
    statusKey,
    accountKey,
    textKey,
    compactKey,
    patternKey,
    primaryKey,
    itemKey
  };
}

function addDecisionKeys(set, keys) {
  if (!set || !keys) {
    return;
  }

  if (keys.primaryKey) {
    set.add(keys.primaryKey);
  }

  if (keys.statusKey) {
    set.add(keys.statusKey);
  }

  if (keys.accountKey) {
    set.add(keys.accountKey);
  }

  if (keys.textKey) {
    set.add(keys.textKey);
  }

  if (keys.compactKey) {
    set.add(keys.compactKey);
  }

  if (keys.patternKey) {
    set.add(keys.patternKey);
  }
}

function removeDecisionKeys(set, keys) {
  if (!set || !keys) {
    return;
  }

  if (keys.primaryKey) {
    set.delete(keys.primaryKey);
  }

  if (keys.statusKey) {
    set.delete(keys.statusKey);
  }

  if (keys.accountKey) {
    set.delete(keys.accountKey);
  }

  if (keys.textKey) {
    set.delete(keys.textKey);
  }

  if (keys.compactKey) {
    set.delete(keys.compactKey);
  }

  if (keys.patternKey) {
    set.delete(keys.patternKey);
  }

  if (keys.normalized) {
    set.delete(keys.normalized);
  }
}

function addAllowDecisionKeys(set, keys) {
  if (!set || !keys) {
    return;
  }

  if (keys.statusKey) {
    set.add(keys.statusKey);
    return;
  }

  if (keys.primaryKey) {
    set.add(keys.primaryKey);
    return;
  }

  if (keys.textKey) {
    set.add(keys.textKey);
  }
}

function removeHideDecisionKeysForAllow(set, keys) {
  if (!set || !keys) {
    return;
  }

  if (keys.statusKey) {
    set.delete(keys.statusKey);
    return;
  }

  if (keys.primaryKey) {
    set.delete(keys.primaryKey);
    return;
  }

  if (keys.textKey) {
    set.delete(keys.textKey);
  }
}

function buildDerivedState(syncKey) {
  const hideKeys = new Set();
  const allowKeys = new Set();
  const activeItems = new Map();
  const rows = allEventsStatement.all(syncKey);

  rows.forEach((row) => {
    const keys = buildRowKeys(row);
    const itemKey = keys.itemKey;

    if (row.event_type === "manual_hide" || row.event_type === "auto_hide") {
      if (row.event_type === "manual_hide") {
        addDecisionKeys(hideKeys, keys);
        removeDecisionKeys(allowKeys, keys);
      }

      activeItems.set(itemKey, {
        id: row.id,
        itemKey,
        threadUrl: row.thread_url,
        threadStatusId: row.thread_status_id,
        replyStatusId: row.reply_status_id,
        replyText: row.reply_text,
        normalizedText: keys.normalized,
        compactText: keys.compact,
        replyHandle: row.reply_handle,
        replyDisplayName: row.reply_display_name,
        accountProtected: Number(row.account_protected || 0) === 1,
        createdAt: row.created_at,
        source: row.event_type,
        primaryKey: keys.primaryKey,
        statusKey: keys.statusKey,
        textKey: keys.textKey,
        compactKey: keys.compactKey,
        patternKey: keys.patternKey
      });
      return;
    }

    if (row.event_type === "manual_allow") {
      addAllowDecisionKeys(allowKeys, keys);
      if (row.source === "dashboard") {
        removeDecisionKeys(hideKeys, keys);
      } else {
        removeHideDecisionKeysForAllow(hideKeys, keys);
      }

      for (const [activeItemKey, activeItem] of activeItems.entries()) {
        if (matchesActiveItemForAllow(activeItem, keys)) {
          activeItems.delete(activeItemKey);
        }
      }
    }
  });

  const activeHiddenItems = Array.from(activeItems.values()).sort((left, right) => right.id - left.id);
  const activeCounts = activeHiddenItems.reduce((result, item) => {
    if (item.source === "auto_hide") {
      result.auto += 1;
    } else {
      result.manual += 1;
    }
    return result;
  }, { auto: 0, manual: 0 });

  return {
    manualHideKeys: Array.from(hideKeys),
    manualAllowKeys: Array.from(allowKeys),
    activeHiddenItems,
    activeCounts
  };
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);

    if (request.method === "OPTIONS") {
      setCorsHeaders(response);
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/health") {
      sendJson(response, 200, buildHealthPayload());
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/dashboard") {
      const syncKey = parseSyncKey(requestUrl.searchParams);

      if (!syncKey) {
        sendJson(response, 400, {
          ok: false,
          error: "missing-sync-key"
        });
        return;
      }

      sendJson(response, 200, {
        ok: true,
        syncKey,
        ...buildDashboard(syncKey)
      });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/ad-hide.gif") {
      const syncKey = parseSyncKey(requestUrl.searchParams);

      if (!syncKey) {
        sendText(response, 400, "missing-sync-key");
        return;
      }

      const eventRow = {
        syncKey,
        deviceId: String(requestUrl.searchParams.get("deviceId") || "").trim(),
        eventType: String(requestUrl.searchParams.get("eventType") || "").trim() === "ad_reply_hide"
          ? "ad_reply_hide"
          : "ad_home_hide",
        source: String(requestUrl.searchParams.get("source") || "extension").trim(),
        threadUrl: String(requestUrl.searchParams.get("threadUrl") || "").trim(),
        threadStatusId: String(requestUrl.searchParams.get("threadStatusId") || "").trim(),
        replyStatusId: String(requestUrl.searchParams.get("replyStatusId") || "").trim(),
        replyHandle: String(requestUrl.searchParams.get("replyHandle") || "").trim(),
        replyDisplayName: String(requestUrl.searchParams.get("replyDisplayName") || "").trim(),
        replyText: String(requestUrl.searchParams.get("replyText") || "").trim(),
        normalizedText: String(requestUrl.searchParams.get("normalizedText") || "").trim(),
        compactText: "",
        accountProtected: 0,
        createdAt: new Date().toISOString()
      };

      const existing = adEventExistsStatement.get({
        syncKey: eventRow.syncKey,
        eventType: eventRow.eventType,
        replyStatusId: eventRow.replyStatusId,
        threadStatusId: eventRow.threadStatusId,
        normalizedText: eventRow.normalizedText,
        replyHandle: eventRow.replyHandle
      });

      if (!existing) {
        insertEvent.run(eventRow);
      }

      sendGif(response, 200);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/state") {
      const syncKey = parseSyncKey(requestUrl.searchParams);

      if (!syncKey) {
        sendJson(response, 400, {
          ok: false,
          error: "missing-sync-key"
        });
        return;
      }

      const derivedState = buildDerivedState(syncKey);
      sendJson(response, 200, {
        ok: true,
        syncKey,
        manualHideKeys: derivedState.manualHideKeys,
        manualAllowKeys: derivedState.manualAllowKeys
      });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/events") {
      const payload = await readBody(request);
      const syncKey = String(payload.syncKey || "").trim();
      const eventType = String(payload.eventType || "").trim();

      if (!syncKey || !eventType) {
        sendJson(response, 400, {
          ok: false,
          error: "missing-required-fields"
        });
        return;
      }

      if (!["manual_hide", "manual_allow", "auto_hide", "ad_hide", "ad_home_hide", "ad_reply_hide"].includes(eventType)) {
        sendJson(response, 400, {
          ok: false,
          error: "unsupported-event-type"
        });
        return;
      }

      const eventRow = {
        syncKey,
        deviceId: String(payload.deviceId || "").trim(),
        eventType: eventType === "ad_hide" ? "ad_home_hide" : eventType,
        source: String(payload.source || "extension").trim(),
        threadUrl: String(payload.threadUrl || "").trim(),
        threadStatusId: String(payload.threadStatusId || "").trim(),
        replyStatusId: String(payload.replyStatusId || "").trim(),
        replyHandle: String(payload.replyHandle || "").trim(),
        replyDisplayName: String(payload.replyDisplayName || "").trim(),
        replyText: String(payload.replyText || "").trim(),
        normalizedText: String(payload.normalizedText || "").trim(),
        compactText: String(payload.compactText || "").trim(),
        accountProtected: Number(payload.accountProtected || 0) ? 1 : 0,
        createdAt: new Date().toISOString()
      };

      if (eventType === "auto_hide") {
        const existing = autoHideExistsStatement.get({
          syncKey: eventRow.syncKey,
          replyStatusId: eventRow.replyStatusId,
          threadStatusId: eventRow.threadStatusId,
          normalizedText: eventRow.normalizedText,
          replyHandle: eventRow.replyHandle
        });

        if (existing) {
          sendJson(response, 200, {
            ok: true,
            deduped: true
          });
          return;
        }
      }

      if (eventRow.eventType === "ad_home_hide" || eventRow.eventType === "ad_reply_hide") {
        const existing = adEventExistsStatement.get({
          syncKey: eventRow.syncKey,
          eventType: eventRow.eventType,
          replyStatusId: eventRow.replyStatusId,
          threadStatusId: eventRow.threadStatusId,
          normalizedText: eventRow.normalizedText,
          replyHandle: eventRow.replyHandle
        });

        if (existing) {
          sendJson(response, 200, {
            ok: true,
            deduped: true
          });
          return;
        }
      }

      insertEvent.run(eventRow);

      sendJson(response, 200, {
        ok: true
      });
      return;
    }

    if (request.method === "GET") {
      await serveStatic(response, requestUrl.pathname);
      return;
    }

    sendText(response, 404, "Not found");
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    sendJson(response, 500, {
      ok: false,
      error: message
    });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`web2.5 backend listening on http://127.0.0.1:${PORT}`);
});
