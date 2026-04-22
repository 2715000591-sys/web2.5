const SESSION_COOKIE = "web25_session";
const DEVELOPER_PENDING_PAGE_SIZE = 8;
const DEVELOPER_RULE_PAGE_SIZE = 8;
const ALLOWED_EVENT_TYPES = new Set([
  "manual_hide",
  "manual_allow",
  "auto_hide",
  "ad_hide",
  "ad_home_hide",
  "ad_reply_hide"
]);
const REVIEW_EVENT_TYPES = new Set(["auto_hide", "manual_hide", "manual_allow"]);
const GLOBAL_TEMPLATE_WINDOW_DAYS = 7;
const GLOBAL_TEMPLATE_MIN_HIDES = 5;
const GLOBAL_TEMPLATE_MIN_SYNC_KEYS = 3;
const GLOBAL_TEMPLATE_MIN_TEXTS = 3;
const AUTO_GLOBAL_EXACT_WINDOW_DAYS = 30;
const AUTO_GLOBAL_EXACT_MIN_HIDES = 2;
const REPEAT_HANDLE_WINDOW_HOURS = 24;
const REPEAT_HANDLE_MIN_HIDES = 2;
const ZERO_WIDTH_PATTERN = /[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0]/g;
const COMPACT_PUNCTUATION_PATTERN = /[~～`!！?？,，。.、:：;；'"“”‘’()[\]{}<>《》…—\-_=+*\/\\|]/g;
const EMOJI_PATTERN = /[\u{1F100}-\u{1FAFF}\u2600-\u27BF]/gu;
const SIMILARITY_TERMS = [
  "线下",
  "附近",
  "离得近",
  "同城",
  "哥哥",
  "弟弟",
  "帅弟",
  "帅哥",
  "主人",
  "领我",
  "养我",
  "真人",
  "找下",
  "找我",
  "私聊",
  "私我",
  "来找",
  "带走",
  "见面",
  "约",
  "上门",
  "想要",
  "小狗",
  "汪汪",
  "调教",
  "搭子",
  "哥哥线下",
  "弟弟线下",
  "看主页",
  "点主页",
  "主页置顶",
  "主页id",
  "置顶id",
  "看简介",
  "简介id",
  "看资料",
  "资料id",
  "签名id",
  "自介id",
  "搜id",
  "小号",
  "纸飞机",
  "飞机号",
  "扣扣",
  "企鹅",
  "群号",
  "频道号",
  "vx",
  "wx",
  "tg",
  "万达广场附近",
  "救赎之道",
  "极品尤物",
  "推特第一骚",
  "固炮"
];
const ACCOUNT_REDIRECT_TERMS = [
  "搜id",
  "搜我id",
  "主页id",
  "置顶id",
  "简介id",
  "资料id",
  "签名id",
  "自介id",
  "账号在主页",
  "小号在主页",
  "看简介",
  "看资料",
  "看签名",
  "看自介",
  "纸飞机",
  "飞机号",
  "扣扣",
  "企鹅",
  "群号",
  "频道号"
];
const ACCOUNT_REDIRECT_PATTERNS = [
  /(主页|置顶|简介|资料|签名|自介).{0,6}(id|号|账号|小号|入口|联系方式|飞机|电报|tg|vx|wx|群|频道)/,
  /(id|号|账号|小号).{0,6}(在|见|放|留|写在).{0,4}(主页|置顶|简介|资料|签名|自介)/,
  /(搜|加|留|放|看).{0,3}(我|这个|主页|置顶|简介|资料|签名|自介)?.{0,3}(id|号|账号|小号)/,
  /(纸飞机|飞机号|扣扣|企鹅|群号|频道号|频道|群聊)/,
  /(?:vx|wx|tg|qq)[a-z0-9_-]{4,}/,
  /(电报|飞机).{0,4}(id|号|账号|频道|群)/,
  /(联系方式|联系我).{0,4}(见|在|放在).{0,4}(主页|置顶|简介|资料|签名|自介)/,
  /(主页|置顶|简介|资料|签名|自介).{0,4}(自取|自拿|自加|自搜)/
];
const TEMPLATE_SLOT_DEFINITIONS = [
  {
    id: "hook",
    terms: ["在吗", "有没有", "有吗", "有没", "真人吗", "真人", "哥哥", "姐姐", "弟弟", "妹妹", "宝贝"],
    patterns: [/^有(没)?有/, /在吗/, /真人[吗嘛]?/]
  },
  {
    id: "meetup",
    terms: ["线下", "附近", "离得近", "同城", "找下", "找我", "上门", "见面", "约", "来找"],
    patterns: [/同城.{0,3}(约|见|找|聊|来)/, /(线下|见面|上门|来找)/]
  },
  {
    id: "relationship_or_erotic",
    terms: ["暧昧", "陪伴", "陪聊", "想要", "调教", "小狗", "汪汪", "主人", "搭子", "固定搭子", "固炮", "单男", "破处", "约炮", "骚", "宠你"],
    patterns: [/(陪|调教|主人|小狗|搭子|固炮|破处|约炮|骚)/]
  },
  {
    id: "petplay_owner_request",
    terms: ["求主人", "找主人", "认主人", "当我主人", "做我主人", "在线等主人", "在线找主人"],
    patterns: [
      /(小狗|汪汪).{0,4}(求|找|认).{0,3}(个)?主人/,
      /(小狗|汪汪).{0,4}在线.{0,3}(等|找).{0,3}(个)?主人/,
      /在线.{0,4}(等|找|求).{0,4}(个)?主人/,
      /谁来.{0,4}当我主人(?!公)/,
      /(当|做).{0,2}我.{0,2}主人(?!公)/
    ]
  },
  {
    id: "diversion",
    terms: ["看主页", "点主页", "主页", "置顶", "私聊", "私我", "私信", "入口", "联系方式", "联系", "飞机", "电报", "tg", "vx", "加我", "v我"],
    patterns: [/(看|点).{0,2}主页/, /主页.{0,4}(见|看|聊|联系|入口|置顶)/, /(私聊|私信|私我|联系方式|飞机|电报|tg|vx)/]
  },
  {
    id: "account_redirect",
    terms: ACCOUNT_REDIRECT_TERMS,
    patterns: ACCOUNT_REDIRECT_PATTERNS
  },
  {
    id: "benefit_or_offer",
    terms: ["福利", "资源", "兼职", "报价", "免费", "套餐", "服务", "安排", "优惠", "返现", "包养"],
    patterns: [/(福利|资源|兼职|报价|免费|套餐|服务|安排|优惠|返现|包养)/]
  }
];
const HIGH_RISK_DISPLAY_NAME_PATTERNS = [
  /迷药/,
  /催情/,
  /催春/,
  /春药/,
  /听话水/,
  /迷奸/,
  /失忆水/,
  /ghb/,
  /迷晕/,
  /催眠药/
];
const DISPLAY_NAME_MARKETING_TERMS = [
  "免费",
  "无偿",
  "线下",
  "同城",
  "日泡",
  "破处",
  "单男",
  "固炮",
  "约炮",
  "搭子",
  "调教",
  "主人",
  "小狗",
  "陪聊"
];
const DISPLAY_NAME_LURE_PATTERNS = [
  /免费.{0,2}破处/,
  /(?:男|女).{0,2}无偿/,
  /(线下|同城).{0,3}(约|泡|搭|找|见|聊|日)/,
  /日泡/,
  /(破处|约炮|单男|固炮|调教|主人|小狗|搭子)/,
  /(主页|置顶|简介|资料|签名|自介).{0,6}(id|号|账号|小号|入口|联系方式|飞机|电报|tg|vx|wx|群|频道)/,
  /(纸飞机|飞机号|扣扣|企鹅|群号|频道号|频道|群聊)/,
  /(搜|加).{0,3}(id|号|账号|小号|vx|wx|tg|电报|飞机)/
];
const SHARE_LINK_PATTERNS = [
  /(?:https?:\/\/)?pan\.quark\.cn\/s\//,
  /(?:https?:\/\/)?pan\.baidu\.com\//,
  /(?:https?:\/\/)?(?:www\.)?alipan\.com\/s\//,
  /(?:https?:\/\/)?(?:www\.)?aliyundrive\.com\/s\//,
  /(?:https?:\/\/)?cloud\.189\.cn\//,
  /(?:https?:\/\/)?share\.weiyun\.com\//,
  /(?:https?:\/\/)?(?:www\.)?lanzou[a-z]*\./
];
const SHARE_LINK_SCAM_TERMS = [
  "完整版",
  "网盘",
  "转发在",
  "转发",
  "链接",
  "提取码",
  "夸克",
  "资源",
  "自取",
  "入口",
  "合集"
];
const LOW_INFORMATION_BADGE_PATTERNS = [
  /^(?:new|up|top|dd|hi|hey|ok|go|tg|vx|wx|qq|id|new\d{0,2})$/i,
  /^(?:置顶|顶|冲|滴滴|看看|点我|点这|主页|简介)$/
];
const GEO_MEETUP_BAIT_PATTERNS = [
  /^(?:有|求|蹲).{0,10}(万达广场附近|附近|离得近|同城|线下).{0,4}(吗|嘛|呢|的嘛|的吗|的么|的人|的人吗)$/,
  /^(?:万达广场附近|附近|离得近|同城|线下).{0,6}(有吗|有人吗|的吗|嘛|吗|么|呢)$/,
  /^(?:有|求|蹲).{0,12}(万达广场附近|附近|离得近|同城|线下).{0,3}(人吗|的人吗|的吗|吗|嘛|呢)$/
];
const BAIT_QUESTION_ENDING_PATTERN = /(吗|嘛|么|呢|的吗|的嘛|的人吗)$/;

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: buildCorsHeaders(request, isCredentialedPath(url.pathname))
        });
      }

      if (url.pathname.startsWith("/api/")) {
        return handleApi(request, env, ctx, url);
      }

      return serveAsset(request, env, url);
    } catch (error) {
      return json(
        {
          ok: false,
          error: error && error.message ? error.message : "internal-error"
        },
        500,
        request,
        false
      );
    }
  }
};

async function handleApi(request, env, ctx, url) {
  if (request.method === "GET" && url.pathname === "/api/health") {
    return json(
      {
        ok: true,
        service: "web2.5-cloud",
        mode: "cloudflare",
        appUrl: String(env.APP_URL || "").trim() || url.origin,
        hasEmailProvider: Boolean(String(env.EMAIL_SEND_ENDPOINT || "").trim()),
        developerLoginEnabled: isDeveloperLoginEnabled(env)
      },
      200,
      request,
      false
    );
  }

  if (request.method === "GET" && url.pathname === "/api/me") {
    const viewer = await requireViewer(request, env, false);
    return json(
      {
        ok: true,
        mode: "cloud",
        developerLoginEnabled: isDeveloperLoginEnabled(env),
        loggedIn: Boolean(viewer),
        viewer: viewer ? buildViewerPayload(viewer) : null
      },
      200,
      request,
      true
    );
  }

  if (request.method === "POST" && url.pathname === "/api/auth/request-code") {
    return handleRequestCode(request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/auth/verify-code") {
    return handleVerifyCode(request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/auth/logout") {
    return handleLogout(request);
  }

  if (request.method === "POST" && url.pathname === "/api/account/bind-sync-key") {
    return handleBindSyncKey(request, env);
  }

  if (request.method === "GET" && url.pathname === "/api/dashboard") {
    return handleDashboard(request, env, url);
  }

  if (request.method === "POST" && url.pathname === "/api/developer/confirm-feed") {
    return handleDeveloperConfirmFeed(request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/developer/dismiss-feed") {
    return handleDeveloperDismissFeed(request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/developer/revoke-feed") {
    return handleDeveloperRevokeFeed(request, env);
  }

  if (request.method === "GET" && url.pathname === "/api/state") {
    return handleState(request, env, url);
  }

  if (request.method === "GET" && url.pathname === "/api/ad-hide.gif") {
    return handleAdGif(request, env, url);
  }

  if (request.method === "POST" && url.pathname === "/api/events") {
    return handlePostEvent(request, env);
  }

  return json({ ok: false, error: "not-found" }, 404, request, isCredentialedPath(url.pathname));
}

async function serveAsset(request, env, url) {
  if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
    return new Response("Missing asset binding", { status: 500 });
  }

  let pathname = url.pathname;
  if (pathname === "/") {
    pathname = "/index.html";
  } else if (pathname === "/console" || pathname === "/console/") {
    pathname = "/console.html";
  }

  const rewritten = new Request(new URL(pathname + url.search, url.origin), request);
  return env.ASSETS.fetch(rewritten);
}

async function handleRequestCode(request, env) {
  const payload = await readJson(request);
  const email = normalizeEmail(payload.email);
  if (!email) {
    return json({ ok: false, error: "missing-email" }, 400, request, true);
  }
  const developerEmail = isDeveloperEmail(env, email);

  const resendSeconds = Math.max(30, Number(env.OTP_RESEND_SECONDS || 60) || 60);
  const now = new Date();
  const recent = await env.DB.prepare(
    "SELECT created_at FROM auth_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1"
  ).bind(email).first();

  if (recent && Date.now() - new Date(recent.created_at).getTime() < resendSeconds * 1000) {
    return json(
      {
        ok: false,
        error: "otp-rate-limited",
        retryAfterSeconds: resendSeconds
      },
      429,
      request,
      true
    );
  }

  const code = generateOtp();
  const codeHash = await sha256Hex(code);
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + Math.max(5, Number(env.OTP_TTL_MINUTES || 10) || 10) * 60 * 1000).toISOString();

  await env.DB.prepare(
    "INSERT INTO auth_codes (id, email, code_hash, created_at, expires_at, used_at, attempt_count) VALUES (?, ?, ?, ?, ?, NULL, 0)"
  ).bind(crypto.randomUUID(), email, codeHash, createdAt, expiresAt).run();

  const emailResult = await sendVerificationEmail(env, email, code, { developerEmail });
  if (!emailResult.ok) {
    return json(
      {
        ok: false,
        error: "email-send-failed",
        detail: emailResult.detail || "",
        developerLoginEnabled: isDeveloperLoginEnabled(env)
      },
      502,
      request,
      true
    );
  }

  return json(
    {
      ok: true,
      debugCode: emailResult.debugCode || null,
      developerMode: Boolean(emailResult.developerMode),
      message: emailResult.debugCode
        ? "开发者模式下验证码已生成。"
        : "验证码已发送。"
    },
    200,
    request,
    true
  );
}

async function handleVerifyCode(request, env) {
  const payload = await readJson(request);
  const email = normalizeEmail(payload.email);
  const code = String(payload.code || "").trim();

  if (!email || !code) {
    return json({ ok: false, error: "missing-fields" }, 400, request, true);
  }

  const authRow = await env.DB.prepare(
    "SELECT * FROM auth_codes WHERE email = ? AND used_at IS NULL ORDER BY created_at DESC LIMIT 1"
  ).bind(email).first();

  if (!authRow) {
    return json({ ok: false, error: "code-not-found" }, 400, request, true);
  }

  if (new Date(authRow.expires_at).getTime() < Date.now()) {
    return json({ ok: false, error: "code-expired" }, 400, request, true);
  }

  const codeHash = await sha256Hex(code);
  if (codeHash !== String(authRow.code_hash || "")) {
    await env.DB.prepare(
      "UPDATE auth_codes SET attempt_count = attempt_count + 1 WHERE id = ?"
    ).bind(authRow.id).run();
    return json({ ok: false, error: "code-invalid" }, 400, request, true);
  }

  await env.DB.prepare("UPDATE auth_codes SET used_at = ? WHERE id = ?").bind(new Date().toISOString(), authRow.id).run();

  let user = await env.DB.prepare("SELECT * FROM users WHERE email = ? LIMIT 1").bind(email).first();
  if (!user) {
    const now = new Date().toISOString();
    user = {
      id: crypto.randomUUID(),
      email,
      created_at: now,
      updated_at: now
    };
    await env.DB.prepare(
      "INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, ?, ?)"
    ).bind(user.id, user.email, user.created_at, user.updated_at).run();
  }

  const sessionId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + Math.max(7, Number(env.SESSION_TTL_DAYS || 30) || 30) * 24 * 60 * 60 * 1000).toISOString();

  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(sessionId, user.id, createdAt, expiresAt).run();

  const headers = buildCorsHeaders(request, true);
  headers.set("Set-Cookie", serializeSessionCookie(sessionId));

  return json(
    {
      ok: true,
      viewer: buildViewerPayload({
        id: user.id,
        email: user.email,
        isDeveloper: isDeveloperEmail(env, user.email)
      })
    },
    200,
    request,
    true,
    headers
  );
}

async function handleLogout(request) {
  const headers = buildCorsHeaders(request, true);
  headers.set("Set-Cookie", clearSessionCookie());
  return json({ ok: true }, 200, request, true, headers);
}

async function handleBindSyncKey(request, env) {
  const viewer = await requireViewer(request, env, true);
  if (!viewer) {
    return json({ ok: false, error: "unauthorized" }, 401, request, true);
  }

  const payload = await readJson(request);
  const syncKey = String(payload.syncKey || "").trim();
  if (!syncKey) {
    return json({ ok: false, error: "missing-sync-key" }, 400, request, true);
  }

  const now = new Date().toISOString();
  const existing = await env.DB.prepare("SELECT sync_key FROM sync_keys WHERE sync_key = ? LIMIT 1").bind(syncKey).first();

  if (existing) {
    await env.DB.prepare(
      "UPDATE sync_keys SET user_id = ?, updated_at = ?, last_seen_at = ? WHERE sync_key = ?"
    ).bind(viewer.id, now, now, syncKey).run();
  } else {
    await env.DB.prepare(
      "INSERT INTO sync_keys (sync_key, user_id, device_id, created_at, updated_at, last_seen_at) VALUES (?, ?, '', ?, ?, ?)"
    ).bind(syncKey, viewer.id, now, now, now).run();
  }

  await env.DB.prepare(
    "UPDATE moderation_events SET user_id = ? WHERE sync_key = ?"
  ).bind(viewer.id, syncKey).run();

  return json({ ok: true, syncKey }, 200, request, true);
}

async function handleDashboard(request, env, url) {
  const viewer = await requireViewer(request, env, true);
  if (!viewer) {
    return json({ ok: false, error: "unauthorized" }, 401, request, true);
  }

  const syncKey = String(url.searchParams.get("syncKey") || "").trim();
  if (syncKey) {
    await bindSyncKeyToUser(env, syncKey, viewer.id);
  }

  const [globalStats, personalStats, recent, adEvents, bindings] = await Promise.all([
    buildStats(env, null),
    buildStats(env, viewer.id),
    buildRecentEvents(env, viewer.id),
    buildRecentAdEvents(env, viewer.id),
    listBoundSyncKeys(env, viewer.id)
  ]);

  return json(
    {
      ok: true,
      viewer: buildViewerPayload(viewer),
      globalStats,
      personalStats,
      recent,
      adEvents,
      bindings,
      developer: null
    },
    200,
    request,
    true
  );
}

async function handleDeveloperConfirmFeed(request, env) {
  const viewer = await requireDeveloper(request, env);
  if (!viewer) {
    return json({ ok: false, error: "developer-required" }, 403, request, true);
  }

  const payload = await readJson(request);
  const dashboardOptions = readDeveloperDashboardOptionsFromPayload(payload);
  const eventIds = normalizeDeveloperEventIds(payload);
  if (!eventIds.length) {
    return json({ ok: false, error: "missing-event-id" }, 400, request, true);
  }

  const eventRows = await listDeveloperEventRowsByIds(env, viewer.id, eventIds);
  if (!eventRows.length) {
    return json({ ok: false, error: "feed-not-found" }, 404, request, true);
  }

  const confirmed = await confirmDeveloperFeedRows(env, viewer, eventRows);
  if (!confirmed.length) {
    return json({ ok: false, error: "feed-has-no-exact-rules" }, 400, request, true);
  }

  await refreshGlobalRuleStateCache(env);
  const developer = await buildDeveloperDashboard(env, viewer.id, dashboardOptions);
  const primaryDecision = confirmed[0] || null;

  return json(
    {
      ok: true,
      decision: primaryDecision,
      decisions: confirmed,
      confirmedCount: confirmed.length,
      developer
    },
    200,
    request,
    true
  );
}

async function handleDeveloperRevokeFeed(request, env) {
  const viewer = await requireDeveloper(request, env);
  if (!viewer) {
    return json({ ok: false, error: "developer-required" }, 403, request, true);
  }

  const payload = await readJson(request);
  const dashboardOptions = readDeveloperDashboardOptionsFromPayload(payload);
  const decisionId = String(payload.decisionId || "").trim();
  if (!decisionId) {
    return json({ ok: false, error: "missing-decision-id" }, 400, request, true);
  }

  const existing = await env.DB.prepare(
    "SELECT * FROM developer_global_decisions WHERE id = ? LIMIT 1"
  ).bind(decisionId).first();

  if (!existing) {
    return json({ ok: false, error: "decision-not-found" }, 404, request, true);
  }

  if (!existing.revoked_at) {
    await env.DB.prepare(
      `
        UPDATE developer_global_decisions
        SET
          revoked_at = ?,
          revoked_by_user_id = ?,
          revoke_count = revoke_count + 1
        WHERE id = ?
      `
    ).bind(new Date().toISOString(), viewer.id, decisionId).run();
  }

  const decisionRow = await env.DB.prepare(
    "SELECT * FROM developer_global_decisions WHERE id = ? LIMIT 1"
  ).bind(decisionId).first();

  await refreshGlobalRuleStateCache(env);
  const developer = await buildDeveloperDashboard(env, viewer.id, dashboardOptions);

  return json(
    {
      ok: true,
      decision: serializeDeveloperDecisionRow(decisionRow),
      developer
    },
    200,
    request,
    true
  );
}

async function handleDeveloperDismissFeed(request, env) {
  const viewer = await requireDeveloper(request, env);
  if (!viewer) {
    return json({ ok: false, error: "developer-required" }, 403, request, true);
  }

  const payload = await readJson(request);
  const dashboardOptions = readDeveloperDashboardOptionsFromPayload(payload);
  const eventIds = normalizeDeveloperEventIds(payload);
  if (!eventIds.length) {
    return json({ ok: false, error: "missing-event-id" }, 400, request, true);
  }

  const eventRows = await listDeveloperEventRowsByIds(env, viewer.id, eventIds);
  if (!eventRows.length) {
    return json({ ok: false, error: "feed-not-found" }, 404, request, true);
  }

  const reviews = await dismissDeveloperPendingFeedRows(env, viewer, eventRows);
  if (!reviews.length) {
    return json({ ok: false, error: "feed-not-reviewable" }, 400, request, true);
  }

  const developer = await buildDeveloperDashboard(env, viewer.id, dashboardOptions);

  return json(
    {
      ok: true,
      dismissedCount: reviews.length,
      developer
    },
    200,
    request,
    true
  );
}

async function handleState(request, env, url) {
  const syncKey = String(url.searchParams.get("syncKey") || "").trim();
  if (!syncKey) {
    return json({ ok: false, error: "missing-sync-key" }, 400, request, false);
  }

  await touchSyncKey(env, syncKey, String(url.searchParams.get("deviceId") || "").trim());
  const [globalRuleState, personalState] = await Promise.all([
    buildGlobalRuleState(env),
    buildDerivedStateForSyncKey(env, syncKey)
  ]);

  const mergedHideKeys = new Set(globalRuleState.manualHideKeys);
  for (const key of personalState.manualHideKeys) {
    mergedHideKeys.add(key);
  }

  return json(
    {
      ok: true,
      syncKey,
      manualHideKeys: Array.from(mergedHideKeys),
      manualAllowKeys: personalState.manualAllowKeys,
      templateRules: Array.isArray(globalRuleState.templateRules) ? globalRuleState.templateRules : [],
      repeatSuspiciousHandles: Array.isArray(personalState.repeatSuspiciousHandles) ? personalState.repeatSuspiciousHandles : []
    },
    200,
    request,
    false
  );
}

async function handleAdGif(request, env, url) {
  const payload = {
    syncKey: String(url.searchParams.get("syncKey") || "").trim(),
    deviceId: String(url.searchParams.get("deviceId") || "").trim(),
    eventType: String(url.searchParams.get("eventType") || "").trim() === "ad_reply_hide" ? "ad_reply_hide" : "ad_home_hide",
    source: String(url.searchParams.get("source") || "extension").trim(),
    threadUrl: String(url.searchParams.get("threadUrl") || "").trim(),
    threadStatusId: String(url.searchParams.get("threadStatusId") || "").trim(),
    replyStatusId: String(url.searchParams.get("replyStatusId") || "").trim(),
    replyHandle: String(url.searchParams.get("replyHandle") || "").trim(),
    replyDisplayName: String(url.searchParams.get("replyDisplayName") || "").trim(),
    replyText: String(url.searchParams.get("replyText") || "").trim(),
    normalizedText: String(url.searchParams.get("normalizedText") || "").trim(),
    compactText: "",
    accountProtected: 0
  };

  if (payload.syncKey) {
    await upsertEvent(env, payload);
  }

  return new Response(Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="), (char) => char.charCodeAt(0)), {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, max-age=0",
      ...buildCorsHeaders(request, false)
    }
  });
}

async function handlePostEvent(request, env) {
  const payload = await readJson(request);
  const syncKey = String(payload.syncKey || "").trim();
  const eventType = String(payload.eventType || "").trim();

  if (!syncKey || !eventType) {
    return json({ ok: false, error: "missing-required-fields" }, 400, request, false);
  }

  if (!ALLOWED_EVENT_TYPES.has(eventType)) {
    return json({ ok: false, error: "unsupported-event-type" }, 400, request, false);
  }

  const normalizedEventType = eventType === "ad_hide" ? "ad_home_hide" : eventType;
  const saved = await upsertEvent(env, {
    syncKey,
    deviceId: String(payload.deviceId || "").trim(),
    eventType: normalizedEventType,
    source: String(payload.source || "extension").trim(),
    threadUrl: String(payload.threadUrl || "").trim(),
    threadStatusId: String(payload.threadStatusId || "").trim(),
    replyStatusId: String(payload.replyStatusId || "").trim(),
    replyHandle: String(payload.replyHandle || "").trim(),
    replyDisplayName: String(payload.replyDisplayName || "").trim(),
    replyText: String(payload.replyText || "").trim(),
    normalizedText: String(payload.normalizedText || "").trim(),
    compactText: String(payload.compactText || "").trim(),
    accountProtected: Number(payload.accountProtected || 0) ? 1 : 0
  });

  return json({ ok: true, deduped: saved.deduped }, 200, request, false);
}

async function buildStats(env, userId) {
  const query = userId
    ? `
      SELECT
        SUM(CASE WHEN event_type IN ('ad_home_hide', 'ad_hide') THEN 1 ELSE 0 END) AS ad_home_hide_events,
        SUM(CASE WHEN event_type = 'ad_reply_hide' THEN 1 ELSE 0 END) AS ad_reply_hide_events,
        SUM(CASE WHEN event_type = 'auto_hide' THEN 1 ELSE 0 END) AS auto_hide_events,
        SUM(CASE WHEN event_type = 'manual_hide' THEN 1 ELSE 0 END) AS manual_hide_events,
        SUM(CASE WHEN event_type = 'manual_allow' THEN 1 ELSE 0 END) AS manual_allow_events,
        COUNT(DISTINCT CASE
          WHEN event_type IN ('manual_hide', 'auto_hide') AND COALESCE(reply_handle, '') != '' THEN reply_handle
          ELSE NULL
        END) AS distinct_hidden_handles,
        COUNT(DISTINCT CASE
          WHEN event_type IN ('manual_hide', 'auto_hide') AND COALESCE(normalized_text, '') != '' THEN normalized_text
          ELSE NULL
        END) AS distinct_hidden_phrases
      FROM moderation_events
      WHERE user_id = ?
    `
    : `
      SELECT
        SUM(CASE WHEN event_type IN ('ad_home_hide', 'ad_hide') THEN 1 ELSE 0 END) AS ad_home_hide_events,
        SUM(CASE WHEN event_type = 'ad_reply_hide' THEN 1 ELSE 0 END) AS ad_reply_hide_events,
        SUM(CASE WHEN event_type = 'auto_hide' THEN 1 ELSE 0 END) AS auto_hide_events,
        SUM(CASE WHEN event_type = 'manual_hide' THEN 1 ELSE 0 END) AS manual_hide_events,
        SUM(CASE WHEN event_type = 'manual_allow' THEN 1 ELSE 0 END) AS manual_allow_events,
        COUNT(DISTINCT CASE
          WHEN event_type IN ('manual_hide', 'auto_hide') AND COALESCE(reply_handle, '') != '' THEN reply_handle
          ELSE NULL
        END) AS distinct_hidden_handles,
        COUNT(DISTINCT CASE
          WHEN event_type IN ('manual_hide', 'auto_hide') AND COALESCE(normalized_text, '') != '' THEN normalized_text
          ELSE NULL
        END) AS distinct_hidden_phrases
      FROM moderation_events
    `;
  const row = userId
    ? await env.DB.prepare(query).bind(userId).first()
    : await env.DB.prepare(query).first();

  return {
    adHomeHideEvents: Number(row && row.ad_home_hide_events ? row.ad_home_hide_events : 0),
    adReplyHideEvents: Number(row && row.ad_reply_hide_events ? row.ad_reply_hide_events : 0),
    autoHideEvents: Number(row && row.auto_hide_events ? row.auto_hide_events : 0),
    manualHideEvents: Number(row && row.manual_hide_events ? row.manual_hide_events : 0),
    manualAllowEvents: Number(row && row.manual_allow_events ? row.manual_allow_events : 0),
    distinctHiddenHandles: Number(row && row.distinct_hidden_handles ? row.distinct_hidden_handles : 0),
    distinctHiddenPhrases: Number(row && row.distinct_hidden_phrases ? row.distinct_hidden_phrases : 0)
  };
}

async function buildRecentEvents(env, userId) {
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        id,
        sync_key,
        source,
        event_type,
        account_protected,
        thread_url,
        thread_status_id,
        reply_status_id,
        reply_text,
        normalized_text,
        compact_text,
        reply_handle,
        reply_display_name,
        created_at
      FROM moderation_events
      WHERE user_id = ?
        AND event_type IN ('auto_hide', 'manual_hide', 'manual_allow')
      ORDER BY id DESC
      LIMIT 20
    `
  ).bind(userId).all();

  return results.map((row) => ({
    id: row.id,
    syncKey: row.sync_key,
    source: row.source,
    eventType: row.event_type,
    threadUrl: row.thread_url,
    threadStatusId: row.thread_status_id,
    replyStatusId: row.reply_status_id,
    replyText: row.reply_text,
    normalizedText: row.normalized_text,
    compactText: row.compact_text,
    replyHandle: row.reply_handle,
    replyDisplayName: row.reply_display_name,
    createdAt: row.created_at,
    accountProtected: Number(row.account_protected || 0) === 1
  }));
}

