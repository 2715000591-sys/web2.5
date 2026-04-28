(function () {
  const DEFAULT_PUBLIC_BACKEND_BASE_URL = "https://colorful-toilet.colorful-toilet.workers.dev";
  const OFFICIAL_AD_LABEL_PATTERNS = [
    /^广告$/i,
    /^廣告$/i,
    /^推广$/i,
    /^推廣$/i,
    /^promoted$/i,
    /^promoted\s+post$/i,
    /^ad$/i,
    /^ads$/i,
    /^sponsored$/i
  ];
  const api = typeof browser !== "undefined" ? browser : chrome;
  const PRELOAD_ROOT_MARGIN = "240% 0px 180% 0px";
  const DECISION_TIMEOUT_MS = 4200;
  const FEED_PENDING_ATTR = "data-web25-feed-pending";
  const FEED_HIDDEN_ATTR = "data-web25-feed-hidden";
  const STYLE_ELEMENT_ID = "web25-home-feed-guard-style";
  const SNAPSHOT_TEXT_LIMIT = 20000;
  const SNAPSHOT_LINK_LIMIT = 6000;
  const storageDefaults = {
    enabled: true,
    backendBaseUrl: DEFAULT_PUBLIC_BACKEND_BASE_URL,
    syncKey: "",
    deviceId: ""
  };
  const state = {
    enabled: true,
    backendBaseUrl: DEFAULT_PUBLIC_BACKEND_BASE_URL,
    syncKey: "",
    deviceId: "",
    currentUrl: location.href,
    routeTimer: null,
    scanTimer: null,
    observer: null,
    intersectionObserver: null,
    observedArticles: new WeakSet(),
    seenKeys: new Set(),
    storageChangeListener: null,
    managedArticles: new Set(),
    entryStates: new Map(),
    observerGeneration: 0
  };

  function normalizeText(value, maxLength) {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    if (!maxLength || maxLength <= 0) {
      return normalized;
    }
    return normalized.slice(0, maxLength);
  }

  function normalizeComparableText(value) {
    return normalizeText(value, 4000)
      .toLowerCase()
      .replace(/[~～`!！?？,，。.、:：;；'"“”‘’()[\]{}<>《》…—\-_=+*\/\\|]/g, "")
      .replace(/\s+/g, "");
  }

  function generateId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return prefix + window.crypto.randomUUID().replace(/-/g, "");
    }
    return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function isHomeTimelinePage() {
    return /^\/home\/?$/.test(location.pathname);
  }

  function isManagedTweet(article) {
    return Boolean(article && article.closest && article.closest("article[data-testid='tweet'] article[data-testid='tweet']"));
  }

  function isPromotedArticle(article) {
    if (!article) {
      return false;
    }
    const text = normalizeText(article.innerText, 400);
    return OFFICIAL_AD_LABEL_PATTERNS.some(function (pattern) {
      return pattern.test(text);
    });
  }

  function getTopLevelArticles() {
    return Array.from(document.querySelectorAll('article[data-testid="tweet"]')).filter(function (article) {
      return article && !isManagedTweet(article) && !isPromotedArticle(article);
    });
  }

  function installInlineStyles() {
    if (document.getElementById(STYLE_ELEMENT_ID)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ELEMENT_ID;
    style.textContent = [
      'article[' + FEED_PENDING_ATTR + '="1"] {',
      "  position: relative !important;",
      "  opacity: 0.18 !important;",
      "  pointer-events: none !important;",
      "  transition: opacity 120ms ease !important;",
      "}",
      'article[' + FEED_PENDING_ATTR + '="1"]::after {',
      '  content: "AI 正在预判";',
      "  position: absolute;",
      "  left: 16px;",
      "  right: 16px;",
      "  top: 14px;",
      "  display: inline-flex;",
      "  align-items: center;",
      "  min-height: 30px;",
      "  padding: 0 12px;",
      "  border-radius: 999px;",
      "  background: rgba(15, 20, 25, 0.92);",
      "  color: #ffffff;",
      "  font: 600 12px/1.2 system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;",
      "  letter-spacing: 0.04em;",
      "  text-transform: uppercase;",
      "}",
      'article[' + FEED_HIDDEN_ATTR + '="1"] {',
      "  display: none !important;",
      "}"
    ].join("\n");
    (document.head || document.documentElement || document.body).appendChild(style);
  }

  function rememberManagedArticle(article) {
    if (!article) {
      return;
    }
    state.managedArticles.add(article);
  }

  function releaseArticle(article) {
    if (!article) {
      return;
    }
    article.removeAttribute(FEED_PENDING_ATTR);
    article.removeAttribute(FEED_HIDDEN_ATTR);
    article.style.removeProperty("display");
    article.style.removeProperty("pointer-events");
  }

  function setArticlePending(article, pending) {
    if (!article) {
      return;
    }
    rememberManagedArticle(article);
    if (!pending) {
      article.removeAttribute(FEED_PENDING_ATTR);
      return;
    }
    if (article.getAttribute(FEED_HIDDEN_ATTR) === "1") {
      return;
    }
    article.setAttribute(FEED_PENDING_ATTR, "1");
  }

  function hideArticle(article) {
    if (!article) {
      return;
    }
    rememberManagedArticle(article);
    article.removeAttribute(FEED_PENDING_ATTR);
    article.setAttribute(FEED_HIDDEN_ATTR, "1");
    article.style.display = "none";
  }

  function isInViewport(article) {
    if (!article || typeof article.getBoundingClientRect !== "function") {
      return false;
    }
    const rect = article.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  function shouldQuarantineArticle(article) {
    if (!article || typeof article.getBoundingClientRect !== "function") {
      return false;
    }
    const rect = article.getBoundingClientRect();
    return rect.top >= window.innerHeight || rect.bottom <= 0;
  }

  function normalizeDecision(decision, postId) {
    const source = decision || {};
    const status = String(source.status || "").trim().toLowerCase() || "pending";
    return {
      postId: Number(postId || source.postId || 0),
      blocked: Boolean(source.blocked),
      matchedBlockedTerms: Array.isArray(source.matchedBlockedTerms) ? source.matchedBlockedTerms : [],
      confidence: String(source.confidence || "low"),
      reasonShort: String(source.reasonShort || ""),
      limitedByVideo: Boolean(source.limitedByVideo),
      status: status,
      model: String(source.model || ""),
      isFinal: status === "ready" || status === "failed" || status === "skipped"
    };
  }

  function clearEntryTimeout(entryState) {
    if (!entryState || !entryState.timeoutId) {
      return;
    }
    clearTimeout(entryState.timeoutId);
    entryState.timeoutId = null;
  }

  function applyDecisionResult(entryState) {
    if (!entryState || !entryState.article) {
      return;
    }
    if (entryState.decision && entryState.decision.blocked && entryState.decision.isFinal) {
      hideArticle(entryState.article);
      return;
    }
    releaseArticle(entryState.article);
  }

  function scheduleDecisionTimeout(seenKey, generation) {
    const entryState = state.entryStates.get(seenKey);
    if (!entryState) {
      return;
    }
    clearEntryTimeout(entryState);
    entryState.timeoutId = setTimeout(function () {
      const current = state.entryStates.get(seenKey);
      if (!current || current.generation !== generation) {
        return;
      }
      current.status = "timed_out";
      current.decision = normalizeDecision({ status: "pending" }, current.postId);
      releaseArticle(current.article);
    }, DECISION_TIMEOUT_MS);
  }

  function clearManagedTimeline() {
    state.entryStates.forEach(function (entryState) {
      clearEntryTimeout(entryState);
      applyDecisionResult(Object.assign({}, entryState, {
        decision: normalizeDecision({ status: "skipped" }, entryState.postId)
      }));
    });
    state.entryStates = new Map();
    state.managedArticles.forEach(function (article) {
      releaseArticle(article);
    });
    state.managedArticles = new Set();
    Array.from(document.querySelectorAll('article[' + FEED_PENDING_ATTR + '="1"], article[' + FEED_HIDDEN_ATTR + '="1"]')).forEach(function (article) {
      releaseArticle(article);
    });
  }

  function collectInlineTextParts(node, parts) {
    if (!node) {
      return;
    }

    if (node.nodeType === 3) {
      const text = normalizeText(node.textContent, 240);
      if (text) {
        parts.push(text);
      }
      return;
    }

    if (node.nodeType !== 1) {
      return;
    }

    if (node.tagName === "IMG") {
      const alt = normalizeText(node.getAttribute("alt"), 80);
      if (alt && alt !== "Image") {
        parts.push(alt);
      }
      return;
    }

    Array.from(node.childNodes).forEach(function (child) {
      collectInlineTextParts(child, parts);
    });
  }

  function isUserNameMetaText(text) {
    const value = normalizeText(text, 80);
    if (!value || value === "·" || value === "•") {
      return true;
    }
    if (/^\d+[smhdwy]$/i.test(value)) {
      return true;
    }
    return /^\d+\s*(秒|分钟|分|小时|天|周|月|年)$/.test(value);
  }

  function joinDisplayNameParts(parts) {
    return (Array.isArray(parts) ? parts : []).reduce(function (result, part) {
      const value = normalizeText(part, 80);
      if (!value) {
        return result;
      }
      if (!result) {
        return value;
      }
      if (/[A-Za-z0-9]$/.test(result) && /^[A-Za-z0-9]/.test(value)) {
        return result + " " + value;
      }
      return result + value;
    }, "");
  }

  function getAuthorMeta(article) {
    const userNameNode = article ? article.querySelector('[data-testid="User-Name"]') : null;
    const parts = [];
    collectInlineTextParts(userNameNode, parts);

    const normalizedParts = parts.filter(Boolean);
    const handleIndex = normalizedParts.findIndex(function (text) {
      return text.startsWith("@");
    });
    const handle = handleIndex === -1 ? "" : normalizedParts[handleIndex].toLowerCase();
    const displayParts = (handleIndex === -1 ? normalizedParts : normalizedParts.slice(0, handleIndex))
      .filter(function (text) {
        return !isUserNameMetaText(text);
      });

    return {
      displayName: joinDisplayNameParts(displayParts) || "X 用户",
      handle: handle
    };
  }

  function extractStatusId(value) {
    const match = String(value || "").match(/\/status\/(\d+)/);
    return match ? match[1] : "";
  }

  function getStatusId(article) {
    const timeLink = article && article.querySelector('a[href*="/status/"] time');
    if (timeLink) {
      const link = timeLink.closest("a");
      const statusId = extractStatusId(link && link.getAttribute("href"));
      if (statusId) {
        return statusId;
      }
    }

    const fallbackLink = Array.from(article.querySelectorAll ? article.querySelectorAll('a[href*="/status/"]') : [])
      .map(function (node) {
        return node.getAttribute("href") || "";
      })
      .find(function (href) {
        return /\/status\/\d+/.test(href);
      });

    return extractStatusId(fallbackLink);
  }

  function getTweetTextParts(article) {
    const blocks = Array.from(article.querySelectorAll('div[data-testid="tweetText"], div[lang]'));
    const pieces = blocks
      .map(function (node) {
        return normalizeText(node.innerText, SNAPSHOT_TEXT_LIMIT);
      })
      .filter(Boolean);
    const uniquePieces = Array.from(new Set(pieces));
    return {
      postText: uniquePieces[0] || "",
      quoteText: uniquePieces.slice(1).join(" ").trim()
    };
  }

  function getLinkTitle(article, fallbackTexts) {
    const card = article ? article.querySelector('[data-testid="card.wrapper"]') : null;
    if (!card) {
      return "";
    }
    const parts = [];
    collectInlineTextParts(card, parts);
    const joined = Array.from(new Set(parts))
      .filter(function (text) {
        return !fallbackTexts.has(text);
      })
      .join(" ");
    return normalizeText(joined, SNAPSHOT_LINK_LIMIT);
  }

  function getTimelineKind() {
    const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
    const label = normalizeText(activeTab && activeTab.innerText ? activeTab.innerText : "", 80).toLowerCase();
    if (label.includes("following") || label.includes("正在关注")) {
      return "following";
    }
    if (label.includes("for you") || label.includes("为你")) {
      return "for_you";
    }
    return "unknown";
  }

  function getMediaMode(article, textSummary) {
    const hasVideo = Boolean(article && article.querySelector('[data-testid="videoPlayer"], video'));
    const hasImage = Boolean(article && article.querySelector('[data-testid="tweetPhoto"], [aria-label*="Image"]'));
    const hasText = Boolean(normalizeText(textSummary, 40));
    if (hasVideo && (hasImage || hasText)) {
      return "mixed";
    }
    if (hasVideo) {
      return "video";
    }
    if (hasImage && hasText) {
      return "mixed";
    }
    if (hasImage) {
      return "image";
    }
    return "text";
  }

  function buildSnapshot(article) {
    if (!article) {
      return null;
    }

    const authorMeta = getAuthorMeta(article);
    const textParts = getTweetTextParts(article);
    const fallbackTexts = new Set([textParts.postText, textParts.quoteText].filter(Boolean));
    const linkTitle = getLinkTitle(article, fallbackTexts);
    const textSummary = [textParts.postText, textParts.quoteText, linkTitle].filter(Boolean).join(" ");
    const statusId = getStatusId(article);

    return {
      timelineKind: getTimelineKind(),
      pageUrl: location.href,
      statusId: statusId,
      authorHandle: authorMeta.handle,
      authorDisplayName: authorMeta.displayName,
      postText: textParts.postText,
      quoteText: textParts.quoteText,
      linkTitle: linkTitle,
      mediaMode: getMediaMode(article, textSummary),
      textSparse: normalizeText(textSummary, 200).length < 32,
      seenAt: new Date().toISOString()
    };
  }

  function buildLocalSeenKey(snapshot) {
    if (!snapshot) {
      return "";
    }
    if (snapshot.statusId) {
      return "status:" + snapshot.statusId;
    }
    const fallback = normalizeComparableText(snapshot.postText || "");
    if (!fallback && !snapshot.authorHandle) {
      return "";
    }
    return ["fallback", snapshot.authorHandle || "", fallback.slice(0, 240)].join("|");
  }

  function requestDecision(snapshot, callback) {
    if (!snapshot || !state.enabled || !state.backendBaseUrl || !state.syncKey || !state.deviceId) {
      if (typeof callback === "function") {
        callback({
          ok: false,
          detail: "disabled"
        });
      }
      return;
    }

    const endpoint = state.backendBaseUrl.replace(/\/+$/, "") + "/api/ai-feed/posts";
    const payload = Object.assign({
      syncKey: state.syncKey,
      deviceId: state.deviceId
    }, snapshot);

    if (api.runtime && typeof api.runtime.sendMessage === "function") {
      api.runtime.sendMessage({
        type: "web25-home-feed-post",
        endpoint: endpoint,
        payload: payload
      }, function (response) {
        if (api.runtime && api.runtime.lastError) {
          if (typeof callback === "function") {
            callback({
              ok: false,
              error: api.runtime.lastError.message
            });
          }
          return;
        }
        if (typeof callback === "function") {
          callback(response || {
            ok: false,
            detail: "empty-response"
          });
        }
      });
      return;
    }

    fetch(endpoint, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).then(function () {
      if (typeof callback === "function") {
        callback({
          ok: true,
          detail: "accepted"
        });
      }
    }).catch(function (error) {
      if (typeof callback === "function") {
        callback({
          ok: false,
          error: error && error.message ? error.message : String(error)
        });
      }
    });
  }

  function handleVisibleArticle(article) {
    const snapshot = buildSnapshot(article);
    const seenKey = buildLocalSeenKey(snapshot);
    if (!snapshot || !seenKey) {
      return;
    }

    const existing = state.entryStates.get(seenKey);
    if (existing) {
      existing.article = article;
      rememberManagedArticle(article);
      if (existing.decision && existing.decision.isFinal) {
        applyDecisionResult(existing);
        return;
      }
      if (shouldQuarantineArticle(article)) {
        setArticlePending(article, true);
      } else if (!existing.decision || !existing.decision.isFinal) {
        article.removeAttribute(FEED_PENDING_ATTR);
      }
      return;
    }

    const generation = state.observerGeneration;
    const entryState = {
      article: article,
      generation: generation,
      decision: null,
      status: "pending",
      timeoutId: null,
      postId: 0
    };
    state.entryStates.set(seenKey, entryState);
    rememberManagedArticle(article);

    if (shouldQuarantineArticle(article)) {
      setArticlePending(article, true);
    }
    scheduleDecisionTimeout(seenKey, generation);

    requestDecision(snapshot, function (result) {
      const current = state.entryStates.get(seenKey);
      if (!current || current.generation !== generation) {
        return;
      }

      if (!result || !result.ok) {
        current.status = "fallback-allow";
        current.decision = normalizeDecision({ status: "failed" }, current.postId);
        clearEntryTimeout(current);
        releaseArticle(current.article);
        return;
      }

      current.postId = Number(result.postId || 0);
      current.decision = normalizeDecision(result.decision, current.postId);
      current.status = current.decision.isFinal
        ? (current.decision.blocked ? "blocked" : "allowed")
        : "pending";

      if (current.decision.isFinal) {
        clearEntryTimeout(current);
        applyDecisionResult(current);
        return;
      }

      if (!isInViewport(current.article)) {
        setArticlePending(current.article, true);
      }
    });
  }

  function observeArticle(article) {
    if (!article || state.observedArticles.has(article)) {
      return;
    }
    state.observedArticles.add(article);
    if (state.intersectionObserver) {
      state.intersectionObserver.observe(article);
    }
  }

  function scanHomeTimeline() {
    if (!state.enabled || !isHomeTimelinePage()) {
      return;
    }
    getTopLevelArticles().forEach(observeArticle);
  }

  function scheduleScan(delay) {
    if (state.scanTimer) {
      clearTimeout(state.scanTimer);
    }
    state.scanTimer = setTimeout(function () {
      scanHomeTimeline();
    }, typeof delay === "number" ? delay : 120);
  }

  function resetForRoute() {
    state.observerGeneration += 1;
    clearManagedTimeline();
    state.seenKeys = new Set();
    state.observedArticles = new WeakSet();
    if (state.intersectionObserver) {
      state.intersectionObserver.disconnect();
    }
    state.intersectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          handleVisibleArticle(entry.target);
        }
      });
    }, {
      threshold: 0.01,
      rootMargin: PRELOAD_ROOT_MARGIN
    });
    scheduleScan(60);
  }

  function handleRouteChanges() {
    if (state.routeTimer) {
      clearInterval(state.routeTimer);
    }
    state.routeTimer = setInterval(function () {
      if (location.href === state.currentUrl) {
        return;
      }
      state.currentUrl = location.href;
      resetForRoute();
    }, 700);
  }

  function installDomObserver() {
    if (state.observer) {
      state.observer.disconnect();
    }
    state.observer = new MutationObserver(function () {
      scheduleScan(90);
    });
    state.observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
  }

  function applyResolvedStorage(result) {
    state.enabled = result.enabled !== false;
    state.backendBaseUrl = String(result.backendBaseUrl || DEFAULT_PUBLIC_BACKEND_BASE_URL).trim().replace(/\/+$/, "") || DEFAULT_PUBLIC_BACKEND_BASE_URL;
    state.syncKey = String(result.syncKey || "").trim();
    state.deviceId = String(result.deviceId || "").trim();
  }

  function ensureIdentity(callback) {
    api.storage.local.get(storageDefaults, function (result) {
      const patch = {};
      if (!String(result.syncKey || "").trim()) {
        patch.syncKey = generateId("feed_sync_");
      }
      if (!String(result.deviceId || "").trim()) {
        patch.deviceId = generateId("feed_device_");
      }
      if (Object.keys(patch).length === 0) {
        applyResolvedStorage(result);
        callback();
        return;
      }
      api.storage.local.set(patch, function () {
        applyResolvedStorage(Object.assign({}, result, patch));
        callback();
      });
    });
  }

  function installStorageListener() {
    if (!api.storage || !api.storage.onChanged || state.storageChangeListener) {
      return;
    }
    state.storageChangeListener = function (changes, areaName) {
      if (areaName !== "local") {
        return;
      }
      if (changes.enabled) {
        state.enabled = changes.enabled.newValue !== false;
        if (!state.enabled) {
          clearManagedTimeline();
        }
      }
      if (changes.backendBaseUrl) {
        state.backendBaseUrl = String(changes.backendBaseUrl.newValue || DEFAULT_PUBLIC_BACKEND_BASE_URL).trim().replace(/\/+$/, "") || DEFAULT_PUBLIC_BACKEND_BASE_URL;
      }
      if (changes.syncKey) {
        state.syncKey = String(changes.syncKey.newValue || "").trim();
      }
      if (changes.deviceId) {
        state.deviceId = String(changes.deviceId.newValue || "").trim();
      }
      if (changes.enabled && state.enabled) {
        resetForRoute();
      }
    };
    api.storage.onChanged.addListener(state.storageChangeListener);
  }

  function boot() {
    installInlineStyles();
    resetForRoute();
    installDomObserver();
    installStorageListener();
    handleRouteChanges();
  }

  if (!api.storage || !api.storage.local) {
    return;
  }

  ensureIdentity(boot);
}());
