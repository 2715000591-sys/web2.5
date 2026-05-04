#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_BASE_URL = (process.env.WEB25_BASE_URL || "https://colorful-toilet.colorful-toilet.workers.dev").replace(/\/+$/g, "");
const args = new Set(process.argv.slice(2));
const runFull = args.has("--full");
const runNetwork = !args.has("--no-network");
const checks = [];

function detectMacHttpsProxy() {
  if (process.platform !== "darwin") {
    return "";
  }

  const result = spawnSync("scutil", ["--proxy"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  });
  if (result.status !== 0 || !result.stdout || !/HTTPSEnable\s*:\s*1/.test(result.stdout)) {
    return "";
  }
  const host = result.stdout.match(/HTTPSProxy\s*:\s*([^\n]+)/)?.[1]?.trim();
  const port = result.stdout.match(/HTTPSPort\s*:\s*(\d+)/)?.[1]?.trim();
  return host && port ? `http://${host}:${port}` : "";
}

function relaunchWithDetectedProxyIfNeeded() {
  if (process.env.WEB25_DOCTOR_PROXY_RELAUNCHED === "1") {
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
      WEB25_DOCTOR_PROXY_RELAUNCHED: "1"
    })
  });
  process.exit(result.status === null ? 1 : result.status);
}

relaunchWithDetectedProxyIfNeeded();

function rootPath(filePath) {
  return path.join(ROOT_DIR, filePath);
}

function readText(filePath) {
  return fs.readFileSync(rootPath(filePath), "utf8");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function addCheck(status, title, detail) {
  checks.push({
    status,
    title,
    detail: detail || ""
  });
}

function ok(title, detail) {
  addCheck("ok", title, detail);
}

function warn(title, detail) {
  addCheck("warn", title, detail);
}

function fail(title, detail) {
  addCheck("fail", title, detail);
}

function runCommand(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: ROOT_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: options.timeout || 30000,
    env: Object.assign({}, process.env, options.env || {})
  });
  return {
    status: result.status,
    signal: result.signal,
    error: result.error,
    output: `${result.stdout || ""}${result.stderr || ""}`.trim()
  };
}

function firstLine(text) {
  return String(text || "").split(/\r?\n/).find(Boolean) || "";
}

function countLines(text) {
  if (!text) {
    return 0;
  }
  return text.split(/\r?\n/).length;
}

function checkFileExists(filePath, label) {
  if (fs.existsSync(rootPath(filePath))) {
    ok(label, filePath);
    return true;
  }
  fail(label, `${filePath} is missing`);
  return false;
}

function extractBuildId() {
  const source = readText("extension/content/content.js");
  return source.match(/const\s+BUILD_ID\s*=\s*"([^"]+)"/)?.[1] || "";
}

function checkSyntax(filePath) {
  if (!fs.existsSync(rootPath(filePath))) {
    fail(`语法检查 ${filePath}`, "文件不存在");
    return;
  }
  const result = runCommand(process.execPath, ["--check", filePath], { timeout: 60000 });
  if (result.status === 0) {
    ok(`语法检查 ${filePath}`, "通过");
    return;
  }
  fail(`语法检查 ${filePath}`, firstLine(result.output) || "node --check failed");
}

function checkDocsContainCurrentAnchor(buildId, extensionVersion) {
  const docFiles = [
    "README.md",
    "docs/next-thread-handoff.md",
    "docs/current-stable-filter-state.md",
    "docs/current-stable-ui-state.md",
    "docs/ai-api-provider-handoff.md",
    "site/stable-state.html"
  ];

  for (const filePath of docFiles) {
    if (!fs.existsSync(rootPath(filePath))) {
      warn("文档锚点检查", `${filePath} 不存在`);
      continue;
    }
    const text = readText(filePath);
    const missing = [];
    if (buildId && !text.includes(buildId)) {
      missing.push(`BUILD_ID ${buildId}`);
    }
    if (extensionVersion && !text.includes(extensionVersion)) {
      missing.push(`扩展版本 ${extensionVersion}`);
    }
    if (missing.length) {
      warn("文档锚点检查", `${filePath} 没有写到：${missing.join("、")}`);
    } else {
      ok("文档锚点检查", `${filePath} 已对齐`);
    }
  }
}

