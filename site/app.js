const syncKeyInput = document.getElementById("syncKeyInput");
const saveSyncKeyButton = document.getElementById("saveSyncKey");
const refreshDashboardButton = document.getElementById("refreshDashboard");
const dashboardStatus = document.getElementById("dashboardStatus");
const tokenCloud = document.getElementById("token-cloud");
const recentList = document.getElementById("recent-list");
const recentCountPill = document.getElementById("recentCountPill");
const reviewList = document.getElementById("review-list");
const reviewSearchInput = document.getElementById("reviewSearchInput");
const reviewToggleButton = document.getElementById("reviewToggleButton");
const reviewCountPill = document.getElementById("reviewCountPill");
const reviewFilterGroup = document.getElementById("reviewFilterGroup");
const syncModePill = document.getElementById("syncModePill");
const backendStatusValue = document.getElementById("backendStatusValue");
const ownershipHint = document.getElementById("ownershipHint");
const accountChip = document.getElementById("accountChip");

let dashboardCache = null;
let reviewExpanded = false;
let reviewQuery = "";
let reviewFilter = "all";

const statNodes = {
  heroHideCount: document.getElementById("heroHideCount"),
  heroAutoActiveCount: document.getElementById("heroAutoActiveCount"),
  heroManualActiveCount: document.getElementById("heroManualActiveCount"),
  heroAllowCount: document.getElementById("heroAllowCount"),
  heroPhraseCount: document.getElementById("heroPhraseCount"),
  activeHiddenCount: document.getElementById("activeHiddenCount"),
  activeAutoHiddenCount: document.getElementById("activeAutoHiddenCount"),
  activeManualHiddenCount: document.getElementById("activeManualHiddenCount"),
  autoHideCount: document.getElementById("autoHideCount"),
  manualHideCount: document.getElementById("manualHideCount"),
  manualAllowCount: document.getElementById("manualAllowCount"),
  distinctHandleCount: document.getElementById("distinctHandleCount")
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
  if (!node) {
    return;
  }

  node.textContent = String(value || 0);
}

function renderEmpty(container, message) {
  if (!container) {
    return;
  }

  container.innerHTML = `<div class="empty-state">${message}</div>`;
}

function shortSyncKey(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "未绑定";
  }

  if (raw.length <= 16) {
    return raw;
  }

  return `${raw.slice(0, 8)}…${raw.slice(-6)}`;
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
      label: "系统自动整理",
      className: "reason-pill auto"
    };
  }

  if (source === "manual_allow") {
    return {
      label: "你恢复了误标",
      className: "reason-pill allow"
    };
  }

  return {
    label: "你手动下沉",
    className: "reason-pill manual"
  };
}

function renderTokenCloud(items) {
  if (!tokenCloud) {
    return;
  }

  if (!items || items.length === 0) {
    renderEmpty(tokenCloud, "还没有同步到高频话术。等你继续使用后，这里会慢慢变成你的真实风险词板。");
    return;
  }

  tokenCloud.innerHTML = "";
  const list = document.createElement("div");
  list.className = "phrase-list";

  items.forEach((item, index) => {
    const row = document.createElement("article");
    row.className = "phrase-row";
    row.innerHTML = `
      <span class="phrase-rank">${index + 1}</span>
      <div class="phrase-copy">
        <strong>${escapeHtml(item.label)}</strong>
        <small>累计命中 ${item.count} 次</small>
      </div>
      <span class="phrase-count">${item.count}</span>
    `;
    list.appendChild(row);
  });

  tokenCloud.appendChild(list);
}

function renderRecentList(items) {
  if (!recentList) {
    return;
  }

  const list = Array.isArray(items) ? items : [];
  if (recentCountPill) {
    recentCountPill.textContent = `最近 ${list.length} 条`;
  }

  if (list.length === 0) {
    renderEmpty(recentList, "后台还没有收到动作记录。你在扩展里继续整理后，这里才会开始长出真实时间线。");
    return;
  }

  recentList.innerHTML = "";
  list.slice(0, 12).forEach((item) => {
    const meta = getSourceMeta(item.eventType);
    const subtitle = [item.replyDisplayName, item.replyHandle].filter(Boolean).join(" ");
    const row = document.createElement("article");
    row.className = "recent-row";
    row.innerHTML = `
      <div class="recent-row-top">
        <span class="${meta.className}">${meta.label}</span>
        <time>${formatRelativeTime(item.createdAt)}</time>
      </div>
      <p class="recent-row-identity">${escapeHtml(subtitle || "未识别账号")}</p>
      <p class="recent-row-body">${escapeHtml(item.replyText || "这条记录没有保存正文。")}</p>
    `;
    recentList.appendChild(row);
  });
}

