const dashboardStatus = document.getElementById("dashboardStatus");
const syncModePill = document.getElementById("syncModePill");
const reviewTools = document.getElementById("reviewTools");
const reviewList = document.getElementById("review-list");
const reviewSearchInput = document.getElementById("reviewSearchInput");
const reviewToggleButton = document.getElementById("reviewToggleButton");
const reviewCountPill = document.getElementById("reviewCountPill");
const reviewFilterGroup = document.getElementById("reviewFilterGroup");
const reviewSortGroup = document.getElementById("reviewSortGroup");
const cloudDashboardSection = document.getElementById("cloudDashboardSection");
const developerSection = document.getElementById("developerSection");
const personalDashboardSection = document.getElementById("personalDashboardSection");
const adSection = document.getElementById("adSection");
const adList = document.getElementById("ad-list");
const adToggleButton = document.getElementById("adToggleButton");
const adCountPill = document.getElementById("adCountPill");
const reviewSection = document.getElementById("reviewSection");
const aiFeedSection = document.getElementById("aiFeedSection");
const aiFeedList = document.getElementById("aiFeedList");
const aiFeedPager = document.getElementById("aiFeedPager");
const sourceDetailPanel = document.getElementById("sourceDetailPanel");
const sourceDetailEyebrow = document.getElementById("sourceDetailEyebrow");
const sourceDetailTitle = document.getElementById("sourceDetailTitle");
const sourceDetailDescription = document.getElementById("sourceDetailDescription");
const sourceDetailCountPill = document.getElementById("sourceDetailCountPill");
const sourceDetailBackButton = document.getElementById("sourceDetailBackButton");
const aiFeedCountPill = document.getElementById("aiFeedCountPill");
const aiEnabledToggle = document.getElementById("aiEnabledToggle");
const aiEnabledStatus = document.getElementById("aiEnabledStatus");
const aiApiKeyInput = document.getElementById("aiApiKeyInput");
const aiApiBaseUrlInput = document.getElementById("aiApiBaseUrlInput");
const aiApiModelInput = document.getElementById("aiApiModelInput");
const aiPromptInput = document.getElementById("aiPromptInput");
const saveAiSettingsButton = document.getElementById("saveAiSettingsButton");
const testAiSettingsButton = document.getElementById("testAiSettingsButton");
const aiSettingsStatus = document.getElementById("aiSettingsStatus");
const developerBannerText = document.getElementById("developerBannerText");
const developerPendingList = document.getElementById("developerPendingList");
const developerPendingPager = document.getElementById("developerPendingPager");
const developerRuleList = document.getElementById("developerRuleList");
const developerRulePager = document.getElementById("developerRulePager");
const developerRevokedList = document.getElementById("developerRevokedList");
const developerSelectAll = document.getElementById("developerSelectAll");
const developerSelectAllText = document.getElementById("developerSelectAllText");
const developerSelectionPill = document.getElementById("developerSelectionPill");
const developerBatchConfirmButton = document.getElementById("developerBatchConfirmButton");

const authPanel = document.getElementById("authPanel");
const loggedOutState = document.getElementById("loggedOutState");
const loggedInState = document.getElementById("loggedInState");
const legacyState = document.getElementById("legacyState");
const emailInput = document.getElementById("emailInput");
const codeInput = document.getElementById("codeInput");
const requestCodeButton = document.getElementById("requestCodeButton");
const verifyCodeButton = document.getElementById("verifyCodeButton");
const authHint = document.getElementById("authHint");
const viewerEmail = document.getElementById("viewerEmail");
const logoutButton = document.getElementById("logoutButton");
const bindingList = document.getElementById("bindingList");

const refreshDashboardButton = document.getElementById("refreshDashboard");
const legacyRefreshDashboard = document.getElementById("legacyRefreshDashboard");

const personalStatNodes = {
  totalSkippedCount: document.getElementById("totalSkippedCount"),
  autoHideCount: document.getElementById("autoHideCount"),
  manualHideCount: document.getElementById("manualHideCount"),
  manualAllowCount: document.getElementById("manualAllowCount"),
  distinctHandleCount: document.getElementById("distinctHandleCount"),
  heroPhraseCount: document.getElementById("heroPhraseCount"),
  adHomeHideCount: document.getElementById("adHomeHideCount"),
  adReplyHideCount: document.getElementById("adReplyHideCount"),
  adHideCount: document.getElementById("adHideCount")
};

const sourceStatNodes = {
  all_skipped: document.getElementById("totalSkippedCount"),
  ai_direct: document.getElementById("sourceAiDirectCount"),
  ai_memory: document.getElementById("sourceAiMemoryCount"),
  manual: document.getElementById("manualHideCount"),
  ads: document.getElementById("adHideCount")
};

const globalStatNodes = {
  autoHideCount: document.getElementById("globalAutoHideCount"),
  adTotalHideCount: document.getElementById("globalAdHideCount"),
  manualHideCount: document.getElementById("globalManualHideCount"),
  distinctHandleCount: document.getElementById("globalDistinctHandleCount"),
  heroPhraseCount: document.getElementById("globalPhraseCount"),
  adHomeHideCount: document.getElementById("globalAdHomeHideCount"),
  adReplyHideCount: document.getElementById("globalAdReplyHideCount")
};

const developerStatNodes = {
  feedCount: document.getElementById("developerFeedCount"),
  activeRuleCount: document.getElementById("developerActiveRuleCount"),
  revokedCount: document.getElementById("developerRevokedCount"),
  pendingCount: document.getElementById("developerPendingCount")
};

const POLL_INTERVAL_MS = 30000;
const SOURCE_DETAIL_PAGE_SIZE = 4;
const LOCAL_AI_SETTINGS_KEY = "web25_local_ai_settings_v1";
const LOCAL_BLOCKED_TOPICS_KEY = "web25_local_blocked_topics_v1";
const DEFAULT_PUBLIC_BACKEND_BASE_URL = "https://colorful-toilet.colorful-toilet.workers.dev";
const DASHBOARD_REQUEST_TIMEOUT_MS = 12000;
const CLOUD_DASHBOARD_CACHE_KEY_PREFIX = "web25_cloud_dashboard_cache_v1";
const EMPTY_REPLY_BODY_LABEL = "这条回复当时没有可读取正文，系统保存了账号信息和判断原因。";
const LEGACY_BACKEND_BASE_URLS = new Set([
  "https://web25-public-pages.pages.dev",
  "https://web25-public.web25-boris.workers.dev",
  "https://colorful-toilet.web25-boris.workers.dev"
]);

const appState = {
  mode: "detecting",
  viewer: null,
  dashboardCache: null,
  adExpanded: false,
  reviewExpanded: false,
  reviewQuery: "",
  reviewFilter: "all",
  reviewSort: "time",
  pollTimer: null,
  developerLoginEnabled: false,
  selectedDeveloperEventIds: new Set(),
  developerPendingPage: 1,
  developerRulePage: 1,
  aiFeedPage: 1,
  sourceBucket: ""
};

function getBackendBaseUrl() {
  const configured = String(window.localStorage.getItem("web25_backend_base_url") || "").trim().replace(/\/+$/, "");
  if (configured) {
    if (LEGACY_BACKEND_BASE_URLS.has(configured)) {
      window.localStorage.setItem("web25_backend_base_url", DEFAULT_PUBLIC_BACKEND_BASE_URL);
      return DEFAULT_PUBLIC_BACKEND_BASE_URL;
    }
    return configured;
  }

  if (window.location.origin && window.location.origin.startsWith("http")) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return DEFAULT_PUBLIC_BACKEND_BASE_URL;
}

function getSyncKeyFromPage() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = String(params.get("syncKey") || "").trim();
  if (fromUrl) {
    window.localStorage.setItem("web25_sync_key", fromUrl);
    return fromUrl;
  }

  return String(window.localStorage.getItem("web25_sync_key") || "").trim();
}

function getDeviceIdFromPage() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = String(params.get("deviceId") || "").trim();
  if (fromUrl) {
    window.localStorage.setItem("web25_device_id", fromUrl);
    return fromUrl;
  }

  return String(window.localStorage.getItem("web25_device_id") || "").trim();
}

function setStatus(message) {
  if (dashboardStatus) {
    dashboardStatus.textContent = message;
  }
}

function setAuthHint(message) {
  if (authHint) {
    authHint.textContent = message;
  }
}

function getCloudDashboardCacheKey(viewer) {
  if (!viewer || !viewer.id) {
    return "";
  }
  return `${CLOUD_DASHBOARD_CACHE_KEY_PREFIX}:${viewer.id}`;
}

function readCloudDashboardCache(viewer) {
  const key = getCloudDashboardCacheKey(viewer);
  if (!key) {
    return null;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "null");
    if (!parsed || typeof parsed !== "object" || !parsed.payload) {
      return null;
    }
    return {
      savedAt: parsed.savedAt || "",
      payload: parsed.payload
    };
  } catch (error) {
    return null;
  }
}

function writeCloudDashboardCache(viewer, payload) {
  const key = getCloudDashboardCacheKey(viewer);
  if (!key || !payload) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify({
      savedAt: new Date().toISOString(),
      payload
    }));
  } catch (error) {
    // Ignore storage failures and continue with the live response.
  }
}

function applyStoredBindingIdentity(binding) {
  if (!binding || typeof binding !== "object") {
    return;
  }

  const syncKey = String(binding.syncKey || "").trim();
  const deviceId = String(binding.deviceId || "").trim();
  if (syncKey) {
    window.localStorage.setItem("web25_sync_key", syncKey);
  }
  if (deviceId) {
    window.localStorage.setItem("web25_device_id", deviceId);
  }
}

function restoreBindingIdentityFromDashboard(payload) {
  if (!payload || typeof payload !== "object") {
    return;
  }

  applyStoredBindingIdentity(payload.activeBinding);
}

function formatViewerLabel(viewer) {
  if (!viewer || !viewer.email) {
    return "-";
  }
  return viewer.isDeveloper ? `${viewer.email} · 开发者` : viewer.email;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char];
  });
}

function setNumber(node, value) {
  if (node) {
    node.textContent = String(value || 0);
  }
}

function setHidden(node, hidden) {
  if (!node) {
    return;
  }
  node.classList.toggle("hidden", hidden);
}

function renderEmpty(container, message) {
  if (container) {
    container.innerHTML = `<div class="empty-state">${message}</div>`;
  }
}

function normalizeBlockedTopicTerms(value) {
  const source = Array.isArray(value)
    ? value
    : String(value || "").split(/[\n,，]+/g);
  const seen = new Set();
  const normalized = [];
  source.forEach((item) => {
    const term = String(item || "").replace(/\s+/g, " ").trim();
    const dedupeKey = term.toLowerCase();
    if (!term || seen.has(dedupeKey)) {
      return;
    }
    seen.add(dedupeKey);
    normalized.push(term);
  });
  return normalized.slice(0, 40);
}

function formatBlockedTopicTerms(value) {
  return normalizeBlockedTopicTerms(value).join("\n");
}

function normalizeAiPrompt(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
    .trim();
}

function getLegacyBlockedPrompt() {
  const legacyTerms = normalizeBlockedTopicTerms(window.localStorage.getItem(LOCAL_BLOCKED_TOPICS_KEY) || "");
  if (!legacyTerms.length) {
    return "";
  }
  return `不想看：${legacyTerms.join("，")}`;
}

function getLocalAiSettings() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_AI_SETTINGS_KEY) || "{}");
    const prompt = normalizeAiPrompt(parsed.prompt || "");
    const legacyPrompt = getLegacyBlockedPrompt();
    return {
      enabled: parsed.enabled !== false,
      apiKey: String(parsed.apiKey || ""),
      baseUrl: String(parsed.baseUrl || ""),
      model: String(parsed.model || ""),
      prompt: prompt || legacyPrompt
    };
  } catch (error) {
    return {
      enabled: true,
      apiKey: "",
      baseUrl: "",
      model: "",
      prompt: getLegacyBlockedPrompt()
    };
  }
}

function saveLocalAiSettings(settings) {
  const next = {
    enabled: settings && typeof settings.enabled === "boolean" ? settings.enabled : true,
    apiKey: String(settings && settings.apiKey ? settings.apiKey : ""),
    baseUrl: String(settings && settings.baseUrl ? settings.baseUrl : ""),
    model: String(settings && settings.model ? settings.model : ""),
    prompt: normalizeAiPrompt(settings && settings.prompt ? settings.prompt : "")
  };
  window.localStorage.setItem(LOCAL_AI_SETTINGS_KEY, JSON.stringify(next));
  window.localStorage.removeItem(LOCAL_BLOCKED_TOPICS_KEY);
  return next;
}

function describeDeveloperKey(key) {
  const raw = String(key || "");
  if (raw.startsWith("status:")) {
    return "原文状态 ID";
  }
  if (raw.startsWith("compact:")) {
    return "压缩文本";
  }
  if (raw.startsWith("text:")) {
    return "清洗文本";
  }
  return "精确规则";
}