async function buildRecentAdEvents(env, userId) {
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        id,
        sync_key,
        event_type,
        thread_url,
        thread_status_id,
        reply_status_id,
        reply_handle,
        reply_display_name,
        created_at
      FROM moderation_events
      WHERE user_id = ?
        AND event_type IN ('ad_home_hide', 'ad_reply_hide')
      ORDER BY id DESC
      LIMIT 24
    `
  ).bind(userId).all();

  return results.map((row) => ({
    id: row.id,
    syncKey: row.sync_key || "",
    eventType: row.event_type || "",
    threadUrl: row.thread_url || "",
    threadStatusId: row.thread_status_id || "",
    replyStatusId: row.reply_status_id || "",
    replyHandle: row.reply_handle || "",
    replyDisplayName: row.reply_display_name || "",
    createdAt: row.created_at || ""
  }));
}

async function listBoundSyncKeys(env, userId) {
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        TRIM(device_id) AS device_bucket,
        MIN(created_at) AS created_at,
        MAX(updated_at) AS updated_at,
        MAX(last_seen_at) AS last_seen_at
      FROM sync_keys
      WHERE user_id = ?
        AND TRIM(COALESCE(device_id, '')) != ''
        AND TRIM(device_id) NOT LIKE 'device_test_%'
      GROUP BY device_bucket
      ORDER BY MAX(updated_at) DESC
    `
  ).bind(userId).all();

  return results.map((row, index) => ({
    label: `设备 ${index + 1}`,
    deviceId: row.device_bucket,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastSeenAt: row.last_seen_at
  }));
}

