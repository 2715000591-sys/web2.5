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
  autoHideCount: document.getElementById("autoHideCount"),
  manualHideCount: document.getElementById("manualHideCount"),
  manualAllowCount: document.getElementById("manualAllowCount"),
  distinctHandleCount: document.getElementById("distinctHandleCount"),
  heroPhraseCount: document.getElementById("heroPhraseCount"),
  adHomeHideCount: document.getElementById("adHomeHideCount"),
  adReplyHideCount: document.getElementById("adReplyHideCount")
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
  developerRulePage: 1
};

function getBackendBaseUrl() {
  const configured = window.localStorage.getItem("web25_backend_base_url");
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (window.location.origin && window.location.origin.startsWith("http")) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return "http://127.0.0.1:8787";
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
      label: "web2.5 自动",
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

  return list.filter((item) => {
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

function setMetricGroup(statNodes, stats) {
  const adHomeHideEvents = stats.adHomeHideEvents || 0;
  const adReplyHideEvents = stats.adReplyHideEvents || 0;
  setNumber(statNodes.autoHideCount, stats.autoHideEvents || 0);
  if (statNodes.adTotalHideCount) {
    setNumber(statNodes.adTotalHideCount, adHomeHideEvents + adReplyHideEvents);
  }
  setNumber(statNodes.manualHideCount, stats.manualHideEvents || 0);
  if (statNodes.manualAllowCount) {
    setNumber(statNodes.manualAllowCount, stats.manualAllowEvents || 0);
  }
  setNumber(statNodes.distinctHandleCount, stats.distinctHiddenHandles || 0);
  setNumber(statNodes.heroPhraseCount, stats.distinctHiddenPhrases || 0);
  setNumber(statNodes.adHomeHideCount, adHomeHideEvents);
  setNumber(statNodes.adReplyHideCount, adReplyHideEvents);
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

function renderBindings(bindings) {
  if (!bindingList) {
    return;
  }
  const list = Array.isArray(bindings) ? bindings : [];
  if (!list.length) {
    bindingList.innerHTML = `<span class="surface-note">当前账号下还没有已接入设备。</span>`;
    return;
  }

  bindingList.innerHTML = list.map((item) => `
    <div class="binding-item">
      <strong>${escapeHtml(String(item && item.label ? item.label : "已接入"))}</strong>
      <span class="surface-note">${escapeHtml(`最近活跃 ${formatRelativeTime(item.lastSeenAt)}`)}</span>
    </div>
  `).join("");
}

async function restoreItem(item, button) {
  const syncKey = String(getActiveSyncKey() || "").trim();
  if (!syncKey) {
    setStatus("这台设备还没接上账号，刷新一下再试。");
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = "正在恢复...";
  }
  setStatus("正在恢复这条内容...");

  try {
    const result = await requestJson("/api/events", {
      method: "POST",
      body: JSON.stringify({
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
      })
    });

    if (!result.ok || !result.data || !result.data.ok) {
      throw new Error((result.data && result.data.error) || "restore-failed");
    }

    await refreshDashboard("这条内容已经恢复。");
  } catch (error) {
    setStatus("恢复失败了，点刷新再试一次。");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "恢复这条";
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
      <p class="review-body">${escapeHtml(item.replyText || "这条记录里没有保存正文。")}</p>
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
          <p class="developer-body">${escapeHtml(item.replyText || "这条样本没有保存正文。")}</p>
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
      <p class="developer-body">${escapeHtml(item.replyText || "这条规则没有保存正文。")}</p>
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
      <p class="developer-body">${escapeHtml(item.replyText || "这条规则没有保存正文。")}</p>
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
  appState.mode = "cloud";
  setHidden(loggedOutState, Boolean(loggedIn));
  setHidden(loggedInState, !loggedIn);
  setHidden(legacyState, true);
  setHidden(cloudDashboardSection, !loggedIn);
  setHidden(developerSection, true);
  setHidden(personalDashboardSection, !loggedIn);
  setHidden(adSection, !loggedIn);
  setHidden(reviewSection, !loggedIn);
  if (syncModePill) {
    syncModePill.textContent = loggedIn ? "已登录云端控制台" : "登录后查看个人控制台";
  }
}

function renderLegacyMode() {
  appState.mode = "legacy";
  setHidden(loggedOutState, true);
  setHidden(loggedInState, true);
  setHidden(legacyState, false);
  setHidden(cloudDashboardSection, true);
  setHidden(developerSection, true);
  setHidden(personalDashboardSection, false);
  setHidden(adSection, false);
  setHidden(reviewSection, false);
  if (syncModePill) {
    syncModePill.textContent = "本地控制台";
  }
}

async function requestJson(path, options) {
  const endpoint = path.startsWith("http") ? path : `${getBackendBaseUrl()}${path}`;
  try {
    const response = await fetch(endpoint, Object.assign({
      cache: "no-store",
      credentials: "include"
    }, options || {}));
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
    return {
      ok: false,
      status: 0,
      data: {},
      error: error && error.message ? error.message : String(error)
    };
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
      await refreshDashboard("已连接到你的云端控制台。");
    } else {
      setStatus("先登录，控制台才会显示你的个人数据。");
      setAuthHint(
        appState.developerLoginEnabled
          ? "开发者账号现在会直接显示开发验证码。普通邮箱登录，后面再接正式发信服务。"
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
      setAuthHint("普通邮箱登录还没接发信服务。开发者账号会直接显示开发验证码。");
    } else {
      setAuthHint("这次没把验证码发出去。等一下再试，或者之后补上邮件服务配置。");
    }
    return;
  }

  if (codeInput && result.data.debugCode) {
    codeInput.value = result.data.debugCode;
  }

  setAuthHint(result.data.debugCode
    ? `开发者验证码：${result.data.debugCode}`
    : "验证码已经发出，去邮箱里看一下。");
}

async function verifyLoginCode() {
  const email = String(emailInput && emailInput.value ? emailInput.value : "").trim();
  const code = String(codeInput && codeInput.value ? codeInput.value : "").trim();
  if (!email || !code) {
    setAuthHint("把邮箱和验证码都填上，再登录。");
    return;
  }

  verifyCodeButton.disabled = true;
  setAuthHint("正在验证验证码...");
  const result = await requestJson("/api/auth/verify-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, code })
  });
  verifyCodeButton.disabled = false;

  if (!result.ok || !result.data || !result.data.ok) {
    setAuthHint("验证码不对，或者已经过期了。重新发一封再试。");
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
  setStatus("你已经退出登录。");
}

function renderCloudDashboard(payload) {
  appState.dashboardCache = payload || null;
  setMetricGroup(globalStatNodes, payload && payload.globalStats ? payload.globalStats : {});
  setMetricGroup(personalStatNodes, payload && payload.personalStats ? payload.personalStats : {});
  renderBindings(payload && payload.bindings ? payload.bindings : []);
  renderDeveloperSection(payload && payload.developer ? payload.developer : null);
  renderAdList(payload && payload.adEvents ? payload.adEvents : []);
  renderReviewList(payload && payload.recent ? payload.recent : []);
  if (syncModePill) {
    syncModePill.textContent = appState.viewer ? formatViewerLabel(appState.viewer) : "登录后查看个人控制台";
  }
}

function renderLegacyDashboard(payload) {
  appState.dashboardCache = payload || null;
  setMetricGroup(personalStatNodes, payload && payload.stats ? payload.stats : {});
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
  const params = new URLSearchParams();
  if (syncKey) {
    params.set("syncKey", syncKey);
  }
  if (appState.viewer && appState.viewer.isDeveloper) {
    const developerState = getDeveloperDashboardRequestState();
    params.set("developerPendingPage", String(developerState.developerPendingPage));
    params.set("developerRulePage", String(developerState.developerRulePage));
  }
  const query = params.toString();
  const suffix = query ? `?${query}` : "";
  const result = await requestJson(`/api/dashboard${suffix}`);
  if (!result.ok || !result.data || !result.data.ok) {
    renderCloudDashboard({
      globalStats: {},
      personalStats: {},
      recent: [],
      adEvents: [],
      bindings: []
    });
    setStatus("这次没读到你的云端数据。等一下再刷新。");
    return;
  }

  if (syncKey) {
    window.localStorage.setItem("web25_sync_key", syncKey);
  }
  renderCloudDashboard(result.data);
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
