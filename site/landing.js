(function () {
  const DEFAULT_PUBLIC_BACKEND_BASE_URL = "https://colorful-toilet.colorful-toilet.workers.dev";
  const LEGACY_BACKEND_BASE_URLS = new Set([
    "https://web25-public-pages.pages.dev",
    "https://web25-public.web25-boris.workers.dev",
    "https://colorful-toilet.web25-boris.workers.dev"
  ]);
  const LOCAL_STORAGE_KEY = "web25_site_sidebar_controls_enabled";
  const toggleNodes = Array.from(document.querySelectorAll("[data-web25-sidebar-pref-toggle]"));
  const statusNodes = Array.from(document.querySelectorAll("[data-web25-sidebar-pref-status]"));
  const pillNodes = Array.from(document.querySelectorAll("[data-web25-sidebar-pref-pill]"));
  const downloadVersionNodes = Array.from(document.querySelectorAll("[data-web25-download-version]"));
  const downloadGeneratedAtNodes = Array.from(document.querySelectorAll("[data-web25-download-generated-at]"));
  const downloadLinkNodes = Array.from(document.querySelectorAll("[data-web25-download-link]"));

  if (!toggleNodes.length && !statusNodes.length && !pillNodes.length && !downloadVersionNodes.length && !downloadGeneratedAtNodes.length && !downloadLinkNodes.length) {
    return;
  }

  function normalizeBackendBaseUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function getBackendBaseUrl() {
    const configured = normalizeBackendBaseUrl(window.localStorage.getItem("web25_backend_base_url"));
    if (configured) {
      if (LEGACY_BACKEND_BASE_URLS.has(configured)) {
        window.localStorage.setItem("web25_backend_base_url", DEFAULT_PUBLIC_BACKEND_BASE_URL);
        return DEFAULT_PUBLIC_BACKEND_BASE_URL;
      }
      return configured;
    }

    if (window.location.origin && window.location.origin.startsWith("http")) {
      return normalizeBackendBaseUrl(window.location.origin);
    }

    return DEFAULT_PUBLIC_BACKEND_BASE_URL;
  }

  function normalizeSidebarControlsEnabled(value, fallback) {
    if (typeof value === "boolean") {
      return value;
    }

    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized) {
      return fallback !== false;
    }

    if (normalized === "0" || normalized === "false" || normalized === "off" || normalized === "no") {
      return false;
    }

    if (normalized === "1" || normalized === "true" || normalized === "on" || normalized === "yes") {
      return true;
    }

    return fallback !== false;
  }

  function readLocalPreference() {
    return normalizeSidebarControlsEnabled(
      window.localStorage.getItem(LOCAL_STORAGE_KEY),
      true
    );
  }

  function writeLocalPreference(enabled) {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, enabled ? "1" : "0");
  }

  function renderPreference(enabled) {
    toggleNodes.forEach((node) => {
      node.checked = enabled;
    });

    pillNodes.forEach((node) => {
      node.textContent = enabled ? "当前偏好：开启" : "当前偏好：关闭";
      node.classList.toggle("mellow", enabled);
      node.classList.toggle("muted", !enabled);
    });
  }

  function setStatus(message) {
    statusNodes.forEach((node) => {
      node.textContent = message;
    });
  }

  async function requestJson(path, options) {
    try {
      const response = await fetch(`${getBackendBaseUrl()}${path}`, Object.assign({
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

  function formatBuildTime(value) {
    const timestamp = Date.parse(String(value || ""));
    if (!timestamp) {
      return "";
    }

    try {
      return new Intl.DateTimeFormat("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(timestamp));
    } catch (error) {
      return "";
    }
  }

  async function syncDownloadCards() {
    if (!downloadVersionNodes.length && !downloadGeneratedAtNodes.length && !downloadLinkNodes.length) {
      return;
    }

    try {
      const response = await fetch("/downloads/latest.json", {
        cache: "no-store"
      });
      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      const version = String(payload && payload.extensionVersion ? payload.extensionVersion : "").trim();
      const generatedAt = String(payload && payload.generatedAt ? payload.generatedAt : "").trim();
      const generatedAtLabel = formatBuildTime(generatedAt);
      const downloads = payload && payload.downloads ? payload.downloads : {};

      if (version) {
        downloadVersionNodes.forEach(function (node) {
          node.textContent = `最新版 ${version}`;
        });
      }

      if (generatedAtLabel) {
        downloadGeneratedAtNodes.forEach(function (node) {
          node.textContent = `更新于 ${generatedAtLabel}`;
        });
      }

      downloadLinkNodes.forEach(function (node) {
        const key = String(node.dataset.web25DownloadLink || "").trim();
        if (!key || !downloads[key] || !downloads[key].href) {
          return;
        }
        node.href = String(downloads[key].href || "").trim();
      });
    } catch (error) {
      // Keep the fallback text and fallback links.
    }
  }

  async function syncPreferenceFromCloud() {
    const localEnabled = readLocalPreference();
    renderPreference(localEnabled);
    setStatus("正在检查当前账号的右栏精简偏好...");

    const me = await requestJson("/api/me");
    if (!me.ok || !me.data || !me.data.loggedIn || !me.data.viewer) {
      setStatus("当前未登录。这个勾选会先记在这个浏览器里；登录后会自动同步到 Safari 插件账号。");
      return;
    }

    const preferenceResult = await requestJson("/api/preferences");
    if (!preferenceResult.ok || !preferenceResult.data || !preferenceResult.data.preferences) {
      setStatus("账号已经登录，但这次没读到云端偏好。官网会先按当前浏览器里的设置显示。");
      return;
    }

    const enabled = preferenceResult.data.preferences.sidebarControlsEnabled !== false;
    writeLocalPreference(enabled);
    renderPreference(enabled);
    setStatus(
      enabled
        ? "当前账号已开启右栏模块关闭按钮。官网和 Safari 插件会尽量保持同一偏好。"
        : "当前账号已关闭右栏模块关闭按钮。官网和 Safari 插件会尽量保持同一偏好。"
    );
  }

  async function persistPreference(enabled) {
    writeLocalPreference(enabled);
    renderPreference(enabled);

    const me = await requestJson("/api/me");
    if (!me.ok || !me.data || !me.data.loggedIn || !me.data.viewer) {
      setStatus("当前已记在这个浏览器里。登录后，这个偏好会同步到 Safari 插件账号。");
      return;
    }

    const result = await requestJson("/api/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sidebarControlsEnabled: enabled
      })
    });

    if (!result.ok || !result.data || !result.data.ok) {
      setStatus("账号已经登录，但这次没同步上。官网会先按当前浏览器里的设置显示。");
      return;
    }

    setStatus(
      enabled
        ? "右栏模块关闭按钮已开启，并且已经同步到账号。"
        : "右栏模块关闭按钮已关闭，并且已经同步到账号。"
    );
  }

  toggleNodes.forEach((node) => {
    node.addEventListener("change", function () {
      persistPreference(Boolean(node.checked));
    });
  });

  syncDownloadCards();
  syncPreferenceFromCloud();
})();