async function bindSyncKeyToUser(env, syncKey, userId) {
  if (!syncKey || !userId) {
    return;
  }
  const now = new Date().toISOString();
  const existing = await env.DB.prepare("SELECT sync_key FROM sync_keys WHERE sync_key = ? LIMIT 1").bind(syncKey).first();
  if (existing) {
    await env.DB.prepare(
      "UPDATE sync_keys SET user_id = ?, updated_at = ?, last_seen_at = ? WHERE sync_key = ?"
    ).bind(userId, now, now, syncKey).run();
  } else {
    await env.DB.prepare(
      "INSERT INTO sync_keys (sync_key, user_id, device_id, created_at, updated_at, last_seen_at) VALUES (?, ?, '', ?, ?, ?)"
    ).bind(syncKey, userId, now, now, now).run();
  }
  await env.DB.prepare("UPDATE moderation_events SET user_id = ? WHERE sync_key = ?").bind(userId, syncKey).run();
}

async function buildDerivedStateForSyncKey(env, syncKey) {
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        id,
        source,
        event_type,
        account_protected,
        thread_url,
        thread_status_id,
        reply_status_id,
        reply_text,
        normalized_text,
        compact_text,
        reply_handle,
        reply_display_name,
        created_at
      FROM moderation_events
      WHERE sync_key = ?
      ORDER BY id ASC
    `
  ).bind(syncKey).all();

  const hideKeys = new Set();
  const allowKeys = new Set();
  const repeatHandleHideCounts = new Map();
  const repeatHandleAllowCounts = new Map();
  const repeatHandleCutoff = Date.now() - (REPEAT_HANDLE_WINDOW_HOURS * 60 * 60 * 1000);

  for (const row of results) {
    const keys = buildRowKeys(row);
    const createdAtMs = Date.parse(String(row.created_at || ""));
    const isRecentHandleEvent = Number.isFinite(createdAtMs) && createdAtMs >= repeatHandleCutoff;
    const recentAccountKey = isRecentHandleEvent ? keys.accountKey : "";

    if (row.event_type === "manual_hide" || row.event_type === "auto_hide") {
      if (row.event_type === "manual_hide") {
        addDecisionKeys(hideKeys, keys);
        removeDecisionKeys(allowKeys, keys);
        if (recentAccountKey) {
          repeatHandleHideCounts.set(recentAccountKey, (repeatHandleHideCounts.get(recentAccountKey) || 0) + 1);
        }
      }
      continue;
    }

    if (row.event_type === "manual_allow") {
      addAllowDecisionKeys(allowKeys, keys);
      if (recentAccountKey) {
        repeatHandleAllowCounts.set(recentAccountKey, (repeatHandleAllowCounts.get(recentAccountKey) || 0) + 1);
      }
      if (row.source === "dashboard") {
        removeDecisionKeys(hideKeys, keys);
      } else {
        removeHideDecisionKeysForAllow(hideKeys, keys);
      }
    }
  }

  const repeatSuspiciousHandles = Array.from(repeatHandleHideCounts.entries())
    .filter(([accountKey, hideCount]) => {
      return Boolean(accountKey)
        && hideCount >= REPEAT_HANDLE_MIN_HIDES
        && Number(repeatHandleAllowCounts.get(accountKey) || 0) === 0;
    })
    .map(([accountKey]) => accountKey);

  return {
    manualHideKeys: Array.from(hideKeys),
    manualAllowKeys: Array.from(allowKeys),
    repeatSuspiciousHandles
  };
}

async function buildGlobalRuleState(env) {
  const revision = await getGlobalRuleStateRevision(env);
  const cached = await env.DB.prepare(
    "SELECT last_event_id, decision_signature, state_json FROM global_rule_cache WHERE id = 1 LIMIT 1"
  ).first();

  if (cached
    && Number(cached.last_event_id || 0) === revision.lastEventId
    && String(cached.decision_signature || "") === revision.decisionSignature) {
    try {
      const parsed = JSON.parse(String(cached.state_json || "{}"));
      if (parsed && Array.isArray(parsed.manualHideKeys)) {
        return {
          manualHideKeys: parsed.manualHideKeys,
          templateRules: Array.isArray(parsed.templateRules) ? parsed.templateRules : []
        };
      }
    } catch (error) {
      // Ignore broken cache rows and rebuild below.
    }
  }

  return refreshGlobalRuleStateCache(env, revision);
}

async function refreshGlobalRuleStateCache(env, revision) {
  const nextRevision = revision || await getGlobalRuleStateRevision(env);
  const state = await buildGlobalRuleStateUncached(env);
  const updatedAt = new Date().toISOString();

  await env.DB.prepare(
    `
      INSERT INTO global_rule_cache (id, last_event_id, decision_signature, state_json, updated_at)
      VALUES (1, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        last_event_id = excluded.last_event_id,
        decision_signature = excluded.decision_signature,
        state_json = excluded.state_json,
        updated_at = excluded.updated_at
    `
  ).bind(
    nextRevision.lastEventId,
    nextRevision.decisionSignature,
    JSON.stringify(state),
    updatedAt
  ).run();

  return state;
}

async function getGlobalRuleStateRevision(env) {
  const currentHourBucket = new Date().toISOString().slice(0, 13);
  const [eventRow, decisionRow] = await Promise.all([
    env.DB.prepare(
      `
        SELECT COALESCE(MAX(id), 0) AS last_event_id
        FROM moderation_events
        WHERE event_type IN ('manual_hide', 'manual_allow')
      `
    ).first(),
    env.DB.prepare(
      `
        SELECT
          COUNT(*) AS total_rows,
          COALESCE(SUM(confirm_count), 0) AS confirm_sum,
          COALESCE(SUM(revoke_count), 0) AS revoke_sum,
          COALESCE(MAX(last_confirmed_at), '') AS max_confirmed_at,
          COALESCE(MAX(revoked_at), '') AS max_revoked_at
        FROM developer_global_decisions
      `
    ).first()
  ]);

  return {
    lastEventId: Number(eventRow && eventRow.last_event_id ? eventRow.last_event_id : 0),
    decisionSignature: JSON.stringify({
      totalRows: Number(decisionRow && decisionRow.total_rows ? decisionRow.total_rows : 0),
      confirmSum: Number(decisionRow && decisionRow.confirm_sum ? decisionRow.confirm_sum : 0),
      revokeSum: Number(decisionRow && decisionRow.revoke_sum ? decisionRow.revoke_sum : 0),
      maxConfirmedAt: decisionRow && decisionRow.max_confirmed_at ? decisionRow.max_confirmed_at : "",
      maxRevokedAt: decisionRow && decisionRow.max_revoked_at ? decisionRow.max_revoked_at : "",
      hourBucket: currentHourBucket
    })
  };
}

async function buildGlobalRuleStateUncached(env) {
  const autoGlobalExactConfig = getAutoGlobalExactConfig(env);
  const sharedWindowDays = Math.max(GLOBAL_TEMPLATE_WINDOW_DAYS, autoGlobalExactConfig.windowDays);
  const nowMs = Date.now();
  const templateCutoffMs = nowMs - (GLOBAL_TEMPLATE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const autoExactCutoffMs = nowMs - (autoGlobalExactConfig.windowDays * 24 * 60 * 60 * 1000);
  const windowCutoffIso = new Date(nowMs - (sharedWindowDays * 24 * 60 * 60 * 1000)).toISOString();
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        id,
        sync_key,
        event_type,
        account_protected,
        thread_status_id,
        reply_status_id,
        reply_text,
        normalized_text,
        compact_text,
        reply_handle,
        reply_display_name,
        created_at
      FROM moderation_events
      WHERE event_type IN ('manual_hide', 'manual_allow')
        AND created_at >= ?
      ORDER BY id ASC
    `
  ).bind(windowCutoffIso).all();

  const templateRuleStats = new Map();
  const autoExactKeyStats = new Map();
  const hideKeys = new Set();

  for (const row of results) {
    const createdAtMs = Date.parse(String(row.created_at || ""));
    const inTemplateWindow = Number.isFinite(createdAtMs) ? createdAtMs >= templateCutoffMs : true;
    const inAutoExactWindow = Number.isFinite(createdAtMs) ? createdAtMs >= autoExactCutoffMs : true;

    if (inTemplateWindow) {
      const templateKey = buildTemplateRuleKeyFromRow(row);
      if (templateKey) {
        const current = templateRuleStats.get(templateKey) || {
          hideCount: 0,
          allowCount: 0,
          syncKeys: new Set(),
          normalizedTexts: new Set()
        };

        if (row.event_type === "manual_hide") {
          current.hideCount += 1;
          if (row.sync_key) {
            current.syncKeys.add(row.sync_key);
          }
          const normalizedText = String(row.normalized_text || "").trim() || normalizeRuleText(row.reply_text || "");
          if (normalizedText) {
            current.normalizedTexts.add(normalizedText);
          }
        } else if (row.event_type === "manual_allow") {
          current.allowCount += 1;
        }

        templateRuleStats.set(templateKey, current);
      }
    }

    if (inAutoExactWindow) {
      const keys = buildRowKeys(row);
      const candidateKeys = collectAutoGlobalExactKeys(keys);
      const normalizedHandle = String(row.reply_handle || "").trim().toLowerCase();
      candidateKeys.forEach((key) => {
        const current = autoExactKeyStats.get(key) || {
          hideCount: 0,
          allowCount: 0,
          syncKeys: new Set(),
          handles: new Set()
        };

        if (row.event_type === "manual_hide") {
          current.hideCount += 1;
          if (row.sync_key) {
            current.syncKeys.add(row.sync_key);
          }
          if (normalizedHandle) {
            current.handles.add(normalizedHandle);
          }
        } else if (row.event_type === "manual_allow") {
          current.allowCount += 1;
        }

        autoExactKeyStats.set(key, current);
      });
    }
  }

  const templateRules = [];
  for (const [templateKey, value] of templateRuleStats.entries()) {
    if (
      value.hideCount >= GLOBAL_TEMPLATE_MIN_HIDES
      && value.allowCount === 0
      && value.syncKeys.size >= GLOBAL_TEMPLATE_MIN_SYNC_KEYS
      && value.normalizedTexts.size >= GLOBAL_TEMPLATE_MIN_TEXTS
    ) {
      templateRules.push(templateKey);
    }
  }
  templateRules.sort();

  const revokedDeveloperDecisionRows = await listDeveloperDecisionRows(env, {
    revoked: true,
    limit: 400
  });
  const revokedExactKeys = new Set();
  revokedDeveloperDecisionRows.forEach((row) => {
    const preview = buildDeveloperPreview(row);
    preview.exactKeys.forEach((key) => revokedExactKeys.add(key));
  });

  const autoGlobalExactKeys = [];
  for (const [key, value] of autoExactKeyStats.entries()) {
    const weightedScore = getAutoGlobalExactWeightedScore(value);
    if (
      value.hideCount >= autoGlobalExactConfig.minHides
      && value.allowCount === 0
      && value.syncKeys.size >= autoGlobalExactConfig.minSyncKeys
      && weightedScore >= autoGlobalExactConfig.minScore
      && !revokedExactKeys.has(key)
    ) {
      autoGlobalExactKeys.push(key);
      hideKeys.add(key);
    }
  }
  autoGlobalExactKeys.sort();

  const activeDeveloperDecisionRows = await listDeveloperDecisionRows(env, {
    revoked: false,
    limit: 400
  });
  activeDeveloperDecisionRows.forEach((row) => {
    const preview = buildDeveloperPreview(row);
    preview.exactKeys.forEach((key) => hideKeys.add(key));
  });

  return {
    manualHideKeys: Array.from(hideKeys),
    templateRules
  };
}

