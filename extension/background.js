(function () {
  const api = typeof browser !== "undefined" ? browser : chrome;

  if (!api.runtime || !api.runtime.onMessage) {
    return;
  }

  api.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (!message || (message.type !== "web25-sync-event" && message.type !== "web25-http-request")) {
      return false;
    }

    const endpoint = String(message.endpoint || "").trim();
    const payload = message.payload || {};
    const method = message.type === "web25-http-request"
      ? String(message.method || "GET").trim().toUpperCase()
      : "POST";

    if (!endpoint) {
      sendResponse({ ok: false, error: "missing-endpoint" });
      return false;
    }

    fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: method === "GET" ? undefined : JSON.stringify(payload)
    }).then(async function (response) {
      let data = {};
      try {
        data = await response.json();
      } catch (error) {
        data = {};
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
  });
})();
