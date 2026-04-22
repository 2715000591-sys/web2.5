(function () {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const DEFAULT_PUBLIC_BACKEND_BASE_URL = "https://web25-public.web25-boris.workers.dev";
  const LEGACY_BACKEND_BASE_URLS = new Set([
    "",
    "http://127.0.0.1:8787",
    "http://localhost:8787",
    "https://web25-public-pages.pages.dev"
  ]);
  const enabledCheckbox = document.getElementById("enabled");
  const markingCheckbox = document.getElementById("markingEnabled");
  const backendBaseUrlInput = document.getElementById("backendBaseUrl");
  const accountStatusValue = document.getElementById("accountStatusValue");
  const openConsoleLink = document.getElementById("openConsole");
  const syncStatus = document.getElementById("syncStatus");

  function normalizeBackendBaseUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function shouldAutoUpgradeBackendBaseUrl(value) {
    return LEGACY_BACKEND_BASE_URLS.has(normalizeBackendBaseUrl(value));
  }

  function generateSyncId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return prefix + window.crypto.randomUUID().replace(/-/g, "");
    }

    return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  async function requestJson(endpoint, options) {
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
        data: data
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

  function formatViewerLabel(viewer) {
    if (!viewer || !viewer.email) {
      return "未登录";
    }
    return viewer.isDeveloper ? `${viewer.email} · 开发者` : viewer.email;
  }

  function renderConsoleLink() {
    const backendBaseUrl = normalizeBackendBaseUrl(backendBaseUrlInput.value);
    const href = backendBaseUrl ? `${backendBaseUrl}/console/` : "#";
    openConsoleLink.href = href;
  }

  function ensureIdentity(result, callback) {
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

  function readSetting() {
    api.storage.local.get({
      enabled: true,
      markingEnabled: false,
      backendBaseUrl: DEFAULT_PUBLIC_BACKEND_BASE_URL,
      syncKey: "",
      deviceId: ""
    }, function (result) {
      ensureIdentity(result, function (resolvedResult) {
        enabledCheckbox.checked = Boolean(resolvedResult.enabled);
        markingCheckbox.checked = Boolean(resolvedResult.markingEnabled);
        backendBaseUrlInput.value = normalizeBackendBaseUrl(resolvedResult.backendBaseUrl || DEFAULT_PUBLIC_BACKEND_BASE_URL);
        renderConsoleLink();
        syncAccountConnection(resolvedResult);
      });
    });
  }

  async function syncAccountConnection(resolvedResult) {
    const backendBaseUrl = normalizeBackendBaseUrl(
      resolvedResult && resolvedResult.backendBaseUrl
        ? resolvedResult.backendBaseUrl
        : backendBaseUrlInput.value
    );
    const syncKey = String(resolvedResult && resolvedResult.syncKey ? resolvedResult.syncKey : "").trim();

    if (!accountStatusValue) {
      return;
    }

    if (!backendBaseUrl) {
      accountStatusValue.textContent = "未配置服务";
      syncStatus.textContent = "先填好服务地址，登录后的账号和插件设备才能自动接上。";
      return;
    }

    if (!syncKey) {
      accountStatusValue.textContent = "设备初始化中";
      syncStatus.textContent = "正在准备当前设备的身份信息，稍后会自动接入账号。";
      return;
    }

    accountStatusValue.textContent = "正在检查...";
    syncStatus.textContent = "正在检查当前账号和设备连接状态。";

    const me = await requestJson(`${backendBaseUrl}/api/me`);
    if (!me.ok || !me.data || !me.data.loggedIn || !me.data.viewer) {
      accountStatusValue.textContent = "未登录";
      syncStatus.textContent = "登录控制台后，当前设备会自动接入账号，不需要手动复制任何东西。";
      return;
    }

    const bindResult = await requestJson(`${backendBaseUrl}/api/account/bind-sync-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ syncKey })
    });

    if (!bindResult.ok || !bindResult.data || !bindResult.data.ok) {
      accountStatusValue.textContent = formatViewerLabel(me.data.viewer);
      syncStatus.textContent = "账号已经登录，但这台设备这次还没接上。刷新一下，再给它一点时间。";
      return;
    }

    accountStatusValue.textContent = formatViewerLabel(me.data.viewer);
    syncStatus.textContent = "当前设备已经自动接入这个账号。以后只管登录账号就行。";
  }

  enabledCheckbox.addEventListener("change", function () {
    api.storage.local.set({ enabled: enabledCheckbox.checked });
  });

  markingCheckbox.addEventListener("change", function () {
    api.storage.local.set({ markingEnabled: markingCheckbox.checked });
  });

  backendBaseUrlInput.addEventListener("change", function () {
    const value = normalizeBackendBaseUrl(backendBaseUrlInput.value);
    backendBaseUrlInput.value = value;
    api.storage.local.set({ backendBaseUrl: value });
    renderConsoleLink();
    api.storage.local.get({
      backendBaseUrl: value,
      syncKey: ""
    }, function (result) {
      syncAccountConnection(result);
    });
  });

  readSetting();
})();