function getFilteredReviewItems(items) {
  const list = Array.isArray(items) ? items : [];
  const query = String(reviewQuery || "").trim().toLowerCase();

  return list.filter((item) => {
    const matchFilter = reviewFilter === "all"
      || (reviewFilter === "auto" && item.source === "auto_hide")
      || (reviewFilter === "manual" && item.source === "manual_hide");
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
    if (totalCount === 0) {
      reviewCountPill.textContent = "当前为空";
    } else if (reviewQuery || reviewFilter !== "all") {
      reviewCountPill.textContent = `匹配 ${visibleCount} / 共 ${totalCount} 条`;
    } else {
      reviewCountPill.textContent = `当前 ${totalCount} 条`;
    }
  }

  if (reviewToggleButton) {
    reviewToggleButton.textContent = reviewExpanded ? "收起列表" : "展开列表";
  }

  if (reviewList) {
    reviewList.classList.toggle("review-list-collapsed", !reviewExpanded);
  }
}

function renderReviewList(items) {
  if (!reviewList) {
    return;
  }

  const sourceItems = Array.isArray(items) ? items : [];
  const filteredItems = getFilteredReviewItems(sourceItems);
  updateReviewShell(sourceItems.length, filteredItems.length);

  if (!reviewExpanded) {
    reviewList.innerHTML = "";
    return;
  }

  if (sourceItems.length === 0) {
    renderEmpty(reviewList, "当前没有仍在生效的整理记录。");
    return;
  }

  if (filteredItems.length === 0) {
    renderEmpty(reviewList, "没有找到匹配的记录。试试换个关键词，或者把筛选切回“全部”。");
    return;
  }

  reviewList.innerHTML = "";
  filteredItems.forEach((item) => {
    const meta = getSourceMeta(item.source);
    const subtitle = [item.replyDisplayName, item.replyHandle].filter(Boolean).join(" ");
    const row = document.createElement("article");
    row.className = "review-row";
    row.innerHTML = `
      <div class="review-row-top">
        <div class="review-row-title">
          <span class="${meta.className}">${meta.label}</span>
          <strong>${escapeHtml(subtitle || "未识别账号")}</strong>
        </div>
        <time>${formatRelativeTime(item.createdAt)}</time>
      </div>
      <p class="review-body review-body-compact">${escapeHtml(item.replyText || "这条记录里没有保存正文。")}</p>
      <div class="review-detail" hidden>
        <p class="review-detail-copy">${escapeHtml(item.replyText || "这条记录里没有保存正文。")}</p>
      </div>
      <div class="review-actions">
        <button class="ghost-button small-button review-toggle-detail" type="button">查看内容</button>
        <button class="ghost-button small-button review-restore-button" type="button">这是误标，恢复这条</button>
      </div>
    `;

    const detail = row.querySelector(".review-detail");
    const detailButton = row.querySelector(".review-toggle-detail");
    const restoreButton = row.querySelector(".review-restore-button");

    detailButton.addEventListener("click", function () {
      const expanded = row.classList.toggle("review-row-expanded");
      detail.hidden = !expanded;
      detailButton.textContent = expanded ? "收起内容" : "查看内容";
    });

    restoreButton.addEventListener("click", function () {
      restoreItem(item, restoreButton);
    });

    reviewList.appendChild(row);
  });
}

function renderDashboard(payload) {
  dashboardCache = payload || null;
  const stats = payload && payload.stats ? payload.stats : {};
  const activeHiddenItems = payload && Array.isArray(payload.activeHiddenItems) ? payload.activeHiddenItems : [];

  setNumber(statNodes.heroHideCount, stats.activeHiddenCount || activeHiddenItems.length);
  setNumber(statNodes.heroAutoActiveCount, stats.activeAutoHidden || 0);
  setNumber(statNodes.heroManualActiveCount, stats.activeManualHidden || 0);
  setNumber(statNodes.heroAllowCount, stats.manualAllowEvents || 0);
  setNumber(statNodes.heroPhraseCount, stats.distinctHiddenPhrases || 0);

  setNumber(statNodes.activeHiddenCount, stats.activeHiddenCount || activeHiddenItems.length);
  setNumber(statNodes.activeAutoHiddenCount, stats.activeAutoHidden || 0);
  setNumber(statNodes.activeManualHiddenCount, stats.activeManualHidden || 0);
  setNumber(statNodes.autoHideCount, stats.autoHideEvents || 0);
  setNumber(statNodes.manualHideCount, stats.manualHideEvents || 0);
  setNumber(statNodes.manualAllowCount, stats.manualAllowEvents || 0);
  setNumber(statNodes.distinctHandleCount, stats.distinctHiddenHandles || 0);

  renderTokenCloud(payload && payload.topPhrases ? payload.topPhrases : []);
  renderRecentList(payload && payload.recent ? payload.recent : []);
  renderReviewList(activeHiddenItems);
}

async function restoreItem(item, button) {
  const syncKey = String(syncKeyInput.value || "").trim();
  if (!syncKey) {
    setStatus("先绑定同步密钥，才能恢复误标。");
    return;
  }

  const baseUrl = getBackendBaseUrl();
  if (button) {
    button.disabled = true;
    button.textContent = "正在恢复...";
  }
  setStatus("正在把这条误标恢复回去...");

  try {
    const response = await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
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
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "restore-failed");
    }

    await fetchDashboard("已经把这条误标恢复了。Safari 那边刷新或重开后，也会吃到这次改动。");
  } catch (error) {
    setStatus("恢复失败了。先别慌，点一次刷新就能重新拉取后台状态。");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "这是误标，恢复这条";
    }
  }
}