function formatRelativeTime(value) {
  if (!value) {
    return "刚刚";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function getSourceMeta(source) {
  if (source === "auto_hide") {
    return {
      label: "Colorful Toilet 自动",
      className: "reason-pill auto"
    };
  }

  if (source === "manual_allow") {
    return {
      label: "恢复误标",
      className: "reason-pill allow"
    };
  }

  return {
    label: "手动标记",
    className: "reason-pill manual"
  };
}

function getAdScopeMeta(eventType) {
  if (eventType === "ad_reply_hide") {
    return {
      label: "回复区广告",
      className: "reason-pill allow",
      placementLabel: "出现在别人的回复区"
    };
  }

  return {
    label: "主页广告",
    className: "reason-pill auto",
    placementLabel: "出现在主页时间线"
  };
}

function getAdAdvertiserLabel(item) {
  const displayName = String(item && item.replyDisplayName ? item.replyDisplayName : "").trim();
  const handle = String(item && item.replyHandle ? item.replyHandle : "").trim();
  return [displayName, handle].filter(Boolean).join(" ") || "未识别广告主";
}

function getReviewEventType(item) {
  return String((item && (item.eventType || item.source)) || "");
}

function getChronologicalReviewItems(items) {
  const list = Array.isArray(items) ? items.slice() : [];
  list.sort((left, right) => {
    const leftTime = new Date(left && left.createdAt ? left.createdAt : 0).getTime();
    const rightTime = new Date(right && right.createdAt ? right.createdAt : 0).getTime();
    return rightTime - leftTime;
  });
  return list;
}

function getReviewWeightKey(item) {
  return String(
    (item && (item.compactText || item.normalizedText || item.replyText || item.replyHandle || item.replyDisplayName)) || ""
  ).trim().toLowerCase();
}

function getReviewWeightCounts(items) {
  const counts = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const key = getReviewWeightKey(item);
    if (!key) {
      return;
    }
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return counts;
}

function getFilteredReviewItems(items) {
  const list = getChronologicalReviewItems(items);
  const query = String(appState.reviewQuery || "").trim().toLowerCase();
  const allowedRecordKeys = getManualAllowRecordKeys(list);

  return list.filter((item) => {
    if (isRestoredHiddenRecord(item, allowedRecordKeys)) {
      return false;
    }

    const eventType = getReviewEventType(item);
    const matchFilter = appState.reviewFilter === "all"
      || (appState.reviewFilter === "auto" && eventType === "auto_hide")
      || (appState.reviewFilter === "manual" && (eventType === "manual_hide" || eventType === "manual_allow"));

    if (!matchFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      item.replyDisplayName,
      item.replyHandle,
      item.replyText,
      item.normalizedText
    ].some((field) => String(field || "").toLowerCase().includes(query));
  });
}

function updateReviewShell(totalCount, visibleCount) {
  if (reviewCountPill) {
    if (!appState.reviewExpanded) {
      reviewCountPill.textContent = "默认收起";
    } else if (appState.reviewQuery || appState.reviewFilter !== "all") {
      reviewCountPill.textContent = `匹配 ${visibleCount} / 最近 ${totalCount} 条`;
    } else {
      reviewCountPill.textContent = `最近 ${totalCount} 条`;
    }
  }

  if (reviewToggleButton) {
    reviewToggleButton.textContent = appState.reviewExpanded ? "收起审查区" : "展开审查区";
  }

  if (reviewTools) {
    reviewTools.classList.toggle("review-tools-collapsed", !appState.reviewExpanded);
  }

  if (reviewList) {
    reviewList.classList.toggle("review-list-collapsed", !appState.reviewExpanded);
  }

  if (reviewSortGroup) {
    Array.from(reviewSortGroup.querySelectorAll("[data-sort]")).forEach((button) => {
      button.classList.toggle("active", button.dataset.sort === appState.reviewSort);
    });
  }
}

function updateAdShell(totalCount) {
  if (adCountPill) {
    adCountPill.textContent = appState.adExpanded ? `最近 ${totalCount} 条` : "默认收起";
  }

  if (adToggleButton) {
    adToggleButton.textContent = appState.adExpanded ? "收起广告记录" : "展开广告记录";
  }

  if (adList) {
    adList.classList.toggle("review-list-collapsed", !appState.adExpanded);
  }
}

function renderAdList(items) {
  if (!adList) {
    return;
  }

  const list = getChronologicalReviewItems(items);
  updateAdShell(list.length);

  if (!appState.adExpanded) {
    adList.innerHTML = "";
    return;
  }

  if (!list.length) {
    renderEmpty(adList, "还没有记录到被跳过的官方广告。");
    return;
  }

  adList.innerHTML = "";
  list.forEach((item) => {
    const meta = getAdScopeMeta(String(item && item.eventType ? item.eventType : ""));
    const row = document.createElement("article");
    row.className = "review-row ad-row";
    row.innerHTML = `
      <div class="review-row-top">
        <div class="review-row-title">
          <span class="${meta.className}">${meta.label}</span>
          <strong>${escapeHtml(getAdAdvertiserLabel(item))}</strong>
        </div>
        <div class="review-row-meta">
          <time>${escapeHtml(formatRelativeTime(item && item.createdAt ? item.createdAt : ""))}</time>
        </div>
      </div>
      <p class="review-body">${escapeHtml(meta.placementLabel)}</p>
    `;
    adList.appendChild(row);
  });
}

function buildAiPostUrl(item) {
  const statusId = String(item && item.statusId ? item.statusId : "").trim();
  const handle = String(item && item.authorHandle ? item.authorHandle : "").trim().replace(/^@/, "");
  if (!statusId || !handle) {
    return "";
  }
  return `https://x.com/${handle}/status/${statusId}`;
}

function buildReplyAiOpenUrl(item) {
  const explicitUrl = String(item && item.threadUrl ? item.threadUrl : "").trim();
  if (/^https?:\/\//i.test(explicitUrl)) {
    return explicitUrl;
  }
  const statusId = String(item && (item.replyStatusId || item.threadStatusId) ? (item.replyStatusId || item.threadStatusId) : "").trim();
  const handle = String(item && item.replyHandle ? item.replyHandle : "").trim().replace(/^@/, "");
  if (!statusId || !handle) {
    return "";
  }
  return `https://x.com/${handle}/status/${statusId}`;
}

function formatReplyAiLabel(label) {
  const mapping = {
    adult_solicitation: "约见/成人导流",
    lead_gen_spam: "引流垃圾",
    contact_redirect: "导流到站外",
    scam_or_fraud: "诈骗风险",
    meaningless_bait: "空洞钓鱼",
    profile_link_risk: "主页导流风险",
    global_blocklist: "账号黑名单"
  };
  return mapping[label] || label || "AI 标签";
}

function formatProfileSignalLabel(label) {
  const mapping = {
    contact_keyword: "简介里有联系方式词",
    contact_payload: "简介里有直达联系方式",
    external_link: "简介里有外链",
    profile_redirect: "简介里有主页导流话术",
    suspicious_bio: "简介里有高风险词"
  };
  return mapping[label] || label || "简介信号";
}

function renderLocalAiSettings(settings, options) {
  const source = settings || getLocalAiSettings();
  const loggedIn = Boolean(options && options.loggedIn);
  if (aiEnabledToggle) {
    aiEnabledToggle.checked = source.enabled;
  }
  if (aiEnabledStatus) {
    aiEnabledStatus.textContent = source.enabled ? "当前开启" : "当前关闭";
  }
  if (aiApiKeyInput && document.activeElement !== aiApiKeyInput) {
    aiApiKeyInput.value = loggedIn ? "" : source.apiKey;
    aiApiKeyInput.placeholder = loggedIn && source.apiKeyConfigured
      ? `已保存 · ****${source.apiKeyLast4 || ""}`
      : "sk-...";
  }
  if (aiApiBaseUrlInput && document.activeElement !== aiApiBaseUrlInput) {
    aiApiBaseUrlInput.value = source.baseUrl;
  }
  if (aiApiModelInput && document.activeElement !== aiApiModelInput) {
    aiApiModelInput.value = source.model || "gpt-5.4-mini";
  }
  if (aiPromptInput && document.activeElement !== aiPromptInput) {
    aiPromptInput.value = source.prompt;
  }
}

function getCachedReplyAiPayload() {
  const cache = appState.dashboardCache || {};
  return cache && cache.replyAi ? cache.replyAi : null;
}

const SOURCE_BUCKETS = [
  {
    id: "all_skipped",
    title: "累计跳过无用内容",
    note: "全部合计",
    empty: "当前还没有跳过记录。"
  },
  {
    id: "ai_direct",
    title: "后台直接下沉",
    note: "后台第一次判断",
    empty: "当前没有由后台新判断下沉的回复。"
  },
  {
    id: "ai_memory",
    title: "后台学习库下沉",
    note: "后台已经学过",
    empty: "当前没有命中后台学习库的记录。"
  },
  {
    id: "manual",
    title: "你手动冲走",
    note: "你的手动标记",
    empty: "当前没有你手动冲走的近期记录。"
  },
  {
    id: "ads",
    title: "跳过官方广告",
    note: "主页和回复区官方广告",
    empty: "当前没有官方广告跳过记录。"
  }
];

const SOURCE_BUCKET_META = SOURCE_BUCKETS.reduce((map, item) => {
  map[item.id] = item;
  return map;
}, {});

const EXTRA_METRIC_DETAIL_META = {};

const METRIC_DETAIL_ALIASES = {
  ad: "ads",
  ad_home: "ads",
  ad_reply: "ads",
  ad_home_hide: "ads",
  ad_hide: "ads",
  ad_reply_hide: "ads",
  ai: "ai_direct",
  ai_hide: "ai_direct",
  ai_reuse: "ai_memory",
  reuse: "ai_memory",
  ai_global: "ai_memory",
  ai_memory_exact: "ai_memory",
  local: "ai_memory",
  account: "ai_memory",
  global_blocklist: "ai_memory",
  manual_hide: "manual",
  manual_allow: "manual"
};

const AI_REUSE_HIDE_LAYERS = new Set([
  "reuse_exact_hide",
  "reuse_template_hide",
  "reuse_account_hide",
  "global_blocklist",
  "ai_memory_exact_text",
  "ai_memory_thin_context",
  "ai_memory_template"
]);

function normalizeMetricDetailId(value) {
  const raw = String(value || "").trim().replace(/-/g, "_");
  if (!raw) {
    return "";
  }
  const normalized = METRIC_DETAIL_ALIASES[raw] || raw;
  if (SOURCE_BUCKET_META[normalized] || EXTRA_METRIC_DETAIL_META[normalized]) {
    return normalized;
  }
  return "";
}

function getRequestedMetricDetailId() {
  const params = new URLSearchParams(window.location.search);
  return normalizeMetricDetailId(params.get("detail") || params.get("source") || "");
}

function isMetricDetailMode() {
  return Boolean(getRequestedMetricDetailId());
}

function getMetricDetailMeta(detailId) {
  const normalized = normalizeMetricDetailId(detailId);
  if (SOURCE_BUCKET_META[normalized]) {
    const sourceMeta = SOURCE_BUCKET_META[normalized];
    return Object.assign({
      eyebrow: "屏蔽来源明细"
    }, sourceMeta, {
      id: normalized
    });
  }
  return EXTRA_METRIC_DETAIL_META[normalized] || Object.assign({
    eyebrow: "明细",
    empty: "当前没有这个分类的近期记录。"
  }, SOURCE_BUCKET_META.all_skipped);
}

function buildConsoleDetailUrl(detailId) {
  const normalized = normalizeMetricDetailId(detailId);
  const url = new URL("/console/", window.location.origin || DEFAULT_PUBLIC_BACKEND_BASE_URL);
  if (normalized) {
    url.searchParams.set("detail", normalized);
  }
  return `${url.pathname}${url.search}`;
}

function navigateToMetricDetail(detailId) {
  const normalized = normalizeMetricDetailId(detailId);
  if (!normalized) {
    return;
  }
  window.location.href = buildConsoleDetailUrl(normalized);
}

function buildConsoleHomeUrl() {
  return "/console/";
}

function clearAiFeedPager() {
  if (aiFeedPager) {
    aiFeedPager.innerHTML = "";
  }
}

function getSourcePagerPages(currentPage, totalPages) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, function (_, index) {
      return index + 1;
    });
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

function renderSourcePager(totalItems, currentPage, totalPages) {
  if (!aiFeedPager) {
    return;
  }

  if (totalPages <= 1) {
    aiFeedPager.innerHTML = "";
    return;
  }

  const startItem = ((currentPage - 1) * SOURCE_DETAIL_PAGE_SIZE) + 1;
  const endItem = Math.min(totalItems, currentPage * SOURCE_DETAIL_PAGE_SIZE);
  const pages = getSourcePagerPages(currentPage, totalPages);
  aiFeedPager.innerHTML = `
    <div class="ai-feed-pager-summary">第 ${escapeHtml(String(currentPage))} / ${escapeHtml(String(totalPages))} 页 · 正在看 ${escapeHtml(String(startItem))}-${escapeHtml(String(endItem))} 条 · 共 ${escapeHtml(String(totalItems))} 条</div>
    <div class="ai-feed-pager-buttons">
      <button class="ghost-button small-button ai-feed-page-button" type="button" data-ai-feed-page-action="prev" ${currentPage > 1 ? "" : "disabled"}>上一页</button>
      ${pages.map((page) => page === "ellipsis"
        ? `<span class="ai-feed-page-ellipsis">…</span>`
        : `<button class="ghost-button small-button ai-feed-page-button${page === currentPage ? " active" : ""}" type="button" data-ai-feed-page="${page}">${page}</button>`
      ).join("")}
      <button class="ghost-button small-button ai-feed-page-button" type="button" data-ai-feed-page-action="next" ${currentPage < totalPages ? "" : "disabled"}>下一页</button>
    </div>
  `;

  Array.from(aiFeedPager.querySelectorAll("[data-ai-feed-page]")).forEach((button) => {
    button.addEventListener("click", function () {
      const nextPage = Number(button.getAttribute("data-ai-feed-page") || 0);
      if (nextPage) {
        changeAiFeedPage(nextPage);
      }
    });
  });

  Array.from(aiFeedPager.querySelectorAll("[data-ai-feed-page-action]")).forEach((button) => {
    button.addEventListener("click", function () {
      const action = String(button.getAttribute("data-ai-feed-page-action") || "");
      changeAiFeedPage(action === "prev" ? currentPage - 1 : currentPage + 1);
    });
  });
}

function changeAiFeedPage(page) {
  const nextPage = Math.max(1, Number(page || 1) || 1);
  if (nextPage === appState.aiFeedPage) {
    return;
  }
  appState.aiFeedPage = nextPage;
  if (isMetricDetailMode()) {
    renderMetricDetailPage(appState.dashboardCache);
    return;
  }
  renderAiFeedSection(getCachedReplyAiPayload());
}

function getBucketMeta(bucketId) {
  return SOURCE_BUCKET_META[bucketId] || SOURCE_BUCKET_META.ai_memory || SOURCE_BUCKETS[0];
}

function getReplyRecordKey(item) {
  if (!item) {
    return "";
  }
  const statusId = String(item.replyStatusId || item.threadStatusId || "").trim();
  if (statusId) {
    return `status:${statusId}`;
  }
  const handle = String(item.replyHandle || "").trim().toLowerCase();
  const text = String(item.compactText || item.normalizedText || item.replyText || "").trim().toLowerCase();
  return handle || text ? `fallback:${handle}:${text}` : "";
}

function getManualAllowRecordKeys(items) {
  const allowedRecordKeys = new Set();
  (Array.isArray(items) ? items : []).forEach((item) => {
    if (getReviewEventType(item) !== "manual_allow") {
      return;
    }
    const key = getReplyRecordKey(item);
    if (key) {
      allowedRecordKeys.add(key);
    }
  });
  return allowedRecordKeys;
}

function isRestoredHiddenRecord(item, allowedRecordKeys) {
  const eventType = getReviewEventType(item);
  if (eventType !== "auto_hide" && eventType !== "manual_hide" && eventType !== "ad_home_hide" && eventType !== "ad_hide" && eventType !== "ad_reply_hide") {
    return false;
  }
  const key = getReplyRecordKey(item);
  return Boolean(key && allowedRecordKeys && allowedRecordKeys.has(key));
}

function getExplicitSourceBucket(item) {
  const raw = String((item && (item.sourceBucket || item.hiddenSource || item.hidden_source)) || "").trim();
  if (!raw) {
    return "";
  }
  const mapping = {
    all_skipped: "all_skipped",
    ai: "ai_direct",
    ai_direct: "ai_direct",
    ai_reuse: "ai_memory",
    ai_memory: "ai_memory",
    history: "ai_memory",
    public_rule: "ai_memory",
    account_blocklist: "ai_memory",
    "ai-global": "ai_memory",
    "ai-memory": "ai_memory",
    global_blocklist: "ai_memory",
    local_rule: "ai_memory",
    auto: "ai_memory",
    manual: "manual",
    manual_hide: "manual",
    restored: "manual",
    manual_allow: "manual",
    ads: "ads",
    ad_home: "ads",
    ad_reply: "ads"
  };
  return mapping[raw] || "";
}

function getReplyAiBucket(item) {
  const decisionLayer = String(item && item.decisionLayer ? item.decisionLayer : "").trim();
  if (AI_REUSE_HIDE_LAYERS.has(decisionLayer)) {
    return "ai_memory";
  }
  return "ai_direct";
}

function getRecentEventBucket(item) {
  const explicit = getExplicitSourceBucket(item);
  if (explicit) {
    return explicit;
  }
  const eventType = getReviewEventType(item);
  if (eventType === "manual_hide") {
    return "manual";
  }
  return "ai_memory";
}

function getBucketReason(item) {
  const bucketId = String(item && item.sourceBucket ? item.sourceBucket : "");
  if (item && item.reasonShort) {
    return item.reasonShort;
  }
  if (item && item.bucketReason) {
    return item.bucketReason;
  }
  if (bucketId === "ai_memory") {
    return "命中后台已经学过的内容。";
  }
  if (bucketId === "manual") {
    return "你手动点过冲走。";
  }
  if (bucketId === "ads") {
    return "跳过 X 官方广告。";
  }
  return "后台已判断为需要下沉。";
}

function makeSourceItem(item, bucketId, overrides) {
  return Object.assign({}, item || {}, overrides || {}, {
    sourceBucket: bucketId,
    sourceBucketLabel: getBucketMeta(bucketId).title
  });
}

function createEmptySourceBuckets() {
  return SOURCE_BUCKETS.reduce((map, bucket) => {
    map[bucket.id] = [];
    return map;
  }, {});
}

function buildSourceBuckets(replyAiPayload) {
  const buckets = createEmptySourceBuckets();
  const replyAiItems = replyAiPayload && Array.isArray(replyAiPayload.recentHides)
    ? replyAiPayload.recentHides.slice()
    : [];
  const recentItems = appState.dashboardCache && Array.isArray(appState.dashboardCache.recent)
    ? appState.dashboardCache.recent.slice()
    : [];
  const adEvents = appState.dashboardCache && Array.isArray(appState.dashboardCache.adEvents)
    ? appState.dashboardCache.adEvents.slice()
    : [];
  const aiRecordKeys = new Set();

  replyAiItems.forEach((item) => {
    const bucketId = getReplyAiBucket(item);
    const normalized = makeSourceItem(item, bucketId, {
      detailType: "reply_ai",
      createdAt: item && item.updatedAt ? item.updatedAt : "",
      canRestoreAi: true
    });
    const key = getReplyRecordKey(normalized);
    if (key) {
      aiRecordKeys.add(key);
    }
    buckets[bucketId].push(normalized);
  });

  const allowedRecordKeys = getManualAllowRecordKeys(recentItems);

  recentItems.forEach((item) => {
    const eventType = getReviewEventType(item);
    const key = getReplyRecordKey(item);
    if (isRestoredHiddenRecord(item, allowedRecordKeys)) {
      return;
    }
    if (eventType === "auto_hide" && key && aiRecordKeys.has(key)) {
      return;
    }
    const bucketId = getRecentEventBucket(item);
    if (bucketId !== "manual" || eventType !== "manual_hide") {
      return;
    }
    buckets[bucketId].push(makeSourceItem(item, bucketId, {
      detailType: "moderation_event",
      canRestoreEvent: eventType === "auto_hide" || eventType === "manual_hide"
    }));
  });

  adEvents.forEach((item) => {
    if (isRestoredHiddenRecord(item, allowedRecordKeys)) {
      return;
    }
    buckets.ads.push(makeSourceItem(item, "ads", {
      detailType: "ad_event",
      bucketReason: getAdScopeMeta(getReviewEventType(item)).placementLabel,
      canRestoreAd: true
    }));
  });

  buckets.all_skipped = []
    .concat(buckets.ai_direct || [])
    .concat(buckets.ai_memory || [])
    .concat(buckets.manual || [])
    .concat(buckets.ads || []);

  SOURCE_BUCKETS.forEach((bucket) => {
    buckets[bucket.id].sort((left, right) => {
      const rightTime = new Date(right && (right.updatedAt || right.createdAt || right.globalBlockedAt) ? (right.updatedAt || right.createdAt || right.globalBlockedAt) : 0).getTime();
      const leftTime = new Date(left && (left.updatedAt || left.createdAt || left.globalBlockedAt) ? (left.updatedAt || left.createdAt || left.globalBlockedAt) : 0).getTime();
      return rightTime - leftTime;
    });
  });

  return buckets;
}

function getSkippedStatsFromDashboard() {
  const hasSkippedStats = Boolean(appState.dashboardCache && appState.dashboardCache.skippedStats);
  const stats = appState.dashboardCache && appState.dashboardCache.skippedStats
    ? appState.dashboardCache.skippedStats
    : {};
  const fallbackPersonal = appState.dashboardCache && appState.dashboardCache.personalStats
    ? appState.dashboardCache.personalStats
    : {};
  const adFallback = Number(fallbackPersonal.adHomeHideEvents || 0) + Number(fallbackPersonal.adReplyHideEvents || 0);
  const manualFallback = Number(fallbackPersonal.manualHideEvents || 0);
  const aiDirectCount = Number(stats.aiDirectHideCount || 0);
  const aiMemoryCount = Number(stats.aiMemoryHideCount || 0);
  return {
    __ready: hasSkippedStats,
    all_skipped: hasSkippedStats ? Number(stats.totalSkippedCount || 0) : 0,
    ai_direct: aiDirectCount,
    ai_memory: aiMemoryCount,
    manual: Number(stats.manualHideCount || manualFallback || 0),
    ads: Number(stats.adHideCount || adFallback || 0)
  };
}

function updateSourceMetricCards(buckets) {
  const stats = getSkippedStatsFromDashboard();
  SOURCE_BUCKETS.forEach((bucket) => {
    const fallbackCount = buckets && Array.isArray(buckets[bucket.id]) ? buckets[bucket.id].length : 0;
    const count = stats.__ready ? stats[bucket.id] : fallbackCount;
    const node = sourceStatNodes[bucket.id];
    if (node) {
      node.textContent = String(count);
    }
  });

  Array.from(document.querySelectorAll("[data-source-bucket]")).forEach((button) => {
    const bucketId = String(button.getAttribute("data-source-bucket") || "");
    button.classList.toggle("active", Boolean(bucketId && getRequestedMetricDetailId() === bucketId));
  });
}

function renderSourceDetailRow(item) {
  const bucketId = String(item && item.sourceBucket ? item.sourceBucket : "local_rule");
  const detailId = normalizeMetricDetailId(item && item.metricDetailId ? item.metricDetailId : bucketId);
  const meta = getMetricDetailMeta(detailId || bucketId);
  const title = [item && item.replyDisplayName, item && item.replyHandle].filter(Boolean).join(" ");
  const openUrl = buildReplyAiOpenUrl(item);
  const safetyLabels = Array.isArray(item && item.matchedSafetyLabels) ? item.matchedSafetyLabels : [];
  const profileSignals = Array.isArray(item && item.matchedProfileSignals) ? item.matchedProfileSignals : [];
  const row = document.createElement("article");
  row.className = "review-row ai-feed-row source-detail-row";
  const canRestoreAi = Boolean(item && item.canRestoreAi && item.replyAiItemId);
  const canRestoreEvent = Boolean(item && (item.canRestoreEvent || item.canRestoreAd));
  const isAdEvent = item && item.detailType === "ad_event";
  const bodyText = isAdEvent
    ? `${getAdAdvertiserLabel(item)} · ${getAdScopeMeta(getReviewEventType(item)).placementLabel}`
    : (item && item.replyText ? item.replyText : EMPTY_REPLY_BODY_LABEL);
  const reasonText = isAdEvent ? getAdScopeMeta(getReviewEventType(item)).placementLabel : getBucketReason(item);
  row.innerHTML = `
    <div class="review-row-top">
      <div class="review-row-title">
        <span class="timeline-pill">${escapeHtml(meta.title)}</span>
        <strong>${escapeHtml(title || "未识别账号")}</strong>
      </div>
      <div class="review-row-meta">
        <time>${escapeHtml(formatRelativeTime(item && (item.updatedAt || item.createdAt || item.globalBlockedAt) ? (item.updatedAt || item.createdAt || item.globalBlockedAt) : ""))}</time>
      </div>
    </div>
    <p class="review-body">${escapeHtml(bodyText)}</p>
    <div class="ai-feed-secondary">
      <p>屏蔽来源：${escapeHtml(meta.title)}</p>
      <p>简短原因：${escapeHtml(reasonText)}</p>
      ${(item && item.mainPostText) ? `<p>原帖上下文：${escapeHtml(item.mainPostText)}</p>` : ""}
      ${(safetyLabels.length || profileSignals.length) ? `
        ${safetyLabels.length ? `<p>命中标签：${escapeHtml(safetyLabels.map(formatReplyAiLabel).join("、"))}</p>` : ""}
        ${profileSignals.length ? `<p>主页辅助信号：${escapeHtml(profileSignals.map(formatProfileSignalLabel).join("、"))}</p>` : ""}
      ` : ""}
    </div>
    <div class="ai-feed-actions">
      ${canRestoreAi ? `<button class="ghost-button small-button ai-feed-restore-button" type="button">恢复误判</button>` : ""}
      ${canRestoreEvent ? `<button class="ghost-button small-button review-restore-button" type="button">恢复这条</button>` : ""}
      ${openUrl ? `<a class="ghost-button small-button" href="${escapeHtml(openUrl)}" target="_blank" rel="noreferrer">在 X 里打开</a>` : ""}
    </div>
  `;

  const aiRestoreButton = row.querySelector(".ai-feed-restore-button");
  if (aiRestoreButton) {
    aiRestoreButton.addEventListener("click", function () {
      restoreItem(item, aiRestoreButton, {
        buttonText: "恢复误判",
        replyAiItemId: item && (item.replyAiItemId || item.id) ? (item.replyAiItemId || item.id) : 0
      });
    });
  }

  const eventRestoreButton = row.querySelector(".review-restore-button");
  if (eventRestoreButton) {
    eventRestoreButton.addEventListener("click", function () {
      restoreItem(item, eventRestoreButton, {
        buttonText: "恢复这条"
      });
    });
  }

  return row;
}

function makeMetricDetailItem(item, detailId, overrides) {
  const meta = getMetricDetailMeta(detailId);
  return Object.assign({}, item || {}, overrides || {}, {
    metricDetailId: detailId,
    sourceBucketLabel: meta.title
  });
}

function buildAutoMetricDetailItems(payload) {
  const recentItems = payload && Array.isArray(payload.recent) ? payload.recent : [];
  const allowedRecordKeys = getManualAllowRecordKeys(recentItems);
  return getChronologicalReviewItems(recentItems)
    .filter((item) => getReviewEventType(item) === "auto_hide" && !isRestoredHiddenRecord(item, allowedRecordKeys))
    .map((item) => makeMetricDetailItem(item, "auto", {
      detailType: "moderation_event",
      sourceBucket: "local_rule",
      bucketReason: "系统自动下沉或隐藏的回复。",
      canRestoreEvent: true
    }));
}

function buildAdMetricDetailItems(payload, detailId) {
  const adEvents = payload && Array.isArray(payload.adEvents) ? payload.adEvents : [];
  const recentItems = payload && Array.isArray(payload.recent) ? payload.recent : [];
  const allowedRecordKeys = getManualAllowRecordKeys(recentItems);
  const targetEventType = detailId === "ad_reply" ? "ad_reply_hide" : "ad_home_hide";
  return getChronologicalReviewItems(adEvents)
    .filter((item) => {
      if (isRestoredHiddenRecord(item, allowedRecordKeys)) {
        return false;
      }
      const eventType = getReviewEventType(item);
      return targetEventType === "ad_home_hide"
        ? eventType === "ad_home_hide" || eventType === "ad_hide"
        : eventType === targetEventType;
    })
    .map((item) => makeMetricDetailItem(item, detailId, {
      detailType: "ad_event",
      sourceBucket: detailId,
      bucketReason: getAdScopeMeta(getReviewEventType(item)).placementLabel,
      canRestoreAd: true
    }));
}

function getMetricDetailItems(detailId, payload) {
  const normalized = normalizeMetricDetailId(detailId);
  const dashboardPayload = payload || appState.dashboardCache || {};
  if (SOURCE_BUCKET_META[normalized]) {
    const buckets = buildSourceBuckets(dashboardPayload.replyAi || null);
    return Array.isArray(buckets[normalized]) ? buckets[normalized] : [];
  }
  if (normalized === "auto") {
    return buildAutoMetricDetailItems(dashboardPayload);
  }
  if (normalized === "ad_home" || normalized === "ad_reply") {
    return buildAdMetricDetailItems(dashboardPayload, normalized);
  }
  return [];
}

function renderMetricDetailPage(payload) {
  if (!aiFeedList) {
    return;
  }

  const detailId = getRequestedMetricDetailId();
  if (!detailId) {
    setHidden(sourceDetailPanel, true);
    clearAiFeedPager();
    aiFeedList.innerHTML = "";
    return;
  }

  const meta = getMetricDetailMeta(detailId);
  const list = getMetricDetailItems(detailId, payload);
  const totalPages = Math.max(1, Math.ceil(list.length / SOURCE_DETAIL_PAGE_SIZE));
  const currentPage = Math.min(totalPages, Math.max(1, Number(appState.aiFeedPage || 1) || 1));
  const pageStartIndex = (currentPage - 1) * SOURCE_DETAIL_PAGE_SIZE;
  const pageItems = list.slice(pageStartIndex, pageStartIndex + SOURCE_DETAIL_PAGE_SIZE);
  appState.aiFeedPage = currentPage;
  appState.sourceBucket = SOURCE_BUCKET_META[detailId] ? detailId : "";
  setHidden(sourceDetailPanel, false);

  if (sourceDetailEyebrow) {
    sourceDetailEyebrow.textContent = meta.eyebrow || "明细";
  }
  if (sourceDetailTitle) {
    sourceDetailTitle.textContent = meta.title;
  }
  if (sourceDetailDescription) {
    sourceDetailDescription.textContent = `${meta.note || "点击进入的分类"}。这里直接显示这个方格背后的具体记录，每条记录旁边都放了恢复入口。`;
  }
  if (sourceDetailCountPill) {
    sourceDetailCountPill.textContent = `${list.length} 条`;
  }
  if (sourceDetailBackButton) {
    sourceDetailBackButton.href = buildConsoleHomeUrl();
  }

  aiFeedList.innerHTML = "";
  if (!list.length) {
    clearAiFeedPager();
    renderEmpty(aiFeedList, meta.empty);
    return;
  }

  pageItems.forEach((item) => {
    aiFeedList.appendChild(renderSourceDetailRow(item));
  });
  renderSourcePager(list.length, currentPage, totalPages);
}

function renderSourceDetail(buckets) {
  if (!aiFeedList) {
    return;
  }

  if (!SOURCE_BUCKET_META[appState.sourceBucket]) {
    setHidden(sourceDetailPanel, true);
    clearAiFeedPager();
    aiFeedList.innerHTML = "";
    updateSourceMetricCards(buckets);
    return;
  }

  const bucketId = appState.sourceBucket;
  const meta = getBucketMeta(bucketId);
  const list = buckets && Array.isArray(buckets[bucketId]) ? buckets[bucketId] : [];
  const totalPages = Math.max(1, Math.ceil(list.length / SOURCE_DETAIL_PAGE_SIZE));
  const currentPage = Math.min(totalPages, Math.max(1, Number(appState.aiFeedPage || 1) || 1));
  const pageStartIndex = (currentPage - 1) * SOURCE_DETAIL_PAGE_SIZE;
  const pageItems = list.slice(pageStartIndex, pageStartIndex + SOURCE_DETAIL_PAGE_SIZE);
  appState.sourceBucket = bucketId;
  appState.aiFeedPage = currentPage;
  setHidden(sourceDetailPanel, false);
  updateSourceMetricCards(buckets);

  if (sourceDetailEyebrow) {
    sourceDetailEyebrow.textContent = "当前分类";
  }
  if (sourceDetailTitle) {
    sourceDetailTitle.textContent = meta.title;
  }
  if (sourceDetailCountPill) {
    sourceDetailCountPill.textContent = `${list.length} 条`;
  }

  aiFeedList.innerHTML = "";
  if (!list.length) {
    clearAiFeedPager();
    renderEmpty(aiFeedList, meta.empty);
    return;
  }

  pageItems.forEach((item) => {
    aiFeedList.appendChild(renderSourceDetailRow(item));
  });
  renderSourcePager(list.length, currentPage, totalPages);
}

function jumpToSourceDetailPanel() {
  if (!sourceDetailPanel || sourceDetailPanel.classList.contains("hidden")) {
    return;
  }
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, "", "#sourceDetailPanel");
  }
  window.requestAnimationFrame(() => {
    sourceDetailPanel.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    try {
      sourceDetailPanel.focus({
        preventScroll: true
      });
    } catch (error) {
      sourceDetailPanel.focus();
    }
  });
}

