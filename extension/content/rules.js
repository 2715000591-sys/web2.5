(function () {
  const STRONG_PATTERNS = [
    /有(没)?有离得近/,
    /离得近/,
    /附近有吗/,
    /附近[有吗呀呢]*/,
    /同城.{0,3}(约|见|找|聊|来)/,
    /主人快来领我/,
    /主人来领我/,
    /主人.*领我/,
    /哥哥[,， ]?我想要/,
    /哥哥.*想要/,
    /谁来养我/,
    /我是?真人/,
    /有弟弟线下吗/,
    /有哥哥线下吗/,
    /有哥哥找下吗/,
    /有弟弟找下吗/,
    /有帅弟找下吗/,
    /有帅哥找下吗/,
    /dd.*线下/,
    /dd.*约/,
    /线下约/,
    /约炮/,
    /上门/,
    /来找我/,
    /快来找我/,
    /来领我/,
    /带走我/,
    /小狗.*主人/,
    /求主人/,
    /急找主人/,
    /固定搭子/,
    /蹲一个固定搭子/,
    /有没有单男/,
    /免费破处/,
    /在线等你/,
    /有没有哥哥看上我/,
    /看上我的呀/,
    /有没有联系方式/,
    /想去取精/
  ];

  const LURE_TERMS = [
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
    "搭子",
    "固定搭子",
    "单男",
    "破处",
    "看上我",
    "联系方式",
    "在线等你",
    "取精"
  ];

  const RELATIONSHIP_TERMS = [
    "哥哥",
    "弟弟",
    "帅弟",
    "帅哥",
    "主人"
  ];

  const MEETUP_TERMS = [
    "线下",
    "附近",
    "离得近",
    "同城",
    "找下",
    "找我",
    "上门",
    "私聊",
    "私我",
    "见面",
    "约",
    "带走",
    "来找"
  ];

  const FLIRTY_MARKERS = [
    "~~",
    "～",
    "❤",
    "❤️",
    "😘",
    "😍",
    "💋",
    "🍑"
  ];

  const PETPLAY_TERMS = [
    "小狗",
    "汪汪",
    "主人",
    "抱抱"
  ];

  const SEXUAL_SOLICIT_TERMS = [
    "固定搭子",
    "单男",
    "破处",
    "取精",
    "联系方式",
    "看上我",
    "在线等你"
  ];

  const SUBSTANTIVE_MARKERS = [
    "因为",
    "所以",
    "如果",
    "但是",
    "感觉",
    "问题",
    "趋势",
    "策略",
    "学习",
    "分析",
    "行情",
    "可以",
    "应该"
  ];

  const FINANCE_MARKERS = [
    "btc",
    "eth",
    "行情",
    "趋势",
    "合约",
    "杠杆",
    "点位",
    "止损",
    "交易",
    "大盘",
    "涨",
    "跌"
  ];

  const NAME_LURE_TERMS = [
    "破处",
    "小狗",
    "主人",
    "搭子",
    "单男",
    "约",
    "撩"
  ];

  function countMatches(text, terms) {
    let count = 0;

    for (const term of terms) {
      if (text.includes(term)) {
        count += 1;
      }
    }

    return count;
  }

  function hasStrongPattern(text) {
    return STRONG_PATTERNS.some(function (pattern) {
      return pattern.test(text);
    });
  }

  function containsAny(text, terms) {
    return terms.some(function (term) {
      return text.includes(term);
    });
  }

  function normalize(text) {
    return String(text || "")
      .normalize("NFKC")
      .replace(/[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0]/g, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function handleLooksSuspicious(handle) {
    const normalized = normalize(handle).replace(/^@/, "");
    if (!normalized) {
      return false;
    }

    const digitCount = (normalized.match(/\d/g) || []).length;
    return digitCount >= 4 || /^[a-z]+[0-9]{3,}$/i.test(normalized);
  }

  function displayNameLooksLure(name) {
    const normalized = normalize(name);
    return containsAny(normalized, NAME_LURE_TERMS);
  }

  function evaluateReply(replyText, postText, flags) {
    const reply = normalize(replyText);
    const post = normalize(postText);
    const reasons = [];
    let score = 0;

    if (!reply) {
      return {
        hide: false,
        score: 0,
        reasons: ["empty"]
      };
    }

    if (flags.isFollowed) {
      return {
        hide: false,
        score: -99,
        reasons: ["followed-account"]
      };
    }

    if (flags.isVerified) {
      return {
        hide: false,
        score: -50,
        reasons: ["verified-account"]
      };
    }

    if (hasStrongPattern(reply)) {
      score += 4;
      reasons.push("strong-pattern");
    }

    const lureMatchCount = countMatches(reply, LURE_TERMS);
    if (lureMatchCount >= 2) {
      score += 3;
      reasons.push("multiple-lure-terms");
    } else if (lureMatchCount === 1) {
      score += 1;
      reasons.push("single-lure-term");
    }

    if (countMatches(reply, FLIRTY_MARKERS) > 0) {
      score += 1;
      reasons.push("flirty-marker");
    }

    if (containsAny(reply, RELATIONSHIP_TERMS) && containsAny(reply, MEETUP_TERMS)) {
      score += 3;
      reasons.push("relationship-plus-meetup");
    }

    if (containsAny(reply, PETPLAY_TERMS) && containsAny(reply, RELATIONSHIP_TERMS)) {
      score += 3;
      reasons.push("petplay-lure");
    }

    if (containsAny(reply, PETPLAY_TERMS) && containsAny(reply, SEXUAL_SOLICIT_TERMS)) {
      score += 3;
      reasons.push("petplay-sexual-solicit");
    }

    if (containsAny(reply, SEXUAL_SOLICIT_TERMS)) {
      score += 2;
      reasons.push("sexual-solicit-term");
    }

    if (/^有(没)?有/.test(reply) && containsAny(reply, MEETUP_TERMS.concat(SEXUAL_SOLICIT_TERMS))) {
      score += 2;
      reasons.push("solicit-question");
    }

    if (reply.includes("真人") && containsAny(reply, MEETUP_TERMS)) {
      score += 2;
      reasons.push("real-person-lure");
    }

    if (reply.length <= 12) {
      score += 1;
      reasons.push("short-reply");
    }

    const postLooksFinancial = countMatches(post, FINANCE_MARKERS) > 0;
    const replyLooksFinancial = countMatches(reply, FINANCE_MARKERS) > 0;
    if (postLooksFinancial && !replyLooksFinancial && lureMatchCount > 0) {
      score += 1;
      reasons.push("off-topic-vs-finance-post");
    }

    if (handleLooksSuspicious(flags.handle || "") && (lureMatchCount > 0 || containsAny(reply, SEXUAL_SOLICIT_TERMS) || hasStrongPattern(reply))) {
      score += 1;
      reasons.push("suspicious-handle");
    }

    if (displayNameLooksLure(flags.displayName || "") && (lureMatchCount > 0 || containsAny(reply, SEXUAL_SOLICIT_TERMS) || hasStrongPattern(reply))) {
      score += 1;
      reasons.push("lure-display-name");
    }

    const substantiveCount = countMatches(reply, SUBSTANTIVE_MARKERS);
    if (reply.length >= 28 && substantiveCount >= 2) {
      score -= 2;
      reasons.push("substantive-reply");
    } else if (reply.length >= 42) {
      score -= 1;
      reasons.push("long-reply");
    }

    if (/[0-9]/.test(reply) && replyLooksFinancial) {
      score -= 1;
      reasons.push("contains-finance-detail");
    }

    return {
      hide: score >= 5,
      score: score,
      reasons: reasons
    };
  }

  window.Web25Rules = {
    evaluateReply: evaluateReply,
    normalizeText: normalize,
    handleLooksSuspicious: handleLooksSuspicious,
    displayNameLooksLure: displayNameLooksLure
  };
})();
