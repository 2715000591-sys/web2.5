(function () {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const RETRY_DELAY_MS = 2500;
  const DECISION_POLL_INTERVAL_MS = 320;
  const DECISION_POLL_ATTEMPTS = 8;
  let retryTimer = null;
  let flushInFlight = false;
  let queue = [];

  if (!api.runtime || !api.runtime.onMessage) {
    return;
  }

  function clearRetryTimer() {
    if (!retryTimer) {
      return;
    }
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  function scheduleRetry() {
    clearRetryTimer();
    retryTimer = setTimeout(function () {
      flushQueue();
    }, RETRY_DELAY_MS);
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

  function buildDedupeKey(endpoint, payload) {
    const source = payload || {};
    return [
      String(endpoint || "").trim(),
      String(source.syncKey || "").trim(),
      String(source.statusId || "").trim(),
      String(source.authorHandle || "").trim().toLowerCase(),
      String(source.postText || "").trim().toLowerCase()
    ].join("|");
  }

  async function postSnapshot(entry) {
    return fetchJson(entry.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(entry.payload || {})
    });
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function buildDecisionEndpoint(endpoint, payload, postId) {
    if (!endpoint || !postId) {
      return "";
    }
    const decisionUrl = new URL(String(endpoint || "").replace(/\/+$/, "") + "/" + String(postId) + "/decision");
    const syncKey = String(payload && payload.syncKey ? payload.syncKey : "").trim();
    const deviceId = String(payload && payload.deviceId ? payload.deviceId : "").trim();
    if (syncKey) {
      decisionUrl.searchParams.set("syncKey", syncKey);
    }
    if (deviceId) {
      decisionUrl.searchParams.set("deviceId", deviceId);
    }
    return decisionUrl.toString();
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

  async function pollDecision(endpoint, payload, postId) {
    const decisionEndpoint = buildDecisionEndpoint(endpoint, payload, postId);
    if (!decisionEndpoint) {
      return normalizeDecision({ status: "pending" }, postId);
    }

    for (let attempt = 0; attempt < DECISION_POLL_ATTEMPTS; attempt += 1) {
      const result = await fetchJson(decisionEndpoint, {
        method: "GET"
      });
      if (result.ok && result.data && result.data.ok) {
        const decision = normalizeDecision(result.data.decision, postId);
        if (decision.isFinal) {
          return decision;
        }
      }
      if (attempt < DECISION_POLL_ATTEMPTS - 1) {
        await sleep(DECISION_POLL_INTERVAL_MS);
      }
    }

    return normalizeDecision({ status: "pending" }, postId);
  }

  async function flushQueue() {
    if (flushInFlight) {
      return;
    }

    flushInFlight = true;
    clearRetryTimer();

    try {
      const remaining = [];
      for (const entry of queue) {
        const result = await postSnapshot(entry);
        if (!result.ok) {
          remaining.push({
            endpoint: entry.endpoint,
            dedupeKey: entry.dedupeKey,
            payload: entry.payload
          });
        }
      }
      queue = remaining;
    } finally {
      flushInFlight = false;
      if (queue.length) {
        scheduleRetry();
      }
    }
  }

  async function handleSnapshotMessage(message) {
    const endpoint = String(message.endpoint || "").trim();
    if (!endpoint) {
      return {
        ok: false,
        error: "missing-endpoint"
      };
    }

    const payload = message.payload || {};
    const dedupeKey = buildDedupeKey(endpoint, payload);
    const immediateResult = await postSnapshot({
      endpoint,
      dedupeKey,
      payload
    });

    if (immediateResult.ok) {
      const postId = Number(immediateResult.data && immediateResult.data.postId ? immediateResult.data.postId : 0);
      const immediateDecision = normalizeDecision(immediateResult.data && immediateResult.data.decision, postId);
      if (postId && !immediateDecision.isFinal) {
        const polledDecision = await pollDecision(endpoint, payload, postId);
        return {
          ok: true,
          detail: polledDecision.isFinal
            ? (immediateResult.data && immediateResult.data.deduped ? "deduped" : "resolved")
            : "pending",
          postId: postId,
          decision: polledDecision
        };
      }

      return {
        ok: true,
        detail: immediateResult.data && immediateResult.data.deduped ? "deduped" : "accepted",
        postId: postId,
        decision: immediateDecision
      };
    }

    if (!queue.some(function (entry) { return entry.dedupeKey === dedupeKey; })) {
      queue.push({
        endpoint,
        dedupeKey,
        payload
      });
    }
    scheduleRetry();

    return {
      ok: true,
      detail: "queued"
    };
  }

  api.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (!message || message.type !== "web25-home-feed-post") {
      return false;
    }

    handleSnapshotMessage(message).then(function (result) {
      sendResponse(result);
    }).catch(function (error) {
      sendResponse({
        ok: false,
        error: error && error.message ? error.message : String(error)
      });
    });
    return true;
  });
}());