function checkStaleText() {
  const targets = [
    "README.md",
    "AGENTS.md",
    "docs/next-thread-handoff.md",
    "docs/current-stable-filter-state.md",
    "docs/current-stable-ui-state.md",
    "docs/ai-api-provider-handoff.md",
    "docs/moderation-database-training-plan.md",
    "site/stable-state.html"
  ];
  const stalePatterns = [
    "先不使用 AI",
    "当前这台机器还没有安装 Xcode",
    "2026-04-23-1415",
    "0.1.23",
    "1.0.23",
    "e74435d5",
    "BUILD_ID=2026-05-04-1034"
  ];
  const hits = [];

  for (const filePath of targets) {
    if (!fs.existsSync(rootPath(filePath))) {
      continue;
    }
    const text = readText(filePath);
    for (const pattern of stalePatterns) {
      if (text.includes(pattern)) {
        hits.push(`${filePath}: ${pattern}`);
      }
    }
  }

  if (hits.length) {
    fail("旧信息检查", hits.join("; "));
  } else {
    ok("旧信息检查", "没有发现已知旧版本和旧口径");
  }
}

function checkAgentRules() {
  const agents = readText("AGENTS.md");
  const handoff = readText("docs/next-thread-handoff.md");
  const required = [
    ["老板认可后上传 GitHub", agents.includes("boss-approved archive step") && handoff.includes("大幅度赞美")],
    ["验证失败必须停下", agents.includes("Do not skip verification") && handoff.includes("不要跳过验证")],
    ["相似规则要合并", agents.includes("Merge similar instructions") && handoff.includes("相似规则合并")],
    ["上下文快满提醒", agents.includes("context may be getting fragile") && handoff.includes("上下文快满提醒")]
  ];

  for (const [title, passed] of required) {
    if (passed) {
      ok("交接规则检查", title);
    } else {
      fail("交接规则检查", `${title} 没写完整`);
    }
  }
}

function checkLegacyEntryPointsRemoved() {
  const legacyPaths = [
    "backend/server.mjs",
    "home-feed-extension/manifest.json",
    "legacy-pages-redirect/index.html",
    "docs/mvp.md",
    "docs/run-in-safari.md",
    "site/_worker.js",
    "site/console/index.html",
    "open-web25-console.command",
    "install-web25-autostart.command",
    "remove-web25-autostart.command",
    "scripts/open-console.sh",
    "scripts/backend-run.sh",
    "scripts/backend-status.sh",
    "scripts/install-autostart.sh",
    "scripts/uninstall-autostart.sh"
  ];
  const stillPresent = legacyPaths.filter((filePath) => fs.existsSync(rootPath(filePath)));
  if (stillPresent.length) {
    fail("旧入口清理检查", `这些旧入口仍存在：${stillPresent.join("、")}`);
  } else {
    ok("旧入口清理检查", "旧本地后台、旧实验扩展、旧重定向和旧文档入口已移出主线");
  }

  const packageJson = readJson("package.json");
  const scripts = packageJson.scripts || {};
  const staleScripts = Object.entries(scripts).filter(([, command]) => {
    return /backend\/server\.mjs|scripts\/open-console\.sh|scripts\/backend-run\.sh|scripts\/backend-status\.sh|scripts\/install-autostart\.sh|scripts\/uninstall-autostart\.sh/.test(String(command || ""));
  });
  if (staleScripts.length) {
    fail("旧 npm 命令检查", staleScripts.map(([name]) => name).join("、"));
  } else {
    ok("旧 npm 命令检查", "没有命令再指向旧本地后台");
  }
}

function checkPatternKeyAlignment() {
  const localSource = [
    readText("extension/content/content.js"),
    readText("extension/content/rules.js")
  ].join("\n");
  const workerSource = readText("cloudflare/src/index.js");
  const patternRegex = /pattern:[a-z0-9_-]+/g;
  const localKeys = new Set(localSource.match(patternRegex) || []);
  const workerKeys = new Set(workerSource.match(patternRegex) || []);
  const onlyLocal = Array.from(localKeys).filter((key) => !workerKeys.has(key)).sort();
  const onlyWorker = Array.from(workerKeys).filter((key) => !localKeys.has(key)).sort();

  if (onlyLocal.length || onlyWorker.length) {
    fail(
      "本地/云端 pattern key 对齐",
      [
        onlyLocal.length ? `只在本地：${onlyLocal.join(", ")}` : "",
        onlyWorker.length ? `只在云端：${onlyWorker.join(", ")}` : ""
      ].filter(Boolean).join("；")
    );
    return;
  }

  ok("本地/云端 pattern key 对齐", `${localKeys.size} 个 key 已对齐`);
}

