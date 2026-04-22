const adHideCountNode = document.getElementById("adHideCount");
const adHideStatusNode = document.getElementById("adHideStatus");

function getLandingBackendBaseUrl() {
  const configured = window.localStorage.getItem("web25_backend_base_url");
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (window.location.origin && window.location.origin.startsWith("http")) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return "http://127.0.0.1:8787";
}

function getLandingSyncKey() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = String(params.get("syncKey") || "").trim();
  if (fromUrl) {
    window.localStorage.setItem("web25_sync_key", fromUrl);
    return fromUrl;
  }

  return String(window.localStorage.getItem("web25_sync_key") || "").trim();
}

function renderAdHideMetric(count, message) {
  if (adHideCountNode) {
    adHideCountNode.textContent = typeof count === "number" ? String(count) : "--";
  }

  if (adHideStatusNode) {
    adHideStatusNode.textContent = message;
  }
}

async function loadLandingMetric() {
  const syncKey = getLandingSyncKey();
  if (!syncKey) {
    renderAdHideMetric(null, "绑定同步数据后，这里会显示真实累计。");
    return;
  }

  renderAdHideMetric(null, "正在读取真实累计...");

  try {
    const response = await fetch(
      `${getLandingBackendBaseUrl()}/api/dashboard?syncKey=${encodeURIComponent(syncKey)}`,
      { cache: "no-store" }
    );
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "dashboard-request-failed");
    }

    const stats = payload && payload.stats ? payload.stats : (payload && payload.globalStats ? payload.globalStats : {});
    const count = Number((stats.adHomeHideEvents || 0) + (stats.adReplyHideEvents || 0));
    renderAdHideMetric(count, `当前这把同步数据，已经帮你跳过 ${count} 条官方推广帖。`);
  } catch (error) {
    renderAdHideMetric(null, "这次没读到真实累计，稍后刷新再试。");
  }
}

loadLandingMetric();
