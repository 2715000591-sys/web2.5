const syncKeyInput = document.getElementById("syncKeyInput");
const saveSyncKeyButton = document.getElementById("saveSyncKey");
const refreshDashboardButton = document.getElementById("refreshDashboard");
const dashboardStatus = document.getElementById("dashboardStatus");
const tokenCloud = document.getElementById("token-cloud");
const reviewList = document.getElementById("review-list");
const loginEntry = document.getElementById("loginEntry");
const reviewSearchInput = document.getElementById("reviewSearchInput");
const reviewToggleButton = document.getElementById("reviewToggleButton");
const reviewCountPill = document.getElementById("reviewCountPill");
let dashboardCache = null;
let reviewExpanded = false;
let reviewQuery = "";

const statNodes = {
  heroHideCount: document.getElementById("heroHideCount"),
  heroPhraseCount: document.getElementById("heroPhraseCount"),
  heroAllowCount: document.getElementById("heroAllowCount"),
  activeHiddenCount: document.getElementById("activeHiddenCount"),
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

function updateReviewShell(totalCount, visibleCount) {
  if (reviewCountPill) {
    if (totalCount === 0) {
      reviewCountPill.textContent = "当前为空";
    } else if (reviewQuery) {
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

function renderTokenCloud(items) {
  if (!tokenCloud) {
    return;
  }

  if (!items || items.length === 0) {
    renderEmpty(tokenCloud, "还没有同步到高频话术。等你在扩展里继续标记后，这里就会出现真实数据。");
    return;
  }

  tokenCloud.innerHTML = "";
  items.forEach((item) => {
    const pill = document.createElement("div");
    pill.className = "token-pill";
    pill.innerHTML = `${item.label}<strong>${item.count}</strong>`;
    tokenCloud.appendChild(pill);
  });
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

function getFilteredReviewItems(items) {
  const list = Array.isArray(items) ? items : [];
  const query = String(reviewQuery || "").trim().toLowerCase();
  if (!query) {
    return list;
  }

  return list.filter((item) => {
    return [
      item.replyDisplayName,
      item.replyHandle,
      item.replyText,
      item.normalizedText
    ].some((field) => String(field || "").toLowerCase().includes(query));
  });
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

  if (!sourceItems || sourceItems.length === 0) {
    renderEmpty(reviewList, "当前没有仍在生效的被整理回复。");
    return;
  }

  if (!filteredItems || filteredItems.length === 0) {
    renderEmpty(reviewList, "没有找到匹配的记录。试试搜账号、句子或关键词。");
    return;
  }

  reviewList.innerHTML = "";
  filteredItems.forEach((item) => {
    const row = document.createElement("article");
    const subtitle = [item.replyDisplayName, item.replyHandle].filter(Boolean).join(" ");
    row.className = "review-row";
    row.innerHTML = `
      <div class="review-row-top">
        <strong>当前被整理</strong>
        <span class="reason-pill manual">手动下沉</span>
      </div>
      <p class="review-identity">${escapeHtml(subtitle || "未识别账号")}</p>
      <p class="review-body">${escapeHtml(item.replyText || "这条记录里没有保存文本。")}</p>
      <p class="review-time">${formatRelativeTime(item.createdAt)}</p>
      <div class="review-actions">
        <button class="ghost-button small-button review-restore-button" type="button">这是误标，恢复这条</button>
      </div>
    `;
    const restoreButton = row.querySelector(".review-restore-button");
    restoreButton.addEventListener("click", function () {
      restoreItem(item, restoreButton);
    });
    reviewList.appendChild(row);
  });
}

function renderDashboard(payload) {
  dashboardCache = payload || null;
  const stats = payload && payload.stats ? payload.stats : {};
  const activeHiddenCount = payload && Array.isArray(payload.activeHiddenItems) ? payload.activeHiddenItems.length : 0;
  setNumber(statNodes.heroHideCount, activeHiddenCount);
  setNumber(statNodes.heroPhraseCount, stats.distinctHiddenPhrases);
  setNumber(statNodes.heroAllowCount, stats.manualAllowEvents);
  setNumber(statNodes.activeHiddenCount, activeHiddenCount);
  setNumber(statNodes.autoHideCount, stats.autoHideEvents);
  setNumber(statNodes.manualHideCount, stats.manualHideEvents);
  setNumber(statNodes.manualAllowCount, stats.manualAllowEvents);
  setNumber(statNodes.distinctHandleCount, stats.distinctHiddenHandles);
  renderTokenCloud(payload && payload.topPhrases ? payload.topPhrases : []);
  renderReviewList(payload && payload.activeHiddenItems ? payload.activeHiddenItems : []);
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
    setStatus("恢复失败了。先别慌，我已经保留住当前列表，再点一次刷新就行。");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "这是误标，恢复这条";
    }
  }
}

async function fetchDashboard(successMessage) {
  const syncKey = String(syncKeyInput.value || "").trim();
  if (!syncKey) {
    renderDashboard({
      stats: {
        manualHideEvents: 0,
        manualAllowEvents: 0,
        distinctHiddenHandles: 0,
        distinctHiddenPhrases: 0
      },
      topPhrases: [],
      recent: [],
      activeHiddenItems: []
    });
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
    setStatus(successMessage || "已经同步到真实记录。这里显示的都是当前后台里的实际数据。");
  } catch (error) {
    renderDashboard({
      stats: {
        manualHideEvents: 0,
        manualAllowEvents: 0,
        distinctHiddenHandles: 0,
        distinctHiddenPhrases: 0
      },
      topPhrases: [],
      recent: [],
      activeHiddenItems: dashboardCache && dashboardCache.activeHiddenItems ? dashboardCache.activeHiddenItems : []
    });
    setStatus("暂时还没连上后台。确认服务已经启动后，再点一次刷新。");
  }
}

saveSyncKeyButton.addEventListener("click", function () {
  fetchDashboard();
});

refreshDashboardButton.addEventListener("click", function () {
  fetchDashboard();
});

if (loginEntry) {
  loginEntry.addEventListener("click", function () {
    setStatus("登录功能还在准备中。当前先用同步密钥绑定你的记录。");
  });
}

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

syncKeyInput.value = getSyncKeyFromPage();
fetchDashboard();
