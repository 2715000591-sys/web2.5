(function () {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const AD_RETRY_DELAY_MS = 2500;
  const EVENT_RETRY_DELAY_MS = 2500;
  let adRetryTimer = null;
  let adFlushInFlight = false;
  let adQueue = [];
  let eventRetryTimer = null;
  let eventFlushInFlight = false;
  let eventQueue = [];

  if (!api.runtime || !api.runtime.onMessage) {
    return;
  }

  function clearAdRetryTimer() {
    if (!adRetryTimer) {
      return;
    }
    clearTimeout(adRetryTimer);
    adRetryTimer = null;
  }

  function scheduleAdRetry() {
    clearAdRetryTimer();
    adRetryTimer = setTimeout(function () {
      flushAdQueue();
    }, AD_RETRY_DELAY_MS);
  }

  function clearEventRetryTimer() {
    if (!eventRetryTimer) {
      return;
    }
    clearTimeout(eventRetryTimer);
    eventRetryTimer = null;
  }

  function scheduleEventRetry() {
    clearEventRetryTimer();
    eventRetryTimer = setTimeout(function () {
      flushEventQueue();
    }, EVENT_RETRY_DELAY_MS);
  }

  async function fetchJson(endpoint, options) {
    try {
      const response = await fetch(endpoint, options);
      let data = {};

      try {
        data = await response.json();
      } catch (error) {
        data = {};
      }

      return {
        ok: response.ok && Boolean(data && data.ok),
        status: response.status,
        data
      };
    } catch (error) {
      return {
        ok: false,
        error: error && error.message ? error.message : String(error)
      };
    }
  }

  async function postAdEvent(entry) {
    return fetchJson(entry.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(entry.payload || {})
    });
  }

  async function postSyncEvent(entry) {
    return fetchJson(entry.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(entry.payload || {})
    });
  }

  async function flushAdQueue() {
    if (adFlushInFlight) {
      return;
    }

    adFlushInFlight = true;
    clearAdRetryTimer();

    try {
      const remaining = [];
      for (const entry of adQueue) {
        const result = await postAdEvent(entry);
        if (!result.ok) {
          remaining.push({
            endpoint: entry.endpoint,
            dedupeKey: entry.dedupeKey,
            payload: entry.payload,
            attempts: Number(entry.attempts || 0) + 1
          });
        }
      }
      adQueue = remaining;
    } finally {
      adFlushInFlight = false;
      if (adQueue.length) {
        scheduleAdRetry();
      }
    }
  }

  async function flushEventQueue() {
    if (eventFlushInFlight) {
      return;
    }

    eventFlushInFlight = true;
    clearEventRetryTimer();

    try {
      const remaining = [];
      for (const entry of eventQueue) {
        const result = await postSyncEvent(entry);
        if (!result.ok) {
          remaining.push({
            endpoint: entry.endpoint,
            dedupeKey: entry.dedupeKey,
            payload: entry.payload,
            attempts: Number(entry.attempts || 0) + 1
          });
        }
      }
      eventQueue = remaining;
    } finally {
      eventFlushInFlight = false;
      if (eventQueue.length) {
        scheduleEventRetry();
      }
    }
  }

  function buildSyncDedupeKey(endpoint, payload) {
    const source = payload || {};
    return [
      String(endpoint || "").trim(),
      String(source.syncKey || "").trim(),
      String(source.eventType || "").trim(),
      String(source.replyStatusId || "").trim(),
      String(source.threadStatusId || "").trim(),
      String(source.replyHandle || "").trim().toLowerCase(),
      String(source.normalizedText || "").trim(),
      String(source.compactText || "").trim()
    ].join("|");
  }

  async function handleAdSyncMessage(message) {
    const endpoint = String(message.endpoint || "").trim();
    const dedupeKey = String(message.dedupeKey || "").trim();
    if (!endpoint || !dedupeKey) {
      return {
        ok: false,
        error: "missing-ad-sync-fields"
      };
    }

    const payload = message.payload || {};
    const immediateResult = await postAdEvent({
      endpoint,
      dedupeKey,
      payload
    });

    if (immediateResult.ok) {
      return {
        ok: true,
        synced: true,
        detail: immediateResult.data && immediateResult.data.deduped ? "deduped" : "synced"
      };
    }

    if (!adQueue.some(function (entry) { return entry.dedupeKey === dedupeKey; })) {
      adQueue.push({
        endpoint,
        dedupeKey,
        payload,
        attempts: 1
      });
    }
    scheduleAdRetry();

    return {
      ok: true,
      queued: true,
      detail: "queued"
    };
  }

  async function handleSyncEventMessage(message) {
    const endpoint = String(message.endpoint || "").trim();
    if (!endpoint) {
      return {
        ok: false,
        error: "missing-endpoint"
      };
    }

    const payload = message.payload || {};
    const dedupeKey = buildSyncDedupeKey(endpoint, payload);
    const immediateResult = await postSyncEvent({
      endpoint,
      dedupeKey,
      payload
    });

    if (immediateResult.ok) {
      return {
        ok: true,
        synced: true,
        detail: immediateResult.data && immediateResult.data.deduped ? "deduped" : "synced"
      };
    }

    if (!eventQueue.some(function (entry) { return entry.dedupeKey === dedupeKey; })) {
      eventQueue.push({
        endpoint,
        dedupeKey,
        payload,
        attempts: 1
      });
    }
    scheduleEventRetry();

    return {
      ok: true,
      queued: true,
      detail: "queued"
    };
  }

  api.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (!message) {
      return false;
    }

    if (message.type === "web25-sync-ad-event") {
      handleAdSyncMessage(message).then(function (result) {
        sendResponse(result);
      }).catch(function (error) {
        sendResponse({
          ok: false,
          error: error && error.message ? error.message : String(error)
        });
      });
      return true;
    }

    if (message.type === "web25-sync-event") {
      handleSyncEventMessage(message).then(function (result) {
        sendResponse(result);
      }).catch(function (error) {
        sendResponse({
          ok: false,
          error: error && error.message ? error.message : String(error)
        });
      });
      return true;
    }

    if (message.type === "web25-http-request") {
      const endpoint = String(message.endpoint || "").trim();
      const payload = message.payload || {};
      const method = String(message.method || "GET").trim().toUpperCase();
      const credentials = message.credentials === "include" ? "include" : "omit";
      const responseType = String(message.responseType || "json").trim().toLowerCase();
      const extraHeaders = message.headers && typeof message.headers === "object" ? message.headers : {};

      if (!endpoint) {
        sendResponse({ ok: false, error: "missing-endpoint" });
        return false;
      }

      const headers = new Headers(extraHeaders);
      if (!headers.has("Content-Type") && method !== "GET") {
        headers.set("Content-Type", "application/json");
      }

      fetch(endpoint, {
        method: method,
        credentials: credentials,
        cache: "no-store",
        headers,
        body: method === "GET" ? undefined : JSON.stringify(payload)
      }).then(async function (response) {
        let data = null;
        try {
          if (responseType === "text") {
            data = await response.text();
          } else {
            data = await response.json();
          }
        } catch (error) {
          data = responseType === "text" ? "" : {};
        }

        sendResponse({
          ok: response.ok,
          status: response.status,
          data: data
        });
      }).catch(function (error) {
        sendResponse({
          ok: false,
          error: error && error.message ? error.message : String(error)
        });
      });

      return true;
    }

    return false;
  });
})();
