(function () {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const DEFAULT_PUBLIC_BACKEND_BASE_URL = "https://colorful-toilet.colorful-toilet.workers.dev";
  const enabledCheckbox = document.getElementById("enabled");
  const captureHint = document.getElementById("captureHint");
  const serviceStatusValue = document.getElementById("serviceStatusValue");
  const accountStatusValue = document.getElementById("accountStatusValue");
  const identityValue = document.getElementById("identityValue");
  const openConsoleLink = document.getElementById("openConsole");
  const syncStatus = document.getElementById("syncStatus");

  function normalizeBackendBaseUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function generateId(prefix) {
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

  function renderToggle(enabled) {
    if (!enabledCheckbox) {
      return;
    }
    enabledCheckbox.checked = enabled !== false;
    if (captureHint) {
      captureHint.textContent = enabled !== false
        ? "只在 x.com/home 和 twitter.com/home 生效。页面本身不会被修改。"
        : "关闭后，这个独立插件会停止记录首页帖子。";
    }
  }

  function renderConsoleLink(result) {
    if (!openConsoleLink) {
      return;
    }
    const backendBaseUrl = normalizeBackendBaseUrl(result.backendBaseUrl || DEFAULT_PUBLIC_BACKEND_BASE_URL) || DEFAULT_PUBLIC_BACKEND_BASE_URL;
    const consoleUrl = new URL(`${backendBaseUrl}/console/`);
    const syncKey = String(result.syncKey || "").trim();
    const deviceId = String(result.deviceId || "").trim();
    if (syncKey) {
      consoleUrl.searchParams.set("syncKey", syncKey);
    }
    if (deviceId) {
      consoleUrl.searchParams.set("deviceId", deviceId);
    }
    openConsoleLink.href = consoleUrl.toString();
  }

  async function renderAccountStatus(backendBaseUrl) {
    if (!accountStatusValue) {
      return;
    }
    const result = await requestJson(`${backendBaseUrl}/api/me`);
    if (!result.ok || !result.data || !result.data.loggedIn || !result.data.viewer) {
      accountStatusValue.textContent = "未登录控制台";
      if (syncStatus) {
        syncStatus.textContent = "登录后，用上面的链接打开控制台，就能把这个新插件的采集身份绑到你的账号。";
      }
      return;
    }

    const viewer = result.data.viewer;
    accountStatusValue.textContent = viewer.isDeveloper ? `${viewer.email} · 开发者` : viewer.email;
    if (syncStatus) {
      syncStatus.textContent = "控制台账号已登录。用上面的链接打开控制台时，会自动把这套采集身份并到当前账号。";
    }
  }

  function ensureIdentity(callback) {
    api.storage.local.get({
      enabled: true,
      backendBaseUrl: DEFAULT_PUBLIC_BACKEND_BASE_URL,
      syncKey: "",
      deviceId: ""
    }, function (result) {
      const patch = {};
      if (!String(result.syncKey || "").trim()) {
        patch.syncKey = generateId("feed_sync_");
      }
      if (!String(result.deviceId || "").trim()) {
        patch.deviceId = generateId("feed_device_");
      }
      if (Object.keys(patch).length === 0) {
        callback(result);
        return;
      }
      api.storage.local.set(patch, function () {
        callback(Object.assign({}, result, patch));
      });
    });
  }

  function readSetting() {
    ensureIdentity(async function (result) {
      const backendBaseUrl = normalizeBackendBaseUrl(result.backendBaseUrl || DEFAULT_PUBLIC_BACKEND_BASE_URL) || DEFAULT_PUBLIC_BACKEND_BASE_URL;
      renderToggle(result.enabled !== false);
      if (serviceStatusValue) {
        serviceStatusValue.textContent = backendBaseUrl === DEFAULT_PUBLIC_BACKEND_BASE_URL ? "官方云端" : "自定义服务";
      }
      if (identityValue) {
        identityValue.textContent = String(result.syncKey || "").trim()
          ? `${String(result.syncKey || "").trim().slice(0, 18)}...`
          : "未生成";
      }
      renderConsoleLink(Object.assign({}, result, {
        backendBaseUrl
      }));
      await renderAccountStatus(backendBaseUrl);
    });
  }

  if (enabledCheckbox) {
    enabledCheckbox.addEventListener("change", function () {
      const enabled = Boolean(enabledCheckbox.checked);
      api.storage.local.set({
        enabled: enabled
      }, function () {
        renderToggle(enabled);
      });
    });
  }

  readSetting();
}());