function checkHandoffLength() {
  const handoff = readText("docs/next-thread-handoff.md");
  const lines = countLines(handoff);
  if (lines <= 320) {
    ok("交接文档长度", `${lines} 行，仍然适合新对话快速读`);
  } else if (lines <= 380) {
    warn("交接文档长度", `${lines} 行，开始偏长，下一轮应压缩`);
  } else {
    fail("交接文档长度", `${lines} 行，已经重新接近流水账`);
  }
}

function checkGitStatus() {
  const result = runCommand("git", ["status", "--branch", "--short"], { timeout: 15000 });
  if (result.status !== 0) {
    warn("本地改动状态", firstLine(result.output) || "git status failed");
    return;
  }
  const lines = result.output.split(/\r?\n/).filter(Boolean);
  const changedCount = Math.max(0, lines.length - 1);
  if (changedCount === 0) {
    ok("本地改动状态", lines[0] || "干净");
  } else {
    warn("本地改动状态", `有 ${changedCount} 项本地改动，这是当前工作内容；交接前要说明清楚`);
  }
}

function checkLocalDownloadManifest(buildId, extensionVersion) {
  const latestPath = "site/downloads/latest.json";
  if (!fs.existsSync(rootPath(latestPath))) {
    warn("本地下载清单", `${latestPath} 不存在`);
    return;
  }
  try {
    const latest = readJson(latestPath);
    const mismatches = [];
    if (latest.buildId !== buildId) {
      mismatches.push(`buildId=${latest.buildId || "missing"}`);
    }
    if (latest.extensionVersion !== extensionVersion) {
      mismatches.push(`extensionVersion=${latest.extensionVersion || "missing"}`);
    }
    if (mismatches.length) {
      fail("本地下载清单", `和源码不一致：${mismatches.join("、")}`);
    } else {
      ok("本地下载清单", `${latest.buildId} / ${latest.extensionVersion}`);
    }
  } catch (error) {
    fail("本地下载清单", error.message || String(error));
  }
}

async function checkPublicDownloadManifest(buildId, extensionVersion) {
  if (!runNetwork) {
    warn("公网下载清单", "已跳过网络检查；需要时去掉 --no-network");
    return;
  }
  const url = `${PUBLIC_BASE_URL}/downloads/latest.json`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const latest = await response.json();
    if (!response.ok) {
      warn("公网下载清单", `${response.status} ${response.statusText}`);
      return;
    }
    const mismatches = [];
    if (latest.buildId !== buildId) {
      mismatches.push(`公网 buildId=${latest.buildId || "missing"}`);
    }
    if (latest.extensionVersion !== extensionVersion) {
      mismatches.push(`公网 extensionVersion=${latest.extensionVersion || "missing"}`);
    }
    if (mismatches.length) {
      warn("公网下载清单", `和本地源码不同：${mismatches.join("、")}`);
    } else {
      ok("公网下载清单", `${latest.buildId} / ${latest.extensionVersion}`);
    }
  } catch (error) {
    warn("公网下载清单", `无法读取 ${url}：${error.message || String(error)}`);
  } finally {
    clearTimeout(timer);
  }
}