function getAutoGlobalExactConfig(env) {
  const minSyncKeys = Math.max(1, Number(env && env.GLOBAL_RULE_MIN_SYNC_KEYS ? env.GLOBAL_RULE_MIN_SYNC_KEYS : 1) || 1);
  const minScore = Math.max(4, Number(env && env.GLOBAL_RULE_MIN_SCORE ? env.GLOBAL_RULE_MIN_SCORE : 4) || 4);
  const windowDays = Math.max(GLOBAL_TEMPLATE_WINDOW_DAYS, Number(env && env.AUTO_GLOBAL_EXACT_WINDOW_DAYS ? env.AUTO_GLOBAL_EXACT_WINDOW_DAYS : AUTO_GLOBAL_EXACT_WINDOW_DAYS) || AUTO_GLOBAL_EXACT_WINDOW_DAYS);
  const minHides = Math.max(2, Number(env && env.AUTO_GLOBAL_EXACT_MIN_HIDES ? env.AUTO_GLOBAL_EXACT_MIN_HIDES : AUTO_GLOBAL_EXACT_MIN_HIDES) || AUTO_GLOBAL_EXACT_MIN_HIDES);
  return {
    minSyncKeys,
    minScore,
    windowDays,
    minHides
  };
}

function collectAutoGlobalExactKeys(keys) {
  if (!keys) {
    return [];
  }

  return Array.from(new Set([
    keys.accountKey,
    keys.displayNameKey,
    keys.textKey,
    keys.compactKey
  ].filter(Boolean)));
}

