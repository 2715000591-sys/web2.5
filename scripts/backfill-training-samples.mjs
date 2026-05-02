#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

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
  if (process.env.WEB25_BACKFILL_PROXY_RELAUNCHED === "1") {
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
      WEB25_BACKFILL_PROXY_RELAUNCHED: "1"
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

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
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

async function requestJson(baseUrl, route, options, cookieJar) {
  const headers = Object.assign({
    "Content-Type": "application/json"
  }, options && options.headers ? options.headers : {});
  const cookies = cookieHeader(cookieJar);
  if (cookies) {
    headers.Cookie = cookies;
  }

  const response = await fetch(new URL(route, baseUrl), Object.assign({}, options || {}, {
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

function buildBackupPath() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.resolve("backups", "d1", `web25-${stamp}-before-training-backfill.sql`);
}

function createD1Backup() {
  const backupPath = buildBackupPath();
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  execFileSync("npx", [
    "wrangler@latest",
    "d1",
    "export",
    "web25",
    "--remote",
    "--output",
    backupPath,
    "--skip-confirmation"
  ], {
    stdio: "inherit"
  });
  return backupPath;
}

async function login(baseUrl, email, providedCode) {
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
    throw new Error("Logged in user is not a developer; backfill endpoint requires developer access.");
  }
  return cookieJar;
}

async function runBackfill(baseUrl, cookieJar) {
  const limit = Math.max(1, Math.min(300, Number(readArg("limit", "120")) || 120));
  const dryRun = hasFlag("dry-run");
  let eventAfterId = Math.max(0, Number(readArg("event-after-id", "0")) || 0);
  let replyAiAfterId = Math.max(0, Number(readArg("reply-ai-after-id", "0")) || 0);
  let totalEvents = 0;
  let totalReplyAi = 0;
  let totalMemory = 0;

  for (let iteration = 1; iteration <= 60; iteration += 1) {
    const result = await requestJson(baseUrl, "/api/developer/backfill-training", {
      method: "POST",
      body: JSON.stringify({
        source: "all",
        eventAfterId,
        replyAiAfterId,
        limit,
        dryRun
      })
    }, cookieJar);
    cookieJar = result.cookieJar;
    if (!result.ok || !result.data || !result.data.ok) {
      throw new Error(`backfill failed: ${result.status} ${JSON.stringify(result.data)}`);
    }

    const events = result.data.events || {};
    const replyAi = result.data.replyAi || {};
    totalEvents += Number(events.processed || 0);
    totalReplyAi += Number(replyAi.processed || 0);
    totalMemory += Number(replyAi.memoryUpserts || 0);
    eventAfterId = Number(result.data.next && result.data.next.eventAfterId ? result.data.next.eventAfterId : eventAfterId);
    replyAiAfterId = Number(result.data.next && result.data.next.replyAiAfterId ? result.data.next.replyAiAfterId : replyAiAfterId);

    console.log(`Batch ${iteration}: events scanned=${events.scanned || 0}, reply AI scanned=${replyAi.scanned || 0}, memory upserts=${replyAi.memoryUpserts || 0}`);

    if (result.data.next && result.data.next.done) {
      break;
    }
  }

  return {
    totalEvents,
    totalReplyAi,
    totalMemory,
    eventAfterId,
    replyAiAfterId
  };
}

async function main() {
  const baseUrl = readArg("base", process.env.WEB25_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/g, "");
  const email = readArg("email", process.env.WEB25_DEVELOPER_EMAIL || DEFAULT_DEVELOPER_EMAIL);
  const providedCode = readArg("code", process.env.WEB25_LOGIN_CODE || "");

  const backupPath = hasFlag("dry-run") ? "" : createD1Backup();
  if (backupPath) {
    console.log(`D1 backup saved: ${backupPath}`);
  }

  const cookieJar = await login(baseUrl, email, providedCode);
  const summary = await runBackfill(baseUrl, cookieJar);
  console.log("Training backfill summary:", JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
});