function openSourceBucket(bucketId) {
  if (!SOURCE_BUCKET_META[bucketId]) {
    return;
  }
  navigateToMetricDetail(bucketId);
}

function renderAiFeedSection(replyAiPayload) {
  const loggedIn = Boolean(appState.viewer);
  setHidden(aiFeedSection, false);
  const settings = loggedIn && replyAiPayload && replyAiPayload.settings
    ? {
      enabled: replyAiPayload.settings.replyAiEnabled !== false,
      apiKey: "",
      apiKeyConfigured: Boolean(replyAiPayload.settings.apiKeyConfigured),
      apiKeyLast4: String(replyAiPayload.settings.apiKeyLast4 || ""),
      baseUrl: String(replyAiPayload.settings.providerBaseUrl || "https://api.openai.com/v1"),
      model: String(replyAiPayload.settings.model || "gpt-5.4-mini"),
      prompt: String(replyAiPayload.settings.moderationPrompt || "")
    }
    : getLocalAiSettings();
  renderLocalAiSettings(settings, {
    loggedIn
  });
  const sourceBuckets = loggedIn ? buildSourceBuckets(replyAiPayload) : createEmptySourceBuckets();
  const totalSourceItems = Array.isArray(sourceBuckets.all_skipped) ? sourceBuckets.all_skipped.length : 0;

  if (aiFeedCountPill) {
    if (!settings.enabled) {
      aiFeedCountPill.textContent = "AI 已关闭 · 规则入口仍可看";
    } else {
      aiFeedCountPill.textContent = totalSourceItems
        ? `来源记录 ${totalSourceItems} 条`
        : (loggedIn ? "来源入口已就绪" : "登录后才会真正生效");
    }
  }

  if (aiSettingsStatus) {
    if (!loggedIn) {
      aiSettingsStatus.textContent = settings.enabled
        ? "未登录时先保存在这台浏览器；真正用于共享 AI 提供商配置还需要先登录。"
        : "当前已关闭，配置也会先保存在这台浏览器。";
    } else if (settings.apiKeyConfigured) {
      aiSettingsStatus.textContent = `当前账号已保存共享 AI Key · ****${settings.apiKeyLast4 || ""}`;
    } else {
      aiSettingsStatus.textContent = "当前账号还没有保存共享 AI Key。";
    }
  }

  if (!aiFeedList) {
    return;
  }

  if (isMetricDetailMode()) {
    updateSourceMetricCards(sourceBuckets);
    return;
  }

  if (!loggedIn) {
    updateSourceMetricCards(sourceBuckets);
    setHidden(sourceDetailPanel, true);
    clearAiFeedPager();
    aiFeedList.innerHTML = "";
    return;
  }

  updateSourceMetricCards(sourceBuckets);
  setHidden(sourceDetailPanel, true);
  clearAiFeedPager();
  aiFeedList.innerHTML = "";
}