function checkInstalledSafariApp(buildId) {
  const appPath = process.env.WEB25_APP_PATH || "/Applications/web2.5.app";
  const contentPath = path.join(appPath, "Contents/PlugIns/web2.5 Extension.appex/Contents/Resources/content/content.js");
  if (!fs.existsSync(appPath)) {
    warn("本机 Safari App", `${appPath} 不存在；如果只做云端或文档工作可以忽略`);
    return;
  }
  if (!fs.existsSync(contentPath)) {
    fail("本机 Safari App", "找不到已安装 App 里的 content.js");
    return;
  }
  const installed = fs.readFileSync(contentPath, "utf8");
  if (!installed.includes(`BUILD_ID = "${buildId}"`)) {
    fail("本机 Safari App", `已安装 App 不是当前 BUILD_ID ${buildId}`);
  } else {
    ok("本机 Safari App", `已安装 App 含当前 BUILD_ID ${buildId}`);
  }

  const codesign = runCommand("codesign", ["--verify", "--deep", "--strict", "--verbose=2", appPath], { timeout: 30000 });
  if (codesign.status === 0) {
    ok("本机 Safari App 签名", "通过");
  } else {
    fail("本机 Safari App 签名", firstLine(codesign.output) || "codesign failed");
  }
}

function runFullChecks() {
  const cloudCheck = runCommand("npm", ["run", "cloud:check", "--silent"], { timeout: 180000 });
  if (cloudCheck.status === 0) {
    ok("完整云端检查", "Cloudflare dry-run 通过");
  } else {
    fail("完整云端检查", firstLine(cloudCheck.output) || "npm run cloud:check failed");
  }

  const probe = runCommand("npm", [
    "run",
    "cloud:probe-reply-ai",
    "--silent",
    "--",
    "--text",
    "找个同城弟弟",
    "--display-name",
    "孟轩线下",
    "--handle",
    "MullerChri42258"
  ], { timeout: 120000 });
  if (probe.status === 0) {
    ok("AI 后台路线探针", firstLine(probe.output) || "通过");
  } else {
    warn("AI 后台路线探针", firstLine(probe.output) || "探针失败；可能需要登录码或网络");
  }
}

async function main() {
  console.log("web2.5 一键体检");
  console.log(`项目：${ROOT_DIR}`);
  console.log(`模式：${runFull ? "完整检查" : "快速检查"}`);
  console.log("");

  checkFileExists("AGENTS.md", "底层规则文件");
  checkFileExists("docs/next-thread-handoff.md", "交接文档");
  checkFileExists("extension/content/content.js", "本地扩展主脚本");
  checkFileExists("extension/content/rules.js", "本地扩展规则");
  checkFileExists("cloudflare/src/index.js", "云端后台主文件");
  checkFileExists("cloudflare/schema.sql", "数据库结构文件");

  const buildId = extractBuildId();
  const manifest = readJson("extension/manifest.json");
  const extensionVersion = String(manifest.version || "");
  if (buildId) {
    ok("当前 BUILD_ID", buildId);
  } else {
    fail("当前 BUILD_ID", "extension/content/content.js 里没有找到 BUILD_ID");
  }
  if (extensionVersion) {
    ok("当前扩展版本", extensionVersion);
  } else {
    fail("当前扩展版本", "extension/manifest.json 里没有 version");
  }

  checkGitStatus();
  checkLocalDownloadManifest(buildId, extensionVersion);
  await checkPublicDownloadManifest(buildId, extensionVersion);
  checkInstalledSafariApp(buildId);
  checkDocsContainCurrentAnchor(buildId, extensionVersion);
  checkStaleText();
  checkAgentRules();
  checkLegacyEntryPointsRemoved();
  checkPatternKeyAlignment();
  checkHandoffLength();

  [
    "cloudflare/src/index.js",
    "extension/content/rules.js",
    "extension/content/content.js",
    "site/app.js",
    "scripts/doctor.mjs"
  ].forEach(checkSyntax);

  if (runFull) {
    runFullChecks();
  } else {
    warn("完整云端和 AI 路线检查", "快速模式未运行；需要时用 npm run doctor:full");
  }

  console.log("");
  for (const check of checks) {
    const label = check.status === "ok" ? "OK" : (check.status === "warn" ? "WARN" : "FAIL");
    console.log(`[${label}] ${check.title}${check.detail ? ` - ${check.detail}` : ""}`);
  }

  const summary = checks.reduce((acc, check) => {
    acc[check.status] += 1;
    return acc;
  }, { ok: 0, warn: 0, fail: 0 });

  console.log("");
  console.log(`总结：${summary.ok} 项通过，${summary.warn} 项提醒，${summary.fail} 项失败。`);
  if (summary.fail > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