function getAutoGlobalExactWeightedScore(stats) {
  const source = stats || {};
  return Number(source.hideCount || 0)
    + Number(source.syncKeys ? source.syncKeys.size : 0)
    + Number(source.handles ? source.handles.size : 0);
}

async function upsertEvent(env, payload) {
  await touchSyncKey(env, payload.syncKey, payload.deviceId);
  const userBinding = await env.DB.prepare(
    "SELECT user_id FROM sync_keys WHERE sync_key = ? LIMIT 1"
  ).bind(payload.syncKey).first();

  const eventRow = {
    syncKey: payload.syncKey,
    userId: userBinding && userBinding.user_id ? userBinding.user_id : null,
    deviceId: String(payload.deviceId || "").trim(),
    eventType: String(payload.eventType || "").trim(),
    source: String(payload.source || "extension").trim(),
    threadUrl: String(payload.threadUrl || "").trim(),
    threadStatusId: String(payload.threadStatusId || "").trim(),
    replyStatusId: String(payload.replyStatusId || "").trim(),
    replyHandle: String(payload.replyHandle || "").trim(),
    replyDisplayName: String(payload.replyDisplayName || "").trim(),
    replyText: String(payload.replyText || "").trim(),
    normalizedText: String(payload.normalizedText || "").trim(),
    compactText: String(payload.compactText || "").trim(),
    accountProtected: Number(payload.accountProtected || 0) ? 1 : 0,
    createdAt: new Date().toISOString()
  };

  const existing = await env.DB.prepare(
    `
      SELECT id
      FROM moderation_events
      WHERE
        sync_key = ?
        AND event_type = ?
        AND (
          (? != '' AND reply_status_id = ?)
          OR (? = '' AND ? != '' AND thread_status_id = ? AND COALESCE(normalized_text, '') = ? AND COALESCE(reply_handle, '') = ?)
          OR (? = '' AND ? = '' AND COALESCE(normalized_text, '') = ? AND COALESCE(reply_handle, '') = ?)
        )
      LIMIT 1
    `
  ).bind(
    eventRow.syncKey,
    eventRow.eventType,
    eventRow.replyStatusId,
    eventRow.replyStatusId,
    eventRow.replyStatusId,
    eventRow.threadStatusId,
    eventRow.threadStatusId,
    eventRow.normalizedText,
    eventRow.replyHandle,
    eventRow.replyStatusId,
    eventRow.threadStatusId,
    eventRow.normalizedText,
    eventRow.replyHandle
  ).first();

  if (existing) {
    return { deduped: true };
  }

  await env.DB.prepare(
    `
      INSERT INTO moderation_events (
        sync_key,
        user_id,
        device_id,
        event_type,
        source,
        thread_url,
        thread_status_id,
        reply_status_id,
        reply_handle,
        reply_display_name,
        reply_text,
        normalized_text,
        compact_text,
        account_protected,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).bind(
    eventRow.syncKey,
    eventRow.userId,
    eventRow.deviceId,
    eventRow.eventType,
    eventRow.source,
    eventRow.threadUrl,
    eventRow.threadStatusId,
    eventRow.replyStatusId,
    eventRow.replyHandle,
    eventRow.replyDisplayName,
    eventRow.replyText,
    eventRow.normalizedText,
    eventRow.compactText,
    eventRow.accountProtected,
    eventRow.createdAt
  ).run();

  return { deduped: false };
}

async function touchSyncKey(env, syncKey, deviceId) {
  if (!syncKey) {
    return;
  }
  const now = new Date().toISOString();
  const existing = await env.DB.prepare("SELECT sync_key, user_id FROM sync_keys WHERE sync_key = ? LIMIT 1").bind(syncKey).first();
  if (existing) {
    await env.DB.prepare(
      "UPDATE sync_keys SET device_id = CASE WHEN ? != '' THEN ? ELSE device_id END, updated_at = ?, last_seen_at = ? WHERE sync_key = ?"
    ).bind(deviceId || "", deviceId || "", now, now, syncKey).run();
  } else {
    await env.DB.prepare(
      "INSERT INTO sync_keys (sync_key, user_id, device_id, created_at, updated_at, last_seen_at) VALUES (?, NULL, ?, ?, ?, ?)"
    ).bind(syncKey, deviceId || "", now, now, now).run();
  }
}

async function requireViewer(request, env, required) {
  const sessionId = readCookie(request, SESSION_COOKIE);
  if (!sessionId) {
    return required ? null : null;
  }

  const row = await env.DB.prepare(
    `
      SELECT sessions.id, sessions.user_id, sessions.expires_at, users.email
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.id = ?
      LIMIT 1
    `
  ).bind(sessionId).first();

  if (!row) {
    return null;
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return null;
  }

  return {
    id: row.user_id,
    email: row.email,
    isDeveloper: isDeveloperEmail(env, row.email)
  };
}

async function requireDeveloper(request, env) {
  const viewer = await requireViewer(request, env, true);
  if (!viewer || !viewer.isDeveloper) {
    return null;
  }
  return viewer;
}

async function sendVerificationEmail(env, email, code, options) {
  const developerEmail = Boolean(options && options.developerEmail);
  if (developerEmail && isTruthy(env.ALLOW_DEVELOPER_DEBUG_CODE)) {
    return {
      ok: true,
      debugCode: code,
      developerMode: true
    };
  }

  const endpoint = String(env.EMAIL_SEND_ENDPOINT || "").trim();
  if (!endpoint && String(env.APP_ENV || "").trim() !== "production") {
    return {
      ok: true,
      debugCode: code
    };
  }

  if (!endpoint) {
    return {
      ok: false,
      detail: "missing-email-provider"
    };
  }

  const payload = {
    from: String(env.EMAIL_FROM || "no-reply@web25.local").trim(),
    to: email,
    subject: "web2.5 登录验证码",
    text: `你的 web2.5 登录验证码是 ${code}，10 分钟内有效。`
  };
  const headers = { "Content-Type": "application/json" };
  if (String(env.EMAIL_SEND_TOKEN || "").trim()) {
    headers.Authorization = `Bearer ${String(env.EMAIL_SEND_TOKEN || "").trim()}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  return {
    ok: response.ok,
    detail: response.ok ? "sent" : `status-${response.status}`
  };
}

function generateOtp() {
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  return String(random[0] % 1000000).padStart(6, "0");
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(String(value || ""));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((item) => item.toString(16).padStart(2, "0")).join("");
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "";
  }
  return email;
}

function buildViewerPayload(viewer) {
  return {
    id: viewer.id,
    email: viewer.email,
    isDeveloper: Boolean(viewer.isDeveloper)
  };
}

