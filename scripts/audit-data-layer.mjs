#!/usr/bin/env node

const DEFAULT_BASE_URL = "https://colorful-toilet.colorful-toilet.workers.dev";
const DEFAULT_DEVELOPER_EMAIL = "2715000591@qq.com";

function readArg(name, fallback = "") {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  if (match) {
    return match.slice(prefix.length);
  }
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return fallback;
}

function mergeSetCookie(cookieHeader, cookieJar) {
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

function cookieHeader(cookieJar) {
  return Array.from(cookieJar.entries()).map(([key, value]) => `${key}=${value}`).join("; ");
}

async function requestJson(baseUrl, path, options, cookieJar) {
  const headers = Object.assign({
    "Content-Type": "application/json"
  }, options && options.headers ? options.headers : {});
  const cookies = cookieHeader(cookieJar);
  if (cookies) {
    headers.Cookie = cookies;
  }

  const response = await fetch(new URL(path, baseUrl), Object.assign({}, options || {}, {
    headers
  }));
  const setCookie = response.headers.get("set-cookie");
  const nextCookieJar = mergeSetCookie(setCookie, cookieJar);
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

function printAudit(audit) {
  const source = audit || {};
  console.log(`Checked at: ${source.checkedAt || ""}`);
  console.log("");
  console.log("Users:", JSON.stringify(source.userSummary || {}, null, 2));
  console.log("Sync keys:", JSON.stringify(source.syncSummary || {}, null, 2));
  console.log("Events:", JSON.stringify(source.eventSummary || {}, null, 2));
  console.log("Global rule config:", JSON.stringify(source.globalRuleConfig || {}, null, 2));
  console.log("Auto global audit:", JSON.stringify(source.autoGlobalAudit || {}, null, 2));
  console.log("");
  console.log("Checks:");
  (Array.isArray(source.checks) ? source.checks : []).forEach((check) => {
    const mark = check.status === "pass" ? "PASS" : (check.status === "warn" ? "WARN" : "FAIL");
    console.log(`- [${mark}] ${check.title}: ${check.detail}`);
  });
}

async function main() {
  const baseUrl = readArg("base", process.env.WEB25_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/g, "");
  const email = readArg("email", process.env.WEB25_DEVELOPER_EMAIL || DEFAULT_DEVELOPER_EMAIL);
  const providedCode = readArg("code", process.env.WEB25_LOGIN_CODE || "");
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
    throw new Error("Logged in user is not a developer; audit endpoint requires developer access.");
  }

  const auditResult = await requestJson(baseUrl, "/api/developer/data-layer-audit", {
    method: "GET"
  }, cookieJar);
  if (!auditResult.ok || !auditResult.data || !auditResult.data.ok) {
    throw new Error(`audit failed: ${auditResult.status} ${JSON.stringify(auditResult.data)}`);
  }

  printAudit(auditResult.data.audit);
  const failedChecks = (auditResult.data.audit.checks || []).filter((check) => check.status === "fail");
  if (failedChecks.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
});