function setMetricGroup(statNodes, stats) {
  const adHomeHideEvents = stats.adHomeHideEvents || 0;
  const adReplyHideEvents = stats.adReplyHideEvents || 0;
  const manualHideCount = typeof stats.manualHideCount === "number"
    ? stats.manualHideCount
    : (stats.manualHideEvents || 0);
  const adHideCount = typeof stats.adHideCount === "number"
    ? stats.adHideCount
    : (adHomeHideEvents + adReplyHideEvents);
  setNumber(statNodes.totalSkippedCount, stats.totalSkippedCount || 0);
  setNumber(statNodes.autoHideCount, stats.autoHideEvents || 0);
  if (statNodes.adTotalHideCount) {
    setNumber(statNodes.adTotalHideCount, adHomeHideEvents + adReplyHideEvents);
  }
  setNumber(statNodes.manualHideCount, manualHideCount);
  if (statNodes.manualAllowCount) {
    setNumber(statNodes.manualAllowCount, stats.manualAllowEvents || 0);
  }
  setNumber(statNodes.distinctHandleCount, stats.distinctHiddenHandles || 0);
  setNumber(statNodes.heroPhraseCount, stats.distinctHiddenPhrases || 0);
  setNumber(statNodes.adHomeHideCount, adHomeHideEvents);
  setNumber(statNodes.adReplyHideCount, adReplyHideEvents);
  setNumber(statNodes.adHideCount, adHideCount);
}

