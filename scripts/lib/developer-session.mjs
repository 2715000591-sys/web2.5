import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CACHE_PATH = process.env.WEB25_DEV_SESSION_CACHE
  ? path.resolve(process.env.WEB25_DEV_SESSION_CACHE)
  : path.join(ROOT_DIR, ".tmp", "web25-developer-session.json");
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function mergeSetCookie(cookieHeader, cookieJar) {
  if (!cookieHeader) {
    return cookieJar;
  }
  const parts = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];
  const next = new Map(cookieJar);
  parts.forEach((entry) => {
    String(entry || "").split(/,(?=[^;,]+=)/g).forEach((cookie) => {
      const first = cookie.split(";")[0] || "";
      const index = first.indexOf("=");
      if (index === -1) {
        return;
      }
      const key = first.slice(0, index).trim();
      const value = first.slice(index + 1).trim();
      if (key) {
        next.set(key, value);
      }
    });
  });
  return next;
}

export function cookieHeader(cookieJar) {
  return Array.from(cookieJar.entries()).map(([key, value]) => `${key}=${value}`).join("; ");
}

export async function requestJson(baseUrl, route, options, cookieJar) {
  const headers = Object.assign({
    "Content-Type": "application/json"
  }, options && options.headers ? options.headers : {});
  const cookies = cookieHeader(cookieJar || new Map());
  if (cookies) {
    headers.Cookie = cookies;
  }

  const response = await fetch(new URL(route, baseUrl), Object.assign({}, options || {}, {
    headers
  }));
  const setCookie = response.headers.get("set-cookie");
  const nextCookieJar = mergeSetCookie(setCookie, cookieJar || new Map());
  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }
  return {
    ok: response.ok,
    status: response.status,
    data,
    cookieJar: nextCookieJar
  };
}

function cacheIsFresh(cache) {
  const updatedAt = cache && cache.updatedAt ? new Date(cache.updatedAt).getTime() : 0;
  return Boolean(updatedAt && Date.now() - updatedAt < CACHE_MAX_AGE_MS);
}

export function loadDeveloperSession(baseUrl, email) {
  try {
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const cache = JSON.parse(raw);
    if (!cacheIsFresh(cache) || cache.baseUrl !== baseUrl || cache.email !== email || !cache.cookies) {
      return new Map();
    }
    return new Map(Object.entries(cache.cookies));
  } catch (error) {
    return new Map();
  }
}

export function saveDeveloperSession(baseUrl, email, cookieJar) {
  if (!cookieJar || !cookieJar.size) {
    return;
  }
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  const payload = {
    baseUrl,
    email,
    updatedAt: new Date().toISOString(),
    cookies: Object.fromEntries(cookieJar.entries())
  };
  fs.writeFileSync(CACHE_PATH, JSON.stringify(payload, null, 2), { mode: 0o600 });
}

export async function loginDeveloper(baseUrl, email, providedCode, description) {
  let cookieJar = new Map();
  let code = providedCode;
  if (!code) {
    const codeResult = await requestJson(baseUrl, "/api/auth/request-code", {
      method: "POST",
      body: JSON.stringify({ email })
    }, cookieJar);
    cookieJar = codeResult.cookieJar;
    if (!codeResult.ok || !codeResult.data || !codeResult.data.ok) {
      throw new Error(`request-code failed: ${codeResult.status} ${JSON.stringify(codeResult.data)}`);
    }
    code = String(codeResult.data.debugCode || "").trim();
    if (!code) {
      throw new Error("No debugCode returned. Set WEB25_LOGIN_CODE or pass --code after receiving the email code.");
    }
  }

  const verifyResult = await requestJson(baseUrl, "/api/auth/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, code })
  }, cookieJar);
  cookieJar = verifyResult.cookieJar;
  if (!verifyResult.ok || !verifyResult.data || !verifyResult.data.ok) {
    throw new Error(`verify-code failed: ${verifyResult.status} ${JSON.stringify(verifyResult.data)}`);
  }
  if (!verifyResult.data.viewer || !verifyResult.data.viewer.isDeveloper) {
    throw new Error(`Logged in user is not a developer; ${description || "developer endpoint"} requires developer access.`);
  }
  saveDeveloperSession(baseUrl, email, cookieJar);
  return cookieJar;
}

function needsFreshDeveloperLogin(result) {
  const error = result && result.data ? String(result.data.error || "") : "";
  return result && (result.status === 401 || result.status === 403 || error === "unauthorized" || error === "developer-required");
}

export async function requestDeveloperJson(baseUrl, route, options, settings) {
  const email = settings && settings.email ? settings.email : "";
  const providedCode = settings && settings.providedCode ? settings.providedCode : "";
  const description = settings && settings.description ? settings.description : "developer endpoint";
  let cookieJar = loadDeveloperSession(baseUrl, email);

  if (cookieJar.size) {
    const cachedResult = await requestJson(baseUrl, route, options, cookieJar);
    if (!needsFreshDeveloperLogin(cachedResult)) {
      saveDeveloperSession(baseUrl, email, cachedResult.cookieJar);
      return cachedResult;
    }
  }

  cookieJar = await loginDeveloper(baseUrl, email, providedCode, description);
  const result = await requestJson(baseUrl, route, options, cookieJar);
  saveDeveloperSession(baseUrl, email, result.cookieJar);
  return result;
}
