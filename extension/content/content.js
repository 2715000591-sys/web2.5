(function () {
  const BUILD_ID = "2026-04-22-2255";
  const MANUAL_RESET_VERSION = "2026-04-19-cleanup2";
  const AUTO_HIDE_ENABLED = true;
  const LIVE_MUTATION_SYNC_ENABLED = false;
  const PAGE_CONTROLLER_KEY = "__web25PageController__";
  const INSTANCE_ID = BUILD_ID + ":" + Date.now().toString(36) + ":" + Math.random().toString(36).slice(2, 8);
  const FAST_SCAN_DELAY_MS = 70;
  const NORMAL_SCAN_DELAY_MS = 180;
  const OFFICIAL_AD_LABELS = ["广告", "Promoted", "推广"];
  const OFFICIAL_AD_LINK_PATTERNS = [
    /ad\.doubleclick\.net/i,
    /doubleclick/i,
    /\/i\/ads\//i
  ];
  const SIDEBAR_TITLE_PATTERNS = {
    happenings: [
      /^有什么新鲜事$/i,
      /^有什麼新鮮事$/i,
      /^what'?s happening$/i,
      /^what’s happening$/i
    ],
    follow: [
      /^推荐关注$/i,
      /^推薦關注$/i,
      /^who to follow$/i,
      /^you might like$/i
    ]
  };
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
    "看主页",
    "点主页",
    "主页置顶",
    "主页id",
    "置顶id",
    "看简介",
    "简介id",
    "看资料",
    "资料id",
    "签名id",
    "自介id",
    "搜id",
    "小号",
    "纸飞机",
    "飞机号",
    "扣扣",
    "企鹅",
    "群号",
    "频道号",
    "vx",
    "wx",
    "tg",
    "在线等你",
    "取精",
    "固炮",
    "骚"
  ];
  const LOCAL_MANUAL_STATE_KEY = "web25-manual-memory-v1";
  const IDB_NAME = "web25-manual-memory";
  const IDB_STORE = "state";
  const IDB_KEY = "manual-state";
  const SIDEBAR_SESSION_STORAGE_KEY = "web25-dismissed-sidebar-modules-v1";
  const DEFAULT_PUBLIC_BACKEND_BASE_URL = "https://web25-public.web25-boris.workers.dev";
  const LEGACY_BACKEND_BASE_URLS = new Set([
    "",
    "http://127.0.0.1:8787",
    "http://localhost:8787",
    "https://web25-public-pages.pages.dev"
  ]);
  const api = typeof browser !== "undefined" ? browser : chrome;
  const root = document.documentElement;
  const storageDefaults = {
    enabled: true,
    markingEnabled: false,
    backendBaseUrl: DEFAULT_PUBLIC_BACKEND_BASE_URL,
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
    backendBaseUrl: DEFAULT_PUBLIC_BACKEND_BASE_URL,
    syncKey: "",
    deviceId: "",
    observer: null,
    scanTimer: null,
    manualRescanTimer: null,
    manualPersistTimer: null,
    bottomUiDedupeTimer: null,
    stabilizeTimers: [],
    currentUrl: location.href,
    bottomHostEl: null,
    bottomTrayOpen: false,
    summaryEl: null,
    revealedListEl: null,
    revealedListItemsEl: null,
    revealedSignature: "",
    dockEl: null,
    dismissedSidebarModules: new Set(),
    sidebarStateLoaded: false,
    manualHideTexts: new Set(),
    manualAllowTexts: new Set(),
    globalTemplateRules: new Set(),
    repeatSuspiciousHandles: new Set(),
    autoHideSyncedKeys: new Set(),
    adHideSyncedKeys: new Set(),
    adHidePendingKeys: new Set(),
    remoteSyncInFlight: false,
    lastRemoteSyncAt: 0,
    accountBindingInFlight: false,
    lastAccountBindAttemptAt: 0,
    lastAccountBindSignature: "",
    lastSuccessfulAccountBindSignature: "",
    lastSuccessfulAccountBindAt: 0,
    skipNextStorageSyncScan: false,
    suppressObserver: false,
    storageChangeListener: null,
    runtimeMessageListener: null,
    popstateListener: null,
    focusListener: null,
    visibilityListener: null,
    domReadyListener: null,
    bootStarted: false,
    booted: false,
    destroyed: false
  };

  function isCurrentPageController() {
    return Boolean(window[PAGE_CONTROLLER_KEY] && window[PAGE_CONTROLLER_KEY].instanceId === INSTANCE_ID);
  }

  function clearScheduledWork() {
    clearTimeout(state.scanTimer);
    clearTimeout(state.manualRescanTimer);
    clearTimeout(state.manualPersistTimer);
    clearTimeout(state.bottomUiDedupeTimer);
    state.scanTimer = null;
    state.manualRescanTimer = null;
    state.manualPersistTimer = null;
    state.bottomUiDedupeTimer = null;
    state.stabilizeTimers.forEach(function (timerId) {
      clearTimeout(timerId);
    });
    state.stabilizeTimers = [];
  }

  function clearStalePageArtifacts() {
    Array.from(document.querySelectorAll("[data-web25-hidden='1']")).forEach(function (node) {
      node.style.display = "";
      node.removeAttribute("data-web25-hidden");
    });
    Array.from(document.querySelectorAll("[data-web25-ad-hidden='1']")).forEach(function (node) {
      node.style.display = "";
      node.removeAttribute("data-web25-ad-hidden");
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
    Array.from(document.querySelectorAll("[data-web25-ad-cell='1']")).forEach(function (node) {
      node.removeAttribute("data-web25-ad-cell");
    });
    Array.from(document.querySelectorAll(".web25-reply-actions-host, .web25-bottom-host, .web25-hidden-summary, .web25-revealed-list, .web25-status-dock")).forEach(function (node) {
      node.remove();
    });
    clearSidebarModuleUi();

    const anchorStyleTag = document.getElementById("web25-anchor-style");
    if (anchorStyleTag && anchorStyleTag.getAttribute("data-web25-owned") === "1") {
      anchorStyleTag.remove();
    }

    delete root.dataset.web25Booted;
    delete root.dataset.web25Instance;
  }

  function destroyPageController(reason) {
    if (state.destroyed) {
      if (isCurrentPageController()) {
        delete window[PAGE_CONTROLLER_KEY];
      }
      return;
    }

    state.destroyed = true;
    clearScheduledWork();

    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }

    if (state.storageChangeListener && api.storage && api.storage.onChanged && typeof api.storage.onChanged.removeListener === "function") {
      api.storage.onChanged.removeListener(state.storageChangeListener);
      state.storageChangeListener = null;
    }

    if (state.runtimeMessageListener && api.runtime && api.runtime.onMessage && typeof api.runtime.onMessage.removeListener === "function") {
      api.runtime.onMessage.removeListener(state.runtimeMessageListener);
      state.runtimeMessageListener = null;
    }

    if (state.popstateListener) {
      window.removeEventListener("popstate", state.popstateListener);
      state.popstateListener = null;
    }

    if (state.focusListener) {
      window.removeEventListener("focus", state.focusListener);
      state.focusListener = null;
    }

    if (state.visibilityListener) {
      document.removeEventListener("visibilitychange", state.visibilityListener);
      state.visibilityListener = null;
    }
    if (state.domReadyListener) {
      document.removeEventListener("DOMContentLoaded", state.domReadyListener);
      state.domReadyListener = null;
    }

    resetManagedReplyState();
    removeAllHiding();

    const anchorStyleTag = document.getElementById("web25-anchor-style");
    if (anchorStyleTag && anchorStyleTag.getAttribute("data-web25-owned") === "1") {
      anchorStyleTag.remove();
    }

    delete root.dataset.web25Booted;
    delete root.dataset.web25Instance;
    root.dataset.web25Stage = reason ? "destroy:" + reason : "destroyed";

    if (isCurrentPageController()) {
      delete window[PAGE_CONTROLLER_KEY];
    }
  }

  function claimPageController() {
    const existingController = window[PAGE_CONTROLLER_KEY];

    if (!existingController && root.dataset.web25Booted === "1") {
      clearStalePageArtifacts();
    }

    if (!existingController) {
      window[PAGE_CONTROLLER_KEY] = {
        instanceId: INSTANCE_ID,
        buildId: BUILD_ID,
        destroy: destroyPageController
      };
      return true;
    }

    if (existingController.instanceId === INSTANCE_ID) {
      return true;
    }

    if (typeof existingController.destroy === "function") {
      try {
        existingController.destroy("replaced");
      } catch (error) {
        // If cleanup fails we still prefer to avoid a second active controller.
      }
    }

    if (window[PAGE_CONTROLLER_KEY] && window[PAGE_CONTROLLER_KEY].instanceId !== INSTANCE_ID) {
      return false;
    }

    window[PAGE_CONTROLLER_KEY] = {
      instanceId: INSTANCE_ID,
      buildId: BUILD_ID,
      destroy: destroyPageController
    };
    return true;
  }

  if (!claimPageController()) {
    root.dataset.web25Build = BUILD_ID;
    root.dataset.web25Stage = "boot:duplicate-skip";
    return;
  }

  root.dataset.web25Build = BUILD_ID;
  root.dataset.web25Booted = "1";
  root.dataset.web25Instance = INSTANCE_ID;
  root.dataset.web25Detail = isDetailPage() ? "1" : "0";
  root.dataset.web25Home = "0";
  root.dataset.web25Replies = "0";
  root.dataset.web25Articles = "0";
  root.dataset.web25Ads = "0";
  root.dataset.web25AdSync = "";
  root.dataset.web25AdSyncDetail = "";
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

  function buildSummaryText(autoCount, historyCount, manualCount, scannedCount) {
    const parts = [];
    const totalCount = autoCount + historyCount + manualCount;

    if (totalCount === 0) {
      if (scannedCount > 0) {
        return "刚刚看了 " + scannedCount + " 条回复。";
      }

      return "还在等回复区加载出来。";
    }

    if (autoCount > 0) {
      parts.push("web2.5 自动下沉 " + autoCount + " 条");
    }

    if (historyCount > 0) {
      parts.push("命中历史标记 " + historyCount + " 条");
    }

    if (manualCount > 0) {
      parts.push("你刚标记下沉 " + manualCount + " 条");
    }

    return parts.join("，");
  }

  function normalizeBackendBaseUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function shouldAutoUpgradeBackendBaseUrl(value) {
    return LEGACY_BACKEND_BASE_URLS.has(normalizeBackendBaseUrl(value));
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

    if (shouldAutoUpgradeBackendBaseUrl(result.backendBaseUrl)) {
      patch.backendBaseUrl = DEFAULT_PUBLIC_BACKEND_BASE_URL;
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

  function isHomeTimelinePage() {
    return /^\/home\/?$/.test(location.pathname);
  }

  function normalizeSidebarHeadingText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function readDismissedSidebarModules() {
    try {
      const rawValue = window.sessionStorage.getItem(SIDEBAR_SESSION_STORAGE_KEY);
      if (!rawValue) {
        return new Set();
      }

      const parsed = JSON.parse(rawValue);
      return new Set(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
    } catch (error) {
      return new Set();
    }
  }

  function persistDismissedSidebarModules() {
    try {
      window.sessionStorage.setItem(
        SIDEBAR_SESSION_STORAGE_KEY,
        JSON.stringify(Array.from(state.dismissedSidebarModules))
      );
    } catch (error) {
      // Ignore session persistence failures and keep page behavior working.
    }
  }

  function ensureSidebarDismissedStateLoaded() {
    if (state.sidebarStateLoaded) {
      return;
    }

    state.dismissedSidebarModules = readDismissedSidebarModules();
    state.sidebarStateLoaded = true;
  }

  function getSidebarModuleKindByTitle(title) {
    const normalizedTitle = normalizeSidebarHeadingText(title);
    if (!normalizedTitle) {
      return "";
    }

    if (SIDEBAR_TITLE_PATTERNS.happenings.some(function (pattern) {
      return pattern.test(normalizedTitle);
    })) {
      return "happenings";
    }

    if (SIDEBAR_TITLE_PATTERNS.follow.some(function (pattern) {
      return pattern.test(normalizedTitle);
    })) {
      return "follow";
    }

    return "";
  }

  function getSidebarColumn() {
    return document.querySelector('[data-testid="sidebarColumn"]');
  }

  function resolveSidebarModuleContainer(titleNode, sidebarColumn) {
    if (!titleNode || !sidebarColumn || !sidebarColumn.contains(titleNode)) {
      return null;
    }

    const cellContainer = titleNode.closest('[data-testid="cellInnerDiv"]');
    if (cellContainer && sidebarColumn.contains(cellContainer)) {
      return cellContainer;
    }

    const semanticContainer = titleNode.closest("section, aside, [role='region']");
    if (semanticContainer && sidebarColumn.contains(semanticContainer)) {
      let current = semanticContainer;
      let highestInsideSidebar = semanticContainer;
      while (current && current !== sidebarColumn) {
        highestInsideSidebar = current;
        if (current.parentElement === sidebarColumn) {
          return current;
        }
        current = current.parentElement;
      }
      return highestInsideSidebar;
    }

    let node = titleNode;
    let fallback = titleNode;
    while (node && node !== sidebarColumn) {
      if (node.parentElement === sidebarColumn) {
        return node;
      }

      if (node.parentElement && node.parentElement.parentElement === sidebarColumn) {
        fallback = node.parentElement;
      }

      node = node.parentElement;
    }

    return fallback;
  }

  function collectSidebarModules() {
    const sidebarColumn = getSidebarColumn();
    if (!sidebarColumn) {
      return [];
    }

    const seen = new Set();
    const modules = [];

    Array.from(sidebarColumn.querySelectorAll("*")).forEach(function (node) {
      if (!node || node.children.length > 0) {
        return;
      }

      const kind = getSidebarModuleKindByTitle(node.textContent || "");
      if (!kind) {
        return;
      }

      const container = resolveSidebarModuleContainer(node, sidebarColumn);
      if (!container || seen.has(container)) {
        return;
      }

      seen.add(container);
      modules.push({
        kind: kind,
        section: container
      });
    });

    return modules;
  }

  function applySidebarModuleDismissed(section, dismissed) {
    if (!section) {
      return;
    }

    if (dismissed) {
      section.setAttribute("data-web25-sidebar-hidden", "1");
      return;
    }

    section.removeAttribute("data-web25-sidebar-hidden");
  }

  function dismissSidebarModule(kind) {
    if (!kind) {
      return;
    }

    ensureSidebarDismissedStateLoaded();
    state.dismissedSidebarModules.add(kind);
    persistDismissedSidebarModules();
    scanSidebarModules();
  }

  function ensureSidebarCloseButton(section, kind) {
    if (!section || !kind) {
      return;
    }

    section.setAttribute("data-web25-sidebar-module", kind);
    section.classList.add("web25-sidebar-module");

    let button = section.querySelector(".web25-sidebar-close");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "web25-sidebar-close";
      button.setAttribute("data-web25-owned", "1");
      section.appendChild(button);
    }

    const label = kind === "happenings" ? "关闭“有什么新鲜事”" : "关闭“推荐关注”";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.textContent = "×";

    const stopInteraction = function (event) {
      event.preventDefault();
      event.stopPropagation();
    };

    button.onpointerdown = stopInteraction;
    button.onclick = function (event) {
      stopInteraction(event);
      dismissSidebarModule(kind);
    };
  }

  function scanSidebarModules() {
    ensureSidebarDismissedStateLoaded();
    const modules = collectSidebarModules();
    root.dataset.web25SidebarModules = String(modules.length);
    root.dataset.web25SidebarHidden = String(state.dismissedSidebarModules.size);

    modules.forEach(function (entry) {
      ensureSidebarCloseButton(entry.section, entry.kind);
      applySidebarModuleDismissed(entry.section, state.dismissedSidebarModules.has(entry.kind));
    });
  }

  function clearSidebarModuleUi() {
    Array.from(document.querySelectorAll("[data-web25-sidebar-hidden='1']")).forEach(function (node) {
      node.removeAttribute("data-web25-sidebar-hidden");
    });

    Array.from(document.querySelectorAll(".web25-sidebar-close")).forEach(function (node) {
      node.remove();
    });

    Array.from(document.querySelectorAll("[data-web25-sidebar-module]")).forEach(function (node) {
      node.classList.remove("web25-sidebar-module");
      node.removeAttribute("data-web25-sidebar-module");
    });
  }

  function containsSidebarNode(node) {
    if (!node || node.nodeType !== 1) {
      return false;
    }

    if (node.matches && node.matches('[data-testid="sidebarColumn"], [data-testid="sidebarColumn"] *')) {
      return true;
    }

    if (node.closest && node.closest('[data-testid="sidebarColumn"]')) {
      return true;
    }

    return Boolean(node.querySelector && node.querySelector('[data-testid="sidebarColumn"]'));
  }

  function getArticleCell(article) {
    return article && article.closest ? (article.closest('[data-testid="cellInnerDiv"]') || article) : article;
  }

  function getArticleStatusId(article) {
    if (!article) {
      return "";
    }

    const timeLink = article.querySelector('a[href*="/status/"] time');
    if (timeLink) {
      const link = timeLink.closest("a");
      const statusId = extractStatusId(link && link.getAttribute("href"));
      if (statusId) {
        return statusId;
      }
    }

    const fallbackLink = Array.from(article.querySelectorAll('a[href*="/status/"]'))
      .map(function (node) {
        return node.getAttribute("href") || "";
      })
      .find(function (href) {
        return /\/status\/\d+/.test(href);
      });
    return extractStatusId(fallbackLink);
  }

  function getArticleUrl(article) {
    if (!article) {
      return "";
    }

    const timeLink = article.querySelector('a[href*="/status/"] time');
    if (timeLink) {
      const link = timeLink.closest("a");
      const href = String(link && link.getAttribute("href") || "").trim();
      if (href) {
        return href.startsWith("http") ? href : "https://x.com" + href;
      }
    }

    const fallbackLink = Array.from(article.querySelectorAll('a[href*="/status/"]'))
      .map(function (node) {
        return String(node.getAttribute("href") || "").trim();
      })
      .find(function (href) {
        return /\/status\/\d+/.test(href);
      });

    if (!fallbackLink) {
      return "";
    }

    return fallbackLink.startsWith("http") ? fallbackLink : "https://x.com" + fallbackLink;
  }

  function getOfficialAdLabel(article) {
    if (!article) {
      return "";
    }

    const exactLabel = Array.from(article.querySelectorAll("span, div, a"))
      .map(function (node) {
        return String(node.innerText || node.textContent || "").trim();
      })
      .find(function (text) {
        return OFFICIAL_AD_LABELS.includes(text);
      });

    if (exactLabel) {
      return exactLabel;
    }

    const adLinkHit = Array.from(article.querySelectorAll("a[href]")).some(function (node) {
      const href = String(node.getAttribute("href") || "").trim();
      return OFFICIAL_AD_LINK_PATTERNS.some(function (pattern) {
        return pattern.test(href);
      });
    });

    return adLinkHit ? "广告" : "";
  }

  function getOfficialAdSnapshot(article) {
    const label = getOfficialAdLabel(article);
    if (!label) {
      return null;
    }

    const authorMeta = getReplyAuthorMeta(article);
    const text = getTweetText(article);
    const normalizedText = window.Web25Rules && typeof window.Web25Rules.normalizeText === "function"
      ? window.Web25Rules.normalizeText(text)
      : String(text || "").replace(/\s+/g, " ").trim();
    const statusId = getArticleStatusId(article);
    const url = getArticleUrl(article);

    return {
      label: label,
      displayName: authorMeta.displayName,
      handle: authorMeta.handle,
      text: text,
      normalizedText: normalizedText,
      statusId: statusId,
      url: url
    };
  }

  function buildAdHideSyncKey(scope, snapshot) {
    const normalizedScope = scope === "reply" ? "reply" : "home";
    if (!snapshot) {
      return "";
    }

    if (snapshot.statusId) {
      return "ad:" + normalizedScope + ":status:" + snapshot.statusId;
    }

    if (snapshot.handle && snapshot.normalizedText) {
      return "ad:" + normalizedScope + ":text:" + snapshot.handle.toLowerCase() + ":" + snapshot.normalizedText;
    }

    if (snapshot.normalizedText) {
      return "ad:" + normalizedScope + ":text:" + snapshot.normalizedText;
    }

    return "";
  }

  function rememberAdHideSyncKey(syncKey) {
    if (!syncKey) {
      return;
    }

    state.adHidePendingKeys.delete(syncKey);
    if (state.adHideSyncedKeys.has(syncKey)) {
      return;
    }

    state.adHideSyncedKeys.add(syncKey);
  }

  function rememberPendingAdHideSyncKey(syncKey) {
    if (!syncKey || state.adHideSyncedKeys.has(syncKey)) {
      return;
    }

    state.adHidePendingKeys.add(syncKey);
  }

  function clearPendingAdHideSyncKey(syncKey) {
    if (!syncKey) {
      return;
    }

    state.adHidePendingKeys.delete(syncKey);
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

  function requestBackendJson(method, endpoint, payload, callback, withCredentials) {
    if (api.runtime && typeof api.runtime.sendMessage === "function") {
      api.runtime.sendMessage({
        type: "web25-http-request",
        endpoint: endpoint,
        method: method,
        payload: payload || {},
        credentials: withCredentials ? "include" : "omit"
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
      credentials: withCredentials ? "include" : "omit",
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

  function attemptAutoBindSyncKey(force) {
    if (state.destroyed || !state.backendBaseUrl || !state.syncKey) {
      return;
    }

    const now = Date.now();
    const syncSignature = `${state.backendBaseUrl}|${state.syncKey}`;
    if (!force && state.accountBindingInFlight) {
      return;
    }
    if (!force && state.lastAccountBindSignature === syncSignature && now - state.lastAccountBindAttemptAt < 10 * 60 * 1000) {
      return;
    }

    state.accountBindingInFlight = true;
    state.lastAccountBindAttemptAt = now;
    state.lastAccountBindSignature = syncSignature;

    requestBackendJson("GET", state.backendBaseUrl + "/api/me", null, function (payload) {
      if (!payload || !payload.ok || !payload.loggedIn || !payload.viewer || !payload.viewer.email) {
        state.accountBindingInFlight = false;
        return;
      }

      const viewerSignature = `${syncSignature}|${String(payload.viewer.email || "").trim().toLowerCase()}`;
      if (!force && state.lastSuccessfulAccountBindSignature === viewerSignature && Date.now() - state.lastSuccessfulAccountBindAt < 6 * 60 * 60 * 1000) {
        state.accountBindingInFlight = false;
        return;
      }

      requestBackendJson(
        "POST",
        state.backendBaseUrl + "/api/account/bind-sync-key",
        { syncKey: state.syncKey },
        function (bindPayload) {
          state.accountBindingInFlight = false;
          if (!bindPayload || !bindPayload.ok) {
            return;
          }
          state.lastSuccessfulAccountBindSignature = viewerSignature;
          state.lastSuccessfulAccountBindAt = Date.now();
        },
        true
      );
    }, true);
  }

  function syncRemoteManualState(force, callback) {
    if (state.destroyed) {
      if (typeof callback === "function") {
        callback(false);
      }
      return;
    }

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

      if (state.destroyed) {
        if (typeof callback === "function") {
          callback(false);
        }
        return;
      }

      if (!payload || !payload.ok) {
        if (typeof callback === "function") {
          callback(false);
        }
        return;
      }

      const remoteHideTexts = Array.isArray(payload.manualHideKeys) ? payload.manualHideKeys : [];
      const remoteAllowTexts = Array.isArray(payload.manualAllowKeys) ? payload.manualAllowKeys : [];
      const remoteTemplateRules = Array.isArray(payload.templateRules) ? payload.templateRules : [];
      const remoteRepeatSuspiciousHandles = Array.isArray(payload.repeatSuspiciousHandles) ? payload.repeatSuspiciousHandles : [];
      state.globalTemplateRules = new Set(remoteTemplateRules);
      state.repeatSuspiciousHandles = new Set(remoteRepeatSuspiciousHandles);
      applyResolvedManualState(remoteHideTexts, remoteAllowTexts, function () {
        scheduleScanWithDelay(FAST_SCAN_DELAY_MS);
        if (typeof callback === "function") {
          callback(true);
        }
      });
    });
  }

  function readSetting(callback) {
    const localState = readLocalManualState();
    readIndexedManualState(function (indexedState) {
      if (state.destroyed) {
        return;
      }

      api.storage.local.get(storageDefaults, function (result) {
        if (state.destroyed) {
          return;
        }

        ensureSyncIdentity(result, function (resolvedResult) {
          if (state.destroyed) {
            return;
          }

          state.enabled = Boolean(resolvedResult.enabled);
          state.markingEnabled = Boolean(resolvedResult.markingEnabled);
          state.backendBaseUrl = normalizeBackendBaseUrl(resolvedResult.backendBaseUrl || storageDefaults.backendBaseUrl);
          state.syncKey = String(resolvedResult.syncKey || "").trim();
          state.deviceId = String(resolvedResult.deviceId || "").trim();
          state.autoHideSyncedKeys = new Set(resolvedResult.autoHideSyncedKeys || []);
          state.adHideSyncedKeys = new Set();
          state.adHidePendingKeys = new Set();
          state.globalTemplateRules = new Set();
          state.repeatSuspiciousHandles = new Set();
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
              attemptAutoBindSyncKey(false);
              callback();
            });
          });
        });
      });
    });
  }

  function watchSettingChanges() {
    if (!api.storage || !api.storage.onChanged || state.storageChangeListener) {
      return;
    }

    state.storageChangeListener = function (changes, areaName) {
      if (state.destroyed) {
        return;
      }

      if (areaName !== "local") {
        return;
      }

      const hasManualChanges = Boolean(changes.manualHideTexts || changes.manualAllowTexts);
      const changedKeys = Object.keys(changes);
      const hasOnlySyncDedupeKeys = changedKeys.length > 0 && changedKeys.every(function (key) {
        return key === "autoHideSyncedKeys";
      });

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

      if (hasOnlySyncDedupeKeys) {
        return;
      }

      scanPage();
    };

    api.storage.onChanged.addListener(state.storageChangeListener);
  }

  function scheduleScan() {
    scheduleScanWithDelay(NORMAL_SCAN_DELAY_MS);
  }

  function scheduleScanWithDelay(delayMs) {
    if (state.destroyed || state.suppressObserver) {
      return;
    }

    clearTimeout(state.scanTimer);
    state.scanTimer = setTimeout(scanPage, typeof delayMs === "number" ? delayMs : NORMAL_SCAN_DELAY_MS);
  }

  function scheduleManualRescan(delayMs) {
    if (state.destroyed) {
      return;
    }

    clearTimeout(state.manualRescanTimer);
    state.manualRescanTimer = setTimeout(function () {
      if (state.destroyed) {
        return;
      }
      state.manualRescanTimer = null;
      scanPage();
    }, typeof delayMs === "number" ? delayMs : 120);
  }

  function scheduleManualPersist(delayMs) {
    if (state.destroyed) {
      return;
    }

    clearTimeout(state.manualPersistTimer);
    state.manualPersistTimer = setTimeout(function () {
      if (state.destroyed) {
        return;
      }
      state.manualPersistTimer = null;
      persistManualState();
    }, typeof delayMs === "number" ? delayMs : 180);
  }

  function suppressObserverBriefly() {
    if (state.destroyed) {
      return;
    }

    state.suppressObserver = true;
    setTimeout(function () {
      if (state.destroyed) {
        return;
      }
      state.suppressObserver = false;
    }, 120);
  }

  function queueStabilizationScans(delays) {
    if (state.destroyed) {
      return;
    }

    state.stabilizeTimers.forEach(function (timerId) {
      clearTimeout(timerId);
    });
    state.stabilizeTimers = [];

    (delays || []).forEach(function (delayMs) {
      const timerId = setTimeout(function () {
        if (state.destroyed) {
          return;
        }
        scanPage();
      }, delayMs);
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

  function containsBottomUiNode(node) {
    if (!node || node.nodeType !== 1) {
      return false;
    }

    if (node.matches && node.matches(".web25-bottom-host, .web25-hidden-summary, .web25-revealed-list")) {
      return true;
    }

    return Boolean(node.querySelector && node.querySelector(".web25-bottom-host, .web25-hidden-summary, .web25-revealed-list"));
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

    if (handleNode) {
      return "account:" + handleNode.toLowerCase();
    }

    const authorMeta = getReplyAuthorMeta(replyArticle);
    return authorMeta.handle ? "account:" + authorMeta.handle.toLowerCase() : "";
  }

  function collectInlineTextParts(node, parts) {
    if (!node) {
      return;
    }

    if (node.nodeType === 3) {
      const text = String(node.textContent || "").replace(/\s+/g, " ").trim();
      if (text) {
        parts.push(text);
      }
      return;
    }

    if (node.nodeType !== 1) {
      return;
    }

    if (node.tagName === "IMG") {
      const alt = String(node.getAttribute("alt") || "").trim();
      if (alt) {
        parts.push(alt);
      }
      return;
    }

    Array.from(node.childNodes).forEach(function (child) {
      collectInlineTextParts(child, parts);
    });
  }

  function isUserNameMetaText(text) {
    const value = String(text || "").trim();
    if (!value) {
      return true;
    }

    if (value === "·" || value === "•") {
      return true;
    }

    if (/^\d+[smhdwy]$/i.test(value.toLowerCase())) {
      return true;
    }

    return /^\d+\s*(秒|分钟|分|小时|天|周|月|年)$/.test(value);
  }

  function joinDisplayNameParts(parts) {
    return (Array.isArray(parts) ? parts : []).reduce(function (result, part) {
      const value = String(part || "").trim();
      if (!value) {
        return result;
      }

      if (!result) {
        return value;
      }

      if (/[A-Za-z0-9]$/.test(result) && /^[A-Za-z0-9]/.test(value)) {
        return result + " " + value;
      }

      return result + value;
    }, "");
  }

  function buildCompactTextKey(normalized, compactOverride) {
    const compactSource = String(compactOverride || "").trim();
    if (compactSource) {
      return compactSource.length >= 4 ? "compact:" + compactSource : "";
    }

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

  function buildPatternTextKey(normalized, analysis, authorMeta) {
    if (!normalized) {
      return "";
    }

    const displayNameRisk = Boolean(
      authorMeta
      && window.Web25Rules
      && typeof window.Web25Rules.buildDisplayNameRiskKey === "function"
      && window.Web25Rules.buildDisplayNameRiskKey(authorMeta.displayName || "")
    );
    const suspiciousHandle = Boolean(
      authorMeta
      && window.Web25Rules
      && typeof window.Web25Rules.handleLooksSuspicious === "function"
      && window.Web25Rules.handleLooksSuspicious(authorMeta.handle || "")
    );

    if (analysis && analysis.hasGeoMeetupBait) {
      return "pattern:geo-meetup-bait";
    }

    if (analysis && analysis.hasBaitQuestionShape) {
      return "pattern:bait-question-shape";
    }

    if (analysis && analysis.hasLowInformationBadge && displayNameRisk && suspiciousHandle) {
      return "pattern:low-information-lure-account";
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
    const analysis = window.Web25Rules && typeof window.Web25Rules.analyzeReplyText === "function"
      ? window.Web25Rules.analyzeReplyText(replyText)
      : null;
    const authorMeta = getReplyAuthorMeta(replyArticle);
    const normalized = analysis && analysis.normalized
      ? analysis.normalized
      : window.Web25Rules.normalizeText(replyText);
    const textKey = normalized ? "text:" + normalized : "";
    const statusKey = getReplyStatusKey(replyArticle);
    const accountKey = getReplyAccountKey(replyArticle);
    const displayNameKey = window.Web25Rules && typeof window.Web25Rules.buildDisplayNameRiskKey === "function"
      ? window.Web25Rules.buildDisplayNameRiskKey(authorMeta.displayName || "")
      : (window.Web25Rules && typeof window.Web25Rules.buildHighRiskDisplayNameKey === "function"
        ? window.Web25Rules.buildHighRiskDisplayNameKey(authorMeta.displayName || "")
        : "");
    const compactTextKey = buildCompactTextKey(normalized, analysis && analysis.compact ? analysis.compact : "");
    const patternTextKey = buildPatternTextKey(normalized, analysis, authorMeta);
    const templateKeys = analysis && analysis.templateKey ? [analysis.templateKey] : [];
    return {
      normalized: normalized,
      textKey: textKey,
      statusKey: statusKey,
      accountKey: accountKey,
      displayNameKey: displayNameKey,
      compactTextKey: compactTextKey,
      patternTextKey: patternTextKey,
      templateKeys: templateKeys,
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
      displayNameKey: keys.displayNameKey || "",
      compactTextKey: keys.compactTextKey || "",
      patternTextKey: keys.patternTextKey || "",
      templateKeys: Array.isArray(keys.templateKeys) ? keys.templateKeys.slice() : [],
      primaryKey: keys.primaryKey || ""
    };
  }

  function hasTemplateRuleMatch(set, keys) {
    if (!set || !keys || !Array.isArray(keys.templateKeys) || !keys.templateKeys.length) {
      return false;
    }

    return keys.templateKeys.some(function (templateKey) {
      return Boolean(templateKey) && set.has(templateKey);
    });
  }

  function hasDecisionKey(set, keys) {
    if (!set || !keys) {
      return false;
    }

    return Boolean(
      (keys.primaryKey && set.has(keys.primaryKey)) ||
      (keys.statusKey && set.has(keys.statusKey)) ||
      (keys.accountKey && set.has(keys.accountKey)) ||
      (keys.displayNameKey && set.has(keys.displayNameKey)) ||
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

    if (keys.displayNameKey) {
      set.add(keys.displayNameKey);
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

    if (keys.displayNameKey) {
      set.delete(keys.displayNameKey);
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
      const storedKeys = getStoredManualKeys(
        manualKeys,
        isProtectedAccount(article, getReplyAuthorMeta(article)),
        replyText
      );

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

  function shouldBypassProtectedManualGuard(replyText, manualKeys) {
    if (manualKeys && manualKeys.displayNameKey) {
      return true;
    }

    return Boolean(
      window.Web25Rules
      && typeof window.Web25Rules.looksLikeShareLinkScam === "function"
      && window.Web25Rules.looksLikeShareLinkScam(replyText || "")
    );
  }

  function getStoredManualKeys(manualKeys, protectedAccount, replyText) {
    if (!protectedAccount || shouldBypassProtectedManualGuard(replyText, manualKeys)) {
      return manualKeys;
    }

    return {
      normalized: manualKeys.normalized || "",
      textKey: "",
      statusKey: manualKeys.statusKey || "",
      accountKey: "",
      displayNameKey: "",
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

    clearSidebarModuleUi();
  }

  function removeAllAdHiding() {
    Array.from(document.querySelectorAll("[data-web25-ad-hidden='1']")).forEach(function (node) {
      node.style.display = "";
      node.removeAttribute("data-web25-ad-hidden");
    });

    Array.from(document.querySelectorAll("[data-web25-ad-cell='1']")).forEach(function (node) {
      node.removeAttribute("data-web25-ad-cell");
    });
    root.dataset.web25Ads = "0";
    root.dataset.web25HomeAds = "0";
    root.dataset.web25ReplyAds = "0";
  }

  function applyAdArticleVisibility(article, hidden) {
    const articleCell = getArticleCell(article);
    if (!articleCell) {
      return;
    }

    if (hidden) {
      articleCell.setAttribute("data-web25-ad-cell", "1");
      articleCell.setAttribute("data-web25-ad-hidden", "1");
      articleCell.style.display = "none";
      return;
    }

    articleCell.style.display = "";
    articleCell.removeAttribute("data-web25-ad-hidden");
    articleCell.removeAttribute("data-web25-ad-cell");
  }

  function getCurrentThreadStatusId() {
    return extractStatusId(location.pathname) || extractStatusId(location.href);
  }

  function buildAdSyncPayload(scope, snapshot) {
    const normalizedScope = scope === "reply" ? "reply" : "home";
    return {
      syncKey: state.syncKey,
      deviceId: state.deviceId,
      source: "extension",
      eventType: normalizedScope === "reply" ? "ad_reply_hide" : "ad_home_hide",
      threadUrl: normalizedScope === "reply" ? location.href : (snapshot.url || location.href),
      threadStatusId: normalizedScope === "reply" ? getCurrentThreadStatusId() : (snapshot.statusId || ""),
      replyStatusId: normalizedScope === "reply" ? (snapshot.statusId || "") : "",
      replyHandle: snapshot.handle || "",
      replyDisplayName: snapshot.displayName || "",
      replyText: String(snapshot.text || "").slice(0, 240),
      normalizedText: String(snapshot.normalizedText || "").slice(0, 240),
      compactText: ""
    };
  }

  function postAdHideEvent(scope, snapshot) {
    const adHideSyncKey = buildAdHideSyncKey(scope, snapshot);
    if (!adHideSyncKey || state.adHideSyncedKeys.has(adHideSyncKey) || state.adHidePendingKeys.has(adHideSyncKey)) {
      return;
    }

    if (!state.backendBaseUrl || !state.syncKey || !snapshot || !api.runtime || typeof api.runtime.sendMessage !== "function") {
      root.dataset.web25AdSync = "fail";
      root.dataset.web25AdSyncDetail = "missing-sync-config";
      return;
    }

    rememberPendingAdHideSyncKey(adHideSyncKey);
    root.dataset.web25AdSync = "pending";
    root.dataset.web25AdSyncDetail = scope === "reply" ? "reply" : "home";

    api.runtime.sendMessage({
      type: "web25-sync-ad-event",
      endpoint: state.backendBaseUrl + "/api/events",
      eventType: scope === "reply" ? "ad_reply_hide" : "ad_home_hide",
      dedupeKey: adHideSyncKey,
      payload: buildAdSyncPayload(scope, snapshot)
    }, function (response) {
      if (api.runtime && api.runtime.lastError) {
        clearPendingAdHideSyncKey(adHideSyncKey);
        root.dataset.web25AdSync = "fail";
        root.dataset.web25AdSyncDetail = "runtime-error";
        return;
      }

      if (!response || !response.ok) {
        clearPendingAdHideSyncKey(adHideSyncKey);
        root.dataset.web25AdSync = "fail";
        root.dataset.web25AdSyncDetail = response && response.error ? String(response.error) : "queue-error";
        return;
      }

      if (response.synced) {
        rememberAdHideSyncKey(adHideSyncKey);
        root.dataset.web25AdSync = "ok";
        root.dataset.web25AdSyncDetail = response.detail || "synced";
        return;
      }

      root.dataset.web25AdSync = "queued";
      root.dataset.web25AdSyncDetail = response.detail || "queued";
    });
  }

  function scanThreadReplyAds(replyArticles) {
    const visibleReplies = [];
    let hiddenAds = 0;

    (Array.isArray(replyArticles) ? replyArticles : []).forEach(function (article) {
      const snapshot = getOfficialAdSnapshot(article);
      if (!snapshot) {
        applyAdArticleVisibility(article, false);
        visibleReplies.push(article);
        return;
      }

      hiddenAds += 1;
      applyAdArticleVisibility(article, true);
      postAdHideEvent("reply", snapshot);
    });

    root.dataset.web25ReplyAds = String(hiddenAds);
    return visibleReplies;
  }

  function scanHomeTimelineAds() {
    root.dataset.web25Stage = "ads:start";

    if (!state.enabled || !isHomeTimelinePage()) {
      removeAllAdHiding();
      root.dataset.web25Stage = "ads:inactive";
      return;
    }

    const articles = getArticles();
    root.dataset.web25Articles = String(articles.length);

    let hiddenAds = 0;
    articles.forEach(function (article) {
      const snapshot = getOfficialAdSnapshot(article);
      if (!snapshot) {
        applyAdArticleVisibility(article, false);
        return;
      }

      applyAdArticleVisibility(article, true);
      hiddenAds += 1;

      postAdHideEvent("home", snapshot);
    });

    root.dataset.web25Ads = String(hiddenAds);
    root.dataset.web25HomeAds = String(hiddenAds);
    root.dataset.web25Stage = "ads:done";
  }

  function removeDuplicateOwnedNodes(selector, keepNode) {
    Array.from(document.querySelectorAll(selector)).forEach(function (node) {
      if (keepNode && node === keepNode) {
        return;
      }
      node.remove();
    });
  }

  function syncBottomStateFromHost(host) {
    state.bottomHostEl = host || null;
    if (!host) {
      state.summaryEl = null;
      state.revealedListEl = null;
      state.revealedListItemsEl = null;
      return;
    }

    const summaries = Array.from(host.children).filter(function (child) {
      return child.classList && child.classList.contains("web25-hidden-summary");
    });
    const lists = Array.from(host.children).filter(function (child) {
      return child.classList && child.classList.contains("web25-revealed-list");
    });

    const summaryToKeep = summaries[0] || null;
    summaries.slice(1).forEach(function (node) {
      node.remove();
    });

    let listToKeep = null;
    if (lists.length > 0) {
      listToKeep = lists.reduce(function (best, node) {
        if (!best) {
          return node;
        }

        const bestCards = best.querySelectorAll(".web25-bottom-card").length;
        const nodeCards = node.querySelectorAll(".web25-bottom-card").length;
        if (nodeCards > bestCards) {
          return node;
        }

        if (nodeCards === bestCards && node.classList.contains("web25-revealed-list-compact") !== best.classList.contains("web25-revealed-list-compact")) {
          return node.classList.contains("web25-revealed-list-compact") ? best : node;
        }

        return best;
      }, null);
      lists.forEach(function (node) {
        if (node !== listToKeep) {
          node.remove();
        }
      });
    }

    if (summaryToKeep && host.firstElementChild !== summaryToKeep) {
      host.insertBefore(summaryToKeep, host.firstChild);
    }

    if (listToKeep && host.lastElementChild !== listToKeep) {
      host.appendChild(listToKeep);
    }

    state.summaryEl = summaryToKeep;
    state.revealedListEl = listToKeep;
    state.revealedListItemsEl = listToKeep ? listToKeep.querySelector(".web25-revealed-list-items") : null;
  }

  function dedupeBottomUi() {
    const hosts = Array.from(document.querySelectorAll(".web25-bottom-host"));
    if (hosts.length === 0) {
      Array.from(document.querySelectorAll(".web25-hidden-summary, .web25-revealed-list")).forEach(function (node) {
        node.remove();
      });
      syncBottomStateFromHost(null);
      return;
    }

    const keeper = hosts.reduce(function (best, node) {
      if (!best) {
        return node;
      }

      const bestCards = best.querySelectorAll(".web25-bottom-card").length;
      const nodeCards = node.querySelectorAll(".web25-bottom-card").length;
      const bestOpen = best.classList.contains("web25-bottom-host-open") ? 1 : 0;
      const nodeOpen = node.classList.contains("web25-bottom-host-open") ? 1 : 0;

      if (nodeCards !== bestCards) {
        return nodeCards > bestCards ? node : best;
      }

      if (nodeOpen !== bestOpen) {
        return nodeOpen > bestOpen ? node : best;
      }

      return node;
    }, null);

    hosts.forEach(function (node) {
      if (node !== keeper) {
        node.remove();
      }
    });

    Array.from(document.querySelectorAll(".web25-hidden-summary, .web25-revealed-list")).forEach(function (node) {
      if (!keeper.contains(node)) {
        node.remove();
      }
    });

    syncBottomStateFromHost(keeper);
  }

  function scheduleBottomUiDedupe() {
    clearTimeout(state.bottomUiDedupeTimer);
    state.bottomUiDedupeTimer = setTimeout(function () {
      state.bottomUiDedupeTimer = null;
      if (state.destroyed) {
        return;
      }

      dedupeBottomUi();
    }, 0);
  }

  function pruneDuplicateBottomUi() {
    if (state.bottomHostEl && !document.contains(state.bottomHostEl)) {
      state.bottomHostEl = null;
    }
    if (state.summaryEl && !document.contains(state.summaryEl)) {
      state.summaryEl = null;
    }
    if (state.revealedListEl && !document.contains(state.revealedListEl)) {
      state.revealedListEl = null;
      state.revealedListItemsEl = null;
    }

    removeDuplicateOwnedNodes(".web25-bottom-host", state.bottomHostEl);
    removeDuplicateOwnedNodes(".web25-hidden-summary", state.summaryEl);
    removeDuplicateOwnedNodes(".web25-revealed-list", state.revealedListEl);
    dedupeBottomUi();
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
    pruneDuplicateBottomUi();

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
    const hasSummary = Boolean(state.summaryEl && document.contains(state.summaryEl));
    const shouldShow = totalHidden > 0 || hasSummary;
    host.classList.toggle("web25-bottom-host-hidden", !shouldShow);
    if (totalHidden <= 0) {
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
    pruneDuplicateBottomUi();

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

    if (totalCount === 0) {
      title.textContent = "无下沉";
      meta.textContent = buildSummaryText(counts.auto, counts.history, counts.manual, counts.scanned || 0);
      toggleButton.textContent = "查看列表";
      toggleButton.disabled = true;
      toggleButton.classList.add("web25-hidden-summary-toggle-disabled");
      toggleButton.setAttribute("aria-disabled", "true");
    } else {
      title.textContent = "web2.5 已整理 " + totalCount + " 条回复";
      meta.textContent = buildSummaryText(counts.auto, counts.history, counts.manual, counts.scanned || 0);
      toggleButton.textContent = state.bottomTrayOpen ? "收起列表" : "查看列表";
      toggleButton.disabled = false;
      toggleButton.classList.remove("web25-hidden-summary-toggle-disabled");
      toggleButton.removeAttribute("aria-disabled");
    }

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
    pruneDuplicateBottomUi();

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

    if (isDetailPage()) {
      const adSnapshot = getOfficialAdSnapshot(replyArticle);
      if (adSnapshot) {
        applyAdArticleVisibility(replyArticle, true);
        postAdHideEvent("reply", adSnapshot);
        return;
      }
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
    const storedKeys = getStoredManualKeys(keys, protectedAccount, replyText);

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

    const userNameNode = replyArticle.querySelector('[data-testid="User-Name"]');
    const parts = [];
    collectInlineTextParts(userNameNode, parts);

    const normalizedParts = parts.filter(Boolean);
    const handleIndex = normalizedParts.findIndex(function (text) {
      return text.startsWith("@");
    });
    const handle = handleIndex === -1 ? "" : normalizedParts[handleIndex];
    const displayParts = (handleIndex === -1 ? normalizedParts : normalizedParts.slice(0, handleIndex))
      .filter(function (text) {
        return !isUserNameMetaText(text);
      });
    const displayName = joinDisplayNameParts(displayParts) || "X 用户";

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
        || (keys.accountKey && candidateKeys.accountKey === keys.accountKey)
        || (keys.displayNameKey && candidateKeys.displayNameKey === keys.displayNameKey)) {
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
    if (state.destroyed) {
      return;
    }

    root.dataset.web25LastScan = String(Date.now());
    root.dataset.web25Detail = isDetailPage() ? "1" : "0";
    root.dataset.web25Home = isHomeTimelinePage() ? "1" : "0";
    root.dataset.web25MarkingEnabled = state.markingEnabled ? "1" : "0";
    root.dataset.web25Stage = "scan:start";
    delete root.dataset.web25Error;

    if (location.href !== state.currentUrl) {
      state.currentUrl = location.href;
    }

    if (!state.enabled) {
      root.dataset.web25Stage = "scan:inactive";
      removeAllHiding();
      removeAllAdHiding();
      return;
    }

    if (isHomeTimelinePage()) {
      removeAllHiding();
      scanSidebarModules();
      scanHomeTimelineAds();
      return;
    }

    removeAllAdHiding();

    if (!isDetailPage()) {
      root.dataset.web25Stage = "scan:inactive";
      removeAllHiding();
      scanSidebarModules();
      return;
    }

    setScrollAnchoringDisabled(true);
    scanSidebarModules();

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
      const replies = scanThreadReplyAds(articles.slice(1));
      let lastReplyCell = null;
      root.dataset.web25Replies = String(replies.length);
      root.dataset.web25Stage = "scan:replies-ready";
      const mainText = getTweetText(mainArticle);
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
        const storedManualKeys = getStoredManualKeys(manualKeys, protectedAccount, replyText);
        const templateRuleMatched = hasTemplateRuleMatch(state.globalTemplateRules, manualKeys);
        const repeatSuspiciousHandle = Boolean(
          manualKeys.accountKey
          && state.repeatSuspiciousHandles.has(manualKeys.accountKey)
        );
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
            displayName: authorMeta.displayName,
            isRepeatSuspiciousHandle: repeatSuspiciousHandle,
            templateRuleMatched: templateRuleMatched
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

        return {
          replyArticle: replyArticle,
          replyCell: replyCell,
          replyText: replyText,
          manualKeys: manualKeys,
          storedManualKeys: storedManualKeys,
          authorMeta: authorMeta,
          protectedAccount: protectedAccount,
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
        let decision = entry.decision;
        let hiddenSource = entry.hiddenSource;
        const isManuallyHidden = entry.isManuallyHidden;

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
        manual: manualHiddenCount,
        scanned: replies.length
      };

      root.dataset.web25ReplyCells = String(document.querySelectorAll("[data-web25-reply-cell='1']").length);
      root.dataset.web25ManualButtons = String(document.querySelectorAll(".web25-action-hide").length);

      removeDock();
      root.dataset.web25Stage = "scan:summary-ready";

      if (hiddenCount === 0) {
        ensureBottomHost(lastReplyCell || getReplyCell(mainArticle));
        if (state.revealedListEl) {
          state.revealedListEl.remove();
          state.revealedListEl = null;
        }
        state.revealedListItemsEl = null;
        state.revealedSignature = "";
        ensureSummary(counts);
        syncBottomHostVisibility(0);
        dedupeBottomUi();
        scheduleBottomUiDedupe();
        root.dataset.web25Stage = "scan:done";
        return;
      }

      ensureBottomHost(lastReplyCell);
      ensureSummary(counts);
      if (revealedReplies.length > 0) {
        ensureRevealedList(counts);
        updateBottomCards(revealedReplies);
      }
      syncBottomHostVisibility(hiddenCount);
      dedupeBottomUi();
      scheduleBottomUiDedupe();
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
    if (state.destroyed || state.bootStarted) {
      return;
    }

    state.bootStarted = true;
    if (isDetailPage()) {
      quarantineExistingReplies();
    }
    readSetting(function () {
      if (state.destroyed) {
        return;
      }

      watchSettingChanges();
      if (api.runtime && api.runtime.onMessage) {
        if (!state.runtimeMessageListener) {
          state.runtimeMessageListener = function (message) {
            if (state.destroyed || !message) {
              return;
            }

            if (message.type === "web25-admin" && message.command === "clear-manual") {
              clearManualDecisions();
              return;
            }

            if (message.type === "web25-ad-sync-result") {
              const dedupeKey = String(message.dedupeKey || "").trim();
              if (!dedupeKey) {
                return;
              }

              if (message.ok) {
                rememberAdHideSyncKey(dedupeKey);
                root.dataset.web25AdSync = "ok";
                root.dataset.web25AdSyncDetail = String(message.detail || "synced");
                return;
              }

              clearPendingAdHideSyncKey(dedupeKey);
              root.dataset.web25AdSync = "fail";
              root.dataset.web25AdSyncDetail = String(message.detail || "sync-failed");
            }
          };
          api.runtime.onMessage.addListener(state.runtimeMessageListener);
        }
      }
      scanPage();
      if (state.destroyed || !document.body) {
        return;
      }

      state.observer = new MutationObserver(function (records) {
        if (state.destroyed) {
          return;
        }

        if (location.href !== state.currentUrl) {
          if (isDetailPage()) {
            quarantineExistingReplies();
          }
          scheduleScanWithDelay(FAST_SCAN_DELAY_MS);
          return;
        }

        let relevant = false;
        let duplicateBottomUiDetected = false;

        records.forEach(function (record) {
          if (containsBottomUiNode(record.target)) {
            duplicateBottomUiDetected = true;
            return;
          }

          if (containsSidebarNode(record.target)) {
            relevant = true;
          }

          if (isManagedNode(record.target)) {
            return;
          }

          Array.from(record.addedNodes || []).forEach(function (node) {
            if (!node || node.nodeType !== 1) {
              return;
            }

            if (containsBottomUiNode(node)) {
              duplicateBottomUiDetected = true;
              return;
            }

            if (containsSidebarNode(node)) {
              relevant = true;
            }

            if (isManagedNode(node)) {
              return;
            }

            if (node.matches && (node.matches('article[data-testid="tweet"]') || node.matches('[data-testid="cellInnerDiv"]'))) {
              relevant = true;
              if (isDetailPage()) {
                quarantineTree(node);
              }
              return;
            }

            if (Boolean(node.querySelector && node.querySelector('article[data-testid="tweet"], [data-testid="cellInnerDiv"]'))) {
              relevant = true;
              if (isDetailPage()) {
                quarantineTree(node);
              }
            }
          });
        });

        if (duplicateBottomUiDetected) {
          dedupeBottomUi();
          scheduleBottomUiDedupe();
        }

        if (relevant) {
          scheduleScanWithDelay(FAST_SCAN_DELAY_MS);
        }
      });
      state.observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      if (!state.popstateListener) {
        state.popstateListener = function () {
          if (state.destroyed) {
            return;
          }
          if (isDetailPage()) {
            quarantineExistingReplies();
          }
          scheduleScanWithDelay(FAST_SCAN_DELAY_MS);
        };
        window.addEventListener("popstate", state.popstateListener);
      }

      if (!state.focusListener) {
        state.focusListener = function () {
          if (state.destroyed) {
            return;
          }
          attemptAutoBindSyncKey(false);
          syncRemoteManualState(false, function (changed) {
            if (state.destroyed) {
              return;
            }
            if (changed) {
              scanPage();
            }
          });
        };
        window.addEventListener("focus", state.focusListener);
      }

      if (!state.visibilityListener) {
        state.visibilityListener = function () {
          if (state.destroyed) {
            return;
          }

          if (document.visibilityState !== "visible") {
            return;
          }

          attemptAutoBindSyncKey(false);
          syncRemoteManualState(false, function (changed) {
            if (state.destroyed) {
              return;
            }
            if (changed) {
              scanPage();
            }
          });
        };
        document.addEventListener("visibilitychange", state.visibilityListener);
      }

      state.booted = true;
    });
  }

  try {
    if (document.body) {
      boot();
    } else {
      state.domReadyListener = function startWhenReady() {
        if (state.destroyed || !document.body) {
          return;
        }
        document.removeEventListener("DOMContentLoaded", state.domReadyListener);
        state.domReadyListener = null;
        boot();
      };
      document.addEventListener("DOMContentLoaded", state.domReadyListener);
    }
  } catch (error) {
    root.dataset.web25Error = String(error && error.message ? error.message : error);
    destroyPageController("boot-error");
    throw error;
  }
})();
