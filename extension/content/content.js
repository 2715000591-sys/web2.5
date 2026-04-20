(function () {
  const BUILD_ID = "2026-04-20-1428";
  const MANUAL_RESET_VERSION = "2026-04-19-cleanup2";
  const AUTO_HIDE_ENABLED = true;
  const LIVE_MUTATION_SYNC_ENABLED = false;
  const FAST_SCAN_DELAY_MS = 70;
  const NORMAL_SCAN_DELAY_MS = 180;
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
  const LOCAL_MANUAL_STATE_KEY = "web25-manual-memory-v1";
  const IDB_NAME = "web25-manual-memory";
  const IDB_STORE = "state";
  const IDB_KEY = "manual-state";
  const api = typeof browser !== "undefined" ? browser : chrome;
  const root = document.documentElement;
  const storageDefaults = {
    enabled: true,
    markingEnabled: false,
    backendBaseUrl: "http://127.0.0.1:8787",
    syncKey: "",
    deviceId: "",
    autoHideSyncedKeys: [],
    manualHideTexts: [],
    manualAllowTexts: [],
    manualResetVersion: ""
  };
  const state = {
    enabled: true,
    markingEnabled: false,
    backendBaseUrl: "http://127.0.0.1:8787",
    syncKey: "",
    deviceId: "",
    observer: null,
    scanTimer: null,
    manualRescanTimer: null,
    manualPersistTimer: null,
    stabilizeTimers: [],
    currentUrl: location.href,
    bottomHostEl: null,
    bottomTrayOpen: false,
    summaryEl: null,
    revealedListEl: null,
    revealedListItemsEl: null,
    revealedSignature: "",
    dockEl: null,
    manualHideTexts: new Set(),
    manualAllowTexts: new Set(),
    autoHideSyncedKeys: new Set(),
    remoteSyncInFlight: false,
    lastRemoteSyncAt: 0,
    skipNextStorageSyncScan: false,
    suppressObserver: false
  };

  root.dataset.web25Build = BUILD_ID;
  root.dataset.web25Booted = "1";
  root.dataset.web25Detail = isDetailPage() ? "1" : "0";
  root.dataset.web25Replies = "0";
  root.dataset.web25Articles = "0";
  root.dataset.web25ReplyCells = "0";
  root.dataset.web25ManualButtons = "0";
  root.dataset.web25MarkingEnabled = "0";
  root.dataset.web25SyncReady = "0";
  root.dataset.web25Stage = "boot";
  delete root.dataset.web25Error;

  function ensureAnchorStyleTag() {
    let styleTag = document.getElementById("web25-anchor-style");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "web25-anchor-style";
      styleTag.setAttribute("data-web25-owned", "1");
      (document.head || document.documentElement).appendChild(styleTag);
    }

    styleTag.textContent = [
      'html[data-web25-detail="1"] { overflow-anchor: none !important; }',
      'html[data-web25-detail="1"] body { overflow-anchor: none !important; }',
      'html[data-web25-detail="1"] main { overflow-anchor: none !important; }'
    ].join("\\n");
  }

  ensureAnchorStyleTag();

  function setScrollAnchoringDisabled(disabled) {
    const apply = function (node) {
      if (!node) {
        return;
      }

      const marker = "data-web25-anchor-lock";
      const currentStyle = node.getAttribute("style") || "";
      const cleanedStyle = currentStyle
        .replace(/(?:^|;)\s*overflow-anchor\s*:\s*none\s*!important\s*;?/gi, "")
        .replace(/^\s*;\s*/, "")
        .trim();

      if (disabled) {
        if (node.getAttribute(marker) === "1" && /overflow-anchor\s*:\s*none/i.test(currentStyle)) {
          return;
        }

        const nextStyle = cleanedStyle
          ? cleanedStyle.replace(/;?\s*$/, ";") + " overflow-anchor: none !important;"
          : "overflow-anchor: none !important;";
        node.setAttribute("style", nextStyle);
        node.setAttribute(marker, "1");
      } else {
        if (node.getAttribute(marker) !== "1") {
          return;
        }

        if (cleanedStyle) {
          node.setAttribute("style", cleanedStyle);
        } else {
          node.removeAttribute("style");
        }
        node.removeAttribute(marker);
      }
    };

    apply(root);
    if (document.body) {
      apply(document.body);
    }
    const main = document.querySelector("main");
    if (main) {
      apply(main);
    }
  }

  if (isDetailPage()) {
    setScrollAnchoringDisabled(true);
  }

  function buildSummaryText(autoCount, historyCount, manualCount) {
    const parts = [];

    if (autoCount > 0) {
      parts.push("web2.5 自动下沉 " + autoCount + " 条");
    }

    if (historyCount > 0) {
      parts.push("命中历史标记 " + historyCount + " 条");
    }

    if (manualCount > 0) {
      parts.push("你刚标记下沉 " + manualCount + " 条");
    }

    if (parts.length === 0) {
      parts.push("当前没有下沉回复");
    }

    return parts.join("，");
  }

  function normalizeBackendBaseUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function buildAutoHideSyncKey(keys) {
    if (!keys) {
      return "";
    }

    if (keys.statusKey) {
      return "auto:" + keys.statusKey;
    }

    if (keys.compactTextKey) {
      return "auto:" + keys.compactTextKey;
    }

    if (keys.textKey) {
      return "auto:" + keys.textKey;
    }

    if (keys.patternTextKey) {
      return "auto:" + keys.patternTextKey;
    }

    if (keys.normalized) {
      return "auto:text:" + keys.normalized;
    }

    return "";
  }

  function rememberAutoHideSyncKey(syncKey) {
    if (!syncKey || state.autoHideSyncedKeys.has(syncKey)) {
      return;
    }

    state.autoHideSyncedKeys.add(syncKey);
    api.storage.local.set({
      autoHideSyncedKeys: Array.from(state.autoHideSyncedKeys)
    });
  }

  function generateSyncId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return prefix + window.crypto.randomUUID().replace(/-/g, "");
    }

    return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function ensureSyncIdentity(result, callback) {
    const patch = {};

    if (!String(result.syncKey || "").trim()) {
      patch.syncKey = generateSyncId("sync_");
    }

    if (!String(result.deviceId || "").trim()) {
      patch.deviceId = generateSyncId("device_");
    }

    if (Object.keys(patch).length === 0) {
      callback(result);
      return;
    }

    api.storage.local.set(patch, function () {
      callback(Object.assign({}, result, patch));
    });
  }

  function sameStringArray(left, right) {
    if (left.length !== right.length) {
      return false;
    }

    for (let index = 0; index < left.length; index += 1) {
      if (left[index] !== right[index]) {
        return false;
      }
    }

    return true;
  }

  function isDetailPage() {
    return /\/status\/\d+/.test(location.pathname);
  }

  function readLocalManualState() {
    try {
      const raw = window.localStorage.getItem(LOCAL_MANUAL_STATE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      return {
        manualHideTexts: Array.isArray(parsed.manualHideTexts) ? parsed.manualHideTexts : [],
        manualAllowTexts: Array.isArray(parsed.manualAllowTexts) ? parsed.manualAllowTexts : [],
        manualResetVersion: typeof parsed.manualResetVersion === "string" ? parsed.manualResetVersion : ""
      };
    } catch (error) {
      return null;
    }
  }

  function writeLocalManualState(payload) {
    try {
      window.localStorage.setItem(LOCAL_MANUAL_STATE_KEY, JSON.stringify({
        manualHideTexts: payload.manualHideTexts || [],
        manualAllowTexts: payload.manualAllowTexts || [],
        manualResetVersion: payload.manualResetVersion || ""
      }));
    } catch (error) {
      // Ignore local cache failures and continue with extension storage.
    }
  }

  function openManualStateDb(callback) {
    try {
      const request = window.indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = function () {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = function () {
        callback(request.result);
      };
      request.onerror = function () {
        callback(null);
      };
    } catch (error) {
      callback(null);
    }
  }

  function readIndexedManualState(callback) {
    openManualStateDb(function (db) {
      if (!db) {
        callback(null);
        return;
      }

      try {
        const tx = db.transaction(IDB_STORE, "readonly");
        const store = tx.objectStore(IDB_STORE);
        const request = store.get(IDB_KEY);
        request.onsuccess = function () {
          const value = request.result || null;
          try {
            db.close();
          } catch (error) {
            // ignore close errors
          }
          callback(value);
        };
        request.onerror = function () {
          try {
            db.close();
          } catch (error) {
            // ignore close errors
          }
          callback(null);
        };
      } catch (error) {
        try {
          db.close();
        } catch (closeError) {
          // ignore close errors
        }
        callback(null);
      }
    });
  }

  function writeIndexedManualState(payload, callback) {
    openManualStateDb(function (db) {
      if (!db) {
        if (callback) {
          callback();
        }
        return;
      }

      try {
        const tx = db.transaction(IDB_STORE, "readwrite");
        const store = tx.objectStore(IDB_STORE);
        store.put(payload, IDB_KEY);
        tx.oncomplete = function () {
          try {
            db.close();
          } catch (error) {
            // ignore close errors
          }
          if (callback) {
            callback();
          }
        };
        tx.onerror = function () {
          try {
            db.close();
          } catch (error) {
            // ignore close errors
          }
          if (callback) {
            callback();
          }
        };
      } catch (error) {
        try {
          db.close();
        } catch (closeError) {
          // ignore close errors
        }
        if (callback) {
          callback();
        }
      }
    });
  }

  function buildManualStatePayload() {
    return {
      manualHideTexts: Array.from(state.manualHideTexts),
      manualAllowTexts: Array.from(state.manualAllowTexts),
      manualResetVersion: MANUAL_RESET_VERSION
    };
  }

  function persistManualState(callback) {
    const payload = buildManualStatePayload();
    writeLocalManualState(payload);
    writeIndexedManualState(payload, callback);
  }

  function applyResolvedManualState(manualHideTexts, manualAllowTexts, callback) {
    const nextHideTexts = Array.from(new Set(manualHideTexts || []));
    const nextAllowTexts = Array.from(new Set(manualAllowTexts || []));
    state.manualHideTexts = new Set(nextHideTexts);
    state.manualAllowTexts = new Set(nextAllowTexts);

    const payload = {
      manualHideTexts: nextHideTexts,
      manualAllowTexts: nextAllowTexts,
      manualResetVersion: MANUAL_RESET_VERSION
    };

    writeLocalManualState(payload);
    writeIndexedManualState(payload, callback);
  }

  function requestBackendJson(method, endpoint, payload, callback) {
    if (api.runtime && typeof api.runtime.sendMessage === "function") {
      api.runtime.sendMessage({
        type: "web25-http-request",
        endpoint: endpoint,
        method: method,
        payload: payload || {}
      }, function (response) {
        if (api.runtime && api.runtime.lastError) {
          callback(null);
          return;
        }

        if (!response || !response.ok || !response.data) {
          callback(null);
          return;
        }

        callback(response.data);
      });
      return;
    }

    fetch(endpoint, {
      method: method,
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: method === "GET" ? undefined : JSON.stringify(payload || {}),
      cache: "no-store"
    }).then(function (response) {
      return response.json().then(function (data) {
        return response.ok ? data : null;
      }).catch(function () {
        return null;
      });
    }).then(function (data) {
      callback(data);
    }).catch(function () {
      callback(null);
    });
  }

  function syncRemoteManualState(force, callback) {
    if (!state.backendBaseUrl || !state.syncKey) {
      if (typeof callback === "function") {
        callback(false);
      }
      return;
    }

    const now = Date.now();
    if (!force && state.remoteSyncInFlight) {
      if (typeof callback === "function") {
        callback(false);
      }
      return;
    }

    if (!force && now - state.lastRemoteSyncAt < 3000) {
      if (typeof callback === "function") {
        callback(false);
      }
      return;
    }

    state.remoteSyncInFlight = true;
    state.lastRemoteSyncAt = now;
    const endpoint = state.backendBaseUrl + "/api/state?syncKey=" + encodeURIComponent(state.syncKey);
    requestBackendJson("GET", endpoint, null, function (payload) {
      state.remoteSyncInFlight = false;

      if (!payload || !payload.ok) {
        if (typeof callback === "function") {
          callback(false);
        }
        return;
      }

      const remoteHideTexts = Array.isArray(payload.manualHideKeys) ? payload.manualHideKeys : [];
      const remoteAllowTexts = Array.isArray(payload.manualAllowKeys) ? payload.manualAllowKeys : [];
      applyResolvedManualState(remoteHideTexts, remoteAllowTexts, function () {
        if (typeof callback === "function") {
          callback(true);
        }
      });
    });
  }

  function readSetting(callback) {
    const localState = readLocalManualState();
    readIndexedManualState(function (indexedState) {
      api.storage.local.get(storageDefaults, function (result) {
        ensureSyncIdentity(result, function (resolvedResult) {
          state.enabled = Boolean(resolvedResult.enabled);
          state.markingEnabled = Boolean(resolvedResult.markingEnabled);
          state.backendBaseUrl = normalizeBackendBaseUrl(resolvedResult.backendBaseUrl || storageDefaults.backendBaseUrl);
          state.syncKey = String(resolvedResult.syncKey || "").trim();
          state.deviceId = String(resolvedResult.deviceId || "").trim();
          state.autoHideSyncedKeys = new Set(resolvedResult.autoHideSyncedKeys || []);
          root.dataset.web25MarkingEnabled = state.markingEnabled ? "1" : "0";
          root.dataset.web25SyncReady = state.syncKey && state.backendBaseUrl ? "1" : "0";

          const manualHideTexts = Array.from(new Set([]
            .concat(localState && localState.manualHideTexts ? localState.manualHideTexts : [])
            .concat(indexedState && indexedState.manualHideTexts ? indexedState.manualHideTexts : [])
            .concat(resolvedResult.manualHideTexts || [])
          ));
          const manualAllowTexts = Array.from(new Set([]
            .concat(localState && localState.manualAllowTexts ? localState.manualAllowTexts : [])
            .concat(indexedState && indexedState.manualAllowTexts ? indexedState.manualAllowTexts : [])
            .concat(resolvedResult.manualAllowTexts || [])));
          const manualResetVersion = (localState && localState.manualResetVersion)
            || (indexedState && indexedState.manualResetVersion)
            || resolvedResult.manualResetVersion
            || "";

          if (manualResetVersion !== MANUAL_RESET_VERSION) {
            state.manualHideTexts = new Set();
            state.manualAllowTexts = new Set();
            persistManualState(callback);
            return;
          }

          applyResolvedManualState(manualHideTexts, manualAllowTexts, function () {
            syncRemoteManualState(true, function () {
              callback();
            });
          });
        });
      });
    });
  }

  function watchSettingChanges() {
    if (!api.storage || !api.storage.onChanged) {
      return;
    }

    api.storage.onChanged.addListener(function (changes, areaName) {
      if (areaName !== "local") {
        return;
      }

      const hasManualChanges = Boolean(changes.manualHideTexts || changes.manualAllowTexts);
      const hasOnlyAutoSyncKeys = Boolean(changes.autoHideSyncedKeys) && Object.keys(changes).length === 1;

      if (changes.enabled) {
        state.enabled = Boolean(changes.enabled.newValue);
      }

      if (changes.markingEnabled) {
        state.markingEnabled = Boolean(changes.markingEnabled.newValue);
        root.dataset.web25MarkingEnabled = state.markingEnabled ? "1" : "0";
      }

      if (changes.backendBaseUrl) {
        state.backendBaseUrl = normalizeBackendBaseUrl(changes.backendBaseUrl.newValue);
      }

      if (changes.syncKey) {
        state.syncKey = String(changes.syncKey.newValue || "").trim();
      }

      if (changes.deviceId) {
        state.deviceId = String(changes.deviceId.newValue || "").trim();
      }

      if (changes.autoHideSyncedKeys) {
        state.autoHideSyncedKeys = new Set(changes.autoHideSyncedKeys.newValue || []);
      }

      root.dataset.web25SyncReady = state.syncKey && state.backendBaseUrl ? "1" : "0";

      if (changes.manualHideTexts) {
        state.manualHideTexts = new Set(changes.manualHideTexts.newValue || []);
      }

      if (changes.manualAllowTexts) {
        state.manualAllowTexts = new Set(changes.manualAllowTexts.newValue || []);
      }

      if (state.skipNextStorageSyncScan && hasManualChanges && !changes.enabled) {
        state.skipNextStorageSyncScan = false;
        return;
      }

      if (hasOnlyAutoSyncKeys) {
        return;
      }

      scanPage();
    });
  }

  function scheduleScan() {
    scheduleScanWithDelay(NORMAL_SCAN_DELAY_MS);
  }

  function scheduleScanWithDelay(delayMs) {
    if (state.suppressObserver) {
      return;
    }

    clearTimeout(state.scanTimer);
    state.scanTimer = setTimeout(scanPage, typeof delayMs === "number" ? delayMs : NORMAL_SCAN_DELAY_MS);
  }

  function scheduleManualRescan(delayMs) {
    clearTimeout(state.manualRescanTimer);
    state.manualRescanTimer = setTimeout(function () {
      state.manualRescanTimer = null;
      scanPage();
    }, typeof delayMs === "number" ? delayMs : 120);
  }

  function scheduleManualPersist(delayMs) {
    clearTimeout(state.manualPersistTimer);
    state.manualPersistTimer = setTimeout(function () {
      state.manualPersistTimer = null;
      persistManualState();
    }, typeof delayMs === "number" ? delayMs : 180);
  }

  function suppressObserverBriefly() {
    state.suppressObserver = true;
    setTimeout(function () {
      state.suppressObserver = false;
    }, 120);
  }

  function queueStabilizationScans(delays) {
    state.stabilizeTimers.forEach(function (timerId) {
      clearTimeout(timerId);
    });
    state.stabilizeTimers = [];

    (delays || []).forEach(function (delayMs) {
      const timerId = setTimeout(scanPage, delayMs);
      state.stabilizeTimers.push(timerId);
    });
  }

  function getReplyCell(article) {
    return article.closest('[data-testid="cellInnerDiv"]') || article;
  }

  function isMainArticle(article) {
    const articles = getArticles();
    return articles.length > 0 && articles[0] === article;
  }

  function getArticles() {
    return Array.from(document.querySelectorAll('article[data-testid="tweet"]')).filter(function (article) {
      if (article.closest('[data-web25-owned="1"]')) {
        return false;
      }
      return !article.parentElement || !article.parentElement.closest('article[data-testid="tweet"]');
    });
  }

  function isManagedNode(node) {
    return Boolean(node && node.nodeType === 1 && node.closest && node.closest('[data-web25-owned="1"]'));
  }

  function getTweetText(article) {
    const blocks = Array.from(article.querySelectorAll('div[data-testid="tweetText"], div[lang]'));
    const pieces = blocks
      .map(function (node) {
        return node.innerText.trim();
      })
      .filter(Boolean);

    if (pieces.length > 0) {
      return Array.from(new Set(pieces)).join(" ").replace(/\s+/g, " ").trim();
    }

    return article.innerText.replace(/\s+/g, " ").trim();
  }

  function extractStatusId(url) {
    const match = String(url || "").match(/\/status\/(\d+)/);
    return match ? match[1] : "";
  }

  function getReplyStatusKey(replyArticle) {
    const timeLink = replyArticle.querySelector('a[href*="/status/"] time');
    if (timeLink) {
      const link = timeLink.closest("a");
      const statusId = extractStatusId(link && link.getAttribute("href"));
      if (statusId) {
        return "status:" + statusId;
      }
    }

    const fallbackLink = Array.from(replyArticle.querySelectorAll('a[href*="/status/"]'))
      .map(function (node) {
        return node.getAttribute("href") || "";
      })
      .find(function (href) {
        return /\/status\/\d+/.test(href);
      });
    const fallbackStatusId = extractStatusId(fallbackLink);
    return fallbackStatusId ? "status:" + fallbackStatusId : "";
  }

  function getReplyAccountKey(replyArticle) {
    const handleNode = Array.from(replyArticle.querySelectorAll('[data-testid="User-Name"] span'))
      .map(function (node) {
        return node.textContent.trim();
      })
      .find(function (text) {
        return text.startsWith("@");
      });

    if (!handleNode) {
      return "";
    }

    return "account:" + handleNode.toLowerCase();
  }

  function buildCompactTextKey(normalized) {
    if (!normalized) {
      return "";
    }

    const compact = normalized
      .replace(/[~～`!！?？,，。.、:：;；'"“”‘’()[\]{}<>《》…—\-_=+*\/\\|]/g, "")
      .replace(/[啊呀呢嘛吧哦啦哈呗哇]/g, "")
      .replace(/\s+/g, "");

    if (compact.length < 4) {
      return "";
    }

    return "compact:" + compact;
  }

  function buildPatternTextKey(normalized) {
    if (!normalized) {
      return "";
    }

    const matchedTerms = Array.from(new Set(SIMILARITY_TERMS.filter(function (term) {
      return normalized.includes(term);
    })));

    if (matchedTerms.length > 0) {
      return "pattern:" + matchedTerms.join("|");
    }

    const loose = normalized
      .replace(/[^\p{L}\p{N}]+/gu, "")
      .replace(/(有没有|有没|有|没|吗|嘛|呀|啊|呢|哦|啦|哈|个|一个|一下|急需|急找|急|求|蹲|快来|来|谁来|谁|一位|位|的|了|我|你|他|她|它)/g, "");

    if (loose.length < 4) {
      return "";
    }

    return "pattern:" + loose;
  }

  function getReplyManualKeys(replyArticle, replyText) {
    const normalized = window.Web25Rules.normalizeText(replyText);
    const textKey = normalized ? "text:" + normalized : "";
    const statusKey = getReplyStatusKey(replyArticle);
    const accountKey = getReplyAccountKey(replyArticle);
    const compactTextKey = buildCompactTextKey(normalized);
    const patternTextKey = buildPatternTextKey(normalized);
    return {
      normalized: normalized,
      textKey: textKey,
      statusKey: statusKey,
      accountKey: accountKey,
      compactTextKey: compactTextKey,
      patternTextKey: patternTextKey,
      primaryKey: statusKey || accountKey || textKey || compactTextKey || patternTextKey || normalized
    };
  }

  function cloneManualKeys(keys) {
    if (!keys) {
      return null;
    }

    return {
      normalized: keys.normalized || "",
      textKey: keys.textKey || "",
      statusKey: keys.statusKey || "",
      accountKey: keys.accountKey || "",
      compactTextKey: keys.compactTextKey || "",
      patternTextKey: keys.patternTextKey || "",
      primaryKey: keys.primaryKey || ""
    };
  }

  function hasDecisionKey(set, keys) {
    if (!set || !keys) {
      return false;
    }

    return Boolean(
      (keys.primaryKey && set.has(keys.primaryKey)) ||
      (keys.statusKey && set.has(keys.statusKey)) ||
      (keys.accountKey && set.has(keys.accountKey)) ||
      (keys.textKey && set.has(keys.textKey)) ||
      (keys.compactTextKey && set.has(keys.compactTextKey)) ||
      (keys.patternTextKey && set.has(keys.patternTextKey)) ||
      (keys.normalized && set.has(keys.normalized))
    );
  }

  function hasAllowDecisionKey(set, keys) {
    if (!set || !keys) {
      return false;
    }

    if (keys.statusKey) {
      return set.has(keys.statusKey);
    }

    return Boolean(
      (keys.primaryKey && set.has(keys.primaryKey)) ||
      (keys.textKey && set.has(keys.textKey))
    );
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

    if (keys.compactTextKey) {
      set.add(keys.compactTextKey);
    }

    if (keys.patternTextKey) {
      set.add(keys.patternTextKey);
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

    if (keys.compactTextKey) {
      set.delete(keys.compactTextKey);
    }

    if (keys.patternTextKey) {
      set.delete(keys.patternTextKey);
    }

    if (keys.normalized) {
      set.delete(keys.normalized);
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

  function hideManualMatchesInTree(node) {
    if (!node || node.nodeType !== 1 || isManagedNode(node)) {
      return;
    }

    const articles = [];
    const seen = new Set();

    function pushArticle(article) {
      if (!article || seen.has(article)) {
        return;
      }
      seen.add(article);
      articles.push(article);
    }

    if (node.matches && node.matches('article[data-testid="tweet"]')) {
      pushArticle(node);
    }

    if (node.closest) {
      pushArticle(node.closest('article[data-testid="tweet"]'));
    }

    Array.from(node.querySelectorAll ? node.querySelectorAll('article[data-testid="tweet"]') : []).forEach(function (article) {
      pushArticle(article);
    });

    articles.forEach(function (article) {
      if (article.closest('[data-web25-owned="1"]')) {
        return;
      }

      const replyCell = getReplyCell(article);
      const replyText = getTweetText(article);
      const manualKeys = getReplyManualKeys(article, replyText);
      const storedKeys = getStoredManualKeys(manualKeys, isProtectedAccount(article, getReplyAuthorMeta(article)));

      if (hasAllowDecisionKey(state.manualAllowTexts, storedKeys)) {
        replyCell.style.display = "";
        replyCell.removeAttribute("data-web25-hidden");
        replyCell.removeAttribute("data-web25-manual-pinned");
        return;
      }

      if (hasDecisionKey(state.manualHideTexts, storedKeys)) {
        replyCell.setAttribute("data-web25-hidden", "1");
        replyCell.setAttribute("data-web25-manual-pinned", "1");
        replyCell.style.display = "none";
      }
    });
  }

  function isVerifiedAccount(article) {
    if (article.querySelector('[data-testid="icon-verified"]')) {
      return true;
    }

    return Array.from(article.querySelectorAll('[aria-label]')).some(function (node) {
      const label = String(node.getAttribute("aria-label") || "");
      return /verified|已验证|认证/.test(label.toLowerCase());
    });
  }

  function isFollowedAccount(article) {
    return Array.from(article.querySelectorAll("span")).some(function (node) {
      const text = node.textContent.trim();
      return text === "Following" || text === "正在关注";
    });
  }

  function isProtectedAccount(replyArticle, authorMeta) {
    return isVerifiedAccount(replyArticle) || isFollowedAccount(replyArticle);
  }

  function accountLooksRisky(authorMeta) {
    if (!authorMeta) {
      return false;
    }

    if (window.Web25Rules && typeof window.Web25Rules.handleLooksSuspicious === "function" && window.Web25Rules.handleLooksSuspicious(authorMeta.handle || "")) {
      return true;
    }

    if (window.Web25Rules && typeof window.Web25Rules.displayNameLooksLure === "function" && window.Web25Rules.displayNameLooksLure(authorMeta.displayName || "")) {
      return true;
    }

    return false;
  }

  function getStoredManualKeys(manualKeys, protectedAccount) {
    if (!protectedAccount) {
      return manualKeys;
    }

    return {
      normalized: manualKeys.normalized || "",
      textKey: "",
      statusKey: manualKeys.statusKey || "",
      accountKey: "",
      compactTextKey: "",
      patternTextKey: "",
      primaryKey: manualKeys.statusKey || ""
    };
  }

  function removeAllHiding() {
    root.dataset.web25Detail = isDetailPage() ? "1" : "0";
    setScrollAnchoringDisabled(Boolean(state.enabled && isDetailPage()));

    Array.from(document.querySelectorAll("[data-web25-hidden='1']")).forEach(function (node) {
      node.style.display = "";
      node.removeAttribute("data-web25-hidden");
    });

    Array.from(document.querySelectorAll("[data-web25-pending='1']")).forEach(function (node) {
      node.removeAttribute("data-web25-pending");
    });

    Array.from(document.querySelectorAll("[data-web25-manual-pinned='1']")).forEach(function (node) {
      node.removeAttribute("data-web25-manual-pinned");
    });

    Array.from(document.querySelectorAll("[data-web25-reply-cell='1']")).forEach(function (node) {
      node.removeAttribute("data-web25-reply-cell");
    });

    Array.from(document.querySelectorAll(".web25-reply-actions")).forEach(function (node) {
      node.remove();
    });

    Array.from(document.querySelectorAll(".web25-bottom-host")).forEach(function (node) {
      node.remove();
    });
    Array.from(document.querySelectorAll(".web25-hidden-summary")).forEach(function (node) {
      node.remove();
    });
    state.bottomHostEl = null;
    state.bottomTrayOpen = false;
    state.summaryEl = null;

    Array.from(document.querySelectorAll(".web25-revealed-list")).forEach(function (node) {
      node.remove();
    });
    state.revealedListEl = null;
    state.revealedListItemsEl = null;
    state.revealedSignature = "";

    Array.from(document.querySelectorAll(".web25-status-dock")).forEach(function (node) {
      node.remove();
    });
    state.dockEl = null;
  }

  function resetManagedReplyState() {
    Array.from(document.querySelectorAll("[data-web25-reply-cell='1']")).forEach(function (node) {
      node.removeAttribute("data-web25-reply-cell");
    });

    Array.from(document.querySelectorAll("[data-web25-pending='1']")).forEach(function (node) {
      node.removeAttribute("data-web25-pending");
    });

    Array.from(document.querySelectorAll(".web25-reply-actions-host")).forEach(function (node) {
      node.remove();
    });

    Array.from(document.querySelectorAll(".web25-reply-actions")).forEach(function (node) {
      node.remove();
    });
  }

  function getThreadSection(anchorCell) {
    if (anchorCell && anchorCell.closest) {
      const anchoredSection = anchorCell.closest("section");
      if (anchoredSection) {
        return anchoredSection;
      }
    }

    const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
    if (primaryColumn) {
      const sectionInPrimary = primaryColumn.querySelector("section");
      if (sectionInPrimary) {
        return sectionInPrimary;
      }
    }

    return document.querySelector("main section") || document.querySelector("section");
  }

  function ensureBottomHost(anchorCell) {
    if (!state.bottomHostEl) {
      state.bottomHostEl = document.createElement("div");
      state.bottomHostEl.className = "web25-bottom-host";
      state.bottomHostEl.setAttribute("data-web25-owned", "1");
    }

    const threadSection = getThreadSection(anchorCell);

    if (threadSection && threadSection.parentElement) {
      const parent = threadSection.parentElement;
      if (state.bottomHostEl.parentElement !== parent || state.bottomHostEl.previousSibling !== threadSection) {
        parent.insertBefore(state.bottomHostEl, threadSection.nextSibling);
      }
    } else if (anchorCell && anchorCell.parentElement) {
      const parent = anchorCell.parentElement;
      if (state.bottomHostEl.parentElement !== parent || state.bottomHostEl.previousSibling !== anchorCell) {
        parent.insertBefore(state.bottomHostEl, anchorCell.nextSibling);
      }
    } else if (state.bottomHostEl.parentElement !== document.body) {
      document.body.appendChild(state.bottomHostEl);
    }

    return state.bottomHostEl;
  }

  function setBottomTrayOpen(open) {
    state.bottomTrayOpen = Boolean(open);

    if (state.bottomHostEl) {
      state.bottomHostEl.classList.toggle("web25-bottom-host-open", state.bottomTrayOpen);
    }

    if (state.summaryEl) {
      const toggleButton = state.summaryEl.querySelector(".web25-hidden-summary-toggle");
      if (toggleButton) {
        toggleButton.textContent = state.bottomTrayOpen ? "收起底部" : "展开底部";
      }
    }

    if (state.bottomTrayOpen) {
      requestAnimationFrame(function () {
        if (state.revealedListItemsEl) {
          state.revealedListItemsEl.scrollTop = 0;
        }
      });
    }

  }

  function syncBottomHostVisibility(totalHidden) {
    if (!state.bottomHostEl) {
      return;
    }

    const host = state.bottomHostEl;
    const hasHidden = totalHidden > 0;
    host.classList.toggle("web25-bottom-host-hidden", !hasHidden);
    if (!hasHidden) {
      setBottomTrayOpen(false);
    } else {
      setBottomTrayOpen(state.bottomTrayOpen);
    }
  }

  function removeBottomHostIfEmpty() {
    if (!state.bottomHostEl) {
      return;
    }

    const hasVisibleContent = Array.from(state.bottomHostEl.children).some(function (child) {
      return child.classList && (child.classList.contains("web25-hidden-summary") || child.classList.contains("web25-revealed-list"));
    });

    if (!hasVisibleContent) {
      state.bottomHostEl.classList.add("web25-bottom-host-hidden");
      state.bottomHostEl.classList.remove("web25-bottom-host-open");
      state.bottomTrayOpen = false;
    }
  }

  function ensureSummary(counts) {
    if (!state.summaryEl) {
      state.summaryEl = document.createElement("div");
      state.summaryEl.className = "web25-hidden-summary";
      state.summaryEl.setAttribute("data-web25-owned", "1");

      const copy = document.createElement("div");
      copy.className = "web25-hidden-summary-copy";

      const title = document.createElement("div");
      title.className = "web25-hidden-summary-title";

      const meta = document.createElement("div");
      meta.className = "web25-hidden-summary-meta";

      const toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.className = "web25-hidden-summary-toggle";
      toggleButton.addEventListener("click", function () {
        setBottomTrayOpen(!state.bottomTrayOpen);
      });

      copy.appendChild(title);
      copy.appendChild(meta);
      state.summaryEl.appendChild(copy);
      state.summaryEl.appendChild(toggleButton);
    }

    const totalCount = counts.auto + counts.history + counts.manual;
    const title = state.summaryEl.querySelector(".web25-hidden-summary-title");
    const meta = state.summaryEl.querySelector(".web25-hidden-summary-meta");
    const toggleButton = state.summaryEl.querySelector(".web25-hidden-summary-toggle");

    title.textContent = "web2.5 已整理 " + totalCount + " 条回复";
    meta.textContent = buildSummaryText(counts.auto, counts.history, counts.manual);
    toggleButton.textContent = state.bottomTrayOpen ? "收起列表" : "查看列表";

    const host = state.bottomHostEl;
    if (!host) {
      return;
    }

    setBottomTrayOpen(state.bottomTrayOpen);
    if (state.summaryEl.parentElement !== host || host.firstElementChild !== state.summaryEl) {
      host.insertBefore(state.summaryEl, host.firstChild);
    }
  }

  function ensureRevealedList(counts) {
    if (!state.revealedListEl) {
      state.revealedListEl = document.createElement("div");
      state.revealedListEl.className = "web25-revealed-list";
      state.revealedListEl.setAttribute("data-web25-owned", "1");

      const title = document.createElement("div");
      title.className = "web25-revealed-list-title";

      const meta = document.createElement("div");
      meta.className = "web25-revealed-list-meta";

      const items = document.createElement("div");
      items.className = "web25-revealed-list-items";

      state.revealedListEl.appendChild(title);
      state.revealedListEl.appendChild(meta);
      state.revealedListEl.appendChild(items);
      state.revealedListItemsEl = items;
    }

    const title = state.revealedListEl.querySelector(".web25-revealed-list-title");
    const meta = state.revealedListEl.querySelector(".web25-revealed-list-meta");
    title.textContent = "已整理的回复";
    meta.textContent = buildSummaryText(counts.auto, counts.history, counts.manual);

    const host = state.bottomHostEl;
    if (!host) {
      return state.revealedListItemsEl;
    }

    if (state.revealedListEl.parentElement !== host || host.lastElementChild !== state.revealedListEl) {
      host.appendChild(state.revealedListEl);
    }

    return state.revealedListItemsEl;
  }

  function updateBottomCards(revealedReplies) {
    if (!state.revealedListItemsEl) {
      state.revealedSignature = "";
      return;
    }

    const signature = revealedReplies.map(function (entry) {
      return entry.stableId + ":" + entry.hiddenSource;
    }).join("|");

    if (state.revealedSignature === signature) {
      if (state.revealedListEl) {
        state.revealedListEl.classList.toggle("web25-revealed-list-compact", revealedReplies.length <= 2);
      }
      return;
    }

    if (state.revealedListEl) {
      state.revealedListEl.classList.toggle("web25-revealed-list-compact", revealedReplies.length <= 2);
    }

    state.revealedListItemsEl.textContent = "";
    revealedReplies.forEach(function (entry) {
      state.revealedListItemsEl.appendChild(createBottomCard(entry));
    });
    state.revealedSignature = signature;
  }

  function removeDock() {
    Array.from(document.querySelectorAll(".web25-status-dock")).forEach(function (node) {
      node.remove();
    });
    state.dockEl = null;
  }

  function applyReplyCellVisibility(replyArticle, hidden, pinManual) {
    if (!replyArticle) {
      return;
    }

    const replyCell = getReplyCell(replyArticle);
    if (!replyCell) {
      return;
    }

    if (hidden) {
      replyCell.setAttribute("data-web25-hidden", "1");
      replyCell.removeAttribute("data-web25-pending");
      if (pinManual) {
        replyCell.setAttribute("data-web25-manual-pinned", "1");
      }
      replyCell.style.display = "none";
      return;
    }

    replyCell.style.display = "";
    replyCell.removeAttribute("data-web25-pending");
    replyCell.removeAttribute("data-web25-hidden");
    replyCell.removeAttribute("data-web25-manual-pinned");
  }

  function setReplyCellPending(replyArticle, pending) {
    const replyCell = getReplyCell(replyArticle);
    if (!replyCell || isManagedNode(replyCell)) {
      return;
    }

    if (pending) {
      if (replyCell.getAttribute("data-web25-hidden") === "1") {
        return;
      }
      replyCell.setAttribute("data-web25-pending", "1");
      return;
    }

    replyCell.removeAttribute("data-web25-pending");
  }

  function quarantineReplyArticle(replyArticle) {
    if (!replyArticle || isManagedNode(replyArticle) || isMainArticle(replyArticle)) {
      return;
    }

    setReplyCellPending(replyArticle, true);
  }

  function collectReplyArticlesFromNode(node) {
    if (!node || node.nodeType !== 1 || isManagedNode(node)) {
      return [];
    }

    const seen = new Set();
    const articles = [];

    function push(article) {
      if (!article || seen.has(article) || isManagedNode(article) || isMainArticle(article)) {
        return;
      }
      seen.add(article);
      articles.push(article);
    }

    if (node.matches && node.matches('article[data-testid="tweet"]')) {
      push(node);
    }

    if (node.closest) {
      push(node.closest('article[data-testid="tweet"]'));
    }

    Array.from(node.querySelectorAll ? node.querySelectorAll('article[data-testid="tweet"]') : []).forEach(push);
    return articles;
  }

  function quarantineTree(node) {
    collectReplyArticlesFromNode(node).forEach(quarantineReplyArticle);
  }

  function quarantineExistingReplies() {
    const articles = getArticles();
    if (articles.length <= 1) {
      return;
    }

    articles.slice(1).forEach(quarantineReplyArticle);
  }

  function getReplyActionsMount(replyArticle) {
    if (!replyArticle) {
      return null;
    }

    return replyArticle;
  }

  function removeReplyActionsHost(replyArticle) {
    const mount = getReplyActionsMount(replyArticle);
    if (!mount) {
      return;
    }

    const host = mount.querySelector(".web25-reply-actions-host");
    if (host) {
      host.remove();
    }
  }

  function postSyncEvent(eventType, replyArticle, replyText, keys) {
    if (!state.backendBaseUrl || !state.syncKey || !eventType) {
      return;
    }

    const authorMeta = getReplyAuthorMeta(replyArticle);
    const endpoint = state.backendBaseUrl + "/api/events";
    const threadStatusId = extractStatusId(location.pathname) || extractStatusId(location.href);
    const payload = {
      syncKey: state.syncKey,
      deviceId: state.deviceId,
      source: "extension",
      eventType: eventType,
      threadUrl: location.href,
      threadStatusId: threadStatusId,
      replyStatusId: keys && keys.statusKey ? keys.statusKey.replace(/^status:/, "") : "",
      replyHandle: authorMeta.handle,
      replyDisplayName: authorMeta.displayName,
      accountProtected: isProtectedAccount(replyArticle, authorMeta) ? 1 : 0,
      replyText: replyText,
      normalizedText: keys && keys.normalized ? keys.normalized : "",
      compactText: keys && keys.compactTextKey ? keys.compactTextKey.replace(/^compact:/, "") : ""
    };

    if (api.runtime && typeof api.runtime.sendMessage === "function") {
      api.runtime.sendMessage({
        type: "web25-sync-event",
        endpoint: endpoint,
        payload: payload
      }, function () {
        if (api.runtime && api.runtime.lastError) {
          // Keep local UX smooth even when sync transport fails.
        }
      });
      return;
    }

    fetch(endpoint, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function () {
      // Keep local UX smooth even when sync transport fails.
    });
  }

  function addManualDecision(kind, replyArticle, replyText, explicitKeys) {
    const keys = explicitKeys ? cloneManualKeys(explicitKeys) : getReplyManualKeys(replyArticle, replyText);
    if (!keys.primaryKey && !keys.textKey && !keys.normalized) {
      return;
    }

    const authorMeta = getReplyAuthorMeta(replyArticle);
    const protectedAccount = isProtectedAccount(replyArticle, authorMeta);
    const storedKeys = getStoredManualKeys(keys, protectedAccount);

    if (kind === "hide") {
      addDecisionKeys(state.manualHideTexts, storedKeys);
      removeDecisionKeys(state.manualAllowTexts, storedKeys);
      suppressObserverBriefly();
      applyReplyCellVisibility(replyArticle, true, true);
      removeReplyActionsHost(replyArticle);
      state.skipNextStorageSyncScan = true;
      scheduleManualPersist(60);
      scheduleManualRescan(FAST_SCAN_DELAY_MS);
      postSyncEvent("manual_hide", replyArticle, replyText, keys);
      return;
    }

    addAllowDecisionKeys(state.manualAllowTexts, storedKeys);
    removeHideDecisionKeysForAllow(state.manualHideTexts, storedKeys);
    suppressObserverBriefly();
    applyReplyCellVisibility(replyArticle, false, false);
    if (replyArticle) {
      const replyCell = getReplyCell(replyArticle);
      removeReplyActionsHost(replyArticle);
      if (replyCell && state.markingEnabled) {
        ensureReplyActions(replyCell, replyArticle, replyText, false, null);
      }
    }
    state.skipNextStorageSyncScan = true;
    scheduleManualPersist(60);
    scheduleManualRescan(FAST_SCAN_DELAY_MS);
    postSyncEvent("manual_allow", replyArticle, replyText, keys);
  }

  function clearManualDecisions() {
    state.manualHideTexts = new Set();
    state.manualAllowTexts = new Set();
    state.bottomTrayOpen = false;
    state.skipNextStorageSyncScan = true;
    persistManualState(function () {
      scanPage();
      queueStabilizationScans();
    });
  }

  function ensureReplyActions(replyCell, replyArticle, replyText, hidden, hiddenSource) {
    replyCell.setAttribute("data-web25-reply-cell", "1");

    const mount = getReplyActionsMount(replyArticle);
    if (!mount) {
      return;
    }

    let actions = mount.querySelector(".web25-reply-actions");
    if (hidden || !state.markingEnabled) {
      const existingHost = mount.querySelector(".web25-reply-actions-host");
      if (existingHost) {
        existingHost.remove();
      }
      return;
    }

    if (!actions) {
      const actionsHost = document.createElement("div");
      actionsHost.className = "web25-reply-actions-host";
      actionsHost.setAttribute("data-web25-owned", "1");
      actionsHost.setAttribute("data-web25-for", getReplyStatusKey(replyArticle) || getReplyAccountKey(replyArticle) || "reply");

      actions = document.createElement("div");
      actions.className = "web25-reply-actions";
      actionsHost.appendChild(actions);
      mount.appendChild(actionsHost);
    }

    actions.textContent = "";

    const hideButton = document.createElement("button");
    hideButton.type = "button";
    hideButton.className = "web25-action-button web25-action-hide";
    hideButton.textContent = "标记可疑";
    hideButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      replyCell.setAttribute("data-web25-manual-pinned", "1");
      addManualDecision("hide", replyArticle, replyText);
    });
    actions.appendChild(hideButton);
  }

  function getReplyAuthorMeta(replyArticle) {
    if (!replyArticle) {
      return {
        displayName: "X 用户",
        handle: ""
      };
    }

    const spans = Array.from(replyArticle.querySelectorAll('[data-testid="User-Name"] span'))
      .map(function (node) {
        return node.textContent.trim();
      })
      .filter(Boolean);
    const handle = spans.find(function (text) {
      return text.startsWith("@");
    }) || "";
    const displayName = spans.find(function (text) {
      return !text.startsWith("@") && !/^\d+[smhdwy]$/.test(text.toLowerCase());
    }) || "X 用户";

    return {
      displayName: displayName,
      handle: handle
    };
  }

  function findReplyArticleByKeys(keys) {
    if (!keys) {
      return null;
    }

    const replies = getArticles().slice(1);
    for (let index = 0; index < replies.length; index += 1) {
      const replyArticle = replies[index];
      const replyText = getTweetText(replyArticle);
      const candidateKeys = getReplyManualKeys(replyArticle, replyText);

      if ((keys.statusKey && candidateKeys.statusKey === keys.statusKey)
        || (keys.textKey && candidateKeys.textKey === keys.textKey)
        || (keys.compactTextKey && candidateKeys.compactTextKey === keys.compactTextKey)
        || (keys.patternTextKey && candidateKeys.patternTextKey === keys.patternTextKey)
        || (keys.accountKey && candidateKeys.accountKey === keys.accountKey)) {
        return replyArticle;
      }
    }

    return null;
  }

  function createBottomCard(entry) {
    const meta = {
      displayName: entry.replyDisplayName || "X 用户",
      handle: entry.replyHandle || ""
    };
    const card = document.createElement("div");
    card.className = "web25-bottom-card";
    card.setAttribute("data-web25-owned", "1");

    const header = document.createElement("div");
    header.className = "web25-bottom-card-header";

    const name = document.createElement("div");
    name.className = "web25-bottom-card-name";
    name.textContent = meta.displayName;
    header.appendChild(name);

    if (meta.handle) {
      const handle = document.createElement("div");
      handle.className = "web25-bottom-card-handle";
      handle.textContent = meta.handle;
      header.appendChild(handle);
    }

    const body = document.createElement("div");
    body.className = "web25-bottom-card-body";
    body.textContent = entry.replyText || "这条回复没有可读取文本";

    const footer = document.createElement("div");
    footer.className = "web25-bottom-card-footer";

    const badge = document.createElement("span");
    badge.className = "web25-hidden-badge " + (entry.hiddenSource === "manual"
      ? "web25-hidden-badge-manual"
      : (entry.hiddenSource === "history" ? "web25-hidden-badge-history" : "web25-hidden-badge-auto"));
    badge.textContent = entry.hiddenSource === "manual"
      ? "你刚标记下沉"
      : (entry.hiddenSource === "history" ? "命中历史标记" : "web2.5 自动下沉");
    footer.appendChild(badge);

    const allowButton = document.createElement("button");
    allowButton.type = "button";
    allowButton.className = "web25-action-button web25-action-allow";
    allowButton.textContent = "恢复此条";
    allowButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      allowButton.disabled = true;
      card.style.opacity = "0.55";
      const replyArticle = findReplyArticleByKeys(entry.manualKeys);
      addManualDecision("allow", replyArticle, entry.replyText, entry.manualKeys);
    });
    footer.appendChild(allowButton);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
    return card;
  }

  function scanPage() {
    root.dataset.web25LastScan = String(Date.now());
    root.dataset.web25Detail = isDetailPage() ? "1" : "0";
    root.dataset.web25MarkingEnabled = state.markingEnabled ? "1" : "0";
    root.dataset.web25Stage = "scan:start";
    delete root.dataset.web25Error;

    if (location.href !== state.currentUrl) {
      state.currentUrl = location.href;
    }

    if (!state.enabled || !isDetailPage()) {
      root.dataset.web25Stage = "scan:inactive";
      removeAllHiding();
      return;
    }

    setScrollAnchoringDisabled(true);

    const articles = getArticles();
    root.dataset.web25Articles = String(articles.length);
    if (articles.length < 2) {
      root.dataset.web25Stage = "scan:not-enough-articles";
      queueStabilizationScans([700, 1600, 3200]);
      removeAllHiding();
      return;
    }

    state.suppressObserver = true;
    try {
      root.dataset.web25Stage = "scan:reset";
      resetManagedReplyState();

      const mainArticle = articles[0];
      const replies = articles.slice(1);
      let lastReplyCell = null;
      root.dataset.web25Replies = String(replies.length);
      root.dataset.web25Stage = "scan:replies-ready";
      const mainText = getTweetText(mainArticle);
      const accountEvidenceCounts = new Map();
      let hiddenCount = 0;
      let autoHiddenCount = 0;
      let historyHiddenCount = 0;
      let manualHiddenCount = 0;
      const revealedReplies = [];
      const replySnapshots = replies.map(function (replyArticle) {
        const replyCell = getReplyCell(replyArticle);
        lastReplyCell = replyCell;
        replyCell.removeAttribute("data-web25-pending");
        const replyText = getTweetText(replyArticle);
        const manualKeys = getReplyManualKeys(replyArticle, replyText);
        const authorMeta = getReplyAuthorMeta(replyArticle);
        const protectedAccount = isProtectedAccount(replyArticle, authorMeta);
        const riskyAccount = accountLooksRisky(authorMeta);
        const storedManualKeys = getStoredManualKeys(manualKeys, protectedAccount);
        let decision;
        let hiddenSource = null;
        const isAllowed = hasAllowDecisionKey(state.manualAllowTexts, storedManualKeys);
        const hasPinnedHide = replyCell.getAttribute("data-web25-manual-pinned") === "1";
        const hasHistoryHide = hasDecisionKey(state.manualHideTexts, storedManualKeys);
        const isManuallyHidden = !isAllowed && (hasPinnedHide || hasHistoryHide);

        if (isAllowed) {
          decision = {
            hide: false,
            score: -100,
            reasons: ["manual-allow"]
          };
        } else if (hasPinnedHide) {
          decision = {
            hide: true,
            score: 100,
            reasons: ["manual-pinned"]
          };
          hiddenSource = "manual";
        } else if (hasHistoryHide) {
          decision = {
            hide: true,
            score: 100,
            reasons: ["manual-hide"]
          };
          hiddenSource = "history";
        } else if (AUTO_HIDE_ENABLED && window.Web25Rules && typeof window.Web25Rules.evaluateReply === "function") {
          decision = window.Web25Rules.evaluateReply(replyText, mainText, {
            isVerified: protectedAccount && isVerifiedAccount(replyArticle),
            isFollowed: protectedAccount && isFollowedAccount(replyArticle),
            handle: authorMeta.handle,
            displayName: authorMeta.displayName
          });
          if (decision.hide) {
            hiddenSource = "auto";
            if (!AUTO_HIDE_ENABLED) {
              decision = {
                hide: false,
                score: decision.score,
                reasons: (decision.reasons || []).concat(["auto-hide-disabled"])
              };
              hiddenSource = null;
            }
          }
        } else {
          decision = {
            hide: false,
            score: 0,
            reasons: AUTO_HIDE_ENABLED ? ["rules-missing"] : ["auto-disabled"]
          };
        }

        if (!isAllowed && !protectedAccount && riskyAccount && manualKeys.accountKey && !hiddenSource && decision && decision.score >= 4) {
          accountEvidenceCounts.set(manualKeys.accountKey, (accountEvidenceCounts.get(manualKeys.accountKey) || 0) + 1);
        }

        return {
          replyArticle: replyArticle,
          replyCell: replyCell,
          replyText: replyText,
          manualKeys: manualKeys,
          storedManualKeys: storedManualKeys,
          authorMeta: authorMeta,
          protectedAccount: protectedAccount,
          riskyAccount: riskyAccount,
          isAllowed: isAllowed,
          decision: decision,
          hiddenSource: hiddenSource,
          isManuallyHidden: isManuallyHidden
        };
      });

      replySnapshots.forEach(function (entry) {
        const replyArticle = entry.replyArticle;
        const replyCell = entry.replyCell;
        const replyText = entry.replyText;
        const manualKeys = entry.manualKeys;
        const authorMeta = entry.authorMeta;
        const protectedAccount = entry.protectedAccount;
        const riskyAccount = entry.riskyAccount;
        let decision = entry.decision;
        let hiddenSource = entry.hiddenSource;
        const isManuallyHidden = entry.isManuallyHidden;

        if (!entry.isAllowed
          && !hiddenSource
          && !protectedAccount
          && riskyAccount
          && manualKeys.accountKey
          && (accountEvidenceCounts.get(manualKeys.accountKey) || 0) >= 2
          && decision
          && decision.score >= 3) {
          decision = {
            hide: true,
            score: Math.max(decision.score, 6),
            reasons: (decision.reasons || []).concat(["repeat-suspicious-account"])
          };
          hiddenSource = "auto";
        }

        if (decision.hide) {
          replyCell.setAttribute("data-web25-hidden", "1");
          if (hiddenSource === "manual") {
            replyCell.setAttribute("data-web25-manual-pinned", "1");
          }
          replyCell.style.display = "none";
          hiddenCount += 1;
          if (hiddenSource === "manual") {
            manualHiddenCount += 1;
          } else if (hiddenSource === "history") {
            historyHiddenCount += 1;
          } else {
            autoHiddenCount += 1;
          }

          revealedReplies.push({
            stableId: manualKeys.statusKey || manualKeys.textKey || manualKeys.compactTextKey || manualKeys.patternTextKey || ("reply:" + hiddenCount + ":" + replyText),
            replyText: replyText,
            hiddenSource: hiddenSource || "auto",
            manualKeys: cloneManualKeys(manualKeys),
            replyDisplayName: authorMeta.displayName,
            replyHandle: authorMeta.handle
          });

          if (hiddenSource === "auto") {
            const autoHideSyncKey = buildAutoHideSyncKey(manualKeys);
            if (autoHideSyncKey && !state.autoHideSyncedKeys.has(autoHideSyncKey)) {
              rememberAutoHideSyncKey(autoHideSyncKey);
              postSyncEvent("auto_hide", replyArticle, replyText, manualKeys);
            }
          }
        } else {
          replyCell.style.display = "";
          replyCell.removeAttribute("data-web25-pending");
          replyCell.removeAttribute("data-web25-hidden");
          replyCell.removeAttribute("data-web25-manual-pinned");
        }

        ensureReplyActions(replyCell, replyArticle, replyText, decision.hide || isManuallyHidden, hiddenSource);
      });
      root.dataset.web25Stage = "scan:actions-ready";

      const counts = {
        auto: autoHiddenCount,
        history: historyHiddenCount,
        manual: manualHiddenCount
      };

      root.dataset.web25ReplyCells = String(document.querySelectorAll("[data-web25-reply-cell='1']").length);
      root.dataset.web25ManualButtons = String(document.querySelectorAll(".web25-action-hide").length);

      removeDock();
      root.dataset.web25Stage = "scan:summary-ready";

      if (hiddenCount === 0) {
        if (state.summaryEl) {
          state.summaryEl.remove();
          state.summaryEl = null;
        }
        if (state.revealedListEl) {
          state.revealedListEl.remove();
          state.revealedListEl = null;
        }
        state.revealedListItemsEl = null;
        state.revealedSignature = "";
        if (state.bottomHostEl) {
          state.bottomHostEl.remove();
          state.bottomHostEl = null;
        }
        removeBottomHostIfEmpty();
        return;
      }

      ensureBottomHost(lastReplyCell);
      ensureSummary(counts);
      if (revealedReplies.length > 0) {
        ensureRevealedList(counts);
        updateBottomCards(revealedReplies);
      }
      syncBottomHostVisibility(hiddenCount);
      root.dataset.web25Stage = "scan:done";
    } catch (error) {
      root.dataset.web25Error = String(error && error.message ? error.message : error);
      root.dataset.web25Stage = "scan:error";
      throw error;
    } finally {
      setTimeout(function () {
        state.suppressObserver = false;
      }, 0);
    }
  }

  function boot() {
    quarantineExistingReplies();
    readSetting(function () {
      watchSettingChanges();
      if (api.runtime && api.runtime.onMessage) {
        api.runtime.onMessage.addListener(function (message) {
          if (!message || message.type !== "web25-admin") {
            return;
          }

          if (message.command === "clear-manual") {
            clearManualDecisions();
          }
        });
      }
      scanPage();
      state.observer = new MutationObserver(function (records) {
        if (location.href !== state.currentUrl) {
          quarantineExistingReplies();
          scheduleScanWithDelay(FAST_SCAN_DELAY_MS);
          return;
        }

        let relevant = false;

        records.forEach(function (record) {
          if (isManagedNode(record.target)) {
            return;
          }

          Array.from(record.addedNodes || []).forEach(function (node) {
            if (!node || node.nodeType !== 1 || isManagedNode(node)) {
              return;
            }

            if (node.matches && (node.matches('article[data-testid="tweet"]') || node.matches('[data-testid="cellInnerDiv"]'))) {
              relevant = true;
              quarantineTree(node);
              return;
            }

            if (Boolean(node.querySelector && node.querySelector('article[data-testid="tweet"], [data-testid="cellInnerDiv"]'))) {
              relevant = true;
              quarantineTree(node);
            }
          });
        });

        if (relevant) {
          scheduleScanWithDelay(FAST_SCAN_DELAY_MS);
        }
      });
      state.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      window.addEventListener("popstate", function () {
        quarantineExistingReplies();
        scheduleScanWithDelay(FAST_SCAN_DELAY_MS);
      });
      window.addEventListener("focus", function () {
        syncRemoteManualState(false, function (changed) {
          if (changed) {
            scanPage();
          }
        });
      });
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState !== "visible") {
          return;
        }

        syncRemoteManualState(false, function (changed) {
          if (changed) {
            scanPage();
          }
        });
      });
    });
  }

  try {
    if (document.body) {
      boot();
    } else {
      const startWhenReady = function () {
        if (!document.body) {
          return;
        }
        document.removeEventListener("DOMContentLoaded", startWhenReady);
        boot();
      };
      document.addEventListener("DOMContentLoaded", startWhenReady);
    }
  } catch (error) {
    root.dataset.web25Error = String(error && error.message ? error.message : error);
    throw error;
  }
})();
