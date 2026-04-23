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
  const markingToggleRow = document.getElementById("markingToggleRow");
  const cleanupStatus = document.getElementById("cleanupStatus");
  const sidebarControlsCheckbox = document.getElementById("sidebarControlsEnabled");
  const sidebarControlsStatus = document.getElementById("sidebarControlsStatus");
  const serviceStatusValue = document.getElementById("serviceStatusValue");
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
    const backendBaseUrl = getBackendBaseUrl();
    const href = backendBaseUrl ? `${backendBaseUrl}/console/` : "#";
    openConsoleLink.href = href;
  }

  function getBackendBaseUrl(resolvedResult) {
    const value = normalizeBackendBaseUrl(
      resolvedResult && resolvedResult.backendBaseUrl
        ? resolvedResult.backendBaseUrl
        : DEFAULT_PUBLIC_BACKEND_BASE_URL
    );
    return value || DEFAULT_PUBLIC_BACKEND_BASE_URL;
  }

  function renderServiceStatus(resolvedResult) {
    if (!serviceStatusValue) {
      return;
    }

    const backendBaseUrl = getBackendBaseUrl(resolvedResult);
    serviceStatusValue.textContent = backendBaseUrl === DEFAULT_PUBLIC_BACKEND_BASE_URL
      ? "官方云端"
      : "自定义服务";
  }

  function updateCleanupUi() {
    if (!enabledCheckbox || !markingCheckbox) {
      return;
    }

    const cleanupEnabled = Boolean(enabledCheckbox.checked);
    markingCheckbox.disabled = !cleanupEnabled;
    if (markingToggleRow) {
      markingToggleRow.classList.toggle("toggle-sub-disabled", !cleanupEnabled);
    }
    if (cleanupStatus) {
      cleanupStatus.textContent = cleanupEnabled
        ? "只在帖子详情页生效。"
        : "关闭后，下面这项也不生效。";
    }
  }

  function setSidebarControlsStatus(message) {
    if (sidebarControlsStatus) {
      sidebarControlsStatus.textContent = message;
    }
  }

  function applySidebarControlsValue(value, persistLocally) {
    const enabled = value !== false;
    if (sidebarControlsCheckbox) {
      sidebarControlsCheckbox.checked = enabled;
    }

    if (!persistLocally) {
      return;
    }

    api.storage.local.set({
      sidebarControlsEnabled: enabled
    });
  }

  async function syncRemotePreferences(resolvedResult) {
    if (!sidebarControlsCheckbox) {
      return;
    }

    const backendBaseUrl = normalizeBackendBaseUrl(
      resolvedResult && resolvedResult.backendBaseUrl
        ? resolvedResult.backendBaseUrl
        : getBackendBaseUrl()
    );

    if (!backendBaseUrl) {
      setSidebarControlsStatus("当前先按这台设备自己的设置生效。登录后会同步到账号。");
      return;
    }

    const me = await requestJson(`${backendBaseUrl}/api/me`);
    if (!me.ok || !me.data || !me.data.loggedIn || !me.data.viewer) {
      setSidebarControlsStatus("当前先按这台设备自己的设置生效。登录官网后，这个偏好会同步到账号。");
      return;
    }

    const preferenceResult = await requestJson(`${backendBaseUrl}/api/preferences`);
    if (!preferenceResult.ok || !preferenceResult.data || !preferenceResult.data.preferences) {
      setSidebarControlsStatus("账号已经登录，但这次没读到右栏精简偏好。插件仍会先按本机设置生效。");
      return;
    }

    const remoteEnabled = preferenceResult.data.preferences.sidebarControlsEnabled !== false;
    applySidebarControlsValue(remoteEnabled, true);
    setSidebarControlsStatus(
      remoteEnabled
        ? "当前账号已开启右栏模块关闭按钮。官网和插件会尽量保持同一偏好。"
        : "当前账号已关闭右栏模块关闭按钮。官网和插件会尽量保持同一偏好。"
    );
  }

  async function saveSidebarControlsPreference() {
    if (!sidebarControlsCheckbox) {
      return;
    }

    const enabled = Boolean(sidebarControlsCheckbox.checked);
    api.storage.local.set({
      sidebarControlsEnabled: enabled
    });

    const backendBaseUrl = getBackendBaseUrl();
    if (!backendBaseUrl) {
      setSidebarControlsStatus("当前已保存到这台设备。登录后会同步到账号。");
      return;
    }

    const me = await requestJson(`${backendBaseUrl}/api/me`);
    if (!me.ok || !me.data || !me.data.loggedIn || !me.data.viewer) {
      setSidebarControlsStatus("当前已保存到这台设备。登录官网后，这个偏好会同步到账号。");
      return;
    }

    const result = await requestJson(`${backendBaseUrl}/api/preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sidebarControlsEnabled: enabled
      })
    });

    if (!result.ok || !result.data || !result.data.ok) {
      setSidebarControlsStatus("账号已经登录，但这次没同步上。插件还是会先按本机设置生效。");
      return;
    }

    setSidebarControlsStatus(
      enabled
        ? "右栏模块关闭按钮已开启，并且已经同步到账号。"
        : "右栏模块关闭按钮已关闭，并且已经同步到账号。"
    );
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
      sidebarControlsEnabled: true,
      backendBaseUrl: DEFAULT_PUBLIC_BACKEND_BASE_URL,
      syncKey: "",
      deviceId: ""
    }, function (result) {
      ensureIdentity(result, function (resolvedResult) {
        enabledCheckbox.checked = Boolean(resolvedResult.enabled);
        markingCheckbox.checked = Boolean(resolvedResult.markingEnabled);
        applySidebarControlsValue(Boolean(resolvedResult.sidebarControlsEnabled), false);
        renderServiceStatus(resolvedResult);
        updateCleanupUi();
        renderConsoleLink();
        syncAccountConnection(resolvedResult);
        syncRemotePreferences(resolvedResult);
      });
    });
  }

  async function syncAccountConnection(resolvedResult) {
    const backendBaseUrl = normalizeBackendBaseUrl(
      resolvedResult && resolvedResult.backendBaseUrl
        ? resolvedResult.backendBaseUrl
        : getBackendBaseUrl()
    );
    const syncKey = String(resolvedResult && resolvedResult.syncKey ? resolvedResult.syncKey : "").trim();

    if (!accountStatusValue) {
      return;
    }

    if (!backendBaseUrl) {
      accountStatusValue.textContent = "服务异常";
      syncStatus.textContent = "当前没接上云端。";
      return;
    }

    if (!syncKey) {
      accountStatusValue.textContent = "设备初始化中";
      syncStatus.textContent = "正在准备设备。";
      return;
    }

    accountStatusValue.textContent = "正在检查...";
    syncStatus.textContent = "正在检查当前账号和设备连接状态。";

    const me = await requestJson(`${backendBaseUrl}/api/me`);
    if (!me.ok || !me.data || !me.data.loggedIn || !me.data.viewer) {
      accountStatusValue.textContent = "未登录";
      syncStatus.textContent = "去官网登录一次就行。";
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
      syncStatus.textContent = "已登录，设备接入中。";
      return;
    }

    accountStatusValue.textContent = formatViewerLabel(me.data.viewer);
    syncStatus.textContent = "已登录，设备已接上。";
  }

  enabledCheckbox.addEventListener("change", function () {
    api.storage.local.set({ enabled: enabledCheckbox.checked });
    updateCleanupUi();
  });

  markingCheckbox.addEventListener("change", function () {
    api.storage.local.set({ markingEnabled: markingCheckbox.checked });
  });

  if (sidebarControlsCheckbox) {
    sidebarControlsCheckbox.addEventListener("change", function () {
      saveSidebarControlsPreference();
    });
  }

  readSetting();
})();
