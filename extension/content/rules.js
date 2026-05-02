(function () {
  const ZERO_WIDTH_PATTERN = /[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0]/g;
  const COMPACT_PUNCTUATION_PATTERN = /[~～`!！?？,，。.、:：;；'"“”‘’()[\]{}<>《》…—\-_=+*\/\\|]/g;
  const EMOJI_PATTERN = /[\u{1F100}-\u{1FAFF}\u2600-\u27BF]/gu;
  const SHORT_REPLY_LIMIT = 12;
  const AUTO_HIDE_THRESHOLD = 5;

  const FLIRTY_MARKERS = [
    "~~",
    "~",
    "～",
    "❤",
    "❤️",
    "💕",
    "💗",
    "💓",
    "💞",
    "💋",
    "😘",
    "😍",
    "🥵",
    "😈",
    "😜",
    "🤤",
    "🍑"
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
    "应该",
    "数据",
    "逻辑",
    "判断",
    "原因",
    "讨论"
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
    "处男",
    "破处",
    "小狗",
    "主人",
    "搭子",
    "单男",
    "男单",
    "约",
    "撩",
    "调教",
    "固炮"
  ];
  const DISPLAY_NAME_MARKETING_TERMS = [
    "免费",
    "免费约",
    "无偿",
    "线下",
    "同城",
    "上门",
    "到家",
    "处男",
    "日泡",
    "破处",
    "单男",
    "男单",
    "固炮",
    "约炮",
    "搭子",
    "调教",
    "主人",
    "小狗",
    "陪聊"
  ];
  const DISPLAY_NAME_LURE_PATTERNS = [
    /找.{0,3}同城.{0,3}(男单|单男)/,
    /同城.{0,3}(男单|单男)/,
    /同城.{0,4}(上门|到家)/,
    /(上门|到家).{0,4}(同城|可约|可聊|服务)/,
    /外男.{0,4}(无偿|免费|约|处|破处)/,
    /处男.{0,4}(免费|无偿|约)/,
    /免费约/,
    /免费.{0,2}破处/,
    /(无偿|无常|无线|无限).{0,2}线下/,
    /线下.{0,2}(无偿|无常|无线|无限)/,
    /(?:男|女).{0,2}无偿/,
    /(线下|同城).{0,3}(约|泡|搭|找|见|聊|日|上门|到家)/,
    /(上门|到家).{0,3}(约|泡|搭|找|见|聊|日)/,
    /日泡/,
    /(破处|约炮|单男|固炮|调教|主人|小狗|搭子)/,
    /(主页|置顶|简介|资料|签名|自介).{0,6}(id|号|账号|小号|入口|联系方式|飞机|电报|tg|vx|wx|群|频道)/,
    /(纸飞机|飞机号|扣扣|企鹅|群号|频道号|频道|群聊)/,
    /(搜|加).{0,3}(id|号|账号|小号|vx|wx|tg|电报|飞机)/
  ];
  const DISPLAY_NAME_STRONG_LURE_PATTERNS = [
    /(男大|女大|男高|女高|大学生|高中生|体育生|健身|肌肉|弟弟|哥哥|姐姐|妹妹|男生|女生|小男|小女).{0,4}(可约|可聊|可撩|可线下|可上门|可到家|可见面)/,
    /(可约|可聊|可撩|可线下|可上门|可到家|可见面).{0,4}(男大|女大|男高|女高|大学生|高中生|体育生|健身|肌肉|弟弟|哥哥|姐姐|妹妹|男生|女生|小男|小女)/,
    /(同城|附近|线下|上门|到家).{0,4}(可约|可聊|可撩|见面|男大|女大|男高|女高|体育生)/,
    /(男大|女大|男高|女高|体育生).{0,4}(接|找|蹲|约|聊|撩)/,
    /(接|找|蹲).{0,3}(男大|女大|男高|女高|体育生)/,
    /可约.{0,4}(私|主页|置顶|简介|资料|id|号|vx|wx|tg)/
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
    "原视频",
    "出处",
    "找到了",
    "一并找到了",
    "完整的在",
    "下了哈",
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
  const CONTACT_PAYLOAD_PATTERNS = [
    /(?:vx|wx|tg|qq)[a-z0-9_-]{4,}/,
    /(纸飞机|飞机号|电报|扣扣|企鹅|群号|频道号).{0,4}[a-z0-9_-]{4,}/
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
  const GEO_RELATIONSHIP_BAIT_PATTERNS = [
    /^(?:找|求|蹲).{0,4}(同城|附近|线下).{0,5}(哥哥|姐姐|弟弟|妹妹|搭子|主人|单男|男大|女大)$/,
    /^(?:同城|附近|线下).{0,5}(找|求|蹲).{0,4}(哥哥|姐姐|弟弟|妹妹|搭子|主人|单男|男大|女大)$/,
    /^(?:找|求|蹲).{0,4}(哥哥|姐姐|弟弟|妹妹|搭子|主人|单男|男大|女大).{0,5}(同城|附近|线下)$/
  ];
  const CIVIC_LANDMARK_NEARBY_TERMS = [
    "天安门",
    "天安门广场",
    "故宫",
    "中南海",
    "人民大会堂",
    "人民英雄纪念碑",
    "毛主席纪念堂",
    "国家博物馆",
    "长城",
    "鸟巢",
    "水立方"
  ];
  const BAIT_QUESTION_ENDING_PATTERN = /(吗|嘛|么|呢|的吗|的嘛|的人吗)$/;
  const ACCOUNT_MENTION_PATTERN = /@[a-z0-9_]{2,20}/ig;
  const EXPLICIT_EROTIC_BAIT_PATTERNS = [
    /(?:来个|求个|找个|蹲个).{0,2}(处男|单男|主人|小狗|搭子)/,
    /(主人|小狗).{0,4}(我听你|听你|任你|都听你)/,
    /(?:她|你|这).{0,3}好涩我不行了/,
    /日过这个骚货/
  ];
  const EROTIC_MENTION_REDIRECT_MARKERS = [
    "人美胸大极品尤物",
    "好涩",
    "真涩",
    "太涩",
    "我不行了",
    "骚货",
    "骚母",
    "日过"
  ];
  const LURE_EMOJI_MARKERS = [
    "👅",
    "💦",
    "🍑",
    "🍆",
    "💋",
    "😘",
    "🥵",
    "🤤",
    "👉",
    "🛁",
    "🐈",
    "🐱",
    "🍒"
  ];
  const SPAM_TEMPLATE_PATTERNS = [
    /主打安全和标准/,
    /舞蹈生.{0,4}会一字(?:马)?/,
    /克制又有力量/,
    /(?:\d{2,3}|一米[五六七八九]).{0,8}身材偏胖.{0,8}喜欢有聊聊.{0,4}香叽/,
    /人美胸大极品尤物/,
    /原视频.{0,8}找到(?:啦|了)?/,
    /出处.{0,8}(找到|一并找到了|也一并找到了)/,
    /完整(?:版)?的.{0,8}(在|下了|链接|这里|这)/,
    /i can totally imagine the alluring moment with some toys/i,
    /alluring moment with some toys/i
  ];
  const DECORATIVE_SLOGAN_TERMS = [
    "柔情",
    "入骨",
    "质感",
    "日常分享",
    "陪伴",
    "解忧",
    "始终都在",
    "淡淡氛围",
    "氛围感",
    "岁岁安稳",
    "温柔",
    "初心",
    "人间烟火",
    "风雅",
    "仪式",
    "分寸",
    "入心",
    "相依",
    "相守",
    "朝夕",
    "安稳",
    "立身"
  ];
  const DECORATIVE_SLOGAN_SYMBOL_PATTERN = /[◪◰❐❖▧╍ꕤ『』「」【】《》・]/u;

  const SLOT_DEFINITIONS = [
    {
      id: "hook",
      weight: 1,
      reason: "slot-hook",
      terms: [
        "在吗",
        "有没有",
        "有吗",
        "有没",
        "真人吗",
        "真人",
        "哥哥",
        "姐姐",
        "弟弟",
        "妹妹",
        "宝贝"
      ],
      patterns: [
        /^有(没)?有/,
        /在吗/,
        /真人[吗嘛]?/
      ]
    },
    {
      id: "meetup",
      weight: 2,
      reason: "slot-meetup",
      terms: [
        "线下",
        "附近",
        "离得近",
        "同城",
        "找下",
        "找我",
        "上门",
        "见面",
        "约",
        "来找"
      ],
      patterns: [
        /同城.{0,3}(约|见|找|聊|来)/,
        /(线下|见面|上门|来找)/
      ]
    },
    {
      id: "relationship_or_erotic",
      weight: 2,
      reason: "slot-relationship-or-erotic",
      terms: [
        "暧昧",
        "陪伴",
        "陪聊",
        "想要",
        "调教",
        "小狗",
        "汪汪",
        "主人",
        "搭子",
        "固定搭子",
        "固炮",
        "单男",
        "处男",
        "破处",
        "约炮",
        "骚",
        "宠你"
      ],
      patterns: [
        /(陪|调教|主人|小狗|搭子|固炮|破处|约炮|骚)/
      ]
    },
    {
      id: "petplay_owner_request",
      weight: 2,
      reason: "slot-petplay-owner-request",
      terms: [
        "求主人",
        "找主人",
        "认主人",
        "当我主人",
        "做我主人",
        "在线等主人",
        "在线找主人"
      ],
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
      weight: 2,
      reason: "slot-diversion",
      terms: [
        "看主页",
        "点主页",
        "主页",
        "置顶",
        "私聊",
        "私我",
        "私信",
        "入口",
        "联系方式",
        "联系",
        "飞机",
        "电报",
        "tg",
        "vx",
        "加我",
        "v我"
      ],
      patterns: [
        /(看|点).{0,2}主页/,
        /主页.{0,4}(见|看|聊|联系|入口|置顶)/,
        /(私聊|私信|私我|联系方式|飞机|电报|tg|vx)/
      ]
    },
    {
      id: "account_redirect",
      weight: 2,
      reason: "slot-account-redirect",
      terms: ACCOUNT_REDIRECT_TERMS,
      patterns: ACCOUNT_REDIRECT_PATTERNS
    },
    {
      id: "benefit_or_offer",
      weight: 1,
      reason: "slot-benefit-or-offer",
      terms: [
        "福利",
        "资源",
        "兼职",
        "报价",
        "免费",
        "套餐",
        "服务",
        "安排",
        "优惠",
        "返现",
        "包养"
      ],
      patterns: [
        /(福利|资源|兼职|报价|免费|套餐|服务|安排|优惠|返现|包养)/
      ]
    }
  ];

  function normalize(text) {
    return String(text || "")
      .normalize("NFKC")
      .replace(ZERO_WIDTH_PATTERN, "")
      .replace(/\r\n?/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function buildCompact(text) {
    return normalize(text)
      .replace(COMPACT_PUNCTUATION_PATTERN, "")
      .replace(/\s+/g, "")
      .replace(EMOJI_PATTERN, "");
  }

  function countMatches(text, terms) {
    let count = 0;
    for (const term of terms) {
      if (text.includes(term)) {
        count += 1;
      }
    }
    return count;
  }

  function containsAny(text, terms) {
    return terms.some(function (term) {
      return text.includes(term);
    });
  }

  function looksLikeCivicLandmarkNearbyQuestion(text) {
    const compact = buildCompact(text);
    if (!compact || compact.length > 18) {
      return false;
    }

    return CIVIC_LANDMARK_NEARBY_TERMS.some(function (term) {
      return new RegExp("^(?:有(?:没)?有|有|求|蹲).{0,2}" + term + "附近(?:的|的吗|吗|嘛|呢|的人|的人吗)?$").test(compact);
    });
  }

  function looksLikeDecorativeSloganBait(text) {
    const raw = String(text || "");
    const compact = buildCompact(raw);
    if (!compact || compact.length < 4 || compact.length > 28) {
      return false;
    }

    if (countMatches(compact, SUBSTANTIVE_MARKERS) >= 2 || countMatches(compact, FINANCE_MARKERS) > 0) {
      return false;
    }

    const termCount = countMatches(compact, DECORATIVE_SLOGAN_TERMS);
    const hasDecorativeShell = DECORATIVE_SLOGAN_SYMBOL_PATTERN.test(raw);
    return termCount >= 2 || (hasDecorativeShell && termCount >= 1);
  }

  function countEmojiMatches(text) {
    return Array.from(String(text || "").matchAll(EMOJI_PATTERN)).length;
  }

  function findEarliestSlotIndex(compact, slotDefinition) {
    let earliest = -1;

    slotDefinition.terms.forEach(function (term) {
      const index = compact.indexOf(term);
      if (index !== -1 && (earliest === -1 || index < earliest)) {
        earliest = index;
      }
    });

    slotDefinition.patterns.forEach(function (pattern) {
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

  function buildTemplateKey(matchedSlots) {
    if (!Array.isArray(matchedSlots) || matchedSlots.length < 2) {
      return "";
    }
    return "template:" + matchedSlots.slice().sort().join("+");
  }

  function analyzeReplyText(text) {
    const raw = String(text || "");
    const normalized = normalize(text);
    const compact = buildCompact(text);
    const hasCivicLandmarkNearbyQuestion = looksLikeCivicLandmarkNearbyQuestion(text);
    const matches = SLOT_DEFINITIONS
      .map(function (slotDefinition) {
        const index = findEarliestSlotIndex(compact, slotDefinition);
        return {
          id: slotDefinition.id,
          reason: slotDefinition.reason,
          weight: slotDefinition.weight,
          matched: index !== -1,
          index: index
        };
      })
      .filter(function (entry) {
        return entry.matched && !(hasCivicLandmarkNearbyQuestion && entry.id === "meetup");
      });

    const matchedSlots = matches.map(function (entry) {
      return entry.id;
    }).sort();

    const orderedSlots = matches
      .slice()
      .sort(function (left, right) {
        if (left.index === right.index) {
          return left.id.localeCompare(right.id);
        }
        return left.index - right.index;
      })
      .map(function (entry) {
        return entry.id;
      });

    const hasFlirtyMarker = FLIRTY_MARKERS.some(function (marker) {
      return normalized.includes(marker) || compact.includes(marker);
    });
    const hasRepeatedPunctuation = /([~～!！?？])\1|[!?？！]{2,}/.test(normalized);
    const hasPromoOpening = /^(dd|滴滴|蹲|求|冲|安排)/.test(compact);
    const emojiCount = countEmojiMatches(raw);
    const payloadText = normalized
      .replace(EMOJI_PATTERN, "")
      .replace(COMPACT_PUNCTUATION_PATTERN, "")
      .replace(/[$￥¥€£]/g, "")
      .replace(/\s+/g, "");
    const hasMinimalTextPayload = emojiCount > 0 && Array.from(payloadText).length <= 1;
    const hasLureEmoji = LURE_EMOJI_MARKERS.some(function (marker) {
      return raw.includes(marker);
    });
    const hasShareLinkScam = looksLikeShareLinkScam(raw);
    const mentionedHandles = Array.from(new Set((normalized.match(ACCOUNT_MENTION_PATTERN) || []).map(function (entry) {
      return String(entry || "").trim().toLowerCase();
    }).filter(Boolean)));
    const hasAccountMention = mentionedHandles.length > 0;
    const hasExternalContactPayload = CONTACT_PAYLOAD_PATTERNS.some(function (pattern) {
      return pattern.test(normalized) || pattern.test(compact);
    });
    const hasLongDigitRun = (compact.match(/\d{5,}/g) || []).some(function (run) {
      return run.length >= 5;
    });
    const hasLowInformationBadge = compact.length > 0
      && compact.length <= 6
      && LOW_INFORMATION_BADGE_PATTERNS.some(function (pattern) {
        return pattern.test(compact);
      });
    const hasFragmentedSymbolicReply = compact.length > 0
      && compact.length <= 4
      && (
        emojiCount >= 2
        || /[%/\\|]/.test(raw)
        || /[\r\n]/.test(raw)
      );
    const hasGeoMeetupBait = compact.length > 0
      && compact.length <= 16
      && !hasCivicLandmarkNearbyQuestion
      && GEO_MEETUP_BAIT_PATTERNS.some(function (pattern) {
        return pattern.test(normalized) || pattern.test(compact);
      });
    const hasGeoRelationshipBait = compact.length > 0
      && compact.length <= 16
      && GEO_RELATIONSHIP_BAIT_PATTERNS.some(function (pattern) {
        return pattern.test(normalized) || pattern.test(compact);
      });
    const hasBaitQuestionShape = compact.length > 0
      && compact.length <= 16
      && BAIT_QUESTION_ENDING_PATTERN.test(normalized)
      && (
        matchedSlots.includes("meetup")
        || matchedSlots.includes("account_redirect")
        || matchedSlots.includes("relationship_or_erotic")
        || (matchedSlots.includes("hook") && matchedSlots.length >= 2)
      );
    const hasExplicitEroticBait = EXPLICIT_EROTIC_BAIT_PATTERNS.some(function (pattern) {
      return pattern.test(normalized) || pattern.test(compact);
    });
    const hasSpamTemplateSignal = SPAM_TEMPLATE_PATTERNS.some(function (pattern) {
      return pattern.test(normalized) || pattern.test(compact);
    });
    const hasDecorativeSloganBait = looksLikeDecorativeSloganBait(raw);
    const hasEroticMentionRedirect = hasAccountMention && (
      hasExplicitEroticBait
      || EROTIC_MENTION_REDIRECT_MARKERS.some(function (term) {
        return normalized.includes(term) || compact.includes(term);
      })
      || matchedSlots.includes("relationship_or_erotic")
      || matchedSlots.includes("meetup")
    );
    const hasMarketingNoise = matchedSlots.length > 0 && (
      compact.length <= SHORT_REPLY_LIMIT
      || hasFlirtyMarker
      || hasRepeatedPunctuation
      || hasPromoOpening
    );

    return {
      normalized: normalized,
      compact: compact,
      matchedSlots: matchedSlots,
      orderedSlots: orderedSlots,
      slotMask: matchedSlots.join("+"),
      templateKey: buildTemplateKey(matchedSlots),
      hasMarketingNoise: hasMarketingNoise,
      emojiCount: emojiCount,
      hasMinimalTextPayload: hasMinimalTextPayload,
      hasLureEmoji: hasLureEmoji,
      hasShareLinkScam: hasShareLinkScam,
      mentionedHandles: mentionedHandles,
      hasAccountMention: hasAccountMention,
      hasExternalContactPayload: hasExternalContactPayload,
      hasLongDigitRun: hasLongDigitRun,
      hasLowInformationBadge: hasLowInformationBadge,
      hasFragmentedSymbolicReply: hasFragmentedSymbolicReply,
      hasCivicLandmarkNearbyQuestion: hasCivicLandmarkNearbyQuestion,
      hasGeoMeetupBait: hasGeoMeetupBait,
      hasGeoRelationshipBait: hasGeoRelationshipBait,
      hasBaitQuestionShape: hasBaitQuestionShape,
      hasExplicitEroticBait: hasExplicitEroticBait,
      hasSpamTemplateSignal: hasSpamTemplateSignal,
      hasDecorativeSloganBait: hasDecorativeSloganBait,
      hasEroticMentionRedirect: hasEroticMentionRedirect
    };
  }

  function handleLooksSuspicious(handle) {
    const normalized = buildCompact(handle).replace(/^@/, "");
    if (!normalized) {
      return false;
    }

    if (/(?:vx|wx|tg|qq)[a-z0-9_]{2,}/i.test(normalized) || /id[0-9]{4,}/i.test(normalized)) {
      return true;
    }

    const digitCount = (normalized.match(/\d/g) || []).length;
    return digitCount >= 4 || /^[a-z]+[0-9]{3,}$/i.test(normalized);
  }

  function displayNameLooksLure(name) {
    const raw = String(name || "");
    const normalized = normalize(raw);
    const compact = buildCompact(raw);
    if (!compact) {
      return false;
    }

    if (displayNameLooksHighRisk(name)) {
      return true;
    }

    if (displayNameLooksStrongLure(name)) {
      return true;
    }

    if (DISPLAY_NAME_LURE_PATTERNS.some(function (pattern) {
      return pattern.test(normalized) || pattern.test(compact);
    })) {
      return true;
    }

    const marketingTermCount = DISPLAY_NAME_MARKETING_TERMS.reduce(function (count, term) {
      return count + (compact.includes(term) ? 1 : 0);
    }, 0);
    const lureTermCount = NAME_LURE_TERMS.reduce(function (count, term) {
      return count + (compact.includes(term) ? 1 : 0);
    }, 0);
    const hasMarketingBadge = /[👉❤️💕💋🥵🤤🍑🍆🌸]/u.test(raw) || compact.includes("ovo");
    return marketingTermCount >= 2
      || lureTermCount >= 2
      || (marketingTermCount + lureTermCount >= 1 && hasMarketingBadge);
  }

  function displayNameLooksStrongLure(name) {
    const raw = String(name || "");
    const normalized = normalize(raw);
    const compact = buildCompact(raw);
    if (!compact) {
      return false;
    }

    return DISPLAY_NAME_STRONG_LURE_PATTERNS.some(function (pattern) {
      return pattern.test(normalized) || pattern.test(compact);
    });
  }

  function displayNameLooksHighRisk(name) {
    const raw = String(name || "");
    const normalized = normalize(raw);
    const compact = buildCompact(raw);
    if (!compact) {
      return false;
    }

    if (HIGH_RISK_DISPLAY_NAME_PATTERNS.some(function (pattern) {
      return pattern.test(normalized) || pattern.test(compact);
    })) {
      return true;
    }

    const signalCount = ["迷", "催", "春"].reduce(function (count, token) {
      return count + (compact.includes(token) ? 1 : 0);
    }, 0);
    const hasRiskBadge = /💊/u.test(raw) || compact.includes("药") || compact.includes("卍");
    return signalCount >= 2 && hasRiskBadge;
  }

  function buildDisplayNameRiskKey(name) {
    if (!displayNameLooksLure(name)) {
      return "";
    }

    const compact = buildCompact(name);
    return compact ? "display:" + compact.slice(0, 48) : "";
  }

  function buildHighRiskDisplayNameKey(name) {
    return buildDisplayNameRiskKey(name);
  }

  function looksLikeShareLinkScam(text) {
    const raw = String(text || "");
    const normalized = normalize(raw);
    const compact = buildCompact(raw);
    if (!compact) {
      return false;
    }

    const hasShareLink = SHARE_LINK_PATTERNS.some(function (pattern) {
      return pattern.test(normalized) || pattern.test(compact);
    });
    if (!hasShareLink) {
      return false;
    }

    const hasPromoTerm = SHARE_LINK_SCAM_TERMS.some(function (term) {
      return normalized.includes(term.toLowerCase()) || compact.includes(buildCompact(term));
    });
    return hasPromoTerm || compact.length <= 24;
  }

  function looksLikeInnocentPetContext(text) {
    const normalized = normalize(text);
    const compact = buildCompact(text);
    if (!compact) {
      return false;
    }

    return [
      /主人公/,
      /我家.{0,3}(小狗|狗狗|小猫|猫猫)/,
      /(小狗|狗狗|小猫|猫猫).{0,8}(下班|回家|吃饭|睡觉|散步|遛弯|洗澡|喂饭|狗粮|猫粮)/,
      /(等|接).{0,4}主人.{0,4}(下班|回家)/,
      /(领养|收养|寻狗|寻主|走失|流浪|扩散)/
    ].some(function (pattern) {
      return pattern.test(normalized) || pattern.test(compact);
    });
  }

  function evaluateReply(replyText, postText, flags) {
    const reply = analyzeReplyText(replyText);
    const postNormalized = buildCompact(postText);
    const compactHandle = buildCompact(flags.handle || "").replace(/^@/, "");
    const hasLongDigitHandle = /\d{6,}/.test(compactHandle) || /^[a-z]{2,}[0-9]{5,}$/i.test(compactHandle);
    const shareLinkScam = looksLikeShareLinkScam(replyText);
    const innocentPetContext = looksLikeInnocentPetContext(replyText);
    const highRiskDisplayName = displayNameLooksHighRisk(flags.displayName || "");
    const strongLureDisplayName = !highRiskDisplayName && displayNameLooksStrongLure(flags.displayName || "");
    const lureDisplayName = !highRiskDisplayName && (strongLureDisplayName || displayNameLooksLure(flags.displayName || ""));
    const suspiciousHandle = handleLooksSuspicious(flags.handle || "");
    const trustedOverride = shareLinkScam || highRiskDisplayName || (lureDisplayName && reply.hasMinimalTextPayload);
    const reasons = [];
    let score = 0;

    if (!reply.normalized) {
      if (highRiskDisplayName || strongLureDisplayName || (lureDisplayName && suspiciousHandle)) {
        const emptyReasons = [];
        if (highRiskDisplayName) {
          emptyReasons.push("high-risk-display-name");
        }
        if (strongLureDisplayName) {
          emptyReasons.push("strong-lure-display-name");
        }
        if (lureDisplayName) {
          emptyReasons.push("lure-display-name");
        }
        if (suspiciousHandle) {
          emptyReasons.push("suspicious-handle");
        }
        emptyReasons.push("empty-reply-from-risky-account");
        return {
          hide: true,
          score: AUTO_HIDE_THRESHOLD + 1,
          reasons: emptyReasons
        };
      }

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

    if (flags.isVerified && !trustedOverride) {
      return {
        hide: false,
        score: -50,
        reasons: ["verified-account"]
      };
    }

    if (flags.isVerified && trustedOverride) {
      reasons.push("verified-override-by-strong-scam-signal");
    }

    SLOT_DEFINITIONS.forEach(function (slotDefinition) {
      if (!reply.matchedSlots.includes(slotDefinition.id)) {
        return;
      }
      score += slotDefinition.weight;
      reasons.push(slotDefinition.reason);
    });

    if (reply.hasCivicLandmarkNearbyQuestion) {
      score -= 2;
      reasons.push("civic-landmark-nearby-context");
    }

    if (reply.hasMarketingNoise) {
      score += 1;
      reasons.push("marketing-noise");
    }

    if (reply.matchedSlots.includes("account_redirect")) {
      score += 2;
      reasons.push("contact-redirect");
    }

    if (flags.templateRuleMatched && reply.templateKey) {
      score += 2;
      reasons.push("template-family-rule");
    }

    if (flags.isRepeatSuspiciousHandle) {
      score += 1;
      reasons.push("repeat-suspicious-handle");
    }

    if (reply.matchedSlots.includes("hook") && reply.matchedSlots.includes("meetup")) {
      score += 1;
      reasons.push("hook-meetup-combo");
    }

    if (shareLinkScam) {
      score += 5;
      reasons.push("share-link-scam");
    }

    if (reply.hasSpamTemplateSignal) {
      score += 4;
      reasons.push("spam-template-signal");
    }

    if (reply.hasExternalContactPayload) {
      score += 2;
      reasons.push("contact-payload");
    }

    if (reply.hasLongDigitRun && (reply.matchedSlots.includes("account_redirect") || reply.hasExternalContactPayload)) {
      score += 1;
      reasons.push("long-contact-number");
    }

    if (reply.hasGeoMeetupBait) {
      score += 2;
      reasons.push("geo-meetup-bait");
    }

    if (reply.hasGeoRelationshipBait) {
      score += 5;
      reasons.push("geo-relationship-bait");
    }

    if (reply.hasExplicitEroticBait) {
      score += 2;
      reasons.push("explicit-erotic-bait");
    }

    if (reply.hasEroticMentionRedirect) {
      score += 3;
      reasons.push("mentioned-account-lure-redirect");
    }

    if (reply.hasBaitQuestionShape) {
      score += 1;
      reasons.push("bait-question-shape");
    }

    if (reply.hasLowInformationBadge && lureDisplayName && suspiciousHandle) {
      score += 2;
      reasons.push("low-information-badge-from-lure-account");
    }

    if (reply.hasFragmentedSymbolicReply && lureDisplayName && suspiciousHandle) {
      score += 2;
      reasons.push("fragmented-symbolic-reply-from-lure-account");
    }

    if (highRiskDisplayName) {
      score += 4;
      reasons.push("high-risk-display-name");
      if (reply.compact.length <= 3) {
        score += 1;
        reasons.push("minimal-reply-from-high-risk-name");
      }
    }

    if (lureDisplayName) {
      score += 2;
      reasons.push("lure-display-name");
    }

    if (strongLureDisplayName && (reply.hasLowInformationBadge || reply.hasFragmentedSymbolicReply || reply.hasMinimalTextPayload)) {
      score += 3;
      reasons.push("strong-lure-display-name-low-info");
    }

    if (lureDisplayName && suspiciousHandle) {
      score += 1;
      reasons.push("risky-account-profile");
    }

    if (reply.matchedSlots.includes("account_redirect") && reply.matchedSlots.includes("benefit_or_offer")) {
      score += 1;
      reasons.push("redirect-offer-combo");
    }

    if (reply.matchedSlots.includes("account_redirect") && reply.matchedSlots.includes("relationship_or_erotic")) {
      score += 1;
      reasons.push("redirect-erotic-combo");
    }

    if (reply.matchedSlots.includes("hook") && reply.matchedSlots.includes("relationship_or_erotic")) {
      score += 1;
      reasons.push("hook-erotic-combo");
    }

    if (reply.hasMinimalTextPayload) {
      score += 1;
      reasons.push("minimal-symbolic-reply");
    }

    if (lureDisplayName && reply.hasMinimalTextPayload) {
      score += 1;
      reasons.push("minimal-reply-from-lure-name");
    }

    if (reply.hasLureEmoji && (lureDisplayName || flags.isRepeatSuspiciousHandle || reply.matchedSlots.length > 0)) {
      score += 1;
      reasons.push("lure-emoji");
    }

    if (reply.hasFragmentedSymbolicReply && suspiciousHandle && reply.emojiCount >= 2) {
      score += 1;
      reasons.push("symbolic-noise-from-suspicious-handle");
    }

    if (reply.hasAccountMention && (reply.hasLureEmoji || reply.hasExplicitEroticBait)) {
      score += 1;
      reasons.push("mentioned-account-bait");
    }

    if (reply.hasSpamTemplateSignal && suspiciousHandle) {
      score += 2;
      reasons.push("spam-template-from-suspicious-handle");
    }

    if (reply.hasSpamTemplateSignal && (reply.hasLureEmoji || reply.emojiCount >= 3)) {
      score += 1;
      reasons.push("spam-template-emoji-noise");
    }

    if (suspiciousHandle && (lureDisplayName || reply.hasMinimalTextPayload || reply.matchedSlots.length > 0)) {
      score += 1;
      reasons.push("suspicious-handle");
    }

    if (hasLongDigitHandle && (lureDisplayName || reply.hasFragmentedSymbolicReply || reply.hasMinimalTextPayload)) {
      score += 1;
      reasons.push("long-digit-handle");
    }

    const substantiveCount = countMatches(reply.compact, SUBSTANTIVE_MARKERS);
    if (reply.compact.length >= 28 && substantiveCount >= 2) {
      score -= 2;
      reasons.push("substantive-reply");
    } else if (reply.compact.length >= 42) {
      score -= 1;
      reasons.push("long-reply");
    }

    const replyLooksFinancial = countMatches(reply.compact, FINANCE_MARKERS) > 0;
    if (replyLooksFinancial && /[0-9]/.test(reply.compact)) {
      score -= 1;
      reasons.push("contains-finance-detail");
    }

    if (postNormalized && replyLooksFinancial && countMatches(postNormalized, FINANCE_MARKERS) > 0) {
      score -= 1;
      reasons.push("financial-context");
    }

    if (innocentPetContext) {
      score -= 3;
      reasons.push("innocent-pet-context");
    }

    return {
      hide: score >= AUTO_HIDE_THRESHOLD,
      score: score,
      reasons: reasons
    };
  }

  window.Web25Rules = {
    analyzeReplyText: analyzeReplyText,
    evaluateReply: evaluateReply,
    normalizeText: normalize,
    handleLooksSuspicious: handleLooksSuspicious,
    displayNameLooksLure: displayNameLooksLure,
    displayNameLooksStrongLure: displayNameLooksStrongLure,
    displayNameLooksHighRisk: displayNameLooksHighRisk,
    buildDisplayNameRiskKey: buildDisplayNameRiskKey,
    buildHighRiskDisplayNameKey: buildHighRiskDisplayNameKey,
    looksLikeShareLinkScam: looksLikeShareLinkScam,
    looksLikeDecorativeSloganBait: looksLikeDecorativeSloganBait,
    looksLikeInnocentPetContext: looksLikeInnocentPetContext
  };
})();
