#!/usr/bin/env node

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
  if (process.env.WEB25_REPLY_AI_PROBE_PROXY_RELAUNCHED === "1") {
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
      WEB25_REPLY_AI_PROBE_PROXY_RELAUNCHED: "1"
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
    throw new Error("Logged in user is not a developer; routing probe endpoint requires developer access.");
  }
  return cookieJar;
}

function parseSampleArg() {
  const raw = readArg("sample", "");
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    throw new Error(`Invalid --sample JSON: ${error && error.message ? error.message : error}`);
  }
}

function buildSample() {
  const sampleArg = parseSampleArg();
  if (sampleArg) {
    return sampleArg;
  }

  return {
    replyText: readArg("text", "找个同城弟弟"),
    replyDisplayName: readArg("display-name", "孟轩🌸无常线下🌸"),
    replyHandle: readArg("handle", "MullerChri42258"),
    mainPostText: readArg("main", "真实页面调试样本"),
    threadUrl: readArg("thread-url", "https://x.com/example/status/1"),
    threadStatusId: readArg("thread-status-id", "developer-probe-thread"),
    replyStatusId: readArg("reply-status-id", "developer-probe-reply")
  };
}

function printProbe(probe) {
  const source = probe || {};
  const route = source.route || {};
  const finalDecision = route.finalDecision || {};
  const settings = source.settings || {};
  const sample = source.sample || {};
  const memory = source.memory || {};
  const ruleCandidates = source.ruleCandidates || {};
  const accountRisk = source.accountRisk || {};
  const heuristics = source.heuristics || {};

  console.log("Reply AI routing probe");
  console.log(`Sample: ${sample.replyDisplayName || ""} @${String(sample.replyHandle || "").replace(/^@/, "")} / ${sample.replyText || ""}`);
  console.log(`AI setting: enabled=${settings.replyAiEnabled ? "yes" : "no"}, keyLast4=${settings.apiKeyLast4 || "none"}, model=${settings.model || ""}`);
  console.log(`Final layer: ${finalDecision.decisionLayer || ""}`);
  console.log(`Decision: ${finalDecision.status || ""} / ${finalDecision.action || ""} / ${finalDecision.confidence || ""}`);
  console.log(`Reason: ${finalDecision.reasonShort || ""}`);
  console.log(`External AI: ${source.providerCalled ? "called" : (source.wouldCallProvider ? "would run" : "not needed")}`);
  if (source.providerError) {
    console.log(`External AI error: ${source.providerError}`);
  }
  console.log(`Database writes: ${source.writesDatabase ? "yes" : "no"}`);
  console.log("");
  console.log(`AI memory checked: ${(memory.checked || []).map((entry) => entry.memoryKeyType).join(", ") || "none"}`);
  console.log(`AI memory matched: ${memory.matched ? memory.matched.memoryKeyType : "no"}`);
  console.log(`Rule candidate entries: ${(ruleCandidates.entries || []).map((entry) => `${entry.ruleType}:${entry.patternKey}`).join(", ") || "none"}`);
  console.log(`Rule candidate matches: ${(ruleCandidates.matches || []).map((entry) => `${entry.ruleType}:${entry.patternKey}`).join(", ") || "no"}`);
  console.log(`Manual allow suppression: ${ruleCandidates.manualAllow ? "yes" : "no"}`);
  console.log(`Account risk: totalHigh=${accountRisk.totalHighConfidenceHideCount || 0}, recentHigh=${accountRisk.recentHighConfidenceHideCount || 0}, globalBlock=${accountRisk.activeGlobalBlock ? "yes" : "no"}`);
  console.log("");
  console.log(`Heuristic notes: ${(heuristics.evidenceNotes || []).join(" | ") || "none"}`);
}

async function main() {
  const baseUrl = readArg("base", process.env.WEB25_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/g, "");
  const email = readArg("email", process.env.WEB25_DEVELOPER_EMAIL || DEFAULT_DEVELOPER_EMAIL);
  const providedCode = readArg("code", process.env.WEB25_LOGIN_CODE || "");
  const callProvider = hasFlag("call-provider");
  const cookieJar = await login(baseUrl, email, providedCode);
  const result = await requestJson(baseUrl, "/api/developer/reply-ai-routing-probe", {
    method: "POST",
    body: JSON.stringify({
      callProvider,
      sample: buildSample()
    })
  }, cookieJar);
  if (!result.ok || !result.data || !result.data.ok) {
    throw new Error(`probe failed: ${result.status} ${JSON.stringify(result.data)}`);
  }

  if (hasFlag("json")) {
    console.log(JSON.stringify(result.data.probe || {}, null, 2));
    return;
  }
  printProbe(result.data.probe);
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
});