function setDeveloperStats(stats) {
  const values = stats || {};
  setNumber(developerStatNodes.feedCount, values.feedCount || 0);
  setNumber(developerStatNodes.activeRuleCount, values.activeRuleCount || 0);
  setNumber(developerStatNodes.revokedCount, values.revokedCount || 0);
  setNumber(developerStatNodes.pendingCount, values.pendingCount || 0);
}

function getCachedDeveloperPayload() {
  return appState.dashboardCache && appState.dashboardCache.developer
    ? appState.dashboardCache.developer
    : null;
}

function getCachedPendingDeveloperFeeds() {
  const developer = getCachedDeveloperPayload();
  return developer && Array.isArray(developer.pendingFeeds) ? developer.pendingFeeds : [];
}

function getCachedPendingDeveloperTotal() {
  const developer = getCachedDeveloperPayload();
  const stats = developer && developer.stats ? developer.stats : {};
  return Number(stats.pendingCount || 0);
}

function getCachedPendingDeveloperPagination() {
  const developer = getCachedDeveloperPayload();
  return developer && developer.pendingPagination ? developer.pendingPagination : null;
}

function getSafePaginationMeta(meta) {
  const source = meta || {};
  const currentPage = Math.max(1, Number(source.currentPage || 1) || 1);
  const totalPages = Math.max(0, Number(source.totalPages || 0) || 0);
  const totalItems = Math.max(0, Number(source.totalItems || 0) || 0);
  return {
    currentPage,
    totalPages,
    totalItems,
    pageSize: Math.max(1, Number(source.pageSize || 1) || 1),
    hasPrev: Boolean(source.hasPrev),
    hasNext: Boolean(source.hasNext)
  };
}

function syncDeveloperPaginationState(payload) {
  const developer = payload || {};
  const pendingPagination = getSafePaginationMeta(developer.pendingPagination);
  const activeRulePagination = getSafePaginationMeta(developer.activeRulePagination);
  appState.developerPendingPage = pendingPagination.currentPage;
  appState.developerRulePage = activeRulePagination.currentPage;
}

function getDeveloperDashboardRequestState() {
  return {
    developerPendingPage: Math.max(1, Number(appState.developerPendingPage || 1) || 1),
    developerRulePage: Math.max(1, Number(appState.developerRulePage || 1) || 1)
  };
}

function getSelectedDeveloperCount() {
  return Array.from(appState.selectedDeveloperEventIds).filter(Boolean).length;
}

function updateDeveloperSelectionUi(items) {
  const list = Array.isArray(items) ? items : [];
  const selectedCount = getSelectedDeveloperCount();
  const selectedOnPageCount = list.filter((item) => appState.selectedDeveloperEventIds.has(Number(item.eventId || 0))).length;
  const totalPendingCount = Math.max(getCachedPendingDeveloperTotal(), list.length);
  const pendingPagination = getSafePaginationMeta(getCachedPendingDeveloperPagination());

  if (developerSelectionPill) {
    if (totalPendingCount > 0) {
      const parts = [`已选 ${selectedCount} 条`];
      if (list.length > 0) {
        parts.push(`此页已选 ${selectedOnPageCount} / ${list.length}`);
      }
      parts.push(`共 ${totalPendingCount} 条`);
      if (pendingPagination.totalPages > 1) {
        parts.push(`第 ${pendingPagination.currentPage} / ${pendingPagination.totalPages} 页`);
      }
      developerSelectionPill.textContent = parts.join(" · ");
    } else {
      developerSelectionPill.textContent = "当前没有待确认样本";
    }
  }

  if (developerSelectAll) {
    developerSelectAll.checked = list.length > 0 && selectedOnPageCount === list.length;
    developerSelectAll.indeterminate = selectedOnPageCount > 0 && selectedOnPageCount < list.length;
    developerSelectAll.disabled = list.length === 0;
  }

  if (developerSelectAllText) {
    if (list.length === 0) {
      developerSelectAllText.textContent = "当前没有待确认样本";
    } else {
      developerSelectAllText.textContent = `全选此页 ${list.length} 条`;
    }
  }

  if (developerBatchConfirmButton) {
    developerBatchConfirmButton.disabled = selectedCount === 0;
    if (selectedCount === 0) {
      developerBatchConfirmButton.textContent = "先勾选样本";
    } else if (selectedCount === 1) {
      developerBatchConfirmButton.textContent = "确认已选 1 条";
    } else {
      developerBatchConfirmButton.textContent = `批量确认 ${selectedCount} 条`;
    }
  }
}

function syncDeveloperSelectionState(items) {
  const list = Array.isArray(items) ? items : [];
  updateDeveloperSelectionUi(list);
}

function applyDeveloperPayload(payload) {
  if (!appState.dashboardCache) {
    appState.dashboardCache = {};
  }
  appState.dashboardCache.developer = payload || null;
  renderDeveloperSection(payload || null);
}

function getBindingTimeValue(item) {
  return new Date(item && (item.lastSeenAt || item.updatedAt || item.createdAt) ? (item.lastSeenAt || item.updatedAt || item.createdAt) : 0).getTime();
}

function getBindingDeviceId(item) {
  return String(item && item.deviceId ? item.deviceId : "").trim();
}

function isDevelopmentBinding(item) {
  return /^device_(dev|eval|test)_/i.test(getBindingDeviceId(item));
}

function getPrimaryBinding(bindings, activeBinding) {
  const list = Array.isArray(bindings) ? bindings.slice() : [];
  const activeDeviceId = getBindingDeviceId(activeBinding);
  if (activeDeviceId) {
    const matched = list.find((item) => getBindingDeviceId(item) === activeDeviceId);
    if (matched) {
      return matched;
    }
    return activeBinding;
  }

  list.sort((left, right) => getBindingTimeValue(right) - getBindingTimeValue(left));
  return list[0] || null;
}

function getHistoricalBindingNote(bindings, primaryBinding) {
  const primaryDeviceId = getBindingDeviceId(primaryBinding);
  const history = (Array.isArray(bindings) ? bindings : []).filter((item) => {
    const deviceId = getBindingDeviceId(item);
    return deviceId && deviceId !== primaryDeviceId;
  });
  if (!history.length) {
    return "这就是当前接入控制台的设备。";
  }

  const developmentCount = history.filter(isDevelopmentBinding).length;
  if (developmentCount === history.length) {
    return `已收起 ${history.length} 个开发测试连接标识，不算多台真实设备。`;
  }
  if (developmentCount > 0) {
    return `已收起 ${history.length} 个历史连接标识，其中 ${developmentCount} 个是开发测试标识，不算多台真实设备。`;
  }
  return `已收起 ${history.length} 个历史连接标识，通常来自插件重装、重新绑定或浏览器本地存储变化。`;
}

function renderBindings(bindings, activeBinding) {
  if (!bindingList) {
    return;
  }
  const list = Array.isArray(bindings) ? bindings : [];
  if (!list.length) {
    bindingList.innerHTML = `<span class="surface-note">当前账号下还没有已接入设备。数据通常不是没了，而是这次还没把 Safari 里的那台设备接到当前账号。先从插件弹窗点“打开控制台”，或者打开一次插件弹窗让它自动接入。</span>`;
    return;
  }

  const primaryBinding = getPrimaryBinding(list, activeBinding);
  bindingList.innerHTML = `
    <div class="binding-item binding-item-primary">
      <div class="binding-copy">
        <strong>当前这台设备</strong>
        <span class="surface-note">${escapeHtml(`最近活跃 ${formatRelativeTime(primaryBinding && primaryBinding.lastSeenAt)}`)}</span>
        <span class="surface-note binding-history-note">${escapeHtml(getHistoricalBindingNote(list, primaryBinding))}</span>
      </div>
    </div>
  `;
}

async function restoreItem(item, button, options) {
  const syncKey = String(getActiveSyncKey() || "").trim();
  if (!syncKey) {
    setStatus("这台设备还没接上账号，刷新一下再试。");
    return;
  }

  const replyAiItemId = Number(options && options.replyAiItemId ? options.replyAiItemId : 0);
  const buttonText = String(options && options.buttonText ? options.buttonText : "恢复这条");
  if (button) {
    button.disabled = true;
    button.textContent = "正在恢复...";
  }
  setStatus("正在恢复这条内容...");

  try {
    const eventPayload = {
      syncKey,
      source: "dashboard",
      eventType: "manual_allow",
      threadUrl: item.threadUrl || "",
      threadStatusId: item.threadStatusId || "",
      replyStatusId: item.replyStatusId || "",
      replyHandle: item.replyHandle || "",
      replyDisplayName: item.replyDisplayName || "",
      replyText: item.replyText || "",
      normalizedText: item.normalizedText || "",
      compactText: item.compactText || ""
    };
    if (replyAiItemId > 0) {
      eventPayload.replyAiItemId = replyAiItemId;
    }
    const result = await requestJson("/api/events", {
      method: "POST",
      body: JSON.stringify(eventPayload)
    });

    if (!result.ok || !result.data || !result.data.ok) {
      throw new Error((result.data && result.data.error) || "restore-failed");
    }
    if (replyAiItemId > 0 && result.data.replyAiRestored !== true) {
      throw new Error("reply-ai-restore-failed");
    }

    const row = button && typeof button.closest === "function" ? button.closest(".source-detail-row") : null;
    if (row && row.parentNode) {
      row.parentNode.removeChild(row);
    }
    await refreshDashboard(replyAiItemId > 0 ? "这条 AI 误判已经恢复，并会作为纠错记录保留。" : "这条内容已经恢复。");
  } catch (error) {
    setStatus("恢复失败了，点刷新再试一次。");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = buttonText;
    }
  }
}

async function saveAiSettings() {
  const settings = saveLocalAiSettings({
    enabled: aiEnabledToggle ? aiEnabledToggle.checked : true,
    apiKey: aiApiKeyInput && aiApiKeyInput.value ? aiApiKeyInput.value.trim() : "",
    baseUrl: aiApiBaseUrlInput && aiApiBaseUrlInput.value ? aiApiBaseUrlInput.value.trim() : "",
    model: aiApiModelInput && aiApiModelInput.value ? aiApiModelInput.value.trim() : "gpt-5.4-mini",
    prompt: aiPromptInput && aiPromptInput.value ? aiPromptInput.value.trim() : ""
  });

  if (!appState.viewer) {
    renderLocalAiSettings(settings, {
      loggedIn: false
    });
    if (aiSettingsStatus) {
      const parts = ["已保存到当前浏览器"];
      parts.push(settings.enabled ? "登录后才能真正用于共享 AI 提供商配置" : "当前已关闭");
      aiSettingsStatus.textContent = parts.join(" · ");
    }
    renderAiFeedSection(appState.dashboardCache && appState.dashboardCache.replyAi ? appState.dashboardCache.replyAi : null);
    setStatus("设置先保存在这台浏览器了。真正接入共享 AI 提供商配置，还需要先登录云端控制台。");
    return false;
  }

  const payload = {
    replyAiEnabled: settings.enabled,
    providerBaseUrl: settings.baseUrl || "https://api.openai.com/v1",
    model: settings.model || "gpt-5.4-mini",
    moderationPrompt: settings.prompt || ""
  };
  if (settings.apiKey) {
    payload.apiKey = settings.apiKey;
  }

  const result = await requestJson("/api/ai-settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!result.ok || !result.data || !result.data.ok || !result.data.settings) {
    const errorCode = result && result.data && result.data.error
      ? String(result.data.error || "").trim()
      : "";
    const friendlyMessage = errorCode === "missing-ai-settings-secret"
      ? "云端还没配置 AI Key 加密密钥，所以这次没法保存。先给 Worker 配上 USER_AI_SETTINGS_SECRET 再试。"
      : "这次没保存到云端账号，等一下再试一次。";
    if (aiSettingsStatus) {
      aiSettingsStatus.textContent = friendlyMessage;
    }
    setStatus(friendlyMessage);
    return false;
  }

  if (!appState.dashboardCache) {
    appState.dashboardCache = {};
  }
  appState.dashboardCache.replyAi = Object.assign({}, appState.dashboardCache.replyAi || {}, {
    settings: result.data.settings
  });
  if (aiApiKeyInput) {
    aiApiKeyInput.value = "";
  }
  renderAiFeedSection(appState.dashboardCache.replyAi);
  if (aiSettingsStatus) {
    const parts = ["已保存到云端账号"];
    parts.push(result.data.settings.replyAiEnabled ? "回复区 AI 审核已开启" : "回复区 AI 审核已关闭");
    if (result.data.settings.model) {
      parts.push(`模型 ${result.data.settings.model}`);
    }
    if (result.data.settings.apiKeyConfigured) {
      parts.push(`****${result.data.settings.apiKeyLast4 || ""}`);
    }
    aiSettingsStatus.textContent = parts.join(" · ");
  }
  setStatus("共享 AI 提供商配置和回复区 AI 审核开关已经保存到你的云端账号。");
  return true;
}