function updateConnectionCopy(syncKey, connected) {
  if (syncModePill) {
    syncModePill.textContent = syncKey
      ? `当前密钥 ${shortSyncKey(syncKey)}`
      : "先绑定同步密钥";
  }

  if (backendStatusValue) {
    backendStatusValue.textContent = connected
      ? "本地后台已连接，网页里看到的是实时数据。"
      : "还没连到后台。等后台启动后，这里会自动变成实时数据。";
  }

  if (ownershipHint) {
    ownershipHint.textContent = syncKey
      ? `当前这份记录跟着同步密钥 ${shortSyncKey(syncKey)} 走。默认不是全体用户共享。`
      : "当前还没绑定同步密钥，所以网站暂时不知道该显示谁的数据。";
  }

  if (accountChip) {
    accountChip.textContent = syncKey ? "当前按同步密钥隔离" : "账户系统后续开放";
  }
}

async function fetchDashboard(successMessage) {
  const syncKey = String(syncKeyInput.value || "").trim();
  if (!syncKey) {
    renderDashboard({
      stats: {
        activeHiddenCount: 0,
        activeAutoHidden: 0,
        activeManualHidden: 0,
        autoHideEvents: 0,
        manualHideEvents: 0,
        manualAllowEvents: 0,
        distinctHiddenHandles: 0,
        distinctHiddenPhrases: 0
      },
      topPhrases: [],
      recent: [],
      activeHiddenItems: []
    });
    updateConnectionCopy("", false);
    setStatus("先把扩展里的同步密钥贴进来，网页才能读取你的真实数据。");
    return;
  }

  const baseUrl = getBackendBaseUrl();
  setStatus("正在读取真实数据...");

  try {
    const response = await fetch(`${baseUrl}/api/dashboard?syncKey=${encodeURIComponent(syncKey)}`, {
      cache: "no-store"
    });
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "dashboard-request-failed");
    }

    window.localStorage.setItem("web25_sync_key", syncKey);
    renderDashboard(payload);
    updateConnectionCopy(syncKey, true);
    setStatus(successMessage || "已经同步到真实记录。这里看到的不是演示数据，而是当前后台里的实际内容。");
  } catch (error) {
    renderDashboard({
      stats: {
        activeHiddenCount: 0,
        activeAutoHidden: 0,
        activeManualHidden: 0,
        autoHideEvents: 0,
        manualHideEvents: 0,
        manualAllowEvents: 0,
        distinctHiddenHandles: 0,
        distinctHiddenPhrases: 0
      },
      topPhrases: [],
      recent: [],
      activeHiddenItems: dashboardCache && dashboardCache.activeHiddenItems ? dashboardCache.activeHiddenItems : []
    });
    updateConnectionCopy(syncKey, false);
    setStatus("暂时还没连上后台。确认服务已经启动后，再点一次刷新。");
  }
}

saveSyncKeyButton.addEventListener("click", function () {
  fetchDashboard();
});

refreshDashboardButton.addEventListener("click", function () {
  fetchDashboard();
});

if (reviewToggleButton) {
  reviewToggleButton.addEventListener("click", function () {
    reviewExpanded = !reviewExpanded;
    renderReviewList(dashboardCache && dashboardCache.activeHiddenItems ? dashboardCache.activeHiddenItems : []);
  });
}

if (reviewSearchInput) {
  reviewSearchInput.addEventListener("input", function (event) {
    reviewQuery = String(event.target.value || "");
    if (reviewQuery.trim()) {
      reviewExpanded = true;
    }
    renderReviewList(dashboardCache && dashboardCache.activeHiddenItems ? dashboardCache.activeHiddenItems : []);
  });
}

if (reviewFilterGroup) {
  reviewFilterGroup.addEventListener("click", function (event) {
    const button = event.target.closest("[data-filter]");
    if (!button) {
      return;
    }

    reviewFilter = String(button.dataset.filter || "all");
    Array.from(reviewFilterGroup.querySelectorAll("[data-filter]")).forEach((node) => {
      node.classList.toggle("active", node === button);
    });
    reviewExpanded = true;
    renderReviewList(dashboardCache && dashboardCache.activeHiddenItems ? dashboardCache.activeHiddenItems : []);
  });
}

syncKeyInput.value = getSyncKeyFromPage();
updateConnectionCopy(syncKeyInput.value, false);
fetchDashboard();
