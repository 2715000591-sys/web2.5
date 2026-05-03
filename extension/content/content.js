(function () {
  const BUILD_ID = "2026-05-03-1001";
  const MANUAL_RESET_VERSION = "2026-04-19-cleanup2";
  const MARKING_DEFAULT_VERSION = "2026-05-02-default-on";
  const AUTO_HIDE_ENABLED = true;
  const LIVE_MUTATION_SYNC_ENABLED = false;
  const PAGE_CONTROLLER_KEY = "__web25PageController__";
  const INSTANCE_ID = BUILD_ID + ":" + Date.now().toString(36) + ":" + Math.random().toString(36).slice(2, 8);
  const FAST_SCAN_DELAY_MS = 70;
  const NORMAL_SCAN_DELAY_MS = 180;
  const MIN_SCAN_INTERVAL_MS = 140;
  const SCROLL_IDLE_SCAN_DELAY_MS = 260;
  const REPLY_AI_BATCH_MAX_ITEMS = 8;
  const REPLY_AI_BATCH_FLUSH_DELAY_MS = 900;
  const REPLY_AI_MIN_BATCH_INTERVAL_MS = 1500;
  const REPLY_AI_BASE_SUSPICION_THRESHOLD = 2;
  const REPLY_AI_TEACHER_REVIEW_SCORE_THRESHOLD = 5;
  const REPLY_AI_FAILURE_RETRY_DELAY_MS = 45000;
  const REPLY_AI_SESSION_CACHE_LIMIT = 240;
  const REPLY_AI_SESSION_CACHE_PREFIX = "web25-reply-ai-cache-v1";
  const EXTENSION_STORAGE_TIMEOUT_MS = 1200;
  const INDEXED_DB_OPEN_TIMEOUT_MS = 1200;
  const ZERO_WIDTH_TEXT_PATTERN = /[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0]/g;
  const OFFICIAL_AD_LABEL_PATTERNS = [
    /^广告$/i,
    /^廣告$/i,
    /^推广$/i,
    /^推廣$/i,
    /^promoted$/i,
    /^promoted\s+post$/i,
    /^ad$/i,
    /^ads$/i,
    /^sponsored$/i,
    /^advertisement$/i
  ];
  const OFFICIAL_AD_HINT_PATTERNS = [
    /why\s+this\s+ad/i,
    /ads?\s+info/i,
    /promoted/i,
    /sponsored/i,
    /^ad$/i,
    /advertisement/i,
    /广告|廣告|推广|推廣/i
  ];
  const OFFICIAL_AD_LINK_PATTERNS = [
    /ad\.doubleclick\.net/i,
    /doubleclick/i,
    /\/i\/ads\//i,
    /business\.x\.com\/.*ads/i,
    /why-this-ad/i
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
      /^who to follow$/i
    ],
    suggested: [
      /^你可能会喜欢$/i,
      /^你可能會喜歡$/i,
      /^you might like$/i
    ],
    related: [
      /^相关用户$/i,
      /^相關用戶$/i,
      /^relevant people$/i
    ],
    premium: [
      /^订阅\s*premium$/i,
      /^訂閱\s*premium$/i,
      /^subscribe to premium$/i
    ],
    live: [
      /^x\s*上的直播$/i,
      /^live on x$/i
    ]
  };
  const SIDEBAR_LEGAL_PATTERNS = {
    terms: [
      /服务条款/i,
      /服務條款/i,
      /terms of service/i
    ],
    privacy: [
      /隐私政策/i,
      /隱私政策/i,
      /privacy policy/i
    ],
    cookie: [
      /cookie 政策/i,
      /cookie policy/i
    ],
    accessibility: [
      /辅助功能/i,
      /輔助功能/i,
      /accessibility/i
    ],
    ads: [
      /广告信息/i,
      /廣告資訊/i,
      /ads info/i,
      /ad info/i
    ],
    copyright: [
      /x corp/i,
      /©/i
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
  const USER_AGENT = navigator.userAgent || "";
  const IS_CHROMIUM_BROWSER = /\b(?:Chrome|Chromium|CriOS|Edg|EdgiOS)\//i.test(USER_AGENT);
  const IS_SAFARI_BROWSER = !IS_CHROMIUM_BROWSER && /\bSafari\//i.test(USER_AGENT);
  const PERSISTENT_MANUAL_TRAY_SUPPORTED = IS_CHROMIUM_BROWSER;
  const DEFAULT_PUBLIC_BACKEND_BASE_URL = "https://colorful-toilet.colorful-toilet.workers.dev";
  const LEGACY_BACKEND_BASE_URLS = new Set([
    "",
    "http://127.0.0.1:8787",
    "http://localhost:8787",
    "https://web25-public-pages.pages.dev",
    "https://web25-public.web25-boris.workers.dev",
    "https://colorful-toilet.web25-boris.workers.dev"
  ]);
  const api = typeof browser !== "undefined" ? browser : chrome;
  const root = document.documentElement;
  const storageDefaults = {
    enabled: true,
    markingEnabled: true,
    markingDefaultVersion: "",
    sidebarControlsEnabled: true,
    backendBaseUrl: DEFAULT_PUBLIC_BACKEND_BASE_URL,
    syncKey: "",
    deviceId: "",
    autoHideSyncedKeys: [],
    manualHideTexts: [],
    manualAllowTexts: [],
    manualResetVersion: ""
  };

  function getStorageLocal(defaults, callback) {
    let settled = false;
    const fallback = Object.assign({}, defaults || {});
    const finish = function (value, usedFallback) {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      if (usedFallback) {
        root.dataset.web25StorageFallback = "1";
      }
      callback(Object.assign({}, fallback, value || {}));
    };
    const timeoutId = setTimeout(function () {
      finish(fallback, true);
    }, EXTENSION_STORAGE_TIMEOUT_MS);

    try {
      api.storage.local.get(defaults, function (result) {
        if (api.runtime && api.runtime.lastError) {
          finish(fallback, true);
          return;
        }
        finish(result || fallback, false);
      });
    } catch (error) {
      finish(fallback, true);
    }
  }

  function setStorageLocal(patch, callback) {
    let settled = false;
    const finish = function () {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      if (typeof callback === "function") {
        callback();
      }
    };
    const timeoutId = setTimeout(finish, EXTENSION_STORAGE_TIMEOUT_MS);

    try {
      api.storage.local.set(patch || {}, finish);
    } catch (error) {
      finish();
    }
  }

  const state = {
    enabled: true,
    markingEnabled: true,
    sidebarControlsEnabled: true,
    backendBaseUrl: DEFAULT_PUBLIC_BACKEND_BASE_URL,
    syncKey: "",
    deviceId: "",
    observer: null,
    scanTimer: null,
    manualRescanTimer: null,
    manualPersistTimer: null,
    bottomUiDedupeTimer: null,
    stabilizeTimers: [],
    sidebarStabilizeTimers: [],
    currentUrl: location.href,
    lastScanFinishedAt: 0,
    scrollActivityUntil: 0,
    bottomHostEl: null,
    bottomTrayOpen: false,
    summaryEl: null,
    revealedListEl: null,
    revealedListItemsEl: null,
    revealedSignature: "",
    revealedListScrollTop: 0,
    revealedListInteractionUntil: 0,
    revealedListInteractionTimer: null,
    pendingRevealedListPayload: null,
    manualTrayThreadKey: "",
    manualTrayEntries: new Map(),
    dockEl: null,
    dismissedSidebarModules: new Set(),
    manualHideTexts: new Set(),
    manualAllowTexts: new Set(),
    globalTemplateRules: new Set(),
    globalReplyBlockedHandles: new Set(),
    replyAiSettingsUpdatedAt: "",
    repeatSuspiciousHandles: new Set(),
    replyAiEnabled: false,
    replyAiDecisionCache: new Map(),
    replyAiInFlightKeys: new Set(),
    replyAiQueuedKeys: new Set(),
    replyAiPendingQueue: [],
    replyAiBatchTimer: null,
    replyAiBatchInFlight: false,
    lastReplyAiBatchSentAt: 0,
    replyAiSessionCacheKey: "",
    profileSignalCache: new Map(),
    profileSignalInFlightKeys: new Set(),
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
    scrollListener: null,
    domReadyListener: null,
    sidebarDebugHooksInstalled: false,
    sidebarDebugDismissListener: null,
    sidebarDebugResetListener: null,
    bootStarted: false,
    booted: false,
    destroyed: false
  };

  function parseRgbColor(value) {
    const normalized = String(value || "").trim();
    const hexMatch = normalized.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
    if (hexMatch) {
      const hex = hexMatch[1];
      const expand = function (part) {
        return part.length === 1 ? part + part : part;
      };

      if (hex.length === 3 || hex.length === 4) {
        return {
          r: parseInt(expand(hex.slice(0, 1)), 16),
          g: parseInt(expand(hex.slice(1, 2)), 16),
          b: parseInt(expand(hex.slice(2, 3)), 16),
          a: hex.length === 4 ? parseInt(expand(hex.slice(3, 4)), 16) / 255 : 1
        };
      }

      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
      };
    }

    const match = normalized.match(/^rgba?\(([^)]+)\)$/i);
    if (!match) {
      return null;
    }

    const parts = match[1].split(",").map(function (part) {
      return parseFloat(part.trim());
    });

    if (parts.length < 3 || parts.slice(0, 3).some(function (part) {
      return Number.isNaN(part);
    })) {
      return null;
    }

    return {
      r: Math.max(0, Math.min(255, parts[0])),
      g: Math.max(0, Math.min(255, parts[1])),
      b: Math.max(0, Math.min(255, parts[2])),
      a: parts.length >= 4 && !Number.isNaN(parts[3]) ? Math.max(0, Math.min(1, parts[3])) : 1
    };
  }

  function getColorLuminance(color) {
    if (!color) {
      return 1;
    }

    function toLinear(channel) {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    }

    return 0.2126 * toLinear(color.r)
      + 0.7152 * toLinear(color.g)
      + 0.0722 * toLinear(color.b);
  }

  function isTransparentColor(value) {
    const color = parseRgbColor(value);
    return !color || color.a <= 0.04;
  }

  function getOpaqueStyleColor(node, propertyName) {
    if (!node || !window.getComputedStyle) {
      return null;
    }

    const value = window.getComputedStyle(node)[propertyName] || "";
    const color = parseRgbColor(value);
    return color && color.a > 0.04 ? color : null;
  }

  function detectCurrentPageTheme() {
    const metaThemeColorNode = document.querySelector('meta[name="theme-color"]');
    const metaThemeColor = parseRgbColor(metaThemeColorNode ? metaThemeColorNode.getAttribute("content") : "");
    if (metaThemeColor && metaThemeColor.a > 0.04) {
      const metaLuminance = getColorLuminance(metaThemeColor);
      if (metaLuminance < 0.24) {
        return "dark";
      }
      if (metaLuminance > 0.76) {
        return "light";
      }
    }

    const themeProbeNodes = [
      document.querySelector('[data-testid="primaryColumn"]'),
      document.querySelector('[data-testid="primaryColumn"] section'),
      document.querySelector("main[role='main']"),
      document.querySelector('[data-testid="cellInnerDiv"]'),
      document.body,
      document.documentElement
    ];
    let darkVotes = 0;
    let lightVotes = 0;

    for (let index = 0; index < themeProbeNodes.length; index += 1) {
      const node = themeProbeNodes[index];
      if (!node) {
        continue;
      }

      const backgroundColor = getOpaqueStyleColor(node, "backgroundColor");
      if (backgroundColor) {
        const backgroundLuminance = getColorLuminance(backgroundColor);
        if (backgroundLuminance < 0.24) {
          darkVotes += 2;
        } else if (backgroundLuminance > 0.76) {
          lightVotes += 2;
        }
      }

      const textColor = getOpaqueStyleColor(node, "color");
      if (textColor) {
        const textLuminance = getColorLuminance(textColor);
        if (textLuminance > 0.68) {
          darkVotes += 1;
        } else if (textLuminance < 0.32) {
          lightVotes += 1;
        }
      }
    }

    if (darkVotes > lightVotes) {
      return "dark";
    }

    if (lightVotes > darkVotes) {
      return "light";
    }

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "light";
  }

  function syncBrowserThemeDataset() {
    root.dataset.web25Browser = IS_CHROMIUM_BROWSER
      ? "chromium"
      : (IS_SAFARI_BROWSER ? "safari" : "other");
    root.dataset.web25PageTheme = detectCurrentPageTheme();
  }

  function isCurrentPageController() {
    return Boolean(window[PAGE_CONTROLLER_KEY] && window[PAGE_CONTROLLER_KEY].instanceId === INSTANCE_ID);
  }

  function clearScheduledWork() {
    clearTimeout(state.scanTimer);
    clearTimeout(state.manualRescanTimer);
    clearTimeout(state.manualPersistTimer);
    clearTimeout(state.bottomUiDedupeTimer);
    clearTimeout(state.replyAiBatchTimer);
    state.scanTimer = null;
    state.manualRescanTimer = null;
    state.manualPersistTimer = null;
    state.bottomUiDedupeTimer = null;
    state.replyAiBatchTimer = null;
    state.replyAiBatchInFlight = false;
    state.stabilizeTimers.forEach(function (timerId) {
      clearTimeout(timerId);
    });
    state.stabilizeTimers = [];
    state.sidebarStabilizeTimers.forEach(function (timerId) {
      clearTimeout(timerId);
    });
    state.sidebarStabilizeTimers = [];
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
    delete root.dataset.web25Browser;
    delete root.dataset.web25PageTheme;
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
    if (state.scrollListener) {
      window.removeEventListener("scroll", state.scrollListener);
      state.scrollListener = null;
    }
    if (state.domReadyListener) {
      document.removeEventListener("DOMContentLoaded", state.domReadyListener);
      state.domReadyListener = null;
    }

    if (state.sidebarDebugDismissListener) {
      document.removeEventListener("web25:sidebar-dismiss", state.sidebarDebugDismissListener);
      state.sidebarDebugDismissListener = null;
    }

    if (state.sidebarDebugResetListener) {
      document.removeEventListener("web25:sidebar-reset", state.sidebarDebugResetListener);
      state.sidebarDebugResetListener = null;
    }

    resetManagedReplyState();
    removeAllHiding();

    const anchorStyleTag = document.getElementById("web25-anchor-style");
    if (anchorStyleTag && anchorStyleTag.getAttribute("data-web25-owned") === "1") {
      anchorStyleTag.remove();
    }

    delete root.dataset.web25Booted;
    delete root.dataset.web25Instance;
    delete root.dataset.web25Browser;
    delete root.dataset.web25PageTheme;
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
  root.dataset.web25SidebarControlsEnabled = "1";
  root.dataset.web25SyncReady = "0";
  root.dataset.web25Stage = "boot";
  delete root.dataset.web25Error;
  syncBrowserThemeDataset();

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

  function buildSummaryText(autoCount, historyCount, manualCount, scannedCount, aiCount, aiReviewedCount) {
    const parts = [];
    const totalCount = autoCount + historyCount + manualCount;
    const normalizedAiCount = Math.max(0, Number(aiCount || 0));
    const normalizedAiReviewedCount = Math.max(0, Number(aiReviewedCount || 0));
    const localAutoCount = Math.max(0, autoCount - normalizedAiCount);

    if (totalCount === 0) {
      if (normalizedAiReviewedCount > 0) {
        parts.push("AI 已复审 " + normalizedAiReviewedCount + " 条");
      }
      if (scannedCount > 0) {
        parts.push("刚刚看了 " + scannedCount + " 条回复");
      }
      if (parts.length > 0) {
        return parts.join("，") + "。";
      }

      return "还在等回复区加载出来。";
    }

    if (normalizedAiReviewedCount > 0) {
      parts.push("AI 已复审 " + normalizedAiReviewedCount + " 条");
    }

    if (localAutoCount > 0) {
      parts.push("Colorful Toilet 自动下沉 " + localAutoCount + " 条");
    }

    if (normalizedAiCount > 0) {
      parts.push("AI 自动下沉 " + normalizedAiCount + " 条");
    }

    if (historyCount > 0) {
      parts.push("你手动冲走 " + historyCount + " 条");
    }

    if (manualCount > 0) {
      parts.push("你刚标记下沉 " + manualCount + " 条");
    }

    return parts.join("，");
  }

  function getHiddenSourcePresentation(entry) {
    const source = entry && entry.hiddenSource ? String(entry.hiddenSource || "") : "auto";
    if (source === "manual") {
      return {
        className: "web25-hidden-badge-manual",
        label: "你刚标记下沉"
      };
    }

    if (source === "history") {
      return {
        className: "web25-hidden-badge-history",
        label: "你手动冲走"
      };
    }

    if (source === "ai-global" || source === "ai-memory") {
      return {
        className: "web25-hidden-badge-ai-global",
        label: "AI 学习库屏蔽"
      };
    }

    if (source === "ai") {
      return {
        className: "web25-hidden-badge-ai",
        label: "AI 自动下沉"
      };
    }

    if (source === "ai-pending") {
      return {
        className: "web25-hidden-badge-ai",
        label: "AI 复审中"
      };
    }

    return {
      className: "web25-hidden-badge-auto",
      label: "Colorful Toilet 自动下沉"
    };
  }

  function captureRevealedListScrollPosition() {
    if (!state.revealedListItemsEl) {
      return;
    }

    state.revealedListScrollTop = Math.max(0, Number(state.revealedListItemsEl.scrollTop || 0));
  }

  function restoreRevealedListScrollPosition() {
    if (!state.bottomTrayOpen || !state.revealedListItemsEl) {
      return;
    }

    requestAnimationFrame(function () {
      if (!state.revealedListItemsEl) {
        return;
      }

      const maxScrollTop = Math.max(
        0,
        state.revealedListItemsEl.scrollHeight - state.revealedListItemsEl.clientHeight
      );
      const nextScrollTop = Math.max(0, Math.min(Number(state.revealedListScrollTop || 0), maxScrollTop));
      if (Math.abs(state.revealedListItemsEl.scrollTop - nextScrollTop) > 1) {
        state.revealedListItemsEl.scrollTop = nextScrollTop;
      }
    });
  }

  function bindRevealedListScrollTracking(node) {
    if (!node || node.__web25ScrollTrackingBound) {
      return;
    }

    node.__web25ScrollTrackingBound = true;
    node.addEventListener("pointerdown", function () {
      noteRevealedListInteraction();
    }, {
      passive: true
    });
    node.addEventListener("wheel", function (event) {
      noteRevealedListInteraction();

      const maxScrollTop = Math.max(0, node.scrollHeight - node.clientHeight);
      if (maxScrollTop <= 0) {
        return;
      }

      const deltaY = Number(event.deltaY || 0);
      const deltaX = Number(event.deltaX || 0);
      if (Math.abs(deltaX) > Math.abs(deltaY) || Math.abs(deltaY) < 0.25) {
        return;
      }

      const nextScrollTop = Math.max(0, Math.min(maxScrollTop, node.scrollTop + deltaY));
      if (Math.abs(nextScrollTop - node.scrollTop) <= 0.5) {
        return;
      }

      node.scrollTop = nextScrollTop;
      state.revealedListScrollTop = Math.max(0, Number(node.scrollTop || 0));
      event.preventDefault();
      event.stopPropagation();
    }, {
      passive: false
    });
    node.addEventListener("scroll", function () {
      noteRevealedListInteraction();
      state.revealedListScrollTop = Math.max(0, Number(node.scrollTop || 0));
    }, {
      passive: true
    });
  }

  function scheduleDeferredRevealedListRefresh() {
    clearTimeout(state.revealedListInteractionTimer);
    state.revealedListInteractionTimer = null;

    if (!state.pendingRevealedListPayload) {
      return;
    }

    const delayMs = Math.max(0, Number(state.revealedListInteractionUntil || 0) - Date.now()) + 36;
    state.revealedListInteractionTimer = setTimeout(function () {
      state.revealedListInteractionTimer = null;
      if (state.destroyed) {
        return;
      }

      const pendingPayload = state.pendingRevealedListPayload;
      if (!pendingPayload) {
        return;
      }

      state.pendingRevealedListPayload = null;
      if (pendingPayload.counts) {
        ensureRevealedList(pendingPayload.counts);
      }
      updateBottomCards(Array.isArray(pendingPayload.revealedReplies) ? pendingPayload.revealedReplies : []);
    }, delayMs);
  }

  function noteRevealedListInteraction() {
    state.revealedListInteractionUntil = Date.now() + 900;
    if (state.pendingRevealedListPayload) {
      scheduleDeferredRevealedListRefresh();
    }
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

    setStorageLocal(patch, function () {
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

  function normalizeSidebarControlsEnabled(value, fallback) {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value !== 0;
    }

    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized) {
      return fallback !== false;
    }

    if (normalized === "0" || normalized === "false" || normalized === "off" || normalized === "no") {
      return false;
    }

    if (normalized === "1" || normalized === "true" || normalized === "on" || normalized === "yes") {
      return true;
    }

    return fallback !== false;
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

    if (SIDEBAR_TITLE_PATTERNS.suggested.some(function (pattern) {
      return pattern.test(normalizedTitle);
    })) {
      return "suggested";
    }

    if (SIDEBAR_TITLE_PATTERNS.related.some(function (pattern) {
      return pattern.test(normalizedTitle);
    })) {
      return "related";
    }

    if (SIDEBAR_TITLE_PATTERNS.premium.some(function (pattern) {
      return pattern.test(normalizedTitle);
    })) {
      return "premium";
    }

    if (SIDEBAR_TITLE_PATTERNS.live.some(function (pattern) {
      return pattern.test(normalizedTitle);
    })) {
      return "live";
    }

    return "";
  }

  function getSidebarModuleCloseLabel(kind) {
    if (kind === "happenings") {
      return "关闭“有什么新鲜事”";
    }

    if (kind === "follow") {
      return "关闭“推荐关注”";
    }

    if (kind === "suggested") {
      return "关闭“你可能会喜欢”";
    }

    if (kind === "related") {
      return "关闭“相关用户”";
    }

    if (kind === "premium") {
      return "关闭“订阅 Premium”";
    }

    if (kind === "live") {
      return "关闭“X 上的直播”";
    }

    if (kind === "legal") {
      return "关闭“政策链接”";
    }

    return "关闭右栏模块";
  }

  function getSidebarLegalSignalCount(text) {
    const normalizedText = normalizeSidebarHeadingText(text);
    if (!normalizedText) {
      return {
        total: 0,
        core: 0
      };
    }

    const categories = Object.keys(SIDEBAR_LEGAL_PATTERNS);
    let total = 0;
    let core = 0;

    categories.forEach(function (category) {
      const matched = SIDEBAR_LEGAL_PATTERNS[category].some(function (pattern) {
        return pattern.test(normalizedText);
      });

      if (!matched) {
        return;
      }

      total += 1;
      if (category === "terms" || category === "privacy" || category === "cookie") {
        core += 1;
      }
    });

    return {
      total: total,
      core: core
    };
  }

  function isSidebarLegalNav(node) {
    if (!node || !node.matches || !node.matches("nav, [role='navigation']")) {
      return false;
    }

    const signals = getSidebarLegalSignalCount(node.textContent || "");
    return signals.total >= 3 && signals.core >= 2;
  }

  function getSidebarColumn() {
    return document.querySelector('[data-testid="sidebarColumn"]');
  }

  function isManagedSidebarModuleContainer(container, kind) {
    if (!container || container.nodeType !== 1 || !container.getAttribute) {
      return false;
    }

    const existingKind = container.getAttribute("data-web25-sidebar-module")
      || container.getAttribute("data-web25-sidebar-host")
      || "";

    if (!existingKind) {
      return false;
    }

    return !kind || existingKind === kind;
  }

  function isSidebarLayoutEligible(sidebarColumn) {
    if (!sidebarColumn || !sidebarColumn.isConnected || !sidebarColumn.getBoundingClientRect) {
      return false;
    }

    const rect = sidebarColumn.getBoundingClientRect();
    if (!rect.width || rect.width < 220 || rect.height < 160) {
      return false;
    }

    if (window.innerWidth && rect.left < window.innerWidth * 0.52) {
      return false;
    }

    return true;
  }

  function isSidebarCardGeometrySafe(container, sidebarColumn) {
    if (!container || !sidebarColumn || !container.getBoundingClientRect || !sidebarColumn.getBoundingClientRect) {
      return false;
    }

    const rect = container.getBoundingClientRect();
    const sidebarRect = sidebarColumn.getBoundingClientRect();
    if (!sidebarRect.width || !rect.width) {
      return false;
    }

    if (rect.width > sidebarRect.width + 8) {
      return false;
    }

    if (rect.left < sidebarRect.left - 8 || rect.right > sidebarRect.right + 8) {
      return false;
    }

    if (window.innerWidth && rect.left < window.innerWidth * 0.52) {
      return false;
    }

    return true;
  }

  function isSidebarPluginNode(node) {
    return Boolean(
      node
      && node.nodeType === 1
      && node.getAttribute
      && node.getAttribute("data-web25-owned") === "1"
      && (
        node.classList.contains("web25-sidebar-close")
        || node.classList.contains("web25-sidebar-content-wrap")
        || node.hasAttribute("data-web25-sidebar-close")
        || node.hasAttribute("data-web25-sidebar-content")
      )
    );
  }

  function getSidebarModuleWrap(section) {
    if (!section) {
      return null;
    }

    return Array.from(section.children).find(function (child) {
      return child.classList
        && child.classList.contains("web25-sidebar-content-wrap")
        && child.getAttribute("data-web25-owned") === "1";
    }) || null;
  }

  function getSidebarCloseButton(section) {
    if (!section) {
      return null;
    }

    return Array.from(section.children).find(function (child) {
      return child.classList
        && child.classList.contains("web25-sidebar-close")
        && child.getAttribute("data-web25-owned") === "1";
    }) || null;
  }

  function clearSidebarModuleShell(section) {
    if (!section || !section.__web25SidebarShell) {
      return;
    }

    const shell = section.__web25SidebarShell;
    if (shell && shell.nodeType === 1) {
      shell.classList.remove("web25-sidebar-shell");
      shell.removeAttribute("data-web25-sidebar-shell");
      shell.removeAttribute("data-web25-sidebar-shell-owner");
      shell.removeAttribute("data-web25-sidebar-shell-collapsed");
    }

    delete section.__web25SidebarShell;
  }

  function hasVisibleSidebarCardChrome(node) {
    if (!node || !window.getComputedStyle) {
      return false;
    }

    const style = window.getComputedStyle(node);
    const radius = parseFloat(style.borderTopLeftRadius || style.borderRadius || "0") || 0;
    const borderWidth = [
      style.borderTopWidth,
      style.borderRightWidth,
      style.borderBottomWidth,
      style.borderLeftWidth
    ].some(function (value) {
      return (parseFloat(value || "0") || 0) >= 0.5;
    });
    const background = style.backgroundColor || "";
    const hasBackground = background !== "rgba(0, 0, 0, 0)" && background !== "transparent";
    const hasShadow = style.boxShadow && style.boxShadow !== "none";

    return radius >= 12 && (hasBackground || borderWidth || hasShadow);
  }

  function isSafeSidebarModuleShell(node, section, sidebarColumn, kind) {
    if (!node || !section || !sidebarColumn || node === section || !sidebarColumn.contains(node)) {
      return false;
    }

    if (
      node.matches
      && node.matches("main, [role='main'], [data-testid='primaryColumn'], [data-testid='sidebarColumn']")
    ) {
      return false;
    }

    if (hasConflictingSidebarTitle(node, kind)) {
      return false;
    }

    if (!hasVisibleSidebarCardChrome(node)) {
      return false;
    }

    if (!section.getBoundingClientRect || !node.getBoundingClientRect) {
      return false;
    }

    const sectionRect = section.getBoundingClientRect();
    const shellRect = node.getBoundingClientRect();
    if (!sectionRect.width || !shellRect.width) {
      return false;
    }

    if (Math.abs(shellRect.width - sectionRect.width) > 16) {
      return false;
    }

    if (Math.abs(shellRect.left - sectionRect.left) > 12) {
      return false;
    }

    if (Math.abs(shellRect.top - sectionRect.top) > 12) {
      return false;
    }

    if (shellRect.height < sectionRect.height - 8) {
      return false;
    }

    if (shellRect.height > sectionRect.height + 48) {
      return false;
    }

    return true;
  }

  function findSidebarModuleShell(section, sidebarColumn, kind) {
    if (!section || !sidebarColumn || !sidebarColumn.contains(section) || kind === "legal") {
      return null;
    }

    let current = section.parentElement;
    let depth = 0;
    while (current && current !== sidebarColumn && depth < 4) {
      if (isSafeSidebarModuleShell(current, section, sidebarColumn, kind)) {
        return current;
      }

      current = current.parentElement;
      depth += 1;
    }

    return null;
  }

  function syncSidebarModuleShell(section, kind) {
    if (!section || !kind) {
      return null;
    }

    const sidebarColumn = getSidebarColumn();
    const nextShell = findSidebarModuleShell(section, sidebarColumn, kind);
    const previousShell = section.__web25SidebarShell || null;
    if (previousShell && previousShell !== nextShell) {
      clearSidebarModuleShell(section);
    }

    if (!nextShell) {
      return null;
    }

    nextShell.classList.add("web25-sidebar-shell");
    nextShell.setAttribute("data-web25-sidebar-shell", "1");
    nextShell.setAttribute("data-web25-sidebar-shell-owner", kind);
    section.__web25SidebarShell = nextShell;
    return nextShell;
  }

  function unwrapSidebarModuleWrap(wrap) {
    if (!wrap || !wrap.parentNode) {
      return;
    }

    const section = wrap.parentNode;
    while (wrap.firstChild) {
      section.insertBefore(wrap.firstChild, wrap);
    }
    wrap.remove();
  }

  function teardownSidebarModuleHost(section) {
    if (!section || section.nodeType !== 1) {
      return;
    }

    clearSidebarModuleShell(section);

    const button = getSidebarCloseButton(section);
    if (button) {
      button.remove();
    }

    const wrap = getSidebarModuleWrap(section);
    if (wrap) {
      wrap.removeAttribute("data-web25-sidebar-content-hidden");
      unwrapSidebarModuleWrap(wrap);
    }

    section.classList.remove("web25-sidebar-module");
    section.removeAttribute("data-web25-sidebar-module");
    section.removeAttribute("data-web25-sidebar-host");
    section.removeAttribute("data-web25-sidebar-safe");
    section.removeAttribute("data-web25-sidebar-state");
    section.removeAttribute("data-web25-sidebar-collapsed");
    section.removeAttribute("data-web25-sidebar-pending-dismiss");
  }

  function hasConflictingSidebarTitle(container, kind) {
    if (!container || !kind) {
      return false;
    }

    const headings = Array.from(
      container.querySelectorAll('span, div, h1, h2, [role="heading"]')
    );

    return headings.some(function (node) {
      const nodeKind = getSidebarModuleKindByTitle(node.textContent || "");
      return Boolean(nodeKind && nodeKind !== kind);
    });
  }

  function isSafeSidebarModuleContainer(container, sidebarColumn, kind) {
    if (!container || !sidebarColumn || !sidebarColumn.contains(container)) {
      return false;
    }

    if (isManagedSidebarModuleContainer(container, kind)) {
      return true;
    }

    if (!isSidebarLayoutEligible(sidebarColumn)) {
      return false;
    }

    if (container === sidebarColumn || container === document.body || container === document.documentElement) {
      return false;
    }

    if (
      container.matches
      && container.matches("main, [role='main'], [data-testid='primaryColumn'], [data-testid='sidebarColumn']")
    ) {
      return false;
    }

    if (
      container.closest
      && (
        container.closest("main, [role='main'], [data-testid='primaryColumn']") === container
        || container.closest("[data-testid='sidebarColumn']") !== sidebarColumn
      )
    ) {
      return false;
    }

    const owningCell = container.closest
      ? container.closest('[data-testid="cellInnerDiv"]')
      : null;
    if (owningCell && owningCell !== container) {
      return false;
    }

    const isCellContainer = Boolean(
      container.matches && container.matches('[data-testid="cellInnerDiv"]')
    );
    const isSemanticCard = Boolean(
      container.matches && container.matches("section, aside, [role='region'], [role='complementary']")
    );
    const isLegalNav = Boolean(
      kind === "legal"
      && container.matches
      && container.matches("nav, [role='navigation']")
    );
    const isChromeCardDiv = Boolean(
      container.matches
      && container.matches("div")
      && hasVisibleSidebarCardChrome(container)
    );

    if (!(isCellContainer || isSemanticCard || isLegalNav || isChromeCardDiv)) {
      return false;
    }

    if (!isSidebarCardGeometrySafe(container, sidebarColumn)) {
      return false;
    }

    if (hasConflictingSidebarTitle(container, kind)) {
      return false;
    }

    return true;
  }

  function resolveSidebarModuleContainer(titleNode, sidebarColumn, kind) {
    if (!titleNode || !sidebarColumn || !sidebarColumn.contains(titleNode)) {
      return null;
    }

    const managedHost = titleNode.closest
      ? titleNode.closest("[data-web25-sidebar-module], [data-web25-sidebar-host]")
      : null;
    if (
      managedHost
      && sidebarColumn.contains(managedHost)
      && isManagedSidebarModuleContainer(managedHost, kind)
    ) {
      return managedHost;
    }

    const cellContainer = titleNode.closest('[data-testid="cellInnerDiv"]');
    if (isSafeSidebarModuleContainer(cellContainer, sidebarColumn, kind)) {
      return cellContainer;
    }

    let node = titleNode;
    while (node && node !== sidebarColumn) {
      if (isSafeSidebarModuleContainer(node, sidebarColumn, kind)) {
        return node;
      }

      node = node.parentElement;
    }

    const semanticContainer = titleNode.closest("section, aside, [role='region'], [role='complementary']");
    if (isSafeSidebarModuleContainer(semanticContainer, sidebarColumn, kind)) {
      return semanticContainer;
    }

    return null;
  }

  function collectSidebarLegalModules(sidebarColumn, seen, modules) {
    Array.from(sidebarColumn.querySelectorAll("nav, [role='navigation']")).forEach(function (node) {
      if (!isSidebarLegalNav(node)) {
        return;
      }

      const container = isSafeSidebarModuleContainer(node, sidebarColumn, "legal") ? node : null;
      if (!container || seen.has(container)) {
        return;
      }

      seen.add(container);
      modules.push({
        kind: "legal",
        section: container
      });
    });
  }

  function collectSidebarModules() {
    const sidebarColumn = getSidebarColumn();
    root.dataset.web25SidebarColumn = sidebarColumn ? "1" : "0";
    if (!sidebarColumn) {
      root.dataset.web25SidebarLayout = "missing";
      return [];
    }

    if (!isSidebarLayoutEligible(sidebarColumn)) {
      root.dataset.web25SidebarLayout = "ineligible";
      return [];
    }

    root.dataset.web25SidebarLayout = "eligible";
    const seen = new Set();
    const modules = [];
    const titleCandidates = Array.from(
      sidebarColumn.querySelectorAll('span, div, h1, h2, [role="heading"]')
    );

    titleCandidates.forEach(function (node) {
      if (!node) {
        return;
      }

      const kind = getSidebarModuleKindByTitle(node.textContent || "");
      if (!kind) {
        return;
      }

      const hasNestedMatch = Array.from(node.querySelectorAll ? node.querySelectorAll('span, div, h1, h2, [role="heading"]') : []).some(function (child) {
        return child !== node && getSidebarModuleKindByTitle(child.textContent || "") === kind;
      });
      if (hasNestedMatch) {
        return;
      }

      const container = resolveSidebarModuleContainer(node, sidebarColumn, kind);
      if (!container || seen.has(container)) {
        return;
      }

      seen.add(container);
      modules.push({
        kind: kind,
        section: container
      });
    });

    collectSidebarLegalModules(sidebarColumn, seen, modules);

    root.dataset.web25SidebarKinds = modules.map(function (entry) {
      return entry.kind;
    }).join(",");
    return modules;
  }

  function applySidebarModuleDismissed(section, dismissed) {
    if (!section) {
      return;
    }

    const kind = section.getAttribute("data-web25-sidebar-module")
      || section.getAttribute("data-web25-sidebar-host")
      || "";
    const shell = syncSidebarModuleShell(section, kind);
    const wrap = getSidebarModuleWrap(section);
    section.setAttribute("data-web25-sidebar-state", dismissed ? "collapsed" : "open");
    section.removeAttribute("data-web25-sidebar-pending-dismiss");

    if (!wrap) {
      section.removeAttribute("data-web25-sidebar-collapsed");
      if (shell) {
        shell.removeAttribute("data-web25-sidebar-shell-collapsed");
      }
      return;
    }

    if (dismissed) {
      section.setAttribute("data-web25-sidebar-collapsed", "1");
      wrap.setAttribute("data-web25-sidebar-content-hidden", "1");
      if (shell) {
        shell.setAttribute("data-web25-sidebar-shell-collapsed", "1");
      }
      return;
    }

    section.removeAttribute("data-web25-sidebar-collapsed");
    wrap.removeAttribute("data-web25-sidebar-content-hidden");
    if (shell) {
      shell.removeAttribute("data-web25-sidebar-shell-collapsed");
    }
  }

  function dismissSidebarModule(kind) {
    if (!kind || !state.sidebarControlsEnabled) {
      return;
    }

    state.dismissedSidebarModules.add(kind);
    scanSidebarModules();
  }

  function ensureSidebarModuleWrap(section, kind) {
    if (!section || !kind) {
      return null;
    }

    section.setAttribute("data-web25-sidebar-module", kind);
    section.setAttribute("data-web25-sidebar-host", kind);
    section.setAttribute("data-web25-sidebar-safe", "1");
    section.classList.add("web25-sidebar-module");

    let wrap = getSidebarModuleWrap(section);
    const button = getSidebarCloseButton(section);
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "web25-sidebar-content-wrap";
      if (kind === "legal") {
        wrap.classList.add("web25-sidebar-content-wrap-legal");
      }
      wrap.setAttribute("data-web25-owned", "1");
      wrap.setAttribute("data-web25-sidebar-content", kind);
      if (button && button.parentNode === section) {
        section.insertBefore(wrap, button);
      } else {
        section.appendChild(wrap);
      }
    }

    Array.from(section.childNodes).forEach(function (node) {
      if (node === wrap || isSidebarPluginNode(node)) {
        return;
      }

      wrap.appendChild(node);
    });

    if (!wrap.childNodes.length) {
      wrap.remove();
      section.removeAttribute("data-web25-sidebar-safe");
      return null;
    }

    wrap.setAttribute("data-web25-sidebar-content", kind);
    if (kind === "legal") {
      wrap.classList.add("web25-sidebar-content-wrap-legal");
    }
    return wrap;
  }

  function queueSidebarModuleDismiss(section, kind, button) {
    if (!section || !kind) {
      return;
    }

    if (section.getAttribute("data-web25-sidebar-pending-dismiss") === "1") {
      return;
    }

    section.setAttribute("data-web25-sidebar-pending-dismiss", "1");
    root.dataset.web25SidebarPending = kind;

    if (button) {
      button.setAttribute("data-web25-sidebar-pending", "1");
      button.setAttribute("aria-disabled", "true");
    }

    const finalize = function () {
      if (button) {
        button.removeAttribute("data-web25-sidebar-pending");
        button.removeAttribute("aria-disabled");
      }

      delete root.dataset.web25SidebarPending;

      if (!section.isConnected) {
        return;
      }

      dismissSidebarModule(kind);
    };

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(finalize);
      return;
    }

    window.setTimeout(finalize, 0);
  }

  function ensureSidebarCloseButton(section, kind) {
    if (!section || !kind) {
      return;
    }

    if (!ensureSidebarModuleWrap(section, kind)) {
      return;
    }

    let button = getSidebarCloseButton(section);
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "web25-sidebar-close";
      button.setAttribute("data-web25-owned", "1");
      button.setAttribute("data-web25-sidebar-close", "1");
      section.appendChild(button);
    }

    const label = getSidebarModuleCloseLabel(kind);
    button.setAttribute("aria-label", label);
    button.title = label;
    button.textContent = "×";

    const stopInteraction = function (event) {
      event.preventDefault();
      event.stopPropagation();
    };

    const dismissFromEvent = function (event) {
      stopInteraction(event);
      queueSidebarModuleDismiss(section, kind, button);
    };

    button.onpointerdown = dismissFromEvent;
    button.onclick = stopInteraction;
    button.onkeydown = function (event) {
      if (event.key === "Enter" || event.key === " ") {
        dismissFromEvent(event);
      }
    };
  }

  function scanSidebarModules() {
    if (!state.sidebarControlsEnabled) {
      state.dismissedSidebarModules = new Set();
      clearSidebarModuleUi();
      root.dataset.web25SidebarModules = "0";
      root.dataset.web25SidebarHidden = "0";
      root.dataset.web25SidebarKinds = "";
      return;
    }

    const modules = collectSidebarModules();
    const activeSections = new Set(modules.map(function (entry) {
      return entry.section;
    }));

    Array.from(document.querySelectorAll("[data-web25-sidebar-module]")).forEach(function (node) {
      if (!activeSections.has(node)) {
        teardownSidebarModuleHost(node);
      }
    });

    Array.from(document.querySelectorAll("[data-web25-sidebar-shell='1']")).forEach(function (node) {
      if (!node.querySelector("[data-web25-sidebar-module]")) {
        node.classList.remove("web25-sidebar-shell");
        node.removeAttribute("data-web25-sidebar-shell");
        node.removeAttribute("data-web25-sidebar-shell-owner");
        node.removeAttribute("data-web25-sidebar-shell-collapsed");
      }
    });

    root.dataset.web25SidebarModules = String(modules.length);
    root.dataset.web25SidebarHidden = String(state.dismissedSidebarModules.size);

    modules.forEach(function (entry) {
      ensureSidebarCloseButton(entry.section, entry.kind);
      applySidebarModuleDismissed(entry.section, state.dismissedSidebarModules.has(entry.kind));
    });
  }

  function clearSidebarModuleUi() {
    Array.from(document.querySelectorAll("[data-web25-sidebar-module]")).forEach(function (node) {
      teardownSidebarModuleHost(node);
    });

    Array.from(document.querySelectorAll(".web25-sidebar-content-wrap")).forEach(function (node) {
      unwrapSidebarModuleWrap(node);
    });

    Array.from(document.querySelectorAll(".web25-sidebar-close")).forEach(function (node) {
      node.remove();
    });

    delete root.dataset.web25SidebarPending;
  }

  function applySidebarControlsPreference(value) {
    state.sidebarControlsEnabled = normalizeSidebarControlsEnabled(value, true);
    root.dataset.web25SidebarControlsEnabled = state.sidebarControlsEnabled ? "1" : "0";

    if (state.sidebarControlsEnabled) {
      return;
    }

    state.dismissedSidebarModules = new Set();
    clearSidebarModuleUi();
  }

  function ensureSidebarDebugHooks() {
    if (state.sidebarDebugHooksInstalled) {
      return;
    }

    state.sidebarDebugDismissListener = function (event) {
      if (state.destroyed) {
        return;
      }

      const detail = event && event.detail ? event.detail : {};
      const kind = typeof detail.kind === "string" ? detail.kind.trim() : "";
      if (
        !kind
        || (
          kind !== "happenings"
          && kind !== "follow"
          && kind !== "suggested"
          && kind !== "related"
          && kind !== "premium"
          && kind !== "live"
          && kind !== "legal"
        )
      ) {
        return;
      }

      root.dataset.web25SidebarDebugAction = "dismiss:" + kind;
      dismissSidebarModule(kind);
    };
    document.addEventListener("web25:sidebar-dismiss", state.sidebarDebugDismissListener);

    state.sidebarDebugResetListener = function () {
      if (state.destroyed) {
        return;
      }

      state.dismissedSidebarModules = new Set();
      root.dataset.web25SidebarDebugAction = "reset";
      scanSidebarModules();
    };
    document.addEventListener("web25:sidebar-reset", state.sidebarDebugResetListener);

    state.sidebarDebugHooksInstalled = true;
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

    function normalizeAdCandidate(value) {
      return String(value || "").replace(/\s+/g, " ").trim();
    }

    function matchesOfficialAdLabel(value) {
      const normalized = normalizeAdCandidate(value);
      if (!normalized) {
        return false;
      }

      return OFFICIAL_AD_LABEL_PATTERNS.some(function (pattern) {
        return pattern.test(normalized);
      });
    }

    function matchesOfficialAdHint(value) {
      const normalized = normalizeAdCandidate(value);
      if (!normalized) {
        return false;
      }

      return OFFICIAL_AD_HINT_PATTERNS.some(function (pattern) {
        return pattern.test(normalized);
      });
    }

    const exactLabel = Array.from(article.querySelectorAll("span, div, a, button"))
      .map(function (node) {
        return normalizeAdCandidate(node.innerText || node.textContent || "");
      })
      .find(function (text) {
        return matchesOfficialAdLabel(text);
      });

    if (exactLabel) {
      return exactLabel;
    }

    const attributeLabel = Array.from(article.querySelectorAll("span, div, a, button, [aria-label], [title]"))
      .map(function (node) {
        return {
          ariaLabel: normalizeAdCandidate(node.getAttribute && node.getAttribute("aria-label")),
          title: normalizeAdCandidate(node.getAttribute && node.getAttribute("title")),
          text: normalizeAdCandidate(node.innerText || node.textContent || "")
        };
      })
      .find(function (candidate) {
        return (candidate.ariaLabel && candidate.ariaLabel.length <= 48 && (matchesOfficialAdLabel(candidate.ariaLabel) || matchesOfficialAdHint(candidate.ariaLabel)))
          || (candidate.title && candidate.title.length <= 48 && (matchesOfficialAdLabel(candidate.title) || matchesOfficialAdHint(candidate.title)))
          || (candidate.text && candidate.text.length <= 16 && (matchesOfficialAdLabel(candidate.text) || matchesOfficialAdHint(candidate.text)));
      });

    if (attributeLabel) {
      return attributeLabel.ariaLabel || attributeLabel.title || attributeLabel.text || "";
    }

    const adLinkHit = Array.from(article.querySelectorAll("a[href]")).some(function (node) {
      const href = String(node.getAttribute("href") || "").trim();
      return OFFICIAL_AD_LINK_PATTERNS.some(function (pattern) {
        return pattern.test(href);
      });
    });

    return adLinkHit ? "ad-link" : "";
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
    let settled = false;
    const finish = function (db) {
      if (settled) {
        if (db) {
          try {
            db.close();
          } catch (error) {
            // Ignore late close errors.
          }
        }
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      callback(db || null);
    };
    const timeoutId = setTimeout(function () {
      finish(null);
    }, INDEXED_DB_OPEN_TIMEOUT_MS);

    try {
      const request = window.indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = function () {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = function () {
        finish(request.result);
      };
      request.onerror = function () {
        finish(null);
      };
    } catch (error) {
      finish(null);
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
    let settled = false;
    const finish = function (data) {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      callback(data);
    };
    const timeoutId = setTimeout(function () {
      finish(null);
    }, 8000);

    if (api.runtime && typeof api.runtime.sendMessage === "function") {
      api.runtime.sendMessage({
        type: "web25-http-request",
        endpoint: endpoint,
        method: method,
        payload: payload || {},
        credentials: withCredentials ? "include" : "omit"
      }, function (response) {
        if (api.runtime && api.runtime.lastError) {
          finish(null);
          return;
        }

        if (!response || !response.ok || !response.data) {
          finish(null);
          return;
        }

        finish(response.data);
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
      finish(data);
    }).catch(function () {
      finish(null);
    });
  }

  function requestBackendText(endpoint, callback, withCredentials, headers) {
    if (api.runtime && typeof api.runtime.sendMessage === "function") {
      api.runtime.sendMessage({
        type: "web25-http-request",
        endpoint: endpoint,
        method: "GET",
        payload: {},
        credentials: withCredentials ? "include" : "omit",
        responseType: "text",
        headers: headers || {}
      }, function (response) {
        if (api.runtime && api.runtime.lastError) {
          callback("");
          return;
        }
        if (!response || !response.ok || typeof response.data !== "string") {
          callback("");
          return;
        }
        callback(response.data);
      });
      return;
    }

    fetch(endpoint, {
      method: "GET",
      mode: "cors",
      credentials: withCredentials ? "include" : "omit",
      headers: headers || {},
      cache: "no-store"
    }).then(function (response) {
      return response.ok ? response.text() : "";
    }).then(function (data) {
      callback(typeof data === "string" ? data : "");
    }).catch(function () {
      callback("");
    });
  }

  function attemptAutoBindSyncKey(force, callback) {
    if (state.destroyed || !state.backendBaseUrl || !state.syncKey) {
      if (typeof callback === "function") {
        callback(false);
      }
      return;
    }

    const now = Date.now();
    const syncSignature = `${state.backendBaseUrl}|${state.syncKey}|${state.deviceId}`;
    if (!force && state.accountBindingInFlight) {
      if (typeof callback === "function") {
        callback(false);
      }
      return;
    }
    if (!force && state.lastAccountBindSignature === syncSignature && now - state.lastAccountBindAttemptAt < 10 * 60 * 1000) {
      if (typeof callback === "function") {
        callback(false);
      }
      return;
    }

    state.accountBindingInFlight = true;
    state.lastAccountBindAttemptAt = now;
    state.lastAccountBindSignature = syncSignature;

    requestBackendJson("GET", state.backendBaseUrl + "/api/me", null, function (payload) {
      if (!payload || !payload.ok || !payload.loggedIn || !payload.viewer || !payload.viewer.email) {
        state.accountBindingInFlight = false;
        if (typeof callback === "function") {
          callback(false);
        }
        return;
      }

      const viewerSignature = `${syncSignature}|${String(payload.viewer.email || "").trim().toLowerCase()}`;
      if (!force && state.lastSuccessfulAccountBindSignature === viewerSignature && Date.now() - state.lastSuccessfulAccountBindAt < 6 * 60 * 60 * 1000) {
        state.accountBindingInFlight = false;
        if (typeof callback === "function") {
          callback(false);
        }
        return;
      }

      requestBackendJson(
        "POST",
        state.backendBaseUrl + "/api/account/bind-sync-key",
        {
          syncKey: state.syncKey,
          deviceId: state.deviceId
        },
        function (bindPayload) {
          state.accountBindingInFlight = false;
          if (!bindPayload || !bindPayload.ok) {
            if (typeof callback === "function") {
              callback(false);
            }
            return;
          }
          const nextSyncKey = String(bindPayload.syncKey || state.syncKey || "").trim();
          const nextDeviceId = String(bindPayload.deviceId || state.deviceId || "").trim();
          const identityChanged = nextSyncKey !== state.syncKey || nextDeviceId !== state.deviceId;
          if (identityChanged) {
            state.syncKey = nextSyncKey;
            state.deviceId = nextDeviceId;
            state.lastRemoteSyncAt = 0;
            root.dataset.web25SyncReady = state.syncKey && state.backendBaseUrl ? "1" : "0";
            api.storage.local.set({
              syncKey: state.syncKey,
              deviceId: state.deviceId
            });
          }
          state.lastAccountBindSignature = `${state.backendBaseUrl}|${state.syncKey}|${state.deviceId}`;
          state.lastSuccessfulAccountBindSignature = `${state.lastAccountBindSignature}|${String(payload.viewer.email || "").trim().toLowerCase()}`;
          state.lastSuccessfulAccountBindAt = Date.now();
          if (typeof callback === "function") {
            callback(identityChanged);
          }
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
    const endpoint = state.backendBaseUrl
      + "/api/state?syncKey=" + encodeURIComponent(state.syncKey)
      + "&deviceId=" + encodeURIComponent(state.deviceId || "");
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
      const remoteGlobalReplyBlockedHandles = Array.isArray(payload.globalReplyBlockedHandles) ? payload.globalReplyBlockedHandles : [];
      const remoteSidebarControlsEnabled = normalizeSidebarControlsEnabled(
        payload.sidebarControlsEnabled,
        state.sidebarControlsEnabled
      );
      const nextReplyAiSettingsUpdatedAt = String(payload.replyAiSettingsUpdatedAt || "").trim();
      state.globalTemplateRules = new Set(remoteTemplateRules);
      state.repeatSuspiciousHandles = new Set(remoteRepeatSuspiciousHandles);
      if (state.replyAiSettingsUpdatedAt && state.replyAiSettingsUpdatedAt !== nextReplyAiSettingsUpdatedAt) {
        state.replyAiDecisionCache = new Map();
        state.replyAiInFlightKeys = new Set();
        state.replyAiQueuedKeys = new Set();
        state.replyAiPendingQueue = [];
        clearTimeout(state.replyAiBatchTimer);
        state.replyAiBatchTimer = null;
        state.replyAiBatchInFlight = false;
        state.lastReplyAiBatchSentAt = 0;
        persistReplyAiDecisionCacheToSession();
      }
      state.replyAiSettingsUpdatedAt = nextReplyAiSettingsUpdatedAt;
      state.globalReplyBlockedHandles = new Set(remoteGlobalReplyBlockedHandles.map(function (item) {
        return String(item || "").trim().toLowerCase();
      }).filter(Boolean));
      state.replyAiEnabled = payload.replyAiEnabled === true;
      if (remoteSidebarControlsEnabled !== state.sidebarControlsEnabled) {
        applySidebarControlsPreference(remoteSidebarControlsEnabled);
        api.storage.local.set({
          sidebarControlsEnabled: remoteSidebarControlsEnabled
        });
      }
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

      getStorageLocal(storageDefaults, function (result) {
        if (state.destroyed) {
          return;
        }

        ensureSyncIdentity(result, function (resolvedResult) {
          if (state.destroyed) {
            return;
          }

          if (resolvedResult.markingDefaultVersion !== MARKING_DEFAULT_VERSION) {
            resolvedResult.markingEnabled = true;
            resolvedResult.markingDefaultVersion = MARKING_DEFAULT_VERSION;
            setStorageLocal({
              markingEnabled: true,
              markingDefaultVersion: MARKING_DEFAULT_VERSION
            });
          }

          state.enabled = Boolean(resolvedResult.enabled);
          state.markingEnabled = resolvedResult.markingEnabled !== false;
          applySidebarControlsPreference(resolvedResult.sidebarControlsEnabled);
          state.backendBaseUrl = normalizeBackendBaseUrl(resolvedResult.backendBaseUrl || storageDefaults.backendBaseUrl);
          state.syncKey = String(resolvedResult.syncKey || "").trim();
          state.deviceId = String(resolvedResult.deviceId || "").trim();
          state.autoHideSyncedKeys = new Set(resolvedResult.autoHideSyncedKeys || []);
          state.adHideSyncedKeys = new Set();
          state.adHidePendingKeys = new Set();
          state.globalTemplateRules = new Set();
          state.globalReplyBlockedHandles = new Set();
          state.replyAiSettingsUpdatedAt = "";
          state.repeatSuspiciousHandles = new Set();
          state.replyAiEnabled = false;
          state.replyAiDecisionCache = new Map();
          state.replyAiInFlightKeys = new Set();
          state.replyAiQueuedKeys = new Set();
          state.replyAiPendingQueue = [];
          clearTimeout(state.replyAiBatchTimer);
          state.replyAiBatchTimer = null;
          state.replyAiBatchInFlight = false;
          state.lastReplyAiBatchSentAt = 0;
          state.replyAiSessionCacheKey = "";
          state.profileSignalCache = new Map();
          state.profileSignalInFlightKeys = new Set();
          root.dataset.web25MarkingEnabled = state.markingEnabled ? "1" : "0";
          root.dataset.web25SyncReady = state.syncKey && state.backendBaseUrl ? "1" : "0";
          hydrateReplyAiDecisionCacheFromSession();

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
            attemptAutoBindSyncKey(true, function (identityChanged) {
              syncRemoteManualState(identityChanged === true, function () {
                attemptAutoBindSyncKey(false);
                callback();
              });
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

      if (changes.sidebarControlsEnabled) {
        applySidebarControlsPreference(changes.sidebarControlsEnabled.newValue);
      }

      if (changes.backendBaseUrl) {
        state.backendBaseUrl = normalizeBackendBaseUrl(changes.backendBaseUrl.newValue);
      }

      if (changes.syncKey) {
        state.syncKey = String(changes.syncKey.newValue || "").trim();
        state.replyAiDecisionCache = new Map();
        state.replyAiInFlightKeys = new Set();
        state.replyAiQueuedKeys = new Set();
        state.replyAiPendingQueue = [];
        clearTimeout(state.replyAiBatchTimer);
        state.replyAiBatchTimer = null;
        state.replyAiBatchInFlight = false;
        state.lastReplyAiBatchSentAt = 0;
        state.replyAiSessionCacheKey = "";
        hydrateReplyAiDecisionCacheFromSession();
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

  function noteScrollActivity() {
    if (state.destroyed || !isDetailPage()) {
      return;
    }

    state.scrollActivityUntil = Date.now() + SCROLL_IDLE_SCAN_DELAY_MS;
  }

  function scheduleScanWithDelay(delayMs) {
    if (state.destroyed || state.suppressObserver) {
      return;
    }

    const requestedDelay = typeof delayMs === "number" ? delayMs : NORMAL_SCAN_DELAY_MS;
    const now = Date.now();
    const minIntervalDelay = Math.max(0, Number(state.lastScanFinishedAt || 0) + MIN_SCAN_INTERVAL_MS - now);
    const scrollDelay = isDetailPage()
      ? Math.max(0, Number(state.scrollActivityUntil || 0) - now)
      : 0;
    const effectiveDelay = Math.max(requestedDelay, minIntervalDelay, scrollDelay);

    clearTimeout(state.scanTimer);
    state.scanTimer = setTimeout(scanPage, effectiveDelay);
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

  function queueSidebarStabilizationScans(delays) {
    if (state.destroyed) {
      return;
    }

    state.sidebarStabilizeTimers.forEach(function (timerId) {
      clearTimeout(timerId);
    });
    state.sidebarStabilizeTimers = [];

    (delays || []).forEach(function (delayMs) {
      const timerId = setTimeout(function () {
        if (state.destroyed) {
          return;
        }
        scanSidebarModules();
      }, delayMs);
      state.sidebarStabilizeTimers.push(timerId);
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

    const fallbackText = String(article.innerText || "").replace(/\s+/g, " ").trim();
    if (fallbackText) {
      return fallbackText;
    }

    const authorMeta = getReplyAuthorMeta(article);
    const evidence = [authorMeta.displayName, authorMeta.handle].filter(Boolean).join(" ");
    return evidence ? ("账号线索：" + evidence) : "";
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
    const strongDisplayNameRisk = Boolean(
      authorMeta
      && window.Web25Rules
      && typeof window.Web25Rules.displayNameLooksStrongLure === "function"
      && window.Web25Rules.displayNameLooksStrongLure(authorMeta.displayName || "")
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

    if (analysis && analysis.hasGeoRelationshipBait) {
      return "pattern:geo-relationship-bait";
    }

    if (analysis && analysis.hasBaitQuestionShape) {
      return "pattern:bait-question-shape";
    }

    if (
      analysis
      && strongDisplayNameRisk
      && (analysis.hasLowInformationBadge || analysis.hasFragmentedSymbolicReply || analysis.hasMinimalTextPayload || analysis.hasThinSymbolOrNumberPayload)
    ) {
      return "pattern:low-information-strong-lure-name";
    }

    if (
      analysis
      && displayNameRisk
      && suspiciousHandle
      && (
        analysis.hasLowInformationBadge
        || analysis.hasFragmentedSymbolicReply
        || analysis.hasMinimalTextPayload
        || analysis.hasThinSymbolOrNumberPayload
      )
    ) {
      return "pattern:low-information-lure-account";
    }

    if (analysis && analysis.hasShareLinkScam) {
      return "pattern:share-link-scam";
    }

    if (analysis && analysis.hasEroticMentionRedirect) {
      return "pattern:mention-lure-redirect";
    }

    if (analysis && analysis.hasExplicitEroticBait) {
      return "pattern:explicit-erotic-bait";
    }

    if (analysis && analysis.hasSpamTemplateSignal) {
      return "pattern:spam-template-signal";
    }

    if (analysis && analysis.hasPoeticSpamSloganBait && suspiciousHandle) {
      return "pattern:poetic-slogan-lure-account";
    }

    if (analysis && analysis.hasDecorativeSloganBait && suspiciousHandle) {
      return "pattern:decorative-slogan-lure-account";
    }

    if (analysis && analysis.hasEmojiNoiseBait && suspiciousHandle) {
      return "pattern:emoji-noise-lure-account";
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

  function getCurrentThreadCacheKey() {
    return extractStatusId(location.pathname) || extractStatusId(location.href) || location.pathname || location.href;
  }

  function getManualTrayEntryKey(keys, replyText) {
    if (keys) {
      return keys.statusKey || keys.primaryKey || keys.textKey || keys.compactTextKey || keys.patternTextKey || keys.normalized || "";
    }

    const normalizedReply = window.Web25Rules && typeof window.Web25Rules.normalizeText === "function"
      ? window.Web25Rules.normalizeText(replyText || "")
      : String(replyText || "").trim();
    return normalizedReply ? "text:" + normalizedReply : "";
  }

  function cloneBottomEntry(entry) {
    if (!entry) {
      return null;
    }

    return {
      stableId: entry.stableId || "",
      replyText: entry.replyText || "",
      hiddenSource: entry.hiddenSource === "history" ? "history" : "manual",
      manualKeys: cloneManualKeys(entry.manualKeys),
      replyDisplayName: entry.replyDisplayName || "X 用户",
      replyHandle: entry.replyHandle || ""
    };
  }

  function resetManualTrayEntries() {
    state.manualTrayEntries = new Map();
    state.manualTrayThreadKey = getCurrentThreadCacheKey();
  }

  function syncManualTrayThreadKey() {
    if (!PERSISTENT_MANUAL_TRAY_SUPPORTED) {
      return;
    }

    const nextThreadKey = getCurrentThreadCacheKey();
    if (!nextThreadKey) {
      return;
    }

    if (state.manualTrayThreadKey && state.manualTrayThreadKey !== nextThreadKey) {
      state.manualTrayEntries = new Map();
    }

    state.manualTrayThreadKey = nextThreadKey;
  }

  function rememberManualTrayEntry(entry) {
    if (!PERSISTENT_MANUAL_TRAY_SUPPORTED || !entry || !entry.manualKeys) {
      return;
    }

    syncManualTrayThreadKey();
    const cacheKey = getManualTrayEntryKey(entry.manualKeys, entry.replyText);
    if (!cacheKey) {
      return;
    }

    const nextEntry = cloneBottomEntry(entry);
    const existingEntry = state.manualTrayEntries.get(cacheKey);
    if (!nextEntry) {
      return;
    }

    if (existingEntry && existingEntry.hiddenSource === "manual") {
      nextEntry.hiddenSource = "manual";
    }

    if (!nextEntry.stableId) {
      nextEntry.stableId = cacheKey;
    }

    state.manualTrayEntries.set(cacheKey, nextEntry);
  }

  function forgetManualTrayEntry(keys, replyText) {
    if (!PERSISTENT_MANUAL_TRAY_SUPPORTED) {
      return;
    }

    syncManualTrayThreadKey();
    const cacheKey = getManualTrayEntryKey(keys, replyText);
    if (!cacheKey) {
      return;
    }

    state.manualTrayEntries.delete(cacheKey);
  }

  function pruneManualTrayEntries() {
    if (!PERSISTENT_MANUAL_TRAY_SUPPORTED || !state.manualTrayEntries.size) {
      return;
    }

    syncManualTrayThreadKey();
    Array.from(state.manualTrayEntries.entries()).forEach(function (pair) {
      const cacheKey = pair[0];
      const entry = pair[1];
      if (!entry || !entry.manualKeys) {
        state.manualTrayEntries.delete(cacheKey);
        return;
      }

      if (hasAllowDecisionKey(state.manualAllowTexts, entry.manualKeys) || !hasDecisionKey(state.manualHideTexts, entry.manualKeys)) {
        state.manualTrayEntries.delete(cacheKey);
      }
    });
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

  function removeAllHiding(options) {
    const keepSidebarUi = Boolean(options && options.keepSidebarUi);
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

    if (!keepSidebarUi) {
      clearSidebarModuleUi();
    }
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
    captureRevealedListScrollPosition();
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
    bindRevealedListScrollTracking(state.revealedListItemsEl);
    restoreRevealedListScrollPosition();
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
    const wasOpen = state.bottomTrayOpen === true;
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

    if (state.bottomTrayOpen && !wasOpen) {
      state.revealedListScrollTop = 0;
      requestAnimationFrame(function () {
        if (state.revealedListItemsEl) {
          state.revealedListItemsEl.scrollTop = 0;
        }
      });
    }

    if (!state.bottomTrayOpen) {
      state.revealedListInteractionUntil = 0;
      clearTimeout(state.revealedListInteractionTimer);
      state.revealedListInteractionTimer = null;
    } else if (state.pendingRevealedListPayload) {
      scheduleDeferredRevealedListRefresh();
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
      meta.textContent = buildSummaryText(counts.auto, counts.history, counts.manual, counts.scanned || 0, counts.ai || 0, counts.aiReviewed || 0);
      toggleButton.textContent = "查看列表";
      toggleButton.disabled = true;
      toggleButton.classList.add("web25-hidden-summary-toggle-disabled");
      toggleButton.setAttribute("aria-disabled", "true");
    } else {
      title.textContent = "Colorful Toilet 已整理 " + totalCount + " 条回复";
      meta.textContent = buildSummaryText(counts.auto, counts.history, counts.manual, counts.scanned || 0, counts.ai || 0, counts.aiReviewed || 0);
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
      bindRevealedListScrollTracking(items);
    }

    const title = state.revealedListEl.querySelector(".web25-revealed-list-title");
    const meta = state.revealedListEl.querySelector(".web25-revealed-list-meta");
    title.textContent = "已整理的回复";
    meta.textContent = buildSummaryText(counts.auto, counts.history, counts.manual, 0, counts.ai || 0, counts.aiReviewed || 0);

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

    captureRevealedListScrollPosition();

    const signature = revealedReplies.map(function (entry) {
      return entry.stableId + ":" + entry.hiddenSource + ":" + String(entry.aiReasonShort || "");
    }).join("|");

    if (state.revealedSignature === signature) {
      if (state.revealedListEl) {
        state.revealedListEl.classList.toggle("web25-revealed-list-compact", revealedReplies.length <= 2);
      }
      restoreRevealedListScrollPosition();
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
    restoreRevealedListScrollPosition();
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

    syncManualTrayThreadKey();
    const authorMeta = getReplyAuthorMeta(replyArticle);
    const protectedAccount = isProtectedAccount(replyArticle, authorMeta);
    const storedKeys = getStoredManualKeys(keys, protectedAccount, replyText);
    const manualTrayEntry = {
      stableId: keys.statusKey || keys.primaryKey || keys.textKey || keys.compactTextKey || keys.patternTextKey || ("manual:" + (replyText || "")),
      replyText: replyText || "",
      hiddenSource: "manual",
      manualKeys: cloneManualKeys(keys),
      replyDisplayName: authorMeta.displayName,
      replyHandle: authorMeta.handle
    };

    if (kind === "hide") {
      addDecisionKeys(state.manualHideTexts, storedKeys);
      removeDecisionKeys(state.manualAllowTexts, storedKeys);
      rememberManualTrayEntry(manualTrayEntry);
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
    forgetManualTrayEntry(keys, replyText);
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
    resetManualTrayEntries();
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
    hideButton.textContent = "冲走";
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

  function buildReplyAiCacheKey(manualKeys, authorMeta, replyText) {
    if (manualKeys && manualKeys.statusKey) {
      return manualKeys.statusKey;
    }

    const normalizedText = manualKeys && manualKeys.normalized
      ? manualKeys.normalized
      : (window.Web25Rules && typeof window.Web25Rules.normalizeText === "function"
        ? window.Web25Rules.normalizeText(replyText)
        : String(replyText || "").trim());
    const handle = authorMeta && authorMeta.handle ? String(authorMeta.handle || "").trim().toLowerCase() : "";
    if (!handle && !normalizedText) {
      return "";
    }
    return ["reply-ai", handle, normalizedText.slice(0, 240)].join("|");
  }

  function getReplyAiSessionCacheStorageKey() {
    if (!state.syncKey) {
      return "";
    }

    return REPLY_AI_SESSION_CACHE_PREFIX + ":" + state.syncKey;
  }

  function persistReplyAiDecisionCacheToSession() {
    const storageKey = getReplyAiSessionCacheStorageKey();
    if (!storageKey || typeof sessionStorage === "undefined") {
      return;
    }

    try {
      const entries = Array.from(state.replyAiDecisionCache.entries())
        .filter(function (entry) {
          return entry
            && entry[0]
            && entry[1]
            && entry[1].decision
            && entry[1].decision.isFinal
            && entry[1].decision.status !== "failed";
        })
        .sort(function (left, right) {
          return Number((right[1] && right[1].updatedAt) || 0) - Number((left[1] && left[1].updatedAt) || 0);
        })
        .slice(0, REPLY_AI_SESSION_CACHE_LIMIT)
        .map(function (entry) {
          return {
            cacheKey: entry[0],
            itemId: Number(entry[1].itemId || 0),
            updatedAt: Number(entry[1].updatedAt || 0),
            decision: entry[1].decision
          };
        });

      sessionStorage.setItem(storageKey, JSON.stringify(entries));
      state.replyAiSessionCacheKey = storageKey;
    } catch (error) {
      // Ignore session storage quota / access failures.
    }
  }

  function hydrateReplyAiDecisionCacheFromSession() {
    const storageKey = getReplyAiSessionCacheStorageKey();
    if (!storageKey || typeof sessionStorage === "undefined") {
      state.replyAiSessionCacheKey = "";
      return;
    }

    if (state.replyAiSessionCacheKey === storageKey && state.replyAiDecisionCache.size > 0) {
      return;
    }

    try {
      const raw = sessionStorage.getItem(storageKey);
      state.replyAiSessionCacheKey = storageKey;
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }

      parsed.forEach(function (entry) {
        if (!entry || !entry.cacheKey || !entry.decision || !entry.decision.isFinal || entry.decision.status === "failed") {
          return;
        }

        state.replyAiDecisionCache.set(String(entry.cacheKey), {
          itemId: Number(entry.itemId || 0),
          decision: entry.decision,
          updatedAt: Number(entry.updatedAt || 0)
        });
      });
    } catch (error) {
      // Ignore invalid cached payloads.
    }
  }

  function normalizeProfilePath(value) {
    const raw = String(value || "").trim();
    if (!raw) {
      return "";
    }

    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        if (!/^(?:x|twitter)\.com$/i.test(parsed.hostname.replace(/^www\./, ""))) {
          return "";
        }
        return parsed.pathname || "";
      } catch (error) {
        return "";
      }
    }

    return raw.startsWith("/") ? raw : `/${raw.replace(/^@/, "")}`;
  }

  function getReplyProfilePath(replyArticle, authorMeta) {
    const userNameNode = replyArticle ? replyArticle.querySelector('[data-testid="User-Name"]') : null;
    const candidateLinks = Array.from(userNameNode && userNameNode.querySelectorAll ? userNameNode.querySelectorAll('a[href]') : [])
      .map(function (node) {
        return normalizeProfilePath(node.getAttribute("href") || "");
      })
      .filter(Boolean);

    const directProfile = candidateLinks.find(function (path) {
      return /^\/[^/?#]+\/?$/.test(path);
    });
    if (directProfile) {
      return directProfile;
    }

    const handle = authorMeta && authorMeta.handle ? String(authorMeta.handle || "").trim().replace(/^@/, "") : "";
    return handle ? `/${handle}` : "";
  }

  function normalizeAvatarImageUrl(value) {
    const raw = String(value || "").trim();
    if (!raw || !/^https?:\/\//i.test(raw)) {
      return "";
    }

    try {
      const parsed = new URL(raw);
      const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
      if (!/(^|\.)twimg\.com$/.test(hostname)) {
        return "";
      }
      return parsed.href.slice(0, 800);
    } catch (error) {
      return "";
    }
  }

  function getReplyAvatarNode(replyArticle) {
    if (!replyArticle || !replyArticle.querySelectorAll) {
      return null;
    }

    const selectorGroups = [
      '[data-testid="Tweet-User-Avatar"] img[src]',
      '[data-testid^="UserAvatar-Container"] img[src]',
      'a[href] img[src*="profile_images"]',
      'img[src*="profile_images"]'
    ];

    for (let index = 0; index < selectorGroups.length; index += 1) {
      const node = replyArticle.querySelector(selectorGroups[index]);
      if (node && normalizeAvatarImageUrl(node.getAttribute("src") || "")) {
        return node;
      }
    }

    return null;
  }

  function normalizeContextTextForOverlap(value) {
    return String(value || "")
      .replace(ZERO_WIDTH_TEXT_PATTERN, "")
      .replace(/[^\p{Script=Han}A-Za-z0-9]+/gu, "")
      .toLowerCase();
  }

  function hasUsefulContextOverlap(replyText, mainText) {
    const reply = normalizeContextTextForOverlap(replyText);
    const main = normalizeContextTextForOverlap(mainText);
    if (!reply || !main || reply.length < 4 || main.length < 8) {
      return false;
    }

    const grams = new Set();
    for (let index = 0; index <= reply.length - 2; index += 1) {
      const gram = reply.slice(index, index + 2);
      if (/^(?:这个|那个|我们|你们|他们|一下|真的|可以|没有|就是|什么|怎么|一个)$/.test(gram)) {
        continue;
      }
      grams.add(gram);
    }

    for (const gram of grams) {
      if (gram && main.includes(gram)) {
        return true;
      }
    }
    return false;
  }

  function buildReplyAvatarEvidence(replyArticle, authorMeta, replyText, mainText, analysis, protectedAccount) {
    const avatarNode = getReplyAvatarNode(replyArticle);
    const imageUrl = avatarNode ? normalizeAvatarImageUrl(avatarNode.getAttribute("src") || "") : "";
    const altText = avatarNode ? String(avatarNode.getAttribute("alt") || "").replace(/\s+/g, " ").trim().slice(0, 160) : "";
    const tags = [];
    const suspiciousHandle = Boolean(
      window.Web25Rules
      && typeof window.Web25Rules.handleLooksSuspicious === "function"
      && window.Web25Rules.handleLooksSuspicious(authorMeta && authorMeta.handle ? authorMeta.handle : "")
    );
    const thinOrBait = Boolean(analysis && (
      analysis.hasMinimalTextPayload
      || analysis.hasFragmentedSymbolicReply
      || analysis.hasThinSymbolOrNumberPayload
      || analysis.hasLowInformationBadge
      || analysis.hasDecorativeSloganBait
      || analysis.hasPoeticSpamSloganBait
      || analysis.hasEmojiNoiseBait
      || analysis.hasSpamTemplateSignal
      || analysis.hasBaitQuestionShape
    ));
    const contextDetached = Boolean(
      mainText
      && thinOrBait
      && String(analysis && analysis.compact ? analysis.compact : replyText || "").length <= 24
      && !hasUsefulContextOverlap(replyText, mainText)
    );

    if (suspiciousHandle) {
      tags.push("suspicious_handle");
    }
    if (analysis && analysis.hasPoeticSpamSloganBait) {
      tags.push("poetic_low_substance_reply");
    }
    if (analysis && analysis.hasDecorativeSloganBait) {
      tags.push("decorative_low_substance_reply");
    }
    if (analysis && analysis.hasEmojiNoiseBait) {
      tags.push("emoji_noise_reply");
    }
    if (thinOrBait) {
      tags.push("thin_or_bait_reply");
    }
    if (contextDetached) {
      tags.push("context_detached_reply");
    }

    const shouldRequestVision = Boolean(
      imageUrl
      && !protectedAccount
      && suspiciousHandle
      && (
        contextDetached
        || (analysis && analysis.hasPoeticSpamSloganBait)
        || (analysis && analysis.hasDecorativeSloganBait)
        || (analysis && analysis.hasEmojiNoiseBait)
      )
    );

    if (shouldRequestVision) {
      tags.push("avatar_vision_requested");
    }

    return {
      imageUrl: imageUrl,
      altText: altText,
      evidenceTags: Array.from(new Set(tags)),
      fetchStatus: imageUrl ? "ok" : "missing",
      visionRequested: shouldRequestVision ? 1 : 0
    };
  }

  function extractProfileSignalsFromHtml(html, profilePath) {
    const emptyResult = {
      profilePath: profilePath || "",
      bioText: "",
      signalTags: [],
      links: [],
      fetchStatus: "empty",
      fetchedAt: new Date().toISOString()
    };

    if (!html || typeof html !== "string") {
      return emptyResult;
    }

    let doc = null;
    try {
      doc = new DOMParser().parseFromString(html, "text/html");
    } catch (error) {
      doc = null;
    }

    if (!doc) {
      return Object.assign({}, emptyResult, {
        fetchStatus: "error"
      });
    }

    const metaTexts = [
      doc.querySelector('meta[property="og:description"]'),
      doc.querySelector('meta[name="description"]'),
      doc.querySelector('meta[name="twitter:description"]')
    ].map(function (node) {
      return node ? String(node.getAttribute("content") || "").replace(/\s+/g, " ").trim() : "";
    }).filter(Boolean);

    const bioText = metaTexts
      .slice()
      .sort(function (left, right) {
        return right.length - left.length;
      })[0] || "";

    const links = Array.from(doc.querySelectorAll('a[href]'))
      .map(function (node) {
        return String(node.getAttribute("href") || "").trim();
      })
      .filter(function (href) {
        if (!href || href.startsWith("/") || href.startsWith("#")) {
          return false;
        }
        return /^https?:\/\//i.test(href) && !/https?:\/\/(?:www\.)?(?:x|twitter)\.com\//i.test(href);
      })
      .slice(0, 6);

    const combined = [bioText].concat(links).join(" ");
    const signalTags = [];
    if (/(?:vx|wx|tg|qq|telegram|电报|飛機|飞机|联系方式|聯繫方式|联系我|聯繫我)/i.test(combined)) {
      signalTags.push("contact_keyword");
    }
    if (/(?:vx|wx|tg|qq)[a-z0-9_-]{3,}|t\.me\/|wa\.me\/|telegram\.me\//i.test(combined)) {
      signalTags.push("contact_payload");
    }
    if (links.length > 0) {
      signalTags.push("external_link");
    }
    if (/(?:看主页|点主页|置顶|简介|资料|签名|自介|搜id|小号|入口)/i.test(combined)) {
      signalTags.push("profile_redirect");
    }
    if (/(?:免费|无偿|同城|搭子|主人|小狗|破处|约炮|福利|资源|频道|群号)/i.test(combined)) {
      signalTags.push("suspicious_bio");
    }

    return {
      profilePath: profilePath || "",
      bioText: bioText.slice(0, 800),
      signalTags: Array.from(new Set(signalTags)),
      links: links,
      fetchStatus: bioText || links.length || signalTags.length ? "ok" : "empty",
      fetchedAt: new Date().toISOString()
    };
  }

  function shouldFetchReplyProfileSignals(authorMeta, analysis, protectedAccount) {
    if (!authorMeta || !authorMeta.handle || !state.replyAiEnabled) {
      return false;
    }

    const highRiskDisplayName = Boolean(
      window.Web25Rules
      && typeof window.Web25Rules.displayNameLooksHighRisk === "function"
      && window.Web25Rules.displayNameLooksHighRisk(authorMeta.displayName || "")
    );
    const lureDisplayName = Boolean(
      window.Web25Rules
      && typeof window.Web25Rules.displayNameLooksLure === "function"
      && window.Web25Rules.displayNameLooksLure(authorMeta.displayName || "")
    );
    const suspiciousHandle = Boolean(
      window.Web25Rules
      && typeof window.Web25Rules.handleLooksSuspicious === "function"
      && window.Web25Rules.handleLooksSuspicious(authorMeta.handle || "")
    );
    const minimalOrBait = Boolean(
      analysis
      && (
        analysis.hasMinimalTextPayload
        || analysis.hasLowInformationBadge
        || analysis.hasLureEmoji
        || analysis.hasExternalContactPayload
        || analysis.hasGeoMeetupBait
        || analysis.hasGeoRelationshipBait
        || analysis.hasBaitQuestionShape
      )
    );

    if (protectedAccount) {
      return highRiskDisplayName || (lureDisplayName && minimalOrBait) || Boolean(analysis && analysis.hasExternalContactPayload);
    }

    return highRiskDisplayName || lureDisplayName || suspiciousHandle || minimalOrBait;
  }

  function loadReplyProfileSignals(replyArticle, authorMeta, analysis, protectedAccount, callback) {
    const handleKey = authorMeta && authorMeta.handle ? String(authorMeta.handle || "").trim().toLowerCase() : "";
    const emptyResult = {
      profilePath: getReplyProfilePath(replyArticle, authorMeta),
      bioText: "",
      signalTags: [],
      links: [],
      fetchStatus: "not_requested",
      fetchedAt: ""
    };

    if (!shouldFetchReplyProfileSignals(authorMeta, analysis, protectedAccount) || !handleKey) {
      callback(emptyResult);
      return;
    }

    const cached = state.profileSignalCache.get(handleKey);
    if (cached && Date.now() - Number(cached.cachedAt || 0) < 30 * 60 * 1000) {
      callback({
        profilePath: cached.profilePath || emptyResult.profilePath,
        bioText: cached.bioText || "",
        signalTags: Array.isArray(cached.signalTags) ? cached.signalTags.slice() : [],
        links: Array.isArray(cached.links) ? cached.links.slice() : [],
        fetchStatus: cached.fetchStatus || "ok",
        fetchedAt: cached.fetchedAt || ""
      });
      return;
    }

    if (state.profileSignalInFlightKeys.has(handleKey)) {
      callback(emptyResult);
      return;
    }

    const profilePath = getReplyProfilePath(replyArticle, authorMeta);
    if (!profilePath || !state.backendBaseUrl) {
      callback(emptyResult);
      return;
    }

    state.profileSignalInFlightKeys.add(handleKey);
    requestBackendText(location.origin.replace(/\/+$/, "") + profilePath, function (html) {
      state.profileSignalInFlightKeys.delete(handleKey);
      const parsed = extractProfileSignalsFromHtml(html, profilePath);
      state.profileSignalCache.set(handleKey, Object.assign({
        cachedAt: Date.now()
      }, parsed));
      callback(parsed);
    }, true, {
      Accept: "text/html,application/xhtml+xml"
    });
  }

  function shouldConsiderReplyAiModeration(replyText, authorMeta, analysis, protectedAccount) {
    return buildReplyAiModerationCandidate(replyText, authorMeta, analysis, protectedAccount).shouldQueue;
  }

  function buildReplyAiModerationCandidate(replyText, authorMeta, analysis, protectedAccount) {
    const emptyCandidate = {
      shouldQueue: false,
      score: 0,
      teacherReviewRequested: false
    };

    if (!state.replyAiEnabled || !state.backendBaseUrl || !state.syncKey || !state.deviceId) {
      return emptyCandidate;
    }

    if (!replyText && !(authorMeta && (authorMeta.displayName || authorMeta.handle))) {
      return emptyCandidate;
    }

    const highRiskDisplayName = Boolean(
      window.Web25Rules
      && typeof window.Web25Rules.displayNameLooksHighRisk === "function"
      && window.Web25Rules.displayNameLooksHighRisk(authorMeta && authorMeta.displayName ? authorMeta.displayName : "")
    );
    const lureDisplayName = Boolean(
      window.Web25Rules
      && typeof window.Web25Rules.displayNameLooksLure === "function"
      && window.Web25Rules.displayNameLooksLure(authorMeta && authorMeta.displayName ? authorMeta.displayName : "")
    );
    const suspiciousHandle = Boolean(
      window.Web25Rules
      && typeof window.Web25Rules.handleLooksSuspicious === "function"
      && window.Web25Rules.handleLooksSuspicious(authorMeta && authorMeta.handle ? authorMeta.handle : "")
    );
    const hasLongDigitHandle = /\d{6,}/.test(String(authorMeta && authorMeta.handle ? authorMeta.handle : "").toLowerCase());
    const accountMetadataSignals = highRiskDisplayName
      || (lureDisplayName && suspiciousHandle)
      || (lureDisplayName && hasLongDigitHandle)
      || (suspiciousHandle && hasLongDigitHandle);
    const analysisSignals = Boolean(
      accountMetadataSignals
      || (
        analysis
        && (
        analysis.hasMinimalTextPayload
        || analysis.hasFragmentedSymbolicReply
        || analysis.hasThinSymbolOrNumberPayload
        || analysis.hasLowInformationBadge
        || analysis.hasLureEmoji
        || analysis.hasEmojiNoiseBait
        || analysis.hasShareLinkScam
        || analysis.hasAccountMention
        || analysis.hasExternalContactPayload
        || analysis.hasGeoMeetupBait
        || analysis.hasBaitQuestionShape
        || analysis.hasExplicitEroticBait
        || analysis.hasSpamTemplateSignal
        || analysis.hasDecorativeSloganBait
        || analysis.hasPoeticSpamSloganBait
        || analysis.hasEroticMentionRedirect
        || (Array.isArray(analysis.matchedSlots) && analysis.matchedSlots.length > 0)
        )
      )
    );
    const matchedSlots = Array.isArray(analysis && analysis.matchedSlots) ? analysis.matchedSlots : [];
    const compactReplyLength = String(analysis && analysis.compact ? analysis.compact : "").length;
    const shortOrThinReply = compactReplyLength === 0
      || compactReplyLength <= 12
      || Boolean(analysis && (
        analysis.hasMinimalTextPayload
        || analysis.hasFragmentedSymbolicReply
        || analysis.hasLowInformationBadge
        || analysis.hasEmojiNoiseBait
      ));
    let score = 0;

    if (highRiskDisplayName) {
      score += 4;
    }
    if (analysis && analysis.hasExternalContactPayload) {
      score += 4;
    }
    if (matchedSlots.includes("account_redirect")) {
      score += 3;
    }
    if (lureDisplayName) {
      score += 2;
    }
    if (analysis && analysis.hasMinimalTextPayload) {
      score += 2;
    }
    if (analysis && analysis.hasFragmentedSymbolicReply) {
      score += 2;
    }
    if (analysis && analysis.hasThinSymbolOrNumberPayload) {
      score += 2;
    }
    if (analysis && analysis.hasLowInformationBadge) {
      score += 2;
    }
    if (analysis && analysis.hasShareLinkScam) {
      score += 4;
    }
    if (analysis && analysis.hasGeoMeetupBait) {
      score += 2;
    }
    if (analysis && analysis.hasGeoRelationshipBait) {
      score += 5;
    }
    if (analysis && analysis.hasExplicitEroticBait) {
      score += 2;
    }
    if (analysis && analysis.hasSpamTemplateSignal) {
      score += 3;
    }
    if (!protectedAccount && analysis && analysis.hasDecorativeSloganBait) {
      score += 2;
    }
    if (!protectedAccount && analysis && analysis.hasPoeticSpamSloganBait) {
      score += 3;
    }
    if (!protectedAccount && analysis && analysis.hasEmojiNoiseBait) {
      score += 2;
    }
    if (analysis && analysis.hasEroticMentionRedirect) {
      score += 3;
    }
    if (suspiciousHandle) {
      score += 1;
    }
    if (hasLongDigitHandle) {
      score += 1;
    }
    if (accountMetadataSignals) {
      score += 2;
    }
    if (analysis && analysis.hasBaitQuestionShape) {
      score += 1;
    }
    if (analysis && analysis.hasLureEmoji) {
      score += 1;
    }
    if (analysis && analysis.hasAccountMention) {
      score += 1;
    }
    if (!protectedAccount && suspiciousHandle && shortOrThinReply) {
      score += 1;
    }
    if (!protectedAccount && suspiciousHandle && analysis && (
      analysis.hasDecorativeSloganBait
      || analysis.hasPoeticSpamSloganBait
      || analysis.hasEmojiNoiseBait
    )) {
      score += 1;
    }
    if (matchedSlots.includes("relationship_or_erotic")) {
      score += 1;
    }
    if (matchedSlots.includes("hook") && matchedSlots.includes("meetup")) {
      score += 1;
    }
    if (matchedSlots.length >= 2) {
      score += 1;
    }
    if (compactReplyLength >= 28 && !highRiskDisplayName && !(analysis && analysis.hasExternalContactPayload)) {
      score -= 1;
    }

    const hasStrongTrigger = highRiskDisplayName
      || Boolean(analysis && analysis.hasShareLinkScam)
      || Boolean(analysis && analysis.hasExternalContactPayload)
      || matchedSlots.includes("account_redirect")
      || Boolean(analysis && analysis.hasEroticMentionRedirect)
      || (!protectedAccount && suspiciousHandle && Boolean(analysis && (
        analysis.hasDecorativeSloganBait
        || analysis.hasPoeticSpamSloganBait
        || analysis.hasEmojiNoiseBait
      )))
      || (accountMetadataSignals && shortOrThinReply);
    const hasWeakTriggerCombo = score >= REPLY_AI_BASE_SUSPICION_THRESHOLD && (
      lureDisplayName
      || suspiciousHandle
      || accountMetadataSignals
      || Boolean(analysis && (
        analysis.hasMinimalTextPayload
        || analysis.hasFragmentedSymbolicReply
        || analysis.hasThinSymbolOrNumberPayload
        || analysis.hasLowInformationBadge
        || analysis.hasEmojiNoiseBait
        || analysis.hasGeoMeetupBait
        || analysis.hasGeoRelationshipBait
        || analysis.hasBaitQuestionShape
        || analysis.hasExplicitEroticBait
        || analysis.hasSpamTemplateSignal
        || analysis.hasDecorativeSloganBait
        || analysis.hasPoeticSpamSloganBait
        || analysis.hasEmojiNoiseBait
        || analysis.hasAccountMention
      ))
      || matchedSlots.length >= 2
    );

    return {
      shouldQueue: Boolean(hasStrongTrigger || hasWeakTriggerCombo),
      score: score,
      teacherReviewRequested: Boolean(
        hasStrongTrigger
        || score >= REPLY_AI_TEACHER_REVIEW_SCORE_THRESHOLD
        || (!protectedAccount && suspiciousHandle && Boolean(analysis && (
          analysis.hasDecorativeSloganBait
          || analysis.hasPoeticSpamSloganBait
          || analysis.hasEmojiNoiseBait
        )))
      )
    };
  }

  function isReplyHandleGloballyBlocked(authorMeta) {
    const handle = authorMeta && authorMeta.handle ? String(authorMeta.handle || "").trim().toLowerCase() : "";
    return Boolean(handle) && state.globalReplyBlockedHandles.has(handle);
  }

  function requestReplyAiDecisionBatch(snapshot, callback) {
    requestBackendJson("POST", state.backendBaseUrl + "/api/ai-replies/batch", snapshot, function (payload) {
      if (!payload || !payload.ok || !Array.isArray(payload.items)) {
        callback(null);
        return;
      }
      callback(payload);
    }, false);
  }

  function loadReplyProfileSignalsAsync(replyArticle, authorMeta, analysis, protectedAccount) {
    return new Promise(function (resolve) {
      loadReplyProfileSignals(replyArticle, authorMeta, analysis, protectedAccount, function (profileSignals) {
        resolve(profileSignals || null);
      });
    });
  }

  function getOldestReplyAiQueuedAt() {
    if (!state.replyAiPendingQueue.length) {
      return 0;
    }

    return state.replyAiPendingQueue.reduce(function (oldest, entry) {
      const queuedAt = Number(entry && entry.queuedAt ? entry.queuedAt : Date.now());
      return oldest === 0 ? queuedAt : Math.min(oldest, queuedAt);
    }, 0);
  }

  function scheduleReplyAiDecisionQueueDrain(force) {
    if (state.destroyed || !state.replyAiEnabled || state.replyAiBatchInFlight || !state.replyAiPendingQueue.length) {
      return;
    }

    clearTimeout(state.replyAiBatchTimer);
    state.replyAiBatchTimer = null;

    const now = Date.now();
    const oldestQueuedAt = getOldestReplyAiQueuedAt();
    const batchAgeMs = oldestQueuedAt ? Math.max(0, now - oldestQueuedAt) : REPLY_AI_BATCH_FLUSH_DELAY_MS;
    const waitForFlushMs = Math.max(0, REPLY_AI_BATCH_FLUSH_DELAY_MS - batchAgeMs);
    const waitForIntervalMs = Math.max(0, REPLY_AI_MIN_BATCH_INTERVAL_MS - (now - Number(state.lastReplyAiBatchSentAt || 0)));
    const enoughItems = state.replyAiPendingQueue.length >= REPLY_AI_BATCH_MAX_ITEMS;
    const delayMs = force
      ? waitForIntervalMs
      : (enoughItems ? waitForIntervalMs : Math.max(waitForFlushMs, waitForIntervalMs));

    state.replyAiBatchTimer = setTimeout(function () {
      state.replyAiBatchTimer = null;
      drainReplyAiDecisionQueue();
    }, Math.max(0, delayMs));
  }

  function drainReplyAiDecisionQueue() {
    if (state.destroyed || !state.replyAiEnabled || state.replyAiBatchInFlight || !state.replyAiPendingQueue.length) {
      return;
    }

    const now = Date.now();
    const oldestQueuedAt = getOldestReplyAiQueuedAt();
    const batchAgeMs = oldestQueuedAt ? Math.max(0, now - oldestQueuedAt) : REPLY_AI_BATCH_FLUSH_DELAY_MS;
    const intervalRemainingMs = Math.max(0, REPLY_AI_MIN_BATCH_INTERVAL_MS - (now - Number(state.lastReplyAiBatchSentAt || 0)));
    if (intervalRemainingMs > 0 || (state.replyAiPendingQueue.length < REPLY_AI_BATCH_MAX_ITEMS && batchAgeMs < REPLY_AI_BATCH_FLUSH_DELAY_MS)) {
      scheduleReplyAiDecisionQueueDrain(false);
      return;
    }

    const batch = [];
    while (batch.length < REPLY_AI_BATCH_MAX_ITEMS && state.replyAiPendingQueue.length > 0) {
      const task = state.replyAiPendingQueue.shift();
      if (!task || !task.cacheKey) {
        continue;
      }

      state.replyAiQueuedKeys.delete(task.cacheKey);
      if (state.replyAiInFlightKeys.has(task.cacheKey)) {
        continue;
      }
      batch.push(task);
    }

    if (!batch.length) {
      return;
    }

    dispatchReplyAiDecisionBatch(batch);
  }

  function dispatchReplyAiDecisionBatch(tasks) {
    if (!Array.isArray(tasks) || !tasks.length) {
      return null;
    }

    state.replyAiBatchInFlight = true;
    tasks.forEach(function (task) {
      state.replyAiInFlightKeys.add(task.cacheKey);
    });

    Promise.all(tasks.map(function (task) {
      return loadReplyProfileSignalsAsync(task.replyArticle, task.authorMeta, task.analysis, task.protectedAccount).then(function (profileSignals) {
        return {
          task: task,
          profileSignals: profileSignals || null
        };
      });
    })).then(function (entries) {
      const threadStatusId = extractStatusId(location.pathname) || extractStatusId(location.href);
      const mainText = entries[0] && entries[0].task ? entries[0].task.mainText || "" : "";
      const snapshot = {
        syncKey: state.syncKey,
        deviceId: state.deviceId,
        threadUrl: location.href,
        threadStatusId: threadStatusId,
        mainPostText: mainText,
        items: entries.map(function (entry) {
          const task = entry.task;
          const profileSignals = entry.profileSignals;
          return {
            clientItemId: task.cacheKey,
            threadUrl: task.threadUrl || location.href,
            threadStatusId: task.threadStatusId || threadStatusId,
            mainPostText: task.mainText || "",
            replyStatusId: task.manualKeys && task.manualKeys.statusKey ? task.manualKeys.statusKey.replace(/^status:/, "") : "",
            replyHandle: task.authorMeta && task.authorMeta.handle ? task.authorMeta.handle : "",
            replyDisplayName: task.authorMeta && task.authorMeta.displayName ? task.authorMeta.displayName : "",
            replyText: task.replyText || "",
            accountProtected: task.protectedAccount ? 1 : 0,
            avatarImageUrl: task.avatarEvidence && task.avatarEvidence.imageUrl ? task.avatarEvidence.imageUrl : "",
            avatarAltText: task.avatarEvidence && task.avatarEvidence.altText ? task.avatarEvidence.altText : "",
            avatarEvidenceTags: task.avatarEvidence && Array.isArray(task.avatarEvidence.evidenceTags)
              ? task.avatarEvidence.evidenceTags.concat(task.teacherReviewRequested ? ["teacher_review_requested"] : [])
              : (task.teacherReviewRequested ? ["teacher_review_requested"] : []),
            avatarFetchStatus: task.avatarEvidence && task.avatarEvidence.fetchStatus ? task.avatarEvidence.fetchStatus : "not_requested",
            avatarVisionRequested: task.avatarEvidence && task.avatarEvidence.visionRequested ? 1 : 0,
            profilePath: profileSignals && profileSignals.profilePath ? profileSignals.profilePath : "",
            profileBioText: profileSignals && profileSignals.bioText ? profileSignals.bioText : "",
            profileSignalTags: profileSignals && Array.isArray(profileSignals.signalTags) ? profileSignals.signalTags : [],
            profileLinks: profileSignals && Array.isArray(profileSignals.links) ? profileSignals.links : [],
            profileFetchStatus: profileSignals && profileSignals.fetchStatus ? profileSignals.fetchStatus : "not_requested",
            profileFetchedAt: profileSignals && profileSignals.fetchedAt ? profileSignals.fetchedAt : ""
          };
        })
      };

      state.lastReplyAiBatchSentAt = Date.now();
      requestReplyAiDecisionBatch(snapshot, function (payload) {
        state.replyAiBatchInFlight = false;
        tasks.forEach(function (task) {
          state.replyAiInFlightKeys.delete(task.cacheKey);
        });

        if (payload && Array.isArray(payload.items)) {
          payload.items.forEach(function (item) {
            const clientItemId = item && item.clientItemId ? String(item.clientItemId || "") : "";
            if (!clientItemId || !item.decision) {
              return;
            }

            state.replyAiDecisionCache.set(clientItemId, {
              itemId: Number(item.itemId || 0),
              decision: item.decision,
              updatedAt: Date.now()
            });
          });
          persistReplyAiDecisionCacheToSession();
          scheduleScanWithDelay(FAST_SCAN_DELAY_MS);
        }

        drainReplyAiDecisionQueue();
      });
    }).catch(function () {
      state.replyAiBatchInFlight = false;
      tasks.forEach(function (task) {
        state.replyAiInFlightKeys.delete(task.cacheKey);
      });
      scheduleReplyAiDecisionQueueDrain(false);
    });

    return null;
  }

  function enqueueReplyAiDecision(replyArticle, mainText, replyText, manualKeys, authorMeta, avatarEvidence, protectedAccount, analysis, aiCandidateScore, teacherReviewRequested) {
    const cacheKey = buildReplyAiCacheKey(manualKeys, authorMeta, replyText);
    if (!cacheKey) {
      return null;
    }

    const cachedDecision = state.replyAiDecisionCache.get(cacheKey);
    if (cachedDecision && cachedDecision.decision && cachedDecision.decision.isFinal) {
      return cachedDecision.decision;
    }

    if (state.replyAiInFlightKeys.has(cacheKey) || state.replyAiQueuedKeys.has(cacheKey)) {
      return null;
    }

    const task = {
      cacheKey: cacheKey,
      replyArticle: replyArticle,
      mainText: mainText,
      replyText: replyText,
      manualKeys: manualKeys,
      authorMeta: authorMeta,
      avatarEvidence: avatarEvidence || null,
      teacherReviewRequested: Boolean(teacherReviewRequested),
      protectedAccount: protectedAccount,
      analysis: analysis,
      aiCandidateScore: Number(aiCandidateScore || 0),
      threadUrl: location.href,
      threadStatusId: extractStatusId(location.pathname) || extractStatusId(location.href),
      queuedAt: Date.now()
    };

    const insertAt = state.replyAiPendingQueue.findIndex(function (entry) {
      return Number(entry && entry.aiCandidateScore ? entry.aiCandidateScore : 0) < task.aiCandidateScore;
    });

    if (insertAt === -1) {
      state.replyAiPendingQueue.push(task);
    } else {
      state.replyAiPendingQueue.splice(insertAt, 0, task);
    }

    state.replyAiQueuedKeys.add(cacheKey);
    scheduleReplyAiDecisionQueueDrain(false);
    return null;
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
    const sourcePresentation = getHiddenSourcePresentation(entry);
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

    let note = null;
    if (entry && entry.aiReasonShort && (
      entry.hiddenSource === "ai"
      || entry.hiddenSource === "ai-global"
      || entry.hiddenSource === "ai-memory"
      || entry.hiddenSource === "ai-pending"
    )) {
      note = document.createElement("div");
      note.className = "web25-bottom-card-note";
      note.textContent = entry.aiReasonShort;
    }

    const footer = document.createElement("div");
    footer.className = "web25-bottom-card-footer";

    const badge = document.createElement("span");
    badge.className = "web25-hidden-badge " + sourcePresentation.className;
    badge.textContent = sourcePresentation.label;
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
    if (note) {
      card.appendChild(note);
    }
    card.appendChild(footer);
    return card;
  }

  function scanPage() {
    if (state.destroyed) {
      return;
    }

    syncManualTrayThreadKey();
    syncBrowserThemeDataset();
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
      queueSidebarStabilizationScans([120, 420, 1200]);
      scanHomeTimelineAds();
      return;
    }

    removeAllAdHiding();

    if (!isDetailPage()) {
      root.dataset.web25Stage = "scan:inactive";
      removeAllHiding();
      scanSidebarModules();
      queueSidebarStabilizationScans([120, 420, 1200]);
      return;
    }

    setScrollAnchoringDisabled(true);
    scanSidebarModules();
    queueSidebarStabilizationScans([120, 420, 1200]);

    const articles = getArticles();
    root.dataset.web25Articles = String(articles.length);
    if (articles.length < 2) {
      root.dataset.web25Stage = "scan:not-enough-articles";
      queueStabilizationScans([700, 1600, 3200]);
      removeAllHiding({ keepSidebarUi: true });
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
      let aiHiddenCount = 0;
      let aiReviewedCount = 0;
      let historyHiddenCount = 0;
      let manualHiddenCount = 0;
      const revealedReplies = [];
      const replySnapshots = replies.map(function (replyArticle) {
        const replyCell = getReplyCell(replyArticle);
        lastReplyCell = replyCell;
        replyCell.removeAttribute("data-web25-pending");
        const replyText = getTweetText(replyArticle);
        const manualKeys = getReplyManualKeys(replyArticle, replyText);
        const analysis = window.Web25Rules && typeof window.Web25Rules.analyzeReplyText === "function"
          ? window.Web25Rules.analyzeReplyText(replyText)
          : null;
        const authorMeta = getReplyAuthorMeta(replyArticle);
        const protectedAccount = isProtectedAccount(replyArticle, authorMeta);
        const avatarEvidence = buildReplyAvatarEvidence(replyArticle, authorMeta, replyText, mainText, analysis, protectedAccount);
        const storedManualKeys = getStoredManualKeys(manualKeys, protectedAccount, replyText);
        const templateRuleMatched = hasTemplateRuleMatch(state.globalTemplateRules, manualKeys);
        const repeatSuspiciousHandle = Boolean(
          manualKeys.accountKey
          && state.repeatSuspiciousHandles.has(manualKeys.accountKey)
        );
        const aiCacheKey = buildReplyAiCacheKey(manualKeys, authorMeta, replyText);
        const aiCandidate = buildReplyAiModerationCandidate(replyText, authorMeta, analysis, protectedAccount);
        const cachedAiEntry = aiCacheKey ? state.replyAiDecisionCache.get(aiCacheKey) : null;
        const cachedAiDecision = cachedAiEntry && cachedAiEntry.decision && cachedAiEntry.decision.isFinal
          ? cachedAiEntry.decision
          : null;
        const failedAiDecision = cachedAiDecision && cachedAiDecision.status === "failed"
          ? cachedAiDecision
          : null;
        const failedAiRetryDue = Boolean(
          failedAiDecision
          && cachedAiEntry
          && (Date.now() - Number(cachedAiEntry.updatedAt || 0) >= REPLY_AI_FAILURE_RETRY_DELAY_MS)
        );
        const readyAiDecision = cachedAiDecision && cachedAiDecision.status === "ready"
          ? cachedAiDecision
          : null;
        let decision;
        let hiddenSource = null;
        const isAllowed = hasAllowDecisionKey(state.manualAllowTexts, storedManualKeys);
        const hasPinnedHide = replyCell.getAttribute("data-web25-manual-pinned") === "1";
        const hasHistoryHide = hasDecisionKey(state.manualHideTexts, storedManualKeys);
        const isManuallyHidden = !isAllowed && (hasPinnedHide || hasHistoryHide);
        const isGloballyBlocked = false;
        const shouldQueueAi = !isAllowed
          && !hasPinnedHide
          && !hasHistoryHide
          && !isGloballyBlocked
          && Boolean(state.replyAiEnabled && state.backendBaseUrl && state.syncKey && state.deviceId)
          && Boolean(aiCacheKey)
          && Boolean(aiCandidate && aiCandidate.shouldQueue)
          && (!cachedAiDecision || failedAiRetryDue);
        const awaitingAiDecision = !isAllowed
          && !hasPinnedHide
          && !hasHistoryHide
          && !isGloballyBlocked
          && !readyAiDecision
          && Boolean(state.replyAiEnabled && state.backendBaseUrl && state.syncKey && state.deviceId)
          && Boolean(aiCacheKey)
          && Boolean(aiCandidate && aiCandidate.shouldQueue);
        const localBaselineDecision = !protectedAccount
          && window.Web25Rules
          && typeof window.Web25Rules.evaluateReply === "function"
          ? window.Web25Rules.evaluateReply(replyText, mainText, {
            displayName: authorMeta.displayName || "",
            handle: authorMeta.handle || "",
            templateRuleMatched: templateRuleMatched,
            isRepeatSuspiciousHandle: repeatSuspiciousHandle
          })
          : null;

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
          hiddenSource = "manual";
        } else if (isGloballyBlocked) {
          decision = {
            hide: true,
            score: 100,
            reasons: ["global-reply-blocklist"]
          };
          hiddenSource = "ai-global";
        } else if (readyAiDecision) {
          decision = {
            hide: readyAiDecision.shouldHide === true,
            score: readyAiDecision.shouldHide === true ? 100 : -10,
            reasons: ["reply-ai:" + String(readyAiDecision.reasonShort || readyAiDecision.decisionLayer || "checked")]
          };
          if (readyAiDecision.shouldHide === true) {
            const aiLayer = String(readyAiDecision.decisionLayer || "");
            hiddenSource = aiLayer === "ai" ? "ai" : "ai-memory";
          }
        } else if (localBaselineDecision && localBaselineDecision.hide === true) {
          decision = {
            hide: true,
            score: Number(localBaselineDecision.score || 100),
            reasons: Array.isArray(localBaselineDecision.reasons) && localBaselineDecision.reasons.length
              ? localBaselineDecision.reasons
              : ["local-baseline-hide"]
          };
          hiddenSource = "auto";
        } else if (awaitingAiDecision) {
          decision = {
            hide: true,
            score: Number(aiCandidate && aiCandidate.score ? aiCandidate.score : 1),
            reasons: ["waiting-for-cloud-ai"]
          };
          hiddenSource = "ai-pending";
        } else {
          decision = {
            hide: false,
            score: 0,
            reasons: ["waiting-for-cloud-ai"]
          };
        }

        return {
          replyArticle: replyArticle,
          replyCell: replyCell,
          replyText: replyText,
          manualKeys: manualKeys,
          storedManualKeys: storedManualKeys,
          authorMeta: authorMeta,
          avatarEvidence: avatarEvidence,
          analysis: analysis,
          protectedAccount: protectedAccount,
          isAllowed: isAllowed,
          decision: decision,
          hiddenSource: hiddenSource,
          isManuallyHidden: isManuallyHidden,
          shouldQueueAi: shouldQueueAi,
          aiCacheKey: aiCacheKey,
          aiCandidateScore: Number(aiCandidate && aiCandidate.score ? aiCandidate.score : 0),
          teacherReviewRequested: Boolean(aiCandidate && aiCandidate.teacherReviewRequested),
          aiReady: Boolean(readyAiDecision),
          aiReasonShort: readyAiDecision && readyAiDecision.shouldHide === true
            ? String(readyAiDecision.reasonShort || "")
            : (
              hiddenSource === "ai-memory"
                ? "命中 AI 学习库。"
                : (hiddenSource === "ai-pending" ? "等待 AI 复审，放过后会自动显示。" : "")
            )
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

        if (entry.aiReady) {
          aiReviewedCount += 1;
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
          } else {
            autoHiddenCount += 1;
            if (hiddenSource === "ai" || hiddenSource === "ai-global" || hiddenSource === "ai-memory") {
              aiHiddenCount += 1;
            }
          }

          const revealedEntry = {
            stableId: manualKeys.statusKey || manualKeys.textKey || manualKeys.compactTextKey || manualKeys.patternTextKey || ("reply:" + hiddenCount + ":" + replyText),
            replyText: replyText,
            hiddenSource: hiddenSource || "auto",
            manualKeys: cloneManualKeys(manualKeys),
            replyDisplayName: authorMeta.displayName,
            replyHandle: authorMeta.handle,
            aiReasonShort: entry.aiReasonShort || ""
          };
          revealedReplies.push(revealedEntry);

          if (hiddenSource === "manual" || hiddenSource === "history") {
            rememberManualTrayEntry(revealedEntry);
          }

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

      replySnapshots
        .filter(function (entry) {
          return !entry.isAllowed && !entry.isManuallyHidden && entry.shouldQueueAi && entry.aiCacheKey;
        })
        .sort(function (left, right) {
          if (right.aiCandidateScore !== left.aiCandidateScore) {
            return right.aiCandidateScore - left.aiCandidateScore;
          }
          return String(left.replyText || "").length - String(right.replyText || "").length;
        })
        .forEach(function (entry) {
          enqueueReplyAiDecision(
            entry.replyArticle,
            mainText,
            entry.replyText,
            entry.manualKeys,
            entry.authorMeta,
            entry.avatarEvidence,
            entry.protectedAccount,
            entry.analysis,
            entry.aiCandidateScore,
            entry.teacherReviewRequested
          );
        });
      root.dataset.web25Stage = "scan:actions-ready";

      if (PERSISTENT_MANUAL_TRAY_SUPPORTED) {
        const visibleManualTrayKeys = new Set(revealedReplies.map(function (entry) {
          return getManualTrayEntryKey(entry.manualKeys, entry.replyText);
        }).filter(Boolean));

        pruneManualTrayEntries();
        state.manualTrayEntries.forEach(function (entry, cacheKey) {
          if (!entry || !entry.manualKeys || visibleManualTrayKeys.has(cacheKey)) {
            return;
          }

          const clonedEntry = cloneBottomEntry(entry);
          if (!clonedEntry) {
            return;
          }

          revealedReplies.push(clonedEntry);
          hiddenCount += 1;
          if (clonedEntry.hiddenSource === "history") {
            historyHiddenCount += 1;
          } else {
            manualHiddenCount += 1;
          }
        });
      }

      const counts = {
        auto: autoHiddenCount,
        ai: aiHiddenCount,
        aiReviewed: aiReviewedCount,
        history: historyHiddenCount,
        manual: manualHiddenCount,
        scanned: replies.length
      };

      root.dataset.web25ReplyCells = String(document.querySelectorAll("[data-web25-reply-cell='1']").length);
      root.dataset.web25ManualButtons = String(document.querySelectorAll(".web25-action-hide").length);

      removeDock();
      root.dataset.web25Stage = "scan:summary-ready";

      if (hiddenCount === 0) {
        clearTimeout(state.revealedListInteractionTimer);
        state.revealedListInteractionTimer = null;
        state.pendingRevealedListPayload = null;
        state.revealedListInteractionUntil = 0;
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
        if (state.bottomTrayOpen && Date.now() < Number(state.revealedListInteractionUntil || 0)) {
          state.pendingRevealedListPayload = {
            counts: Object.assign({}, counts),
            revealedReplies: revealedReplies.slice()
          };
          scheduleDeferredRevealedListRefresh();
        } else {
          state.pendingRevealedListPayload = null;
          updateBottomCards(revealedReplies);
        }
      } else {
        state.pendingRevealedListPayload = null;
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
      state.lastScanFinishedAt = Date.now();
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
      try {
        quarantineExistingReplies();
      } catch (error) {
        root.dataset.web25Error = String(error && error.message ? error.message : error);
        root.dataset.web25Stage = "boot:quarantine-skip";
      }
    }
    readSetting(function () {
      if (state.destroyed) {
        return;
      }

      watchSettingChanges();
      ensureSidebarDebugHooks();
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
          attemptAutoBindSyncKey(false, function (identityChanged) {
            syncRemoteManualState(identityChanged === true, function (changed) {
              if (state.destroyed) {
                return;
              }
              if (changed) {
                scanPage();
              }
            });
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

          attemptAutoBindSyncKey(false, function (identityChanged) {
            syncRemoteManualState(identityChanged === true, function (changed) {
              if (state.destroyed) {
                return;
              }
              if (changed) {
                scanPage();
              }
            });
          });
        };
        document.addEventListener("visibilitychange", state.visibilityListener);
      }

      if (!state.scrollListener) {
        state.scrollListener = function () {
          if (state.destroyed) {
            return;
          }

          noteScrollActivity();
        };
        window.addEventListener("scroll", state.scrollListener, {
          passive: true
        });
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
