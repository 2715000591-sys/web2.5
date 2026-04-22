const DEFAULT_API_ORIGIN = "https://web25-public.web25-boris.workers.dev";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return proxyApiRequest(request, env, url);
    }

    if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
      return new Response("Missing Pages asset binding", { status: 500 });
    }

    return env.ASSETS.fetch(request);
  }
};

async function proxyApiRequest(request, env, url) {
  const origin = String(env.API_ORIGIN || DEFAULT_API_ORIGIN).trim();
  if (!origin) {
    return new Response(JSON.stringify({ ok: false, error: "missing-api-origin" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, max-age=0"
      }
    });
  }

  const target = new URL(url.pathname + url.search, origin);
  const headers = new Headers(request.headers);
  headers.set("Host", target.host);
  headers.set("X-Forwarded-Host", url.host);
  headers.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

  const init = {
    method: request.method,
    headers,
    redirect: "manual"
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const response = await fetch(target, init);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("Cache-Control", "no-store, max-age=0");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders
  });
}
