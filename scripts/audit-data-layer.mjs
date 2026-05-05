#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { requestDeveloperJson } from "./lib/developer-session.mjs";

const DEFAULT_BASE_URL = "https://colorful-toilet.colorful-toilet.workers.dev";
const DEFAULT_DEVELOPER_EMAIL = "2715000591@qq.com";

function detectMacHttpsProxy() {
  if (process.platform !== "darwin") {
    return "";
  }

  try {
    const output = execFileSync("scutil", ["--proxy"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    if (!/HTTPSEnable\s*:\s*1/.test(output)) {
      return "";
    }
    const host = output.match(/HTTPSProxy\s*:\s*([^\n]+)/)?.[1]?.trim();
    const port = output.match(/HTTPSPort\s*:\s*(\d+)/)?.[1]?.trim();
    return host && port ? `http://${host}:${port}` : "";
  } catch (error) {
    return "";
  }
}

function relaunchWithDetectedProxyIfNeeded() {
  if (process.env.WEB25_AUDIT_PROXY_RELAUNCHED === "1") {
    return;
  }
  const existingHttpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const detectedProxy = existingHttpsProxy || detectMacHttpsProxy();
  if (!detectedProxy) {
    return;
  }
  if (process.env.NODE_USE_ENV_PROXY === "1" && existingHttpsProxy) {
    return;
  }

  const result = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: "inherit",
    env: Object.assign({}, process.env, {
      HTTPS_PROXY: detectedProxy,
      NODE_USE_ENV_PROXY: "1",
      WEB25_AUDIT_PROXY_RELAUNCHED: "1"
    })
  });
  process.exit(result.status === null ? 1 : result.status);
}

relaunchWithDetectedProxyIfNeeded();

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
  const auditResult = await requestDeveloperJson(baseUrl, "/api/developer/data-layer-audit", {
    method: "GET"
  }, {
    email,
    providedCode,
    description: "audit endpoint"
  });
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