function normalizeDeveloperEventIds(payload) {
  const rawIds = Array.isArray(payload && payload.eventIds)
    ? payload.eventIds
    : [payload && payload.eventId];

  return Array.from(new Set(
    rawIds
      .map((value) => Number(value || 0))
      .filter((value) => Number.isFinite(value) && value > 0)
  )).slice(0, 100);
}

async function listDeveloperEventRowsByIds(env, userId, eventIds) {
  const safeIds = Array.isArray(eventIds) ? eventIds.filter((value) => Number.isFinite(value) && value > 0) : [];
  if (!safeIds.length) {
    return [];
  }

  const placeholders = safeIds.map(() => "?").join(", ");
  const statement = env.DB.prepare(
    `
      SELECT
        id,
        sync_key,
        user_id,
        thread_url,
        thread_status_id,
        reply_status_id,
        reply_handle,
        reply_display_name,
        reply_text,
        normalized_text,
        compact_text,
        created_at
      FROM moderation_events
      WHERE user_id = ?
        AND event_type = 'manual_hide'
        AND id IN (${placeholders})
    `
  );

  const { results = [] } = await statement.bind(userId, ...safeIds).all();
  const rowMap = new Map(results.map((row) => [Number(row.id || 0), row]));
  return safeIds.map((id) => rowMap.get(id)).filter(Boolean);
}

async function confirmDeveloperFeedRows(env, viewer, eventRows) {
  const decisions = [];
  for (const row of eventRows) {
    const decision = await upsertDeveloperDecisionFromEvent(env, viewer, row);
    if (decision) {
      decisions.push(decision);
    }
  }
  return decisions;
}

async function dismissDeveloperPendingFeedRows(env, viewer, eventRows) {
  const reviews = [];
  for (const row of eventRows) {
    const review = await upsertDeveloperPendingReviewFromEvent(env, viewer, row);
    if (review) {
      reviews.push(review);
    }
  }
  return reviews;
}

async function upsertDeveloperDecisionFromEvent(env, viewer, eventRow) {
  const preview = buildDeveloperPreview(eventRow);
  if (!preview.exactKeys.length || !preview.fingerprint) {
    return null;
  }

  const now = new Date().toISOString();
  const existing = await env.DB.prepare(
    `
      SELECT id
      FROM developer_global_decisions
      WHERE fingerprint = ?
      LIMIT 1
    `
  ).bind(preview.fingerprint).first();

  if (existing) {
    await env.DB.prepare(
      `
        UPDATE developer_global_decisions
        SET
          event_id = ?,
          user_id = ?,
          sync_key = ?,
          thread_url = ?,
          thread_status_id = ?,
          reply_status_id = ?,
          reply_handle = ?,
          reply_display_name = ?,
          reply_text = ?,
          normalized_text = ?,
          compact_text = ?,
          confirm_count = confirm_count + 1,
          last_confirmed_at = ?,
          revoked_at = NULL,
          revoked_by_user_id = NULL
        WHERE id = ?
      `
    ).bind(
      eventRow.id,
      viewer.id,
      eventRow.sync_key || "",
      eventRow.thread_url || "",
      eventRow.thread_status_id || "",
      eventRow.reply_status_id || "",
      eventRow.reply_handle || "",
      eventRow.reply_display_name || "",
      eventRow.reply_text || "",
      eventRow.normalized_text || "",
      eventRow.compact_text || "",
      now,
      existing.id
    ).run();
  } else {
    await env.DB.prepare(
      `
        INSERT INTO developer_global_decisions (
          id,
          fingerprint,
          event_id,
          user_id,
          sync_key,
          thread_url,
          thread_status_id,
          reply_status_id,
          reply_handle,
          reply_display_name,
          reply_text,
          normalized_text,
          compact_text,
          confirm_count,
          revoke_count,
          created_at,
          last_confirmed_at,
          revoked_at,
          revoked_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?, NULL, NULL)
      `
    ).bind(
      crypto.randomUUID(),
      preview.fingerprint,
      eventRow.id,
      viewer.id,
      eventRow.sync_key || "",
      eventRow.thread_url || "",
      eventRow.thread_status_id || "",
      eventRow.reply_status_id || "",
      eventRow.reply_handle || "",
      eventRow.reply_display_name || "",
      eventRow.reply_text || "",
      eventRow.normalized_text || "",
      eventRow.compact_text || "",
      now,
      now
    ).run();
  }

  const decisionRow = await env.DB.prepare(
    "SELECT * FROM developer_global_decisions WHERE fingerprint = ? LIMIT 1"
  ).bind(preview.fingerprint).first();

  await env.DB.prepare(
    "DELETE FROM developer_pending_reviews WHERE user_id = ? AND fingerprint = ?"
  ).bind(viewer.id, preview.fingerprint).run();

  return serializeDeveloperDecisionRow(decisionRow);
}

async function upsertDeveloperPendingReviewFromEvent(env, viewer, eventRow) {
  const preview = buildDeveloperPreview(eventRow);
  if (!preview.exactKeys.length || !preview.fingerprint) {
    return null;
  }

  const now = new Date().toISOString();
  const existing = await env.DB.prepare(
    `
      SELECT id
      FROM developer_pending_reviews
      WHERE user_id = ?
        AND fingerprint = ?
      LIMIT 1
    `
  ).bind(viewer.id, preview.fingerprint).first();

  if (existing) {
    await env.DB.prepare(
      `
        UPDATE developer_pending_reviews
        SET
          event_id = ?,
          user_id = ?,
          sync_key = ?,
          thread_url = ?,
          thread_status_id = ?,
          reply_status_id = ?,
          reply_handle = ?,
          reply_display_name = ?,
          reply_text = ?,
          normalized_text = ?,
          compact_text = ?,
          review_type = 'not_garbage',
          updated_at = ?
        WHERE id = ?
      `
    ).bind(
      eventRow.id,
      viewer.id,
      eventRow.sync_key || "",
      eventRow.thread_url || "",
      eventRow.thread_status_id || "",
      eventRow.reply_status_id || "",
      eventRow.reply_handle || "",
      eventRow.reply_display_name || "",
      eventRow.reply_text || "",
      eventRow.normalized_text || "",
      eventRow.compact_text || "",
      now,
      existing.id
    ).run();
  } else {
    await env.DB.prepare(
      `
        INSERT INTO developer_pending_reviews (
          id,
          fingerprint,
          event_id,
          user_id,
          sync_key,
          thread_url,
          thread_status_id,
          reply_status_id,
          reply_handle,
          reply_display_name,
          reply_text,
          normalized_text,
          compact_text,
          review_type,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'not_garbage', ?, ?)
      `
    ).bind(
      crypto.randomUUID(),
      preview.fingerprint,
      eventRow.id,
      viewer.id,
      eventRow.sync_key || "",
      eventRow.thread_url || "",
      eventRow.thread_status_id || "",
      eventRow.reply_status_id || "",
      eventRow.reply_handle || "",
      eventRow.reply_display_name || "",
      eventRow.reply_text || "",
      eventRow.normalized_text || "",
      eventRow.compact_text || "",
      now,
      now
    ).run();
  }

  return {
    fingerprint: preview.fingerprint,
    eventId: Number(eventRow.id || 0)
  };
}

async function buildDeveloperDashboard(env, userId, options) {
  const dashboardOptions = normalizeDeveloperDashboardOptions(options);
  const [decisionRows, pendingEventRows, pendingReviewRows, statRow] = await Promise.all([
    listDeveloperDecisionRows(env, { limit: 240 }),
    listDeveloperPendingFeedRows(env, userId, 320),
    listDeveloperPendingReviewRows(env, userId, 320),
    env.DB.prepare(
      `
        SELECT
          COALESCE(SUM(confirm_count), 0) AS feed_count,
          COALESCE(SUM(revoke_count), 0) AS revoked_count
        FROM developer_global_decisions
        WHERE user_id = ?
      `
    ).bind(userId).first()
  ]);

  const activeDecisions = [];
  const revokedDecisions = [];
  const decidedEventIds = new Set();
  const activeFingerprints = new Set();
  const reviewedEventIds = new Set();
  const reviewedFingerprints = new Set();

  pendingReviewRows.forEach((row) => {
    const eventId = Number(row && row.event_id ? row.event_id : 0);
    if (eventId) {
      reviewedEventIds.add(eventId);
    }
    const fingerprint = String(row && row.fingerprint ? row.fingerprint : "").trim();
    if (fingerprint) {
      reviewedFingerprints.add(fingerprint);
    }
  });

  decisionRows.forEach((row) => {
    const serialized = serializeDeveloperDecisionRow(row);
    if (serialized.eventId) {
      decidedEventIds.add(serialized.eventId);
    }
    if (serialized.revokedAt) {
      revokedDecisions.push(serialized);
    } else {
      activeDecisions.push(serialized);
      if (serialized.fingerprint) {
        activeFingerprints.add(serialized.fingerprint);
      }
    }
  });

  const seenPendingFingerprints = new Set();
  const pendingFeeds = [];
  pendingEventRows.forEach((row) => {
    if (decidedEventIds.has(Number(row.id || 0))) {
      return;
    }
    if (reviewedEventIds.has(Number(row.id || 0))) {
      return;
    }
    const preview = buildDeveloperPreview(row);
    if (!preview.exactKeys.length || !preview.fingerprint) {
      return;
    }
    if (reviewedFingerprints.has(preview.fingerprint)) {
      return;
    }
    if (activeFingerprints.has(preview.fingerprint) || seenPendingFingerprints.has(preview.fingerprint)) {
      return;
    }
    seenPendingFingerprints.add(preview.fingerprint);
    pendingFeeds.push(serializeDeveloperPendingRow(row, preview));
  });
  const pendingPage = paginateDeveloperItems(
    pendingFeeds,
    dashboardOptions.pendingPage,
    DEVELOPER_PENDING_PAGE_SIZE
  );
  const activeRulePage = paginateDeveloperItems(
    activeDecisions,
    dashboardOptions.rulePage,
    DEVELOPER_RULE_PAGE_SIZE
  );

  return {
    stats: {
      feedCount: Number(statRow && statRow.feed_count ? statRow.feed_count : 0),
      activeRuleCount: activeDecisions.reduce((sum, item) => sum + item.exactKeys.length, 0),
      revokedCount: Number(statRow && statRow.revoked_count ? statRow.revoked_count : 0),
      pendingCount: pendingFeeds.length
    },
    pendingFeeds: pendingPage.items,
    pendingPagination: pendingPage.meta,
    activeRules: activeRulePage.items,
    activeRulePagination: activeRulePage.meta,
    revokedRules: revokedDecisions.slice(0, 10)
  };
}

