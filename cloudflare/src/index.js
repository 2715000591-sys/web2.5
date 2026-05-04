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
const GLOBAL_TEMPLATE_MIN_CONTRIBUTORS = 3;
const GLOBAL_TEMPLATE_MIN_TEXTS = 3;
const AUTO_GLOBAL_EXACT_WINDOW_DAYS = 30;
const AUTO_GLOBAL_EXACT_MIN_HIDES = 2;
const AUTO_GLOBAL_EXACT_MIN_CONTRIBUTORS = 2;
const REPEAT_HANDLE_WINDOW_HOURS = 24;
const REPEAT_HANDLE_MIN_HIDES = 2;
const DEFAULT_USER_PREFERENCES = Object.freeze({
  sidebarControlsEnabled: true,
  blockedTopicTerms: []
});
const DEFAULT_AI_PROVIDER_BASE_URL = "https://api.openai.com/v1";
const AI_MODERATION_TASK_TYPES = Object.freeze({
  HOME_REALTIME_POST: "home_realtime_post",
  REPLY_REALTIME_MODERATION: "reply_realtime_moderation",
  FULL_POST_AUDIT: "full_post_audit"
});
const AI_PROVIDER_ADAPTER_KEYS = Object.freeze({
  OPENAI_COMPATIBLE: "openai_compatible",
  NATIVE_RESERVED: "native_reserved"
});
const AI_PROVIDER_RESPONSE_MODES = Object.freeze({
  RESPONSES_JSON_SCHEMA: "responses_json_schema",
  CHAT_COMPLETIONS_JSON_SCHEMA: "chat_completions_json_schema",
  CHAT_COMPLETIONS_JSON_OBJECT: "chat_completions_json_object",
  CHAT_COMPLETIONS_PROMPT_ONLY: "chat_completions_prompt_only"
});
const AI_PROVIDER_COOLDOWN_STEPS_MS = Object.freeze([30000, 120000, 300000, 600000]);
const AI_PROVIDER_COOLDOWN_JITTER_RATIO = 0.15;
const TIMELINE_POST_STORAGE_TEXT_LIMIT = 20000;
const TIMELINE_POST_STORAGE_LINK_LIMIT = 6000;
const TIMELINE_POST_LIGHT_TEXT_LIMIT = 1800;
const TIMELINE_POST_LIGHT_LINK_LIMIT = 600;
const DEFAULT_USER_AI_SETTINGS = Object.freeze({
  replyAiEnabled: false,
  providerBaseUrl: DEFAULT_AI_PROVIDER_BASE_URL,
  model: "gpt-5.4-mini",
  moderationPrompt: "",
  apiKeyConfigured: false,
  apiKeyLast4: "",
  updatedAt: ""
});
const DEFAULT_SESSION_TTL_DAYS = 30;
const DEFAULT_OTP_MAX_ATTEMPTS = 5;
const DEFAULT_MAX_AUTH_CODES_PER_EMAIL = 6;
const DEFAULT_AI_FEED_MODEL = "gpt-5.4-mini";
const AI_FEED_DEFAULT_LIMIT = 80;
const AI_FEED_RECLASSIFY_LIMIT = 120;
const REPLY_AI_DEFAULT_LIMIT = 24;
const REPLY_AI_RECLASSIFY_LIMIT = 12;
const REPLY_AI_STRIKE_WINDOW_DAYS = 7;
const REPLY_AI_GLOBAL_BLOCK_THRESHOLD = 2;
const REPLY_AI_FAILURE_RETRY_DELAY_MS = 45000;
const REPLY_AI_BATCH_MAX_ITEMS = 8;
const REPLY_AI_TEACHER_REVIEW_MAX_ITEMS = 8;
const REPLY_AI_BATCH_HISTORY_LIMIT = 12;
const REPLY_AI_ALLOW_REUSE_WINDOW_HOURS = 12;
const REPLY_AI_HIDE_REUSE_WINDOW_DAYS = 14;
const REPLY_AI_TEMPLATE_REUSE_WINDOW_HOURS = 72;
const REPLY_AI_ACCOUNT_REUSE_WINDOW_HOURS = 36;
const REPLY_AI_MEMORY_POLICY_VERSION = "reply-ai-policy-2026-05-02-ai-memory-v1";
const REPLY_AI_MEMORY_EXACT_WINDOW_DAYS = 14;
const REPLY_AI_MEMORY_TEMPLATE_WINDOW_DAYS = 3;
const MODERATION_RULE_CANDIDATE_POLICY_VERSION = "moderation-rule-candidates-2026-05-02-v1";
const MODERATION_RULE_CANDIDATE_REBUILD_LIMIT = 5000;
const MODERATION_RULE_CANDIDATE_REFRESH_LIMIT = 2000;
const GLOBAL_RULE_STATE_CACHE_VERSION = "contributor-layering-v2";
const ZERO_WIDTH_PATTERN = /[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0]/g;
const COMPACT_PUNCTUATION_PATTERN = /[~～`!！?？,，。.、:：;；'"“”‘’()[\]{}<>《》…—\-_=+*\/\\|]/g;
const EMOJI_PATTERN = /[\u{1F100}-\u{1FAFF}\u2600-\u27BF\u2B00-\u2BFF]/gu;
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
  "dd",
  "滴滴",
  "会疼人",
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
  "固炮",
  "固泡",
  "泡友",
  "炮友",
  "性友",
  "寻男",
  "寻女",
  "dd",
  "滴滴",
  "会疼人"
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
const SPAM_TEMPLATE_PATTERNS = [
  /主打安全和标准/,
  /舞蹈生.{0,4}会一字(?:马)?/,
  /克制又有力量/,
  /(?:\d{2,3}|一米[五六七八九]).{0,8}身材偏胖.{0,8}喜欢有聊聊.{0,4}香叽/,
  /人美胸大极品尤物/,
  /原视频.{0,8}找到(?:啦|了)?/,
  /出处.{0,8}(找到|一并找到了|也一并找到了)/,
  /完整(?:版)?的.{0,8}(在|下了|链接|这里|这)/,
  /比她好看的没她强.{0,6}比她强的没她好看/,
  /刷了半天(?:的)?x.{0,12}主页.{0,6}能打/,
  /i can totally imagine the alluring moment with some toys/i,
  /alluring moment with some toys/i
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
    terms: ["暧昧", "陪伴", "陪聊", "想要", "调教", "小狗", "汪汪", "主人", "搭子", "固定搭子", "固炮", "固泡", "泡友", "炮友", "性友", "寻男", "寻女", "单男", "处男", "破处", "约炮", "骚", "宠你"],
    patterns: [/(陪|调教|主人|小狗|搭子|固炮|固泡|泡友|炮友|性友|寻男|寻女|破处|约炮|骚)/]
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
  "固泡",
  "泡友",
  "炮友",
  "性友",
  "寻男",
  "寻女",
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
  /(来个|找个|找|求|蹲).{0,4}(真人|dd|滴滴|哥哥|弟弟|姐姐|妹妹).{0,4}(认识|聊|找|私|约|见)?/i,
  /真人.{0,4}(认识|来|聊|找|私|约|见)/,
  /(附近|同城|线下).{0,3}(的)?(来|来聊|来找|找我|找下|私|约|见)/,
  /(来|来聊|来找|找我|找下|私|约|见).{0,3}(附近|同城|线下)/,
  /(附近|同城|线下).{0,4}(dd|滴滴|哥哥|弟弟|姐姐|妹妹)/i,
  /(dd|滴滴|哥哥|弟弟|姐姐|妹妹).{0,4}(附近|同城|线下)/i,
  /(线下|同城).{0,3}(约|泡|搭|找|见|聊|日|上门|到家)/,
  /(上门|到家).{0,3}(约|泡|搭|找|见|聊|日)/,
  /日泡/,
  /(破处|约炮|单男|固炮|固泡|泡友|炮友|性友|寻男|寻女|调教|主人|小狗|搭子)/,
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
  /(看我主页|主页).{0,8}(附近真实约见|真实约见|真实可约|附近约见|线下约见|可约见)/,
  /(每晚|今晚).{0,3}准时.{0,3}(大秀|涩播|色播|直播|开播)/,
  /准时.{0,3}(大秀|涩播|色播)/,
  /(?:月|周|长期)固定/,
  /(寻|找|求|蹲).{0,4}(固定)?(泡友|炮友|固炮|固泡|性友)/,
  /(寻|找|求|蹲).{0,5}(男大|女大|男高|女高|男生|女生|哥哥|弟弟|姐姐|妹妹|单男|男单).{0,5}(泡友|炮友|固炮|固泡|性友)/,
  /(泡友|炮友|固炮|固泡|性友).{0,5}(男大|女大|男高|女高|男生|女生|哥哥|弟弟|姐姐|妹妹|单男|男单)/,
  /(蹲|找|求).{0,3}(一个)?(弟弟|哥哥|姐姐|妹妹)/,
  /可约.{0,4}(私|主页|置顶|简介|资料|id|号|vx|wx|tg)/
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
  "是不是这个",
  "是这个吗",
  "这个吗",
  "就是这个",
  "这个链接",
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
const LOW_INFORMATION_BADGE_PATTERNS = [
  /^(?:new|up|top|dd|hi|hey|ok|go|tg|vx|wx|qq|id|new\d{0,2})$/i,
  /^(?:置顶|顶|冲|滴滴|看看|点我|点这|主页|简介)$/
];
const DECORATIVE_SLOGAN_TERMS = [
  "晨昏",
  "静候",
  "柔意",
  "情愫",
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
  "立身",
  "温存",
  "眉眼",
  "时光赠予",
  "俗世偏爱",
  "缘起",
  "灵魂",
  "不负",
  "相逢",
  "余生",
  "静待",
  "世间",
  "共鸣",
  "三观",
  "不合",
  "同频",
  "知音",
  "岁月",
  "随缘",
  "远离",
  "方可"
];
const DECORATIVE_SLOGAN_SYMBOL_PATTERN = /[\u{13000}-\u{1342F}◪◰❐❖▧╍ꕤ『』「」【】《》・◦﹡ς∘⚜☞❁♪▫༙༚༘༳༗꙳꧆꧇ꧨ]/u;
const POETIC_SPAM_SLOGAN_PATTERNS = [
  /晨昏.{0,4}(静候|柔意|情愫|生情|暗生)/,
  /浅交.{0,4}(深知|知己)/,
  /高质量.{0,4}交友.{0,4}合拍/,
  /交友.{0,4}贵在.{0,4}合拍/,
  /品行.{0,4}相近.{0,4}同行/,
  /拒绝.{0,4}无效.{0,4}寒暄/,
  /烟火.{0,4}相逢/,
  /人间.{0,4}(钟情|柔情)/,
  /人海.{0,4}(擦肩|相逢|逢)/,
  /缘分.{0,4}(引线|牵线|人海|相逢|遇见|逢)/,
  /有缘.{0,4}(自会)?相识/,
  /自会.{0,4}相识/,
  /温柔.{0,4}(漫染|眉眼)/,
  /时光.{0,4}(赠予|柔情)/,
  /遇见.{0,4}(温柔|人间)/,
  /旧城.{0,4}(偶遇|故人)/,
  /晚风.{0,4}(裹着|温柔)/,
  /晚风.{0,4}相逢/,
  /俗世.{0,4}(偏爱|温存)/,
  /缘起.{0,4}(眉眼|温柔)/,
  /一念.{0,4}(恰好|相逢)/,
  /(怡好|恰好|刚好).{0,4}温良友/
];
const GEO_MEETUP_BAIT_PATTERNS = [
  /^(?:有|求|蹲).{0,10}(万达广场附近|附近|离得近|同城|线下).{0,4}(吗|嘛|呢|的嘛|的吗|的么|的人|的人吗)$/,
  /^(?:万达广场附近|附近|离得近|同城|线下).{0,6}(有吗|有人吗|的吗|嘛|吗|么|呢)$/,
  /^(?:有|求|蹲).{0,12}(万达广场附近|附近|离得近|同城|线下).{0,3}(人吗|的人吗|的吗|吗|嘛|呢)$/
];
const GEO_RELATIONSHIP_BAIT_PATTERNS = [
  /^(?:找|求|蹲).{0,4}(同城|附近|线下).{0,5}(哥哥|姐姐|弟弟|妹妹|搭子|主人|单男|男大|女大)$/,
  /^(?:同城|附近|线下).{0,5}(找|求|蹲).{0,4}(哥哥|姐姐|弟弟|妹妹|搭子|主人|单男|男大|女大)$/,
  /^(?:找|求|蹲).{0,4}(哥哥|姐姐|弟弟|妹妹|搭子|主人|单男|男大|女大).{0,5}(同城|附近|线下)$/,
  /^(?:有(?:没)?有|有).{0,3}(单身|温柔|固定|长期|月固定|帅|乖|可爱|宠人|有钱).{0,2}(哥哥|姐姐|弟弟|妹妹)[a-z]{0,3}\d{0,3}$/,
  /^(?:找|求|蹲)(?:个|一个)?.{0,2}(温柔|固定|长期|月固定|帅|乖|可爱|宠人|有钱).{0,2}(哥哥|姐姐|弟弟|妹妹)\d{0,3}$/,
  /^(?:想|找|求|蹲).{0,4}(dd|滴滴).{0,6}(哥哥|弟弟|姐姐|妹妹|疼人)$/,
  /^(?:想|找|求|蹲).{0,4}(会)?疼人.{0,4}(哥哥|弟弟|姐姐|妹妹)$/
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
const PROFILE_CONTACT_PATTERNS = [
  /(?:vx|wx|tg|qq|telegram|电报|飞机|飞機|频道|群|群号|群號|联系方式|聯繫方式|联系我|聯繫我|联系|聯繫)/i,
  /https?:\/\/[^\s<>"']+/i,
  /t\.me\/[^\s<>"']+/i,
  /wa\.me\/[^\s<>"']+/i
];
const REPLY_AI_SAFETY_LABELS = new Set([
  "adult_solicitation",
  "lead_gen_spam",
  "contact_redirect",
  "scam_or_fraud",
  "meaningless_bait",
  "profile_link_risk",
  "global_blocklist"
]);
const REPLY_AI_PROFILE_SIGNAL_LABELS = new Set([
  "contact_keyword",
  "contact_payload",
  "external_link",
  "profile_redirect",
  "suspicious_bio"
]);
const REPLY_AI_AVATAR_EVIDENCE_TAGS = new Set([
  "suspicious_handle",
  "high_risk_display_name",
  "lure_display_name",
  "poetic_low_substance_reply",
  "decorative_low_substance_reply",
  "generic_short_slogan_reply",
  "bilingual_short_slogan_reply",
  "emoji_noise_reply",
  "geo_relationship_bait",
  "spam_template_signal",
  "thin_or_bait_reply",
  "context_detached_reply",
  "avatar_vision_requested",
  "teacher_review_requested"
]);
const REPLY_AI_AVATAR_EVIDENCE_TAG_LIMIT = 12;
let aiFeedSchemaReadyPromise = null;

function shouldTrustProvisionedAiFeedSchema(env) {
  return String(env && env.APP_ENV ? env.APP_ENV : "").trim().toLowerCase() === "production";
}

function buildNonTestModerationEventSql(alias) {
  const prefix = alias ? `${alias}.` : "";
  return `(
    TRIM(COALESCE(${prefix}sync_key, '')) NOT LIKE 'sync_test_%'
    AND TRIM(COALESCE(${prefix}sync_key, '')) NOT LIKE 'sync_dev_test_%'
    AND TRIM(COALESCE(${prefix}device_id, '')) NOT LIKE 'device_test_%'
    AND LOWER(TRIM(COALESCE(${prefix}reply_handle, ''))) NOT IN ('tester', 'tester2', 'devtrash')
    AND TRIM(COALESCE(${prefix}reply_text, '')) NOT IN ('公网同步测试', '公网同步测试二', '测试开发者全局投喂样本')
  )`;
}

function buildNonTestReplyAiItemSql(alias) {
  const prefix = alias ? `${alias}.` : "";
  return `(
    TRIM(COALESCE(${prefix}sync_key, '')) NOT LIKE 'sync_test_%'
    AND TRIM(COALESCE(${prefix}sync_key, '')) NOT LIKE 'sync_dev_test_%'
    AND TRIM(COALESCE(${prefix}device_id, '')) NOT LIKE 'device_test_%'
    AND TRIM(COALESCE(${prefix}device_id, '')) NOT LIKE 'device_eval_%'
    AND TRIM(COALESCE(${prefix}device_id, '')) NOT LIKE 'device_dev_%'
    AND LOWER(TRIM(COALESCE(${prefix}reply_handle, ''))) NOT IN ('tester', 'tester2', 'devtrash')
    AND TRIM(COALESCE(${prefix}reply_text, '')) NOT IN ('公网同步测试', '公网同步测试二', '测试开发者全局投喂样本')
  )`;
}

function buildVisibleDeveloperEventSql(eventAlias) {
  return `(${eventAlias}.id IS NULL OR ${buildNonTestModerationEventSql(eventAlias)})`;
}

function getConfiguredEmailProvider(env) {
  const resendApiKey = String(env.RESEND_API_KEY || "").trim();
  if (resendApiKey) {
    return {
      kind: "resend",
      endpoint: "https://api.resend.com/emails",
      token: resendApiKey
    };
  }

  const endpoint = String(env.EMAIL_SEND_ENDPOINT || "").trim();
  if (!endpoint) {
    return null;
  }

  return {
    kind: "generic",
    endpoint,
    token: String(env.EMAIL_SEND_TOKEN || "").trim()
  };
}

function hasConfiguredEmailProvider(env) {
  return Boolean(getConfiguredEmailProvider(env));
}

function getSessionTtlDays(env) {
  return Math.max(7, Number(env && env.SESSION_TTL_DAYS ? env.SESSION_TTL_DAYS : DEFAULT_SESSION_TTL_DAYS) || DEFAULT_SESSION_TTL_DAYS);
}

function getSessionMaxAgeSeconds(env) {
  return getSessionTtlDays(env) * 24 * 60 * 60;
}

function getOtpMaxAttempts(env) {
  return Math.max(3, Number(env && env.OTP_MAX_ATTEMPTS ? env.OTP_MAX_ATTEMPTS : DEFAULT_OTP_MAX_ATTEMPTS) || DEFAULT_OTP_MAX_ATTEMPTS);
}

function getMaxAuthCodesPerEmail(env) {
  return Math.max(3, Number(env && env.MAX_AUTH_CODES_PER_EMAIL ? env.MAX_AUTH_CODES_PER_EMAIL : DEFAULT_MAX_AUTH_CODES_PER_EMAIL) || DEFAULT_MAX_AUTH_CODES_PER_EMAIL);
}

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
        service: "colorful-toilet-cloud",
        mode: "cloudflare",
        appUrl: String(env.APP_URL || "").trim() || url.origin,
        hasEmailProvider: hasConfiguredEmailProvider(env),
        developerLoginEnabled: isDeveloperLoginEnabled(env),
        publicDebugCodeLoginEnabled: isTruthy(env.ALLOW_PUBLIC_DEBUG_CODE_LOGIN)
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
      true,
      buildSessionRefreshHeaders(request, viewer, env)
    );
  }

  if (request.method === "GET" && url.pathname === "/api/preferences") {
    return handlePreferences(request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/preferences") {
    return handleUpdatePreferences(request, env, ctx);
  }

  if (request.method === "GET" && url.pathname === "/api/ai-settings") {
    return handleGetAiSettings(request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/ai-settings") {
    return handleUpdateAiSettings(request, env, ctx);
  }

  if (request.method === "POST" && url.pathname === "/api/ai-settings/test") {
    return handleTestAiSettings(request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/auth/request-code") {
    return handleRequestCode(request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/auth/verify-code") {
    return handleVerifyCode(request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/auth/logout") {
    return handleLogout(request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/account/bind-sync-key") {
    return handleBindSyncKey(request, env, ctx);
  }

  if (request.method === "GET" && url.pathname === "/api/dashboard") {
    return handleDashboard(request, env, ctx, url);
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

  if (request.method === "GET" && url.pathname === "/api/developer/data-layer-audit") {
    return handleDeveloperDataLayerAudit(request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/developer/backfill-training") {
    return handleDeveloperBackfillTraining(request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/developer/rebuild-rule-candidates") {
    return handleDeveloperRebuildRuleCandidates(request, env);
  }

  if (request.method === "POST" && url.pathname === "/api/developer/reply-ai-routing-probe") {
    return handleDeveloperReplyAiRoutingProbe(request, env);
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

  if (request.method === "POST" && url.pathname === "/api/ai-feed/posts") {
    return handlePostAiFeedPost(request, env, ctx);
  }

  if (request.method === "POST" && url.pathname === "/api/ai-replies/posts") {
    return handlePostAiReplyPost(request, env, ctx);
  }

  if (request.method === "POST" && url.pathname === "/api/ai-replies/batch") {
    return handlePostAiReplyBatch(request, env, ctx);
  }

  const aiFeedDecisionMatch = request.method === "GET"
    ? url.pathname.match(/^\/api\/ai-feed\/posts\/(\d+)\/decision$/)
    : null;
  if (aiFeedDecisionMatch) {
    return handleGetAiFeedPostDecision(request, env, url, Number(aiFeedDecisionMatch[1] || 0));
  }

  if (request.method === "GET" && url.pathname === "/api/ai-feed") {
    return handleGetAiFeed(request, env, url);
  }

  if (request.method === "GET" && url.pathname === "/api/reply-ai") {
    return handleGetReplyAiDashboard(request, env, url);
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
  const response = await env.ASSETS.fetch(rewritten);
  if (!shouldDisableAssetCache(pathname)) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store, max-age=0");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function shouldDisableAssetCache(pathname) {
  return pathname === "/index.html"
    || pathname === "/console.html"
    || pathname === "/landing.js"
    || pathname === "/app.js"
    || pathname === "/styles.css"
    || pathname === "/downloads/latest.json"
    || pathname.startsWith("/downloads/");
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
  const nowIso = now.toISOString();
  await deleteExpiredAuthCodesForEmail(env, email, nowIso);
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
  const createdAt = nowIso;
  const expiresAt = new Date(now.getTime() + Math.max(5, Number(env.OTP_TTL_MINUTES || 10) || 10) * 60 * 1000).toISOString();

  await env.DB.prepare(
    "INSERT INTO auth_codes (id, email, code_hash, created_at, expires_at, used_at, attempt_count) VALUES (?, ?, ?, ?, ?, NULL, 0)"
  ).bind(crypto.randomUUID(), email, codeHash, createdAt, expiresAt).run();
  await trimAuthCodesForEmail(env, email);

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
      publicDebugCodeMode: Boolean(emailResult.publicDebugCodeMode),
      message: emailResult.debugCode
        ? (emailResult.publicDebugCodeMode ? "测试阶段验证码已生成。" : "开发者模式下验证码已生成。")
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

  const nowIso = new Date().toISOString();
  await deleteExpiredAuthCodesForEmail(env, email, nowIso);

  const authRow = await env.DB.prepare(
    "SELECT * FROM auth_codes WHERE email = ? AND used_at IS NULL ORDER BY created_at DESC LIMIT 1"
  ).bind(email).first();

  if (!authRow) {
    return json({ ok: false, error: "code-not-found" }, 400, request, true);
  }

  if (new Date(authRow.expires_at).getTime() < Date.now()) {
    return json({ ok: false, error: "code-expired" }, 400, request, true);
  }

  const otpMaxAttempts = getOtpMaxAttempts(env);
  const currentAttemptCount = Number(authRow.attempt_count || 0);
  if (currentAttemptCount >= otpMaxAttempts) {
    return json(
      {
        ok: false,
        error: "code-attempts-exhausted",
        maxAttempts: otpMaxAttempts
      },
      429,
      request,
      true
    );
  }

  const codeHash = await sha256Hex(code);
  if (codeHash !== String(authRow.code_hash || "")) {
    const nextAttemptCount = currentAttemptCount + 1;
    if (nextAttemptCount >= otpMaxAttempts) {
      await env.DB.prepare(
        "UPDATE auth_codes SET attempt_count = ?, used_at = ? WHERE id = ?"
      ).bind(nextAttemptCount, nowIso, authRow.id).run();
      await trimAuthCodesForEmail(env, email);
      return json(
        {
          ok: false,
          error: "code-attempts-exhausted",
          maxAttempts: otpMaxAttempts
        },
        429,
        request,
        true
      );
    }

    await env.DB.prepare(
      "UPDATE auth_codes SET attempt_count = ? WHERE id = ?"
    ).bind(nextAttemptCount, authRow.id).run();
    return json(
      {
        ok: false,
        error: "code-invalid",
        attemptsRemaining: Math.max(0, otpMaxAttempts - nextAttemptCount)
      },
      400,
      request,
      true
    );
  }

  await env.DB.prepare("UPDATE auth_codes SET used_at = ? WHERE id = ?").bind(nowIso, authRow.id).run();

  let user = await env.DB.prepare("SELECT * FROM users WHERE email = ? LIMIT 1").bind(email).first();
  if (!user) {
    const now = nowIso;
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
  const createdAt = nowIso;
  const expiresAt = new Date(Date.now() + getSessionMaxAgeSeconds(env) * 1000).toISOString();

  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(sessionId, user.id, createdAt, expiresAt).run();
  await trimAuthCodesForEmail(env, email);
  await deleteExpiredSessions(env, nowIso);

  const headers = buildCorsHeaders(request, true);
  headers.set("Set-Cookie", serializeSessionCookie(sessionId, env));

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

async function handleLogout(request, env) {
  const sessionId = readCookie(request, SESSION_COOKIE);
  if (sessionId) {
    await deleteSessionById(env, sessionId);
  }
  const headers = buildCorsHeaders(request, true);
  headers.set("Set-Cookie", clearSessionCookie());
  return json({ ok: true }, 200, request, true, headers);
}

async function handleBindSyncKey(request, env, ctx) {
  const viewer = await requireViewer(request, env, true);
  if (!viewer) {
    return json({ ok: false, error: "unauthorized" }, 401, request, true);
  }

  const payload = await readJson(request);
  const syncKey = String(payload.syncKey || "").trim();
  const deviceId = String(payload.deviceId || "").trim();
  if (!syncKey) {
    return json({ ok: false, error: "missing-sync-key" }, 400, request, true);
  }

  const bindResult = await bindSyncKeyToUser(env, syncKey, viewer.id, {
    deviceId
  });
  if (ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(Promise.all([
      reclassifyRecentTimelinePostsForSyncKey(env, bindResult.syncKey || syncKey),
      reclassifyRecentReplyAiItemsForSyncKey(env, bindResult.syncKey || syncKey)
    ]));
  }

  return json(
    {
      ok: true,
      syncKey: bindResult.syncKey || syncKey,
      deviceId: bindResult.deviceId || "",
      switchedSyncKey: Boolean(bindResult.switchedSyncKey),
      claimedSyncKeys: Number(bindResult.claimedSyncKeys || 0),
      claimedEvents: Number(bindResult.claimedEvents || 0)
    },
    200,
    request,
    true
  );
}

async function handlePreferences(request, env) {
  const viewer = await requireViewer(request, env, true);
  if (!viewer) {
    return json({ ok: false, error: "unauthorized" }, 401, request, true);
  }

  const preferences = await getUserPreferences(env, viewer.id);
  return json({ ok: true, preferences }, 200, request, true, buildSessionRefreshHeaders(request, viewer, env));
}

async function handleUpdatePreferences(request, env, ctx) {
  const viewer = await requireViewer(request, env, true);
  if (!viewer) {
    return json({ ok: false, error: "unauthorized" }, 401, request, true);
  }

  const payload = await readJson(request);
  const hasSidebarControlsEnabled = Object.prototype.hasOwnProperty.call(payload, "sidebarControlsEnabled");
  const hasBlockedTopicTerms = Object.prototype.hasOwnProperty.call(payload, "blockedTopicTerms");
  if (!hasSidebarControlsEnabled && !hasBlockedTopicTerms) {
    return json({ ok: false, error: "missing-preference-patch" }, 400, request, true);
  }

  const preferences = await upsertUserPreferences(env, viewer.id, {
    sidebarControlsEnabled: payload.sidebarControlsEnabled,
    blockedTopicTerms: payload.blockedTopicTerms
  });
  if (ctx && typeof ctx.waitUntil === "function" && hasBlockedTopicTerms) {
    ctx.waitUntil(reclassifyRecentTimelinePostsForUser(env, viewer.id));
  }
  return json({ ok: true, preferences }, 200, request, true, buildSessionRefreshHeaders(request, viewer, env));
}

async function handleGetAiSettings(request, env) {
  const viewer = await requireViewer(request, env, true);
  if (!viewer) {
    return json({ ok: false, error: "unauthorized" }, 401, request, true);
  }

  const settings = await getUserAiSettings(env, viewer.id);
  return json({ ok: true, settings }, 200, request, true, buildSessionRefreshHeaders(request, viewer, env));
}

async function handleUpdateAiSettings(request, env, ctx) {
  const viewer = await requireViewer(request, env, true);
  if (!viewer) {
    return json({ ok: false, error: "unauthorized" }, 401, request, true);
  }

  const payload = await readJson(request);
  const hasPatch = [
    "replyAiEnabled",
    "providerBaseUrl",
    "model",
    "moderationPrompt",
    "apiKey"
  ].some((key) => Object.prototype.hasOwnProperty.call(payload, key));

  if (!hasPatch) {
    return json({ ok: false, error: "missing-ai-settings-patch" }, 400, request, true);
  }

  const patch = {};
  [
    "replyAiEnabled",
    "providerBaseUrl",
    "model",
    "moderationPrompt",
    "apiKey"
  ].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      patch[key] = payload[key];
    }
  });

  try {
    const settings = await upsertUserAiSettings(env, viewer.id, patch);
    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(Promise.all([
        reclassifyRecentTimelinePostsForUser(env, viewer.id),
        reclassifyRecentReplyAiItemsForUser(env, viewer.id)
      ]));
    }
    return json({ ok: true, settings }, 200, request, true, buildSessionRefreshHeaders(request, viewer, env));
  } catch (error) {
    return json(
      {
        ok: false,
        error: error && error.message ? error.message : "save-ai-settings-failed"
      },
      500,
      request,
      true,
      buildSessionRefreshHeaders(request, viewer, env)
    );
  }
}

function normalizeAiProviderTestText(value, fallback, limit) {
  const normalized = String(value === undefined || value === null ? fallback : value).trim();
  return normalized.slice(0, Math.max(1, Number(limit || 1000) || 1000));
}

function buildAiProviderTestItem(sample) {
  const source = sample && typeof sample === "object" ? sample : {};
  return {
    id: 0,
    threadUrl: normalizeAiProviderTestText(source.threadUrl, "https://x.com/example/status/1", 500),
    threadStatusId: normalizeAiProviderTestText(source.threadStatusId, "provider-test-thread", 120),
    replyStatusId: normalizeAiProviderTestText(source.replyStatusId, "provider-test-reply", 120),
    replyHandle: normalizeAiProviderTestText(source.replyHandle, "wx1234567890", 80),
    replyDisplayName: normalizeAiProviderTestText(source.replyDisplayName, "同城免费约", 120),
    replyText: normalizeAiProviderTestText(source.replyText, "主页置顶看id", 1200),
    mainPostText: normalizeAiProviderTestText(source.mainPostText, "这是一条 AI 接入连通性测试样本，不会写入数据库。", 1800),
    accountProtected: source.accountProtected === true,
    avatarImageUrl: normalizeReplyAiAvatarImageUrl(source.avatarImageUrl || ""),
    avatarAltText: normalizeAiProviderTestText(source.avatarAltText, "", 160),
    avatarEvidenceTags: normalizeReplyAiStringList(
      source.avatarEvidenceTags || [],
      REPLY_AI_AVATAR_EVIDENCE_TAGS,
      REPLY_AI_AVATAR_EVIDENCE_TAG_LIMIT
    ),
    avatarFetchStatus: normalizeReplyAiAvatarFetchStatus(source.avatarFetchStatus || "not_requested"),
    avatarVisionRequested: source.avatarVisionRequested === true || Number(source.avatarVisionRequested || 0) === 1,
    profilePath: normalizeAiProviderTestText(source.profilePath, "/wx1234567890", 160),
    profileBioText: normalizeAiProviderTestText(source.profileBioText, "联系方式看主页 vx", 1200),
    profileSignalTags: normalizeReplyAiStringList(
      source.profileSignalTags || ["contact_keyword", "profile_redirect"],
      REPLY_AI_PROFILE_SIGNAL_LABELS,
      8
    ),
    profileLinks: normalizeReplyAiProfileLinks(source.profileLinks || []),
    profileFetchStatus: normalizeReplyAiProfileFetchStatus(source.profileFetchStatus || "ready")
  };
}

function normalizeAiProviderTestError(error) {
  const message = error && error.message ? String(error.message) : String(error || "");
  const statusMatch = message.match(/ai-provider-status-(\d+)/i);
  if (statusMatch) {
    return `ai-provider-status-${statusMatch[1]}`;
  }
  if (/ai-provider-invalid-json/i.test(message)) {
    return "ai-provider-invalid-json";
  }
  if (/ai-provider-empty-output/i.test(message)) {
    return "ai-provider-empty-output";
  }
  if (/ai-provider-adapter-not-implemented/i.test(message)) {
    return "ai-provider-adapter-not-implemented";
  }
  return "ai-provider-test-failed";
}

async function handleTestAiSettings(request, env) {
  const viewer = await requireViewer(request, env, true);
  if (!viewer) {
    return json({ ok: false, error: "unauthorized" }, 401, request, true);
  }

  const payload = await readJson(request);
  const testItem = buildAiProviderTestItem(payload && payload.sample);
  const settings = await getUserAiSettingsWithSecret(env, viewer.id);
  if (!String(settings && settings.apiKey ? settings.apiKey : "").trim()) {
    return json({ ok: false, error: "missing-ai-api-key" }, 400, request, true, buildSessionRefreshHeaders(request, viewer, env));
  }

  const startedAt = Date.now();
  try {
    const response = await requestAiModerationTaskFromProvider(buildAiModerationTask({
      taskType: AI_MODERATION_TASK_TYPES.REPLY_REALTIME_MODERATION,
      providerConfig: settings,
      schemaName: "reply_moderation_provider_test",
      responseSchema: buildReplyAiDecisionSchema(),
      developerPrompt: buildReplyAiProviderPrompt(settings, { isBatch: false }),
      userPayloadText: JSON.stringify(buildReplyAiProviderInputItem("provider-test", testItem, null)),
      metadata: {
        reasoningEffort: "low"
      }
    }));
    const decision = normalizeReplyAiDecision(response.parsed, response.model, response.responseMeta);
    return json(
      {
        ok: true,
        test: {
          status: decision.status,
          action: decision.action,
          confidence: decision.confidence,
          matchedSafetyLabels: decision.matchedSafetyLabels,
          matchedProfileSignals: decision.matchedProfileSignals,
          reasonShort: decision.reasonShort,
          model: decision.model || normalizeAiModel(settings.model),
          providerBaseUrl: normalizeAiProviderBaseUrl(settings.providerBaseUrl),
          responseMode: decision.rawResponseJson && decision.rawResponseJson.responseMode ? decision.rawResponseJson.responseMode : "",
          latencyMs: Math.max(0, Date.now() - startedAt)
        }
      },
      200,
      request,
      true,
      buildSessionRefreshHeaders(request, viewer, env)
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: normalizeAiProviderTestError(error)
      },
      502,
      request,
      true,
      buildSessionRefreshHeaders(request, viewer, env)
    );
  }
}

async function handleDashboard(request, env, ctx, url) {
  const viewer = await requireViewer(request, env, true);
  if (!viewer) {
    return json({ ok: false, error: "unauthorized" }, 401, request, true);
  }

  const syncKey = String(url.searchParams.get("syncKey") || "").trim();
  const deviceId = String(url.searchParams.get("deviceId") || "").trim();
  let activeSyncKey = syncKey;
  if (syncKey) {
    const bindResult = await bindSyncKeyToUser(env, syncKey, viewer.id, {
      deviceId
    });
    activeSyncKey = String(bindResult && bindResult.syncKey ? bindResult.syncKey : syncKey).trim();
    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(Promise.all([
        reclassifyRecentTimelinePostsForSyncKey(env, activeSyncKey || syncKey),
        reclassifyRecentReplyAiItemsForSyncKey(env, activeSyncKey || syncKey)
      ]));
    }
  } else if (deviceId) {
    await claimAnonymousDeviceActivityToUser(env, deviceId, viewer.id);
  }

  const [globalStats, personalStats, skippedStats, recent, adEvents, bindings, replyAi, activeBinding] = await Promise.all([
    buildStats(env, null),
    buildStats(env, viewer.id),
    buildSkippedStats(env, viewer.id),
    buildRecentEvents(env, viewer.id),
    buildRecentAdEvents(env, viewer.id),
    listBoundSyncKeys(env, viewer.id),
    buildReplyAiDashboardPayload(env, viewer.id),
    resolveActiveBindingForUser(env, viewer.id, {
      syncKey: activeSyncKey,
      deviceId
    })
  ]);
  const preferences = await getUserPreferences(env, viewer.id);

  return json(
    {
      ok: true,
      viewer: buildViewerPayload(viewer),
      globalStats,
      personalStats,
      skippedStats,
      recent,
      adEvents,
      bindings,
      activeBinding,
      preferences,
      replyAi,
      developer: null
    },
    200,
    request,
    true,
    buildSessionRefreshHeaders(request, viewer, env)
  );
}

async function handlePostAiFeedPost(request, env, ctx) {
  await ensureAiFeedSchema(env);
  const payload = normalizeAiPostSnapshotPayload(await readJson(request));
  if (!payload.syncKey || !payload.deviceId) {
    return json({ ok: false, error: "missing-sync-identity" }, 400, request, false);
  }

  if (!payload.statusId && !payload.postText && !payload.authorHandle && !payload.authorDisplayName) {
    return json({ ok: false, error: "missing-post-identity" }, 400, request, false);
  }

  const saved = await upsertTimelinePost(env, payload);
  const existingDecision = saved.postId
    ? await getTimelineAiDecisionByPostId(env, saved.postId)
    : null;
  if (
    saved.postId
    && ctx
    && typeof ctx.waitUntil === "function"
    && (!saved.deduped || !existingDecision || !isFinalAiDecisionStatus(existingDecision.status))
  ) {
    ctx.waitUntil(classifyTimelinePost(env, saved.postId));
  }

  return json(
    {
      ok: true,
      accepted: true,
      deduped: Boolean(saved.deduped),
      postId: Number(saved.postId || 0),
      decision: buildTimelineAiDecisionPayload(saved.postId, existingDecision)
    },
    200,
    request,
    false
  );
}

async function handlePostAiReplyPost(request, env, ctx) {
  await ensureAiFeedSchema(env);
  const payload = normalizeReplyAiPayload(await readJson(request));
  if (!payload.syncKey || !payload.deviceId) {
    return json({ ok: false, error: "missing-sync-identity" }, 400, request, false);
  }

  if (!payload.replyStatusId && !payload.replyText && !payload.replyHandle && !payload.replyDisplayName) {
    return json({ ok: false, error: "missing-reply-identity" }, 400, request, false);
  }

  const saved = await upsertReplyAiItem(env, payload);
  const existingDecision = saved.itemId
    ? await getReplyAiResultByItemId(env, saved.itemId)
    : null;
  if (saved.itemId && !existingDecision) {
    await upsertReplyAiResult(env, saved.itemId, buildReplyAiPendingDecision());
  }
  const decision = saved.itemId && (!saved.deduped || !existingDecision || !isFinalReplyAiDecisionStatus(existingDecision.status) || shouldRetryReplyAiDecision(existingDecision))
    ? await classifyReplyAiItem(env, saved.itemId, { ctx, deferTeacherReview: true })
    : existingDecision;

  return json(
    {
      ok: true,
      accepted: true,
      deduped: Boolean(saved.deduped),
      itemId: Number(saved.itemId || 0),
      decision: buildReplyAiDecisionPayload(saved.itemId, decision)
    },
    200,
    request,
    false
  );
}

async function handlePostAiReplyBatch(request, env, ctx) {
  await ensureAiFeedSchema(env);
  const payload = normalizeReplyAiBatchPayload(await readJson(request));
  if (!payload.syncKey || !payload.deviceId) {
    return json({ ok: false, error: "missing-sync-identity" }, 400, request, false);
  }

  if (!Array.isArray(payload.items) || !payload.items.length) {
    return json({ ok: false, error: "missing-batch-items" }, 400, request, false);
  }

  const pendingEntries = [];
  const responseItems = [];

  for (const item of payload.items) {
    const hasReplyIdentity = Boolean(item.replyStatusId || item.replyText || item.replyHandle || item.replyDisplayName);
    if (!hasReplyIdentity) {
      responseItems.push({
        clientItemId: item.clientItemId,
        itemId: 0,
        deduped: false,
        decision: buildReplyAiDecisionPayload(0, buildDefaultReplyAiDecision({
          decisionLayer: "failed",
          reasonShort: "回复信息不足",
          status: "failed"
        }))
      });
      continue;
    }

    const saved = await upsertReplyAiItem(env, item);
    const existingDecision = saved.itemId
      ? await getReplyAiResultByItemId(env, saved.itemId)
      : null;
    if (saved.itemId && !existingDecision) {
      await upsertReplyAiResult(env, saved.itemId, buildReplyAiPendingDecision());
    }
    if (saved.itemId && existingDecision && isFinalReplyAiDecisionStatus(existingDecision.status) && !shouldRetryReplyAiDecision(existingDecision)) {
      responseItems.push({
        clientItemId: item.clientItemId,
        itemId: Number(saved.itemId || 0),
        deduped: Boolean(saved.deduped),
        decision: buildReplyAiDecisionPayload(saved.itemId, existingDecision)
      });
      continue;
    }

    pendingEntries.push({
      clientItemId: item.clientItemId,
      itemId: Number(saved.itemId || 0),
      deduped: Boolean(saved.deduped)
    });
  }

  const classified = pendingEntries.length
    ? await classifyReplyAiItemEntries(env, pendingEntries, { ctx, deferTeacherReview: true })
    : new Map();

  pendingEntries.forEach((entry) => {
    responseItems.push({
      clientItemId: entry.clientItemId,
      itemId: Number(entry.itemId || 0),
      deduped: Boolean(entry.deduped),
      decision: buildReplyAiDecisionPayload(entry.itemId, classified.get(entry.clientItemId) || buildReplyAiNotFoundDecision())
    });
  });

  return json(
    {
      ok: true,
      accepted: true,
      items: responseItems
    },
    200,
    request,
    false
  );
}

async function handleGetAiFeedPostDecision(request, env, url, postId) {
  await ensureAiFeedSchema(env);
  const normalizedPostId = Number(postId || 0);
  const syncKey = String(url.searchParams.get("syncKey") || "").trim();
  const deviceId = String(url.searchParams.get("deviceId") || "").trim();
  if (!normalizedPostId || !syncKey) {
    return json({ ok: false, error: "missing-post-identity" }, 400, request, false);
  }

  const postRow = await getTimelinePostById(env, normalizedPostId);
  if (!postRow) {
    return json({ ok: false, error: "post-not-found" }, 404, request, false);
  }

  if (postRow.syncKey !== syncKey) {
    return json({ ok: false, error: "post-access-denied" }, 403, request, false);
  }

  if (deviceId && postRow.deviceId && postRow.deviceId !== deviceId) {
    return json({ ok: false, error: "device-access-denied" }, 403, request, false);
  }

  const decision = await getTimelineAiDecisionByPostId(env, normalizedPostId);
  return json(
    {
      ok: true,
      postId: normalizedPostId,
      decision: buildTimelineAiDecisionPayload(normalizedPostId, decision)
    },
    200,
    request,
    false
  );
}

async function handleGetAiFeed(request, env, url) {
  const viewer = await requireViewer(request, env, true);
  if (!viewer) {
    return json({ ok: false, error: "unauthorized" }, 401, request, true);
  }

  await ensureAiFeedSchema(env);
  const limit = Math.max(
    1,
    Math.min(
      160,
      Number(url.searchParams.get("limit") || AI_FEED_DEFAULT_LIMIT) || AI_FEED_DEFAULT_LIMIT
    )
  );
  const items = await buildAiFeedItems(env, viewer.id, limit);

  return json(
    {
      ok: true,
      items
    },
    200,
    request,
    true,
    buildSessionRefreshHeaders(request, viewer, env)
  );
}

async function handleGetReplyAiDashboard(request, env, url) {
  const viewer = await requireViewer(request, env, true);
  if (!viewer) {
    return json({ ok: false, error: "unauthorized" }, 401, request, true);
  }

  const payload = await buildReplyAiDashboardPayload(env, viewer.id);
  return json(
    {
      ok: true,
      replyAi: payload
    },
    200,
    request,
    true,
    buildSessionRefreshHeaders(request, viewer, env)
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
  const [globalRuleState, personalState, sidebarControlsEnabled, replyAiSettings, globalBlockedAccounts] = await Promise.all([
    buildGlobalRuleState(env),
    buildDerivedStateForSyncKey(env, syncKey),
    getSidebarControlsEnabledForSyncKey(env, syncKey),
    getUserAiSettingsForSyncKey(env, syncKey),
    buildGlobalBlockedReplyAccounts(env, 200)
  ]);

  return json(
    {
      ok: true,
      syncKey,
      manualHideKeys: personalState.manualHideKeys,
      manualAllowKeys: personalState.manualAllowKeys,
      templateRules: Array.isArray(globalRuleState.templateRules) ? globalRuleState.templateRules : [],
      repeatSuspiciousHandles: Array.isArray(personalState.repeatSuspiciousHandles) ? personalState.repeatSuspiciousHandles : [],
      sidebarControlsEnabled,
      replyAiEnabled: Boolean(replyAiSettings && replyAiSettings.replyAiEnabled),
      replyAiSettingsUpdatedAt: replyAiSettings && replyAiSettings.updatedAt
        ? String(replyAiSettings.updatedAt || "")
        : "",
      globalReplyBlockedHandles: globalBlockedAccounts.map((item) => item.replyHandle).filter(Boolean)
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
    replyText: normalizeStoredReplyText(payload.replyText, payload.replyDisplayName, payload.replyHandle),
    normalizedText: String(payload.normalizedText || "").trim(),
    compactText: String(payload.compactText || "").trim(),
    accountProtected: Number(payload.accountProtected || 0) ? 1 : 0
  });

  if (!saved.deduped && saved.eventRow) {
    try {
      await recordModerationTrainingLabelFromEvent(env, saved.eventRow);
    } catch (error) {
      // Training capture must never block the user's hide/restore action.
    }
  }

  let replyAiRestored = false;
  if (normalizedEventType === "manual_allow") {
    const replyAiItemId = Number(payload.replyAiItemId || 0);
    if (replyAiItemId > 0) {
      replyAiRestored = await markReplyAiItemAllowedByManualRestore(env, syncKey, replyAiItemId);
    }
  }

  return json({ ok: true, deduped: saved.deduped, replyAiRestored }, 200, request, false);
}

async function buildStats(env, userId) {
  const activeHiddenSql = buildActiveHiddenEventSql("me");
  const query = userId
    ? `
      SELECT
        SUM(CASE WHEN event_type IN ('ad_home_hide', 'ad_hide') AND ${activeHiddenSql} THEN 1 ELSE 0 END) AS ad_home_hide_events,
        SUM(CASE WHEN event_type = 'ad_reply_hide' AND ${activeHiddenSql} THEN 1 ELSE 0 END) AS ad_reply_hide_events,
        SUM(CASE WHEN event_type = 'auto_hide' AND ${activeHiddenSql} THEN 1 ELSE 0 END) AS auto_hide_events,
        SUM(CASE WHEN event_type = 'manual_hide' AND ${activeHiddenSql} THEN 1 ELSE 0 END) AS manual_hide_events,
        SUM(CASE WHEN event_type = 'manual_allow' THEN 1 ELSE 0 END) AS manual_allow_events,
        COUNT(DISTINCT CASE
          WHEN event_type IN ('manual_hide', 'auto_hide') AND ${activeHiddenSql} AND COALESCE(reply_handle, '') != '' THEN reply_handle
          ELSE NULL
        END) AS distinct_hidden_handles,
        COUNT(DISTINCT CASE
          WHEN event_type IN ('manual_hide', 'auto_hide') AND ${activeHiddenSql} AND COALESCE(normalized_text, '') != '' THEN normalized_text
          ELSE NULL
        END) AS distinct_hidden_phrases
      FROM moderation_events me
      WHERE me.user_id = ?
        AND ${buildNonTestModerationEventSql("me")}
    `
    : `
      SELECT
        SUM(CASE WHEN event_type IN ('ad_home_hide', 'ad_hide') AND ${activeHiddenSql} THEN 1 ELSE 0 END) AS ad_home_hide_events,
        SUM(CASE WHEN event_type = 'ad_reply_hide' AND ${activeHiddenSql} THEN 1 ELSE 0 END) AS ad_reply_hide_events,
        SUM(CASE WHEN event_type = 'auto_hide' AND ${activeHiddenSql} THEN 1 ELSE 0 END) AS auto_hide_events,
        SUM(CASE WHEN event_type = 'manual_hide' AND ${activeHiddenSql} THEN 1 ELSE 0 END) AS manual_hide_events,
        SUM(CASE WHEN event_type = 'manual_allow' THEN 1 ELSE 0 END) AS manual_allow_events,
        COUNT(DISTINCT CASE
          WHEN event_type IN ('manual_hide', 'auto_hide') AND ${activeHiddenSql} AND COALESCE(reply_handle, '') != '' THEN reply_handle
          ELSE NULL
        END) AS distinct_hidden_handles,
        COUNT(DISTINCT CASE
          WHEN event_type IN ('manual_hide', 'auto_hide') AND ${activeHiddenSql} AND COALESCE(normalized_text, '') != '' THEN normalized_text
          ELSE NULL
        END) AS distinct_hidden_phrases
      FROM moderation_events me
      WHERE ${buildNonTestModerationEventSql("me")}
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

async function buildSkippedStats(env, userId) {
  await ensureAiFeedSchema(env);
  const baseStats = await buildStats(env, userId);
  let aiDirectHideCount = 0;
  let aiMemoryHideCount = 0;

  if (userId) {
    const row = await env.DB.prepare(
      `
        SELECT
          SUM(CASE WHEN rar.decision_layer = 'ai' THEN 1 ELSE 0 END) AS ai_direct_hide_count,
          SUM(CASE WHEN rar.decision_layer != 'ai' THEN 1 ELSE 0 END) AS ai_memory_hide_count
        FROM reply_ai_items rai
        JOIN reply_ai_results rar
          ON rar.item_id = rai.id
        WHERE rai.user_id = ?
          AND rar.status = 'ready'
          AND rar.action = 'hide'
          AND rar.confidence = 'high'
      `
    ).bind(userId).first();

    aiDirectHideCount = Number(row && row.ai_direct_hide_count ? row.ai_direct_hide_count : 0);
    aiMemoryHideCount = Number(row && row.ai_memory_hide_count ? row.ai_memory_hide_count : 0);
  }

  const manualHideCount = Number(baseStats.manualHideEvents || 0);
  const adHideCount = Number(baseStats.adHomeHideEvents || 0) + Number(baseStats.adReplyHideEvents || 0);

  return {
    totalSkippedCount: aiDirectHideCount + aiMemoryHideCount + manualHideCount + adHideCount,
    aiDirectHideCount,
    aiMemoryHideCount,
    manualHideCount,
    adHideCount
  };
}

function buildRestoredHiddenEventExistsSql(alias) {
  const source = alias || "me";
  const sourceUser = `TRIM(COALESCE(${source}.user_id, ''))`;
  const sourceSyncKey = `TRIM(COALESCE(${source}.sync_key, ''))`;
  const sourceStatusId = `TRIM(COALESCE(${source}.reply_status_id, ''))`;
  const sourceHandle = `LOWER(TRIM(COALESCE(${source}.reply_handle, '')))`;
  const sourceCompactText = `LOWER(TRIM(COALESCE(${source}.compact_text, '')))`;
  const sourceNormalizedText = `LOWER(TRIM(COALESCE(${source}.normalized_text, '')))`;
  const sourceReplyText = `LOWER(TRIM(COALESCE(${source}.reply_text, '')))`;

  return `
    EXISTS (
      SELECT 1
      FROM moderation_events ma
      WHERE ma.event_type = 'manual_allow'
        AND ma.id > ${source}.id
        AND ${buildNonTestModerationEventSql("ma")}
        AND (
          (${sourceUser} != '' AND TRIM(COALESCE(ma.user_id, '')) = ${sourceUser})
          OR (${sourceUser} = '' AND ${sourceSyncKey} != '' AND TRIM(COALESCE(ma.sync_key, '')) = ${sourceSyncKey})
        )
        AND (
          (${sourceStatusId} != '' AND TRIM(COALESCE(ma.reply_status_id, '')) = ${sourceStatusId})
          OR (
            ${sourceStatusId} = ''
            AND ${sourceHandle} = LOWER(TRIM(COALESCE(ma.reply_handle, '')))
            AND ${sourceHandle} != ''
            AND (
              (${sourceCompactText} != '' AND LOWER(TRIM(COALESCE(ma.compact_text, ''))) = ${sourceCompactText})
              OR (${sourceNormalizedText} != '' AND LOWER(TRIM(COALESCE(ma.normalized_text, ''))) = ${sourceNormalizedText})
              OR (${sourceReplyText} != '' AND LOWER(TRIM(COALESCE(ma.reply_text, ''))) = ${sourceReplyText})
            )
          )
        )
      LIMIT 1
    )
  `;
}

function buildActiveHiddenEventSql(alias) {
  const source = alias || "me";
  return `NOT ${buildRestoredHiddenEventExistsSql(source)}`;
}

function numberFromRow(row, key) {
  return Number(row && row[key] ? row[key] : 0);
}

function summarizeAuditRowsByKey(rows, keyName, valueName) {
  const output = {};
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const key = String(row && row[keyName] ? row[keyName] : "unknown").trim() || "unknown";
    output[key] = Number(row && row[valueName] ? row[valueName] : 0);
  });
  return output;
}

function buildRuleContributorKey(row) {
  const userId = String(row && (row.user_id || row.userId) ? (row.user_id || row.userId) : "").trim();
  if (userId) {
    return `user:${userId}`;
  }
  const syncKey = String(row && (row.sync_key || row.syncKey) ? (row.sync_key || row.syncKey) : "").trim();
  if (syncKey) {
    return `sync:${syncKey}`;
  }
  return "";
}

function buildAuditCheck(id, status, title, detail, meta) {
  return {
    id,
    status,
    title,
    detail,
    meta: meta || {}
  };
}

function computeDataLayerAuditChecks(summary) {
  const source = summary || {};
  const checks = [];
  checks.push(buildAuditCheck(
    "personal-stats-are-user-scoped",
    "pass",
    "个人统计按账号隔离",
    "控制台个人统计查询使用 moderation_events.user_id，不会让新账号继承开发者账号的个人屏蔽数量。"
  ));
  checks.push(buildAuditCheck(
    "global-baseline-is-shared",
    "pass",
    "公共基础信号可共享",
    "公共规则和高共识模板只作为云端 AI 判断的参考信号；插件不再把公共精确规则并入本地手动隐藏列表。"
  ));

  const invalidEventUsers = numberFromRow(source.integrity, "events_with_unknown_user");
  checks.push(buildAuditCheck(
    "events-reference-known-users",
    invalidEventUsers === 0 ? "pass" : "fail",
    "事件 user_id 必须能找到用户",
    invalidEventUsers === 0
      ? "没有发现指向不存在用户的真实事件。"
      : `发现 ${invalidEventUsers} 条真实事件指向不存在的 user_id。`,
    { count: invalidEventUsers }
  ));

  const invalidSyncUsers = numberFromRow(source.integrity, "sync_keys_with_unknown_user");
  checks.push(buildAuditCheck(
    "sync-keys-reference-known-users",
    invalidSyncUsers === 0 ? "pass" : "fail",
    "syncKey 绑定必须能找到用户",
    invalidSyncUsers === 0
      ? "没有发现指向不存在用户的 syncKey。"
      : `发现 ${invalidSyncUsers} 个 syncKey 指向不存在的 user_id。`,
    { count: invalidSyncUsers }
  ));

  const mismatchedEvents = numberFromRow(source.integrity, "events_mismatched_sync_user");
  checks.push(buildAuditCheck(
    "event-user-matches-sync-key-user",
    mismatchedEvents === 0 ? "pass" : "fail",
    "事件归属必须和 syncKey 绑定一致",
    mismatchedEvents === 0
      ? "没有发现事件 user_id 与 syncKey 绑定 user_id 不一致。"
      : `发现 ${mismatchedEvents} 条事件的 user_id 与 syncKey 绑定不一致。`,
    { count: mismatchedEvents }
  ));

  const unboundEvents = numberFromRow(source.eventSummary, "unboundEvents");
  checks.push(buildAuditCheck(
    "unbound-events-are-not-personal-stats",
    unboundEvents === 0 ? "pass" : "warn",
    "未登录事件不会算进个人统计",
    unboundEvents === 0
      ? "当前没有未绑定账号的真实事件。"
      : `当前有 ${unboundEvents} 条真实事件还没有绑定账号；它们可用于公共统计观察，但不会算进任何用户的个人统计。`,
    { count: unboundEvents }
  ));

  const minContributors = Number(source.globalRuleConfig && source.globalRuleConfig.minContributors ? source.globalRuleConfig.minContributors : 0);
  checks.push(buildAuditCheck(
    "auto-global-requires-multiple-contributors",
    minContributors >= 2 ? "pass" : "fail",
    "自动全局规则必须要求多贡献者",
    minContributors >= 2
      ? `自动全局精确规则至少需要 ${minContributors} 个贡献者，同一账号多设备不会伪装成多人共识。`
      : "自动全局精确规则贡献者门槛低于 2，存在单用户污染公共库风险。",
    { minContributors }
  ));

  const blockedSingleContributor = numberFromRow(source.autoGlobalAudit, "single_contributor_blocked_candidates");
  checks.push(buildAuditCheck(
    "single-user-repeats-stay-personal",
    "pass",
    "单用户重复冲走不会自动进入公共规则",
    blockedSingleContributor
      ? `审计发现 ${blockedSingleContributor} 个旧逻辑可能误升全局的单贡献者候选，现在会被拦住。`
      : "没有发现会被旧逻辑误升全局的单贡献者候选。",
    { blockedCandidates: blockedSingleContributor }
  ));

  const missingDecisionEvents = numberFromRow(source.integrity, "developer_decisions_missing_event");
  checks.push(buildAuditCheck(
    "developer-decisions-have-source-events",
    missingDecisionEvents === 0 ? "pass" : "warn",
    "开发者全局规则应保留来源事件",
    missingDecisionEvents === 0
      ? "所有开发者全局规则都能找到来源事件。"
      : `发现 ${missingDecisionEvents} 条开发者全局规则找不到来源事件，建议后续人工核对。`,
    { count: missingDecisionEvents }
  ));

  return checks;
}

async function buildAutoGlobalCandidateAudit(env, config) {
  const safeConfig = config || getAutoGlobalExactConfig(env);
  const nowMs = Date.now();
  const windowCutoffIso = new Date(nowMs - (safeConfig.windowDays * 24 * 60 * 60 * 1000)).toISOString();
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        id,
        sync_key,
        user_id,
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
      FROM moderation_events me
      WHERE event_type IN ('manual_hide', 'manual_allow')
        AND created_at >= ?
        AND ${buildNonTestModerationEventSql("me")}
      ORDER BY id ASC
      LIMIT 2000
    `
  ).bind(windowCutoffIso).all();

  const autoExactKeyStats = new Map();
  for (const row of results) {
    const keys = buildRowKeys(row);
    const candidateKeys = collectAutoGlobalExactKeys(keys);
    const normalizedHandle = String(row.reply_handle || "").trim().toLowerCase();
    const contributorKey = buildRuleContributorKey(row);

    candidateKeys.forEach((key) => {
      const current = autoExactKeyStats.get(key) || {
        hideCount: 0,
        allowCount: 0,
        contributors: new Set(),
        handles: new Set()
      };

      if (row.event_type === "manual_hide") {
        current.hideCount += 1;
        if (contributorKey) {
          current.contributors.add(contributorKey);
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

  let eligibleCandidates = 0;
  let singleContributorBlockedCandidates = 0;
  let allowSuppressedCandidates = 0;
  for (const value of autoExactKeyStats.values()) {
    const weightedScore = getAutoGlobalExactWeightedScore(value);
    const baseEligible = value.hideCount >= safeConfig.minHides
      && weightedScore >= safeConfig.minScore;
    if (!baseEligible) {
      continue;
    }
    if (value.allowCount > 0) {
      allowSuppressedCandidates += 1;
      continue;
    }
    if (value.contributors.size >= safeConfig.minContributors) {
      eligibleCandidates += 1;
    } else {
      singleContributorBlockedCandidates += 1;
    }
  }

  return {
    scannedRows: results.length,
    eligible_candidates: eligibleCandidates,
    single_contributor_blocked_candidates: singleContributorBlockedCandidates,
    allow_suppressed_candidates: allowSuppressedCandidates
  };
}

async function buildDataLayerAudit(env) {
  await ensureAiFeedSchema(env);
  const globalRuleConfig = getAutoGlobalExactConfig(env);
  const developerEmails = Array.from(getDeveloperEmails(env));
  const developerEmailPlaceholders = developerEmails.map(() => "?").join(",") || "''";
  const userSummaryStatement = env.DB.prepare(
    `
      SELECT
        COUNT(*) AS total_users,
        SUM(CASE WHEN LOWER(TRIM(email)) IN (${developerEmailPlaceholders}) THEN 1 ELSE 0 END) AS developer_users
      FROM users
    `
  );
  const [
    userSummary,
    syncSummary,
    eventSummary,
    eventTypeRows,
    userEventRows,
    eventUserIntegrity,
    syncUserIntegrity,
    eventSyncIntegrity,
    missingDecisionEvents,
    decisionSummary,
    sampleRows,
    labelRows,
    candidateRows,
    autoGlobalAudit
  ] = await Promise.all([
    developerEmails.length
      ? userSummaryStatement.bind(...developerEmails).first()
      : userSummaryStatement.first(),
    env.DB.prepare(
      `
        SELECT
          COUNT(*) AS total_sync_keys,
          SUM(CASE WHEN user_id IS NOT NULL AND TRIM(user_id) != '' THEN 1 ELSE 0 END) AS bound_sync_keys,
          SUM(CASE WHEN user_id IS NULL OR TRIM(user_id) = '' THEN 1 ELSE 0 END) AS unbound_sync_keys
        FROM sync_keys
      `
    ).first(),
    env.DB.prepare(
      `
        SELECT
          COUNT(*) AS total_events,
          SUM(CASE WHEN user_id IS NOT NULL AND TRIM(user_id) != '' THEN 1 ELSE 0 END) AS bound_events,
          SUM(CASE WHEN user_id IS NULL OR TRIM(user_id) = '' THEN 1 ELSE 0 END) AS unbound_events,
          COUNT(DISTINCT CASE WHEN user_id IS NOT NULL AND TRIM(user_id) != '' THEN user_id ELSE NULL END) AS event_user_count
        FROM moderation_events me
        WHERE ${buildNonTestModerationEventSql("me")}
      `
    ).first(),
    env.DB.prepare(
      `
        SELECT event_type, COUNT(*) AS total_count
        FROM moderation_events me
        WHERE ${buildNonTestModerationEventSql("me")}
        GROUP BY event_type
        ORDER BY event_type
      `
    ).all(),
    env.DB.prepare(
      `
        SELECT
          u.id AS user_id,
          u.email AS email,
          COUNT(me.id) AS total_events,
          SUM(CASE WHEN me.event_type = 'manual_hide' THEN 1 ELSE 0 END) AS manual_hide_events,
          SUM(CASE WHEN me.event_type = 'manual_allow' THEN 1 ELSE 0 END) AS manual_allow_events,
          SUM(CASE WHEN me.event_type = 'auto_hide' THEN 1 ELSE 0 END) AS auto_hide_events,
          SUM(CASE WHEN me.event_type IN ('ad_home_hide', 'ad_hide', 'ad_reply_hide') THEN 1 ELSE 0 END) AS ad_hide_events
        FROM users u
        LEFT JOIN moderation_events me
          ON me.user_id = u.id
          AND ${buildNonTestModerationEventSql("me")}
        GROUP BY u.id, u.email
        ORDER BY COUNT(me.id) DESC, u.created_at DESC
        LIMIT 50
      `
    ).all(),
    env.DB.prepare(
      `
        SELECT
          COUNT(*) AS events_with_unknown_user
        FROM moderation_events me
        LEFT JOIN users u
          ON u.id = me.user_id
        WHERE ${buildNonTestModerationEventSql("me")}
          AND me.user_id IS NOT NULL
          AND TRIM(me.user_id) != ''
          AND u.id IS NULL
      `
    ).first(),
    env.DB.prepare(
      `
        SELECT
          COUNT(*) AS sync_keys_with_unknown_user
        FROM sync_keys sk
        LEFT JOIN users u
          ON u.id = sk.user_id
        WHERE sk.user_id IS NOT NULL
          AND TRIM(sk.user_id) != ''
          AND u.id IS NULL
      `
    ).first(),
    env.DB.prepare(
      `
        SELECT
          COUNT(*) AS events_mismatched_sync_user
        FROM moderation_events me
        JOIN sync_keys sk
          ON sk.sync_key = me.sync_key
        WHERE ${buildNonTestModerationEventSql("me")}
          AND me.user_id IS NOT NULL
          AND TRIM(me.user_id) != ''
          AND sk.user_id IS NOT NULL
          AND TRIM(sk.user_id) != ''
          AND me.user_id != sk.user_id
      `
    ).first(),
    env.DB.prepare(
      `
        SELECT COUNT(*) AS developer_decisions_missing_event
        FROM developer_global_decisions d
        LEFT JOIN moderation_events me
          ON me.id = d.event_id
        WHERE d.event_id IS NOT NULL
          AND d.event_id != 0
          AND me.id IS NULL
      `
    ).first(),
    env.DB.prepare(
      `
        SELECT
          COUNT(*) AS total_decisions,
          SUM(CASE WHEN revoked_at IS NULL THEN 1 ELSE 0 END) AS active_decisions,
          SUM(CASE WHEN revoked_at IS NOT NULL THEN 1 ELSE 0 END) AS revoked_decisions
        FROM developer_global_decisions
      `
    ).first(),
    env.DB.prepare(
      `
        SELECT contribution_scope || ':' || quality_status AS bucket, COUNT(*) AS total_count
        FROM moderation_samples
        GROUP BY contribution_scope, quality_status
        ORDER BY contribution_scope, quality_status
      `
    ).all(),
    env.DB.prepare(
      `
        SELECT decision, COUNT(*) AS total_count
        FROM moderation_sample_labels
        GROUP BY decision
        ORDER BY decision
      `
    ).all(),
    env.DB.prepare(
      `
        SELECT status, COUNT(*) AS total_count
        FROM moderation_rule_candidates
        GROUP BY status
        ORDER BY status
      `
    ).all(),
    buildAutoGlobalCandidateAudit(env, globalRuleConfig)
  ]);

  const summary = {
    checkedAt: new Date().toISOString(),
    userSummary: {
      totalUsers: numberFromRow(userSummary, "total_users"),
      developerUsers: numberFromRow(userSummary, "developer_users")
    },
    syncSummary: {
      totalSyncKeys: numberFromRow(syncSummary, "total_sync_keys"),
      boundSyncKeys: numberFromRow(syncSummary, "bound_sync_keys"),
      unboundSyncKeys: numberFromRow(syncSummary, "unbound_sync_keys")
    },
    eventSummary: {
      totalEvents: numberFromRow(eventSummary, "total_events"),
      boundEvents: numberFromRow(eventSummary, "bound_events"),
      unboundEvents: numberFromRow(eventSummary, "unbound_events"),
      eventUserCount: numberFromRow(eventSummary, "event_user_count"),
      byType: summarizeAuditRowsByKey(eventTypeRows.results, "event_type", "total_count")
    },
    perUserEventSummary: (userEventRows.results || []).map((row) => ({
      userId: row.user_id || "",
      email: row.email || "",
      totalEvents: Number(row.total_events || 0),
      manualHideEvents: Number(row.manual_hide_events || 0),
      manualAllowEvents: Number(row.manual_allow_events || 0),
      autoHideEvents: Number(row.auto_hide_events || 0),
      adHideEvents: Number(row.ad_hide_events || 0)
    })),
    integrity: {
      events_with_unknown_user: numberFromRow(eventUserIntegrity, "events_with_unknown_user"),
      sync_keys_with_unknown_user: numberFromRow(syncUserIntegrity, "sync_keys_with_unknown_user"),
      events_mismatched_sync_user: numberFromRow(eventSyncIntegrity, "events_mismatched_sync_user"),
      developer_decisions_missing_event: numberFromRow(missingDecisionEvents, "developer_decisions_missing_event")
    },
    globalRules: {
      totalDecisions: numberFromRow(decisionSummary, "total_decisions"),
      activeDecisions: numberFromRow(decisionSummary, "active_decisions"),
      revokedDecisions: numberFromRow(decisionSummary, "revoked_decisions")
    },
    moderationTraining: {
      samplesByScopeStatus: summarizeAuditRowsByKey(sampleRows.results, "bucket", "total_count"),
      labelsByDecision: summarizeAuditRowsByKey(labelRows.results, "decision", "total_count"),
      candidatesByStatus: summarizeAuditRowsByKey(candidateRows.results, "status", "total_count")
    },
    globalRuleConfig: {
      minContributors: globalRuleConfig.minContributors,
      minHides: globalRuleConfig.minHides,
      minScore: globalRuleConfig.minScore,
      windowDays: globalRuleConfig.windowDays
    },
    autoGlobalAudit
  };

  return Object.assign({}, summary, {
    checks: computeDataLayerAuditChecks(summary)
  });
}

async function handleDeveloperDataLayerAudit(request, env) {
  const viewer = await requireDeveloper(request, env);
  if (!viewer) {
    return json({ ok: false, error: "developer-required" }, 403, request, true);
  }

  const audit = await buildDataLayerAudit(env);
  return json(
    {
      ok: true,
      audit
    },
    200,
    request,
    true,
    buildSessionRefreshHeaders(request, viewer, env)
  );
}

function normalizeTrainingBackfillPayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  const requestedSource = String(source.source || "all").trim().toLowerCase();
  return {
    source: ["all", "events", "ai"].includes(requestedSource) ? requestedSource : "all",
    eventAfterId: Math.max(0, Number(source.eventAfterId || 0) || 0),
    replyAiAfterId: Math.max(0, Number(source.replyAiAfterId || 0) || 0),
    limit: Math.max(1, Math.min(300, Number(source.limit || 120) || 120)),
    dryRun: source.dryRun === true
  };
}

async function listModerationTrainingEventBackfillRows(env, afterId, limit) {
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        id,
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
      FROM moderation_events me
      WHERE id > ?
        AND event_type IN ('manual_hide', 'manual_allow')
        AND ${buildNonTestModerationEventSql("me")}
      ORDER BY id ASC
      LIMIT ?
    `
  ).bind(afterId, limit).all();
  return results;
}

async function listReplyAiTrainingBackfillRows(env, afterId, limit) {
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        rai.id,
        rai.sync_key,
        rai.user_id,
        rai.device_id,
        rai.thread_url,
        rai.thread_status_id,
        rai.reply_status_id,
        rai.reply_handle,
        rai.reply_display_name,
        rai.reply_text,
        rai.main_post_text,
        rai.account_protected,
        rai.profile_path,
        rai.profile_bio_text,
        rai.profile_signal_tags_json,
        rai.profile_links_json,
        rai.profile_fetch_status,
        rai.profile_fetched_at,
        rai.created_at,
        rar.action,
        rar.decision_layer,
        rar.matched_safety_labels_json,
        rar.matched_profile_signals_json,
        rar.confidence,
        rar.reason_short,
        rar.status,
        rar.model,
        rar.raw_response_json,
        rar.updated_at
      FROM reply_ai_items rai
      JOIN reply_ai_results rar
        ON rar.item_id = rai.id
      WHERE rai.id > ?
        AND rar.status = 'ready'
        AND rar.decision_layer = 'ai'
        AND ${buildNonTestReplyAiItemSql("rai")}
      ORDER BY rai.id ASC
      LIMIT ?
    `
  ).bind(afterId, limit).all();
  return results;
}

function buildReplyAiBackfillItemRow(row) {
  return {
    id: Number(row.id || 0),
    syncKey: row.sync_key || "",
    userId: row.user_id || "",
    deviceId: row.device_id || "",
    threadUrl: row.thread_url || "",
    threadStatusId: row.thread_status_id || "",
    replyStatusId: row.reply_status_id || "",
    replyHandle: row.reply_handle || "",
    replyDisplayName: row.reply_display_name || "",
    replyText: normalizeStoredReplyText(row.reply_text || "", row.reply_display_name || "", row.reply_handle || ""),
    mainPostText: row.main_post_text || "",
    accountProtected: Number(row.account_protected || 0) === 1,
    profilePath: row.profile_path || "",
    profileBioText: row.profile_bio_text || "",
    profileSignalTags: normalizeReplyAiStringList(parseJsonArray(row.profile_signal_tags_json), REPLY_AI_PROFILE_SIGNAL_LABELS, 8),
    profileLinks: normalizeReplyAiProfileLinks(parseJsonArray(row.profile_links_json)),
    profileFetchStatus: normalizeReplyAiProfileFetchStatus(row.profile_fetch_status),
    profileFetchedAt: row.profile_fetched_at || "",
    createdAt: row.created_at || ""
  };
}

function buildReplyAiBackfillDecision(row) {
  return buildDefaultReplyAiDecision({
    action: row && row.action === "hide" ? "hide" : "allow",
    decisionLayer: "ai",
    matchedSafetyLabels: normalizeReplyAiStringList(parseJsonArray(row && row.matched_safety_labels_json), REPLY_AI_SAFETY_LABELS, 8),
    matchedProfileSignals: normalizeReplyAiStringList(parseJsonArray(row && row.matched_profile_signals_json), REPLY_AI_PROFILE_SIGNAL_LABELS, 8),
    confidence: row && row.confidence ? String(row.confidence || "low") : "low",
    reasonShort: row && row.reason_short ? row.reason_short : "AI 首次判断",
    status: "ready",
    model: row && row.model ? row.model : "",
    rawResponseJson: parseJsonObject(row && row.raw_response_json)
  });
}

async function processTrainingBackfillEventRows(env, rows, dryRun) {
  let processed = 0;
  let lastId = 0;
  for (const row of rows) {
    lastId = Math.max(lastId, Number(row.id || 0));
    if (dryRun) {
      continue;
    }
    await recordModerationTrainingLabelFromEvent(env, {
      id: Number(row.id || 0),
      syncKey: row.sync_key || "",
      userId: row.user_id || "",
      deviceId: row.device_id || "",
      eventType: row.event_type || "",
      threadUrl: row.thread_url || "",
      threadStatusId: row.thread_status_id || "",
      replyStatusId: row.reply_status_id || "",
      replyHandle: row.reply_handle || "",
      replyDisplayName: row.reply_display_name || "",
      replyText: normalizeStoredReplyText(row.reply_text || "", row.reply_display_name || "", row.reply_handle || ""),
      normalizedText: row.normalized_text || "",
      compactText: row.compact_text || "",
      accountProtected: Number(row.account_protected || 0) === 1,
      createdAt: row.created_at || new Date().toISOString()
    }, { skipCandidateRefresh: true });
    processed += 1;
  }
  return { processed: dryRun ? 0 : processed, scanned: rows.length, lastId };
}

async function processTrainingBackfillReplyAiRows(env, rows, dryRun) {
  let processed = 0;
  let memoryUpserts = 0;
  let lastId = 0;
  for (const row of rows) {
    lastId = Math.max(lastId, Number(row.id || 0));
    if (dryRun) {
      continue;
    }
    const itemRow = buildReplyAiBackfillItemRow(row);
    const decision = buildReplyAiBackfillDecision(row);
    await recordModerationTrainingLabelFromReplyAiDecision(env, itemRow, decision, { skipCandidateRefresh: true });
    if (isDirectAiHighConfidenceHide(decision)) {
      await upsertReplyAiMemoryFromDecision(env, itemRow, decision);
      memoryUpserts += 1;
    }
    processed += 1;
  }
  return { processed: dryRun ? 0 : processed, scanned: rows.length, memoryUpserts, lastId };
}

async function handleDeveloperBackfillTraining(request, env) {
  const viewer = await requireDeveloper(request, env);
  if (!viewer) {
    return json({ ok: false, error: "developer-required" }, 403, request, true);
  }

  await ensureAiFeedSchema(env);
  const payload = normalizeTrainingBackfillPayload(await readJson(request));
  const includeEvents = payload.source === "all" || payload.source === "events";
  const includeAi = payload.source === "all" || payload.source === "ai";

  const eventRows = includeEvents
    ? await listModerationTrainingEventBackfillRows(env, payload.eventAfterId, payload.limit)
    : [];
  const replyAiRows = includeAi
    ? await listReplyAiTrainingBackfillRows(env, payload.replyAiAfterId, payload.limit)
    : [];

  const [eventResult, replyAiResult] = await Promise.all([
    processTrainingBackfillEventRows(env, eventRows, payload.dryRun),
    processTrainingBackfillReplyAiRows(env, replyAiRows, payload.dryRun)
  ]);

  return json(
    {
      ok: true,
      dryRun: payload.dryRun,
      source: payload.source,
      events: eventResult,
      replyAi: replyAiResult,
      next: {
        eventAfterId: eventResult.lastId || payload.eventAfterId,
        replyAiAfterId: replyAiResult.lastId || payload.replyAiAfterId,
        done: (!includeEvents || eventRows.length === 0) && (!includeAi || replyAiRows.length === 0)
      }
    },
    200,
    request,
    true,
    buildSessionRefreshHeaders(request, viewer, env)
  );
}

async function handleDeveloperRebuildRuleCandidates(request, env) {
  const viewer = await requireDeveloper(request, env);
  if (!viewer) {
    return json({ ok: false, error: "developer-required" }, 403, request, true);
  }

  await ensureAiFeedSchema(env);
  const payload = await readJson(request);
  const dryRun = Boolean(payload && payload.dryRun === true);
  const result = await rebuildModerationRuleCandidates(env, { dryRun });

  return json(
    {
      ok: true,
      dryRun,
      candidates: result
    },
    200,
    request,
    true,
    buildSessionRefreshHeaders(request, viewer, env)
  );
}

function normalizeReplyAiRoutingProbePayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  const sample = source.sample && typeof source.sample === "object" ? source.sample : source;
  return {
    sample,
    callProvider: source.callProvider === true
  };
}

function buildReplyAiRoutingProbeItem(viewer, sample) {
  const source = sample && typeof sample === "object" ? sample : {};
  const probeSource = Object.assign({
    threadUrl: "https://x.com/example/status/1",
    threadStatusId: "developer-probe-thread",
    replyStatusId: "developer-probe-reply",
    replyHandle: "MullerChri42258",
    replyDisplayName: "孟轩🌸无常线下🌸",
    replyText: "找个同城弟弟",
    mainPostText: "真实页面调试样本",
    profilePath: "",
    profileBioText: "",
    profileSignalTags: [],
    profileLinks: [],
    profileFetchStatus: "not_requested"
  }, source);
  const item = buildAiProviderTestItem(probeSource);
  const now = new Date().toISOString();
  return Object.assign({}, item, {
    id: 0,
    userId: viewer && viewer.id ? viewer.id : "",
    syncKey: normalizeAiProviderTestText(source.syncKey, "sync_developer_probe", 120),
    deviceId: normalizeAiProviderTestText(source.deviceId, "device_developer_probe", 120),
    createdAt: now
  });
}

function buildSafeAiSettingsProbePayload(settings) {
  return {
    replyAiEnabled: Boolean(settings && settings.replyAiEnabled),
    providerBaseUrl: normalizeAiProviderBaseUrl(settings && settings.providerBaseUrl),
    model: normalizeAiModel(settings && settings.model),
    apiKeyConfigured: Boolean(settings && settings.apiKeyConfigured),
    apiKeyLast4: normalizeAiKeyLast4(settings && settings.apiKeyLast4)
  };
}

function buildHeuristicProbePayload(summary) {
  const source = summary && typeof summary === "object" ? summary : {};
  return {
    highRiskDisplayName: Boolean(source.highRiskDisplayName),
    lureDisplayName: Boolean(source.lureDisplayName),
    suspiciousHandle: Boolean(source.suspiciousHandle),
    hasLongDigitHandle: Boolean(source.hasLongDigitHandle),
    accountMetadataRisk: Boolean(source.accountMetadataRisk),
    shortOrThinReply: Boolean(source.shortOrThinReply),
    hasShareLinkScam: Boolean(source.hasShareLinkScam),
    hasGeoMeetupBait: Boolean(source.hasGeoMeetupBait),
    hasGeoRelationshipBait: Boolean(source.hasGeoRelationshipBait),
    hasBaitQuestionShape: Boolean(source.hasBaitQuestionShape),
    hasExplicitEroticBait: Boolean(source.hasExplicitEroticBait),
    hasEroticMentionRedirect: Boolean(source.hasEroticMentionRedirect),
    hasSpamTemplateSignal: Boolean(source.hasSpamTemplateSignal),
    hasDecorativeSloganBait: Boolean(source.hasDecorativeSloganBait),
    hasPoeticSpamSloganBait: Boolean(source.hasPoeticSpamSloganBait),
    hasEmojiNoiseBait: Boolean(source.hasEmojiNoiseBait),
    hasContextDetachedBait: Boolean(source.hasContextDetachedBait),
    avatarVisionRequested: Boolean(source.avatarVisionRequested),
    avatarEvidenceTags: normalizeReplyAiStringList(source.avatarEvidenceTags, REPLY_AI_AVATAR_EVIDENCE_TAGS, REPLY_AI_AVATAR_EVIDENCE_TAG_LIMIT),
    evidenceNotes: Array.isArray(source.evidenceNotes) ? source.evidenceNotes.slice(0, 12) : []
  };
}

async function inspectReplyAiMemoryDecision(env, itemRow, riskRow) {
  const keyEntries = await buildReplyAiMemoryKeyEntries(itemRow, riskRow || null);
  const result = {
    checked: keyEntries.map((entry) => ({
      memoryKeyType: entry.memoryKeyType
    })),
    matched: null,
    decision: null
  };
  if (!keyEntries.length) {
    return result;
  }

  const now = new Date().toISOString();
  for (const keyEntry of keyEntries) {
    const row = await env.DB.prepare(
      `
        SELECT
          id,
          memory_key_type,
          action,
          confidence,
          matched_safety_labels_json,
          matched_profile_signals_json,
          reason_short,
          prompt_version,
          hit_count,
          expires_at
        FROM reply_ai_memory
        WHERE memory_key = ?
          AND prompt_version = ?
          AND status = 'active'
          AND action = 'hide'
          AND confidence = 'high'
          AND (expires_at IS NULL OR expires_at > ?)
        LIMIT 1
      `
    ).bind(keyEntry.memoryKey, REPLY_AI_MEMORY_POLICY_VERSION, now).first();

    if (!row) {
      continue;
    }

    result.matched = {
      memoryKeyType: normalizeAiFeedText(row.memory_key_type || keyEntry.memoryKeyType, 24),
      hitCount: Number(row.hit_count || 0),
      expiresAt: row.expires_at || ""
    };
    result.decision = buildReplyAiMemoryDecision(row);
    return result;
  }

  return result;
}

async function inspectModerationRuleCandidateDecision(env, itemRow) {
  const result = {
    accountProtected: Boolean(itemRow && itemRow.accountProtected),
    manualAllow: false,
    entries: [],
    matches: [],
    decision: null
  };
  if (!itemRow || itemRow.accountProtected) {
    return result;
  }

  result.manualAllow = await hasManualAllowForReplyAiItem(env, itemRow);
  const entries = buildModerationRuleCandidateEntriesFromSourceRow(
    buildModerationRuleCandidateSourceRowFromReplyAiItem(itemRow)
  );
  result.entries = entries.map((entry) => ({
    ruleType: entry.ruleType,
    patternKey: entry.patternKey
  }));
  if (!entries.length || result.manualAllow) {
    return result;
  }

  const priority = ["exact_text", "compact_text", "template", "pattern"];
  const sortedEntries = entries.slice().sort((left, right) => {
    return priority.indexOf(left.ruleType) - priority.indexOf(right.ruleType);
  });

  for (const entry of sortedEntries) {
    const row = await env.DB.prepare(
      `
        SELECT
          rule_type,
          pattern_key,
          safety_label,
          positive_label_count,
          negative_label_count,
          distinct_user_count,
          confidence_score,
          updated_at
        FROM moderation_rule_candidates
        WHERE rule_type = ?
          AND pattern_key = ?
          AND action = 'hide'
          AND status = 'active'
          AND positive_label_count > 0
          AND negative_label_count = 0
        ORDER BY confidence_score DESC, updated_at DESC
        LIMIT 1
      `
    ).bind(entry.ruleType, entry.patternKey).first();

    if (!row) {
      continue;
    }

    result.matches.push({
      ruleType: normalizeAiFeedText(row.rule_type, 40),
      patternKey: normalizeAiFeedText(row.pattern_key, 300),
      safetyLabel: normalizeAiFeedText(row.safety_label, 80),
      positiveLabelCount: Number(row.positive_label_count || 0),
      negativeLabelCount: Number(row.negative_label_count || 0),
      distinctUserCount: Number(row.distinct_user_count || 0),
      confidenceScore: Number(row.confidence_score || 0),
      updatedAt: row.updated_at || ""
    });
    if (!result.decision) {
      result.decision = buildModerationRuleCandidateDecision(row);
    }
  }

  return result;
}

function buildRoutingProbeSummaryDecision(decision) {
  return decision ? buildReplyAiDecisionPayload(0, decision) : null;
}

async function buildReplyAiRoutingProbe(env, viewer, payload) {
  await ensureAiFeedSchema(env);
  const normalizedPayload = normalizeReplyAiRoutingProbePayload(payload);
  const itemRow = buildReplyAiRoutingProbeItem(viewer, normalizedPayload.sample);
  const settings = await getUserAiSettingsWithSecret(env, viewer.id);
  const safeSettings = buildSafeAiSettingsProbePayload(settings);
  const staticDecision = buildReplyAiStaticDecision(itemRow, settings);
  const handleKey = normalizeAiHandle(itemRow.replyHandle);
  const riskRow = handleKey ? await getReplyAiAccountRiskRow(env, handleKey) : null;
  const heuristicSummary = buildReplyAiHeuristicSummary(itemRow, riskRow || null);

  const memoryProbe = staticDecision
    ? { checked: [], matched: null, decision: null }
    : await inspectReplyAiMemoryDecision(env, itemRow, riskRow || null);
  const ruleProbe = staticDecision || memoryProbe.decision
    ? { accountProtected: Boolean(itemRow.accountProtected), manualAllow: false, entries: [], matches: [], decision: null }
    : await inspectModerationRuleCandidateDecision(env, itemRow);
  const globalBlockDecision = !staticDecision && !memoryProbe.decision && !ruleProbe.decision && riskRow && Number(riskRow.active_global_block || 0) === 1
    ? buildReplyAiBlockedDecision()
    : null;
  const reusableDecision = !staticDecision && !memoryProbe.decision && !ruleProbe.decision && !globalBlockDecision
    ? await findReusableReplyAiDecision(env, itemRow, riskRow || null)
    : null;

  let providerDecision = null;
  let providerError = "";
  const teacherReviewTargetDecision = memoryProbe.decision
    || ruleProbe.decision
    || globalBlockDecision
    || reusableDecision;
  const normalWouldCallProvider = Boolean(!staticDecision && !memoryProbe.decision && !ruleProbe.decision && !globalBlockDecision && !reusableDecision);
  const teacherReviewWouldCallProvider = Boolean(
    !staticDecision
    && teacherReviewTargetDecision
    && shouldRequestReplyAiTeacherReview(itemRow, settings)
  );
  const wouldCallProvider = normalWouldCallProvider || teacherReviewWouldCallProvider;
  if (wouldCallProvider && normalizedPayload.callProvider) {
    try {
      providerDecision = await requestReplyAiDecisionFromProvider(env, settings, itemRow, riskRow || null);
    } catch (error) {
      providerError = normalizeAiProviderTestError(error);
    }
  }

  const finalDecision = staticDecision
    || (teacherReviewWouldCallProvider && isDirectAiHighConfidenceHide(providerDecision) ? providerDecision : null)
    || memoryProbe.decision
    || ruleProbe.decision
    || globalBlockDecision
    || reusableDecision
    || providerDecision
    || buildDefaultReplyAiDecision({
      decisionLayer: wouldCallProvider ? "external_ai_would_run" : "skipped",
      reasonShort: teacherReviewWouldCallProvider
        ? "数据库已命中，但这条会追加给 AI 老师复核教学"
        : (wouldCallProvider ? "数据库和学习库都未命中，下一步会调用外接 AI" : "未进入外接 AI"),
      status: wouldCallProvider ? "pending" : "skipped",
      model: safeSettings.model
    });

  return {
    writesDatabase: false,
    providerCalled: Boolean(providerDecision || providerError),
    providerError,
    wouldCallProvider,
    settings: safeSettings,
    sample: {
      replyText: itemRow.replyText,
      replyDisplayName: itemRow.replyDisplayName,
      replyHandle: itemRow.replyHandle,
      mainPostText: itemRow.mainPostText,
      accountProtected: Boolean(itemRow.accountProtected),
      avatarVisionRequested: Boolean(itemRow.avatarVisionRequested)
    },
    route: {
      finalDecision: buildRoutingProbeSummaryDecision(finalDecision),
      staticDecision: buildRoutingProbeSummaryDecision(staticDecision),
      memoryDecision: buildRoutingProbeSummaryDecision(memoryProbe.decision),
      ruleDecision: buildRoutingProbeSummaryDecision(ruleProbe.decision),
      globalBlockDecision: buildRoutingProbeSummaryDecision(globalBlockDecision),
      reusableDecision: buildRoutingProbeSummaryDecision(reusableDecision),
      providerDecision: buildRoutingProbeSummaryDecision(providerDecision)
    },
    memory: {
      checked: memoryProbe.checked,
      matched: memoryProbe.matched
    },
    ruleCandidates: {
      manualAllow: Boolean(ruleProbe.manualAllow),
      entries: ruleProbe.entries,
      matches: ruleProbe.matches
    },
    accountRisk: {
      replyHandle: handleKey,
      totalHighConfidenceHideCount: Number(riskRow && riskRow.total_high_confidence_hide_count ? riskRow.total_high_confidence_hide_count : 0),
      recentHighConfidenceHideCount: Number(riskRow && riskRow.recent_high_confidence_hide_count ? riskRow.recent_high_confidence_hide_count : 0),
      activeGlobalBlock: Boolean(riskRow && Number(riskRow.active_global_block || 0) === 1)
    },
    heuristics: buildHeuristicProbePayload(heuristicSummary)
  };
}

async function handleDeveloperReplyAiRoutingProbe(request, env) {
  const viewer = await requireDeveloper(request, env);
  if (!viewer) {
    return json({ ok: false, error: "developer-required" }, 403, request, true);
  }

  const payload = await readJson(request);
  const probe = await buildReplyAiRoutingProbe(env, viewer, payload);
  return json(
    {
      ok: true,
      probe
    },
    200,
    request,
    true,
    buildSessionRefreshHeaders(request, viewer, env)
  );
}

async function buildRecentEvents(env, userId) {
  const activeHiddenSql = buildActiveHiddenEventSql("me");
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
      FROM moderation_events me
      WHERE me.user_id = ?
        AND (
          event_type = 'manual_allow'
          OR (event_type IN ('auto_hide', 'manual_hide') AND ${activeHiddenSql})
        )
        AND ${buildNonTestModerationEventSql("me")}
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
  const activeHiddenSql = buildActiveHiddenEventSql("me");
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
      FROM moderation_events me
      WHERE me.user_id = ?
        AND event_type IN ('ad_home_hide', 'ad_reply_hide')
        AND ${activeHiddenSql}
        AND ${buildNonTestModerationEventSql("me")}
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

function createServerSyncKey() {
  return `sync_${crypto.randomUUID().replace(/-/g, "")}`;
}

async function findLatestSyncKeyForUserDevice(env, userId, deviceId) {
  const normalizedUserId = String(userId || "").trim();
  const normalizedDeviceId = String(deviceId || "").trim();
  if (!normalizedUserId) {
    return null;
  }

  if (normalizedDeviceId) {
    return env.DB.prepare(
      `
        SELECT
          sync_key,
          TRIM(COALESCE(device_id, '')) AS device_id,
          created_at,
          updated_at,
          last_seen_at
        FROM sync_keys
        WHERE user_id = ?
          AND TRIM(COALESCE(device_id, '')) = ?
        ORDER BY COALESCE(last_seen_at, updated_at, created_at) DESC
        LIMIT 1
      `
    ).bind(normalizedUserId, normalizedDeviceId).first();
  }

  return env.DB.prepare(
    `
      SELECT
        sync_key,
        TRIM(COALESCE(device_id, '')) AS device_id,
        created_at,
        updated_at,
        last_seen_at
      FROM sync_keys
      WHERE user_id = ?
      ORDER BY COALESCE(last_seen_at, updated_at, created_at) DESC
      LIMIT 1
    `
  ).bind(normalizedUserId).first();
}

async function resolveActiveBindingForUser(env, userId, options) {
  await ensureAiFeedSchema(env);
  if (!userId) {
    return null;
  }

  const normalizedSyncKey = String(options && options.syncKey ? options.syncKey : "").trim();
  const normalizedDeviceId = String(options && options.deviceId ? options.deviceId : "").trim();
  let row = null;

  if (normalizedSyncKey) {
    row = await env.DB.prepare(
      `
        SELECT
          sync_key,
          TRIM(COALESCE(device_id, '')) AS device_id,
          created_at,
          updated_at,
          last_seen_at
        FROM sync_keys
        WHERE user_id = ?
          AND sync_key = ?
        LIMIT 1
      `
    ).bind(userId, normalizedSyncKey).first();
  }

  if (!row && normalizedDeviceId) {
    row = await env.DB.prepare(
      `
        SELECT
          sync_key,
          TRIM(COALESCE(device_id, '')) AS device_id,
          created_at,
          updated_at,
          last_seen_at
        FROM sync_keys
        WHERE user_id = ?
          AND TRIM(COALESCE(device_id, '')) = ?
        ORDER BY COALESCE(last_seen_at, updated_at, created_at) DESC
        LIMIT 1
      `
    ).bind(userId, normalizedDeviceId).first();
  }

  if (!row) {
    row = await env.DB.prepare(
      `
        SELECT
          sync_key,
          TRIM(COALESCE(device_id, '')) AS device_id,
          created_at,
          updated_at,
          last_seen_at
        FROM sync_keys
        WHERE user_id = ?
          AND TRIM(COALESCE(sync_key, '')) != ''
          AND TRIM(sync_key) NOT LIKE 'sync_test_%'
        ORDER BY
          CASE WHEN TRIM(COALESCE(device_id, '')) != '' THEN 0 ELSE 1 END ASC,
          COALESCE(last_seen_at, updated_at, created_at) DESC
        LIMIT 1
      `
    ).bind(userId).first();
  }

  if (!row || !String(row.sync_key || "").trim()) {
    return null;
  }

  return {
    syncKey: String(row.sync_key || "").trim(),
    deviceId: String(row.device_id || "").trim(),
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    lastSeenAt: row.last_seen_at || ""
  };
}

async function bindSyncKeyToUser(env, syncKey, userId, options) {
  await ensureAiFeedSchema(env);
  if (!syncKey || !userId) {
    return {
      claimedSyncKeys: 0,
      claimedEvents: 0,
      deviceId: "",
      syncKey: String(syncKey || "").trim(),
      switchedSyncKey: false
    };
  }

  const requestedSyncKey = String(syncKey || "").trim();
  const normalizedDeviceId = String(options && options.deviceId ? options.deviceId : "").trim();
  const now = new Date().toISOString();
  const existing = await env.DB.prepare(
    "SELECT sync_key, user_id, TRIM(COALESCE(device_id, '')) AS device_id FROM sync_keys WHERE sync_key = ? LIMIT 1"
  ).bind(requestedSyncKey).first();
  const existingUserId = String(existing && existing.user_id ? existing.user_id : "").trim();
  let activeSyncKey = requestedSyncKey;
  let switchedSyncKey = false;

  if (existingUserId && existingUserId !== userId) {
    const priorBinding = await findLatestSyncKeyForUserDevice(env, userId, normalizedDeviceId);
    if (priorBinding && String(priorBinding.sync_key || "").trim()) {
      activeSyncKey = String(priorBinding.sync_key || "").trim();
    } else {
      activeSyncKey = createServerSyncKey();
    }
    switchedSyncKey = activeSyncKey !== requestedSyncKey;
  } else if (!existing) {
    const priorBinding = await findLatestSyncKeyForUserDevice(env, userId, normalizedDeviceId);
    if (priorBinding && String(priorBinding.sync_key || "").trim()) {
      activeSyncKey = String(priorBinding.sync_key || "").trim();
      switchedSyncKey = activeSyncKey !== requestedSyncKey;
    }
  }

  const activeExisting = await env.DB.prepare(
    "SELECT sync_key FROM sync_keys WHERE sync_key = ? LIMIT 1"
  ).bind(activeSyncKey).first();
  if (activeExisting) {
    await env.DB.prepare(
      "UPDATE sync_keys SET user_id = ?, device_id = CASE WHEN ? != '' THEN ? ELSE device_id END, updated_at = ?, last_seen_at = ? WHERE sync_key = ?"
    ).bind(userId, normalizedDeviceId, normalizedDeviceId, now, now, activeSyncKey).run();
  } else {
    await env.DB.prepare(
      "INSERT INTO sync_keys (sync_key, user_id, device_id, created_at, updated_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(activeSyncKey, userId, normalizedDeviceId, now, now, now).run();
  }
  await env.DB.prepare(
    "UPDATE moderation_events SET user_id = ? WHERE sync_key = ? AND (user_id IS NULL OR TRIM(user_id) = '' OR user_id = ?)"
  ).bind(userId, activeSyncKey, userId).run();
  await env.DB.prepare(
    "UPDATE timeline_posts SET user_id = ? WHERE sync_key = ? AND (user_id IS NULL OR TRIM(user_id) = '' OR user_id = ?)"
  ).bind(userId, activeSyncKey, userId).run();
  await env.DB.prepare(
    "UPDATE reply_ai_items SET user_id = ? WHERE sync_key = ? AND (user_id IS NULL OR TRIM(user_id) = '' OR user_id = ?)"
  ).bind(userId, activeSyncKey, userId).run();

  let claimedSyncKeys = 0;
  let claimedEvents = 0;
  if (normalizedDeviceId) {
    const claimed = await claimAnonymousDeviceActivityToUser(env, normalizedDeviceId, userId);
    claimedSyncKeys = Number(claimed.claimedSyncKeys || 0);
    claimedEvents = Number(claimed.claimedEvents || 0);
  }

  return {
    claimedSyncKeys,
    claimedEvents,
    deviceId: normalizedDeviceId,
    syncKey: activeSyncKey,
    switchedSyncKey
  };
}

function normalizeSidebarControlsEnabled(value, fallback) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return fallback !== false;
  }

  if (normalized === "0" || normalized === "false" || normalized === "off" || normalized === "no") {
    return false;
  }

  if (normalized === "1" || normalized === "true" || normalized === "on" || normalized === "yes") {
    return true;
  }

  return fallback !== false;
}

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(String(value || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function parseJsonObject(value) {
  try {
    const parsed = JSON.parse(String(value || "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
}

function normalizeBlockedTopicTerms(value, fallback) {
  const source = Array.isArray(value)
    ? value
    : (typeof value === "string"
      ? value.split(/[\n,，]+/g)
      : (Array.isArray(fallback) ? fallback : []));
  const seen = new Set();
  const normalized = [];

  source.forEach((entry) => {
    const term = String(entry || "").replace(/\s+/g, " ").trim().slice(0, 80);
    const dedupeKey = term.toLowerCase();
    if (!term || seen.has(dedupeKey)) {
      return;
    }
    seen.add(dedupeKey);
    normalized.push(term);
  });

  return normalized.slice(0, 40);
}

async function ensureAiFeedSchema(env) {
  if (shouldTrustProvisionedAiFeedSchema(env)) {
    return;
  }

  if (!env || !env.DB) {
    return;
  }

  if (!aiFeedSchemaReadyPromise) {
    aiFeedSchemaReadyPromise = ensureAiFeedSchemaUncached(env).catch((error) => {
      aiFeedSchemaReadyPromise = null;
      throw error;
    });
  }

  await aiFeedSchemaReadyPromise;
}

async function ensureAiFeedSchemaUncached(env) {
  const ddlStatements = [
    `
      CREATE TABLE IF NOT EXISTS user_ai_settings (
        user_id TEXT PRIMARY KEY,
        reply_ai_enabled INTEGER NOT NULL DEFAULT 0,
        provider_base_url TEXT NOT NULL DEFAULT '',
        model TEXT NOT NULL DEFAULT '',
        moderation_prompt TEXT NOT NULL DEFAULT '',
        api_key_ciphertext TEXT NOT NULL DEFAULT '',
        api_key_last4 TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `,
    `
      CREATE TABLE IF NOT EXISTS timeline_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sync_key TEXT NOT NULL,
        user_id TEXT,
        device_id TEXT,
        timeline_kind TEXT NOT NULL DEFAULT '',
        page_url TEXT,
        status_id TEXT,
        author_handle TEXT,
        author_display_name TEXT,
        post_text TEXT,
        quote_text TEXT,
        link_title TEXT,
        media_mode TEXT NOT NULL DEFAULT 'text',
        text_sparse INTEGER NOT NULL DEFAULT 0,
        seen_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        post_fingerprint TEXT
      )
    `,
    "CREATE INDEX IF NOT EXISTS idx_timeline_posts_user_seen_at ON timeline_posts(user_id, seen_at DESC, id DESC)",
    "CREATE INDEX IF NOT EXISTS idx_timeline_posts_sync_seen_at ON timeline_posts(sync_key, seen_at DESC, id DESC)",
    "CREATE INDEX IF NOT EXISTS idx_timeline_posts_device_seen_at ON timeline_posts(device_id, seen_at DESC, id DESC)",
    `
      CREATE UNIQUE INDEX IF NOT EXISTS idx_timeline_posts_post_fingerprint_unique
      ON timeline_posts(post_fingerprint)
      WHERE post_fingerprint IS NOT NULL AND TRIM(post_fingerprint) != ''
    `,
    `
      CREATE TABLE IF NOT EXISTS timeline_ai_results (
        post_id INTEGER PRIMARY KEY,
        blocked INTEGER NOT NULL DEFAULT 0,
        matched_blocked_terms_json TEXT NOT NULL DEFAULT '[]',
        confidence TEXT NOT NULL DEFAULT 'low',
        reason_short TEXT NOT NULL DEFAULT '',
        limited_by_video INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'skipped',
        model TEXT NOT NULL DEFAULT '',
        raw_response_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `,
    "CREATE INDEX IF NOT EXISTS idx_timeline_ai_results_status_updated_at ON timeline_ai_results(status, updated_at DESC)"
    ,
    `
      CREATE TABLE IF NOT EXISTS reply_ai_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sync_key TEXT NOT NULL,
        user_id TEXT,
        device_id TEXT,
        thread_url TEXT,
        thread_status_id TEXT,
        reply_status_id TEXT,
        reply_handle TEXT,
        reply_display_name TEXT,
        reply_text TEXT,
        main_post_text TEXT,
        account_protected INTEGER NOT NULL DEFAULT 0,
        avatar_image_url TEXT NOT NULL DEFAULT '',
        avatar_alt_text TEXT NOT NULL DEFAULT '',
        avatar_evidence_tags_json TEXT NOT NULL DEFAULT '[]',
        avatar_fetch_status TEXT NOT NULL DEFAULT 'not_requested',
        avatar_vision_requested INTEGER NOT NULL DEFAULT 0,
        profile_path TEXT NOT NULL DEFAULT '',
        profile_bio_text TEXT NOT NULL DEFAULT '',
        profile_signal_tags_json TEXT NOT NULL DEFAULT '[]',
        profile_links_json TEXT NOT NULL DEFAULT '[]',
        profile_fetch_status TEXT NOT NULL DEFAULT 'not_requested',
        profile_fetched_at TEXT,
        created_at TEXT NOT NULL,
        item_fingerprint TEXT
      )
    `,
    "CREATE INDEX IF NOT EXISTS idx_reply_ai_items_user_created_at ON reply_ai_items(user_id, created_at DESC, id DESC)",
    "CREATE INDEX IF NOT EXISTS idx_reply_ai_items_sync_created_at ON reply_ai_items(sync_key, created_at DESC, id DESC)",
    "CREATE INDEX IF NOT EXISTS idx_reply_ai_items_handle_created_at ON reply_ai_items(reply_handle, created_at DESC, id DESC)",
    `
      CREATE UNIQUE INDEX IF NOT EXISTS idx_reply_ai_items_fingerprint_unique
      ON reply_ai_items(item_fingerprint)
      WHERE item_fingerprint IS NOT NULL AND TRIM(item_fingerprint) != ''
    `,
    `
      CREATE TABLE IF NOT EXISTS reply_ai_results (
        item_id INTEGER PRIMARY KEY,
        action TEXT NOT NULL DEFAULT 'allow',
        decision_layer TEXT NOT NULL DEFAULT 'skipped',
        matched_safety_labels_json TEXT NOT NULL DEFAULT '[]',
        matched_profile_signals_json TEXT NOT NULL DEFAULT '[]',
        confidence TEXT NOT NULL DEFAULT 'low',
        reason_short TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'skipped',
        model TEXT NOT NULL DEFAULT '',
        raw_response_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `,
    "CREATE INDEX IF NOT EXISTS idx_reply_ai_results_status_updated_at ON reply_ai_results(status, updated_at DESC)",
    `
      CREATE TABLE IF NOT EXISTS reply_ai_memory (
        id TEXT PRIMARY KEY,
        memory_key TEXT NOT NULL,
        memory_key_type TEXT NOT NULL DEFAULT 'exact_text',
        action TEXT NOT NULL DEFAULT 'hide',
        confidence TEXT NOT NULL DEFAULT 'high',
        matched_safety_labels_json TEXT NOT NULL DEFAULT '[]',
        matched_profile_signals_json TEXT NOT NULL DEFAULT '[]',
        reason_short TEXT NOT NULL DEFAULT '',
        prompt_version TEXT NOT NULL DEFAULT '',
        source_item_id INTEGER,
        source_result_updated_at TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        disabled_reason TEXT NOT NULL DEFAULT '',
        expires_at TEXT,
        hit_count INTEGER NOT NULL DEFAULT 0,
        first_seen_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `,
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_reply_ai_memory_key_version_unique ON reply_ai_memory(memory_key, prompt_version)",
    "CREATE INDEX IF NOT EXISTS idx_reply_ai_memory_status_expires ON reply_ai_memory(status, expires_at, updated_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_reply_ai_memory_source_item ON reply_ai_memory(source_item_id, updated_at DESC)",
    `
      CREATE TABLE IF NOT EXISTS reply_ai_account_risk (
        reply_handle TEXT PRIMARY KEY,
        total_high_confidence_hide_count INTEGER NOT NULL DEFAULT 0,
        recent_high_confidence_hide_count INTEGER NOT NULL DEFAULT 0,
        active_global_block INTEGER NOT NULL DEFAULT 0,
        first_flagged_at TEXT,
        last_flagged_at TEXT,
        global_blocked_at TEXT,
        last_reason_short TEXT NOT NULL DEFAULT '',
        last_item_id INTEGER,
        updated_at TEXT NOT NULL
      )
    `,
    "CREATE INDEX IF NOT EXISTS idx_reply_ai_account_risk_global_block ON reply_ai_account_risk(active_global_block, updated_at DESC)"
    ,
    `
      CREATE TABLE IF NOT EXISTS reply_ai_provider_cooldowns (
        scope_key TEXT PRIMARY KEY,
        user_id TEXT,
        provider_base_url TEXT NOT NULL DEFAULT '',
        model TEXT NOT NULL DEFAULT '',
        failure_count INTEGER NOT NULL DEFAULT 0,
        cooldown_until TEXT,
        last_failure_code TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `,
    "CREATE INDEX IF NOT EXISTS idx_reply_ai_provider_cooldowns_updated_at ON reply_ai_provider_cooldowns(updated_at DESC)",
    `
      CREATE TABLE IF NOT EXISTS ai_provider_cooldowns (
        scope_key TEXT PRIMARY KEY,
        user_id TEXT,
        provider_base_url TEXT NOT NULL DEFAULT '',
        model TEXT NOT NULL DEFAULT '',
        failure_count INTEGER NOT NULL DEFAULT 0,
        cooldown_until TEXT,
        last_failure_code TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `,
    "CREATE INDEX IF NOT EXISTS idx_ai_provider_cooldowns_updated_at ON ai_provider_cooldowns(updated_at DESC)",
    `
      CREATE TABLE IF NOT EXISTS moderation_samples (
        id TEXT PRIMARY KEY,
        sample_fingerprint TEXT,
        source_kind TEXT NOT NULL DEFAULT 'moderation_event',
        source_ref_id TEXT NOT NULL DEFAULT '',
        user_id TEXT,
        sync_key TEXT,
        device_id TEXT,
        contribution_scope TEXT NOT NULL DEFAULT 'private',
        surface TEXT NOT NULL DEFAULT 'reply',
        content_url TEXT,
        thread_status_id TEXT,
        reply_status_id TEXT,
        author_handle TEXT,
        author_display_name TEXT,
        primary_text TEXT,
        context_text TEXT,
        normalized_text TEXT,
        compact_text TEXT,
        account_protected INTEGER NOT NULL DEFAULT 0,
        feature_keys_json TEXT NOT NULL DEFAULT '[]',
        safety_labels_json TEXT NOT NULL DEFAULT '[]',
        quality_status TEXT NOT NULL DEFAULT 'pending',
        sample_weight INTEGER NOT NULL DEFAULT 1,
        first_seen_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `,
    `
      CREATE UNIQUE INDEX IF NOT EXISTS idx_moderation_samples_fingerprint_unique
      ON moderation_samples(sample_fingerprint)
      WHERE sample_fingerprint IS NOT NULL AND TRIM(sample_fingerprint) != ''
    `,
    "CREATE INDEX IF NOT EXISTS idx_moderation_samples_scope_status_updated_at ON moderation_samples(contribution_scope, quality_status, updated_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_moderation_samples_source ON moderation_samples(source_kind, source_ref_id)",
    "CREATE INDEX IF NOT EXISTS idx_moderation_samples_user_updated_at ON moderation_samples(user_id, updated_at DESC)",
    `
      CREATE TABLE IF NOT EXISTS moderation_sample_labels (
        id TEXT PRIMARY KEY,
        sample_id TEXT NOT NULL,
        label_source TEXT NOT NULL DEFAULT 'user_feedback',
        reviewer_user_id TEXT,
        reviewer_sync_key TEXT,
        decision TEXT NOT NULL DEFAULT 'unknown',
        safety_labels_json TEXT NOT NULL DEFAULT '[]',
        reason_short TEXT NOT NULL DEFAULT '',
        confidence TEXT NOT NULL DEFAULT 'low',
        trust_weight INTEGER NOT NULL DEFAULT 1,
        model TEXT NOT NULL DEFAULT '',
        raw_response_json TEXT,
        created_at TEXT NOT NULL
      )
    `,
    "CREATE INDEX IF NOT EXISTS idx_moderation_sample_labels_sample_created_at ON moderation_sample_labels(sample_id, created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_moderation_sample_labels_decision_created_at ON moderation_sample_labels(decision, created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_moderation_sample_labels_reviewer_created_at ON moderation_sample_labels(reviewer_user_id, created_at DESC)",
    `
      CREATE TABLE IF NOT EXISTS moderation_rule_candidates (
        id TEXT PRIMARY KEY,
        rule_type TEXT NOT NULL,
        pattern_key TEXT NOT NULL,
        action TEXT NOT NULL DEFAULT 'hide',
        safety_label TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        positive_label_count INTEGER NOT NULL DEFAULT 0,
        negative_label_count INTEGER NOT NULL DEFAULT 0,
        distinct_user_count INTEGER NOT NULL DEFAULT 0,
        confidence_score INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'candidate',
        source_sample_id TEXT,
        promoted_decision_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        promoted_at TEXT,
        revoked_at TEXT
      )
    `,
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_moderation_rule_candidates_type_key_unique ON moderation_rule_candidates(rule_type, pattern_key)",
    "CREATE INDEX IF NOT EXISTS idx_moderation_rule_candidates_status_score ON moderation_rule_candidates(status, confidence_score DESC, updated_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_moderation_rule_candidates_sample ON moderation_rule_candidates(source_sample_id, updated_at DESC)"
  ];

  for (const statement of ddlStatements) {
    await env.DB.prepare(statement).run();
  }

  try {
    await env.DB.prepare(
      "ALTER TABLE user_preferences ADD COLUMN blocked_topic_terms_json TEXT NOT NULL DEFAULT '[]'"
    ).run();
  } catch (error) {
    if (!isDuplicateColumnError(error, "blocked_topic_terms_json")) {
      throw error;
    }
  }

  const replyAiItemColumns = [
    ["avatar_image_url", "TEXT NOT NULL DEFAULT ''"],
    ["avatar_alt_text", "TEXT NOT NULL DEFAULT ''"],
    ["avatar_evidence_tags_json", "TEXT NOT NULL DEFAULT '[]'"],
    ["avatar_fetch_status", "TEXT NOT NULL DEFAULT 'not_requested'"],
    ["avatar_vision_requested", "INTEGER NOT NULL DEFAULT 0"]
  ];
  for (const [columnName, columnDefinition] of replyAiItemColumns) {
    try {
      await env.DB.prepare(
        `ALTER TABLE reply_ai_items ADD COLUMN ${columnName} ${columnDefinition}`
      ).run();
    } catch (error) {
      if (!isDuplicateColumnError(error, columnName)) {
        throw error;
      }
    }
  }
}

function isDuplicateColumnError(error, columnName) {
  const message = String(error && error.message ? error.message : "").toLowerCase();
  return message.includes("duplicate column") && message.includes(String(columnName || "").toLowerCase());
}

function buildDefaultUserPreferences() {
  return {
    sidebarControlsEnabled: DEFAULT_USER_PREFERENCES.sidebarControlsEnabled,
    blockedTopicTerms: DEFAULT_USER_PREFERENCES.blockedTopicTerms.slice()
  };
}

function serializeUserPreferencesRow(row) {
  if (!row) {
    return buildDefaultUserPreferences();
  }

  return {
    sidebarControlsEnabled: normalizeSidebarControlsEnabled(
      row.sidebar_controls_enabled,
      DEFAULT_USER_PREFERENCES.sidebarControlsEnabled
    ),
    blockedTopicTerms: normalizeBlockedTopicTerms(
      parseJsonArray(row.blocked_topic_terms_json),
      DEFAULT_USER_PREFERENCES.blockedTopicTerms
    )
  };
}

async function getUserPreferences(env, userId) {
  await ensureAiFeedSchema(env);
  if (!userId) {
    return buildDefaultUserPreferences();
  }

  const row = await env.DB.prepare(
    `
      SELECT
        sidebar_controls_enabled,
        blocked_topic_terms_json
      FROM user_preferences
      WHERE user_id = ?
      LIMIT 1
    `
  ).bind(userId).first();

  return serializeUserPreferencesRow(row);
}

async function upsertUserPreferences(env, userId, patch) {
  await ensureAiFeedSchema(env);
  if (!userId) {
    return buildDefaultUserPreferences();
  }

  const current = await getUserPreferences(env, userId);
  const next = {
    sidebarControlsEnabled: normalizeSidebarControlsEnabled(
      patch && patch.sidebarControlsEnabled,
      current.sidebarControlsEnabled
    ),
    blockedTopicTerms: normalizeBlockedTopicTerms(
      patch && patch.blockedTopicTerms,
      current.blockedTopicTerms
    )
  };
  const now = new Date().toISOString();

  await env.DB.prepare(
    `
      INSERT INTO user_preferences (
        user_id,
        sidebar_controls_enabled,
        blocked_topic_terms_json,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        sidebar_controls_enabled = excluded.sidebar_controls_enabled,
        blocked_topic_terms_json = excluded.blocked_topic_terms_json,
        updated_at = excluded.updated_at
    `
  ).bind(
    userId,
    next.sidebarControlsEnabled ? 1 : 0,
    JSON.stringify(next.blockedTopicTerms),
    now,
    now
  ).run();

  return next;
}

function buildDefaultUserAiSettings() {
  return {
    replyAiEnabled: DEFAULT_USER_AI_SETTINGS.replyAiEnabled,
    providerBaseUrl: DEFAULT_USER_AI_SETTINGS.providerBaseUrl,
    model: DEFAULT_USER_AI_SETTINGS.model,
    moderationPrompt: DEFAULT_USER_AI_SETTINGS.moderationPrompt,
    apiKeyConfigured: DEFAULT_USER_AI_SETTINGS.apiKeyConfigured,
    apiKeyLast4: DEFAULT_USER_AI_SETTINGS.apiKeyLast4,
    updatedAt: DEFAULT_USER_AI_SETTINGS.updatedAt
  };
}

function normalizeAiProviderBaseUrl(value) {
  const trimmed = String(value || "").trim().replace(/\/+$/, "");
  if (!trimmed) {
    return DEFAULT_USER_AI_SETTINGS.providerBaseUrl;
  }
  const lower = trimmed.toLowerCase();
  const endpointSuffixes = ["/responses", "/chat/completions"];
  for (const suffix of endpointSuffixes) {
    if (lower.endsWith(suffix)) {
      return trimmed.slice(0, -suffix.length).replace(/\/+$/, "");
    }
  }
  return trimmed;
}

function buildResponsesApiEndpoint(baseUrl) {
  const normalized = normalizeAiProviderBaseUrl(baseUrl);
  return `${normalized}/responses`;
}

function buildChatCompletionsApiEndpoint(baseUrl) {
  const normalized = normalizeAiProviderBaseUrl(baseUrl);
  return `${normalized}/chat/completions`;
}

function isGeminiOpenAiCompatibleBaseUrl(baseUrl) {
  const normalized = normalizeAiProviderBaseUrl(baseUrl);
  return /generativelanguage\.googleapis\.com/i.test(normalized) && /\/openai$/i.test(normalized);
}

function isOfficialOpenAiCompatibleBaseUrl(baseUrl) {
  const normalized = normalizeAiProviderBaseUrl(baseUrl);
  try {
    const hostname = new URL(normalized).hostname;
    return /(^|\.)openai\.com$/i.test(hostname);
  } catch (error) {
    return /openai\.com/i.test(normalized);
  }
}

function normalizeAiModerationTaskType(value, fallback) {
  const normalized = String(value || fallback || "").trim().toLowerCase();
  if (Object.values(AI_MODERATION_TASK_TYPES).includes(normalized)) {
    return normalized;
  }
  return String(fallback || AI_MODERATION_TASK_TYPES.REPLY_REALTIME_MODERATION).trim().toLowerCase();
}

function normalizeAiProviderAdapterKey(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (Object.values(AI_PROVIDER_ADAPTER_KEYS).includes(normalized)) {
    return normalized;
  }
  return AI_PROVIDER_ADAPTER_KEYS.OPENAI_COMPATIBLE;
}

function normalizeAiProviderResponseMode(baseUrl) {
  if (isOfficialOpenAiCompatibleBaseUrl(baseUrl)) {
    return AI_PROVIDER_RESPONSE_MODES.RESPONSES_JSON_SCHEMA;
  }
  return isGeminiOpenAiCompatibleBaseUrl(baseUrl)
    ? AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_SCHEMA
    : AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_OBJECT;
}

function normalizeAiModel(value) {
  return String(value || "").trim().slice(0, 120) || DEFAULT_AI_FEED_MODEL;
}

function normalizeAiAction(value, fallback) {
  const normalized = String(value || fallback || "").trim().toLowerCase();
  return normalized === "hide" ? "hide" : "allow";
}

function normalizeAiModerationResultStatus(value, fallback) {
  const normalized = String(value || fallback || "").trim().toLowerCase();
  if (["ready", "failed", "skipped", "pending"].includes(normalized)) {
    return normalized;
  }
  return String(fallback || "skipped").trim().toLowerCase() || "skipped";
}

function buildDefaultAiModerationResult(overrides) {
  return Object.assign({
    action: "allow",
    confidence: "low",
    matchedTerms: [],
    matchedLabels: [],
    matchedProfileSignals: [],
    reasonShort: "",
    status: "skipped",
    model: "",
    rawResponseMeta: null
  }, overrides || {});
}

function normalizeAiProviderMatchedTerms(value) {
  const source = Array.isArray(value) ? value : [];
  const seen = new Set();
  const normalized = [];
  source.forEach((item) => {
    const next = String(item || "").replace(/\s+/g, " ").trim().slice(0, 80);
    const dedupeKey = next.toLowerCase();
    if (!next || seen.has(dedupeKey)) {
      return;
    }
    seen.add(dedupeKey);
    normalized.push(next);
  });
  return normalized.slice(0, 16);
}

function normalizeAiModerationResult(source, options) {
  const settings = options || {};
  const result = buildDefaultAiModerationResult(source || {});
  const allowedMatchedTerms = Array.isArray(settings.allowedMatchedTerms) ? settings.allowedMatchedTerms : [];
  const allowedTermMap = new Map(
    allowedMatchedTerms.map((term) => [String(term || "").trim().toLowerCase(), String(term || "").trim()])
  );
  const matchedTerms = allowedTermMap.size
    ? normalizeAiProviderMatchedTerms(result.matchedTerms)
      .map((term) => allowedTermMap.get(term.toLowerCase()) || "")
      .filter(Boolean)
    : normalizeAiProviderMatchedTerms(result.matchedTerms);

  return {
    action: normalizeAiAction(result.action),
    confidence: ["high", "medium", "low"].includes(String(result.confidence || "").trim().toLowerCase())
      ? String(result.confidence || "").trim().toLowerCase()
      : "low",
    matchedTerms,
    matchedLabels: normalizeReplyAiStringList(result.matchedLabels, settings.allowedMatchedLabels || null, 8),
    matchedProfileSignals: normalizeReplyAiStringList(
      result.matchedProfileSignals,
      settings.allowedMatchedProfileSignals || null,
      8
    ),
    reasonShort: normalizeAiFeedText(result.reasonShort, 120),
    status: normalizeAiModerationResultStatus(result.status),
    model: normalizeAiFeedText(settings.model || result.model, 80),
    rawResponseMeta: settings.rawResponseMeta || result.rawResponseMeta || null
  };
}

function buildAiProviderConfig(settings, overrides) {
  const source = Object.assign({}, settings || {}, overrides || {});
  const providerBaseUrl = normalizeAiProviderBaseUrl(
    Object.prototype.hasOwnProperty.call(source, "providerBaseUrl")
      ? source.providerBaseUrl
      : DEFAULT_AI_PROVIDER_BASE_URL
  );
  const model = normalizeAiModel(
    Object.prototype.hasOwnProperty.call(source, "model")
      ? source.model
      : DEFAULT_AI_FEED_MODEL
  );
  const moderationPrompt = normalizeAiModerationPrompt(
    Object.prototype.hasOwnProperty.call(source, "moderationPrompt")
      ? source.moderationPrompt
      : ""
  );
  const apiKey = String(source && source.apiKey ? source.apiKey : "").trim();
  return {
    adapterKey: normalizeAiProviderAdapterKey(source.adapterKey),
    providerBaseUrl,
    model,
    moderationPrompt,
    apiKey,
    responseMode: normalizeAiProviderResponseMode(providerBaseUrl)
  };
}

function buildAiProviderScopeKey(userId, settings) {
  const normalizedUserId = String(userId || "").trim();
  if (!normalizedUserId) {
    return "";
  }

  const providerConfig = buildAiProviderConfig(settings);
  return [
    normalizedUserId,
    providerConfig.adapterKey,
    providerConfig.providerBaseUrl,
    providerConfig.model
  ].join("|");
}

function buildAiModerationTask(input) {
  const source = input || {};
  const providerConfig = buildAiProviderConfig(source.providerConfig || source.settings || {}, source.providerOverrides);
  return {
    taskType: normalizeAiModerationTaskType(source.taskType),
    providerConfig,
    schemaName: normalizeAiFeedText(source.schemaName, 120),
    responseSchema: source.responseSchema || { type: "object", additionalProperties: false, properties: {}, required: [] },
    developerPrompt: String(source.developerPrompt || "").trim(),
    userPayloadText: String(source.userPayloadText || "").trim(),
    metadata: source.metadata && typeof source.metadata === "object" ? source.metadata : {}
  };
}

function normalizeAiModerationPrompt(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
    .trim()
    .slice(0, 4000);
}

function normalizeAiKeyLast4(value) {
  const source = String(value || "").trim();
  return source ? source.slice(-4) : "";
}

function uint8ArrayToBase64(bytes) {
  let output = "";
  for (let index = 0; index < bytes.length; index += 1) {
    output += String.fromCharCode(bytes[index]);
  }
  return btoa(output);
}

function base64ToUint8Array(value) {
  const binary = atob(String(value || ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function getAiSettingsEncryptionSecret(env) {
  return String(
    env.USER_AI_SETTINGS_SECRET
    || env.EMAIL_SEND_TOKEN
    || env.RESEND_API_KEY
    || env.OPENAI_API_KEY
    || ""
  ).trim();
}

async function getAiSettingsEncryptionKey(env) {
  const secret = getAiSettingsEncryptionSecret(env);
  if (!secret) {
    throw new Error("missing-ai-settings-secret");
  }

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptAiSettingValue(env, plaintext) {
  const normalized = String(plaintext || "").trim();
  if (!normalized) {
    return "";
  }

  const key = await getAiSettingsEncryptionKey(env);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(normalized)
  );
  return `${uint8ArrayToBase64(iv)}.${uint8ArrayToBase64(new Uint8Array(cipherBuffer))}`;
}

async function decryptAiSettingValue(env, ciphertext) {
  const normalized = String(ciphertext || "").trim();
  if (!normalized) {
    return "";
  }

  const [ivBase64, payloadBase64] = normalized.split(".");
  if (!ivBase64 || !payloadBase64) {
    return "";
  }

  const key = await getAiSettingsEncryptionKey(env);
  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToUint8Array(ivBase64) },
    key,
    base64ToUint8Array(payloadBase64)
  );
  return new TextDecoder().decode(plainBuffer);
}

function serializeUserAiSettingsRow(row) {
  const fallback = buildDefaultUserAiSettings();
  if (!row) {
    return fallback;
  }

  return {
    replyAiEnabled: normalizeSidebarControlsEnabled(
      row.reply_ai_enabled,
      fallback.replyAiEnabled
    ),
    providerBaseUrl: normalizeAiProviderBaseUrl(row.provider_base_url || fallback.providerBaseUrl),
    model: normalizeAiModel(row.model || fallback.model),
    moderationPrompt: normalizeAiModerationPrompt(row.moderation_prompt || fallback.moderationPrompt),
    apiKeyConfigured: Boolean(String(row.api_key_ciphertext || "").trim()),
    apiKeyLast4: normalizeAiKeyLast4(row.api_key_last4 || ""),
    updatedAt: normalizeAiFeedText(row.updated_at || fallback.updatedAt, 80)
  };
}

async function getUserAiSettingsRow(env, userId) {
  await ensureAiFeedSchema(env);
  if (!userId) {
    return null;
  }

  return env.DB.prepare(
    `
      SELECT
        reply_ai_enabled,
        provider_base_url,
        model,
        moderation_prompt,
        api_key_ciphertext,
        api_key_last4,
        updated_at
      FROM user_ai_settings
      WHERE user_id = ?
      LIMIT 1
    `
  ).bind(userId).first();
}

async function getUserAiSettings(env, userId) {
  return serializeUserAiSettingsRow(await getUserAiSettingsRow(env, userId));
}

async function getUserAiSettingsWithSecret(env, userId) {
  const row = await getUserAiSettingsRow(env, userId);
  const settings = serializeUserAiSettingsRow(row);
  const apiKeyCiphertext = row && row.api_key_ciphertext ? String(row.api_key_ciphertext || "").trim() : "";
  let apiKey = "";
  if (apiKeyCiphertext) {
    try {
      apiKey = await decryptAiSettingValue(env, apiKeyCiphertext);
    } catch (error) {
      apiKey = "";
    }
  }

  return Object.assign({}, settings, {
    apiKey
  });
}

async function upsertUserAiSettings(env, userId, patch) {
  await ensureAiFeedSchema(env);
  if (!userId) {
    return buildDefaultUserAiSettings();
  }

  const currentRow = await getUserAiSettingsRow(env, userId);
  const current = serializeUserAiSettingsRow(currentRow);
  const currentCiphertext = currentRow && currentRow.api_key_ciphertext ? String(currentRow.api_key_ciphertext || "").trim() : "";
  const apiKeyProvided = Object.prototype.hasOwnProperty.call(patch || {}, "apiKey");
  const nextApiKey = apiKeyProvided
    ? String(patch && patch.apiKey ? patch.apiKey : "").trim()
    : "";
  const nextCiphertext = apiKeyProvided
    ? (nextApiKey ? await encryptAiSettingValue(env, nextApiKey) : "")
    : currentCiphertext;
  const next = {
    replyAiEnabled: normalizeSidebarControlsEnabled(
      patch && patch.replyAiEnabled,
      current.replyAiEnabled
    ),
    providerBaseUrl: normalizeAiProviderBaseUrl(
      patch && Object.prototype.hasOwnProperty.call(patch, "providerBaseUrl")
        ? patch.providerBaseUrl
        : current.providerBaseUrl
    ),
    model: normalizeAiModel(
      patch && Object.prototype.hasOwnProperty.call(patch, "model")
        ? patch.model
        : current.model
    ),
    moderationPrompt: normalizeAiModerationPrompt(
      patch && Object.prototype.hasOwnProperty.call(patch, "moderationPrompt")
        ? patch.moderationPrompt
        : current.moderationPrompt
    ),
    apiKeyConfigured: Boolean(nextCiphertext),
    apiKeyLast4: apiKeyProvided ? normalizeAiKeyLast4(nextApiKey) : current.apiKeyLast4
  };
  const now = new Date().toISOString();

  await env.DB.prepare(
    `
      INSERT INTO user_ai_settings (
        user_id,
        reply_ai_enabled,
        provider_base_url,
        model,
        moderation_prompt,
        api_key_ciphertext,
        api_key_last4,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        reply_ai_enabled = excluded.reply_ai_enabled,
        provider_base_url = excluded.provider_base_url,
        model = excluded.model,
        moderation_prompt = excluded.moderation_prompt,
        api_key_ciphertext = excluded.api_key_ciphertext,
        api_key_last4 = excluded.api_key_last4,
        updated_at = excluded.updated_at
    `
  ).bind(
    userId,
    next.replyAiEnabled ? 1 : 0,
    next.providerBaseUrl,
    next.model,
    next.moderationPrompt,
    nextCiphertext,
    next.apiKeyLast4,
    now,
    now
  ).run();

  return next;
}

async function getUserAiSettingsForSyncKey(env, syncKey) {
  await ensureAiFeedSchema(env);
  if (!syncKey) {
    return buildDefaultUserAiSettings();
  }

  const row = await env.DB.prepare(
    `
      SELECT uas.reply_ai_enabled,
        uas.provider_base_url,
        uas.model,
        uas.moderation_prompt,
        uas.api_key_ciphertext,
        uas.api_key_last4,
        uas.updated_at
      FROM sync_keys sk
      LEFT JOIN user_ai_settings uas
        ON uas.user_id = sk.user_id
      WHERE sk.sync_key = ?
      LIMIT 1
    `
  ).bind(syncKey).first();

  return serializeUserAiSettingsRow(row);
}

async function getSidebarControlsEnabledForSyncKey(env, syncKey) {
  await ensureAiFeedSchema(env);
  if (!syncKey) {
    return DEFAULT_USER_PREFERENCES.sidebarControlsEnabled;
  }

  const row = await env.DB.prepare(
    `
      SELECT
        up.sidebar_controls_enabled
      FROM sync_keys sk
      LEFT JOIN user_preferences up
        ON up.user_id = sk.user_id
      WHERE sk.sync_key = ?
      LIMIT 1
    `
  ).bind(syncKey).first();

  return normalizeSidebarControlsEnabled(
    row && row.sidebar_controls_enabled,
    DEFAULT_USER_PREFERENCES.sidebarControlsEnabled
  );
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
        FROM moderation_events me
        WHERE event_type IN ('manual_hide', 'manual_allow')
          AND ${buildNonTestModerationEventSql("me")}
      `
    ).first(),
    env.DB.prepare(
      `
        SELECT
          COUNT(d.id) AS total_rows,
          COALESCE(SUM(d.confirm_count), 0) AS confirm_sum,
          COALESCE(SUM(d.revoke_count), 0) AS revoke_sum,
          COALESCE(MAX(d.last_confirmed_at), '') AS max_confirmed_at,
          COALESCE(MAX(d.revoked_at), '') AS max_revoked_at
        FROM developer_global_decisions d
        LEFT JOIN moderation_events me
          ON me.id = d.event_id
        WHERE ${buildVisibleDeveloperEventSql("me")}
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
      logicVersion: GLOBAL_RULE_STATE_CACHE_VERSION,
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
        user_id,
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
      FROM moderation_events me
      WHERE event_type IN ('manual_hide', 'manual_allow')
        AND created_at >= ?
        AND ${buildNonTestModerationEventSql("me")}
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
          contributors: new Set(),
          normalizedTexts: new Set()
        };

        if (row.event_type === "manual_hide") {
          current.hideCount += 1;
          const contributorKey = buildRuleContributorKey(row);
          if (contributorKey) {
            current.contributors.add(contributorKey);
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
          contributors: new Set(),
          handles: new Set()
        };

        if (row.event_type === "manual_hide") {
          current.hideCount += 1;
          const contributorKey = buildRuleContributorKey(row);
          if (contributorKey) {
            current.contributors.add(contributorKey);
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
      && value.contributors.size >= GLOBAL_TEMPLATE_MIN_CONTRIBUTORS
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
      && value.contributors.size >= autoGlobalExactConfig.minContributors
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
  const configuredContributors = env && env.GLOBAL_RULE_MIN_CONTRIBUTORS
    ? env.GLOBAL_RULE_MIN_CONTRIBUTORS
    : (env && env.GLOBAL_RULE_MIN_SYNC_KEYS ? env.GLOBAL_RULE_MIN_SYNC_KEYS : AUTO_GLOBAL_EXACT_MIN_CONTRIBUTORS);
  const minContributors = Math.max(
    AUTO_GLOBAL_EXACT_MIN_CONTRIBUTORS,
    Number(configuredContributors) || AUTO_GLOBAL_EXACT_MIN_CONTRIBUTORS
  );
  const minScore = Math.max(4, Number(env && env.GLOBAL_RULE_MIN_SCORE ? env.GLOBAL_RULE_MIN_SCORE : 4) || 4);
  const windowDays = Math.max(GLOBAL_TEMPLATE_WINDOW_DAYS, Number(env && env.AUTO_GLOBAL_EXACT_WINDOW_DAYS ? env.AUTO_GLOBAL_EXACT_WINDOW_DAYS : AUTO_GLOBAL_EXACT_WINDOW_DAYS) || AUTO_GLOBAL_EXACT_WINDOW_DAYS);
  const minHides = Math.max(2, Number(env && env.AUTO_GLOBAL_EXACT_MIN_HIDES ? env.AUTO_GLOBAL_EXACT_MIN_HIDES : AUTO_GLOBAL_EXACT_MIN_HIDES) || AUTO_GLOBAL_EXACT_MIN_HIDES);
  return {
    minContributors,
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
    + Number(source.contributors ? source.contributors.size : 0)
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
  eventRow.eventFingerprint = await buildModerationEventFingerprint(eventRow);

  if (eventRow.eventFingerprint) {
    const existingByFingerprint = await env.DB.prepare(
      "SELECT id FROM moderation_events WHERE event_fingerprint = ? LIMIT 1"
    ).bind(eventRow.eventFingerprint).first();
    if (existingByFingerprint) {
      return { deduped: true };
    }
  }

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

  try {
    const insertResult = await env.DB.prepare(
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
          created_at,
          event_fingerprint
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      eventRow.createdAt,
      eventRow.eventFingerprint
    ).run();
    eventRow.id = Number(insertResult && insertResult.meta && insertResult.meta.last_row_id ? insertResult.meta.last_row_id : 0);
  } catch (error) {
    if (eventRow.eventFingerprint && isEventFingerprintConflictError(error)) {
      const existingByFingerprint = await env.DB.prepare(
        "SELECT id FROM moderation_events WHERE event_fingerprint = ? LIMIT 1"
      ).bind(eventRow.eventFingerprint).first();
      if (existingByFingerprint) {
        return { deduped: true };
      }
    }
    throw error;
  }

  if (!eventRow.id && eventRow.eventFingerprint) {
    const inserted = await env.DB.prepare(
      "SELECT id FROM moderation_events WHERE event_fingerprint = ? LIMIT 1"
    ).bind(eventRow.eventFingerprint).first();
    eventRow.id = Number(inserted && inserted.id ? inserted.id : 0);
  }

  return { deduped: false, eventId: Number(eventRow.id || 0), eventRow };
}

function normalizeModerationTrainingEventType(value) {
  const normalized = String(value || "").trim();
  return normalized === "manual_hide" || normalized === "manual_allow" ? normalized : "";
}

function normalizeStoredReplyText(replyText, replyDisplayName, replyHandle) {
  const normalized = normalizeAiFeedText(replyText || "", 1200);
  if (normalized) {
    return normalized;
  }

  const displayName = normalizeAiFeedText(replyDisplayName || "", 160);
  const handle = normalizeAiHandle(replyHandle || "");
  const parts = [];
  if (displayName) {
    parts.push(displayName);
  }
  if (handle) {
    parts.push(handle);
  }
  return parts.length ? `账号线索：${parts.join(" ")}` : "";
}

function buildModerationTrainingSourceRow(source) {
  const row = source && typeof source === "object" ? source : {};
  const replyDisplayName = normalizeAiFeedText(row.replyDisplayName || row.reply_display_name || "", 200);
  const replyHandle = normalizeAiHandle(row.replyHandle || row.reply_handle || "");
  const primaryText = normalizeStoredReplyText(
    row.replyText || row.reply_text || row.primaryText || row.primary_text || "",
    replyDisplayName,
    replyHandle
  );
  const normalizedText = normalizeAiFeedText(
    row.normalizedText || row.normalized_text || normalizeRuleText(primaryText),
    1200
  );
  const compactText = normalizeAiFeedText(
    row.compactText || row.compact_text || buildCompactRuleText(primaryText || normalizedText),
    1200
  );

  return {
    id: Number(row.id || 0),
    syncKey: String(row.syncKey || row.sync_key || "").trim(),
    userId: String(row.userId || row.user_id || "").trim(),
    deviceId: String(row.deviceId || row.device_id || "").trim(),
    threadUrl: normalizeAiFeedText(row.threadUrl || row.thread_url || "", 1200),
    threadStatusId: String(row.threadStatusId || row.thread_status_id || "").trim(),
    replyStatusId: String(row.replyStatusId || row.reply_status_id || "").trim(),
    replyHandle,
    replyDisplayName,
    replyText: primaryText,
    contextText: normalizeAiFeedText(row.mainPostText || row.main_post_text || row.contextText || row.context_text || "", 1200),
    normalizedText,
    compactText,
    accountProtected: Number(row.accountProtected || row.account_protected || 0) === 1,
    createdAt: String(row.createdAt || row.created_at || new Date().toISOString()).trim()
  };
}

function buildModerationTrainingFeatureKeys(sourceRow) {
  const keys = buildRowKeys(sourceRow);
  const templateKey = buildTemplateRuleKeyFromRow(sourceRow);
  return Array.from(new Set([
    keys.statusKey,
    keys.accountKey,
    keys.displayNameKey,
    keys.textKey,
    keys.compactKey,
    keys.patternKey,
    templateKey
  ].filter(Boolean))).slice(0, 24);
}

async function buildModerationTrainingSampleFingerprint(sourceRow) {
  const row = buildModerationTrainingSourceRow(sourceRow);
  if (row.replyStatusId) {
    return sha256Hex(JSON.stringify(["moderation-sample-v1", "reply-status", row.replyStatusId]));
  }

  const contentKey = row.normalizedText || row.compactText || normalizeRuleText(row.replyText);
  const handleKey = normalizeAiHandle(row.replyHandle);
  const displayNameKey = normalizeRuleText(row.replyDisplayName);
  if (!contentKey && !handleKey && !displayNameKey) {
    return "";
  }

  return sha256Hex(JSON.stringify([
    "moderation-sample-v1",
    "reply-content",
    handleKey,
    contentKey,
    displayNameKey,
    row.accountProtected ? "protected" : "public"
  ]));
}

async function upsertModerationTrainingSample(env, source, options) {
  await ensureAiFeedSchema(env);
  const row = buildModerationTrainingSourceRow(source);
  const sampleFingerprint = await buildModerationTrainingSampleFingerprint(row);
  if (!sampleFingerprint) {
    return null;
  }

  const now = new Date().toISOString();
  const sampleId = await sha256Hex(`moderation-sample-id:${sampleFingerprint}`);
  const featureKeys = buildModerationTrainingFeatureKeys(row);
  const sampleOptions = options && typeof options === "object" ? options : {};

  await env.DB.prepare(
    `
      INSERT INTO moderation_samples (
        id,
        sample_fingerprint,
        source_kind,
        source_ref_id,
        user_id,
        sync_key,
        device_id,
        contribution_scope,
        surface,
        content_url,
        thread_status_id,
        reply_status_id,
        author_handle,
        author_display_name,
        primary_text,
        context_text,
        normalized_text,
        compact_text,
        account_protected,
        feature_keys_json,
        safety_labels_json,
        quality_status,
        sample_weight,
        first_seen_at,
        last_seen_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'private', 'reply', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', 'pending', 1, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        source_ref_id = CASE
          WHEN TRIM(COALESCE(moderation_samples.source_ref_id, '')) = '' THEN excluded.source_ref_id
          ELSE moderation_samples.source_ref_id
        END,
        user_id = CASE
          WHEN TRIM(COALESCE(moderation_samples.user_id, '')) = '' THEN excluded.user_id
          ELSE moderation_samples.user_id
        END,
        sync_key = CASE
          WHEN TRIM(COALESCE(moderation_samples.sync_key, '')) = '' THEN excluded.sync_key
          ELSE moderation_samples.sync_key
        END,
        device_id = CASE
          WHEN TRIM(COALESCE(moderation_samples.device_id, '')) = '' THEN excluded.device_id
          ELSE moderation_samples.device_id
        END,
        author_handle = CASE
          WHEN TRIM(COALESCE(excluded.author_handle, '')) != '' THEN excluded.author_handle
          ELSE moderation_samples.author_handle
        END,
        author_display_name = CASE
          WHEN TRIM(COALESCE(excluded.author_display_name, '')) != '' THEN excluded.author_display_name
          ELSE moderation_samples.author_display_name
        END,
        primary_text = CASE
          WHEN TRIM(COALESCE(excluded.primary_text, '')) != '' THEN excluded.primary_text
          ELSE moderation_samples.primary_text
        END,
        context_text = CASE
          WHEN TRIM(COALESCE(excluded.context_text, '')) != '' THEN excluded.context_text
          ELSE moderation_samples.context_text
        END,
        normalized_text = CASE
          WHEN TRIM(COALESCE(excluded.normalized_text, '')) != '' THEN excluded.normalized_text
          ELSE moderation_samples.normalized_text
        END,
        compact_text = CASE
          WHEN TRIM(COALESCE(excluded.compact_text, '')) != '' THEN excluded.compact_text
          ELSE moderation_samples.compact_text
        END,
        feature_keys_json = excluded.feature_keys_json,
        sample_weight = moderation_samples.sample_weight + 1,
        last_seen_at = excluded.last_seen_at,
        updated_at = excluded.updated_at
    `
  ).bind(
    sampleId,
    sampleFingerprint,
    normalizeAiFeedText(sampleOptions.sourceKind || "moderation_event", 80),
    normalizeAiFeedText(sampleOptions.sourceRefId || row.id || "", 120),
    row.userId || null,
    row.syncKey,
    row.deviceId,
    row.threadUrl,
    row.threadStatusId,
    row.replyStatusId,
    row.replyHandle,
    row.replyDisplayName,
    row.replyText,
    row.contextText,
    row.normalizedText,
    row.compactText,
    row.accountProtected ? 1 : 0,
    JSON.stringify(featureKeys),
    row.createdAt || now,
    row.createdAt || now,
    now,
    now
  ).run();

  return {
    sampleId,
    sampleFingerprint,
    sourceRow: row,
    featureKeys
  };
}

async function insertModerationTrainingLabel(env, sample, label) {
  if (!sample || !sample.sampleId) {
    return;
  }

  const source = label && typeof label === "object" ? label : {};
  const decision = ["hide", "allow", "review", "unknown"].includes(String(source.decision || ""))
    ? String(source.decision || "")
    : "unknown";
  const labelSource = normalizeAiFeedText(source.labelSource || "user_feedback", 80);
  const sourceRefId = normalizeAiFeedText(source.sourceRefId || "", 120);
  const labelId = await sha256Hex(JSON.stringify([
    "moderation-sample-label-v1",
    sample.sampleId,
    labelSource,
    sourceRefId,
    source.reviewerUserId || "",
    source.reviewerSyncKey || "",
    decision
  ]));

  await env.DB.prepare(
    `
      INSERT OR IGNORE INTO moderation_sample_labels (
        id,
        sample_id,
        label_source,
        reviewer_user_id,
        reviewer_sync_key,
        decision,
        safety_labels_json,
        reason_short,
        confidence,
        trust_weight,
        model,
        raw_response_json,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).bind(
    labelId,
    sample.sampleId,
    labelSource,
    normalizeAiFeedText(source.reviewerUserId || "", 120) || null,
    normalizeAiFeedText(source.reviewerSyncKey || "", 120),
    decision,
    JSON.stringify(Array.isArray(source.safetyLabels) ? source.safetyLabels.slice(0, 12) : []),
    normalizeAiFeedText(source.reasonShort || "", 180),
    normalizeAiFeedText(source.confidence || "low", 24),
    Math.max(1, Math.min(10, Number(source.trustWeight || 1) || 1)),
    normalizeAiFeedText(source.model || "", 120),
    source.rawResponseJson ? JSON.stringify(source.rawResponseJson) : null,
    normalizeAiFeedText(source.createdAt || new Date().toISOString(), 80)
  ).run();
}

function buildModerationRuleCandidateSourceRow(source) {
  const row = source && typeof source === "object" ? source : {};
  const replyText = normalizeStoredReplyText(
    row.replyText || row.reply_text || row.primaryText || row.primary_text || "",
    row.replyDisplayName || row.reply_display_name || row.authorDisplayName || row.author_display_name || "",
    row.replyHandle || row.reply_handle || row.authorHandle || row.author_handle || ""
  );
  const normalizedText = normalizeRuleText(row.normalizedText || row.normalized_text || replyText);
  const compactText = buildCompactRuleText(row.compactText || row.compact_text || replyText || normalizedText);
  return {
    id: row.id || row.sampleId || row.sample_id || "",
    sync_key: row.syncKey || row.sync_key || "",
    user_id: row.userId || row.user_id || "",
    device_id: row.deviceId || row.device_id || "",
    reply_status_id: row.replyStatusId || row.reply_status_id || "",
    thread_status_id: row.threadStatusId || row.thread_status_id || "",
    reply_handle: row.replyHandle || row.reply_handle || row.authorHandle || row.author_handle || "",
    reply_display_name: row.replyDisplayName || row.reply_display_name || row.authorDisplayName || row.author_display_name || "",
    reply_text: replyText,
    normalized_text: normalizedText,
    compact_text: compactText,
    account_protected: Number(row.accountProtected || row.account_protected || 0) === 1 ? 1 : 0,
    created_at: row.createdAt || row.created_at || new Date().toISOString()
  };
}

function buildModerationRuleCandidateSourceRowFromReplyAiItem(itemRow) {
  return buildModerationRuleCandidateSourceRow({
    id: itemRow && itemRow.id ? itemRow.id : "",
    syncKey: itemRow && itemRow.syncKey ? itemRow.syncKey : "",
    userId: itemRow && itemRow.userId ? itemRow.userId : "",
    deviceId: itemRow && itemRow.deviceId ? itemRow.deviceId : "",
    replyStatusId: itemRow && itemRow.replyStatusId ? itemRow.replyStatusId : "",
    threadStatusId: itemRow && itemRow.threadStatusId ? itemRow.threadStatusId : "",
    replyHandle: itemRow && itemRow.replyHandle ? itemRow.replyHandle : "",
    replyDisplayName: itemRow && itemRow.replyDisplayName ? itemRow.replyDisplayName : "",
    replyText: itemRow && itemRow.replyText ? itemRow.replyText : "",
    accountProtected: itemRow && itemRow.accountProtected ? 1 : 0,
    createdAt: itemRow && itemRow.createdAt ? itemRow.createdAt : new Date().toISOString()
  });
}

function isUsefulModerationRuleExactKey(key) {
  const normalized = String(key || "").trim();
  if (normalized.startsWith("text:")) {
    return normalized.slice(5).length >= 4;
  }
  if (normalized.startsWith("compact:")) {
    return normalized.slice(8).length >= 5;
  }
  return false;
}

function isHighValueModerationPatternKey(key) {
  return [
    "pattern:geo-meetup-bait",
    "pattern:geo-relationship-bait",
    "pattern:bait-question-shape",
    "pattern:low-information-lure-account",
    "pattern:low-information-strong-lure-name",
    "pattern:share-link-scam",
    "pattern:spam-template-signal",
    "pattern:mention-lure-redirect",
    "pattern:explicit-erotic-bait",
    "pattern:decorative-slogan-lure-account",
    "pattern:poetic-slogan-lure-account",
    "pattern:emoji-noise-lure-account",
    "pattern:bilingual-short-slogan-lure-account",
    "pattern:generic-short-slogan-lure-account"
  ].includes(String(key || "").trim());
}

function canAutoActivateModerationPatternKey(key) {
  return [
    "pattern:geo-relationship-bait",
    "pattern:low-information-lure-account",
    "pattern:low-information-strong-lure-name",
    "pattern:share-link-scam",
    "pattern:spam-template-signal",
    "pattern:mention-lure-redirect",
    "pattern:explicit-erotic-bait",
    "pattern:decorative-slogan-lure-account",
    "pattern:poetic-slogan-lure-account",
    "pattern:emoji-noise-lure-account",
    "pattern:bilingual-short-slogan-lure-account",
    "pattern:generic-short-slogan-lure-account"
  ].includes(String(key || "").trim());
}

function isStrongModerationTemplateKey(key) {
  const slots = String(key || "").replace(/^template:/, "").split("+").filter(Boolean);
  if (slots.length < 2) {
    return false;
  }
  const has = (slot) => slots.includes(slot);
  return Boolean(
    has("account_redirect")
    || has("diversion")
    || has("benefit_or_offer")
    || (has("relationship_or_erotic") && (has("hook") || has("meetup")))
    || (has("hook") && has("meetup") && slots.length >= 3)
  );
}

function buildModerationRuleCandidateEntriesFromSourceRow(sourceRow) {
  const row = buildModerationRuleCandidateSourceRow(sourceRow);
  if (Number(row.account_protected || 0) === 1 && !shouldBypassProtectedLearning(row)) {
    return [];
  }

  const keys = buildRowKeys(row);
  const entries = [];
  const add = (ruleType, patternKey) => {
    const normalizedRuleType = normalizeAiFeedText(ruleType, 40);
    const normalizedPatternKey = normalizeAiFeedText(patternKey, 300);
    if (!normalizedRuleType || !normalizedPatternKey) {
      return;
    }
    entries.push({
      ruleType: normalizedRuleType,
      patternKey: normalizedPatternKey,
      candidateKey: `${normalizedRuleType}\u0000${normalizedPatternKey}`
    });
  };

  if (keys.textKey && isUsefulModerationRuleExactKey(keys.textKey)) {
    add("exact_text", keys.textKey);
  }
  if (keys.compactKey && isUsefulModerationRuleExactKey(keys.compactKey)) {
    add("compact_text", keys.compactKey);
  }
  const templateKey = buildTemplateRuleKeyFromRow(row);
  if (templateKey) {
    add("template", templateKey);
  }
  if (keys.patternKey && isHighValueModerationPatternKey(keys.patternKey)) {
    add("pattern", keys.patternKey);
  }

  const seen = new Set();
  return entries.filter((entry) => {
    if (seen.has(entry.candidateKey)) {
      return false;
    }
    seen.add(entry.candidateKey);
    return true;
  });
}

function createModerationRuleCandidateStats(entry) {
  return {
    ruleType: entry.ruleType,
    patternKey: entry.patternKey,
    positiveLabelCount: 0,
    negativeLabelCount: 0,
    positiveScore: 0,
    negativeScore: 0,
    aiHighHideCount: 0,
    developerHideCount: 0,
    distinctHideContributors: new Set(),
    distinctPositiveTexts: new Set(),
    safetyLabelCounts: new Map(),
    firstPositiveSampleId: "",
    firstDeveloperDecisionId: ""
  };
}

function getModerationRuleCandidateContributorKey(row) {
  const userId = normalizeAiFeedText(row && (row.reviewer_user_id || row.user_id), 120);
  if (userId) {
    return `user:${userId}`;
  }
  const syncKey = normalizeAiFeedText(row && (row.reviewer_sync_key || row.sync_key), 120);
  return syncKey ? `sync:${syncKey}` : "";
}

function addSafetyLabelsToCandidateStats(stats, labels) {
  normalizeReplyAiStringList(labels, REPLY_AI_SAFETY_LABELS, 8).forEach((label) => {
    stats.safetyLabelCounts.set(label, (stats.safetyLabelCounts.get(label) || 0) + 1);
  });
}

function addModerationRuleCandidateLabelToStats(stats, row) {
  const decision = String(row && row.decision ? row.decision : "").trim();
  const labelSource = String(row && row.label_source ? row.label_source : "").trim();
  const confidence = String(row && row.confidence ? row.confidence : "low").trim().toLowerCase();
  const trustWeight = Math.max(1, Math.min(10, Number(row && row.trust_weight ? row.trust_weight : 1) || 1));
  const normalizedText = normalizeRuleText(row && (row.normalized_text || row.primary_text || row.reply_text || ""));

  if (decision === "hide") {
    stats.positiveLabelCount += 1;
    stats.positiveScore += trustWeight;
    if (labelSource === "ai" && confidence === "high") {
      stats.aiHighHideCount += 1;
      stats.positiveScore += 2;
    }
    if (labelSource === "developer_review") {
      stats.developerHideCount += 1;
      stats.positiveScore += 4;
      if (row && row.developer_decision_id && !stats.firstDeveloperDecisionId) {
        stats.firstDeveloperDecisionId = String(row.developer_decision_id || "");
      }
    }
    const contributorKey = getModerationRuleCandidateContributorKey(row);
    if (contributorKey) {
      stats.distinctHideContributors.add(contributorKey);
    }
    if (normalizedText) {
      stats.distinctPositiveTexts.add(normalizedText);
    }
    if (!stats.firstPositiveSampleId && row && row.sample_id) {
      stats.firstPositiveSampleId = String(row.sample_id || "");
    }
    addSafetyLabelsToCandidateStats(stats, parseJsonArray(row && row.safety_labels_json));
  } else if (decision === "allow") {
    if (labelSource === "user_feedback" || labelSource === "developer_review") {
      stats.negativeLabelCount += 1;
      stats.negativeScore += trustWeight + 2;
    } else {
      stats.negativeScore += trustWeight;
    }
  }
}

function getModerationRuleCandidateSafetyLabel(stats) {
  let selected = "";
  let selectedCount = 0;
  for (const [label, count] of stats.safetyLabelCounts.entries()) {
    if (count > selectedCount) {
      selected = label;
      selectedCount = count;
    }
  }
  return selected || "lead_gen_spam";
}

function getModerationRuleCandidateConfidenceScore(stats) {
  const score = stats.positiveScore
    + (stats.distinctHideContributors.size * 2)
    + (stats.distinctPositiveTexts.size)
    + (stats.aiHighHideCount * 2)
    + (stats.developerHideCount * 3)
    - (stats.negativeScore * 3);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function shouldActivateModerationRuleCandidate(stats) {
  if (!stats || stats.negativeLabelCount > 0 || stats.positiveLabelCount <= 0) {
    return false;
  }
  if (stats.developerHideCount > 0) {
    return true;
  }
  if (stats.ruleType === "exact_text" || stats.ruleType === "compact_text") {
    return Boolean(
      stats.aiHighHideCount >= 1
      || (stats.distinctHideContributors.size >= 2 && stats.positiveLabelCount >= 2)
    );
  }
  if (stats.ruleType === "template") {
    return Boolean(
      isStrongModerationTemplateKey(stats.patternKey)
      && (
        stats.aiHighHideCount >= 1
        || (stats.distinctHideContributors.size >= 2 && stats.positiveLabelCount >= 2)
      )
    );
  }
  if (stats.ruleType === "pattern") {
    return Boolean(
      canAutoActivateModerationPatternKey(stats.patternKey)
      && (
        stats.aiHighHideCount >= 2
        || (stats.distinctHideContributors.size >= 2 && stats.positiveLabelCount >= 2)
      )
    );
  }
  return false;
}

function buildModerationRuleCandidateDescription(stats) {
  if (stats.ruleType === "template") {
    return "后台学习库模板候选";
  }
  if (stats.ruleType === "pattern") {
    return "后台学习库模式候选";
  }
  return "后台学习库精确候选";
}

async function buildModerationRuleCandidateUpsertStatement(env, stats) {
  const now = new Date().toISOString();
  const status = shouldActivateModerationRuleCandidate(stats) ? "active" : "candidate";
  const confidenceScore = getModerationRuleCandidateConfidenceScore(stats);
  const id = await sha256Hex(JSON.stringify([
    "moderation-rule-candidate-v1",
    stats.ruleType,
    stats.patternKey
  ]));

  return {
    status,
    confidenceScore,
    statement: env.DB.prepare(
      `
        INSERT INTO moderation_rule_candidates (
          id,
          rule_type,
          pattern_key,
          action,
          safety_label,
          description,
          positive_label_count,
          negative_label_count,
          distinct_user_count,
          confidence_score,
          status,
          source_sample_id,
          promoted_decision_id,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, 'hide', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(rule_type, pattern_key) DO UPDATE SET
          action = 'hide',
          safety_label = excluded.safety_label,
          description = excluded.description,
          positive_label_count = excluded.positive_label_count,
          negative_label_count = excluded.negative_label_count,
          distinct_user_count = excluded.distinct_user_count,
          confidence_score = excluded.confidence_score,
          status = CASE
            WHEN moderation_rule_candidates.status = 'rejected' THEN moderation_rule_candidates.status
            ELSE excluded.status
          END,
          source_sample_id = excluded.source_sample_id,
          promoted_decision_id = excluded.promoted_decision_id,
          updated_at = excluded.updated_at
      `
    ).bind(
      id,
      stats.ruleType,
      stats.patternKey,
      getModerationRuleCandidateSafetyLabel(stats),
      buildModerationRuleCandidateDescription(stats),
      stats.positiveLabelCount,
      stats.negativeLabelCount,
      stats.distinctHideContributors.size,
      confidenceScore,
      status,
      stats.firstPositiveSampleId || null,
      stats.firstDeveloperDecisionId || null,
      now,
      now
    )
  };
}

async function upsertModerationRuleCandidateStats(env, stats, dryRun) {
  if (!stats || !stats.ruleType || !stats.patternKey || stats.positiveLabelCount <= 0) {
    return false;
  }
  const status = shouldActivateModerationRuleCandidate(stats) ? "active" : "candidate";
  const confidenceScore = getModerationRuleCandidateConfidenceScore(stats);
  if (dryRun) {
    return {
      status,
      confidenceScore
    };
  }

  const built = await buildModerationRuleCandidateUpsertStatement(env, stats);
  await built.statement.run();

  return {
    status: built.status,
    confidenceScore: built.confidenceScore
  };
}

function addModerationRuleCandidateLabelRowsToStats(rows, requestedEntries) {
  const requestedKeys = requestedEntries && requestedEntries.length
    ? new Set(requestedEntries.map((entry) => entry.candidateKey))
    : null;
  const statsByKey = new Map();

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const sourceRow = buildModerationRuleCandidateSourceRow(row);
    const entries = buildModerationRuleCandidateEntriesFromSourceRow(sourceRow);
    entries.forEach((entry) => {
      if (requestedKeys && !requestedKeys.has(entry.candidateKey)) {
        return;
      }
      const stats = statsByKey.get(entry.candidateKey) || createModerationRuleCandidateStats(entry);
      addModerationRuleCandidateLabelToStats(stats, row);
      statsByKey.set(entry.candidateKey, stats);
    });
  });

  return statsByKey;
}

async function listModerationRuleCandidateLabelRows(env, limit) {
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        ms.id AS sample_id,
        ms.user_id,
        ms.sync_key,
        ms.device_id,
        ms.reply_status_id,
        ms.thread_status_id,
        ms.author_handle AS reply_handle,
        ms.author_display_name AS reply_display_name,
        ms.primary_text AS reply_text,
        ms.normalized_text,
        ms.compact_text,
        ms.account_protected,
        ms.feature_keys_json,
        msl.label_source,
        msl.reviewer_user_id,
        msl.reviewer_sync_key,
        msl.decision,
        msl.safety_labels_json,
        msl.confidence,
        msl.trust_weight,
        msl.created_at
      FROM moderation_samples ms
      JOIN moderation_sample_labels msl
        ON msl.sample_id = ms.id
      ORDER BY msl.created_at DESC
      LIMIT ?
    `
  ).bind(Math.max(1, Math.min(MODERATION_RULE_CANDIDATE_REBUILD_LIMIT, Number(limit || MODERATION_RULE_CANDIDATE_REBUILD_LIMIT)))).all();
  return results;
}

async function listModerationRuleCandidateLabelRowsForEntries(env, entries) {
  if (!Array.isArray(entries) || !entries.length) {
    return [];
  }
  const clauses = entries.map(() => "ms.feature_keys_json LIKE ?").join(" OR ");
  const binds = entries.map((entry) => `%${entry.patternKey}%`);
  binds.push(MODERATION_RULE_CANDIDATE_REFRESH_LIMIT);
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        ms.id AS sample_id,
        ms.user_id,
        ms.sync_key,
        ms.device_id,
        ms.reply_status_id,
        ms.thread_status_id,
        ms.author_handle AS reply_handle,
        ms.author_display_name AS reply_display_name,
        ms.primary_text AS reply_text,
        ms.normalized_text,
        ms.compact_text,
        ms.account_protected,
        ms.feature_keys_json,
        msl.label_source,
        msl.reviewer_user_id,
        msl.reviewer_sync_key,
        msl.decision,
        msl.safety_labels_json,
        msl.confidence,
        msl.trust_weight,
        msl.created_at
      FROM moderation_samples ms
      JOIN moderation_sample_labels msl
        ON msl.sample_id = ms.id
      WHERE ${clauses}
      ORDER BY msl.created_at DESC
      LIMIT ?
    `
  ).bind(...binds).all();
  return results;
}

async function listDeveloperDecisionCandidateRows(env) {
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        d.id AS developer_decision_id,
        d.revoked_at,
        me.id AS event_id,
        me.user_id,
        me.sync_key,
        me.device_id,
        me.reply_status_id,
        me.thread_status_id,
        me.reply_handle,
        me.reply_display_name,
        me.reply_text,
        me.normalized_text,
        me.compact_text,
        me.account_protected,
        me.created_at
      FROM developer_global_decisions d
      JOIN moderation_events me
        ON me.id = d.event_id
      WHERE ${buildVisibleDeveloperEventSql("me")}
      ORDER BY d.last_confirmed_at DESC
      LIMIT 800
    `
  ).all();
  return results;
}

function buildDeveloperDecisionCandidateLabelRow(row) {
  const decision = row && row.revoked_at ? "allow" : "hide";
  return Object.assign({}, row || {}, {
    sample_id: "",
    label_source: "developer_review",
    reviewer_user_id: row && row.user_id ? row.user_id : "",
    reviewer_sync_key: row && row.sync_key ? row.sync_key : "",
    decision,
    safety_labels_json: JSON.stringify(["lead_gen_spam"]),
    confidence: "high",
    trust_weight: decision === "hide" ? 4 : 3
  });
}

async function refreshModerationRuleCandidatesForSourceRow(env, sourceRow) {
  const entries = buildModerationRuleCandidateEntriesFromSourceRow(sourceRow);
  if (!entries.length) {
    return { touched: 0, active: 0, candidate: 0 };
  }
  const [labelRows, developerRows] = await Promise.all([
    listModerationRuleCandidateLabelRowsForEntries(env, entries),
    listDeveloperDecisionCandidateRows(env)
  ]);
  const allRows = labelRows.concat(developerRows.map(buildDeveloperDecisionCandidateLabelRow));
  const statsByKey = addModerationRuleCandidateLabelRowsToStats(allRows, entries);
  let touched = 0;
  let active = 0;
  let candidate = 0;
  for (const stats of statsByKey.values()) {
    const result = await upsertModerationRuleCandidateStats(env, stats, false);
    if (result) {
      touched += 1;
      if (result.status === "active") {
        active += 1;
      } else {
        candidate += 1;
      }
    }
  }
  return { touched, active, candidate };
}

async function rebuildModerationRuleCandidates(env, options) {
  await ensureAiFeedSchema(env);
  const source = options && typeof options === "object" ? options : {};
  const dryRun = Boolean(source.dryRun);
  const [labelRows, developerRows] = await Promise.all([
    listModerationRuleCandidateLabelRows(env, source.limit || MODERATION_RULE_CANDIDATE_REBUILD_LIMIT),
    listDeveloperDecisionCandidateRows(env)
  ]);
  const allRows = labelRows.concat(developerRows.map(buildDeveloperDecisionCandidateLabelRow));
  const statsByKey = addModerationRuleCandidateLabelRowsToStats(allRows);
  let active = 0;
  let candidate = 0;
  let written = 0;
  const batchStatements = [];
  for (const stats of statsByKey.values()) {
    if (!stats || !stats.ruleType || !stats.patternKey || stats.positiveLabelCount <= 0) {
      continue;
    }
    const status = shouldActivateModerationRuleCandidate(stats) ? "active" : "candidate";
    if (status === "active") {
      active += 1;
    } else {
      candidate += 1;
    }
    if (!dryRun) {
      const built = await buildModerationRuleCandidateUpsertStatement(env, stats);
      batchStatements.push(built.statement);
    }
  }
  if (!dryRun) {
    for (let index = 0; index < batchStatements.length; index += 50) {
      await env.DB.batch(batchStatements.slice(index, index + 50));
    }
    written = batchStatements.length;
  }
  return {
    scannedLabels: labelRows.length,
    scannedDeveloperDecisions: developerRows.length,
    evaluatedCandidates: statsByKey.size,
    activeCandidates: active,
    pendingCandidates: candidate,
    writtenCandidates: written
  };
}

async function recordModerationTrainingLabelFromEvent(env, eventRow, options) {
  const eventType = normalizeModerationTrainingEventType(eventRow && eventRow.eventType);
  if (!eventType) {
    return null;
  }

  const sample = await upsertModerationTrainingSample(env, eventRow, {
    sourceKind: "moderation_event",
    sourceRefId: eventRow && eventRow.id ? String(eventRow.id) : ""
  });
  if (!sample) {
    return null;
  }

  await insertModerationTrainingLabel(env, sample, {
    labelSource: "user_feedback",
    sourceRefId: eventRow && eventRow.id ? String(eventRow.id) : "",
    reviewerUserId: eventRow && eventRow.userId ? eventRow.userId : "",
    reviewerSyncKey: eventRow && eventRow.syncKey ? eventRow.syncKey : "",
    decision: eventType === "manual_hide" ? "hide" : "allow",
    reasonShort: eventType === "manual_hide" ? "用户手动冲走" : "用户恢复或放过",
    confidence: "medium",
    trustWeight: 1,
    createdAt: eventRow && eventRow.createdAt ? eventRow.createdAt : new Date().toISOString()
  });

  const captureOptions = options && typeof options === "object" ? options : {};
  if (!captureOptions.skipCandidateRefresh) {
    await refreshModerationRuleCandidatesForSourceRow(env, sample.sourceRow);
  }

  return sample;
}

async function recordModerationTrainingLabelFromReplyAiDecision(env, itemRow, decision, options) {
  if (!itemRow || !itemRow.id || !decision || decision.status !== "ready" || decision.decisionLayer !== "ai") {
    return null;
  }

  const sample = await upsertModerationTrainingSample(env, itemRow, {
    sourceKind: "reply_ai_item",
    sourceRefId: String(itemRow.id)
  });
  if (!sample) {
    return null;
  }

  await insertModerationTrainingLabel(env, sample, {
    labelSource: "ai",
    sourceRefId: String(itemRow.id),
    reviewerUserId: itemRow.userId || "",
    reviewerSyncKey: itemRow.syncKey || "",
    decision: decision.action === "hide" ? "hide" : "allow",
    safetyLabels: Array.isArray(decision.matchedSafetyLabels) ? decision.matchedSafetyLabels : [],
    reasonShort: decision.reasonShort || "AI 首次判断",
    confidence: decision.confidence || "low",
    trustWeight: decision.confidence === "high" ? 2 : 1,
    model: decision.model || "",
    rawResponseJson: decision.rawResponseJson || null,
    createdAt: new Date().toISOString()
  });

  const captureOptions = options && typeof options === "object" ? options : {};
  if (!captureOptions.skipCandidateRefresh) {
    await refreshModerationRuleCandidatesForSourceRow(env, sample.sourceRow);
  }

  return sample;
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

async function claimAnonymousDeviceActivityToUser(env, deviceId, userId) {
  await ensureAiFeedSchema(env);
  const normalizedDeviceId = String(deviceId || "").trim();
  if (!normalizedDeviceId || !userId) {
    return {
      claimedSyncKeys: 0,
      claimedEvents: 0
    };
  }

  const syncKeyRow = await env.DB.prepare(
    `
      SELECT COUNT(*) AS total_count
      FROM sync_keys
      WHERE device_id = ?
        AND (user_id IS NULL OR TRIM(user_id) = '')
    `
  ).bind(normalizedDeviceId).first();
  const eventRow = await env.DB.prepare(
    `
      SELECT COUNT(*) AS total_count
      FROM moderation_events
      WHERE device_id = ?
        AND (user_id IS NULL OR TRIM(user_id) = '')
    `
  ).bind(normalizedDeviceId).first();

  const claimedSyncKeys = Number(syncKeyRow && syncKeyRow.total_count ? syncKeyRow.total_count : 0);
  const claimedEvents = Number(eventRow && eventRow.total_count ? eventRow.total_count : 0);
  if (!claimedSyncKeys && !claimedEvents) {
    return {
      claimedSyncKeys: 0,
      claimedEvents: 0
    };
  }

  const now = new Date().toISOString();
  if (claimedSyncKeys) {
    await env.DB.prepare(
      `
        UPDATE sync_keys
        SET user_id = ?, updated_at = ?, last_seen_at = ?
        WHERE device_id = ?
          AND (user_id IS NULL OR TRIM(user_id) = '')
      `
    ).bind(userId, now, now, normalizedDeviceId).run();
  }

  if (claimedEvents) {
    await env.DB.prepare(
      `
        UPDATE moderation_events
        SET user_id = ?
        WHERE device_id = ?
          AND (user_id IS NULL OR TRIM(user_id) = '')
      `
    ).bind(userId, normalizedDeviceId).run();
  }

  await env.DB.prepare(
    `
      UPDATE timeline_posts
      SET user_id = ?
      WHERE device_id = ?
        AND (user_id IS NULL OR TRIM(user_id) = '')
    `
  ).bind(userId, normalizedDeviceId).run();
  await env.DB.prepare(
    `
      UPDATE reply_ai_items
      SET user_id = ?
      WHERE device_id = ?
        AND (user_id IS NULL OR TRIM(user_id) = '')
    `
  ).bind(userId, normalizedDeviceId).run();

  return {
    claimedSyncKeys,
    claimedEvents
  };
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
    await deleteSessionById(env, sessionId);
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
  const provider = getConfiguredEmailProvider(env);
  if (!provider && String(env.APP_ENV || "").trim() !== "production") {
    return {
      ok: true,
      debugCode: code
    };
  }

  if (!provider && isTruthy(env.ALLOW_PUBLIC_DEBUG_CODE_LOGIN)) {
    return {
      ok: true,
      debugCode: code,
      publicDebugCodeMode: true
    };
  }

  if (!provider && developerEmail && isTruthy(env.ALLOW_DEVELOPER_DEBUG_CODE)) {
    return {
      ok: true,
      debugCode: code,
      developerMode: true
    };
  }

  if (!provider) {
    return {
      ok: false,
      detail: "missing-email-provider"
    };
  }

  const payload = {
    from: String(env.EMAIL_FROM || "no-reply@colorful-toilet.local").trim(),
    to: email,
    subject: "Colorful Toilet 登录验证码",
    text: `你的 Colorful Toilet 登录验证码是 ${code}，10 分钟内有效。`
  };
  const headers = { "Content-Type": "application/json" };
  if (provider.token) {
    headers.Authorization = `Bearer ${provider.token}`;
  }

  const response = await fetch(provider.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  return {
    ok: response.ok,
    detail: response.ok ? provider.kind : `status-${response.status}`
  };
}

async function deleteExpiredAuthCodesForEmail(env, email, nowIso) {
  if (!email) {
    return;
  }

  await env.DB.prepare(
    "DELETE FROM auth_codes WHERE email = ? AND expires_at < ?"
  ).bind(email, nowIso || new Date().toISOString()).run();
}

async function trimAuthCodesForEmail(env, email) {
  if (!email) {
    return;
  }

  const keepCount = getMaxAuthCodesPerEmail(env);
  await env.DB.prepare(
    `
      DELETE FROM auth_codes
      WHERE email = ?
        AND id NOT IN (
          SELECT id
          FROM auth_codes
          WHERE email = ?
          ORDER BY created_at DESC
          LIMIT ?
        )
    `
  ).bind(email, email, keepCount).run();
}

async function deleteExpiredSessions(env, nowIso) {
  await env.DB.prepare(
    "DELETE FROM sessions WHERE expires_at < ?"
  ).bind(nowIso || new Date().toISOString()).run();
}

async function deleteSessionById(env, sessionId) {
  if (!sessionId) {
    return;
  }

  await env.DB.prepare(
    "DELETE FROM sessions WHERE id = ?"
  ).bind(sessionId).run();
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

async function buildModerationEventFingerprint(eventRow) {
  const syncKey = String(eventRow && eventRow.syncKey ? eventRow.syncKey : "").trim();
  const eventType = String(eventRow && eventRow.eventType ? eventRow.eventType : "").trim();
  if (!syncKey || !eventType) {
    return "";
  }

  const replyStatusId = String(eventRow && eventRow.replyStatusId ? eventRow.replyStatusId : "").trim();
  const threadStatusId = String(eventRow && eventRow.threadStatusId ? eventRow.threadStatusId : "").trim();
  const normalizedText = String(eventRow && eventRow.normalizedText ? eventRow.normalizedText : "").trim();
  const replyHandle = String(eventRow && eventRow.replyHandle ? eventRow.replyHandle : "").trim();

  const identity = replyStatusId
    ? ["reply-status", syncKey, eventType, replyStatusId]
    : threadStatusId
      ? ["thread-status", syncKey, eventType, threadStatusId, normalizedText, replyHandle]
      : ["text-handle", syncKey, eventType, normalizedText, replyHandle];

  return sha256Hex(JSON.stringify(identity));
}

function normalizeAiFeedText(value, maxLength) {
  const normalized = String(value || "")
    .replace(ZERO_WIDTH_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!maxLength || maxLength <= 0) {
    return normalized;
  }
  return normalized.slice(0, maxLength);
}

function normalizeAiComparableText(value) {
  return normalizeAiFeedText(value, 4000)
    .toLowerCase()
    .replace(/[~～`!！?？,，。.、:：;；'"“”‘’()[\]{}<>《》…—\-_=+*\/\\|]/g, "")
    .replace(EMOJI_PATTERN, "")
    .replace(/\s+/g, "");
}

function normalizeTimelineKind(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return "unknown";
  }
  if (normalized === "following" || normalized.includes("following") || normalized.includes("正在关注")) {
    return "following";
  }
  if (normalized === "for_you" || normalized === "foryou" || normalized.includes("for you") || normalized.includes("为你")) {
    return "for_you";
  }
  return "unknown";
}

function normalizeMediaMode(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "image" || normalized === "video" || normalized === "mixed") {
    return normalized;
  }
  return "text";
}

function normalizeAiHandle(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }
  const handle = normalized.startsWith("@") ? normalized : `@${normalized}`;
  return handle.toLowerCase().slice(0, 80);
}

function normalizeSeenAt(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizeAiPostSnapshotPayload(payload) {
  const source = payload || {};
  const postText = normalizeAiFeedText(source.postText, TIMELINE_POST_STORAGE_TEXT_LIMIT);
  const quoteText = normalizeAiFeedText(source.quoteText, TIMELINE_POST_STORAGE_TEXT_LIMIT);
  const linkTitle = normalizeAiFeedText(source.linkTitle, TIMELINE_POST_STORAGE_LINK_LIMIT);
  return {
    syncKey: String(source.syncKey || "").trim(),
    deviceId: String(source.deviceId || "").trim(),
    timelineKind: normalizeTimelineKind(source.timelineKind),
    pageUrl: normalizeAiFeedText(source.pageUrl, 1200),
    statusId: String(source.statusId || "").trim().replace(/[^\d]/g, "").slice(0, 32),
    authorHandle: normalizeAiHandle(source.authorHandle),
    authorDisplayName: normalizeAiFeedText(source.authorDisplayName, 200),
    postText,
    quoteText,
    linkTitle,
    mediaMode: normalizeMediaMode(source.mediaMode),
    textSparse: Boolean(source.textSparse) || [postText, quoteText, linkTitle].join(" ").trim().length < 32,
    seenAt: normalizeSeenAt(source.seenAt)
  };
}

function buildTimelinePostLightAiView(postRow) {
  const source = postRow || {};
  return {
    timelineKind: normalizeTimelineKind(source.timelineKind),
    pageUrl: normalizeAiFeedText(source.pageUrl, 1200),
    statusId: String(source.statusId || "").trim().replace(/[^\d]/g, "").slice(0, 32),
    authorHandle: normalizeAiHandle(source.authorHandle),
    authorDisplayName: normalizeAiFeedText(source.authorDisplayName, 200),
    postText: normalizeAiFeedText(source.postText, TIMELINE_POST_LIGHT_TEXT_LIMIT),
    quoteText: normalizeAiFeedText(source.quoteText, TIMELINE_POST_LIGHT_TEXT_LIMIT),
    linkTitle: normalizeAiFeedText(source.linkTitle, TIMELINE_POST_LIGHT_LINK_LIMIT),
    mediaMode: normalizeMediaMode(source.mediaMode),
    textSparse: Boolean(source.textSparse)
  };
}

function buildTimelinePostFullAiView(postRow) {
  const source = postRow || {};
  return {
    timelineKind: normalizeTimelineKind(source.timelineKind),
    pageUrl: normalizeAiFeedText(source.pageUrl, 1200),
    statusId: String(source.statusId || "").trim().replace(/[^\d]/g, "").slice(0, 32),
    authorHandle: normalizeAiHandle(source.authorHandle),
    authorDisplayName: normalizeAiFeedText(source.authorDisplayName, 200),
    postText: normalizeAiFeedText(source.postText, TIMELINE_POST_STORAGE_TEXT_LIMIT),
    quoteText: normalizeAiFeedText(source.quoteText, TIMELINE_POST_STORAGE_TEXT_LIMIT),
    linkTitle: normalizeAiFeedText(source.linkTitle, TIMELINE_POST_STORAGE_LINK_LIMIT),
    mediaMode: normalizeMediaMode(source.mediaMode),
    textSparse: Boolean(source.textSparse),
    seenAt: normalizeAiFeedText(source.seenAt, 80),
    createdAt: normalizeAiFeedText(source.createdAt, 80)
  };
}

function collectTimelineBlockedTopicCandidates(postRow, blockedTopicTerms) {
  const normalizedTerms = normalizeBlockedTopicTerms(blockedTopicTerms);
  if (!normalizedTerms.length) {
    return [];
  }

  const source = postRow || {};
  const searchableText = [
    source.postText,
    source.quoteText,
    source.linkTitle,
    source.authorDisplayName,
    source.authorHandle
  ].filter(Boolean).join(" ");
  const lowerText = String(searchableText || "").toLowerCase();
  const comparableText = normalizeAiComparableText(searchableText);

  return normalizedTerms
    .filter((term) => {
      const normalizedTerm = String(term || "").trim();
      if (!normalizedTerm) {
        return false;
      }
      const comparableTerm = normalizeAiComparableText(normalizedTerm);
      return lowerText.includes(normalizedTerm.toLowerCase())
        || (comparableTerm && comparableText.includes(comparableTerm));
    })
    .sort((left, right) => right.length - left.length)
    .slice(0, 8);
}

function buildTimelineHomeAiDecisionSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      action: {
        type: "string",
        enum: ["hide", "allow"]
      },
      matchedTerms: {
        type: "array",
        items: {
          type: "string"
        }
      },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low"]
      },
      reasonShort: {
        type: "string"
      },
      status: {
        type: "string",
        enum: ["ready", "failed", "skipped"]
      }
    },
    required: ["action", "matchedTerms", "confidence", "reasonShort", "status"]
  };
}

function buildTimelineHomeAiProviderPrompt(settings, options) {
  const isFullAudit = Boolean(options && options.isFullAudit);
  return [
    isFullAudit
      ? "You audit one X post using its complete captured context for a blocked-topic decision."
      : "You classify one X home timeline post using a lightweight realtime view for a blocked-topic decision.",
    "Only hide when the post is clearly about one or more blocked topics.",
    "If confidence is low, return action allow.",
    "matchedTerms must only include exact strings from candidateBlockedTopicTerms.",
    "reasonShort must stay brief.",
    settings && settings.moderationPrompt
      ? `Additional operator guidance: ${settings.moderationPrompt}`
      : ""
  ].filter(Boolean).join(" ");
}

function buildTimelineHomeRealtimeTask(postRow, settings, candidateBlockedTopicTerms) {
  return buildAiModerationTask({
    taskType: AI_MODERATION_TASK_TYPES.HOME_REALTIME_POST,
    providerConfig: settings,
    schemaName: "timeline_post_decision",
    responseSchema: buildTimelineHomeAiDecisionSchema(),
    developerPrompt: buildTimelineHomeAiProviderPrompt(settings, { isFullAudit: false }),
    userPayloadText: JSON.stringify({
      candidateBlockedTopicTerms: normalizeBlockedTopicTerms(candidateBlockedTopicTerms),
      post: buildTimelinePostLightAiView(postRow)
    }),
    metadata: {
      reasoningEffort: "minimal"
    }
  });
}

function buildTimelineFullPostAuditTask(postRow, settings, blockedTopicTerms) {
  return buildAiModerationTask({
    taskType: AI_MODERATION_TASK_TYPES.FULL_POST_AUDIT,
    providerConfig: settings,
    schemaName: "timeline_full_post_audit",
    responseSchema: buildTimelineHomeAiDecisionSchema(),
    developerPrompt: buildTimelineHomeAiProviderPrompt(settings, { isFullAudit: true }),
    userPayloadText: JSON.stringify({
      candidateBlockedTopicTerms: normalizeBlockedTopicTerms(blockedTopicTerms),
      post: buildTimelinePostFullAiView(postRow)
    }),
    metadata: {
      reasoningEffort: "low"
    }
  });
}

async function buildTimelinePostFingerprint(postRow) {
  const syncKey = String(postRow && postRow.syncKey ? postRow.syncKey : "").trim();
  if (!syncKey) {
    return "";
  }

  const statusId = String(postRow && postRow.statusId ? postRow.statusId : "").trim();
  if (statusId) {
    return sha256Hex(JSON.stringify(["timeline-status", syncKey, statusId]));
  }

  const authorHandle = String(postRow && postRow.authorHandle ? postRow.authorHandle : "").trim().toLowerCase();
  const normalizedPostText = normalizeAiComparableText(postRow && postRow.postText ? postRow.postText : "");
  if (!authorHandle && !normalizedPostText) {
    return "";
  }

  return sha256Hex(JSON.stringify([
    "timeline-fallback",
    syncKey,
    authorHandle,
    normalizedPostText.slice(0, 800)
  ]));
}

function buildDefaultAiDecision(overrides) {
  return Object.assign({
    blocked: false,
    matchedBlockedTerms: [],
    confidence: "low",
    reasonShort: "",
    limitedByVideo: false,
    status: "skipped",
    model: ""
  }, overrides || {});
}

function isFinalAiDecisionStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  return normalized === "ready" || normalized === "failed" || normalized === "skipped";
}

function buildTimelineAiDecisionPayload(postId, decision) {
  const source = decision
    ? buildDefaultAiDecision(decision)
    : {
      blocked: false,
      matchedBlockedTerms: [],
      confidence: "low",
      reasonShort: "",
      limitedByVideo: false,
      status: "pending",
      model: ""
    };

  const status = decision
    ? String(source.status || "skipped")
    : "pending";

  return {
    postId: Number(postId || 0),
    blocked: Boolean(source.blocked),
    matchedBlockedTerms: normalizeBlockedTopicTerms(source.matchedBlockedTerms),
    confidence: String(source.confidence || "low"),
    reasonShort: normalizeAiFeedText(source.reasonShort, 120),
    limitedByVideo: Boolean(source.limitedByVideo),
    status,
    model: normalizeAiFeedText(source.model, 80),
    isFinal: isFinalAiDecisionStatus(status)
  };
}

function normalizeTimelineAiDecision(decision, blockedTopicTerms, model, rawResponseMeta) {
  const normalized = normalizeAiModerationResult(decision, {
    allowedMatchedTerms: normalizeBlockedTopicTerms(blockedTopicTerms),
    model,
    rawResponseMeta
  });
  const blocked = normalized.action === "hide"
    && normalized.matchedTerms.length > 0
    && (normalized.confidence === "high" || normalized.confidence === "medium")
    && normalized.status === "ready";

  return {
    blocked,
    matchedBlockedTerms: normalized.matchedTerms,
    confidence: normalized.confidence,
    reasonShort: normalized.reasonShort,
    limitedByVideo: false,
    status: normalized.status,
    model: normalized.model,
    rawResponseJson: normalized.rawResponseMeta || null
  };
}

async function upsertTimelinePost(env, payload) {
  await ensureAiFeedSchema(env);
  await touchSyncKey(env, payload.syncKey, payload.deviceId);

  const userBinding = await env.DB.prepare(
    "SELECT user_id FROM sync_keys WHERE sync_key = ? LIMIT 1"
  ).bind(payload.syncKey).first();

  const postRow = {
    syncKey: payload.syncKey,
    userId: userBinding && userBinding.user_id ? userBinding.user_id : null,
    deviceId: payload.deviceId,
    timelineKind: payload.timelineKind,
    pageUrl: payload.pageUrl,
    statusId: payload.statusId,
    authorHandle: payload.authorHandle,
    authorDisplayName: payload.authorDisplayName,
    postText: payload.postText,
    quoteText: payload.quoteText,
    linkTitle: payload.linkTitle,
    mediaMode: payload.mediaMode,
    textSparse: payload.textSparse ? 1 : 0,
    seenAt: payload.seenAt,
    createdAt: new Date().toISOString()
  };
  postRow.postFingerprint = await buildTimelinePostFingerprint(postRow);

  if (postRow.postFingerprint) {
    const existing = await env.DB.prepare(
      "SELECT id FROM timeline_posts WHERE post_fingerprint = ? LIMIT 1"
    ).bind(postRow.postFingerprint).first();
    if (existing) {
      return {
        deduped: true,
        postId: Number(existing.id || 0)
      };
    }
  }

  const result = await env.DB.prepare(
    `
      INSERT INTO timeline_posts (
        sync_key,
        user_id,
        device_id,
        timeline_kind,
        page_url,
        status_id,
        author_handle,
        author_display_name,
        post_text,
        quote_text,
        link_title,
        media_mode,
        text_sparse,
        seen_at,
        created_at,
        post_fingerprint
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).bind(
    postRow.syncKey,
    postRow.userId,
    postRow.deviceId,
    postRow.timelineKind,
    postRow.pageUrl,
    postRow.statusId,
    postRow.authorHandle,
    postRow.authorDisplayName,
    postRow.postText,
    postRow.quoteText,
    postRow.linkTitle,
    postRow.mediaMode,
    postRow.textSparse,
    postRow.seenAt,
    postRow.createdAt,
    postRow.postFingerprint
  ).run();

  return {
    deduped: false,
    postId: Number(result && result.meta && result.meta.last_row_id ? result.meta.last_row_id : 0)
  };
}

async function getTimelinePostById(env, postId) {
  if (!postId) {
    return null;
  }

  const row = await env.DB.prepare(
    `
      SELECT
        id,
        sync_key,
        user_id,
        device_id,
        timeline_kind,
        page_url,
        status_id,
        author_handle,
        author_display_name,
        post_text,
        quote_text,
        link_title,
        media_mode,
        text_sparse,
        seen_at,
        created_at
      FROM timeline_posts
      WHERE id = ?
      LIMIT 1
    `
  ).bind(postId).first();

  if (!row) {
    return null;
  }

  return {
    id: Number(row.id || 0),
    syncKey: row.sync_key || "",
    userId: row.user_id || "",
    deviceId: row.device_id || "",
    timelineKind: row.timeline_kind || "unknown",
    pageUrl: row.page_url || "",
    statusId: row.status_id || "",
    authorHandle: row.author_handle || "",
    authorDisplayName: row.author_display_name || "",
    postText: row.post_text || "",
    quoteText: row.quote_text || "",
    linkTitle: row.link_title || "",
    mediaMode: normalizeMediaMode(row.media_mode),
    textSparse: Number(row.text_sparse || 0) === 1,
    seenAt: row.seen_at || "",
    createdAt: row.created_at || ""
  };
}

async function upsertTimelineAiResult(env, postId, decision) {
  await ensureAiFeedSchema(env);
  if (!postId) {
    return;
  }

  const now = new Date().toISOString();
  const normalized = Object.assign(buildDefaultAiDecision(), decision || {});
  await env.DB.prepare(
    `
      INSERT INTO timeline_ai_results (
        post_id,
        blocked,
        matched_blocked_terms_json,
        confidence,
        reason_short,
        limited_by_video,
        status,
        model,
        raw_response_json,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(post_id) DO UPDATE SET
        blocked = excluded.blocked,
        matched_blocked_terms_json = excluded.matched_blocked_terms_json,
        confidence = excluded.confidence,
        reason_short = excluded.reason_short,
        limited_by_video = excluded.limited_by_video,
        status = excluded.status,
        model = excluded.model,
        raw_response_json = excluded.raw_response_json,
        updated_at = excluded.updated_at
    `
  ).bind(
    postId,
    normalized.blocked ? 1 : 0,
    JSON.stringify(normalized.matchedBlockedTerms || []),
    normalized.confidence || "low",
    normalized.reasonShort || "",
    normalized.limitedByVideo ? 1 : 0,
    normalized.status || "skipped",
    normalized.model || "",
    normalized.rawResponseJson ? JSON.stringify(normalized.rawResponseJson).slice(0, 12000) : null,
    now,
    now
  ).run();
}

async function getTimelineAiDecisionByPostId(env, postId) {
  await ensureAiFeedSchema(env);
  if (!postId) {
    return null;
  }

  const row = await env.DB.prepare(
    `
      SELECT
        blocked,
        matched_blocked_terms_json,
        confidence,
        reason_short,
        limited_by_video,
        status,
        model
      FROM timeline_ai_results
      WHERE post_id = ?
      LIMIT 1
    `
  ).bind(postId).first();

  if (!row) {
    return null;
  }

  return {
    blocked: Number(row.blocked || 0) === 1,
    matchedBlockedTerms: normalizeBlockedTopicTerms(parseJsonArray(row.matched_blocked_terms_json)),
    confidence: String(row.confidence || "low"),
    reasonShort: row.reason_short || "",
    limitedByVideo: Number(row.limited_by_video || 0) === 1,
    status: String(row.status || "skipped"),
    model: row.model || ""
  };
}

function extractOpenAiOutputText(responseJson) {
  if (responseJson && typeof responseJson.output_text === "string" && responseJson.output_text.trim()) {
    return responseJson.output_text.trim();
  }

  const output = Array.isArray(responseJson && responseJson.output) ? responseJson.output : [];
  const textParts = [];
  output.forEach((item) => {
    const contents = Array.isArray(item && item.content) ? item.content : [];
    contents.forEach((content) => {
      if (content && typeof content.text === "string" && content.text.trim()) {
        textParts.push(content.text.trim());
      }
    });
  });

  return textParts.join("\n").trim();
}

function extractChatCompletionOutputText(responseJson) {
  const choices = Array.isArray(responseJson && responseJson.choices) ? responseJson.choices : [];
  const message = choices[0] && choices[0].message ? choices[0].message : null;
  if (!message) {
    return "";
  }

  if (typeof message.content === "string" && message.content.trim()) {
    return message.content.trim();
  }

  const contentItems = Array.isArray(message.content) ? message.content : [];
  const textParts = [];
  contentItems.forEach((item) => {
    if (item && typeof item.text === "string" && item.text.trim()) {
      textParts.push(item.text.trim());
    }
  });
  return textParts.join("\n").trim();
}

function parseAiJsonOutputText(outputText) {
  const normalized = String(outputText || "").trim();
  if (!normalized) {
    throw new Error("ai-provider-empty-output");
  }

  const candidates = [normalized];
  const fencedMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch && fencedMatch[1]) {
    candidates.push(fencedMatch[1].trim());
  }

  const firstObject = normalized.indexOf("{");
  const lastObject = normalized.lastIndexOf("}");
  if (firstObject >= 0 && lastObject > firstObject) {
    candidates.push(normalized.slice(firstObject, lastObject + 1));
  }

  const firstArray = normalized.indexOf("[");
  const lastArray = normalized.lastIndexOf("]");
  if (firstArray >= 0 && lastArray > firstArray) {
    candidates.push(normalized.slice(firstArray, lastArray + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      // Try the next common provider output shape.
    }
  }

  throw new Error("ai-provider-invalid-json");
}

function shouldFallbackOpenAiCompatibleResponsesToChat(status) {
  return [400, 404, 405, 415, 422, 501].includes(Number(status || 0));
}

function buildAiJsonExampleValue(schema, propertyName) {
  const source = schema && typeof schema === "object" ? schema : {};
  if (Array.isArray(source.enum) && source.enum.length) {
    const enumValues = source.enum.map((item) => String(item || ""));
    if (propertyName === "action" && enumValues.includes("allow")) {
      return "allow";
    }
    if (propertyName === "confidence" && enumValues.includes("low")) {
      return "low";
    }
    if (propertyName === "status" && enumValues.includes("ready")) {
      return "ready";
    }
    return enumValues[0];
  }

  if (source.type === "array") {
    if (source.items && source.items.type === "object") {
      return [buildAiJsonExampleValue(source.items, propertyName)];
    }
    return [];
  }

  if (source.type === "object") {
    const output = {};
    const properties = source.properties && typeof source.properties === "object" ? source.properties : {};
    const required = Array.isArray(source.required) ? source.required : Object.keys(properties);
    required.forEach((key) => {
      output[key] = buildAiJsonExampleValue(properties[key], key);
    });
    return output;
  }

  if (source.type === "boolean") {
    return false;
  }
  if (source.type === "number" || source.type === "integer") {
    return 0;
  }
  return "";
}

function collectAiJsonSchemaEnumHints(schema, path, output) {
  const source = schema && typeof schema === "object" ? schema : {};
  const hints = Array.isArray(output) ? output : [];
  const currentPath = String(path || "").trim();

  if (Array.isArray(source.enum) && source.enum.length && currentPath) {
    hints.push(`${currentPath}: ${source.enum.map((item) => String(item || "")).filter(Boolean).join(", ")}`);
  }

  if (source.type === "array" && source.items) {
    collectAiJsonSchemaEnumHints(source.items, `${currentPath || "items"}[]`, hints);
    return hints;
  }

  if (source.type === "object" && source.properties && typeof source.properties === "object") {
    Object.keys(source.properties).forEach((key) => {
      collectAiJsonSchemaEnumHints(source.properties[key], currentPath ? `${currentPath}.${key}` : key, hints);
    });
  }

  return hints;
}

function buildJsonObjectModeDeveloperPrompt(moderationTask) {
  const example = JSON.stringify(buildAiJsonExampleValue(moderationTask.responseSchema, ""), null, 2);
  const enumHints = collectAiJsonSchemaEnumHints(moderationTask.responseSchema, "", []);
  return [
    moderationTask.developerPrompt,
    "Return only valid JSON. Do not wrap the JSON in markdown. Do not add explanations before or after the JSON.",
    enumHints.length
      ? `Allowed enum values:\n${enumHints.map((hint) => `- ${hint}`).join("\n")}`
      : "",
    "The JSON must match this shape:",
    example
  ].filter(Boolean).join("\n\n");
}

function providerSupportsImageInputs(providerConfig) {
  return Boolean(
    providerConfig
    && (
      isOfficialOpenAiCompatibleBaseUrl(providerConfig.providerBaseUrl)
      || isGeminiOpenAiCompatibleBaseUrl(providerConfig.providerBaseUrl)
    )
  );
}

function getAiModerationTaskImageUrls(moderationTask) {
  const raw = moderationTask
    && moderationTask.metadata
    && Array.isArray(moderationTask.metadata.imageEvidenceUrls)
    ? moderationTask.metadata.imageEvidenceUrls
    : [];
  return raw
    .map((item) => normalizeReplyAiAvatarImageUrl(item))
    .filter(Boolean)
    .slice(0, 1);
}

function buildChatUserContentWithImages(text, imageUrls) {
  if (!Array.isArray(imageUrls) || !imageUrls.length) {
    return text;
  }
  return [
    {
      type: "text",
      text
    }
  ].concat(imageUrls.map((url) => ({
    type: "image_url",
    image_url: {
      url
    }
  })));
}

function buildResponsesUserContentWithImages(text, imageUrls) {
  const content = [
    {
      type: "input_text",
      text
    }
  ];
  if (Array.isArray(imageUrls) && imageUrls.length) {
    imageUrls.forEach((url) => {
      content.push({
        type: "input_image",
        image_url: url
      });
    });
  }
  return content;
}

async function requestOpenAiCompatibleViaChatCompletions(moderationTask, reasoningEffort, extraResponseMeta) {
  const providerConfig = moderationTask.providerConfig;
  const imageUrls = providerSupportsImageInputs(providerConfig)
    ? getAiModerationTaskImageUrls(moderationTask)
    : [];
  const meta = extraResponseMeta && typeof extraResponseMeta === "object" ? extraResponseMeta : {};
  const requestedMode = Object.values(AI_PROVIDER_RESPONSE_MODES).includes(meta.responseModeOverride)
    ? meta.responseModeOverride
    : providerConfig.responseMode;
  const useJsonObjectMode = requestedMode === AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_OBJECT;
  const usePromptOnlyMode = requestedMode === AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_PROMPT_ONLY;
  const chatResponseMode = useJsonObjectMode || usePromptOnlyMode
    ? requestedMode
    : AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_SCHEMA;
  const requestBody = {
    model: providerConfig.model,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: (useJsonObjectMode || usePromptOnlyMode)
          ? buildJsonObjectModeDeveloperPrompt(moderationTask)
          : moderationTask.developerPrompt
      },
      {
        role: "user",
        content: buildChatUserContentWithImages(moderationTask.userPayloadText, imageUrls)
      }
    ],
  };

  if (useJsonObjectMode) {
    requestBody.response_format = {
      type: "json_object"
    };
  } else if (!usePromptOnlyMode) {
    requestBody.response_format = {
      type: "json_schema",
      json_schema: {
        name: moderationTask.schemaName,
        strict: true,
        schema: moderationTask.responseSchema
      }
    };
  }

  const response = await fetch(buildChatCompletionsApiEndpoint(providerConfig.providerBaseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${providerConfig.apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  let responseJson = {};
  try {
    responseJson = await response.json();
  } catch (error) {
    responseJson = {};
  }

  if (!response.ok) {
    if (meta.allowUnsupportedFallback && shouldFallbackOpenAiCompatibleResponsesToChat(response.status)) {
      return {
        unsupported: true,
        status: response.status,
        responseJson,
        responseMode: chatResponseMode
      };
    }
    throw new Error(`ai-provider-status-${response.status}`);
  }

  const outputText = extractChatCompletionOutputText(responseJson);
  if (!outputText) {
    throw new Error("ai-provider-empty-output");
  }

  return {
    parsed: parseAiJsonOutputText(outputText),
    model: providerConfig.model,
    responseMeta: Object.assign({
      adapterKey: providerConfig.adapterKey,
      responseMode: chatResponseMode,
      id: responseJson && responseJson.id ? responseJson.id : "",
      outputText
    }, Object.assign({}, meta, {
      responseModeOverride: undefined,
      allowUnsupportedFallback: undefined,
      imageInputAttached: imageUrls.length > 0
    }))
  };
}

async function requestOpenAiCompatibleViaResponses(moderationTask, reasoningEffort, allowChatFallback) {
  const providerConfig = moderationTask.providerConfig;
  const imageUrls = providerSupportsImageInputs(providerConfig)
    ? getAiModerationTaskImageUrls(moderationTask)
    : [];
  const response = await fetch(buildResponsesApiEndpoint(providerConfig.providerBaseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${providerConfig.apiKey}`
    },
    body: JSON.stringify({
      model: providerConfig.model,
      store: false,
      reasoning: {
        effort: reasoningEffort
      },
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text: moderationTask.developerPrompt
            }
          ]
        },
        {
          role: "user",
          content: buildResponsesUserContentWithImages(moderationTask.userPayloadText, imageUrls)
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: moderationTask.schemaName,
          strict: true,
          schema: moderationTask.responseSchema
        }
      }
    })
  });

  let responseJson = {};
  try {
    responseJson = await response.json();
  } catch (error) {
    responseJson = {};
  }

  if (!response.ok) {
    if (allowChatFallback && shouldFallbackOpenAiCompatibleResponsesToChat(response.status)) {
      return {
        unsupported: true,
        status: response.status,
        responseJson
      };
    }
    throw new Error(`ai-provider-status-${response.status}`);
  }

  const outputText = extractOpenAiOutputText(responseJson);
  if (!outputText) {
    throw new Error("ai-provider-empty-output");
  }

  return {
    parsed: parseAiJsonOutputText(outputText),
    model: providerConfig.model,
    responseMeta: {
      adapterKey: providerConfig.adapterKey,
      responseMode: AI_PROVIDER_RESPONSE_MODES.RESPONSES_JSON_SCHEMA,
      imageInputAttached: imageUrls.length > 0,
      id: responseJson && responseJson.id ? responseJson.id : "",
      outputText
    }
  };
}

function buildChatCompletionResponseModeFallbacks(primaryMode) {
  const modes = [];
  const addMode = (mode) => {
    if (mode && !modes.includes(mode)) {
      modes.push(mode);
    }
  };

  if (primaryMode === AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_SCHEMA) {
    addMode(AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_SCHEMA);
    addMode(AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_OBJECT);
  } else if (primaryMode === AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_OBJECT) {
    addMode(AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_OBJECT);
    addMode(AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_SCHEMA);
  } else if (primaryMode === AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_PROMPT_ONLY) {
    addMode(AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_PROMPT_ONLY);
  } else {
    addMode(AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_SCHEMA);
    addMode(AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_OBJECT);
  }

  addMode(AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_PROMPT_ONLY);
  return modes;
}

async function requestOpenAiCompatibleViaChatFallbacks(moderationTask, reasoningEffort, primaryMode, extraResponseMeta) {
  const modes = buildChatCompletionResponseModeFallbacks(primaryMode);
  let lastUnsupported = null;

  for (let index = 0; index < modes.length; index += 1) {
    const mode = modes[index];
    try {
      const response = await requestOpenAiCompatibleViaChatCompletions(
        moderationTask,
        reasoningEffort,
        Object.assign({}, extraResponseMeta || {}, {
          responseModeOverride: mode,
          allowUnsupportedFallback: true
        })
      );
      if (response && response.unsupported) {
        lastUnsupported = response;
        continue;
      }
      return response;
    } catch (error) {
      const message = error && error.message ? String(error.message) : String(error);
      const canTryLooserMode = index < modes.length - 1
        && /ai-provider-(invalid-json|empty-output)/i.test(message);
      if (canTryLooserMode) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(`ai-provider-status-${lastUnsupported && lastUnsupported.status ? lastUnsupported.status : 400}`);
}

async function requestOpenAiCompatibleStructuredJson(task) {
  const moderationTask = buildAiModerationTask(task);
  const providerConfig = moderationTask.providerConfig;
  const reasoningEffort = normalizeAiFeedText(
    moderationTask.metadata && moderationTask.metadata.reasoningEffort
      ? moderationTask.metadata.reasoningEffort
      : "low",
    20
  ) || "low";

  if (
    providerConfig.responseMode === AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_SCHEMA
    || providerConfig.responseMode === AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_OBJECT
    || providerConfig.responseMode === AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_PROMPT_ONLY
  ) {
    return requestOpenAiCompatibleViaChatFallbacks(moderationTask, reasoningEffort, providerConfig.responseMode);
  }

  const responsesResult = await requestOpenAiCompatibleViaResponses(
    moderationTask,
    reasoningEffort,
    true
  );
  if (!responsesResult || !responsesResult.unsupported) {
    return responsesResult;
  }

  return requestOpenAiCompatibleViaChatFallbacks(moderationTask, reasoningEffort, AI_PROVIDER_RESPONSE_MODES.CHAT_COMPLETIONS_JSON_SCHEMA, {
    fallbackFrom: AI_PROVIDER_RESPONSE_MODES.RESPONSES_JSON_SCHEMA,
    fallbackStatus: Number(responsesResult.status || 0)
  });
}

const AI_PROVIDER_ADAPTERS = Object.freeze({
  [AI_PROVIDER_ADAPTER_KEYS.OPENAI_COMPATIBLE]: {
    key: AI_PROVIDER_ADAPTER_KEYS.OPENAI_COMPATIBLE,
    requestStructuredJson: requestOpenAiCompatibleStructuredJson
  },
  [AI_PROVIDER_ADAPTER_KEYS.NATIVE_RESERVED]: {
    key: AI_PROVIDER_ADAPTER_KEYS.NATIVE_RESERVED,
    requestStructuredJson: async function unsupportedAiProviderAdapter() {
      throw new Error("ai-provider-adapter-not-implemented");
    }
  }
});

function resolveAiProviderAdapter(providerConfig) {
  const config = buildAiProviderConfig(providerConfig || {});
  return AI_PROVIDER_ADAPTERS[config.adapterKey] || AI_PROVIDER_ADAPTERS[AI_PROVIDER_ADAPTER_KEYS.OPENAI_COMPATIBLE];
}

async function requestAiModerationTaskFromProvider(task) {
  const moderationTask = buildAiModerationTask(task);
  const adapter = resolveAiProviderAdapter(moderationTask.providerConfig);
  return adapter.requestStructuredJson(moderationTask);
}

function buildTimelineAiCooldownFailedDecision(settings, cooldownRow, fallbackReason) {
  const remainingMs = getAiProviderCooldownRemainingMs(cooldownRow);
  const remainingSeconds = remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  return buildDefaultAiDecision({
    reasonShort: fallbackReason
      || (remainingSeconds > 0
        ? `AI 限流冷却中，约 ${remainingSeconds} 秒后自动重试`
        : "AI 限流冷却中，稍后自动重试"),
    status: "failed",
    model: settings && settings.model ? settings.model : DEFAULT_AI_FEED_MODEL,
    rawResponseJson: cooldownRow
      ? {
        cooldownUntil: cooldownRow.cooldown_until || "",
        failureCount: Number(cooldownRow.failure_count || 0)
      }
      : null
  });
}

function buildTimelineAiStaticDecision(postRow, blockedTopicTerms, candidateBlockedTopicTerms, settings) {
  if (!postRow || !postRow.userId) {
    return buildDefaultAiDecision({
      reasonShort: "等待账号绑定",
      status: "skipped"
    });
  }

  if (!normalizeBlockedTopicTerms(blockedTopicTerms).length) {
    return buildDefaultAiDecision({
      reasonShort: "未设置屏蔽词",
      status: "skipped"
    });
  }

  const visibleText = [postRow.postText, postRow.quoteText, postRow.linkTitle].filter(Boolean).join(" ").trim();
  const limitedByVideo = Boolean(postRow.textSparse) && (postRow.mediaMode === "video" || postRow.mediaMode === "mixed");
  if (!visibleText && !postRow.authorDisplayName && !postRow.authorHandle) {
    return buildDefaultAiDecision({
      reasonShort: "正文信息不足",
      status: "skipped"
    });
  }

  if (limitedByVideo) {
    return buildDefaultAiDecision({
      reasonShort: "视频为主，默认放过",
      limitedByVideo: true,
      status: "skipped"
    });
  }

  if (!normalizeBlockedTopicTerms(candidateBlockedTopicTerms).length) {
    return buildDefaultAiDecision({
      reasonShort: "未命中候选词",
      status: "skipped",
      model: settings && settings.model ? settings.model : DEFAULT_AI_FEED_MODEL
    });
  }

  if (!String(settings && settings.apiKey ? settings.apiKey : "").trim()) {
    return buildDefaultAiDecision({
      reasonShort: "未配置用户 AI Key",
      status: "skipped",
      model: settings && settings.model ? settings.model : DEFAULT_AI_FEED_MODEL
    });
  }

  return null;
}

async function requestTimelineHomeAiDecisionFromProvider(settings, postRow, candidateBlockedTopicTerms) {
  const task = buildTimelineHomeRealtimeTask(postRow, settings, candidateBlockedTopicTerms);
  const response = await requestAiModerationTaskFromProvider(task);
  return normalizeTimelineAiDecision(
    response.parsed,
    candidateBlockedTopicTerms,
    response.model,
    response.responseMeta
  );
}

async function requestTimelineFullPostAuditFromProvider(settings, postRow, blockedTopicTerms) {
  const task = buildTimelineFullPostAuditTask(postRow, settings, blockedTopicTerms);
  const response = await requestAiModerationTaskFromProvider(task);
  return normalizeTimelineAiDecision(
    response.parsed,
    blockedTopicTerms,
    response.model,
    response.responseMeta
  );
}

async function classifyTimelinePost(env, postId) {
  await ensureAiFeedSchema(env);
  const postRow = await getTimelinePostById(env, postId);
  if (!postRow) {
    return;
  }

  const preferences = await getUserPreferences(env, postRow.userId);
  const blockedTopicTerms = normalizeBlockedTopicTerms(preferences.blockedTopicTerms);
  const settings = postRow.userId
    ? await getUserAiSettingsWithSecret(env, postRow.userId)
    : buildAiProviderConfig({});
  const candidateBlockedTopicTerms = collectTimelineBlockedTopicCandidates(postRow, blockedTopicTerms);
  const staticDecision = buildTimelineAiStaticDecision(postRow, blockedTopicTerms, candidateBlockedTopicTerms, settings);
  if (staticDecision) {
    await upsertTimelineAiResult(env, postId, staticDecision);
    return;
  }

  const scopeKey = buildAiProviderScopeKey(postRow.userId, settings);
  const cooldownRow = await getAiProviderCooldownRow(env, scopeKey);
  if (isAiProviderCoolingDown(cooldownRow)) {
    await upsertTimelineAiResult(env, postId, buildTimelineAiCooldownFailedDecision(settings, cooldownRow));
    return;
  }

  try {
    const decision = await requestTimelineHomeAiDecisionFromProvider(settings, postRow, candidateBlockedTopicTerms);
    await clearAiProviderCooldown(env, scopeKey, postRow, settings);
    await upsertTimelineAiResult(env, postId, decision);
  } catch (error) {
    const errorMessage = error && error.message ? String(error.message) : String(error);
    const retryableProviderFailure = /ai-provider-status-(429|500|502|503|504|529)/i.test(errorMessage);
    const cooldownState = retryableProviderFailure
      ? await recordAiProviderFailure(
        env,
        scopeKey,
        postRow,
        settings,
        errorMessage.match(/ai-provider-status-\d+/i)
          ? String(errorMessage.match(/ai-provider-status-\d+/i)[0] || "")
          : "provider-failure"
      )
      : null;
    await upsertTimelineAiResult(env, postId, buildDefaultAiDecision({
      reasonShort: retryableProviderFailure ? "后台暂时繁忙，稍后自动重试" : "后台判读失败",
      status: "failed",
      model: settings && settings.model ? settings.model : DEFAULT_AI_FEED_MODEL,
      rawResponseJson: retryableProviderFailure
        ? {
          cooldownUntil: cooldownState && cooldownState.cooldown_until ? cooldownState.cooldown_until : "",
          failureCount: cooldownState && cooldownState.failure_count ? Number(cooldownState.failure_count || 0) : 0,
          error: errorMessage
        }
        : {
          error: errorMessage
        }
    }));
  }
}

async function reclassifyRecentTimelinePostsForSyncKey(env, syncKey) {
  await ensureAiFeedSchema(env);
  const normalizedSyncKey = String(syncKey || "").trim();
  if (!normalizedSyncKey) {
    return;
  }

  const { results = [] } = await env.DB.prepare(
    `
      SELECT id
      FROM timeline_posts
      WHERE sync_key = ?
      ORDER BY seen_at DESC, id DESC
      LIMIT ?
    `
  ).bind(normalizedSyncKey, AI_FEED_RECLASSIFY_LIMIT).all();

  for (const row of results) {
    const postId = Number(row && row.id ? row.id : 0);
    if (postId) {
      await classifyTimelinePost(env, postId);
    }
  }
}

async function reclassifyRecentTimelinePostsForUser(env, userId) {
  await ensureAiFeedSchema(env);
  const normalizedUserId = String(userId || "").trim();
  if (!normalizedUserId) {
    return;
  }

  const { results = [] } = await env.DB.prepare(
    `
      SELECT tp.id
      FROM timeline_posts tp
      WHERE tp.user_id = ?
      ORDER BY tp.seen_at DESC, tp.id DESC
      LIMIT ?
    `
  ).bind(normalizedUserId, AI_FEED_RECLASSIFY_LIMIT).all();

  for (const row of results) {
    const postId = Number(row && row.id ? row.id : 0);
    if (postId) {
      await classifyTimelinePost(env, postId);
    }
  }
}

async function reclassifyRecentReplyAiItemsForSyncKey(env, syncKey) {
  await ensureAiFeedSchema(env);
  const normalizedSyncKey = String(syncKey || "").trim();
  if (!normalizedSyncKey) {
    return;
  }

  const { results = [] } = await env.DB.prepare(
    `
      SELECT rai.id
      FROM reply_ai_items rai
      LEFT JOIN reply_ai_results rar
        ON rar.item_id = rai.id
      WHERE rai.sync_key = ?
        AND (rar.status IS NULL OR rar.status != 'ready')
      ORDER BY rai.created_at DESC, rai.id DESC
      LIMIT ?
    `
  ).bind(normalizedSyncKey, REPLY_AI_RECLASSIFY_LIMIT).all();

  for (const row of results) {
    const itemId = Number(row && row.id ? row.id : 0);
    if (itemId) {
      await classifyReplyAiItem(env, itemId);
    }
  }
}

async function reclassifyRecentReplyAiItemsForUser(env, userId) {
  await ensureAiFeedSchema(env);
  const normalizedUserId = String(userId || "").trim();
  if (!normalizedUserId) {
    return;
  }

  const { results = [] } = await env.DB.prepare(
    `
      SELECT rai.id
      FROM reply_ai_items rai
      LEFT JOIN reply_ai_results rar
        ON rar.item_id = rai.id
      WHERE rai.user_id = ?
        AND (rar.status IS NULL OR rar.status != 'ready')
      ORDER BY rai.created_at DESC, rai.id DESC
      LIMIT ?
    `
  ).bind(normalizedUserId, REPLY_AI_RECLASSIFY_LIMIT).all();

  for (const row of results) {
    const itemId = Number(row && row.id ? row.id : 0);
    if (itemId) {
      await classifyReplyAiItem(env, itemId);
    }
  }
}

async function buildAiFeedItems(env, userId, limit) {
  await ensureAiFeedSchema(env);
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        tp.id,
        tp.timeline_kind,
        tp.page_url,
        tp.status_id,
        tp.author_handle,
        tp.author_display_name,
        tp.post_text,
        tp.quote_text,
        tp.link_title,
        tp.media_mode,
        tp.text_sparse,
        tp.seen_at,
        tar.blocked,
        tar.matched_blocked_terms_json,
        tar.confidence,
        tar.reason_short,
        tar.limited_by_video,
        tar.status,
        tar.model
      FROM timeline_posts tp
      LEFT JOIN timeline_ai_results tar
        ON tar.post_id = tp.id
      WHERE tp.user_id = ?
        AND COALESCE(tar.blocked, 0) = 0
        AND COALESCE(tar.status, 'skipped') IN ('ready', 'failed', 'skipped')
      ORDER BY tp.seen_at DESC, tp.id DESC
      LIMIT ?
    `
  ).bind(userId, limit).all();

  return results.map((row) => ({
    id: Number(row.id || 0),
    timelineKind: row.timeline_kind || "unknown",
    pageUrl: row.page_url || "",
    statusId: row.status_id || "",
    authorHandle: row.author_handle || "",
    authorDisplayName: row.author_display_name || "",
    postText: row.post_text || "",
    quoteText: row.quote_text || "",
    linkTitle: row.link_title || "",
    mediaMode: normalizeMediaMode(row.media_mode),
    textSparse: Number(row.text_sparse || 0) === 1,
    seenAt: row.seen_at || "",
    ai: {
      blocked: Number(row.blocked || 0) === 1,
      matchedBlockedTerms: normalizeBlockedTopicTerms(parseJsonArray(row.matched_blocked_terms_json)),
      confidence: String(row.confidence || "low"),
      reasonShort: row.reason_short || "",
      limitedByVideo: Number(row.limited_by_video || 0) === 1,
      status: String(row.status || "skipped"),
      model: row.model || ""
    }
  }));
}

function normalizeReplyAiStringList(value, allowedSet, maxItems) {
  const source = Array.isArray(value) ? value : [];
  const seen = new Set();
  const normalized = [];
  source.forEach((item) => {
    const next = String(item || "").trim();
    if (!next) {
      return;
    }
    const normalizedKey = next.toLowerCase();
    if ((allowedSet && !allowedSet.has(normalizedKey) && !allowedSet.has(next)) || seen.has(normalizedKey)) {
      return;
    }
    seen.add(normalizedKey);
    normalized.push(allowedSet && allowedSet.has(normalizedKey) ? normalizedKey : next);
  });
  return normalized.slice(0, maxItems || 8);
}

function normalizeReplyAiProfileLinks(value) {
  return Array.isArray(value)
    ? value
      .map((item) => normalizeAiFeedText(item, 300))
      .filter(Boolean)
      .slice(0, 6)
    : [];
}

function normalizeReplyAiProfileFetchStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["not_requested", "ok", "empty", "error", "skipped"].includes(normalized)) {
    return normalized;
  }
  return "not_requested";
}

function normalizeReplyAiAvatarFetchStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["not_requested", "ok", "missing", "error", "skipped"].includes(normalized)) {
    return normalized;
  }
  return "not_requested";
}

function normalizeReplyAiAvatarImageUrl(value) {
  const raw = normalizeAiFeedText(value, 900);
  if (!raw || !/^https:\/\//i.test(raw)) {
    return "";
  }

  try {
    const parsed = new URL(raw);
    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (!/(^|\.)twimg\.com$/.test(hostname)) {
      return "";
    }
    return parsed.href.slice(0, 900);
  } catch (error) {
    return "";
  }
}

function normalizeReplyAiPayload(payload) {
  const source = payload || {};
  const replyHandle = normalizeAiHandle(source.replyHandle);
  const replyDisplayName = normalizeAiFeedText(source.replyDisplayName, 200);
  return {
    syncKey: String(source.syncKey || "").trim(),
    deviceId: String(source.deviceId || "").trim(),
    threadUrl: normalizeAiFeedText(source.threadUrl, 1200),
    threadStatusId: String(source.threadStatusId || "").trim().replace(/[^\d]/g, "").slice(0, 32),
    replyStatusId: String(source.replyStatusId || "").trim().replace(/[^\d]/g, "").slice(0, 32),
    replyHandle,
    replyDisplayName,
    replyText: normalizeStoredReplyText(source.replyText, replyDisplayName, replyHandle),
    mainPostText: normalizeAiFeedText(source.mainPostText, 1200),
    accountProtected: Number(source.accountProtected || 0) === 1,
    avatarImageUrl: normalizeReplyAiAvatarImageUrl(source.avatarImageUrl),
    avatarAltText: normalizeAiFeedText(source.avatarAltText, 160),
    avatarEvidenceTags: normalizeReplyAiStringList(source.avatarEvidenceTags, REPLY_AI_AVATAR_EVIDENCE_TAGS, REPLY_AI_AVATAR_EVIDENCE_TAG_LIMIT),
    avatarFetchStatus: normalizeReplyAiAvatarFetchStatus(source.avatarFetchStatus),
    avatarVisionRequested: Number(source.avatarVisionRequested || 0) === 1,
    profilePath: normalizeAiFeedText(source.profilePath, 240),
    profileBioText: normalizeAiFeedText(source.profileBioText, 320),
    profileSignalTags: normalizeReplyAiStringList(source.profileSignalTags, REPLY_AI_PROFILE_SIGNAL_LABELS, 8),
    profileLinks: normalizeReplyAiProfileLinks(source.profileLinks),
    profileFetchStatus: normalizeReplyAiProfileFetchStatus(source.profileFetchStatus),
    profileFetchedAt: normalizeAiFeedText(source.profileFetchedAt, 80),
    createdAt: new Date().toISOString()
  };
}

function normalizeReplyAiClientItemId(value, fallback) {
  const normalized = String(value || fallback || "").trim().slice(0, 160);
  return normalized || String(fallback || "").trim().slice(0, 160);
}

function normalizeReplyAiBatchPayload(payload) {
  const source = payload || {};
  const syncKey = String(source.syncKey || "").trim();
  const deviceId = String(source.deviceId || "").trim();
  const sharedThreadUrl = normalizeAiFeedText(source.threadUrl, 1200);
  const sharedThreadStatusId = String(source.threadStatusId || "").trim().replace(/[^\d]/g, "").slice(0, 32);
  const sharedMainPostText = normalizeAiFeedText(source.mainPostText, 1200);
  const rawItems = Array.isArray(source.items) ? source.items : [];

  return {
    syncKey,
    deviceId,
    items: rawItems.slice(0, REPLY_AI_BATCH_MAX_ITEMS).map((item, index) => {
      const normalized = normalizeReplyAiPayload(Object.assign({}, item || {}, {
        syncKey,
        deviceId,
        threadUrl: Object.prototype.hasOwnProperty.call(item || {}, "threadUrl")
          ? item.threadUrl
          : sharedThreadUrl,
        threadStatusId: Object.prototype.hasOwnProperty.call(item || {}, "threadStatusId")
          ? item.threadStatusId
          : sharedThreadStatusId,
        mainPostText: Object.prototype.hasOwnProperty.call(item || {}, "mainPostText")
          ? item.mainPostText
          : sharedMainPostText
      }));

      return Object.assign({}, normalized, {
        clientItemId: normalizeReplyAiClientItemId(item && item.clientItemId, `batch-item-${index + 1}`)
      });
    })
  };
}

async function buildReplyAiItemFingerprint(itemRow) {
  const syncKey = String(itemRow && itemRow.syncKey ? itemRow.syncKey : "").trim();
  if (!syncKey) {
    return "";
  }

  const replyStatusId = String(itemRow && itemRow.replyStatusId ? itemRow.replyStatusId : "").trim();
  if (replyStatusId) {
    return sha256Hex(JSON.stringify(["reply-ai-status", syncKey, replyStatusId]));
  }

  const threadStatusId = String(itemRow && itemRow.threadStatusId ? itemRow.threadStatusId : "").trim();
  const replyHandle = String(itemRow && itemRow.replyHandle ? itemRow.replyHandle : "").trim().toLowerCase();
  const replyText = normalizeAiComparableText(itemRow && itemRow.replyText ? itemRow.replyText : "");
  if (!threadStatusId && !replyHandle && !replyText) {
    return "";
  }

  return sha256Hex(JSON.stringify([
    "reply-ai-fallback",
    syncKey,
    threadStatusId,
    replyHandle,
    replyText.slice(0, 800)
  ]));
}

function buildDefaultReplyAiDecision(overrides) {
  return Object.assign({
    action: "allow",
    decisionLayer: "skipped",
    matchedSafetyLabels: [],
    matchedProfileSignals: [],
    confidence: "low",
    reasonShort: "",
    status: "skipped",
    model: ""
  }, overrides || {});
}

function cloneReplyAiDecision(decision, overrides) {
  return buildDefaultReplyAiDecision(Object.assign({}, decision || {}, overrides || {}));
}

function isFinalReplyAiDecisionStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  return normalized === "ready" || normalized === "failed" || normalized === "skipped";
}

function buildReplyAiPendingDecision() {
  return buildDefaultReplyAiDecision({
    decisionLayer: "pending",
    reasonShort: "等待后台判断",
    status: "pending",
    model: ""
  });
}

function shouldRetryReplyAiDecision(decision) {
  if (!decision || String(decision.status || "").trim().toLowerCase() !== "failed") {
    return false;
  }

  const updatedAtMs = decision && decision.updatedAt ? Date.parse(decision.updatedAt) : 0;
  if (!updatedAtMs) {
    return true;
  }

  return Date.now() - updatedAtMs >= REPLY_AI_FAILURE_RETRY_DELAY_MS;
}

function buildReplyAiDecisionPayload(itemId, decision) {
  const source = decision
    ? buildDefaultReplyAiDecision(decision)
    : buildDefaultReplyAiDecision({ status: "pending" });
  const status = decision ? String(source.status || "skipped") : "pending";
  const action = String(source.action || "allow").trim().toLowerCase() === "hide" ? "hide" : "allow";
  return {
    itemId: Number(itemId || 0),
    action,
    decisionLayer: normalizeAiFeedText(source.decisionLayer || "skipped", 40),
    matchedSafetyLabels: normalizeReplyAiStringList(source.matchedSafetyLabels, REPLY_AI_SAFETY_LABELS, 8),
    matchedProfileSignals: normalizeReplyAiStringList(source.matchedProfileSignals, REPLY_AI_PROFILE_SIGNAL_LABELS, 8),
    confidence: ["high", "medium", "low"].includes(String(source.confidence || "").trim().toLowerCase())
      ? String(source.confidence || "").trim().toLowerCase()
      : "low",
    reasonShort: normalizeAiFeedText(source.reasonShort, 120),
    status,
    model: normalizeAiFeedText(source.model, 80),
    isFinal: isFinalReplyAiDecisionStatus(status),
    shouldHide: action === "hide" && status === "ready"
  };
}

function normalizeReplyAiDecision(decision, model, rawResponseJson) {
  const normalized = normalizeAiModerationResult(decision, {
    allowedMatchedLabels: REPLY_AI_SAFETY_LABELS,
    allowedMatchedProfileSignals: REPLY_AI_PROFILE_SIGNAL_LABELS,
    model,
    rawResponseMeta: rawResponseJson
  });
  const shouldHide = normalized.action === "hide"
    && normalized.status === "ready"
    && normalized.confidence === "high"
    && normalized.matchedLabels.length > 0;

  return {
    action: shouldHide ? "hide" : "allow",
    decisionLayer: "ai",
    matchedSafetyLabels: normalized.matchedLabels,
    matchedProfileSignals: normalized.matchedProfileSignals,
    confidence: normalized.confidence,
    reasonShort: normalized.reasonShort,
    status: normalized.status,
    model: normalized.model,
    rawResponseJson: normalized.rawResponseMeta || null
  };
}

async function upsertReplyAiItem(env, payload) {
  await ensureAiFeedSchema(env);
  await touchSyncKey(env, payload.syncKey, payload.deviceId);

  const userBinding = await env.DB.prepare(
    "SELECT user_id FROM sync_keys WHERE sync_key = ? LIMIT 1"
  ).bind(payload.syncKey).first();

  const itemRow = {
    syncKey: payload.syncKey,
    userId: userBinding && userBinding.user_id ? userBinding.user_id : null,
    deviceId: payload.deviceId,
    threadUrl: payload.threadUrl,
    threadStatusId: payload.threadStatusId,
    replyStatusId: payload.replyStatusId,
    replyHandle: payload.replyHandle,
    replyDisplayName: payload.replyDisplayName,
    replyText: payload.replyText,
    mainPostText: payload.mainPostText,
    accountProtected: payload.accountProtected ? 1 : 0,
    avatarImageUrl: payload.avatarImageUrl,
    avatarAltText: payload.avatarAltText,
    avatarEvidenceTagsJson: JSON.stringify(payload.avatarEvidenceTags || []),
    avatarFetchStatus: payload.avatarFetchStatus,
    avatarVisionRequested: payload.avatarVisionRequested ? 1 : 0,
    profilePath: payload.profilePath,
    profileBioText: payload.profileBioText,
    profileSignalTagsJson: JSON.stringify(payload.profileSignalTags || []),
    profileLinksJson: JSON.stringify(payload.profileLinks || []),
    profileFetchStatus: payload.profileFetchStatus,
    profileFetchedAt: payload.profileFetchedAt || "",
    createdAt: new Date().toISOString()
  };
  itemRow.itemFingerprint = await buildReplyAiItemFingerprint(itemRow);

  if (itemRow.itemFingerprint) {
    const existing = await env.DB.prepare(
      "SELECT id FROM reply_ai_items WHERE item_fingerprint = ? LIMIT 1"
    ).bind(itemRow.itemFingerprint).first();
    if (existing) {
      const existingId = Number(existing.id || 0);
      if (existingId) {
        await env.DB.prepare(
          `
            UPDATE reply_ai_items
            SET
              profile_path = CASE WHEN ? != '' THEN ? ELSE profile_path END,
              profile_bio_text = CASE WHEN ? != '' THEN ? ELSE profile_bio_text END,
              profile_signal_tags_json = CASE WHEN ? != '[]' THEN ? ELSE profile_signal_tags_json END,
              profile_links_json = CASE WHEN ? != '[]' THEN ? ELSE profile_links_json END,
              profile_fetch_status = CASE WHEN ? != 'not_requested' THEN ? ELSE profile_fetch_status END,
              profile_fetched_at = CASE WHEN ? != '' THEN ? ELSE profile_fetched_at END,
              avatar_image_url = CASE WHEN ? != '' THEN ? ELSE avatar_image_url END,
              avatar_alt_text = CASE WHEN ? != '' THEN ? ELSE avatar_alt_text END,
              avatar_evidence_tags_json = CASE WHEN ? != '[]' THEN ? ELSE avatar_evidence_tags_json END,
              avatar_fetch_status = CASE WHEN ? != 'not_requested' THEN ? ELSE avatar_fetch_status END,
              avatar_vision_requested = CASE WHEN ? = 1 THEN 1 ELSE avatar_vision_requested END
            WHERE id = ?
          `
        ).bind(
          itemRow.profilePath,
          itemRow.profilePath,
          itemRow.profileBioText,
          itemRow.profileBioText,
          itemRow.profileSignalTagsJson,
          itemRow.profileSignalTagsJson,
          itemRow.profileLinksJson,
          itemRow.profileLinksJson,
          itemRow.profileFetchStatus,
          itemRow.profileFetchStatus,
          itemRow.profileFetchedAt,
          itemRow.profileFetchedAt,
          itemRow.avatarImageUrl,
          itemRow.avatarImageUrl,
          itemRow.avatarAltText,
          itemRow.avatarAltText,
          itemRow.avatarEvidenceTagsJson,
          itemRow.avatarEvidenceTagsJson,
          itemRow.avatarFetchStatus,
          itemRow.avatarFetchStatus,
          itemRow.avatarVisionRequested,
          existingId
        ).run();
      }
      return {
        deduped: true,
        itemId: existingId
      };
    }
  }

  const result = await env.DB.prepare(
    `
      INSERT INTO reply_ai_items (
        sync_key,
        user_id,
        device_id,
        thread_url,
        thread_status_id,
        reply_status_id,
        reply_handle,
        reply_display_name,
        reply_text,
        main_post_text,
        account_protected,
        avatar_image_url,
        avatar_alt_text,
        avatar_evidence_tags_json,
        avatar_fetch_status,
        avatar_vision_requested,
        profile_path,
        profile_bio_text,
        profile_signal_tags_json,
        profile_links_json,
        profile_fetch_status,
        profile_fetched_at,
        created_at,
        item_fingerprint
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).bind(
    itemRow.syncKey,
    itemRow.userId,
    itemRow.deviceId,
    itemRow.threadUrl,
    itemRow.threadStatusId,
    itemRow.replyStatusId,
    itemRow.replyHandle,
    itemRow.replyDisplayName,
    itemRow.replyText,
    itemRow.mainPostText,
    itemRow.accountProtected,
    itemRow.avatarImageUrl,
    itemRow.avatarAltText,
    itemRow.avatarEvidenceTagsJson,
    itemRow.avatarFetchStatus,
    itemRow.avatarVisionRequested,
    itemRow.profilePath,
    itemRow.profileBioText,
    itemRow.profileSignalTagsJson,
    itemRow.profileLinksJson,
    itemRow.profileFetchStatus,
    itemRow.profileFetchedAt || null,
    itemRow.createdAt,
    itemRow.itemFingerprint
  ).run();

  return {
    deduped: false,
    itemId: Number(result && result.meta && result.meta.last_row_id ? result.meta.last_row_id : 0)
  };
}

async function getReplyAiItemById(env, itemId) {
  await ensureAiFeedSchema(env);
  if (!itemId) {
    return null;
  }

  const row = await env.DB.prepare(
    `
      SELECT
        id,
        sync_key,
        user_id,
        device_id,
        thread_url,
        thread_status_id,
        reply_status_id,
        reply_handle,
        reply_display_name,
        reply_text,
        main_post_text,
        account_protected,
        avatar_image_url,
        avatar_alt_text,
        avatar_evidence_tags_json,
        avatar_fetch_status,
        avatar_vision_requested,
        profile_path,
        profile_bio_text,
        profile_signal_tags_json,
        profile_links_json,
        profile_fetch_status,
        profile_fetched_at,
        created_at
      FROM reply_ai_items
      WHERE id = ?
      LIMIT 1
    `
  ).bind(itemId).first();

  if (!row) {
    return null;
  }

  return {
    id: Number(row.id || 0),
    syncKey: row.sync_key || "",
    userId: row.user_id || "",
    deviceId: row.device_id || "",
    threadUrl: row.thread_url || "",
    threadStatusId: row.thread_status_id || "",
    replyStatusId: row.reply_status_id || "",
    replyHandle: row.reply_handle || "",
    replyDisplayName: row.reply_display_name || "",
    replyText: row.reply_text || "",
    mainPostText: row.main_post_text || "",
    accountProtected: Number(row.account_protected || 0) === 1,
    avatarImageUrl: normalizeReplyAiAvatarImageUrl(row.avatar_image_url || ""),
    avatarAltText: normalizeAiFeedText(row.avatar_alt_text || "", 160),
    avatarEvidenceTags: normalizeReplyAiStringList(parseJsonArray(row.avatar_evidence_tags_json), REPLY_AI_AVATAR_EVIDENCE_TAGS, REPLY_AI_AVATAR_EVIDENCE_TAG_LIMIT),
    avatarFetchStatus: normalizeReplyAiAvatarFetchStatus(row.avatar_fetch_status),
    avatarVisionRequested: Number(row.avatar_vision_requested || 0) === 1,
    profilePath: row.profile_path || "",
    profileBioText: row.profile_bio_text || "",
    profileSignalTags: normalizeReplyAiStringList(parseJsonArray(row.profile_signal_tags_json), REPLY_AI_PROFILE_SIGNAL_LABELS, 8),
    profileLinks: normalizeReplyAiProfileLinks(parseJsonArray(row.profile_links_json)),
    profileFetchStatus: normalizeReplyAiProfileFetchStatus(row.profile_fetch_status),
    profileFetchedAt: row.profile_fetched_at || "",
    createdAt: row.created_at || ""
  };
}

async function upsertReplyAiResult(env, itemId, decision) {
  await ensureAiFeedSchema(env);
  if (!itemId) {
    return;
  }

  const now = new Date().toISOString();
  const normalized = Object.assign(buildDefaultReplyAiDecision(), decision || {});
  await env.DB.prepare(
    `
      INSERT INTO reply_ai_results (
        item_id,
        action,
        decision_layer,
        matched_safety_labels_json,
        matched_profile_signals_json,
        confidence,
        reason_short,
        status,
        model,
        raw_response_json,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(item_id) DO UPDATE SET
        action = excluded.action,
        decision_layer = excluded.decision_layer,
        matched_safety_labels_json = excluded.matched_safety_labels_json,
        matched_profile_signals_json = excluded.matched_profile_signals_json,
        confidence = excluded.confidence,
        reason_short = excluded.reason_short,
        status = excluded.status,
        model = excluded.model,
        raw_response_json = excluded.raw_response_json,
        updated_at = excluded.updated_at
    `
  ).bind(
    itemId,
    normalized.action === "hide" ? "hide" : "allow",
    normalizeAiFeedText(normalized.decisionLayer, 40) || "ai",
    JSON.stringify(normalizeReplyAiStringList(normalized.matchedSafetyLabels, REPLY_AI_SAFETY_LABELS, 8)),
    JSON.stringify(normalizeReplyAiStringList(normalized.matchedProfileSignals, REPLY_AI_PROFILE_SIGNAL_LABELS, 8)),
    ["high", "medium", "low"].includes(String(normalized.confidence || "").trim().toLowerCase())
      ? String(normalized.confidence || "").trim().toLowerCase()
      : "low",
    normalizeAiFeedText(normalized.reasonShort, 120),
    ["ready", "failed", "skipped", "pending"].includes(String(normalized.status || "").trim().toLowerCase())
      ? String(normalized.status || "").trim().toLowerCase()
      : "skipped",
    normalizeAiFeedText(normalized.model, 80),
    normalized.rawResponseJson ? JSON.stringify(normalized.rawResponseJson).slice(0, 12000) : null,
    now,
    now
  ).run();
}

async function getReplyAiResultByItemId(env, itemId) {
  await ensureAiFeedSchema(env);
  if (!itemId) {
    return null;
  }

  const row = await env.DB.prepare(
    `
      SELECT
        action,
        decision_layer,
        matched_safety_labels_json,
        matched_profile_signals_json,
        confidence,
        reason_short,
        status,
        model,
        raw_response_json,
        updated_at
      FROM reply_ai_results
      WHERE item_id = ?
      LIMIT 1
    `
  ).bind(itemId).first();

  if (!row) {
    return null;
  }

  return {
    action: row.action || "allow",
    decisionLayer: row.decision_layer || "skipped",
    matchedSafetyLabels: normalizeReplyAiStringList(parseJsonArray(row.matched_safety_labels_json), REPLY_AI_SAFETY_LABELS, 8),
    matchedProfileSignals: normalizeReplyAiStringList(parseJsonArray(row.matched_profile_signals_json), REPLY_AI_PROFILE_SIGNAL_LABELS, 8),
    confidence: String(row.confidence || "low"),
    reasonShort: row.reason_short || "",
    status: String(row.status || "skipped"),
    model: row.model || "",
    rawResponseJson: row.raw_response_json || "",
    updatedAt: row.updated_at || ""
  };
}

async function markReplyAiItemAllowedByManualRestore(env, syncKey, itemId) {
  await ensureAiFeedSchema(env);
  const normalizedSyncKey = String(syncKey || "").trim();
  const normalizedItemId = Number(itemId || 0);
  if (!normalizedSyncKey || !normalizedItemId) {
    return false;
  }

  const itemRow = await getReplyAiItemById(env, normalizedItemId);
  if (!itemRow) {
    return false;
  }

  let sameUser = false;
  if (itemRow.userId) {
    const syncKeyRow = await env.DB.prepare(
      "SELECT user_id FROM sync_keys WHERE sync_key = ? LIMIT 1"
    ).bind(normalizedSyncKey).first();
    sameUser = Boolean(syncKeyRow && syncKeyRow.user_id && String(syncKeyRow.user_id) === String(itemRow.userId));
  }

  if (itemRow.syncKey !== normalizedSyncKey && !sameUser) {
    return false;
  }

  await finalizeReplyAiDecision(env, itemRow, buildDefaultReplyAiDecision({
    action: "allow",
    decisionLayer: "manual_allow",
    matchedSafetyLabels: [],
    matchedProfileSignals: [],
    confidence: "high",
    reasonShort: "用户恢复，标记为 AI 误判",
    status: "ready",
    model: "manual"
  }));
  return true;
}

function buildReplyAiProviderScopeKey(userId, settings) {
  return buildAiProviderScopeKey(userId, settings);
}

async function getAiProviderCooldownRow(env, scopeKey) {
  await ensureAiFeedSchema(env);
  const normalizedScopeKey = String(scopeKey || "").trim();
  if (!normalizedScopeKey) {
    return null;
  }

  return env.DB.prepare(
    `
      SELECT
        scope_key,
        user_id,
        provider_base_url,
        model,
        failure_count,
        cooldown_until,
        last_failure_code,
        updated_at
      FROM ai_provider_cooldowns
      WHERE scope_key = ?
      LIMIT 1
    `
  ).bind(normalizedScopeKey).first();
}

function getAiProviderCooldownRemainingMs(cooldownRow) {
  if (!cooldownRow || !cooldownRow.cooldown_until) {
    return 0;
  }

  const cooldownUntilMs = Date.parse(String(cooldownRow.cooldown_until || ""));
  if (!cooldownUntilMs) {
    return 0;
  }

  return Math.max(0, cooldownUntilMs - Date.now());
}

function isAiProviderCoolingDown(cooldownRow) {
  return getAiProviderCooldownRemainingMs(cooldownRow) > 0;
}

function buildReplyAiCooldownFailedDecision(settings, cooldownRow, fallbackReason) {
  const remainingMs = getAiProviderCooldownRemainingMs(cooldownRow);
  const remainingSeconds = remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  const reasonShort = fallbackReason
    || (remainingSeconds > 0
      ? `AI 限流冷却中，约 ${remainingSeconds} 秒后自动重试`
      : "AI 限流冷却中，稍后自动重试");

  return buildDefaultReplyAiDecision({
    decisionLayer: "failed",
    reasonShort,
    status: "failed",
    model: settings && settings.model ? settings.model : DEFAULT_AI_FEED_MODEL,
    rawResponseJson: cooldownRow
      ? {
        cooldownUntil: cooldownRow.cooldown_until || "",
        failureCount: Number(cooldownRow.failure_count || 0)
      }
      : null
  });
}

async function clearAiProviderCooldown(env, scopeKey, itemRow, settings) {
  await ensureAiFeedSchema(env);
  const normalizedScopeKey = String(scopeKey || "").trim();
  if (!normalizedScopeKey) {
    return;
  }

  const now = new Date().toISOString();
  await env.DB.prepare(
    `
      INSERT INTO ai_provider_cooldowns (
        scope_key,
        user_id,
        provider_base_url,
        model,
        failure_count,
        cooldown_until,
        last_failure_code,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, 0, NULL, '', ?, ?)
      ON CONFLICT(scope_key) DO UPDATE SET
        user_id = excluded.user_id,
        provider_base_url = excluded.provider_base_url,
        model = excluded.model,
        failure_count = 0,
        cooldown_until = NULL,
        last_failure_code = '',
        updated_at = excluded.updated_at
    `
  ).bind(
    normalizedScopeKey,
    itemRow && itemRow.userId ? itemRow.userId : null,
    normalizeAiProviderBaseUrl(settings && settings.providerBaseUrl ? settings.providerBaseUrl : DEFAULT_AI_PROVIDER_BASE_URL),
    normalizeAiModel(settings && settings.model ? settings.model : DEFAULT_AI_FEED_MODEL),
    now,
    now
  ).run();
}

async function recordAiProviderFailure(env, scopeKey, itemRow, settings, failureCode) {
  await ensureAiFeedSchema(env);
  const normalizedScopeKey = String(scopeKey || "").trim();
  if (!normalizedScopeKey) {
    return null;
  }

  const existing = await getAiProviderCooldownRow(env, normalizedScopeKey);
  const nextFailureCount = Math.max(1, Number(existing && existing.failure_count ? existing.failure_count : 0) + 1);
  const stepIndex = Math.min(AI_PROVIDER_COOLDOWN_STEPS_MS.length - 1, Math.max(0, nextFailureCount - 1));
  const baseDelayMs = Number(AI_PROVIDER_COOLDOWN_STEPS_MS[stepIndex] || REPLY_AI_FAILURE_RETRY_DELAY_MS);
  const jitterRatio = 1 + ((Math.random() * 2) - 1) * AI_PROVIDER_COOLDOWN_JITTER_RATIO;
  const cooldownMs = Math.max(5000, Math.round(baseDelayMs * jitterRatio));
  const cooldownUntil = new Date(Date.now() + cooldownMs).toISOString();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `
      INSERT INTO ai_provider_cooldowns (
        scope_key,
        user_id,
        provider_base_url,
        model,
        failure_count,
        cooldown_until,
        last_failure_code,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(scope_key) DO UPDATE SET
        user_id = excluded.user_id,
        provider_base_url = excluded.provider_base_url,
        model = excluded.model,
        failure_count = excluded.failure_count,
        cooldown_until = excluded.cooldown_until,
        last_failure_code = excluded.last_failure_code,
        updated_at = excluded.updated_at
    `
  ).bind(
    normalizedScopeKey,
    itemRow && itemRow.userId ? itemRow.userId : null,
    normalizeAiProviderBaseUrl(settings && settings.providerBaseUrl ? settings.providerBaseUrl : DEFAULT_AI_PROVIDER_BASE_URL),
    normalizeAiModel(settings && settings.model ? settings.model : DEFAULT_AI_FEED_MODEL),
    nextFailureCount,
    cooldownUntil,
    normalizeAiFeedText(failureCode, 40),
    existing && existing.updated_at ? existing.updated_at : now,
    now
  ).run();

  return {
    scope_key: normalizedScopeKey,
    failure_count: nextFailureCount,
    cooldown_until: cooldownUntil
  };
}

async function listRecentReplyAiHistoryForHandle(env, replyHandle, limit) {
  await ensureAiFeedSchema(env);
  const normalizedHandle = normalizeAiHandle(replyHandle);
  if (!normalizedHandle) {
    return [];
  }

  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        rai.id,
        rai.reply_text,
        rai.created_at,
        rar.action,
        rar.decision_layer,
        rar.matched_safety_labels_json,
        rar.matched_profile_signals_json,
        rar.confidence,
        rar.reason_short,
        rar.status,
        rar.model,
        rar.updated_at
      FROM reply_ai_items rai
      JOIN reply_ai_results rar
        ON rar.item_id = rai.id
      WHERE rai.reply_handle = ?
        AND rar.status = 'ready'
      ORDER BY rar.updated_at DESC, rai.id DESC
      LIMIT ?
    `
  ).bind(normalizedHandle, Math.max(1, Number(limit || REPLY_AI_BATCH_HISTORY_LIMIT) || REPLY_AI_BATCH_HISTORY_LIMIT)).all();

  return results.map((row) => ({
    id: Number(row.id || 0),
    replyText: row.reply_text || "",
    createdAt: row.created_at || "",
    action: row.action || "allow",
    decisionLayer: row.decision_layer || "ai",
    matchedSafetyLabels: normalizeReplyAiStringList(parseJsonArray(row.matched_safety_labels_json), REPLY_AI_SAFETY_LABELS, 8),
    matchedProfileSignals: normalizeReplyAiStringList(parseJsonArray(row.matched_profile_signals_json), REPLY_AI_PROFILE_SIGNAL_LABELS, 8),
    confidence: String(row.confidence || "low"),
    reasonShort: row.reason_short || "",
    status: String(row.status || "ready"),
    model: row.model || "",
    updatedAt: row.updated_at || ""
  }));
}

function isReplyAiHistoryRowWithinWindow(row, windowMs) {
  if (!row || !windowMs) {
    return false;
  }

  const updatedAtMs = row.updatedAt ? Date.parse(row.updatedAt) : 0;
  return Boolean(updatedAtMs) && (Date.now() - updatedAtMs <= windowMs);
}

function buildReplyAiReusedDecision(historyRow, decisionLayer, reasonShort) {
  return buildDefaultReplyAiDecision({
    action: historyRow && historyRow.action === "hide" ? "hide" : "allow",
    decisionLayer: decisionLayer || "reuse",
    matchedSafetyLabels: historyRow && Array.isArray(historyRow.matchedSafetyLabels) ? historyRow.matchedSafetyLabels.slice() : [],
    matchedProfileSignals: historyRow && Array.isArray(historyRow.matchedProfileSignals) ? historyRow.matchedProfileSignals.slice() : [],
    confidence: historyRow && historyRow.confidence ? historyRow.confidence : "low",
    reasonShort: normalizeAiFeedText(reasonShort || (historyRow && historyRow.reasonShort ? historyRow.reasonShort : ""), 120),
    status: "ready",
    model: historyRow && historyRow.model ? historyRow.model : ""
  });
}

async function findReusableReplyAiDecision(env, itemRow, riskRow) {
  const handle = normalizeAiHandle(itemRow && itemRow.replyHandle ? itemRow.replyHandle : "");
  if (!handle || !itemRow || itemRow.accountProtected) {
    return null;
  }

  const normalizedReplyText = normalizeAiComparableText(itemRow.replyText).slice(0, 800);
  const templateKey = buildTemplateRuleAnalysis(itemRow.replyText).templateKey;
  const heuristicSummary = buildReplyAiHeuristicSummary(itemRow, riskRow);
  const historyRows = await listRecentReplyAiHistoryForHandle(env, handle, REPLY_AI_BATCH_HISTORY_LIMIT);
  let latestHighConfidenceHideRow = null;

  for (const row of historyRows) {
    if (!latestHighConfidenceHideRow && row.action === "hide" && row.confidence === "high") {
      latestHighConfidenceHideRow = row;
    }

    const historyNormalizedReply = normalizeAiComparableText(row.replyText).slice(0, 800);
    if (normalizedReplyText && historyNormalizedReply === normalizedReplyText) {
      if (row.action === "hide" && row.confidence === "high"
        && isReplyAiHistoryRowWithinWindow(row, REPLY_AI_HIDE_REUSE_WINDOW_DAYS * 24 * 60 * 60 * 1000)) {
        return buildReplyAiReusedDecision(row, "reuse_exact_hide", "命中同账号同文案复用");
      }

      if (row.action === "allow"
        && isReplyAiHistoryRowWithinWindow(row, REPLY_AI_ALLOW_REUSE_WINDOW_HOURS * 60 * 60 * 1000)) {
        return buildReplyAiReusedDecision(row, "reuse_exact_allow", "命中同账号同文案复用");
      }
    }

    if (!templateKey || row.action !== "hide" || row.confidence !== "high") {
      continue;
    }

    const historyTemplateKey = buildTemplateRuleAnalysis(row.replyText).templateKey;
    if (historyTemplateKey !== templateKey) {
      continue;
    }

    if (!isReplyAiHistoryRowWithinWindow(row, REPLY_AI_TEMPLATE_REUSE_WINDOW_HOURS * 60 * 60 * 1000)) {
      continue;
    }

    if (
      heuristicSummary.accountMetadataRisk
      || heuristicSummary.shortOrThinReply
      || heuristicSummary.hasSpamTemplateSignal
      || heuristicSummary.hasEroticMentionRedirect
      || heuristicSummary.hasExplicitEroticBait
      || heuristicSummary.hasGeoMeetupBait
      || heuristicSummary.hasBaitQuestionShape
      || heuristicSummary.hasShareLinkScam
      || heuristicSummary.hasEmojiNoiseBait
      || heuristicSummary.hasContextDetachedBait
    ) {
      return buildReplyAiReusedDecision(row, "reuse_template_hide", "命中同账号同模板复用");
    }
  }

  if (
    latestHighConfidenceHideRow
    && Number(riskRow && riskRow.recent_high_confidence_hide_count ? riskRow.recent_high_confidence_hide_count : 0) > 0
    && isReplyAiHistoryRowWithinWindow(latestHighConfidenceHideRow, REPLY_AI_ACCOUNT_REUSE_WINDOW_HOURS * 60 * 60 * 1000)
    && heuristicSummary.accountMetadataRisk
    && (
      heuristicSummary.shortOrThinReply
      || heuristicSummary.hasSpamTemplateSignal
      || heuristicSummary.hasEroticMentionRedirect
      || heuristicSummary.hasExplicitEroticBait
      || heuristicSummary.hasGeoMeetupBait
      || heuristicSummary.hasBaitQuestionShape
      || heuristicSummary.hasShareLinkScam
      || heuristicSummary.hasEmojiNoiseBait
      || heuristicSummary.hasContextDetachedBait
    )
  ) {
    return buildReplyAiReusedDecision(latestHighConfidenceHideRow, "reuse_account_hide", "命中高风险账号短期复用");
  }

  return null;
}

async function getReplyAiAccountRiskRow(env, replyHandle) {
  await ensureAiFeedSchema(env);
  const normalizedHandle = normalizeAiHandle(replyHandle);
  if (!normalizedHandle) {
    return null;
  }

  return env.DB.prepare(
    `
      SELECT
        reply_handle,
        total_high_confidence_hide_count,
        recent_high_confidence_hide_count,
        active_global_block,
        first_flagged_at,
        last_flagged_at,
        global_blocked_at,
        last_reason_short,
        last_item_id,
        updated_at
      FROM reply_ai_account_risk
      WHERE reply_handle = ?
      LIMIT 1
    `
  ).bind(normalizedHandle).first();
}

async function isReplyHandleGloballyBlocked(env, replyHandle) {
  const row = await getReplyAiAccountRiskRow(env, replyHandle);
  return Boolean(row && Number(row.active_global_block || 0) === 1);
}

async function refreshReplyAiAccountRisk(env, itemRow, decision) {
  await ensureAiFeedSchema(env);
  const handle = normalizeAiHandle(itemRow && itemRow.replyHandle ? itemRow.replyHandle : "");
  if (!handle || !itemRow || itemRow.accountProtected) {
    return null;
  }

  const existing = await getReplyAiAccountRiskRow(env, handle);
  const cutoffIso = new Date(Date.now() - (REPLY_AI_STRIKE_WINDOW_DAYS * 24 * 60 * 60 * 1000)).toISOString();
  const totalRow = await env.DB.prepare(
    `
      SELECT COUNT(*) AS total_count
      FROM reply_ai_items rai
      JOIN reply_ai_results rar
        ON rar.item_id = rai.id
      WHERE rai.reply_handle = ?
        AND rai.account_protected = 0
        AND rar.status = 'ready'
        AND rar.action = 'hide'
        AND rar.confidence = 'high'
    `
  ).bind(handle).first();
  const recentRow = await env.DB.prepare(
    `
      SELECT COUNT(*) AS total_count
      FROM reply_ai_items rai
      JOIN reply_ai_results rar
        ON rar.item_id = rai.id
      WHERE rai.reply_handle = ?
        AND rai.account_protected = 0
        AND rai.created_at >= ?
        AND rar.status = 'ready'
        AND rar.action = 'hide'
        AND rar.confidence = 'high'
    `
  ).bind(handle, cutoffIso).first();
  const latestRow = await env.DB.prepare(
    `
      SELECT rai.id, rai.created_at, rar.reason_short
      FROM reply_ai_items rai
      JOIN reply_ai_results rar
        ON rar.item_id = rai.id
      WHERE rai.reply_handle = ?
        AND rai.account_protected = 0
        AND rar.status = 'ready'
        AND rar.action = 'hide'
        AND rar.confidence = 'high'
      ORDER BY rai.created_at DESC, rai.id DESC
      LIMIT 1
    `
  ).bind(handle).first();

  const totalCount = Number(totalRow && totalRow.total_count ? totalRow.total_count : 0);
  const recentCount = Number(recentRow && recentRow.total_count ? recentRow.total_count : 0);
  const preserveExistingGlobalBlock = !(decision && decision.decisionLayer === "manual_allow");
  const shouldBlock = (preserveExistingGlobalBlock && Boolean(existing && Number(existing.active_global_block || 0) === 1))
    || recentCount >= REPLY_AI_GLOBAL_BLOCK_THRESHOLD;
  const now = new Date().toISOString();
  const firstFlaggedAt = existing && existing.first_flagged_at
    ? existing.first_flagged_at
    : (latestRow && latestRow.created_at ? latestRow.created_at : now);
  const lastFlaggedAt = latestRow && latestRow.created_at ? latestRow.created_at : now;
  const globalBlockedAt = shouldBlock
    ? (existing && existing.global_blocked_at ? existing.global_blocked_at : now)
    : null;

  await env.DB.prepare(
    `
      INSERT INTO reply_ai_account_risk (
        reply_handle,
        total_high_confidence_hide_count,
        recent_high_confidence_hide_count,
        active_global_block,
        first_flagged_at,
        last_flagged_at,
        global_blocked_at,
        last_reason_short,
        last_item_id,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(reply_handle) DO UPDATE SET
        total_high_confidence_hide_count = excluded.total_high_confidence_hide_count,
        recent_high_confidence_hide_count = excluded.recent_high_confidence_hide_count,
        active_global_block = excluded.active_global_block,
        first_flagged_at = excluded.first_flagged_at,
        last_flagged_at = excluded.last_flagged_at,
        global_blocked_at = excluded.global_blocked_at,
        last_reason_short = excluded.last_reason_short,
        last_item_id = excluded.last_item_id,
        updated_at = excluded.updated_at
    `
  ).bind(
    handle,
    totalCount,
    recentCount,
    shouldBlock ? 1 : 0,
    firstFlaggedAt,
    lastFlaggedAt,
    globalBlockedAt,
    normalizeAiFeedText((decision && decision.reasonShort) || (latestRow && latestRow.reason_short) || "", 120),
    itemRow.id || (latestRow && latestRow.id ? Number(latestRow.id || 0) : null),
    now
  ).run();

  return {
    replyHandle: handle,
    totalHighConfidenceHideCount: totalCount,
    recentHighConfidenceHideCount: recentCount,
    activeGlobalBlock: shouldBlock,
    globalBlockedAt
  };
}

function buildReplyAiHeuristicSummary(itemRow, riskRow) {
  const replyText = String(itemRow && itemRow.replyText ? itemRow.replyText : "");
  const displayName = String(itemRow && itemRow.replyDisplayName ? itemRow.replyDisplayName : "");
  const handle = String(itemRow && itemRow.replyHandle ? itemRow.replyHandle : "");
  const rawHandle = handle.replace(/^@/, "");
  const normalizedReply = normalizeRuleText(replyText);
  const compactReply = buildCompactRuleText(replyText);
  const emojiCount = Array.from(String(replyText || "").matchAll(EMOJI_PATTERN)).length;
  const payloadText = normalizedReply
    .replace(EMOJI_PATTERN, "")
    .replace(COMPACT_PUNCTUATION_PATTERN, "")
    .replace(/[$￥¥€£]/g, "")
    .replace(/\s+/g, "");
  const hasMinimalTextPayload = emojiCount > 0 && Array.from(payloadText).length <= 1;
  const hasFragmentedSymbolicReply = looksLikeFragmentedSymbolicReply(replyText);
  const hasLowInformationBadge = looksLikeLowInformationBadge(replyText);
  const hasThinSymbolOrNumberPayload = looksLikeThinSymbolOrNumberPayload(replyText);
  const hasLongDigitHandle = /\d{6,}/.test(rawHandle);
  const suspiciousHandle = handleLooksSuspicious(handle);
  const lureDisplayName = displayNameLooksLure(displayName);
  const highRiskDisplayName = displayNameLooksHighRisk(displayName);
  const hasShareLinkScam = looksLikeShareLinkScam(replyText);
  const hasCivicLandmarkNearbyQuestion = looksLikeCivicLandmarkNearbyQuestion(replyText);
  const hasGeoMeetupBait = looksLikeGeoMeetupBait(replyText);
  const hasGeoRelationshipBait = looksLikeGeoRelationshipBait(replyText);
  const hasBaitQuestionShape = looksLikeBaitQuestionShape(replyText);
  const hasExplicitEroticBait = looksLikeExplicitEroticBait(replyText);
  const hasEroticMentionRedirect = looksLikeEroticMentionRedirect(replyText);
  const hasSpamTemplateSignal = looksLikeSpamTemplateSignal(replyText);
  const hasDecorativeSloganBait = looksLikeDecorativeSloganBait(replyText);
  const hasPoeticSpamSloganBait = looksLikePoeticSpamSloganBait(replyText);
  const hasGenericShortSloganBait = looksLikeGenericShortSloganBait(replyText);
  const hasBilingualShortSloganBait = looksLikeBilingualShortSloganBait(replyText);
  const hasEmojiNoiseBait = looksLikeEmojiNoiseBait(replyText);
  const avatarSignals = Array.isArray(itemRow && itemRow.avatarEvidenceTags)
    ? itemRow.avatarEvidenceTags
    : [];
  const accountMetadataRisk = highRiskDisplayName
    || (lureDisplayName && suspiciousHandle)
    || (lureDisplayName && hasLongDigitHandle)
    || (suspiciousHandle && hasLongDigitHandle);
  const shortOrThinReply = compactReply.length === 0
    || compactReply.length <= 12
    || hasMinimalTextPayload
    || hasFragmentedSymbolicReply
    || hasLowInformationBadge
    || hasThinSymbolOrNumberPayload
    || hasGenericShortSloganBait
    || hasBilingualShortSloganBait
    || hasEmojiNoiseBait;
  const hasContextDetachedBait = looksLikeContextDetachedBait(replyText, itemRow && itemRow.mainPostText ? itemRow.mainPostText : "", {
    hasEmojiNoiseBait,
    hasDecorativeSloganBait,
    hasPoeticSpamSloganBait,
    hasGenericShortSloganBait,
    hasBilingualShortSloganBait,
    hasSpamTemplateSignal,
    hasLowInformationBadge,
    hasFragmentedSymbolicReply,
    hasMinimalTextPayload,
    hasThinSymbolOrNumberPayload
  });
  const evidenceNotes = [];

  if (highRiskDisplayName) {
    evidenceNotes.push("display name itself contains high-risk drug/abuse language");
  } else if (lureDisplayName) {
    evidenceNotes.push("display name has lure/solicitation wording");
  }
  if (suspiciousHandle) {
    evidenceNotes.push("handle shape looks disposable or marketing-oriented");
  }
  if (hasLongDigitHandle) {
    evidenceNotes.push("handle contains a long digit run");
  }
  if (hasFragmentedSymbolicReply || hasThinSymbolOrNumberPayload) {
    evidenceNotes.push("reply is fragmented emoji/symbol noise rather than normal conversation");
  }
  if (hasLowInformationBadge) {
    evidenceNotes.push("reply is extremely low-information");
  }
  if (hasEmojiNoiseBait) {
    evidenceNotes.push("reply is emoji-heavy low-substance bait");
  }
  if (hasMinimalTextPayload) {
    evidenceNotes.push("reply text payload is nearly empty");
  }
  if (hasShareLinkScam) {
    evidenceNotes.push("reply contains a share-link scam pattern");
  }
  if (hasExplicitEroticBait || hasEroticMentionRedirect) {
    evidenceNotes.push("reply includes erotic bait or redirects attention to another account");
  }
  if (hasSpamTemplateSignal) {
    evidenceNotes.push("reply matches a known spam template");
  }
  if (hasDecorativeSloganBait && suspiciousHandle) {
    evidenceNotes.push("reply is a decorative low-substance slogan from a disposable-looking account");
  }
  if (hasPoeticSpamSloganBait && suspiciousHandle) {
    evidenceNotes.push("reply is a poetic low-substance slogan from a disposable-looking account");
  }
  if (hasGenericShortSloganBait && (suspiciousHandle || /^[a-z]{4,}[0-9]{2,}$/i.test(rawHandle) || /^[a-z]{6,}$/i.test(rawHandle))) {
    evidenceNotes.push("reply is a generic short low-substance slogan from a disposable-looking account");
  }
  if (hasBilingualShortSloganBait && (suspiciousHandle || /^[a-z]{4,}[0-9]{2,}$/i.test(rawHandle) || /^[a-z]{6,}$/i.test(rawHandle))) {
    evidenceNotes.push("reply is a repeated English-label Chinese slogan from a disposable-looking account");
  }
  if (hasContextDetachedBait) {
    evidenceNotes.push("reply appears unrelated to the main post context");
  }
  if (avatarSignals.includes("context_detached_reply")) {
    evidenceNotes.push("reply appears detached from the thread context and may need avatar/profile evidence");
  }
  if (itemRow && itemRow.avatarVisionRequested && itemRow.avatarImageUrl) {
    evidenceNotes.push("avatar image evidence was requested for this ambiguous low-substance reply");
  }
  if (hasGeoMeetupBait || hasBaitQuestionShape) {
    evidenceNotes.push("reply shape resembles meetup/contact bait");
  }
  if (hasGeoRelationshipBait) {
    evidenceNotes.push("reply is a short geo relationship lure template");
  }
  if (Number(riskRow && riskRow.total_high_confidence_hide_count ? riskRow.total_high_confidence_hide_count : 0) > 0) {
    evidenceNotes.push("this account already has prior high-confidence AI hides");
  }

  return {
    highRiskDisplayName,
    lureDisplayName,
    suspiciousHandle,
    hasLongDigitHandle,
    accountMetadataRisk,
    hasMinimalTextPayload,
    hasFragmentedSymbolicReply,
    hasLowInformationBadge,
    hasThinSymbolOrNumberPayload,
    shortOrThinReply,
    hasShareLinkScam,
    hasCivicLandmarkNearbyQuestion,
    hasGeoMeetupBait,
    hasGeoRelationshipBait,
    hasBaitQuestionShape,
    hasExplicitEroticBait,
    hasEroticMentionRedirect,
    hasSpamTemplateSignal,
    hasDecorativeSloganBait,
    hasPoeticSpamSloganBait,
    hasGenericShortSloganBait,
    hasBilingualShortSloganBait,
    hasEmojiNoiseBait,
    hasContextDetachedBait,
    avatarEvidenceTags: normalizeReplyAiStringList(avatarSignals, REPLY_AI_AVATAR_EVIDENCE_TAGS, REPLY_AI_AVATAR_EVIDENCE_TAG_LIMIT),
    avatarVisionRequested: Boolean(itemRow && itemRow.avatarVisionRequested),
    evidenceNotes
  };
}

function getReplyAiMemoryExpiresAt(memoryKeyType) {
  const days = memoryKeyType === "template"
    ? REPLY_AI_MEMORY_TEMPLATE_WINDOW_DAYS
    : REPLY_AI_MEMORY_EXACT_WINDOW_DAYS;
  return new Date(Date.now() + (days * 24 * 60 * 60 * 1000)).toISOString();
}

function isDirectAiHighConfidenceHide(decision) {
  return Boolean(
    decision
    && decision.action === "hide"
    && decision.status === "ready"
    && decision.confidence === "high"
    && decision.decisionLayer === "ai"
    && Array.isArray(decision.matchedSafetyLabels)
    && decision.matchedSafetyLabels.length > 0
  );
}

function buildReplyAiMemoryContextKey(itemRow, heuristicSummary) {
  const profileSignals = Array.isArray(itemRow && itemRow.profileSignalTags)
    ? itemRow.profileSignalTags
    : [];
  const contextFlags = [];
  if (heuristicSummary.accountMetadataRisk) {
    contextFlags.push("account-risk");
  }
  if (heuristicSummary.highRiskDisplayName) {
    contextFlags.push("high-risk-name");
  } else if (heuristicSummary.lureDisplayName) {
    contextFlags.push("lure-name");
  }
  if (heuristicSummary.suspiciousHandle || heuristicSummary.hasLongDigitHandle) {
    contextFlags.push("handle-risk");
  }
  if (heuristicSummary.hasGeoMeetupBait || heuristicSummary.hasGeoRelationshipBait || heuristicSummary.hasBaitQuestionShape) {
    contextFlags.push("meetup-shape");
  }
  if (heuristicSummary.hasExplicitEroticBait || heuristicSummary.hasEroticMentionRedirect) {
    contextFlags.push("erotic-bait");
  }
  if (heuristicSummary.hasShareLinkScam || heuristicSummary.hasSpamTemplateSignal) {
    contextFlags.push("spam-template");
  }
  if (heuristicSummary.hasDecorativeSloganBait) {
    contextFlags.push("decorative-slogan");
  }
  if (heuristicSummary.hasPoeticSpamSloganBait) {
    contextFlags.push("poetic-slogan");
  }
  if (heuristicSummary.hasGenericShortSloganBait) {
    contextFlags.push("generic-short-slogan");
  }
  if (heuristicSummary.hasBilingualShortSloganBait) {
    contextFlags.push("bilingual-short-slogan");
  }
  if (heuristicSummary.hasEmojiNoiseBait) {
    contextFlags.push("emoji-noise");
  }
  if (heuristicSummary.hasContextDetachedBait) {
    contextFlags.push("context-detached");
  }
  if (heuristicSummary.avatarVisionRequested) {
    contextFlags.push("avatar-vision-requested");
  }
  (Array.isArray(heuristicSummary.avatarEvidenceTags) ? heuristicSummary.avatarEvidenceTags : []).forEach((signal) => {
    contextFlags.push(`avatar-${signal}`);
  });
  profileSignals.forEach((signal) => {
    if (["contact_keyword", "contact_payload", "profile_redirect", "external_link", "suspicious_bio"].includes(signal)) {
      contextFlags.push(`profile-${signal}`);
    }
  });
  return Array.from(new Set(contextFlags)).sort().join("|");
}

async function buildReplyAiMemoryKeyEntries(itemRow, riskRow) {
  if (!itemRow || itemRow.accountProtected) {
    return [];
  }

  const normalizedReplyText = normalizeAiComparableText(itemRow.replyText).slice(0, 800);
  if (!normalizedReplyText) {
    return [];
  }

  const heuristicSummary = buildReplyAiHeuristicSummary(itemRow, riskRow || null);
  const contextKey = buildReplyAiMemoryContextKey(itemRow, heuristicSummary);
  const entries = [];

  if (
    normalizedReplyText.length >= 8
    || heuristicSummary.accountMetadataRisk
    || heuristicSummary.hasShareLinkScam
    || heuristicSummary.hasSpamTemplateSignal
    || heuristicSummary.hasGeoMeetupBait
    || heuristicSummary.hasGeoRelationshipBait
    || heuristicSummary.hasExplicitEroticBait
    || contextKey
  ) {
    entries.push({
      memoryKeyType: "exact_text",
      source: JSON.stringify(["reply-ai-memory", "exact_text", normalizedReplyText])
    });
  }

  if (normalizedReplyText.length <= 16 && contextKey) {
    entries.push({
      memoryKeyType: "thin_context",
      source: JSON.stringify(["reply-ai-memory", "thin_context", normalizedReplyText, contextKey])
    });
  }

  const templateKey = buildTemplateRuleAnalysis(itemRow.replyText).templateKey;
  if (
    templateKey
    && (
      heuristicSummary.accountMetadataRisk
      || heuristicSummary.hasSpamTemplateSignal
      || heuristicSummary.hasEroticMentionRedirect
      || heuristicSummary.hasExplicitEroticBait
      || heuristicSummary.hasGeoMeetupBait
      || heuristicSummary.hasGeoRelationshipBait
      || heuristicSummary.hasBaitQuestionShape
      || heuristicSummary.hasShareLinkScam
      || contextKey
    )
  ) {
    entries.push({
      memoryKeyType: "template",
      source: JSON.stringify(["reply-ai-memory", "template", templateKey, contextKey || "general"])
    });
  }

  const keyedEntries = [];
  const seen = new Set();
  for (const entry of entries) {
    const memoryKey = await sha256Hex(entry.source);
    if (!memoryKey || seen.has(memoryKey)) {
      continue;
    }
    seen.add(memoryKey);
    keyedEntries.push({
      memoryKey,
      memoryKeyType: entry.memoryKeyType
    });
  }
  return keyedEntries;
}

function buildReplyAiMemoryDecision(row) {
  return buildDefaultReplyAiDecision({
    action: "hide",
    decisionLayer: `ai_memory_${normalizeAiFeedText(row && row.memory_key_type ? row.memory_key_type : "exact_text", 24) || "exact_text"}`,
    matchedSafetyLabels: normalizeReplyAiStringList(parseJsonArray(row && row.matched_safety_labels_json), REPLY_AI_SAFETY_LABELS, 8),
    matchedProfileSignals: normalizeReplyAiStringList(parseJsonArray(row && row.matched_profile_signals_json), REPLY_AI_PROFILE_SIGNAL_LABELS, 8),
    confidence: row && row.confidence ? String(row.confidence || "high") : "high",
    reasonShort: row && row.reason_short ? row.reason_short : "命中后台学习库",
    status: "ready",
    model: row && row.prompt_version ? row.prompt_version : REPLY_AI_MEMORY_POLICY_VERSION
  });
}

async function findReplyAiMemoryDecision(env, itemRow, riskRow) {
  const keyEntries = await buildReplyAiMemoryKeyEntries(itemRow, riskRow);
  if (!keyEntries.length) {
    return null;
  }

  const now = new Date().toISOString();
  for (const keyEntry of keyEntries) {
    const row = await env.DB.prepare(
      `
        SELECT
          id,
          memory_key_type,
          action,
          confidence,
          matched_safety_labels_json,
          matched_profile_signals_json,
          reason_short,
          prompt_version,
          hit_count,
          expires_at
        FROM reply_ai_memory
        WHERE memory_key = ?
          AND prompt_version = ?
          AND status = 'active'
          AND action = 'hide'
          AND confidence = 'high'
          AND (expires_at IS NULL OR expires_at > ?)
        LIMIT 1
      `
    ).bind(keyEntry.memoryKey, REPLY_AI_MEMORY_POLICY_VERSION, now).first();

    if (!row) {
      continue;
    }

    await env.DB.prepare(
      `
        UPDATE reply_ai_memory
        SET hit_count = hit_count + 1,
          last_seen_at = ?,
          updated_at = ?
        WHERE id = ?
      `
    ).bind(now, now, row.id).run();

    return buildReplyAiMemoryDecision(row);
  }

  return null;
}

async function upsertReplyAiMemoryFromDecision(env, itemRow, decision) {
  if (!isDirectAiHighConfidenceHide(decision)) {
    return;
  }

  const riskRow = itemRow && itemRow.replyHandle
    ? await getReplyAiAccountRiskRow(env, itemRow.replyHandle)
    : null;
  const keyEntries = await buildReplyAiMemoryKeyEntries(itemRow, riskRow);
  if (!keyEntries.length) {
    return;
  }

  const now = new Date().toISOString();
  for (const keyEntry of keyEntries) {
    await env.DB.prepare(
      `
        INSERT INTO reply_ai_memory (
          id,
          memory_key,
          memory_key_type,
          action,
          confidence,
          matched_safety_labels_json,
          matched_profile_signals_json,
          reason_short,
          prompt_version,
          source_item_id,
          source_result_updated_at,
          status,
          disabled_reason,
          expires_at,
          hit_count,
          first_seen_at,
          last_seen_at,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, 'hide', 'high', ?, ?, ?, ?, ?, ?, 'active', '', ?, 0, ?, ?, ?, ?)
        ON CONFLICT(memory_key, prompt_version) DO UPDATE SET
          memory_key_type = excluded.memory_key_type,
          action = excluded.action,
          confidence = excluded.confidence,
          matched_safety_labels_json = excluded.matched_safety_labels_json,
          matched_profile_signals_json = excluded.matched_profile_signals_json,
          reason_short = excluded.reason_short,
          source_item_id = excluded.source_item_id,
          source_result_updated_at = excluded.source_result_updated_at,
          status = 'active',
          disabled_reason = '',
          expires_at = excluded.expires_at,
          last_seen_at = excluded.last_seen_at,
          updated_at = excluded.updated_at
      `
    ).bind(
      crypto.randomUUID(),
      keyEntry.memoryKey,
      keyEntry.memoryKeyType,
      JSON.stringify(normalizeReplyAiStringList(decision.matchedSafetyLabels, REPLY_AI_SAFETY_LABELS, 8)),
      JSON.stringify(normalizeReplyAiStringList(decision.matchedProfileSignals, REPLY_AI_PROFILE_SIGNAL_LABELS, 8)),
      normalizeAiFeedText(decision.reasonShort || "后台已判定为垃圾回复", 120),
      REPLY_AI_MEMORY_POLICY_VERSION,
      itemRow && itemRow.id ? Number(itemRow.id || 0) : null,
      now,
      getReplyAiMemoryExpiresAt(keyEntry.memoryKeyType),
      now,
      now,
      now,
      now
    ).run();
  }
}

async function deactivateReplyAiMemoryForItem(env, itemRow, reason) {
  if (!itemRow || !itemRow.id) {
    return;
  }

  const riskRow = itemRow.replyHandle ? await getReplyAiAccountRiskRow(env, itemRow.replyHandle) : null;
  const keyEntries = await buildReplyAiMemoryKeyEntries(itemRow, riskRow);
  const memoryKeys = keyEntries.map((entry) => entry.memoryKey).filter(Boolean);
  const now = new Date().toISOString();
  const disabledReason = normalizeAiFeedText(reason || "manual_restore", 80);
  const clauses = ["source_item_id = ?"];
  const binds = [disabledReason, now, now, Number(itemRow.id || 0)];

  if (memoryKeys.length) {
    clauses.push(`memory_key IN (${memoryKeys.map(() => "?").join(", ")})`);
    binds.push(...memoryKeys);
  }

  binds.push(REPLY_AI_MEMORY_POLICY_VERSION);
  await env.DB.prepare(
    `
      UPDATE reply_ai_memory
      SET status = 'disabled',
        disabled_reason = ?,
        expires_at = ?,
        updated_at = ?
      WHERE (${clauses.join(" OR ")})
        AND prompt_version = ?
        AND status = 'active'
    `
  ).bind(...binds).run();
}

function buildReplyAiDecisionSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      action: {
        type: "string",
        enum: ["hide", "allow"]
      },
      matchedLabels: {
        type: "array",
        items: {
          type: "string",
          enum: Array.from(REPLY_AI_SAFETY_LABELS).filter((item) => item !== "global_blocklist")
        }
      },
      matchedProfileSignals: {
        type: "array",
        items: {
          type: "string",
          enum: Array.from(REPLY_AI_PROFILE_SIGNAL_LABELS)
        }
      },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low"]
      },
      reasonShort: {
        type: "string"
      },
      status: {
        type: "string",
        enum: ["ready", "failed", "skipped"]
      }
    },
    required: [
      "action",
      "matchedLabels",
      "matchedProfileSignals",
      "confidence",
      "reasonShort",
      "status"
    ]
  };
}

function buildReplyAiBatchDecisionSchema() {
  const decisionSchema = buildReplyAiDecisionSchema();
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      decisions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: Object.assign({}, decisionSchema.properties, {
            clientItemId: {
              type: "string"
            }
          }),
          required: ["clientItemId"].concat(decisionSchema.required)
        }
      }
    },
    required: ["decisions"]
  };
}

function buildReplyAiProviderPrompt(settings, options) {
  const isBatch = Boolean(options && options.isBatch);
  return [
    isBatch
      ? "You are the primary moderation decision-maker for multiple independent X replies."
      : "You are the primary moderation decision-maker for a single X reply.",
    `Reply moderation policy version: ${REPLY_AI_MEMORY_POLICY_VERSION}.`,
    "The base policy should protect normal expression: sexual, erotic, pornographic, adult-topic, sex-education, creator-industry, or content-governance discussion is allowed when it is substantive, conversational, opinion-based, humorous, critical, or part of the thread context.",
    "Sexual or pornographic content is not a violation by itself. Allow it when it is normal discussion, preference, commentary, joke, review, criticism, education, or platform-governance talk.",
    "Do not hide merely because a reply contains sexual words, erotic preferences, porn discussion, adult jokes, sex-worker discussion, controversial adult-topic opinions, or explicit but non-spammy adult phrasing.",
    "Hide only when the reply is clearly spammy, contact redirect, scam/fraud, malware or unsafe-download bait, meaningless bait, profile-link risk, or adult/meetup lead-generation.",
    "Hide adult/sexual content only when it clearly combines with paid or free hookup solicitation, meetup bait, contact handles, off-platform contact redirect, scam/fraud, malware risk, unsafe external links, profile-link lure, or low-information bait from risky account metadata.",
    "Meaningless bait means a thin or content-free reply whose purpose is lure/lead generation, especially when paired with risky display name, suspicious handle, profile redirect, contact payload, or prior risk history. Do not label ordinary short replies as meaningless bait without supporting risk evidence.",
    "For the user's current X spam problem, a generic short Chinese slogan with emoji/symbol decoration and no useful thread relevance from a disposable-looking/random handle is enough supporting risk evidence for meaningless_bait, even without explicit adult words or contact details. Treat it as batch visibility bait, not as a normal opinion.",
    "A decorative, motto-like, or generic short low-substance slogan reply can be meaningless bait when it comes from a disposable-looking account and has no useful relation to the thread, but allow normal quotes, jokes, and substantive conversation.",
    "You must evaluate supplied account metadata as first-class evidence, not just reply text.",
    "Always inspect replyDisplayName, replyHandle, handle shape, long digit runs, profile bio, profile links, and whether the reply is fragmented emoji/symbol noise or an almost-empty bait reply.",
    "The user payload is an evidence card for each reply. Treat reply text, display name, @handle, avatar evidence, profile bio, profile links, profile signal tags, and batch context as separate evidence fields.",
    "Always compare mainPostText with replyText. A short decorative, slogan-like, or emoji-heavy reply that has no useful relation to the original post is stronger spam evidence when the account handle, avatar, profile, or batch pattern is also suspicious; do not hide substantive replies that are clearly relevant to the thread.",
    "For Chinese X spam, treat lure phrases in replyDisplayName as important evidence even when replyText is only digits or emoji. Examples include 每晚准时大秀, 今晚准时涩播/色播, 找固定泡友/炮友, 寻男大固泡, 蹲一个弟弟/哥哥, 免费破处, 无偿线下, 看我主页, 附近真实约见, 来个真人认识一下, and 附近的DD.",
    "Also treat batches of poetic or generic short low-substance Chinese slogan replies from disposable-looking handles as spam when they repeat themes like 浅交不如深知己, 高质量交友贵在合拍, 品行相近方同行, 拒绝无效的寒暄, 烟火暖了相逢, 人海有幸擦肩, 缘分引线人海逢, 有缘自会相识, 遇见温柔满人间, 怡好刚好温良友, 旧城偶遇故人, 晚风撞我相逢, 一念恰好相逢, 独具魅力, or 克服睡眼 with emoji/symbol decoration and no thread relevance.",
    "Also treat a repeated English label wrapping a short Chinese low-substance slogan, followed by emoji decoration, as the same batch-visibility bait when the handle looks disposable and the reply has no useful relation to the thread.",
    "For these generic short slogan cases, hide with confidence high when the account handle looks random/disposable and the reply is detached; use allow only for common greetings/congratulations/thanks, relevant jokes, or substantive comments. A rough but substantive comment such as 你这问题有意思。男的就是会这样犯贱啊 should be allowed.",
    "When a risky Chinese display name is paired with an emoji-only, number-only, or otherwise content-free reply from a disposable-looking handle, hide with high confidence using adult_solicitation and/or meaningless_bait.",
    "If avatar.visionRequested is true and an avatar image is attached, inspect the avatar for text or visual lure cues such as 全国安排, local hookup, contact, adult-service, QR/contact, or profile bait. Use avatar evidence only as supporting evidence; never invent avatar content when an image is not attached or not visible.",
    "If avatar evidence tags say context_detached_reply, treat that as a sign that the reply may be unrelated filler; combine it with account metadata, profile, avatar, or batch patterns before hiding.",
    "Combined weak signals across name, handle, reply text, profile, and prior risk history can justify a high-confidence hide when they clearly form a lure/spam pattern.",
    "Do not ignore suspicious names or suspicious handles merely because the reply text itself is short.",
    "Profile bio and profile links are auxiliary evidence only and must never be the sole reason to hide normal discussion.",
    "Protected accounts (followed or verified) should be treated more leniently and only hidden when the evidence is very strong.",
    "When the evidence is ambiguous between normal adult speech and adult lead-generation spam, return action allow.",
    "If confidence is not high, return action allow.",
    "Use matchedLabels only from the provided enum.",
    "Use matchedProfileSignals only from the provided enum.",
    "When action is hide, matchedLabels must contain at least one provided safety label that explains the hide decision.",
    isBatch
      ? "Return exactly one decision for every clientItemId in the batch, and preserve each clientItemId exactly."
      : "",
    settings && settings.moderationPrompt
      ? `Additional operator guidance: ${settings.moderationPrompt}`
      : ""
  ].filter(Boolean).join(" ");
}

function buildReplyAiProviderInputItem(clientItemId, itemRow, riskRow) {
  return {
    clientItemId: normalizeReplyAiClientItemId(clientItemId, itemRow && itemRow.id ? `reply-ai-${itemRow.id}` : "reply-ai-item"),
    reply: {
      threadUrl: itemRow.threadUrl,
      threadStatusId: itemRow.threadStatusId,
      replyStatusId: itemRow.replyStatusId,
      replyHandle: itemRow.replyHandle,
      replyDisplayName: itemRow.replyDisplayName,
      replyText: itemRow.replyText,
      mainPostText: itemRow.mainPostText,
      accountProtected: Boolean(itemRow.accountProtected)
    },
    avatar: {
      imageUrl: itemRow.avatarImageUrl,
      altText: itemRow.avatarAltText,
      evidenceTags: itemRow.avatarEvidenceTags,
      fetchStatus: itemRow.avatarFetchStatus,
      visionRequested: Boolean(itemRow.avatarVisionRequested)
    },
    profile: {
      path: itemRow.profilePath,
      bioText: itemRow.profileBioText,
      signalTags: itemRow.profileSignalTags,
      links: itemRow.profileLinks,
      fetchStatus: itemRow.profileFetchStatus
    },
    heuristics: buildReplyAiHeuristicSummary(itemRow, riskRow),
    history: {
      priorHighConfidenceHideCount: Number(riskRow && riskRow.total_high_confidence_hide_count ? riskRow.total_high_confidence_hide_count : 0),
      recentHighConfidenceHideCount: Number(riskRow && riskRow.recent_high_confidence_hide_count ? riskRow.recent_high_confidence_hide_count : 0),
      alreadyOnGlobalBlocklist: Boolean(riskRow && Number(riskRow.active_global_block || 0) === 1)
    }
  };
}

function buildReplyAiImageEvidenceUrls(itemRow) {
  if (!itemRow || !itemRow.avatarVisionRequested) {
    return [];
  }
  const avatarImageUrl = normalizeReplyAiAvatarImageUrl(itemRow.avatarImageUrl || "");
  return avatarImageUrl ? [avatarImageUrl] : [];
}

async function requestReplyAiDecisionFromProvider(env, settings, itemRow, riskRow) {
  const imageEvidenceUrls = buildReplyAiImageEvidenceUrls(itemRow);
  const response = await requestAiModerationTaskFromProvider(buildAiModerationTask({
    taskType: AI_MODERATION_TASK_TYPES.REPLY_REALTIME_MODERATION,
    providerConfig: settings,
    schemaName: "reply_moderation_decision",
    responseSchema: buildReplyAiDecisionSchema(),
    developerPrompt: buildReplyAiProviderPrompt(settings, { isBatch: false }),
    userPayloadText: JSON.stringify(buildReplyAiProviderInputItem("single-item", itemRow, riskRow)),
    metadata: {
      reasoningEffort: "low",
      imageEvidenceUrls
    }
  }));

  return normalizeReplyAiDecision(response.parsed, response.model, response.responseMeta);
}

async function requestReplyAiBatchDecisionsFromProvider(env, settings, batchEntries) {
  const expectedClientIds = new Set();
  const items = batchEntries.map((entry) => {
    const clientItemId = normalizeReplyAiClientItemId(
      entry && entry.clientItemId,
      entry && entry.itemRow && entry.itemRow.id ? `reply-ai-${entry.itemRow.id}` : "reply-ai-item"
    );
    expectedClientIds.add(clientItemId);
    return buildReplyAiProviderInputItem(clientItemId, entry.itemRow, entry.riskRow);
  });
  const response = await requestAiModerationTaskFromProvider(buildAiModerationTask({
    taskType: AI_MODERATION_TASK_TYPES.REPLY_REALTIME_MODERATION,
    providerConfig: settings,
    schemaName: "reply_moderation_batch",
    responseSchema: buildReplyAiBatchDecisionSchema(),
    developerPrompt: buildReplyAiProviderPrompt(settings, { isBatch: true }),
    userPayloadText: JSON.stringify({ items }),
    metadata: {
      reasoningEffort: "low",
      imageEvidenceUrls: []
    }
  }));
  const decisionRows = response && response.parsed && Array.isArray(response.parsed.decisions)
    ? response.parsed.decisions
    : [];
  const decisionMap = new Map();

  decisionRows.forEach((row) => {
    const clientItemId = normalizeReplyAiClientItemId(row && row.clientItemId, "");
    if (!clientItemId || !expectedClientIds.has(clientItemId) || decisionMap.has(clientItemId)) {
      return;
    }

    decisionMap.set(clientItemId, normalizeReplyAiDecision(row, response.model, {
      id: response.responseMeta && response.responseMeta.id ? response.responseMeta.id : "",
      outputText: response.responseMeta && response.responseMeta.outputText ? response.responseMeta.outputText : "",
      clientItemId
    }));
  });

  return decisionMap;
}

function buildReplyAiNotFoundDecision() {
  return buildDefaultReplyAiDecision({
    status: "failed",
    decisionLayer: "failed",
    reasonShort: "样本不存在"
  });
}

function buildReplyAiStaticDecision(itemRow, settings) {
  if (!itemRow) {
    return buildReplyAiNotFoundDecision();
  }

  if (!itemRow.userId) {
    return buildDefaultReplyAiDecision({
      decisionLayer: "skipped",
      reasonShort: "等待账号绑定",
      status: "skipped"
    });
  }

  if (!settings.replyAiEnabled) {
    return buildDefaultReplyAiDecision({
      decisionLayer: "skipped",
      reasonShort: "回复区 AI 审核已关闭",
      status: "skipped"
    });
  }

  if (!String(settings.apiKey || "").trim()) {
    return buildDefaultReplyAiDecision({
      decisionLayer: "skipped",
      reasonShort: "未配置用户 AI Key",
      status: "skipped",
      model: settings.model
    });
  }

  if (!itemRow.replyText && !itemRow.replyDisplayName && !itemRow.replyHandle) {
    return buildDefaultReplyAiDecision({
      decisionLayer: "skipped",
      reasonShort: "回复信息不足",
      status: "skipped",
      model: settings.model
    });
  }

  return null;
}

function buildReplyAiBlockedDecision() {
  return buildDefaultReplyAiDecision({
    action: "hide",
    decisionLayer: "global_blocklist",
    matchedSafetyLabels: ["global_blocklist"],
    confidence: "high",
    reasonShort: "命中全局账号屏蔽名单",
    status: "ready",
    model: ""
  });
}

function buildModerationRuleCandidateDecision(row) {
  const ruleType = normalizeAiFeedText(row && row.rule_type ? row.rule_type : "rule", 24);
  const safetyLabel = normalizeReplyAiStringList([row && row.safety_label ? row.safety_label : "lead_gen_spam"], REPLY_AI_SAFETY_LABELS, 1)[0] || "lead_gen_spam";
  return buildDefaultReplyAiDecision({
    action: "hide",
    decisionLayer: `db_rule_${ruleType}`.slice(0, 40),
    matchedSafetyLabels: [safetyLabel],
    confidence: "high",
    reasonShort: "命中数据库学习库",
    status: "ready",
    model: MODERATION_RULE_CANDIDATE_POLICY_VERSION
  });
}

async function hasManualAllowForReplyAiItem(env, itemRow) {
  const sourceRow = buildModerationRuleCandidateSourceRowFromReplyAiItem(itemRow);
  const normalizedText = sourceRow.normalized_text || normalizeRuleText(sourceRow.reply_text || "");
  const compactText = sourceRow.compact_text || buildCompactRuleText(sourceRow.reply_text || normalizedText || "");
  const replyHandle = normalizeAiHandle(sourceRow.reply_handle || "");
  const replyStatusId = String(sourceRow.reply_status_id || "").trim();
  const syncKey = String(sourceRow.sync_key || "").trim();
  if (!syncKey) {
    return false;
  }

  const row = await env.DB.prepare(
    `
      SELECT id
      FROM moderation_events
      WHERE sync_key = ?
        AND event_type = 'manual_allow'
        AND (
          (? != '' AND reply_status_id = ?)
          OR (? != '' AND normalized_text = ? AND COALESCE(reply_handle, '') = ?)
          OR (? != '' AND compact_text = ? AND COALESCE(reply_handle, '') = ?)
        )
      LIMIT 1
    `
  ).bind(
    syncKey,
    replyStatusId,
    replyStatusId,
    normalizedText,
    normalizedText,
    replyHandle,
    compactText,
    compactText,
    replyHandle
  ).first();

  return Boolean(row && row.id);
}

async function findModerationRuleCandidateDecision(env, itemRow) {
  if (!itemRow || itemRow.accountProtected) {
    return null;
  }
  if (await hasManualAllowForReplyAiItem(env, itemRow)) {
    return null;
  }

  const entries = buildModerationRuleCandidateEntriesFromSourceRow(
    buildModerationRuleCandidateSourceRowFromReplyAiItem(itemRow)
  );
  if (!entries.length) {
    return null;
  }

  const priority = ["exact_text", "compact_text", "template", "pattern"];
  const sortedEntries = entries.slice().sort((left, right) => {
    return priority.indexOf(left.ruleType) - priority.indexOf(right.ruleType);
  });

  for (const entry of sortedEntries) {
    const row = await env.DB.prepare(
      `
        SELECT
          rule_type,
          pattern_key,
          safety_label,
          confidence_score
        FROM moderation_rule_candidates
        WHERE rule_type = ?
          AND pattern_key = ?
          AND action = 'hide'
          AND status = 'active'
          AND positive_label_count > 0
          AND negative_label_count = 0
        ORDER BY confidence_score DESC, updated_at DESC
        LIMIT 1
      `
    ).bind(entry.ruleType, entry.patternKey).first();

    if (row) {
      return buildModerationRuleCandidateDecision(row);
    }
  }

  return null;
}

async function demoteModerationRuleCandidatesForReplyAiItem(env, itemRow) {
  const entries = buildModerationRuleCandidateEntriesFromSourceRow(
    buildModerationRuleCandidateSourceRowFromReplyAiItem(itemRow)
  );
  if (!entries.length) {
    return;
  }
  const now = new Date().toISOString();
  for (const entry of entries) {
    await env.DB.prepare(
      `
        UPDATE moderation_rule_candidates
        SET status = CASE WHEN status = 'active' THEN 'candidate' ELSE status END,
          negative_label_count = CASE WHEN negative_label_count = 0 THEN 1 ELSE negative_label_count END,
          updated_at = ?
        WHERE rule_type = ?
          AND pattern_key = ?
          AND status != 'rejected'
      `
    ).bind(now, entry.ruleType, entry.patternKey).run();
  }
}

async function finalizeReplyAiDecision(env, itemRow, decision) {
  if (!itemRow || !itemRow.id) {
    return decision;
  }

  await upsertReplyAiResult(env, itemRow.id, decision);
  try {
    await recordModerationTrainingLabelFromReplyAiDecision(env, itemRow, decision);
  } catch (error) {
    // Training capture must never block realtime moderation.
  }
  if (decision && decision.decisionLayer === "manual_allow") {
    await deactivateReplyAiMemoryForItem(env, itemRow, "manual_restore");
    await demoteModerationRuleCandidatesForReplyAiItem(env, itemRow);
  } else if (isDirectAiHighConfidenceHide(decision)) {
    await upsertReplyAiMemoryFromDecision(env, itemRow, decision);
  }
  if (decision.status === "ready" && decision.action === "hide" && decision.confidence === "high") {
    await refreshReplyAiAccountRisk(env, itemRow, decision);
  }
  return decision;
}

function shouldRequestReplyAiTeacherReview(itemRow, settings) {
  const avatarTags = Array.isArray(itemRow && itemRow.avatarEvidenceTags)
    ? itemRow.avatarEvidenceTags
    : [];
  const profileTags = Array.isArray(itemRow && itemRow.profileSignalTags)
    ? itemRow.profileSignalTags
    : [];
  const replyText = itemRow && itemRow.replyText ? itemRow.replyText : "";
  const replyDisplayName = itemRow && itemRow.replyDisplayName ? itemRow.replyDisplayName : "";
  const replyHandle = itemRow && itemRow.replyHandle ? itemRow.replyHandle : "";
  const highRiskDisplayName = displayNameLooksHighRisk(replyDisplayName);
  const lureDisplayName = displayNameLooksLure(replyDisplayName);
  const suspiciousHandle = handleLooksSuspicious(replyHandle);
  const weakDisposableHandle = /^[a-z]{4,}[0-9]{2,}$/i.test(String(replyHandle || "").replace(/^@/, ""))
    || /^[a-z]{6,}$/i.test(String(replyHandle || "").replace(/^@/, ""));
  const riskyProfile = profileTags.includes("contact_keyword")
    || profileTags.includes("contact_payload")
    || profileTags.includes("profile_redirect")
    || profileTags.includes("suspicious_bio");
  const thinOrBaitText = looksLikeMinimalTextPayload(replyText)
    || looksLikeFragmentedSymbolicReply(replyText)
    || looksLikeThinSymbolOrNumberPayload(replyText)
    || looksLikeLowInformationBadge(replyText)
    || looksLikeEmojiNoiseBait(replyText)
    || looksLikeGenericShortSloganBait(replyText)
    || looksLikeBilingualShortSloganBait(replyText)
    || looksLikeDecorativeSloganBait(replyText)
    || looksLikePoeticSpamSloganBait(replyText);
  const strongTextSignal = looksLikeShareLinkScam(replyText)
    || looksLikeGeoRelationshipBait(replyText)
    || looksLikeSpamTemplateSignal(replyText)
    || looksLikeExplicitEroticBait(replyText)
    || looksLikeEroticMentionRedirect(replyText);
  const teacherEvidenceTag = avatarTags.some((tag) => [
    "teacher_review_requested",
    "avatar_vision_requested",
    "high_risk_display_name",
    "geo_relationship_bait",
    "spam_template_signal",
    "poetic_low_substance_reply",
    "decorative_low_substance_reply",
    "generic_short_slogan_reply",
    "bilingual_short_slogan_reply",
    "emoji_noise_reply",
    "context_detached_reply",
    "lure_display_name"
  ].includes(String(tag || "")));

  return Boolean(
    itemRow
    && settings
    && settings.replyAiEnabled
    && settings.apiKey
    && (
      teacherEvidenceTag
      || Boolean(itemRow.avatarVisionRequested)
      || riskyProfile
      || highRiskDisplayName
      || (lureDisplayName && (suspiciousHandle || thinOrBaitText || strongTextSignal))
      || (suspiciousHandle && (thinOrBaitText || strongTextSignal))
      || (weakDisposableHandle && looksLikeGenericShortSloganBait(replyText) && thinOrBaitText)
      || (weakDisposableHandle && looksLikeBilingualShortSloganBait(replyText) && thinOrBaitText)
      || (strongTextSignal && (lureDisplayName || suspiciousHandle))
    )
  );
}

async function requestReplyAiTeacherReviewDecision(env, settings, itemRow, riskRow) {
  if (!shouldRequestReplyAiTeacherReview(itemRow, settings)) {
    return null;
  }

  const scopeKey = buildReplyAiProviderScopeKey(itemRow.userId, settings);
  const cooldownRow = await getAiProviderCooldownRow(env, scopeKey);
  if (isAiProviderCoolingDown(cooldownRow)) {
    return null;
  }

  try {
    const decision = await requestReplyAiDecisionFromProvider(env, settings, itemRow, riskRow || null);
    await clearAiProviderCooldown(env, scopeKey, itemRow, settings);
    if (decision && decision.status === "ready" && decision.decisionLayer === "ai") {
      try {
        await recordModerationTrainingLabelFromReplyAiDecision(env, itemRow, decision, { skipCandidateRefresh: true });
      } catch (error) {
        // Teacher labels are useful, but realtime moderation must not wait on training capture.
      }
    }
    return isDirectAiHighConfidenceHide(decision) ? decision : null;
  } catch (error) {
    const errorMessage = error && error.message ? String(error.message) : "";
    const retryableProviderFailure = /ai-provider-status-(429|500|502|503|504|529)/i.test(errorMessage);
    if (retryableProviderFailure) {
      await recordAiProviderFailure(
        env,
        scopeKey,
        itemRow,
        settings,
        errorMessage.match(/ai-provider-status-\d+/i)
          ? String(errorMessage.match(/ai-provider-status-\d+/i)[0] || "")
          : "provider-failure"
      );
    }
    return null;
  }
}

function scheduleReplyAiTeacherReview(ctx, env, settings, itemRow, riskRow) {
  if (!ctx || typeof ctx.waitUntil !== "function" || !shouldRequestReplyAiTeacherReview(itemRow, settings)) {
    return false;
  }

  ctx.waitUntil((async () => {
    const decision = await requestReplyAiTeacherReviewDecision(env, settings, itemRow, riskRow || null);
    if (decision && !(await hasManualAllowForReplyAiItem(env, itemRow))) {
      await finalizeReplyAiDecision(env, itemRow, decision);
    }
  })().catch(() => null));
  return true;
}

async function classifyReplyAiItemEntries(env, entries, options) {
  await ensureAiFeedSchema(env);
  const classifyOptions = options && typeof options === "object" ? options : {};
  const deferTeacherReview = Boolean(classifyOptions.deferTeacherReview && classifyOptions.ctx && typeof classifyOptions.ctx.waitUntil === "function");
  const normalizedEntries = Array.isArray(entries)
    ? entries.map((entry, index) => ({
      clientItemId: normalizeReplyAiClientItemId(entry && entry.clientItemId, `reply-ai-entry-${index + 1}`),
      itemId: Number(entry && entry.itemId ? entry.itemId : 0)
    }))
    : [];
  const results = new Map();
  const settingsCache = new Map();
  const riskCache = new Map();
  const providerGroups = new Map();
  let teacherReviewBudget = REPLY_AI_TEACHER_REVIEW_MAX_ITEMS;
  const maybeRequestTeacherDecision = async (settings, itemRow, riskRow) => {
    if (teacherReviewBudget <= 0 || !shouldRequestReplyAiTeacherReview(itemRow, settings)) {
      return null;
    }
    teacherReviewBudget -= 1;
    if (deferTeacherReview && scheduleReplyAiTeacherReview(classifyOptions.ctx, env, settings, itemRow, riskRow || null)) {
      return null;
    }
    return await requestReplyAiTeacherReviewDecision(env, settings, itemRow, riskRow || null);
  };

  for (const entry of normalizedEntries) {
    const itemRow = await getReplyAiItemById(env, entry.itemId);
    if (!itemRow) {
      results.set(entry.clientItemId, buildReplyAiNotFoundDecision());
      continue;
    }

    itemRow.id = entry.itemId;

    let settings = settingsCache.get(itemRow.userId || "");
    if (!settings) {
      settings = await getUserAiSettingsWithSecret(env, itemRow.userId);
      settingsCache.set(itemRow.userId || "", settings);
    }

    const staticDecision = buildReplyAiStaticDecision(itemRow, settings);
    if (staticDecision) {
      results.set(entry.clientItemId, await finalizeReplyAiDecision(env, itemRow, staticDecision));
      continue;
    }

    const handleKey = normalizeAiHandle(itemRow.replyHandle);
    let riskRow = handleKey ? riskCache.get(handleKey) : null;
    if (handleKey && typeof riskRow === "undefined") {
      riskRow = await getReplyAiAccountRiskRow(env, handleKey);
      riskCache.set(handleKey, riskRow || null);
    }

    const memoryDecision = await findReplyAiMemoryDecision(env, itemRow, riskRow || null);
    if (memoryDecision) {
      const teacherDecision = await maybeRequestTeacherDecision(settings, itemRow, riskRow || null);
      if (teacherDecision) {
        results.set(entry.clientItemId, await finalizeReplyAiDecision(env, itemRow, teacherDecision));
        continue;
      }
      results.set(entry.clientItemId, await finalizeReplyAiDecision(env, itemRow, memoryDecision));
      continue;
    }

    const candidateRuleDecision = await findModerationRuleCandidateDecision(env, itemRow);
    if (candidateRuleDecision) {
      const teacherDecision = await maybeRequestTeacherDecision(settings, itemRow, riskRow || null);
      if (teacherDecision) {
        results.set(entry.clientItemId, await finalizeReplyAiDecision(env, itemRow, teacherDecision));
        continue;
      }
      results.set(entry.clientItemId, await finalizeReplyAiDecision(env, itemRow, candidateRuleDecision));
      continue;
    }

    if (await isReplyHandleGloballyBlocked(env, itemRow.replyHandle)) {
      const teacherDecision = await maybeRequestTeacherDecision(settings, itemRow, riskRow || null);
      if (teacherDecision) {
        results.set(entry.clientItemId, await finalizeReplyAiDecision(env, itemRow, teacherDecision));
        continue;
      }
      const blockedDecision = await finalizeReplyAiDecision(env, itemRow, buildReplyAiBlockedDecision());
      results.set(entry.clientItemId, blockedDecision);
      continue;
    }

    const reusedDecision = await findReusableReplyAiDecision(env, itemRow, riskRow || null);
    if (reusedDecision) {
      const teacherDecision = await maybeRequestTeacherDecision(settings, itemRow, riskRow || null);
      if (teacherDecision) {
        results.set(entry.clientItemId, await finalizeReplyAiDecision(env, itemRow, teacherDecision));
        continue;
      }
      results.set(entry.clientItemId, await finalizeReplyAiDecision(env, itemRow, reusedDecision));
      continue;
    }

    const scopeKey = buildReplyAiProviderScopeKey(itemRow.userId, settings);
    const groupKey = scopeKey || `user:${itemRow.userId || "missing"}:${settings.model || DEFAULT_AI_FEED_MODEL}`;
    const group = providerGroups.get(groupKey) || {
      scopeKey,
      settings,
      entries: []
    };
    group.entries.push({
      clientItemId: entry.clientItemId,
      itemRow,
      riskRow: riskRow || null
    });
    providerGroups.set(groupKey, group);
  }

  for (const group of providerGroups.values()) {
    const firstItemRow = group.entries[0] && group.entries[0].itemRow ? group.entries[0].itemRow : null;
    const cooldownRow = await getAiProviderCooldownRow(env, group.scopeKey);
    if (isAiProviderCoolingDown(cooldownRow)) {
      for (const entry of group.entries) {
        const failedDecision = await finalizeReplyAiDecision(
          env,
          entry.itemRow,
          buildReplyAiCooldownFailedDecision(group.settings, cooldownRow)
        );
        results.set(entry.clientItemId, failedDecision);
      }
      continue;
    }

    try {
      const decisionMap = new Map();
      const visualEntries = [];
      const textOnlyEntries = [];
      const providerConfig = buildAiProviderConfig(group.settings);
      const canSendImageEvidence = providerSupportsImageInputs(providerConfig);
      group.entries.forEach((entry) => {
        if (canSendImageEvidence && buildReplyAiImageEvidenceUrls(entry.itemRow).length > 0) {
          visualEntries.push(entry);
        } else {
          textOnlyEntries.push(entry);
        }
      });

      for (const entry of visualEntries) {
        decisionMap.set(
          entry.clientItemId,
          await requestReplyAiDecisionFromProvider(env, group.settings, entry.itemRow, entry.riskRow)
        );
      }

      if (textOnlyEntries.length === 1) {
        const entry = textOnlyEntries[0];
        decisionMap.set(
          entry.clientItemId,
          await requestReplyAiDecisionFromProvider(env, group.settings, entry.itemRow, entry.riskRow)
        );
      } else if (textOnlyEntries.length > 1) {
        const textDecisionMap = await requestReplyAiBatchDecisionsFromProvider(env, group.settings, textOnlyEntries);
        textDecisionMap.forEach((decision, clientItemId) => {
          decisionMap.set(clientItemId, decision);
        });
      }

      await clearAiProviderCooldown(env, group.scopeKey, firstItemRow, group.settings);

      for (const entry of group.entries) {
        const providerDecision = decisionMap.get(entry.clientItemId);
        const nextDecision = providerDecision
          ? providerDecision
          : buildDefaultReplyAiDecision({
            decisionLayer: "failed",
            reasonShort: "AI 批量结果不完整",
            status: "failed",
            model: group.settings.model
          });
        const finalized = await finalizeReplyAiDecision(env, entry.itemRow, nextDecision);
        results.set(entry.clientItemId, finalized);
      }
    } catch (error) {
      const errorMessage = error && error.message ? String(error.message) : String(error);
      const retryableProviderFailure = /ai-provider-status-(429|500|502|503|504|529)/i.test(errorMessage);
      const cooldownState = retryableProviderFailure
        ? await recordAiProviderFailure(
          env,
          group.scopeKey,
          firstItemRow,
          group.settings,
          errorMessage.match(/ai-provider-status-\d+/i)
            ? String(errorMessage.match(/ai-provider-status-\d+/i)[0] || "")
            : "provider-failure"
        )
        : null;

      for (const entry of group.entries) {
        const failedDecision = await finalizeReplyAiDecision(
          env,
          entry.itemRow,
          retryableProviderFailure
            ? buildReplyAiCooldownFailedDecision(group.settings, cooldownState, "后台暂时繁忙，稍后自动重试")
            : buildDefaultReplyAiDecision({
              decisionLayer: "failed",
              reasonShort: "后台判读失败",
              status: "failed",
              model: group.settings.model,
              rawResponseJson: {
                error: errorMessage
              }
            })
        );
        results.set(entry.clientItemId, failedDecision);
      }
    }
  }

  return results;
}

async function classifyReplyAiItem(env, itemId, options) {
  const clientItemId = `reply-ai-single-${Number(itemId || 0)}`;
  const results = await classifyReplyAiItemEntries(env, [{
    clientItemId,
    itemId: Number(itemId || 0)
  }], options);
  return results.get(clientItemId) || buildReplyAiNotFoundDecision();
}

async function buildRecentReplyAiHides(env, userId, limit) {
  await ensureAiFeedSchema(env);
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        rai.id,
        rai.thread_url,
        rai.thread_status_id,
        rai.reply_status_id,
        rai.reply_handle,
        rai.reply_display_name,
        rai.reply_text,
        rai.main_post_text,
        rai.profile_fetch_status,
        rar.action,
        rar.decision_layer,
        rar.matched_safety_labels_json,
        rar.matched_profile_signals_json,
        rar.confidence,
        rar.reason_short,
        rar.status,
        rar.model,
        rar.updated_at
      FROM reply_ai_items rai
      JOIN reply_ai_results rar
        ON rar.item_id = rai.id
      WHERE rai.user_id = ?
        AND rar.status = 'ready'
        AND rar.action = 'hide'
      ORDER BY rar.updated_at DESC, rai.id DESC
      LIMIT ?
    `
  ).bind(userId, limit).all();

  return results.map((row) => ({
    id: Number(row.id || 0),
    replyAiItemId: Number(row.id || 0),
    threadUrl: row.thread_url || "",
    threadStatusId: row.thread_status_id || "",
    replyStatusId: row.reply_status_id || "",
    replyHandle: row.reply_handle || "",
    replyDisplayName: row.reply_display_name || "",
    replyText: row.reply_text || "",
    mainPostText: row.main_post_text || "",
    profileFetchStatus: row.profile_fetch_status || "not_requested",
    action: row.action || "allow",
    decisionLayer: row.decision_layer || "ai",
    matchedSafetyLabels: normalizeReplyAiStringList(parseJsonArray(row.matched_safety_labels_json), REPLY_AI_SAFETY_LABELS, 8),
    matchedProfileSignals: normalizeReplyAiStringList(parseJsonArray(row.matched_profile_signals_json), REPLY_AI_PROFILE_SIGNAL_LABELS, 8),
    confidence: row.confidence || "low",
    reasonShort: row.reason_short || "",
    status: row.status || "skipped",
    model: row.model || "",
    updatedAt: row.updated_at || ""
  }));
}

async function buildGlobalBlockedReplyAccounts(env, limit) {
  await ensureAiFeedSchema(env);
  const { results = [] } = await env.DB.prepare(
    `
      SELECT
        reply_handle,
        total_high_confidence_hide_count,
        recent_high_confidence_hide_count,
        global_blocked_at,
        last_reason_short,
        updated_at
      FROM reply_ai_account_risk
      WHERE active_global_block = 1
      ORDER BY updated_at DESC, reply_handle ASC
      LIMIT ?
    `
  ).bind(limit).all();

  return results.map((row) => ({
    replyHandle: row.reply_handle || "",
    totalHighConfidenceHideCount: Number(row.total_high_confidence_hide_count || 0),
    recentHighConfidenceHideCount: Number(row.recent_high_confidence_hide_count || 0),
    globalBlockedAt: row.global_blocked_at || "",
    lastReasonShort: row.last_reason_short || "",
    updatedAt: row.updated_at || ""
  }));
}

async function buildReplyAiDashboardPayload(env, userId) {
  await ensureAiFeedSchema(env);
  const [settings, recentHides, globalBlockedAccounts] = await Promise.all([
    getUserAiSettings(env, userId),
    buildRecentReplyAiHides(env, userId, REPLY_AI_DEFAULT_LIMIT),
    buildGlobalBlockedReplyAccounts(env, REPLY_AI_DEFAULT_LIMIT)
  ]);

  return {
    settings,
    recentHides,
    globalBlockedAccounts,
    stats: {
      recentHideCount: recentHides.length,
      globalBlockedAccountCount: globalBlockedAccounts.length
    }
  };
}

function isEventFingerprintConflictError(error) {
  const message = String(error && error.message ? error.message : "").toLowerCase();
  return message.includes("unique") && message.includes("event_fingerprint");
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

  const activeHiddenSql = buildActiveHiddenEventSql("me");
  const placeholders = safeIds.map(() => "?").join(", ");
  const statement = env.DB.prepare(
    `
      SELECT
        me.id,
        me.sync_key,
        me.user_id,
        me.thread_url,
        me.thread_status_id,
        me.reply_status_id,
        me.reply_handle,
        me.reply_display_name,
        me.reply_text,
        me.normalized_text,
        me.compact_text,
        me.created_at
      FROM moderation_events me
      WHERE me.user_id = ?
        AND me.event_type = 'manual_hide'
        AND ${activeHiddenSql}
        AND me.id IN (${placeholders})
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
          COALESCE(SUM(d.confirm_count), 0) AS feed_count,
          COALESCE(SUM(d.revoke_count), 0) AS revoked_count
        FROM developer_global_decisions d
        LEFT JOIN moderation_events me
          ON me.id = d.event_id
        WHERE d.user_id = ?
          AND ${buildVisibleDeveloperEventSql("me")}
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
  const conditions = [buildVisibleDeveloperEventSql("me")];
  if (options && Object.prototype.hasOwnProperty.call(options, "revoked")) {
    conditions.push(options.revoked ? "d.revoked_at IS NOT NULL" : "d.revoked_at IS NULL");
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join("\n        AND ")}` : "";
  const { results = [] } = await env.DB.prepare(
    `
      SELECT d.*
      FROM developer_global_decisions d
      LEFT JOIN moderation_events me
        ON me.id = d.event_id
      ${whereClause}
      ORDER BY d.last_confirmed_at DESC
      LIMIT ?
    `
  ).bind(limit).all();
  return results;
}

async function listDeveloperPendingFeedRows(env, userId, limit) {
  const safeLimit = Math.max(1, Math.min(400, Number(limit || 80) || 80));
  const activeHiddenSql = buildActiveHiddenEventSql("me");
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
      FROM moderation_events me
      WHERE me.user_id = ?
        AND event_type = 'manual_hide'
        AND ${activeHiddenSql}
        AND ${buildNonTestModerationEventSql("me")}
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
        r.id,
        r.fingerprint,
        r.event_id,
        r.user_id,
        r.review_type,
        r.updated_at
      FROM developer_pending_reviews r
      LEFT JOIN moderation_events me
        ON me.id = r.event_id
      WHERE r.user_id = ?
        AND r.review_type = 'not_garbage'
        AND ${buildVisibleDeveloperEventSql("me")}
      ORDER BY r.updated_at DESC
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
    || pathname === "/api/preferences"
    || pathname === "/api/ai-settings"
    || pathname === "/api/ai-settings/test"
    || pathname === "/api/dashboard"
    || pathname === "/api/ai-feed"
    || pathname === "/api/reply-ai"
    || pathname === "/api/account/bind-sync-key"
    || pathname === "/api/developer/confirm-feed"
    || pathname === "/api/developer/dismiss-feed"
    || pathname === "/api/developer/revoke-feed"
    || pathname === "/api/developer/data-layer-audit"
    || pathname === "/api/developer/backfill-training"
    || pathname === "/api/developer/rebuild-rule-candidates"
    || pathname === "/api/developer/reply-ai-routing-probe";
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

function buildSessionRefreshHeaders(request, viewer, env) {
  const headers = new Headers();
  if (!viewer) {
    return headers;
  }

  const sessionId = readCookie(request, SESSION_COOKIE);
  if (sessionId) {
    headers.set("Set-Cookie", serializeSessionCookie(sessionId, env));
  }
  return headers;
}

function serializeSessionCookie(sessionId, env) {
  return `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${getSessionMaxAgeSeconds(env)}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0`;
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

function countRuleTermMatches(text, terms) {
  const source = String(text || "");
  return (Array.isArray(terms) ? terms : []).reduce((count, term) => {
    return count + (source.includes(String(term || "")) ? 1 : 0);
  }, 0);
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

function looksLikeMinimalTextPayload(text) {
  const raw = String(text || "");
  const normalized = normalizeRuleText(raw);
  const emojiCount = Array.from(raw.matchAll(EMOJI_PATTERN)).length;
  const payloadText = normalized
    .replace(EMOJI_PATTERN, "")
    .replace(COMPACT_PUNCTUATION_PATTERN, "")
    .replace(/[$￥¥€£]/g, "")
    .replace(/\s+/g, "");
  return emojiCount > 0 && Array.from(payloadText).length <= 1;
}

function looksLikeEmojiNoiseBait(text) {
  const raw = String(text || "");
  const compact = buildCompactRuleText(raw);
  if (!compact || compact.length < 3 || compact.length > 20) {
    return false;
  }

  if (countRuleTermMatches(compact, SUBSTANTIVE_MARKERS) >= 2 || countRuleTermMatches(compact, FINANCE_MARKERS) > 0) {
    return false;
  }

  const emojiCount = Array.from(raw.matchAll(EMOJI_PATTERN)).length;
  return emojiCount >= 4 || (emojiCount >= 3 && Array.from(compact).length <= 10);
}

function looksLikeGenericShortSloganBait(text) {
  const raw = String(text || "");
  const compact = buildCompactRuleText(raw);
  const contentChars = Array.from(compact).filter((char) => /[\p{Script=Han}a-z0-9]/iu.test(char));
  if (!compact || contentChars.length < 4 || contentChars.length > 12) {
    return false;
  }

  if (countRuleTermMatches(compact, SUBSTANTIVE_MARKERS) > 0 || countRuleTermMatches(compact, FINANCE_MARKERS) > 0) {
    return false;
  }

  if (/[?？!！]/.test(raw)) {
    return false;
  }

  const cjkCount = (compact.match(/\p{Script=Han}/gu) || []).length;
  const hasDecorativeCue = Array.from(raw.matchAll(EMOJI_PATTERN)).length > 0 || DECORATIVE_SLOGAN_SYMBOL_PATTERN.test(raw);
  const hasConversationAnchor = /(我觉得|你说|他说|她说|我们|你们|他们|这个|那个|问题|帖子|视频|哈哈|笑死|真的|确实|不是|没有|可以|应该|为什么|怎么|什么)/.test(compact);
  const commonGreeting = /(生日快乐|新年快乐|恭喜|加油|谢谢|感谢|辛苦|好看|漂亮|可爱|厉害|牛逼|早安|晚安)/.test(compact);
  return hasDecorativeCue && cjkCount >= Math.ceil(contentChars.length * 0.6) && !hasConversationAnchor && !commonGreeting;
}

function looksLikeBilingualShortSloganBait(text) {
  const raw = String(text || "");
  const normalized = normalizeRuleText(raw);
  const compact = buildCompactRuleText(raw);
  const chars = Array.from(compact);
  if (!compact || chars.length < 8 || chars.length > 36) {
    return false;
  }

  if (countRuleTermMatches(compact, SUBSTANTIVE_MARKERS) > 0 || countRuleTermMatches(compact, FINANCE_MARKERS) > 0) {
    return false;
  }

  if (/[?？!！]/.test(raw)) {
    return false;
  }

  const latinWords = Array.from(normalized.matchAll(/\b[a-z]{3,14}\b/gi))
    .map((match) => String(match[0] || "").toLowerCase())
    .filter(Boolean);
  if (latinWords.length < 2) {
    return false;
  }

  const firstLatinWord = latinWords[0];
  const repeatedLatinWrapper = latinWords.slice(1).some((word) => word === firstLatinWord);
  const cjkCount = (compact.match(/\p{Script=Han}/gu) || []).length;
  const latinCount = (compact.match(/[a-z]/gi) || []).length;
  const hasDecorativeCue = Array.from(raw.matchAll(EMOJI_PATTERN)).length > 0 || DECORATIVE_SLOGAN_SYMBOL_PATTERN.test(raw);
  const hasConversationAnchor = /(我觉得|你说|他说|她说|我们|你们|他们|这个|那个|问题|帖子|视频|哈哈|笑死|真的|确实|不是|没有|可以|应该|为什么|怎么|什么)/.test(compact);
  const commonGreeting = /(生日快乐|新年快乐|恭喜|加油|谢谢|感谢|辛苦|好看|漂亮|可爱|厉害|牛逼|早安|晚安)/.test(compact);
  return repeatedLatinWrapper
    && hasDecorativeCue
    && cjkCount >= 4
    && latinCount >= firstLatinWord.length * 2
    && !hasConversationAnchor
    && !commonGreeting;
}

function normalizeContextForOverlap(text) {
  return buildCompactRuleText(text).replace(/[的了呢吗嘛啊呀哦哈吧把和与及又也就都很挺真这那我你他她它们一个一下这个那个我们你们他们是不是怎么什么]/g, "");
}

function hasUsefulContextOverlap(replyText, contextText) {
  const reply = normalizeContextForOverlap(replyText);
  const context = normalizeContextForOverlap(contextText);
  if (!reply || !context || reply.length < 4 || context.length < 8) {
    return false;
  }

  const grams = new Set();
  for (let index = 0; index <= reply.length - 2; index += 1) {
    const gram = reply.slice(index, index + 2);
    if (/^(?:有缘|自会|相识|刚好|恰好|温良|良友|这个|那个|我们|你们|他们|一下|真的|可以|没有|就是|什么|怎么|一个)$/.test(gram)) {
      continue;
    }
    grams.add(gram);
  }

  for (const gram of grams) {
    if (gram && context.includes(gram)) {
      return true;
    }
  }
  return false;
}

function looksLikeContextDetachedBait(replyText, contextText, heuristicSummary) {
  const compact = buildCompactRuleText(replyText);
  const contextCompact = buildCompactRuleText(contextText);
  if (!compact || compact.length < 4 || compact.length > 24 || !contextCompact || contextCompact.length < 8) {
    return false;
  }

  const summary = heuristicSummary || {};
  const lowSubstance = Boolean(
    summary.hasEmojiNoiseBait
    || summary.hasDecorativeSloganBait
    || summary.hasPoeticSpamSloganBait
    || summary.hasGenericShortSloganBait
    || summary.hasBilingualShortSloganBait
    || summary.hasSpamTemplateSignal
    || summary.hasLowInformationBadge
    || summary.hasFragmentedSymbolicReply
    || summary.hasMinimalTextPayload
    || summary.hasThinSymbolOrNumberPayload
  );
  return lowSubstance && !hasUsefulContextOverlap(replyText, contextText);
}

function looksLikeThinSymbolOrNumberPayload(text) {
  const raw = String(text || "").replace(ZERO_WIDTH_PATTERN, "");
  const chars = Array.from(raw.replace(EMOJI_PATTERN, "").replace(/\s+/g, ""));
  if (!chars.length || chars.length > 3) {
    return false;
  }
  return chars.every((char) => /[\p{N}\p{S}\p{P}]/u.test(char));
}

function looksLikeFragmentedSymbolicReply(text) {
  const raw = String(text || "");
  const compact = buildCompactRuleText(text);
  const emojiCount = Array.from(raw.matchAll(EMOJI_PATTERN)).length;
  if (!compact) {
    return false;
  }

  return compact.length <= 4 && (
    emojiCount >= 2
    || /[%/\\|]/.test(raw)
    || /[\r\n]/.test(raw)
  );
}

function looksLikeDecorativeSloganBait(text) {
  const raw = String(text || "");
  const compact = buildCompactRuleText(raw);
  if (!compact || compact.length < 4 || compact.length > 28) {
    return false;
  }

  if (countRuleTermMatches(compact, SUBSTANTIVE_MARKERS) >= 2 || countRuleTermMatches(compact, FINANCE_MARKERS) > 0) {
    return false;
  }

  const termCount = DECORATIVE_SLOGAN_TERMS.reduce((count, term) => {
    return count + (compact.includes(buildCompactRuleText(term)) ? 1 : 0);
  }, 0);
  const hasDecorativeShell = DECORATIVE_SLOGAN_SYMBOL_PATTERN.test(raw);
  return termCount >= 2 || (hasDecorativeShell && termCount >= 1);
}

function looksLikePoeticSpamSloganBait(text) {
  const raw = String(text || "");
  const normalized = normalizeRuleText(raw);
  const compact = buildCompactRuleText(raw);
  if (!compact || compact.length < 4 || compact.length > 18) {
    return false;
  }

  if (countRuleTermMatches(compact, SUBSTANTIVE_MARKERS) >= 2 || countRuleTermMatches(compact, FINANCE_MARKERS) > 0) {
    return false;
  }

  return POETIC_SPAM_SLOGAN_PATTERNS.some((pattern) => pattern.test(normalized) || pattern.test(compact));
}

function looksLikeCivicLandmarkNearbyQuestion(text) {
  const compact = buildCompactRuleText(text);
  if (!compact || compact.length > 18) {
    return false;
  }

  return CIVIC_LANDMARK_NEARBY_TERMS.some((term) => {
    return new RegExp("^(?:有(?:没)?有|有|求|蹲).{0,2}" + term + "附近(?:的|的吗|吗|嘛|呢|的人|的人吗)?$").test(compact);
  });
}

function looksLikeGeoMeetupBait(text) {
  const normalized = normalizeRuleText(text);
  const compact = buildCompactRuleText(text);
  if (!compact || compact.length > 16) {
    return false;
  }
  if (looksLikeCivicLandmarkNearbyQuestion(text)) {
    return false;
  }

  return GEO_MEETUP_BAIT_PATTERNS.some((pattern) => pattern.test(normalized) || pattern.test(compact));
}

function looksLikeGeoRelationshipBait(text) {
  const normalized = normalizeRuleText(text);
  const compact = buildCompactRuleText(text);
  if (!compact || compact.length > 16) {
    return false;
  }

  return GEO_RELATIONSHIP_BAIT_PATTERNS.some((pattern) => pattern.test(normalized) || pattern.test(compact));
}

function looksLikeBaitQuestionShape(text) {
  const normalized = normalizeRuleText(text);
  const compact = buildCompactRuleText(text);
  if (!compact || compact.length > 16 || !BAIT_QUESTION_ENDING_PATTERN.test(normalized)) {
    return false;
  }
  if (looksLikeCivicLandmarkNearbyQuestion(text)) {
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

function looksLikeExplicitEroticBait(text) {
  const normalized = normalizeRuleText(text);
  const compact = buildCompactRuleText(text);
  if (!compact) {
    return false;
  }

  return EXPLICIT_EROTIC_BAIT_PATTERNS.some((pattern) => pattern.test(normalized) || pattern.test(compact));
}

function looksLikeEroticMentionRedirect(text) {
  const normalized = normalizeRuleText(text);
  const compact = buildCompactRuleText(text);
  if (!compact) {
    return false;
  }

  const mentionedHandles = Array.from(new Set((normalized.match(ACCOUNT_MENTION_PATTERN) || []).map((entry) => {
    return String(entry || "").trim().toLowerCase();
  }).filter(Boolean)));
  if (mentionedHandles.length === 0) {
    return false;
  }

  if (looksLikeExplicitEroticBait(text)) {
    return true;
  }

  return EROTIC_MENTION_REDIRECT_MARKERS.some((term) => normalized.includes(term) || compact.includes(term));
}

function looksLikeSpamTemplateSignal(text) {
  const normalized = normalizeRuleText(text);
  const compact = buildCompactRuleText(text);
  if (!compact) {
    return false;
  }

  return SPAM_TEMPLATE_PATTERNS.some((pattern) => pattern.test(normalized) || pattern.test(compact));
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
  const civicLandmarkNearbyQuestion = looksLikeCivicLandmarkNearbyQuestion(text);
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
    .filter((entry) => entry.matched && !(civicLandmarkNearbyQuestion && entry.id === "meetup"));

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

  if (displayNameLooksStrongLure(name)) {
    return true;
  }

  if (DISPLAY_NAME_LURE_PATTERNS.some((pattern) => pattern.test(normalized) || pattern.test(compact))) {
    return true;
  }

  const marketingTermCount = DISPLAY_NAME_MARKETING_TERMS.reduce((count, term) => {
    return count + (compact.includes(term) ? 1 : 0);
  }, 0);
  const lureTermCount = ["破处", "小狗", "主人", "搭子", "单男", "约", "撩", "调教", "固炮", "固泡", "泡友", "炮友", "性友", "寻男", "寻女"].reduce((count, term) => {
    return count + (compact.includes(term) ? 1 : 0);
  }, 0);
  const hasMarketingBadge = /[👉❤️💕💋🥵🤤🍑🍆🌸]/u.test(raw) || compact.includes("ovo");
  return marketingTermCount >= 2
    || lureTermCount >= 2
    || (marketingTermCount + lureTermCount >= 1 && hasMarketingBadge);
}

function displayNameLooksStrongLure(name) {
  const raw = String(name || "");
  const normalized = normalizeRuleText(raw);
  const compact = buildCompactRuleText(raw);
  if (!compact) {
    return false;
  }

  return DISPLAY_NAME_STRONG_LURE_PATTERNS.some((pattern) => pattern.test(normalized) || pattern.test(compact));
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
  const geoRelationshipBait = protectedGuardApplies ? false : looksLikeGeoRelationshipBait(replyText || normalized);
  const baitQuestionShape = protectedGuardApplies ? false : looksLikeBaitQuestionShape(replyText || normalized);
  const shareLinkScam = protectedGuardApplies ? false : looksLikeShareLinkScam(replyText || normalized);
  const spamTemplateSignal = protectedGuardApplies ? false : looksLikeSpamTemplateSignal(replyText || normalized);
  const explicitEroticBait = protectedGuardApplies ? false : looksLikeExplicitEroticBait(replyText || normalized);
  const eroticMentionRedirect = protectedGuardApplies ? false : looksLikeEroticMentionRedirect(replyText || normalized);
  const decorativeSloganLureAccount = protectedGuardApplies
    ? false
    : (
      looksLikeDecorativeSloganBait(replyText || normalized)
      && handleLooksSuspicious(row.reply_handle || row.replyHandle || "")
    );
  const poeticSloganLureAccount = protectedGuardApplies
    ? false
    : (
      looksLikePoeticSpamSloganBait(replyText || normalized)
      && handleLooksSuspicious(row.reply_handle || row.replyHandle || "")
    );
  const emojiNoiseLureAccount = protectedGuardApplies
    ? false
    : (
      looksLikeEmojiNoiseBait(replyText || normalized)
      && handleLooksSuspicious(row.reply_handle || row.replyHandle || "")
    );
  const genericShortSloganLureAccount = protectedGuardApplies
    ? false
    : (
      looksLikeGenericShortSloganBait(replyText || normalized)
      && (
        handleLooksSuspicious(row.reply_handle || row.replyHandle || "")
        || /^[a-z]{4,}[0-9]{2,}$/i.test(String(row.reply_handle || row.replyHandle || "").replace(/^@/, ""))
        || /^[a-z]{6,}$/i.test(String(row.reply_handle || row.replyHandle || "").replace(/^@/, ""))
      )
    );
  const bilingualShortSloganLureAccount = protectedGuardApplies
    ? false
    : (
      looksLikeBilingualShortSloganBait(replyText || normalized)
      && (
        handleLooksSuspicious(row.reply_handle || row.replyHandle || "")
        || /^[a-z]{4,}[0-9]{2,}$/i.test(String(row.reply_handle || row.replyHandle || "").replace(/^@/, ""))
        || /^[a-z]{6,}$/i.test(String(row.reply_handle || row.replyHandle || "").replace(/^@/, ""))
      )
    );
  const lowInformationStrongLureName = protectedGuardApplies
    ? false
    : (
      (
        looksLikeLowInformationBadge(replyText || normalized)
        || looksLikeFragmentedSymbolicReply(replyText || normalized)
        || looksLikeMinimalTextPayload(replyText || normalized)
        || looksLikeThinSymbolOrNumberPayload(replyText || normalized)
      )
      && displayNameLooksStrongLure(row.reply_display_name || row.replyDisplayName || "")
    );
  const lowInformationLureAccount = protectedGuardApplies
    ? false
    : (
      (
        looksLikeLowInformationBadge(replyText || normalized)
        || looksLikeFragmentedSymbolicReply(replyText || normalized)
        || looksLikeMinimalTextPayload(replyText || normalized)
        || looksLikeThinSymbolOrNumberPayload(replyText || normalized)
      )
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
          geoRelationshipBait
            ? "pattern:geo-relationship-bait"
            : (
              baitQuestionShape
                ? "pattern:bait-question-shape"
                : (
                  lowInformationStrongLureName
                    ? "pattern:low-information-strong-lure-name"
                    : (
                      lowInformationLureAccount
                        ? "pattern:low-information-lure-account"
                        : (
                          shareLinkScam
                            ? "pattern:share-link-scam"
                            : (
                              spamTemplateSignal
                                ? "pattern:spam-template-signal"
                              : (
                                eroticMentionRedirect
                                ? "pattern:mention-lure-redirect"
                                : (
                                  explicitEroticBait
                                    ? "pattern:explicit-erotic-bait"
                                    : (
                                      poeticSloganLureAccount
                                        ? "pattern:poetic-slogan-lure-account"
                                        : (
                                          decorativeSloganLureAccount
                                            ? "pattern:decorative-slogan-lure-account"
                                            : (
                                              emojiNoiseLureAccount
                                                ? "pattern:emoji-noise-lure-account"
                                                : (
                                                  bilingualShortSloganLureAccount
                                                    ? "pattern:bilingual-short-slogan-lure-account"
                                                    : (
                                                      genericShortSloganLureAccount
                                                        ? "pattern:generic-short-slogan-lure-account"
                                                        : (matchedTerms.length > 0
                                                          ? "pattern:" + matchedTerms.join("|")
                                                          : (loosePattern.length >= 4 ? "pattern:" + loosePattern : ""))
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                              )
                            )
                        )
                    )
                )
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