function getAiProviderTestMessage(errorCode) {
  const code = String(errorCode || "").trim();
  if (code === "missing-ai-api-key") {
    return "还没有保存 API Key。先把 Key、接口地址和模型名填好，再点保存。";
  }
  if (code === "ai-provider-status-401" || code === "ai-provider-status-403") {
    return "AI 平台拒绝了这次测试。通常是 Key 不对、没开通模型，或者账号没有权限。";
  }
  if (code === "ai-provider-status-404") {
    return "AI 平台没有找到这个接口或模型。通常是接口地址或模型名字填错。";
  }
  if (code === "ai-provider-status-429") {
    return "AI 平台说请求太多或额度不足。等一下再试，或检查余额。";
  }
  if (/^ai-provider-status-5\d\d$/.test(code) || code === "ai-provider-status-529") {
    return "AI 平台那边暂时不稳定。稍后再点测试。";
  }
  if (code === "ai-provider-invalid-json" || code === "ai-provider-empty-output") {
    return "模型有回复，但格式不对。这个平台可能不完全兼容，需要我补单独适配。";
  }
  return "这次测试没有跑通。先检查 Key、接口地址、模型名字，再试一次。";
}

async function testAiSettings() {
  if (!appState.viewer) {
    setStatus("先登录云端控制台，再测试 AI 接入。");
    return;
  }

  if (testAiSettingsButton) {
    testAiSettingsButton.disabled = true;
    testAiSettingsButton.textContent = "正在测试...";
  }
  if (saveAiSettingsButton) {
    saveAiSettingsButton.disabled = true;
  }

  try {
    setStatus("正在保存设置，然后只用一条小样本测试 AI 接入。这个测试会消耗很少量 API 额度。");
    const saved = await saveAiSettings();
    if (!saved) {
      return;
    }

    const result = await requestJson("/api/ai-settings/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!result.ok || !result.data || !result.data.ok || !result.data.test) {
      const message = getAiProviderTestMessage(result && result.data ? result.data.error : "");
      if (aiSettingsStatus) {
        aiSettingsStatus.textContent = message;
      }
      setStatus(message);
      return;
    }

    const test = result.data.test;
    const modelText = test.model ? `模型 ${test.model}` : "模型已响应";
    const decisionText = test.action === "hide" ? "能返回隐藏判断" : "能返回有效判断";
    const latencyText = Number(test.latencyMs || 0) > 0 ? `约 ${Math.round(Number(test.latencyMs || 0) / 100) / 10} 秒` : "";
    if (aiSettingsStatus) {
      aiSettingsStatus.textContent = ["测试通过", modelText, decisionText, latencyText].filter(Boolean).join(" · ");
    }
    setStatus("AI 接入测试通过：Key、接口地址和模型名都能正常调用。");
  } catch (error) {
    const message = "这次测试没有跑通。先检查网络和 AI 平台余额，再试一次。";
    if (aiSettingsStatus) {
      aiSettingsStatus.textContent = message;
    }
    setStatus(message);
  } finally {
    if (testAiSettingsButton) {
      testAiSettingsButton.disabled = false;
      testAiSettingsButton.textContent = "测试一次 AI 接入";
    }
    if (saveAiSettingsButton) {
      saveAiSettingsButton.disabled = false;
    }
  }
}

async function confirmDeveloperFeed(item, button) {
  if (!item || !item.eventId) {
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = "正在确认...";
  }
  setStatus("正在把这条明确垃圾加入全局基础过滤...");

  try {
    const result = await requestJson("/api/developer/confirm-feed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(Object.assign({
        eventId: item.eventId
      }, getDeveloperDashboardRequestState()))
    });

    if (!result.ok || !result.data || !result.data.ok) {
      throw new Error((result.data && result.data.error) || "developer-confirm-failed");
    }

    appState.selectedDeveloperEventIds.delete(Number(item.eventId || 0));
    applyDeveloperPayload(result.data.developer || null);
    const remainingCount = getCachedPendingDeveloperTotal();
    setStatus(remainingCount > 0
      ? `这条明确垃圾已经进入全局基础过滤。当前还剩 ${remainingCount} 条待确认，不是卡住。`
      : "这条明确垃圾已经进入全局基础过滤。当前没有待确认样本了。");
  } catch (error) {
    setStatus("这次没确认成功，等一下再试一次。");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "确认进入全局";
    }
  }
}

async function dismissDeveloperFeed(item, button) {
  if (!item || !item.eventId) {
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = "正在排除...";
  }
  setStatus("正在把这条样本从待确认里排除...");

  try {
    const result = await requestJson("/api/developer/dismiss-feed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(Object.assign({
        eventId: item.eventId
      }, getDeveloperDashboardRequestState()))
    });

    if (!result.ok || !result.data || !result.data.ok) {
      throw new Error((result.data && result.data.error) || "developer-dismiss-failed");
    }

    appState.selectedDeveloperEventIds.delete(Number(item.eventId || 0));
    applyDeveloperPayload(result.data.developer || null);
    const remainingCount = getCachedPendingDeveloperTotal();
    setStatus(remainingCount > 0
      ? `这条样本已标记为不是垃圾，并从待确认里排除了。当前还剩 ${remainingCount} 条待确认。`
      : "这条样本已标记为不是垃圾，并从待确认里排除了。当前没有待确认样本了。");
  } catch (error) {
    setStatus("这次没排除成功，等一下再试一次。");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "不是垃圾";
    }
  }
}

async function confirmSelectedDeveloperFeeds() {
  const eventIds = Array.from(appState.selectedDeveloperEventIds).filter(Boolean);
  if (!eventIds.length) {
    setStatus("先勾选待确认样本，再批量加入全局。");
    return;
  }

  if (developerBatchConfirmButton) {
    developerBatchConfirmButton.disabled = true;
    developerBatchConfirmButton.textContent = "正在批量确认...";
  }
  setStatus(`正在批量确认 ${eventIds.length} 条明确垃圾...`);

  try {
    const result = await requestJson("/api/developer/confirm-feed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(Object.assign({
        eventIds
      }, getDeveloperDashboardRequestState()))
    });

    if (!result.ok || !result.data || !result.data.ok) {
      throw new Error((result.data && result.data.error) || "developer-batch-confirm-failed");
    }

    appState.selectedDeveloperEventIds = new Set();
    applyDeveloperPayload(result.data.developer || null);
    const confirmedCount = result.data.confirmedCount || eventIds.length;
    const remainingCount = getCachedPendingDeveloperTotal();
    setStatus(remainingCount > 0
      ? `已批量把 ${confirmedCount} 条样本加入全局基础过滤。当前还剩 ${remainingCount} 条待确认。`
      : `已批量把 ${confirmedCount} 条样本加入全局基础过滤。当前没有待确认样本了。`);
  } catch (error) {
    setStatus("这次批量确认没成功，等一下再试一次。");
  } finally {
    updateDeveloperSelectionUi(getCachedPendingDeveloperFeeds());
  }
}

async function revokeDeveloperRule(item, button) {
  if (!item || !item.id) {
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = "正在撤回...";
  }
  setStatus("正在从全局规则里撤回这条开发者样本...");

  try {
    const result = await requestJson("/api/developer/revoke-feed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(Object.assign({
        decisionId: item.id
      }, getDeveloperDashboardRequestState()))
    });

    if (!result.ok || !result.data || !result.data.ok) {
      throw new Error((result.data && result.data.error) || "developer-revoke-failed");
    }

    applyDeveloperPayload(result.data.developer || null);
    setStatus("这条开发者精确规则已经从全局基础过滤里撤回。");
  } catch (error) {
    setStatus("这次没撤回成功，等一下再试一次。");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "撤回全局规则";
    }
  }
}

function renderReviewList(items) {
  if (!reviewList) {
    return;
  }

  const sourceItems = getChronologicalReviewItems(items);
  const filteredItems = getFilteredReviewItems(sourceItems);
  const weightCounts = getReviewWeightCounts(filteredItems);
  const sortedItems = filteredItems.slice();

  if (appState.reviewSort === "weight") {
    sortedItems.sort((left, right) => {
      const rightCount = weightCounts.get(getReviewWeightKey(right)) || 0;
      const leftCount = weightCounts.get(getReviewWeightKey(left)) || 0;
      if (rightCount !== leftCount) {
        return rightCount - leftCount;
      }
      const rightTime = new Date(right && right.createdAt ? right.createdAt : 0).getTime();
      const leftTime = new Date(left && left.createdAt ? left.createdAt : 0).getTime();
      return rightTime - leftTime;
    });
  }

  updateReviewShell(sourceItems.length, filteredItems.length);

  if (!appState.reviewExpanded) {
    reviewList.innerHTML = "";
    return;
  }

  if (sourceItems.length === 0) {
    renderEmpty(reviewList, "还没有最近真实记录。");
    return;
  }

  if (sortedItems.length === 0) {
    renderEmpty(reviewList, "没有找到匹配结果。");
    return;
  }

  reviewList.innerHTML = "";
  sortedItems.forEach((item) => {
    const eventType = getReviewEventType(item);
    const meta = getSourceMeta(eventType);
    const title = [item.replyDisplayName, item.replyHandle].filter(Boolean).join(" ");
    const canRestore = eventType === "auto_hide" || eventType === "manual_hide";
    const repeatCount = weightCounts.get(getReviewWeightKey(item)) || 0;
    const repeatNote = repeatCount > 1 ? `近${sourceItems.length}条里出现 ${repeatCount} 次` : "";
    const row = document.createElement("article");
    row.className = "review-row";
    row.innerHTML = `
      <div class="review-row-top">
        <div class="review-row-title">
          <span class="${meta.className}">${meta.label}</span>
          <strong>${escapeHtml(title || "未识别账号")}</strong>
        </div>
        <div class="review-row-meta">
          ${repeatNote ? `<span class="surface-note review-weight-note">${escapeHtml(repeatNote)}</span>` : ""}
          <time>${formatRelativeTime(item.createdAt)}</time>
        </div>
      </div>
      <p class="review-body">${escapeHtml(item.replyText || EMPTY_REPLY_BODY_LABEL)}</p>
      ${canRestore ? `
        <div class="review-actions">
          <button class="ghost-button small-button review-restore-button" type="button">恢复这条</button>
        </div>
      ` : `
        <div class="review-actions">
          <span class="surface-note">这条已经恢复</span>
        </div>
      `}
    `;

    if (canRestore) {
      const restoreButton = row.querySelector(".review-restore-button");
      restoreButton.addEventListener("click", function () {
        restoreItem(item, restoreButton);
      });
    }

    reviewList.appendChild(row);
  });
}

function buildDeveloperKeyPills(keys) {
  return (Array.isArray(keys) ? keys : []).map((key) => `
    <span class="developer-key-pill">${escapeHtml(describeDeveloperKey(key))}</span>
  `).join("");
}

function getDeveloperPagerPages(currentPage, totalPages) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, function (_, index) {
      return index + 1;
    });
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