async function listDeveloperDecisionRows(env, options) {
  const limit = Math.max(1, Math.min(400, Number(options && options.limit ? options.limit : 40) || 40));
  const filter = options && Object.prototype.hasOwnProperty.call(options, "revoked")
    ? (options.revoked ? "WHERE revoked_at IS NOT NULL" : "WHERE revoked_at IS NULL")
    : "";
  const { results = [] } = await env.DB.prepare(
    `
      SELECT *
      FROM developer_global_decisions
      ${filter}
      ORDER BY last_confirmed_at DESC
      LIMIT ?
    `
  ).bind(limit).all();
  return results;
}

async function listDeveloperPendingFeedRows(env, userId, limit) {
  const safeLimit = Math.max(1, Math.min(400, Number(limit || 80) || 80));
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        id,
        sync_key,
        thread_url,
        thread_status_id,
        reply_status_id,
        reply_handle,
        reply_display_name,
        reply_text,
        normalized_text,
        compact_text,
        created_at
      FROM moderation_events
      WHERE user_id = ?
        AND event_type = 'manual_hide'
      ORDER BY id DESC
      LIMIT ?
    `
  ).bind(userId, safeLimit).all();
  return results;
}

async function listDeveloperPendingReviewRows(env, userId, limit) {
  const safeLimit = Math.max(1, Math.min(400, Number(limit || 80) || 80));
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        id,
        fingerprint,
        event_id,
        user_id,
        review_type,
        updated_at
      FROM developer_pending_reviews
      WHERE user_id = ?
        AND review_type = 'not_garbage'
      ORDER BY updated_at DESC
      LIMIT ?
    `
  ).bind(userId, safeLimit).all();
  return results;
}

function serializeDeveloperPendingRow(row, preview) {
  return {
    eventId: Number(row.id || 0),
    syncKey: row.sync_key || "",
    threadUrl: row.thread_url || "",
    threadStatusId: row.thread_status_id || "",
    replyStatusId: row.reply_status_id || "",
    replyHandle: row.reply_handle || "",
    replyDisplayName: row.reply_display_name || "",
    replyText: row.reply_text || "",
    createdAt: row.created_at || "",
    fingerprint: preview.fingerprint,
    exactKeys: preview.exactKeys,
    impactLabel: preview.impactLabel
  };
}

function readDeveloperDashboardOptionsFromSearchParams(searchParams) {
  return normalizeDeveloperDashboardOptions({
    pendingPage: searchParams ? searchParams.get("developerPendingPage") : null,
    rulePage: searchParams ? searchParams.get("developerRulePage") : null
  });
}

function readDeveloperDashboardOptionsFromPayload(payload) {
  const source = payload || {};
  return normalizeDeveloperDashboardOptions({
    pendingPage: source.developerPendingPage || source.pendingPage,
    rulePage: source.developerRulePage || source.rulePage
  });
}

function normalizeDeveloperDashboardOptions(options) {
  const source = options || {};
  return {
    pendingPage: normalizeDeveloperPageNumber(source.pendingPage),
    rulePage: normalizeDeveloperPageNumber(source.rulePage)
  };
}

function normalizeDeveloperPageNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 1) {
    return 1;
  }
  return Math.max(1, Math.min(999, Math.floor(numeric)));
}

function paginateDeveloperItems(items, requestedPage, pageSize) {
  const list = Array.isArray(items) ? items : [];
  const totalItems = list.length;
  const safePageSize = Math.max(1, Number(pageSize || 1) || 1);

  if (!totalItems) {
    return {
      items: [],
      meta: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        pageSize: safePageSize,
        hasPrev: false,
        hasNext: false
      }
    };
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.max(1, Math.min(totalPages, normalizeDeveloperPageNumber(requestedPage)));
  const startIndex = (currentPage - 1) * safePageSize;
  const endIndex = startIndex + safePageSize;

  return {
    items: list.slice(startIndex, endIndex),
    meta: {
      currentPage,
      totalPages,
      totalItems,
      pageSize: safePageSize,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages
    }
  };
}

function serializeDeveloperDecisionRow(row) {
  if (!row) {
    return null;
  }
  const preview = buildDeveloperPreview(row);
  return {
    id: row.id,
    eventId: Number(row.event_id || 0),
    syncKey: row.sync_key || "",
    fingerprint: row.fingerprint || preview.fingerprint,
    threadUrl: row.thread_url || "",
    threadStatusId: row.thread_status_id || "",
    replyStatusId: row.reply_status_id || "",
    replyHandle: row.reply_handle || "",
    replyDisplayName: row.reply_display_name || "",
    replyText: row.reply_text || "",
    createdAt: row.created_at || "",
    lastConfirmedAt: row.last_confirmed_at || "",
    revokedAt: row.revoked_at || "",
    confirmCount: Number(row.confirm_count || 0),
    revokeCount: Number(row.revoke_count || 0),
    exactKeys: preview.exactKeys,
    impactLabel: preview.impactLabel
  };
}

function buildDeveloperPreview(row) {
  const keys = buildRowKeys(row);
  const exactKeys = Array.from(new Set([
    keys.statusKey,
    keys.textKey,
    keys.compactKey
  ].filter(Boolean)));
  const fingerprint = keys.statusKey || keys.compactKey || keys.textKey || "";

  return {
    fingerprint,
    exactKeys,
    impactLabel: exactKeys.length
      ? `会立刻进入全局：${exactKeys.map((key) => describeExactKey(key)).join("、")}`
      : "这条暂时没有可直达全局的精确规则"
  };
}

function describeExactKey(key) {
  if (String(key || "").startsWith("status:")) {
    return "原文状态 ID";
  }
  if (String(key || "").startsWith("compact:")) {
    return "压缩文本";
  }
  if (String(key || "").startsWith("text:")) {
    return "清洗文本";
  }
  return "精确规则";
}

function isDeveloperLoginEnabled(env) {
  return isTruthy(env.ALLOW_DEVELOPER_DEBUG_CODE) && getDeveloperEmails(env).size > 0;
}

function isDeveloperEmail(env, email) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }
  return getDeveloperEmails(env).has(normalized);
}

function getDeveloperEmails(env) {
  return new Set(
    String(env.DEVELOPER_EMAILS || "")
      .split(/[,\n]/g)
      .map((item) => normalizeEmail(item))
      .filter(Boolean)
  );
}

function isTruthy(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function isCredentialedPath(pathname) {
  return pathname.startsWith("/api/auth/")
    || pathname === "/api/me"
    || pathname === "/api/dashboard"
    || pathname === "/api/account/bind-sync-key"
    || pathname === "/api/developer/confirm-feed"
    || pathname === "/api/developer/dismiss-feed"
    || pathname === "/api/developer/revoke-feed";
}

function buildCorsHeaders(request, allowCredentials) {
  const origin = request.headers.get("Origin");
  const headers = new Headers();
  if (allowCredentials) {
    if (origin) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Vary", "Origin");
    }
    headers.set("Access-Control-Allow-Credentials", "true");
  } else {
    headers.set("Access-Control-Allow-Origin", origin || "*");
    headers.set("Vary", "Origin");
  }
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Cache-Control", "no-store, max-age=0");
  return headers;
}

function json(payload, status, request, allowCredentials, extraHeaders) {
  const headers = buildCorsHeaders(request, allowCredentials);
  headers.set("Content-Type", "application/json; charset=utf-8");
  if (extraHeaders) {
    extraHeaders.forEach((value, key) => headers.set(key, value));
  }
  return new Response(JSON.stringify(payload), {
    status,
    headers
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return {};
  }
}

function readCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const parts = raw.split(/;\s*/g);
  for (const part of parts) {
    const index = part.indexOf("=");
    if (index === -1) {
      continue;
    }
    const key = part.slice(0, index).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(index + 1));
    }
  }
  return "";
}

