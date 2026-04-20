(function () {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const enabledCheckbox = document.getElementById("enabled");
  const markingCheckbox = document.getElementById("markingEnabled");
  const backendBaseUrlInput = document.getElementById("backendBaseUrl");
  const syncKeyValue = document.getElementById("syncKeyValue");
  const copySyncKeyButton = document.getElementById("copySyncKey");
  const openConsoleLink = document.getElementById("openConsole");
  const syncStatus = document.getElementById("syncStatus");

  function normalizeBackendBaseUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function generateSyncId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return prefix + window.crypto.randomUUID().replace(/-/g, "");
    }

    return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function renderConsoleLink() {
    const backendBaseUrl = normalizeBackendBaseUrl(backendBaseUrlInput.value);
    const syncKey = String(syncKeyValue.textContent || "").trim();
    const href = backendBaseUrl
      ? `${backendBaseUrl}/?syncKey=${encodeURIComponent(syncKey)}`
      : "#";
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
      backendBaseUrl: "http://127.0.0.1:8787",
      syncKey: "",
      deviceId: ""
    }, function (result) {
      ensureIdentity(result, function (resolvedResult) {
        enabledCheckbox.checked = Boolean(resolvedResult.enabled);
        markingCheckbox.checked = Boolean(resolvedResult.markingEnabled);
        backendBaseUrlInput.value = normalizeBackendBaseUrl(resolvedResult.backendBaseUrl || "http://127.0.0.1:8787");
        syncKeyValue.textContent = String(resolvedResult.syncKey || "");
        syncStatus.textContent = backendBaseUrlInput.value
          ? "现在这把密钥会把扩展和网页控制台绑定在一起。"
          : "先填一个同步服务地址，网页控制台才能读到真实数据。";
        renderConsoleLink();
      });
    });
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
  });

  copySyncKeyButton.addEventListener("click", async function () {
    const syncKey = String(syncKeyValue.textContent || "").trim();
    if (!syncKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(syncKey);
      syncStatus.textContent = "同步密钥已复制。以后你在别的设备打开网页时，用这把密钥就能看到自己的数据。";
    } catch (error) {
      syncStatus.textContent = "复制失败了，不过密钥已经显示在上面，可以先手动复制。";
    }
  });

  readSetting();
})();