function renderDeveloperPager(container, pagination, mode) {
  if (!container) {
    return;
  }

  const meta = getSafePaginationMeta(pagination);
  if (meta.totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  const summary = `第 ${meta.currentPage} / ${meta.totalPages} 页 · 共 ${meta.totalItems} 条`;
  const pages = getDeveloperPagerPages(meta.currentPage, meta.totalPages);

  container.innerHTML = `
    <div class="developer-pager-summary">${escapeHtml(summary)}</div>
    <div class="developer-pager-buttons">
      <button class="ghost-button small-button developer-page-button" type="button" data-page-action="prev" ${meta.hasPrev ? "" : "disabled"}>上一页</button>
      ${pages.map((page) => page === "ellipsis"
        ? `<span class="developer-page-ellipsis">…</span>`
        : `<button class="ghost-button small-button developer-page-button${page === meta.currentPage ? " active" : ""}" type="button" data-page="${page}">${page}</button>`
      ).join("")}
      <button class="ghost-button small-button developer-page-button" type="button" data-page-action="next" ${meta.hasNext ? "" : "disabled"}>下一页</button>
    </div>
  `;

  Array.from(container.querySelectorAll("[data-page]")).forEach((button) => {
    button.addEventListener("click", function () {
      const nextPage = Number(button.getAttribute("data-page") || 0);
      if (!nextPage) {
        return;
      }
      if (mode === "pending") {
        changeDeveloperPendingPage(nextPage);
        return;
      }
      changeDeveloperRulePage(nextPage);
    });
  });

  Array.from(container.querySelectorAll("[data-page-action]")).forEach((button) => {
    button.addEventListener("click", function () {
      const action = String(button.getAttribute("data-page-action") || "");
      const nextPage = action === "prev" ? meta.currentPage - 1 : meta.currentPage + 1;
      if (mode === "pending") {
        changeDeveloperPendingPage(nextPage);
        return;
      }
      changeDeveloperRulePage(nextPage);
    });
  });
}

async function changeDeveloperPendingPage(page) {
  const nextPage = Math.max(1, Number(page || 1) || 1);
  if (nextPage === appState.developerPendingPage) {
    return;
  }
  appState.developerPendingPage = nextPage;
  await fetchCloudDashboard(`已切到待确认第 ${nextPage} 页。`);
}

async function changeDeveloperRulePage(page) {
  const nextPage = Math.max(1, Number(page || 1) || 1);
  if (nextPage === appState.developerRulePage) {
    return;
  }
  appState.developerRulePage = nextPage;
  await fetchCloudDashboard(`已切到全局规则第 ${nextPage} 页。`);
}

function renderDeveloperPendingFeeds(items, pagination) {
  if (!developerPendingList) {
    return;
  }
  const list = Array.isArray(items) ? items : [];
  syncDeveloperSelectionState(list);
  if (!list.length) {
    renderEmpty(developerPendingList, "当前没有待你确认的新样本。");
    renderDeveloperPager(developerPendingPager, pagination, "pending");
    return;
  }

  developerPendingList.innerHTML = "";
  list.forEach((item) => {
    const title = [item.replyDisplayName, item.replyHandle].filter(Boolean).join(" ");
    const eventId = Number(item.eventId || 0);
    const isSelected = appState.selectedDeveloperEventIds.has(eventId);
    const row = document.createElement("article");
    row.className = "developer-row";
    row.innerHTML = `
      <div class="developer-row-shell">
        <label class="developer-row-select">
          <input class="developer-select-input" type="checkbox" ${isSelected ? "checked" : ""} />
        </label>
        <div class="developer-row-main">
          <div class="developer-row-top">
            <div>
              <strong>${escapeHtml(title || "未识别账号")}</strong>
              <p class="developer-impact">${escapeHtml(item.impactLabel || "确认后会影响全局基础过滤。")}</p>
            </div>
            <time>${escapeHtml(formatRelativeTime(item.createdAt))}</time>
          </div>
          <div class="developer-key-list">${buildDeveloperKeyPills(item.exactKeys)}</div>
          <p class="developer-body">${escapeHtml(item.replyText || EMPTY_REPLY_BODY_LABEL)}</p>
          <div class="developer-row-actions">
            <span class="surface-note muted-note">先把误判样本排掉，再决定要不要进全局</span>
            <div class="developer-row-button-group">
              <button class="ghost-button small-button developer-dismiss-button" type="button">不是垃圾</button>
              <button class="primary-button small-button developer-confirm-button" type="button">确认进入全局</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const selectInput = row.querySelector(".developer-select-input");
    selectInput.addEventListener("change", function () {
      if (selectInput.checked) {
        appState.selectedDeveloperEventIds.add(eventId);
      } else {
        appState.selectedDeveloperEventIds.delete(eventId);
      }
      updateDeveloperSelectionUi(list);
    });
    const dismissButton = row.querySelector(".developer-dismiss-button");
    dismissButton.addEventListener("click", function () {
      dismissDeveloperFeed(item, dismissButton);
    });
    const confirmButton = row.querySelector(".developer-confirm-button");
    confirmButton.addEventListener("click", function () {
      confirmDeveloperFeed(item, confirmButton);
    });
    developerPendingList.appendChild(row);
  });
  renderDeveloperPager(developerPendingPager, pagination, "pending");
}

function renderDeveloperRules(items, pagination) {
  if (!developerRuleList) {
    return;
  }
  const list = Array.isArray(items) ? items : [];
  if (!list.length) {
    renderEmpty(developerRuleList, "当前还没有通过你确认进入全局的精确规则。");
    renderDeveloperPager(developerRulePager, pagination, "rule");
    return;
  }

  developerRuleList.innerHTML = "";
  list.forEach((item) => {
    const title = [item.replyDisplayName, item.replyHandle].filter(Boolean).join(" ");
    const row = document.createElement("article");
    row.className = "developer-row";
    row.innerHTML = `
      <div class="developer-row-top">
        <div>
          <strong>${escapeHtml(title || "未识别账号")}</strong>
          <p class="developer-impact">${escapeHtml(item.impactLabel || "这条规则正在影响全局基础过滤。")}</p>
        </div>
        <time>${escapeHtml(formatRelativeTime(item.lastConfirmedAt || item.createdAt))}</time>
      </div>
      <div class="developer-key-list">${buildDeveloperKeyPills(item.exactKeys)}</div>
      <p class="developer-body">${escapeHtml(item.replyText || EMPTY_REPLY_BODY_LABEL)}</p>
      <div class="developer-row-actions">
        <span class="surface-note muted-note">这会立刻撤回全局规则，不是只影响你自己</span>
        <button class="ghost-button small-button developer-revoke-button" type="button">撤回全局规则</button>
      </div>
    `;
    const revokeButton = row.querySelector(".developer-revoke-button");
    revokeButton.addEventListener("click", function () {
      revokeDeveloperRule(item, revokeButton);
    });
    developerRuleList.appendChild(row);
  });
  renderDeveloperPager(developerRulePager, pagination, "rule");
}

function renderDeveloperRevoked(items) {
  if (!developerRevokedList) {
    return;
  }
  const list = Array.isArray(items) ? items : [];
  if (!list.length) {
    renderEmpty(developerRevokedList, "你还没有撤回过开发者全局规则。");
    return;
  }

  developerRevokedList.innerHTML = "";
  list.forEach((item) => {
    const title = [item.replyDisplayName, item.replyHandle].filter(Boolean).join(" ");
    const row = document.createElement("article");
    row.className = "developer-row developer-row-muted";
    row.innerHTML = `
      <div class="developer-row-top">
        <div>
          <strong>${escapeHtml(title || "未识别账号")}</strong>
          <p class="developer-impact">${escapeHtml(item.impactLabel || "这条曾经进入全局，后来被你撤回。")}</p>
        </div>
        <time>${escapeHtml(formatRelativeTime(item.revokedAt || item.lastConfirmedAt || item.createdAt))}</time>
      </div>
      <div class="developer-key-list">${buildDeveloperKeyPills(item.exactKeys)}</div>
      <p class="developer-body">${escapeHtml(item.replyText || EMPTY_REPLY_BODY_LABEL)}</p>
    `;
    developerRevokedList.appendChild(row);
  });
}

function renderDeveloperSection(payload) {
  const isDeveloper = Boolean(appState.viewer && appState.viewer.isDeveloper);
  setHidden(developerSection, !isDeveloper);
  if (!isDeveloper) {
    appState.selectedDeveloperEventIds = new Set();
    appState.developerPendingPage = 1;
    appState.developerRulePage = 1;
    setDeveloperStats({});
    renderDeveloperPendingFeeds([], null);
    renderDeveloperRules([], null);
    renderDeveloperRevoked([]);
    return;
  }

  const developer = payload || {};
  syncDeveloperPaginationState(developer);
  const stats = developer.stats || {};
  const pendingPagination = getSafePaginationMeta(developer.pendingPagination);
  setDeveloperStats(stats);
  renderDeveloperPendingFeeds(developer.pendingFeeds || [], developer.pendingPagination);
  renderDeveloperRules(developer.activeRules || [], developer.activeRulePagination);
  renderDeveloperRevoked(developer.revokedRules || []);

  if (developerBannerText) {
    developerBannerText.textContent = stats.pendingCount
      ? pendingPagination.totalPages > 1
        ? `当前还有 ${stats.pendingCount} 条待确认样本，共 ${pendingPagination.totalPages} 页，现在是第 ${pendingPagination.currentPage} 页。已选内容会跨页保留；全选只作用于当前页。`
        : `当前还有 ${stats.pendingCount} 条待确认样本。已选内容会跨页保留；全选只作用于当前页。`
      : "当前没有新的待确认样本。你之后的每一次高影响投喂，都会先在这里让你确认一次。";
  }
}

function getActiveSyncKey() {
  return getSyncKeyFromPage();
}

function renderCloudMode(loggedIn) {
  const detailMode = isMetricDetailMode();
  appState.mode = "cloud";
  setHidden(loggedOutState, Boolean(loggedIn));
  setHidden(loggedInState, !loggedIn);
  setHidden(legacyState, true);
  setHidden(cloudDashboardSection, !loggedIn || detailMode);
  setHidden(aiFeedSection, detailMode);
  setHidden(developerSection, true);
  setHidden(personalDashboardSection, !loggedIn || detailMode);
  setHidden(adSection, true);
  setHidden(reviewSection, true);
  setHidden(sourceDetailPanel, !loggedIn || !detailMode);
  if (syncModePill) {
    syncModePill.textContent = loggedIn ? "已登录云端控制台" : "登录后查看个人控制台";
  }
}

function renderLegacyMode() {
  const detailMode = isMetricDetailMode();
  appState.mode = "legacy";
  setHidden(loggedOutState, true);
  setHidden(loggedInState, true);
  setHidden(legacyState, false);
  setHidden(cloudDashboardSection, true);
  setHidden(aiFeedSection, true);
  setHidden(developerSection, true);
  setHidden(personalDashboardSection, detailMode);
  setHidden(adSection, true);
  setHidden(reviewSection, true);
  setHidden(sourceDetailPanel, !detailMode);
  if (syncModePill) {
    syncModePill.textContent = "本地控制台";
  }
}

async function requestJson(path, options) {
  const endpoint = path.startsWith("http") ? path : `${getBackendBaseUrl()}${path}`;
  const requestOptions = Object.assign({
    cache: "no-store",
    credentials: "include"
  }, options || {});
  const timeoutMs = Math.max(0, Number(requestOptions.timeoutMs || 0) || 0);
  delete requestOptions.timeoutMs;

  let abortController = null;
  let timeoutId = null;
  if (timeoutMs > 0 && typeof AbortController !== "undefined") {
    abortController = new AbortController();
    requestOptions.signal = abortController.signal;
    timeoutId = window.setTimeout(function () {
      abortController.abort();
    }, timeoutMs);
  }

  try {
    const response = await fetch(endpoint, requestOptions);
    let data = {};
    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    const timeout = Boolean(error && error.name === "AbortError");
    return {
      ok: false,
      status: 0,
      data: {},
      error: timeout ? "request-timeout" : (error && error.message ? error.message : String(error)),
      timeout
    };
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}

async function detectConsoleMode() {
  setStatus("正在连接控制台...");
  const result = await requestJson("/api/me");
  if (result.ok && result.data && result.data.mode === "cloud") {
    appState.developerLoginEnabled = Boolean(result.data.developerLoginEnabled);
    appState.viewer = result.data.loggedIn ? result.data.viewer : null;
    renderCloudMode(Boolean(appState.viewer));
    if (appState.viewer) {
      viewerEmail.textContent = formatViewerLabel(appState.viewer);
      const cachedDashboard = readCloudDashboardCache(appState.viewer);
      if (cachedDashboard && cachedDashboard.payload) {
        restoreBindingIdentityFromDashboard(cachedDashboard.payload);
        renderCloudDashboard(cachedDashboard.payload);
        setStatus(
          cachedDashboard.savedAt
            ? `先显示 ${formatRelativeTime(cachedDashboard.savedAt)} 同步的结果，正在刷新最新数据...`
            : "先显示上次成功同步的数据，正在刷新最新数据..."
        );
      }
      await refreshDashboard(cachedDashboard && cachedDashboard.payload
        ? "云端数据已经刷新。"
        : "已连接到你的云端控制台。");
    } else {
      renderAiFeedSection(null);
      setStatus("先登录，控制台才会显示你的个人数据。");
      setAuthHint(
        appState.developerLoginEnabled
          ? "开发者账号点发送验证码后会直接登录。普通邮箱登录，后面再接正式发信服务。"
          : "验证码会发到你的邮箱。登录后，已安装的插件设备会自动接入账号。"
      );
    }
    startPolling();
    return;
  }

  renderLegacyMode();
  await refreshDashboard();
  startPolling();
}

async function requestLoginCode() {
  const email = String(emailInput && emailInput.value ? emailInput.value : "").trim();
  if (!email) {
    setAuthHint("先填邮箱，再发验证码。");
    return;
  }

  requestCodeButton.disabled = true;
  setAuthHint("正在发送验证码...");
  const result = await requestJson("/api/auth/request-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });
  requestCodeButton.disabled = false;

  if (!result.ok || !result.data || !result.data.ok) {
    if (result.data && result.data.detail === "missing-email-provider" && appState.developerLoginEnabled) {
      setAuthHint("普通邮箱登录还没接发信服务。如果你想走开发者直通，确认当前邮箱已经配进 DEVELOPER_EMAILS。");
    } else {
      setAuthHint("这次没把验证码发出去。等一下再试，或者之后补上邮件服务配置。");
    }
    return;
  }

  if (codeInput && result.data.debugCode) {
    codeInput.value = result.data.debugCode;
  }

  if (result.data.debugCode && result.data.developerMode) {
    setAuthHint("开发者验证码已生成，正在为你登录...");
    await verifyLoginCode({
      email,
      code: result.data.debugCode,
      autoSubmit: true
    });
    return;
  }

  if (result.data.debugCode && result.data.publicDebugCodeMode) {
    setAuthHint("测试阶段验证码已生成，正在为你登录...");
    await verifyLoginCode({
      email,
      code: result.data.debugCode,
      autoSubmit: true
    });
    return;
  }

  setAuthHint(result.data.debugCode
    ? (result.data.publicDebugCodeMode
      ? `测试阶段验证码：${result.data.debugCode}`
      : `开发者验证码：${result.data.debugCode}`)
    : "验证码已经发出，去邮箱里看一下。");
}

async function verifyLoginCode(options) {
  const email = String(options && options.email ? options.email : (emailInput && emailInput.value ? emailInput.value : "")).trim();
  const code = String(options && options.code ? options.code : (codeInput && codeInput.value ? codeInput.value : "")).trim();
  const autoSubmit = Boolean(options && options.autoSubmit);
  if (!email || !code) {
    setAuthHint("把邮箱和验证码都填上，再登录。");
    return;
  }

  verifyCodeButton.disabled = true;
  setAuthHint(autoSubmit ? "正在完成开发者登录..." : "正在验证验证码...");
  const result = await requestJson("/api/auth/verify-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, code })
  });
  verifyCodeButton.disabled = false;

  if (!result.ok || !result.data || !result.data.ok) {
    setAuthHint(autoSubmit
      ? "开发者验证码已经生成，但自动登录没有成功。点一次登录再试。"
      : "验证码不对，或者已经过期了。重新发一封再试。");
    return;
  }

  appState.viewer = result.data.viewer || null;
  renderCloudMode(true);
  viewerEmail.textContent = formatViewerLabel(appState.viewer);
  setAuthHint(appState.viewer && appState.viewer.isDeveloper
    ? "开发者账号已登录。当前设备会自动接入这个账号。"
    : "已经登录成功。已安装插件的设备会自动接入这个账号。");
  await refreshDashboard("已登录到你的云端控制台。");
}

async function logout() {
  logoutButton.disabled = true;
  await requestJson("/api/auth/logout", { method: "POST" });
  logoutButton.disabled = false;
  appState.viewer = null;
  appState.dashboardCache = null;
  renderCloudMode(false);
  setMetricGroup(globalStatNodes, {});
  setMetricGroup(personalStatNodes, {});
  renderDeveloperSection(null);
  renderBindings([]);
  renderAdList([]);
  renderReviewList([]);
  renderAiFeedSection(null);
  setStatus("你已经退出登录。");
}

function renderCloudDashboard(payload) {
  appState.dashboardCache = payload || null;
  const personalStats = Object.assign(
    {},
    payload && payload.personalStats ? payload.personalStats : {},
    payload && payload.skippedStats ? payload.skippedStats : {}
  );
  setMetricGroup(globalStatNodes, payload && payload.globalStats ? payload.globalStats : {});
  setMetricGroup(personalStatNodes, personalStats);
  renderBindings(payload && payload.bindings ? payload.bindings : [], payload && payload.activeBinding ? payload.activeBinding : null);
  renderDeveloperSection(payload && payload.developer ? payload.developer : null);
  renderAiFeedSection(payload && payload.replyAi ? payload.replyAi : null);
  renderMetricDetailPage(payload || null);
  renderAdList(payload && payload.adEvents ? payload.adEvents : []);
  renderReviewList(payload && payload.recent ? payload.recent : []);
  if (syncModePill) {
    syncModePill.textContent = appState.viewer ? formatViewerLabel(appState.viewer) : "登录后查看个人控制台";
  }
}

function renderLegacyDashboard(payload) {
  appState.dashboardCache = payload || null;
  setMetricGroup(personalStatNodes, payload && payload.stats ? payload.stats : {});
  renderAiFeedSection(null);
  renderMetricDetailPage(payload || null);
  renderAdList(payload && payload.adEvents ? payload.adEvents : []);
  renderReviewList(payload && payload.recent ? payload.recent : []);
  if (syncModePill) {
    syncModePill.textContent = "本地调试页";
  }
}

async function fetchLegacyDashboard(successMessage) {
  const syncKey = getActiveSyncKey();
  if (!syncKey) {
    renderLegacyDashboard({
      stats: {},
      adEvents: [],
      recent: []
    });
    setStatus("这页现在只用于本地调试。正式数据请登录云端控制台查看。");
    return;
  }

  setStatus("正在读取你的真实记录...");
  const result = await requestJson(`/api/dashboard?syncKey=${encodeURIComponent(syncKey)}`);
  if (!result.ok || !result.data || !result.data.ok) {
    renderLegacyDashboard({
      stats: {},
      adEvents: [],
      recent: appState.dashboardCache && appState.dashboardCache.recent ? appState.dashboardCache.recent : []
    });
    setStatus("这次没读到你的记录，点刷新再试一次。");
    return;
  }

  window.localStorage.setItem("web25_sync_key", syncKey);
  renderLegacyDashboard(result.data);
  setStatus(successMessage || "真实数据已同步。");
}

async function fetchCloudDashboard(successMessage) {
  setStatus("正在读取你的云端控制台...");
  const syncKey = getSyncKeyFromPage();
  const deviceId = getDeviceIdFromPage();
  const params = new URLSearchParams();
  if (syncKey) {
    params.set("syncKey", syncKey);
  }
  if (deviceId) {
    params.set("deviceId", deviceId);
  }
  if (appState.viewer && appState.viewer.isDeveloper) {
    const developerState = getDeveloperDashboardRequestState();
    params.set("developerPendingPage", String(developerState.developerPendingPage));
    params.set("developerRulePage", String(developerState.developerRulePage));
  }
  const query = params.toString();
  const suffix = query ? `?${query}` : "";
  const dashboardResult = await requestJson(`/api/dashboard${suffix}`, {
    timeoutMs: DASHBOARD_REQUEST_TIMEOUT_MS
  });
  if (!dashboardResult.ok || !dashboardResult.data || !dashboardResult.data.ok) {
    const cachedDashboard = readCloudDashboardCache(appState.viewer);
    if (cachedDashboard && cachedDashboard.payload) {
      restoreBindingIdentityFromDashboard(cachedDashboard.payload);
      renderCloudDashboard(cachedDashboard.payload);
      setStatus(
        dashboardResult.timeout
          ? `这次读取超时了，先显示 ${formatRelativeTime(cachedDashboard.savedAt)} 同步的结果。`
          : `这次没读到最新数据，先显示 ${formatRelativeTime(cachedDashboard.savedAt)} 同步的结果。`
      );
      return;
    }

    if (appState.dashboardCache) {
      restoreBindingIdentityFromDashboard(appState.dashboardCache);
      renderCloudDashboard(appState.dashboardCache);
      setStatus(dashboardResult.timeout ? "这次读取超时了，先保留刚才这份数据。" : "这次没读到最新数据，先保留刚才这份数据。");
      return;
    }

    renderCloudDashboard({
      globalStats: {},
      personalStats: {},
      recent: [],
      adEvents: [],
      bindings: [],
      replyAi: null
    });
    setStatus(dashboardResult.timeout ? "这次读取超时了，等一下再刷新。" : "这次没读到你的云端数据。等一下再刷新。");
    return;
  }

  if (syncKey) {
    window.localStorage.setItem("web25_sync_key", syncKey);
  }
  if (deviceId) {
    window.localStorage.setItem("web25_device_id", deviceId);
  }
  restoreBindingIdentityFromDashboard(dashboardResult.data);
  if (appState.viewer) {
    writeCloudDashboardCache(appState.viewer, dashboardResult.data);
  }
  renderCloudDashboard(dashboardResult.data);
  setStatus(successMessage || "云端数据已经同步。");
}

async function refreshDashboard(successMessage) {
  if (appState.mode === "cloud") {
    if (!appState.viewer) {
      setStatus("先登录，控制台才会显示你的个人数据。");
      return;
    }
    await fetchCloudDashboard(successMessage);
    return;
  }

  await fetchLegacyDashboard(successMessage);
}

function startPolling() {
  if (appState.pollTimer) {
    clearInterval(appState.pollTimer);
  }
  appState.pollTimer = setInterval(() => {
    if (document.hidden) {
      return;
    }
    refreshDashboard();
  }, POLL_INTERVAL_MS);
}

if (requestCodeButton) {
  requestCodeButton.addEventListener("click", requestLoginCode);
}

if (verifyCodeButton) {
  verifyCodeButton.addEventListener("click", verifyLoginCode);
}

if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}

if (refreshDashboardButton) {
  refreshDashboardButton.addEventListener("click", function () {
    refreshDashboard();
  });
}

if (aiEnabledToggle) {
  aiEnabledToggle.addEventListener("change", function () {
    if (aiEnabledStatus) {
      aiEnabledStatus.textContent = aiEnabledToggle.checked ? "当前开启" : "当前关闭";
    }
  });
}

if (saveAiSettingsButton) {
  saveAiSettingsButton.addEventListener("click", function () {
    saveAiSettings();
  });
}

if (testAiSettingsButton) {
  testAiSettingsButton.addEventListener("click", function () {
    testAiSettings();
  });
}

if (developerBatchConfirmButton) {
  developerBatchConfirmButton.addEventListener("click", function () {
    confirmSelectedDeveloperFeeds();
  });
}

if (developerSelectAll) {
  developerSelectAll.addEventListener("change", function () {
    const list = getCachedPendingDeveloperFeeds();
    const pageIds = list.map((item) => Number(item.eventId || 0)).filter(Boolean);
    if (developerSelectAll.checked) {
      const nextSet = new Set(appState.selectedDeveloperEventIds);
      pageIds.forEach((id) => nextSet.add(id));
      appState.selectedDeveloperEventIds = nextSet;
    } else {
      const nextSet = new Set(appState.selectedDeveloperEventIds);
      pageIds.forEach((id) => nextSet.delete(id));
      appState.selectedDeveloperEventIds = nextSet;
    }
    renderDeveloperPendingFeeds(list, getCachedPendingDeveloperPagination());
  });
}

if (legacyRefreshDashboard) {
  legacyRefreshDashboard.addEventListener("click", function () {
    refreshDashboard();
  });
}

if (reviewToggleButton) {
  reviewToggleButton.addEventListener("click", function () {
    appState.reviewExpanded = !appState.reviewExpanded;
    renderReviewList(appState.dashboardCache && appState.dashboardCache.recent ? appState.dashboardCache.recent : []);
  });
}

if (adToggleButton) {
  adToggleButton.addEventListener("click", function () {
    appState.adExpanded = !appState.adExpanded;
    renderAdList(appState.dashboardCache && appState.dashboardCache.adEvents ? appState.dashboardCache.adEvents : []);
  });
}

Array.from(document.querySelectorAll("[data-source-bucket]")).forEach((button) => {
  button.addEventListener("click", function () {
    const bucketId = String(button.getAttribute("data-source-bucket") || "");
    openSourceBucket(bucketId);
  });
});

Array.from(document.querySelectorAll("[data-metric-detail]")).forEach((button) => {
  button.addEventListener("click", function () {
    const detailId = String(button.getAttribute("data-metric-detail") || "");
    navigateToMetricDetail(detailId);
  });
});

if (reviewSearchInput) {
  reviewSearchInput.addEventListener("input", function (event) {
    appState.reviewQuery = String(event.target.value || "");
    renderReviewList(appState.dashboardCache && appState.dashboardCache.recent ? appState.dashboardCache.recent : []);
  });
}

if (reviewFilterGroup) {
  reviewFilterGroup.addEventListener("click", function (event) {
    const button = event.target.closest("[data-filter]");
    if (!button) {
      return;
    }

    appState.reviewFilter = String(button.dataset.filter || "all");
    Array.from(reviewFilterGroup.querySelectorAll("[data-filter]")).forEach((node) => {
      node.classList.toggle("active", node === button);
    });
    renderReviewList(appState.dashboardCache && appState.dashboardCache.recent ? appState.dashboardCache.recent : []);
  });
}

if (reviewSortGroup) {
  reviewSortGroup.addEventListener("click", function (event) {
    const button = event.target.closest("[data-sort]");
    if (!button) {
      return;
    }
    appState.reviewSort = button.dataset.sort || "time";
    renderReviewList(appState.dashboardCache && appState.dashboardCache.recent ? appState.dashboardCache.recent : []);
  });
}

document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    refreshDashboard();
  }
});

detectConsoleMode();