function serializeSessionCookie(sessionId) {
  return `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function normalizeRuleText(text) {
  return String(text || "")
    .normalize("NFKC")
    .replace(ZERO_WIDTH_PATTERN, "")
    .replace(/\r\n?/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function buildCompactRuleText(text) {
  return normalizeRuleText(text)
    .replace(COMPACT_PUNCTUATION_PATTERN, "")
    .replace(/\s+/g, "")
    .replace(EMOJI_PATTERN, "");
}

function handleLooksSuspicious(handle) {
  const normalized = buildCompactRuleText(handle).replace(/^@/, "");
  if (!normalized) {
    return false;
  }

  if (/(?:vx|wx|tg|qq)[a-z0-9_]{2,}/i.test(normalized) || /id[0-9]{4,}/i.test(normalized)) {
    return true;
  }

  const digitCount = (normalized.match(/\d/g) || []).length;
  return digitCount >= 4 || /^[a-z]+[0-9]{3,}$/i.test(normalized);
}

function looksLikeLowInformationBadge(text) {
  const compact = buildCompactRuleText(text);
  if (!compact) {
    return false;
  }

  return compact.length <= 6 && LOW_INFORMATION_BADGE_PATTERNS.some((pattern) => pattern.test(compact));
}

function looksLikeGeoMeetupBait(text) {
  const normalized = normalizeRuleText(text);
  const compact = buildCompactRuleText(text);
  if (!compact || compact.length > 16) {
    return false;
  }

  return GEO_MEETUP_BAIT_PATTERNS.some((pattern) => pattern.test(normalized) || pattern.test(compact));
}

function looksLikeBaitQuestionShape(text) {
  const normalized = normalizeRuleText(text);
  const compact = buildCompactRuleText(text);
  if (!compact || compact.length > 16 || !BAIT_QUESTION_ENDING_PATTERN.test(normalized)) {
    return false;
  }

  return [
    "附近",
    "离得近",
    "同城",
    "线下",
    "看主页",
    "点主页",
    "主页",
    "置顶",
    "简介",
    "资料",
    "签名",
    "自介",
    "id",
    "账号",
    "小号",
    "联系方式",
    "联系",
    "飞机",
    "电报",
    "tg",
    "vx",
    "wx",
    "主人",
    "哥哥",
    "姐姐",
    "弟弟",
    "妹妹",
    "宝贝",
    "搭子",
    "调教",
    "想要",
    "约",
    "上门",
    "见面",
    "单男",
    "破处"
  ].some((term) => compact.includes(term));
}

function findEarliestTemplateSlotIndex(compact, slotDefinition) {
  let earliest = -1;

  slotDefinition.terms.forEach((term) => {
    const index = compact.indexOf(term);
    if (index !== -1 && (earliest === -1 || index < earliest)) {
      earliest = index;
    }
  });

  slotDefinition.patterns.forEach((pattern) => {
    const match = compact.match(pattern);
    if (!match || typeof match.index !== "number") {
      return;
    }
    if (earliest === -1 || match.index < earliest) {
      earliest = match.index;
    }
  });

  return earliest;
}

function buildTemplateRuleAnalysis(text) {
  const normalized = normalizeRuleText(text);
  const compact = buildCompactRuleText(text);
  const innocentPetContext = [
    /主人公/,
    /我家.{0,3}(小狗|狗狗|小猫|猫猫)/,
    /(小狗|狗狗|小猫|猫猫).{0,8}(下班|回家|吃饭|睡觉|散步|遛弯|洗澡|喂饭|狗粮|猫粮)/,
    /(等|接).{0,4}主人.{0,4}(下班|回家)/,
    /(领养|收养|寻狗|寻主|走失|流浪|扩散)/
  ].some((pattern) => pattern.test(normalized) || pattern.test(compact));
  const matches = TEMPLATE_SLOT_DEFINITIONS
    .map((slotDefinition) => {
      if (innocentPetContext && slotDefinition.id === "petplay_owner_request") {
        return {
          id: slotDefinition.id,
          matched: false,
          index: -1
        };
      }
      const index = findEarliestTemplateSlotIndex(compact, slotDefinition);
      return {
        id: slotDefinition.id,
        matched: index !== -1,
        index
      };
    })
    .filter((entry) => entry.matched);

  if (matches.length < 2) {
    return {
      normalized,
      compact,
      templateKey: "",
      slotMask: ""
    };
  }

  const matchedSlots = matches.map((entry) => entry.id).sort();

  return {
    normalized,
    compact,
    slotMask: matchedSlots.join("+"),
    templateKey: "template:" + matchedSlots.join("+")
  };
}

function buildTemplateRuleKeyFromRow(row) {
  if (!row) {
    return "";
  }

  if (Number(row.account_protected || row.accountProtected || 0) === 1 && !shouldBypassProtectedLearning(row)) {
    return "";
  }

  const replyText = String(row.reply_text || row.replyText || row.normalized_text || row.normalizedText || "").trim();
  if (!replyText) {
    return "";
  }

  return buildTemplateRuleAnalysis(replyText).templateKey;
}

function buildAccountKeyFromHandle(handle, protectedAccount) {
  if (protectedAccount) {
    return "";
  }

  const normalized = String(handle || "").trim().toLowerCase();
  return normalized ? "account:" + normalized : "";
}

function displayNameLooksHighRisk(name) {
  const raw = String(name || "");
  const normalized = normalizeRuleText(raw);
  const compact = buildCompactRuleText(raw);
  if (!compact) {
    return false;
  }

  if (HIGH_RISK_DISPLAY_NAME_PATTERNS.some((pattern) => pattern.test(normalized) || pattern.test(compact))) {
    return true;
  }

  const signalCount = ["迷", "催", "春"].reduce((count, token) => {
    return count + (compact.includes(token) ? 1 : 0);
  }, 0);
  const hasRiskBadge = /💊/u.test(raw) || compact.includes("药") || compact.includes("卍");
  return signalCount >= 2 && hasRiskBadge;
}

function displayNameLooksLure(name) {
  const raw = String(name || "");
  const normalized = normalizeRuleText(raw);
  const compact = buildCompactRuleText(raw);
  if (!compact) {
    return false;
  }

  if (displayNameLooksHighRisk(name)) {
    return true;
  }

  if (DISPLAY_NAME_LURE_PATTERNS.some((pattern) => pattern.test(normalized) || pattern.test(compact))) {
    return true;
  }

  const marketingTermCount = DISPLAY_NAME_MARKETING_TERMS.reduce((count, term) => {
    return count + (compact.includes(term) ? 1 : 0);
  }, 0);
  const lureTermCount = ["破处", "小狗", "主人", "搭子", "单男", "约", "撩", "调教", "固炮"].reduce((count, term) => {
    return count + (compact.includes(term) ? 1 : 0);
  }, 0);
  const hasMarketingBadge = /[👉❤️💕💋🥵🤤🍑🍆]/u.test(raw) || compact.includes("ovo");
  return marketingTermCount >= 2
    || lureTermCount >= 2
    || (marketingTermCount + lureTermCount >= 1 && hasMarketingBadge);
}

function buildDisplayNameRiskKey(displayName, protectedAccount) {
  if (protectedAccount || !displayNameLooksLure(displayName)) {
    return "";
  }

  const compact = buildCompactRuleText(displayName);
  return compact ? "display:" + compact.slice(0, 48) : "";
}

function looksLikeShareLinkScam(text) {
  const raw = String(text || "");
  const normalized = normalizeRuleText(raw);
  const compact = buildCompactRuleText(raw);
  if (!compact) {
    return false;
  }

  const hasShareLink = SHARE_LINK_PATTERNS.some((pattern) => pattern.test(normalized) || pattern.test(compact));
  if (!hasShareLink) {
    return false;
  }

  const hasPromoTerm = SHARE_LINK_SCAM_TERMS.some((term) => {
    return normalized.includes(term.toLowerCase()) || compact.includes(buildCompactRuleText(term));
  });
  return hasPromoTerm || compact.length <= 24;
}

function shouldBypassProtectedLearning(row) {
  if (!row || Number(row.account_protected || row.accountProtected || 0) !== 1) {
    return false;
  }

  return displayNameLooksLure(row.reply_display_name || row.replyDisplayName || "")
    || looksLikeShareLinkScam(row.reply_text || row.replyText || "");
}

function collectKeyCandidates(keys) {
  return [
    keys.primaryKey,
    keys.statusKey,
    keys.accountKey,
    keys.displayNameKey,
    keys.textKey,
    keys.compactKey,
    keys.patternKey
  ].filter(Boolean);
}

function buildRowKeys(row) {
  const normalized = String(row.normalized_text || row.normalizedText || "").trim();
  const compact = String(row.compact_text || row.compactText || "").trim();
  const replyText = String(row.reply_text || row.replyText || row.normalized_text || row.normalizedText || "").trim();
  const protectedAccount = Number(row.account_protected || row.accountProtected || 0) === 1;
  const protectedGuardApplies = protectedAccount && !shouldBypassProtectedLearning(row);
  const statusKey = String(row.reply_status_id || row.replyStatusId || "").trim()
    ? "status:" + String(row.reply_status_id || row.replyStatusId || "").trim()
    : "";
  const accountKey = buildAccountKeyFromHandle(row.reply_handle || row.replyHandle || "", protectedAccount);
  const displayNameKey = protectedGuardApplies ? "" : buildDisplayNameRiskKey(row.reply_display_name || row.replyDisplayName || "", false);
  const textKey = protectedGuardApplies ? "" : (normalized ? "text:" + normalized : "");
  const compactKey = protectedGuardApplies ? "" : (compact ? "compact:" + compact : "");
  const geoMeetupBait = protectedGuardApplies ? false : looksLikeGeoMeetupBait(replyText || normalized);
  const baitQuestionShape = protectedGuardApplies ? false : looksLikeBaitQuestionShape(replyText || normalized);
  const lowInformationLureAccount = protectedGuardApplies
    ? false
    : (
      looksLikeLowInformationBadge(replyText || normalized)
      && displayNameLooksLure(row.reply_display_name || row.replyDisplayName || "")
      && handleLooksSuspicious(row.reply_handle || row.replyHandle || "")
    );
  const matchedTerms = protectedGuardApplies
    ? []
    : Array.from(new Set(SIMILARITY_TERMS.filter((term) => normalized.includes(term))));
  const loosePattern = protectedGuardApplies
    ? ""
    : normalized
      .replace(/[^\p{L}\p{N}]+/gu, "")
      .replace(/(有没有|有没|有|没|吗|嘛|呀|啊|呢|哦|啦|哈|个|一个|一下|急需|急找|急|求|蹲|快来|来|谁来|谁|一位|位|的|了|我|你|他|她|它)/g, "");
  const patternKey = protectedGuardApplies
    ? ""
    : (
      geoMeetupBait
        ? "pattern:geo-meetup-bait"
        : (
          baitQuestionShape
            ? "pattern:bait-question-shape"
            : (
              lowInformationLureAccount
                ? "pattern:low-information-lure-account"
                : (matchedTerms.length > 0
                  ? "pattern:" + matchedTerms.join("|")
                  : (loosePattern.length >= 4 ? "pattern:" + loosePattern : ""))
            )
        )
    );
  const primaryKey = protectedGuardApplies
    ? (statusKey || "")
    : (statusKey || accountKey || textKey || compactKey || patternKey || normalized);

  return {
    normalized,
    compact,
    statusKey,
    accountKey,
    displayNameKey,
    textKey,
    compactKey,
    patternKey,
    primaryKey
  };
}

function addDecisionKeys(set, keys) {
  if (keys.primaryKey) {
    set.add(keys.primaryKey);
  }
  if (keys.statusKey) {
    set.add(keys.statusKey);
  }
  if (keys.accountKey) {
    set.add(keys.accountKey);
  }
  if (keys.displayNameKey) {
    set.add(keys.displayNameKey);
  }
  if (keys.textKey) {
    set.add(keys.textKey);
  }
  if (keys.compactKey) {
    set.add(keys.compactKey);
  }
  if (keys.patternKey) {
    set.add(keys.patternKey);
  }
}

function removeDecisionKeys(set, keys) {
  if (keys.primaryKey) {
    set.delete(keys.primaryKey);
  }
  if (keys.statusKey) {
    set.delete(keys.statusKey);
  }
  if (keys.accountKey) {
    set.delete(keys.accountKey);
  }
  if (keys.displayNameKey) {
    set.delete(keys.displayNameKey);
  }
  if (keys.textKey) {
    set.delete(keys.textKey);
  }
  if (keys.compactKey) {
    set.delete(keys.compactKey);
  }
  if (keys.patternKey) {
    set.delete(keys.patternKey);
  }
  if (keys.normalized) {
    set.delete(keys.normalized);
  }
}

function addAllowDecisionKeys(set, keys) {
  if (keys.statusKey) {
    set.add(keys.statusKey);
    return;
  }
  if (keys.primaryKey) {
    set.add(keys.primaryKey);
    return;
  }
  if (keys.textKey) {
    set.add(keys.textKey);
  }
}

function removeHideDecisionKeysForAllow(set, keys) {
  if (keys.statusKey) {
    set.delete(keys.statusKey);
    return;
  }
  if (keys.primaryKey) {
    set.delete(keys.primaryKey);
    return;
  }
  if (keys.textKey) {
    set.delete(keys.textKey);
  }
}
