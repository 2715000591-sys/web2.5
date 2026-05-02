(function () {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const DEFAULT_PUBLIC_BACKEND_BASE_URL = "https://colorful-toilet.colorful-toilet.workers.dev";
  const MARKING_DEFAULT_VERSION = "2026-05-02-default-on";
  const LEGACY_BACKEND_BASE_URLS = new Set([
    "",
    "http://127.0.0.1:8787",
    "http://localhost:8787",
    "https://web25-public-pages.pages.dev",
    "https://web25-public.web25-boris.workers.dev",
    "https://colorful-toilet.web25-boris.workers.dev"
  ]);
  const enabledCheckbox = document.getElementById("enabled");
  const replyAiCheckbox = document.getElementById("replyAiEnabled");
  const replyAiStatus = document.getElementById("replyAiStatus");
  const markingCheckbox = document.getElementById("markingEnabled");
  const markingToggleRow = document.getElementById("markingToggleRow");
  const cleanupStatus = document.getElementById("cleanupStatus");
  const sidebarControlsCheckbox = document.getElementById("sidebarControlsEnabled");
  const sidebarControlsStatus = document.getElementById("sidebarControlsStatus");
  const serviceStatusValue = document.getElementById("serviceStatusValue");
  const accountStatusValue = document.getElementById("accountStatusValue");
  const openConsoleLink = document.getElementById("openConsole");
  const syncStatus = document.getElementById("syncStatus");
  let popupContext = {
    backendBaseUrl: DEFAULT_PUBLIC_BACKEND_BASE_URL,
    syncKey: "",
    deviceId: "",
    loggedIn: false,
    aiKeyConfigured: false
  };

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

  function renderConsoleLink(resolvedResult) {
    const backendBaseUrl = getBackendBaseUrl(resolvedResult);
    if (!backendBaseUrl) {
      openConsoleLink.href = "#";
      return;
    }

    const consoleUrl = new URL(`${backendBaseUrl}/console/`);
    const syncKey = String(resolvedResult && resolvedResult.syncKey ? resolvedResult.syncKey : "").trim();
    const deviceId = String(resolvedResult && resolvedResult.deviceId ? resolvedResult.deviceId : "").trim();
    if (syncKey) {
      consoleUrl.searchParams.set("syncKey", syncKey);
    }
    if (deviceId) {
      consoleUrl.searchParams.set("deviceId", deviceId);
    }
    openConsoleLink.href = consoleUrl.toString();
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

  function setReplyAiStatus(message) {
    if (replyAiStatus) {
      replyAiStatus.textContent = message;
    }
  }

  function applyReplyAiToggleState(value, options) {
    if (!replyAiCheckbox) {
      return;
    }

    const nextOptions = options || {};
    const enabled = value === true;
    replyAiCheckbox.checked = enabled;
    if (nextOptions.persistRemoteValue) {
      replyAiCheckbox.dataset.remoteValue = enabled ? "1" : "0";
    }
    if (Object.prototype.hasOwnProperty.call(nextOptions, "disabled")) {
      replyAiCheckbox.disabled = nextOptions.disabled === true;
    }
  }

  function getStoredReplyAiRemoteValue() {
    return replyAiCheckbox && replyAiCheckbox.dataset.remoteValue === "1";
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

    if (replyAiStatus && !cleanupEnabled && popupContext.loggedIn && !replyAiCheckbox.disabled) {
      const keyHint = popupContext.aiKeyConfigured
        ? "回复区 AI 审核开关已接到云端，但当前总清理开关是关的。"
        : "回复区 AI 审核开关会同步到云端，但还需要先在控制台接入你自己的共享 AI key。";
      setReplyAiStatus(keyHint);
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

  function updatePopupContext(patch) {
    popupContext = Object.assign({}, popupContext, patch || {});
  }

  function persistBindingIdentity(syncKey, deviceId) {
    const nextSyncKey = String(syncKey || "").trim();
    const nextDeviceId = String(deviceId || "").trim();
    if (!nextSyncKey && !nextDeviceId) {
      return;
    }

    api.storage.local.set({
      syncKey: nextSyncKey || popupContext.syncKey || "",
      deviceId: nextDeviceId || popupContext.deviceId || ""
    });
    updatePopupContext({
      syncKey: nextSyncKey || popupContext.syncKey || "",
      deviceId: nextDeviceId || popupContext.deviceId || ""
    });
  }

  async function syncRemoteAiSettings(resolvedResult) {
    if (!replyAiCheckbox) {
      return;
    }

    const backendBaseUrl = normalizeBackendBaseUrl(
      resolvedResult && resolvedResult.backendBaseUrl
        ? resolvedResult.backendBaseUrl
        : getBackendBaseUrl(popupContext)
    );

    updatePopupContext({
      backendBaseUrl: backendBaseUrl || DEFAULT_PUBLIC_BACKEND_BASE_URL,
      syncKey: String(resolvedResult && resolvedResult.syncKey ? resolvedResult.syncKey : popupContext.syncKey || "").trim(),
      deviceId: String(resolvedResult && resolvedResult.deviceId ? resolvedResult.deviceId : popupContext.deviceId || "").trim()
    });

    if (!backendBaseUrl) {
      applyReplyAiToggleState(false, {
        persistRemoteValue: true,
        disabled: true
      });
      updatePopupContext({
        loggedIn: false,
        aiKeyConfigured: false
      });
      setReplyAiStatus("当前没接上云端，暂时还不能切换 AI 审核。共享 AI 提供商配置也会一起走云端账号。");
      return;
    }

    applyReplyAiToggleState(replyAiCheckbox.checked, {
      disabled: true
    });
    setReplyAiStatus("正在读取你云端账号里的 AI 审核设置。");

    const me = await requestJson(`${backendBaseUrl}/api/me`);
    if (!me.ok || !me.data || !me.data.loggedIn || !me.data.viewer) {
      updatePopupContext({
        loggedIn: false,
        aiKeyConfigured: false
      });
      applyReplyAiToggleState(false, {
        persistRemoteValue: true,
        disabled: true
      });
      setReplyAiStatus("登录官网后，这里就能直接开关你自己的回复区 AI 审核。共享 AI 提供商配置在控制台里统一保存。");
      return;
    }

    const result = await requestJson(`${backendBaseUrl}/api/ai-settings`);
    if (!result.ok || !result.data || !result.data.ok || !result.data.settings) {
      updatePopupContext({
        loggedIn: true,
        aiKeyConfigured: false
      });
      applyReplyAiToggleState(getStoredReplyAiRemoteValue(), {
        disabled: false
      });
      setReplyAiStatus("账号已经登录，但这次没读到 AI 审核设置。你可以稍后再试。");
      return;
    }

    const settings = result.data.settings;
    const replyAiEnabled = settings.replyAiEnabled === true;
    const apiKeyConfigured = settings.apiKeyConfigured === true;
    updatePopupContext({
      loggedIn: true,
      aiKeyConfigured: apiKeyConfigured
    });
    applyReplyAiToggleState(replyAiEnabled, {
      persistRemoteValue: true,
      disabled: false
    });

    if (replyAiEnabled) {
      setReplyAiStatus(
        apiKeyConfigured
          ? "当前账号已开启回复区 AI 审核。刷新 X 页面后就会按云端设置生效。"
          : "当前账号已打开这个开关，但还没有接入你自己的共享 AI key。去控制台填好后，刷新 X 页面就会生效。"
      );
      return;
    }

    setReplyAiStatus(
      apiKeyConfigured
        ? "当前账号已关闭回复区 AI 审核。你在这里打开后，刷新 X 页面就会生效。"
        : "当前账号还没接入你自己的共享 AI key。先去控制台接入，然后就能在这里直接开关。"
    );
  }

  async function saveReplyAiPreference() {
    if (!replyAiCheckbox) {
      return;
    }

    const backendBaseUrl = getBackendBaseUrl(popupContext);
    const nextEnabled = Boolean(replyAiCheckbox.checked);
    const previousEnabled = getStoredReplyAiRemoteValue();

    if (!backendBaseUrl) {
      applyReplyAiToggleState(previousEnabled, {
        persistRemoteValue: true,
        disabled: true
      });
      setReplyAiStatus("当前没接上云端，所以这次还没法替你切换 AI 审核。");
      return;
    }

    applyReplyAiToggleState(nextEnabled, {
      disabled: true
    });
    setReplyAiStatus("正在把这个 AI 审核开关保存到你的云端账号。");

    const me = await requestJson(`${backendBaseUrl}/api/me`);
    if (!me.ok || !me.data || !me.data.loggedIn || !me.data.viewer) {
      updatePopupContext({
        loggedIn: false,
        aiKeyConfigured: false
      });
      applyReplyAiToggleState(previousEnabled, {
        persistRemoteValue: true,
        disabled: true
      });
      setReplyAiStatus("你还没登录官网，所以这次没有改到云端账号。");
      return;
    }

    const result = await requestJson(`${backendBaseUrl}/api/ai-settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        replyAiEnabled: nextEnabled
      })
    });

    if (!result.ok || !result.data || !result.data.ok || !result.data.settings) {
      applyReplyAiToggleState(previousEnabled, {
        persistRemoteValue: true,
        disabled: false
      });
      setReplyAiStatus("账号已经登录，但这次没把 AI 审核开关保存上云。你稍后再试一下。");
      return;
    }

    const settings = result.data.settings;
    const apiKeyConfigured = settings.apiKeyConfigured === true;
    updatePopupContext({
      loggedIn: true,
      aiKeyConfigured: apiKeyConfigured
    });
    applyReplyAiToggleState(settings.replyAiEnabled === true, {
      persistRemoteValue: true,
      disabled: false
    });
    setReplyAiStatus(
      settings.replyAiEnabled === true
        ? (apiKeyConfigured
          ? "回复区 AI 审核已经保存到你的云端账号。刷新 X 页面后就会直接生效。"
          : "AI 审核开关已经保存到你的云端账号，但还需要先在控制台接入你自己的共享 AI key。")
        : "回复区 AI 审核已经在你的云端账号里关闭。刷新 X 页面后就不会再继续 AI 审核。"
    );
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

    if (result.markingDefaultVersion !== MARKING_DEFAULT_VERSION) {
      patch.markingEnabled = true;
      patch.markingDefaultVersion = MARKING_DEFAULT_VERSION;
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
      markingEnabled: true,
      markingDefaultVersion: "",
      sidebarControlsEnabled: true,
      backendBaseUrl: DEFAULT_PUBLIC_BACKEND_BASE_URL,
      syncKey: "",
      deviceId: ""
    }, function (result) {
      ensureIdentity(result, function (resolvedResult) {
        updatePopupContext({
          backendBaseUrl: getBackendBaseUrl(resolvedResult),
          syncKey: String(resolvedResult.syncKey || "").trim(),
          deviceId: String(resolvedResult.deviceId || "").trim()
        });
        enabledCheckbox.checked = Boolean(resolvedResult.enabled);
        markingCheckbox.checked = Boolean(resolvedResult.markingEnabled);
        applySidebarControlsValue(Boolean(resolvedResult.sidebarControlsEnabled), false);
        renderServiceStatus(resolvedResult);
        updateCleanupUi();
        renderConsoleLink(resolvedResult);
        syncAccountConnection(resolvedResult);
        syncRemotePreferences(resolvedResult);
        syncRemoteAiSettings(resolvedResult);
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
    const deviceId = String(resolvedResult && resolvedResult.deviceId ? resolvedResult.deviceId : "").trim();

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
      body: JSON.stringify({
        syncKey,
        deviceId
      })
    });

    if (!bindResult.ok || !bindResult.data || !bindResult.data.ok) {
      accountStatusValue.textContent = formatViewerLabel(me.data.viewer);
      syncStatus.textContent = "已登录，设备接入中。";
      return;
    }

    persistBindingIdentity(bindResult.data.syncKey, bindResult.data.deviceId);
    renderConsoleLink(popupContext);
    accountStatusValue.textContent = formatViewerLabel(me.data.viewer);
    syncStatus.textContent = bindResult.data.switchedSyncKey
      ? "已登录，设备已切到这个账号自己的记录。"
      : "已登录，设备已接上。";
  }

  enabledCheckbox.addEventListener("change", function () {
    api.storage.local.set({ enabled: enabledCheckbox.checked });
    updateCleanupUi();
  });

  if (replyAiCheckbox) {
    replyAiCheckbox.addEventListener("change", function () {
      saveReplyAiPreference();
    });
  }

  markingCheckbox.addEventListener("change", function () {
    api.storage.local.set({
      markingEnabled: markingCheckbox.checked,
      markingDefaultVersion: MARKING_DEFAULT_VERSION
    });
  });

  if (sidebarControlsCheckbox) {
    sidebarControlsCheckbox.addEventListener("change", function () {
      saveSidebarControlsPreference();
    });
  }

  readSetting();
})();
