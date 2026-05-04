#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const DEFAULT_BASE_URL = "https://colorful-toilet.colorful-toilet.workers.dev";
const DEFAULT_DEVELOPER_EMAIL = "2715000591@qq.com";
const D1_WRITE_UNLOCK_VALUE = "I_UNDERSTAND_PROTECTED_STATS";

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
  if (process.env.WEB25_RULE_CANDIDATES_PROXY_RELAUNCHED === "1") {
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
      WEB25_RULE_CANDIDATES_PROXY_RELAUNCHED: "1"
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
  return path.resolve("backups", "d1", `web25-${stamp}-before-rule-candidates.sql`);
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

function assertD1WriteUnlocked(actionLabel) {
  if (process.env.WEB25_ALLOW_D1_WRITE === D1_WRITE_UNLOCK_VALUE) {
    return;
  }
  throw new Error(`${actionLabel} 会写入线上 D1 数据库。先向用户说明会影响哪些统计/历史，确认需要写入，再用 WEB25_ALLOW_D1_WRITE=${D1_WRITE_UNLOCK_VALUE} 重新运行。只检查请加 --dry-run。`);
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
    throw new Error("Logged in user is not a developer; rebuild endpoint requires developer access.");
  }
  return cookieJar;
}

async function main() {
  const baseUrl = readArg("base", process.env.WEB25_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/g, "");
  const email = readArg("email", process.env.WEB25_DEVELOPER_EMAIL || DEFAULT_DEVELOPER_EMAIL);
  const providedCode = readArg("code", process.env.WEB25_LOGIN_CODE || "");
  const dryRun = hasFlag("dry-run");

  if (!dryRun) {
    assertD1WriteUnlocked("重建候选规则");
  }

  const backupPath = dryRun ? "" : createD1Backup();
  if (backupPath) {
    console.log(`D1 backup saved: ${backupPath}`);
  }

  const cookieJar = await login(baseUrl, email, providedCode);
  const result = await requestJson(baseUrl, "/api/developer/rebuild-rule-candidates", {
    method: "POST",
    body: JSON.stringify({ dryRun })
  }, cookieJar);
  if (!result.ok || !result.data || !result.data.ok) {
    throw new Error(`rebuild failed: ${result.status} ${JSON.stringify(result.data)}`);
  }
  console.log("Rule candidate rebuild summary:", JSON.stringify(result.data.candidates || {}, null, 2));
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
});
