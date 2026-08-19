/* 目录数据：免费 API / AI 工具 / 资讯源 / 学习资源
 * 事实字段全部来自《AI资讯与免费API汇总.md》（核验日期见各条 verified 字段）
 * 注意：本文件只存"事实"，不存评分。白嫖指数由前端 score() 按公开规则实时计算，保证可解释、可复核。
 */

window.__CATS__ = [
  { id: 'llm',       name: '大模型 / AI 推理', icon: 'M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5' },
  { id: 'weather',   name: '天气',            icon: 'M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.6A3.7 3.7 0 0 0 6.5 19Z' },
  { id: 'geo',       name: '地图 / 地理',      icon: 'M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z' },
  { id: 'translate', name: '翻译',            icon: 'M4 5h10M9 3v2c0 4-2 7-5 9M7 12c1.5 3 4 5 7 6M14 20l4-9 4 9M15.5 17h5' },
  { id: 'finance',   name: '金融 / 行情',      icon: 'M3 20h18M6 16V9M11 16V5M16 16v-4M21 16v-7' },
  { id: 'ocr',       name: 'OCR / 图像',      icon: 'M3 8V5h3M21 8V5h-3M3 16v3h3M21 16v3h-3M7 12h10' },
  { id: 'util',      name: '通用工具',         icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z' }
];

/* pricing: free=完全免费/开源 | tier=有限免费额度 | local=本机部署
 * rpm / rpd：官方明确公布才填数字，未公布填 null（前端显示"未公布"，绝不推算）
 * region: global | cn（国内节点，数据驻留友好） | local（数据不出本机）
 */
window.__APIS__ = [
  {
    id: 'gemini', cat: 'llm', name: 'Google Gemini', vendor: 'Google',
    desc: '免费层含 3.6 Flash 等多数文本模型，免信用卡，1M token 上下文',
    pricing: 'tier', rpm: null, rpd: null, quota: '免费层免信用卡，含 Gemini 3.6 Flash 等多数文本模型',
    limit: '2026-07 起官方不再公布统一固定免费额度，限流取决于账号层级（是否绑卡、历史用量），需到 AI Studio 后台自查',
    use: '多模态、长文档、联网检索 Grounding', region: 'global',
    keyless: false, cors: false, card: false, expire: false, generous: true,
    tags: ['免费档', 'API Key', '多模态', '长上下文'], verified: '2026-07-29',
    warn: '历史口径（2.5 Flash 15 RPM / 1500 RPD）已非官方公开数值，仅作参考；Managed Agents 自 7/28 起对免费层项目开放试用',
    links: [
      { label: '文档', url: 'https://ai.google.dev' },
      { label: 'AI Studio', url: 'https://aistudio.google.com' },
      { label: '定价', url: 'https://ai.google.dev/pricing' }
    ]
  },
  {
    id: 'groq', cat: 'llm', name: 'Groq', vendor: 'Groq',
    desc: '完全免费、无需信用卡，OpenAI 兼容接口，推理速度约 2600 tok/s',
    pricing: 'free', rpm: 30, rpd: 14400, quota: '多数模型 30 RPM / 14,400 RPD，完全免费',
    limit: '组织级限流；模型以官方列表为准',
    use: '超低延迟推理、快速原型', region: 'global',
    keyless: false, cors: false, card: false, expire: false, generous: true,
    tags: ['免费', 'API Key', '低延迟', '代码强'], verified: '2026-08-03',
    links: [
      { label: '控制台', url: 'https://console.groq.com' },
      { label: '文档', url: 'https://console.groq.com/docs' },
      { label: '模型列表', url: 'https://console.groq.com/docs/models' }
    ]
  },
  {
    id: 'deepseek', cat: 'llm', name: 'DeepSeek', vendor: '深度求索',
    desc: '新账号赠 500 万 tokens / 30 天，网页对话永久免费，中文与代码能力强',
    pricing: 'tier', rpm: null, rpd: null, quota: '新账号赠 500 万 tokens / 30 天，无需信用卡',
    limit: '官方 API 为 token 计费；服务器在中国（数据驻留需评估）；旧别名已于 2026-07-24 停用',
    use: '高性价比中文推理、代码生成', region: 'cn',
    keyless: false, cors: false, card: false, expire: true, generous: true,
    tags: ['免费档', 'API Key', '中文强', '代码强', '国内'], verified: '2026-08-03',
    warn: '模型 ID 须显式使用 deepseek-v4-flash / deepseek-v4-pro，旧别名 deepseek-chat / deepseek-reasoner 调用将返回错误；峰谷定价已公告但截至 8/3 仍未生效',
    links: [
      { label: '平台', url: 'https://platform.deepseek.com' },
      { label: 'API 文档', url: 'https://api-docs.deepseek.com' },
      { label: '变更日志', url: 'https://api-docs.deepseek.com/updates' }
    ]
  },
  {
    id: 'openai', cat: 'llm', name: 'OpenAI', vendor: 'OpenAI',
    desc: '新账号赠 $5 额度 / 3 个月，无需信用卡起用',
    pricing: 'tier', rpm: 3, rpd: null, quota: '新账号赠 $5 额度 / 3 个月',
    limit: 'Free 层限速低（GPT-4o 约 3 RPM）；GPT-5 系列不在免费层',
    use: 'GPT 生态、函数调用、DALL·E 图像', region: 'global',
    keyless: false, cors: false, card: false, expire: true, generous: false,
    tags: ['免费档', 'API Key', '多模态', '代码强'], verified: '2026-08-03',
    warn: '第三方聚合站多次称"试用额度已取消、免费层仅余 3.5 Turbo"，与官方平台页矛盾且未获证实，以官方后台实际额度为准',
    links: [
      { label: '平台', url: 'https://platform.openai.com' },
      { label: '文档', url: 'https://platform.openai.com/docs' },
      { label: 'Cookbook', url: 'https://cookbook.openai.com' }
    ]
  },
  {
    id: 'claude', cat: 'llm', name: 'Anthropic Claude', vendor: 'Anthropic',
    desc: '无永久免费 API；新账号电话验证后赠 $5 额度 / 14 天',
    pricing: 'tier', rpm: 5, rpd: null, quota: '新账号验证后赠 $5 额度 / 14 天',
    limit: 'Free / Build 层约 5 RPM；额度 14 天过期；claude.ai 网页版另行免费',
    use: '复杂推理、长文处理、Agent 编排', region: 'global',
    keyless: false, cors: false, card: false, expire: true, generous: false,
    tags: ['免费档', 'API Key', '长上下文', '代码强'], verified: '2026-08-03',
    links: [
      { label: '控制台', url: 'https://console.anthropic.com' },
      { label: '文档', url: 'https://docs.anthropic.com' },
      { label: 'Cookbook', url: 'https://github.com/anthropics/anthropic-cookbook' }
    ]
  },
  {
    id: 'hf', cat: 'llm', name: 'Hugging Face Inference', vendor: 'Hugging Face',
    desc: 'Serverless 推理免费，10 万+ 开源模型可直接调用',
    pricing: 'free', rpm: null, rpd: null, quota: '约 300 请求 / 小时，无需信用卡',
    limit: '模型参数需 < 约 10B；冷启动 10–30 秒',
    use: '开源模型原型、Embedding、文本分类', region: 'global',
    keyless: false, cors: false, card: false, expire: false, generous: true,
    tags: ['免费', 'API Key', '多模态'], verified: '2026-08-03',
    links: [
      { label: 'API 文档', url: 'https://huggingface.co/docs/api-inference' },
      { label: '模型库', url: 'https://huggingface.co/models' }
    ]
  },
  {
    id: 'ollama', cat: 'llm', name: 'Ollama（本地）', vendor: 'Ollama',
    desc: '完全免费、无限调用，数据不出本机，事务所敏感数据首选',
    pricing: 'local', rpm: null, rpd: null, quota: '完全免费，无调用上限',
    limit: '受本机算力限制（显存决定可跑模型规模）',
    use: '涉密 / 离线 / 数据不出境的合规场景', region: 'local',
    keyless: true, cors: false, card: false, expire: false, generous: true,
    tags: ['免费', '本地', '离线', '国内'], verified: '2026-08-03',
    links: [
      { label: '官网', url: 'https://ollama.com' },
      { label: '模型库', url: 'https://ollama.com/library' },
      { label: 'GitHub', url: 'https://github.com/ollama/ollama' }
    ]
  },
  {
    id: 'zhipu', cat: 'llm', name: '智谱 BigModel', vendor: '智谱 AI',
    desc: 'GLM 系列，新用户赠免费额度，国内合规部署友好',
    pricing: 'tier', rpm: null, rpd: null, quota: '新用户免费额度（GLM 系列）',
    limit: '按官网公布限速',
    use: '中文推理、数据不出境的合规场景', region: 'cn',
    keyless: false, cors: false, card: false, expire: false, generous: false,
    tags: ['免费档', 'API Key', '中文强', '国内'], verified: '2026-07-13',
    links: [
      { label: '开放平台', url: 'https://open.bigmodel.cn' },
      { label: '文档', url: 'https://open.bigmodel.cn/dev/api' }
    ]
  },
  {
    id: 'qwen', cat: 'llm', name: '通义千问 DashScope', vendor: '阿里云',
    desc: 'Qwen 系列，新用户赠免费额度，多模态能力完整',
    pricing: 'tier', rpm: null, rpd: null, quota: '新用户免费额度（Qwen 系列）',
    limit: '按官网公布限速',
    use: '中文推理、多模态理解', region: 'cn',
    keyless: false, cors: false, card: false, expire: false, generous: false,
    tags: ['免费档', 'API Key', '中文强', '多模态', '国内'], verified: '2026-07-13',
    links: [
      { label: '文档', url: 'https://help.aliyun.com/zh/model-studio/' },
      { label: '控制台', url: 'https://dashscope.console.aliyun.com' }
    ]
  },
  {
    id: 'mistral', cat: 'llm', name: 'Mistral / Together / Fireworks', vendor: '多家',
    desc: '开源模型托管推理，均有免费档或试用额度',
    pricing: 'tier', rpm: null, rpd: null, quota: 'Mistral Le Chat 免费；Together / Fireworks 赠试用额度',
    limit: '各厂商政策不同，以官网为准',
    use: '开源模型托管推理', region: 'global',
    keyless: false, cors: false, card: false, expire: true, generous: false,
    tags: ['免费档', 'API Key', '多模态'], verified: '2026-07-13',
    links: [
      { label: 'Mistral', url: 'https://mistral.ai' },
      { label: 'Together', url: 'https://www.together.ai' },
      { label: 'Fireworks', url: 'https://fireworks.ai' }
    ]
  },

  {
    id: 'openmeteo', cat: 'weather', name: 'Open-Meteo', vendor: 'Open-Meteo',
    desc: '非商用免注册免 Key，全球预报 / 历史 / 空气质量',
    pricing: 'free', rpm: null, rpd: 10000, quota: '约 10,000 次 / 天（非商用）',
    limit: '需署名（CC BY 4.0）；商用需另购',
    use: '全球天气预报、历史数据、空气质量', region: 'global',
    keyless: true, cors: true, card: false, expire: false, generous: true,
    tags: ['免费', '免Key', 'CORS'], verified: '2026-08-03',
    links: [
      { label: '官网', url: 'https://open-meteo.com' },
      { label: 'API 文档', url: 'https://open-meteo.com/en/docs' }
    ]
  },
  {
    id: 'qweather', cat: 'weather', name: '和风天气 QWeather', vendor: '和风天气',
    desc: '国内天气、灾害预警、空气质量，个人非商用 1000 次/天',
    pricing: 'tier', rpm: null, rpd: 1000, quota: '个人 / 非商用 1000 次 / 天',
    limit: '免费开发版；需实名认证',
    use: '国内天气、预警、空气质量', region: 'cn',
    keyless: false, cors: false, card: false, expire: false, generous: false,
    tags: ['免费档', 'API Key', '国内'], verified: '2026-08-03',
    links: [
      { label: '开发文档', url: 'https://dev.qweather.com' },
      { label: '控制台', url: 'https://console.qweather.com' }
    ]
  },
  {
    id: 'owm', cat: 'weather', name: 'OpenWeatherMap', vendor: 'OpenWeather',
    desc: '全球天气数据，免费档 1000 次/天',
    pricing: 'tier', rpm: null, rpd: 1000, quota: '免费档 1000 次 / 天',
    limit: '旧 5 万 / 月政策已收紧；需 Key',
    use: '全球天气', region: 'global',
    keyless: false, cors: true, card: false, expire: false, generous: false,
    tags: ['免费档', 'API Key', 'CORS'], verified: '2026-07-13',
    links: [
      { label: 'API', url: 'https://openweathermap.org/api' },
      { label: '定价', url: 'https://openweathermap.org/price' }
    ]
  },

  {
    id: 'nominatim', cat: 'geo', name: 'Nominatim (OSM)', vendor: 'OSM 基金会',
    desc: '完全免费的地名 / 经纬度互转，无需 Key',
    pricing: 'free', rpm: 60, rpd: null, quota: '完全免费，约 1 请求 / 秒',
    limit: '须带 User-Agent 并遵守合理使用政策',
    use: '地理编码、反地理编码、全球地名搜索', region: 'global',
    keyless: true, cors: true, card: false, expire: false, generous: false,
    tags: ['免费', '免Key', 'CORS'], verified: '2026-07-13',
    links: [
      { label: '官网', url: 'https://nominatim.org' },
      { label: '使用政策', url: 'https://operations.osmfoundation.org/policies/nominatim' }
    ]
  },
  {
    id: 'amap', cat: 'geo', name: '高德地图', vendor: '高德',
    desc: '个人开发者 500 万次/月，国内地图能力最完整',
    pricing: 'tier', rpm: null, rpd: null, quota: '个人开发者 500 万次 / 月',
    limit: '需 Key；商用需企业认证',
    use: '国内地图、路径规划、POI 检索', region: 'cn',
    keyless: false, cors: false, card: false, expire: false, generous: true,
    tags: ['免费档', 'API Key', '国内'], verified: '2026-07-13',
    links: [
      { label: '开放平台', url: 'https://lbs.amap.com' },
      { label: '文档', url: 'https://lbs.amap.com/api/javascript-api-v2/documentation' }
    ]
  },
  {
    id: 'baidumap', cat: 'geo', name: '百度地图', vendor: '百度',
    desc: '国内地图服务，按服务项分别提供免费配额',
    pricing: 'tier', rpm: null, rpd: null, quota: '免费配额（按服务项区分）',
    limit: '需 Key',
    use: '国内地图与位置服务', region: 'cn',
    keyless: false, cors: false, card: false, expire: false, generous: false,
    tags: ['免费档', 'API Key', '国内'], verified: '2026-07-13',
    links: [
      { label: '开放平台', url: 'https://lbsyun.baidu.com' },
      { label: '文档', url: 'https://lbsyun.baidu.com/index.php?title=webapi' }
    ]
  },

  {
    id: 'mymemory', cat: 'translate', name: 'MyMemory', vendor: 'Translated',
    desc: '匿名 5000 字符/天，留邮箱可提至 5 万，免注册免 Key',
    pricing: 'free', rpm: null, rpd: null, quota: '匿名 5,000 字符 / 天；提供邮箱 50,000 字符 / 天',
    limit: '无需注册；质量为机器翻译记忆库水平',
    use: '快速翻译验证、个人项目', region: 'global',
    keyless: true, cors: true, card: false, expire: false, generous: true,
    tags: ['免费', '免Key', 'CORS'], verified: '2026-07-13',
    links: [
      { label: '官网', url: 'https://mymemory.translated.net' },
      { label: '用量说明', url: 'https://mymemory.translated.net/doc/usagelimits.php' }
    ]
  },
  {
    id: 'libretranslate', cat: 'translate', name: 'LibreTranslate', vendor: '开源社区',
    desc: '自建即无限免费，数据不出本机',
    pricing: 'local', rpm: null, rpd: null, quota: '自建无限免费',
    limit: '需自行部署服务器',
    use: '数据敏感场景、离线翻译', region: 'local',
    keyless: true, cors: true, card: false, expire: false, generous: true,
    tags: ['免费', '本地', '离线'], verified: '2026-07-13',
    links: [
      { label: '官网', url: 'https://libretranslate.com' },
      { label: 'GitHub', url: 'https://github.com/LibreTranslate/LibreTranslate' }
    ]
  },
  {
    id: 'deepl', cat: 'translate', name: 'DeepL API Free', vendor: 'DeepL',
    desc: '50 万字符/月，欧洲语种翻译质量领先',
    pricing: 'tier', rpm: null, rpd: null, quota: '50 万字符 / 月',
    limit: '注册免费档也需绑定信用卡',
    use: '高质量多语种翻译', region: 'global',
    keyless: false, cors: false, card: true, expire: false, generous: true,
    tags: ['免费档', 'API Key'], verified: '2026-07-13',
    links: [
      { label: 'DeepL API', url: 'https://www.deepl.com/pro-api' },
      { label: '文档', url: 'https://developers.deepl.com' }
    ]
  },
  {
    id: 'baidufanyi', cat: 'translate', name: '百度翻译 API', vendor: '百度',
    desc: '200 万字符/月，中文生态适配好',
    pricing: 'tier', rpm: null, rpd: null, quota: '200 万字符 / 月',
    limit: '需 Key',
    use: '中文生态翻译', region: 'cn',
    keyless: false, cors: false, card: false, expire: false, generous: true,
    tags: ['免费档', 'API Key', '国内'], verified: '2026-07-13',
    links: [
      { label: '开放平台', url: 'https://fanyi-api.baidu.com' },
      { label: '文档', url: 'https://fanyi-api.baidu.com/product/11' }
    ]
  },

  {
    id: 'tushare', cat: 'finance', name: 'Tushare', vendor: 'Tushare',
    desc: 'A 股历史行情与基本面数据，注册积分制',
    pricing: 'tier', rpm: null, rpd: null, quota: '注册赠约 100 积分，签到 / 任务可加成',
    limit: '按积分限频；部分基础行情也需积分门槛',
    use: 'A 股历史行情、财务基本面', region: 'cn',
    keyless: false, cors: false, card: false, expire: false, generous: false,
    tags: ['免费档', '登录', '国内'], verified: '2026-07-13',
    links: [
      { label: '官网', url: 'https://tushare.pro' },
      { label: '文档', url: 'https://tushare.pro/document/1' }
    ]
  },
  {
    id: 'alphavantage', cat: 'finance', name: 'Alpha Vantage', vendor: 'Alpha Vantage',
    desc: '美股 / 外汇 / 加密 / 技术指标，25 次/天',
    pricing: 'tier', rpm: 5, rpd: 25, quota: '25 次 / 天，5 次 / 分钟',
    limit: '需 Key；免费档调用次数偏紧',
    use: '美股与全球行情、量化原型', region: 'global',
    keyless: false, cors: true, card: false, expire: false, generous: false,
    tags: ['免费档', 'API Key', 'CORS'], verified: '2026-08-03',
    links: [
      { label: '官网', url: 'https://www.alphavantage.co' },
      { label: '文档', url: 'https://www.alphavantage.co/documentation' }
    ]
  },
  {
    id: 'coingecko', cat: 'finance', name: 'CoinGecko', vendor: 'CoinGecko',
    desc: '加密货币行情，免费档约 10–30 次/分',
    pricing: 'tier', rpm: 10, rpd: null, quota: '免费档约 10–30 次 / 分钟',
    limit: '高级功能需 Key',
    use: '加密货币行情与市值', region: 'global',
    keyless: false, cors: true, card: false, expire: false, generous: false,
    tags: ['免费档', 'API Key', 'CORS'], verified: '2026-07-13',
    links: [
      { label: '官网', url: 'https://www.coingecko.com/en/api' },
      { label: '文档', url: 'https://docs.coingecko.com' }
    ]
  },
  {
    id: 'exchangerate', cat: 'finance', name: 'exchangerate.host', vendor: 'exchangerate',
    desc: '汇率换算，免 Key 可直接前端调用',
    pricing: 'free', rpm: null, rpd: null, quota: '免费档有限额度',
    limit: '高频使用需付费档',
    use: '汇率换算、多币种折算', region: 'global',
    keyless: true, cors: true, card: false, expire: false, generous: false,
    tags: ['免费', '免Key', 'CORS'], verified: '2026-07-13',
    links: [
      { label: '官网', url: 'https://exchangerate.host' },
      { label: '文档', url: 'https://exchangerate.host/support' }
    ]
  },

  {
    id: 'paddleocr', cat: 'ocr', name: 'PaddleOCR', vendor: '百度飞桨',
    desc: '本地完全免费，票据 / 表格 / 文档识别，中文效果强',
    pricing: 'local', rpm: null, rpd: null, quota: '本地部署完全免费',
    limit: '需本地部署与算力',
    use: '票据、表格、审计底稿文档识别', region: 'local',
    keyless: true, cors: false, card: false, expire: false, generous: true,
    tags: ['免费', '本地', '离线', '中文强'], verified: '2026-07-13',
    links: [
      { label: 'GitHub', url: 'https://github.com/PaddlePaddle/PaddleOCR' }
    ]
  },
  {
    id: 'baiduocr', cat: 'ocr', name: '百度 OCR', vendor: '百度智能云',
    desc: '通用文字与票据识别，提供免费额度',
    pricing: 'tier', rpm: null, rpd: null, quota: '免费额度（按 QPS / 次数区分）',
    limit: '需 Key；免费档 QPS 较低',
    use: '通用文字、票据、证照识别', region: 'cn',
    keyless: false, cors: false, card: false, expire: false, generous: false,
    tags: ['免费档', 'API Key', '国内'], verified: '2026-07-13',
    links: [
      { label: 'AI 开放平台', url: 'https://ai.baidu.com/tech/ocr' },
      { label: '文档', url: 'https://cloud.baidu.com/doc/OCR/index.html' }
    ]
  },
  {
    id: 'unsplash', cat: 'ocr', name: 'Unsplash API', vendor: 'Unsplash',
    desc: '高质量免费可商用图片，50 次/小时',
    pricing: 'tier', rpm: null, rpd: null, quota: '免费 50 次 / 小时',
    limit: '需 Key；生产环境需申请提额',
    use: '高质量图片素材', region: 'global',
    keyless: false, cors: true, card: false, expire: false, generous: false,
    tags: ['免费档', 'API Key', 'CORS'], verified: '2026-07-13',
    links: [
      { label: '开发者', url: 'https://unsplash.com/developers' },
      { label: '文档', url: 'https://unsplash.com/documentation' }
    ]
  },
  {
    id: 'pexels', cat: 'ocr', name: 'Pexels API', vendor: 'Pexels',
    desc: '照片与视频素材，2 万次/月',
    pricing: 'tier', rpm: null, rpd: null, quota: '免费 2 万次 / 月',
    limit: '需 Key',
    use: '照片 / 视频素材', region: 'global',
    keyless: false, cors: true, card: false, expire: false, generous: true,
    tags: ['免费档', 'API Key', 'CORS'], verified: '2026-07-13',
    links: [
      { label: 'API', url: 'https://www.pexels.com/api' },
      { label: '文档', url: 'https://www.pexels.com/api/documentation' }
    ]
  },

  {
    id: 'github', cat: 'util', name: 'GitHub API', vendor: 'GitHub',
    desc: '未登录 60 次/小时，登录后 5000 次/小时',
    pricing: 'free', rpm: null, rpd: null, quota: '未登录 60 次 / 小时；登录 5,000 次 / 小时',
    limit: '未登录额度低，建议带 token',
    use: '仓库数据、Trending 追踪、CI 集成', region: 'global',
    keyless: true, cors: true, card: false, expire: false, generous: true,
    tags: ['免费', '免Key', 'CORS'], verified: '2026-07-13',
    links: [{ label: 'REST 文档', url: 'https://docs.github.com/rest' }]
  },
  {
    id: 'nasa', cat: 'util', name: 'NASA API', vendor: 'NASA',
    desc: '开放科学数据，约 1000 次/小时',
    pricing: 'tier', rpm: null, rpd: null, quota: '免费，约 1,000 次 / 小时',
    limit: '需 Key（演示可用 DEMO_KEY）',
    use: '天文影像、科学数据', region: 'global',
    keyless: false, cors: true, card: false, expire: false, generous: true,
    tags: ['免费', 'API Key'], verified: '2026-07-13',
    links: [{ label: '官网', url: 'https://api.nasa.gov' }, { label: '文档', url: 'https://api.nasa.gov/docs' }]
  },
  {
    id: 'ipapi', cat: 'util', name: 'IP-API', vendor: 'IP-API',
    desc: 'IP 归属地查询，非商用 45 次/分钟',
    pricing: 'free', rpm: 45, rpd: null, quota: '非商用 45 次 / 分钟',
    limit: '商用需付费；无需 Key',
    use: 'IP 定位、访客地域分析', region: 'global',
    keyless: true, cors: false, card: false, expire: false, generous: false,
    tags: ['免费', '免Key'], verified: '2026-07-13',
    links: [{ label: '官网', url: 'https://ip-api.com' }, { label: '文档', url: 'https://ip-api.com/docs' }]
  },
  {
    id: 'jsonplaceholder', cat: 'util', name: 'JSONPlaceholder', vendor: 'Typicode',
    desc: '完全免费的测试假数据接口',
    pricing: 'free', rpm: null, rpd: null, quota: '完全免费，无限制',
    limit: '仅供测试，非真实数据',
    use: '前端联调、原型 mock', region: 'global',
    keyless: true, cors: true, card: false, expire: false, generous: true,
    tags: ['免费', '免Key', 'CORS'], verified: '2026-07-13',
    links: [{ label: '官网', url: 'https://jsonplaceholder.typicode.com' }]
  },
  {
    id: 'dummyjson', cat: 'util', name: 'DummyJSON', vendor: 'DummyJSON',
    desc: '商品 / 用户等测试数据，免 Key',
    pricing: 'free', rpm: null, rpd: null, quota: '完全免费，无限制',
    limit: '仅供测试',
    use: '电商类原型 mock 数据', region: 'global',
    keyless: true, cors: true, card: false, expire: false, generous: true,
    tags: ['免费', '免Key', 'CORS'], verified: '2026-07-13',
    links: [{ label: '官网', url: 'https://dummyjson.com' }]
  },
  {
    id: 'restcountries', cat: 'util', name: 'REST Countries', vendor: '社区',
    desc: '国家 / 地区基础信息，免 Key',
    pricing: 'free', rpm: null, rpd: null, quota: '完全免费',
    limit: '无',
    use: '国家信息、区号、货币、国旗', region: 'global',
    keyless: true, cors: true, card: false, expire: false, generous: true,
    tags: ['免费', '免Key', 'CORS'], verified: '2026-07-13',
    links: [{ label: '官网', url: 'https://restcountries.com' }, { label: '文档', url: 'https://restcountries.com/#api-endpoints' }]
  },
  {
    id: 'openlibrary', cat: 'util', name: 'Open Library', vendor: 'Internet Archive',
    desc: '图书元数据，完全免费',
    pricing: 'free', rpm: null, rpd: null, quota: '完全免费',
    limit: '需合理使用',
    use: '图书检索、ISBN 元数据', region: 'global',
    keyless: true, cors: false, card: false, expire: false, generous: true,
    tags: ['免费', '免Key'], verified: '2026-07-13',
    links: [{ label: '官网', url: 'https://openlibrary.org' }, { label: 'API', url: 'https://openlibrary.org/developers/api' }]
  },
  {
    id: 'wikidata', cat: 'util', name: 'Wikidata', vendor: 'Wikimedia',
    desc: '开放知识图谱，完全免费',
    pricing: 'free', rpm: null, rpd: null, quota: '完全免费',
    limit: '需带 User-Agent',
    use: '实体消歧、知识图谱构建', region: 'global',
    keyless: true, cors: false, card: false, expire: false, generous: true,
    tags: ['免费', '免Key'], verified: '2026-07-13',
    links: [{ label: '官网', url: 'https://www.wikidata.org' }, { label: 'API', url: 'https://www.wikidata.org/wiki/Special:EntityData' }]
  },
  {
    id: 'publicapis', cat: 'util', name: 'public-apis 仓库', vendor: '社区',
    desc: '收录 200+ 免费 API 的持续维护清单',
    pricing: 'free', rpm: null, rpd: null, quota: '完全免费',
    limit: '社区维护，条目时效性不一',
    use: '发现更多免费 API', region: 'global',
    keyless: true, cors: false, card: false, expire: false, generous: true,
    tags: ['免费', '发现'], verified: '2026-07-13',
    links: [
      { label: 'GitHub', url: 'https://github.com/public-apis/public-apis' },
      { label: 'free-for.dev', url: 'https://free-for.dev' }
    ]
  }
];

/* AI 工具与平台（网页端 / 本地栈） */
window.__TOOLS__ = [
  { id: 't-chatgpt', group: '对话与搜索', name: 'ChatGPT 免费版', desc: 'GPT-4o 级别对话，有限额度', tags: ['免费档', '登录', '多模态'], url: 'https://chat.openai.com', region: 'global' },
  { id: 't-gemini', group: '对话与搜索', name: 'Gemini 免费版', desc: 'Gemini 2.5 Flash / Pro 网页版', tags: ['免费档', '登录', '多模态', '长上下文'], url: 'https://gemini.google.com', region: 'global' },
  { id: 't-claude', group: '对话与搜索', name: 'Claude Free', desc: '网页对话免费，非 API', tags: ['免费档', '登录', '长上下文'], url: 'https://claude.ai', region: 'global' },
  { id: 't-deepseek', group: '对话与搜索', name: 'DeepSeek 网页 / App', desc: '个人用户无限免费对话', tags: ['免费', '登录', '中文强', '代码强', '国内'], url: 'https://chat.deepseek.com', region: 'cn' },
  { id: 't-poe', group: '对话与搜索', name: 'Poe', desc: '聚合多模型，含免费档', tags: ['免费档', '登录', '多模态'], url: 'https://poe.com', region: 'global' },
  { id: 't-perplexity', group: '对话与搜索', name: 'Perplexity', desc: 'AI 搜索，免费档可用', tags: ['免费档', '登录', '多模态'], url: 'https://www.perplexity.ai', region: 'global' },
  { id: 't-yuanbao', group: '对话与搜索', name: '腾讯元宝', desc: '中文对话，免费', tags: ['免费', '登录', '中文强', '国内'], url: 'https://yuanbao.tencent.com', region: 'cn' },
  { id: 't-tongyi', group: '对话与搜索', name: '通义千问', desc: '国内大模型，免费档', tags: ['免费档', '登录', '中文强', '国内'], url: 'https://tongyi.aliyun.com', region: 'cn' },
  { id: 't-glm', group: '对话与搜索', name: '智谱清言 GLM', desc: '国内大模型，免费档', tags: ['免费档', '登录', '中文强', '国内'], url: 'https://chat.zhipuai.cn', region: 'cn' },
  { id: 't-kimi', group: '对话与搜索', name: 'Kimi', desc: '长文本对话，免费档', tags: ['免费档', '登录', '长上下文', '中文强', '国内'], url: 'https://kimi.moonshot.cn', region: 'cn' },

  { id: 't-ollama', group: '本地部署', name: 'Ollama', desc: '最易用的本地推理引擎，一行命令跑模型', tags: ['免费', '本地', '离线'], url: 'https://ollama.com', region: 'local' },
  { id: 't-lmstudio', group: '本地部署', name: 'LM Studio', desc: '图形界面本地模型管理与推理', tags: ['免费', '本地', '离线'], url: 'https://lmstudio.ai', region: 'local' },
  { id: 't-vllm', group: '本地部署', name: 'vLLM', desc: '高吞吐推理服务，生产级私有化部署', tags: ['免费', '本地', '离线'], url: 'https://docs.vllm.ai', region: 'local' },
  { id: 't-llamacpp', group: '本地部署', name: 'llama.cpp', desc: 'CPU / 低配设备也能跑的推理引擎', tags: ['免费', '本地', '离线'], url: 'https://github.com/ggerganov/llama.cpp', region: 'local' },

  { id: 't-chroma', group: '向量库与 RAG', name: 'Chroma', desc: '轻量向量库，本地知识库首选', tags: ['免费', '本地'], url: 'https://www.trychroma.com', region: 'local' },
  { id: 't-faiss', group: '向量库与 RAG', name: 'FAISS', desc: 'Meta 出品的向量检索库', tags: ['免费', '本地'], url: 'https://github.com/facebookresearch/faiss', region: 'local' },
  { id: 't-qdrant', group: '向量库与 RAG', name: 'Qdrant', desc: '生产级向量数据库，支持过滤检索', tags: ['免费', '本地'], url: 'https://qdrant.tech', region: 'local' },
  { id: 't-weaviate', group: '向量库与 RAG', name: 'Weaviate', desc: '带模块化向量化能力的向量库', tags: ['免费', '本地'], url: 'https://weaviate.io', region: 'local' },

  { id: 't-langchain', group: 'Agent 编排', name: 'LangChain', desc: 'Agent / RAG 应用编排框架', tags: ['免费', '开源'], url: 'https://docs.langchain.com', region: 'global' },
  { id: 't-llamaindex', group: 'Agent 编排', name: 'LlamaIndex', desc: '面向数据的 RAG 框架', tags: ['免费', '开源'], url: 'https://docs.llamaindex.ai', region: 'global' },
  { id: 't-dify', group: 'Agent 编排', name: 'Dify', desc: '开源 LLMOps，可视化 Agent 编排', tags: ['免费', '开源', '本地'], url: 'https://dify.ai', region: 'local' },

  { id: 't-futurepedia', group: '工具发现', name: 'Futurepedia', desc: '5000+ AI 工具发现与筛选，含教程', tags: ['免费', '发现'], url: 'https://futurepedia.io', region: 'global' },
  { id: 't-toolify', group: '工具发现', name: 'Toolify', desc: '2.8 万+ 工具，带流量趋势洞察', tags: ['免费', '发现'], url: 'https://www.toolify.ai', region: 'global' },
  { id: 't-taaft', group: '工具发现', name: "There's An AI For That", desc: '按任务找 AI 工具的鼻祖站', tags: ['免费', '发现'], url: 'https://theresanaiforthat.com', region: 'global' }
];

/* 免费资讯源 */
window.__SOURCES__ = [
  { name: 'Hacker News', kind: '社区资讯', desc: '全球技术与 AI 前沿讨论，Y Combinator 运营', url: 'https://news.ycombinator.com', lang: 'en' },
  { name: 'arXiv cs.AI', kind: '论文预印本', desc: '最新研究成果，几乎每日更新', url: 'https://arxiv.org/list/cs.AI/recent', lang: 'en' },
  { name: 'The Batch', kind: '邮件周刊', desc: 'DeepLearning.AI 出品，吴恩达主编', url: 'https://www.deeplearning.ai/the-batch', lang: 'en' },
  { name: 'TLDR AI', kind: '每日简报', desc: '工程师向，3 分钟速览 AI/ML 要点', url: 'https://tldr.tech/ai', lang: 'en' },
  { name: 'The Rundown AI', kind: '每日简报', desc: '最大 AI 日报，偏「今天怎么用」', url: 'https://www.therundown.ai', lang: 'en' },
  { name: "Ben's Bites", kind: '邮件日报', desc: '创始人视角，AI 创业生态', url: 'https://bensbites.com', lang: 'en' },
  { name: 'Import AI', kind: '邮件周刊', desc: 'Anthropic 联创 Jack Clark 写前沿与政策', url: 'https://importai.substack.com', lang: 'en' },
  { name: 'Latent Space', kind: '工程化资讯', desc: 'AI Engineer 向：Agent / RAG / Infra', url: 'https://www.latent.space', lang: 'en' },
  { name: '机器之心', kind: '中文媒体', desc: '国内 AI 资讯与论文解读', url: 'https://www.jiqizhixin.com', lang: 'zh' },
  { name: '量子位', kind: '中文媒体', desc: '前沿模型与产品动态', url: 'https://www.qbitai.com', lang: 'zh' },
  { name: 'MarkTechPost', kind: '网站 + 日报', desc: '开源发布、教程密集', url: 'https://marktechpost.com', lang: 'en' },
  { name: 'r/LocalLLaMA', kind: '社区论坛', desc: '本地部署与小模型的一手信号', url: 'https://www.reddit.com/r/LocalLLaMA', lang: 'en' },
  { name: 'a16z tech blog', kind: '投资洞察', desc: 'AI 产业趋势与投研观点', url: 'https://a16z.com/ai', lang: 'en' },
  { name: 'Prompt Engineering Guide', kind: '教程', desc: '提示工程开源指南（中英文）', url: 'https://www.promptingguide.ai', lang: 'zh' },
  { name: 'GitHub Trending', kind: '项目榜', desc: '追踪热门开源 AI 项目', url: 'https://github.com/trending/python?since=daily', lang: 'en' }
];

/* 免费学习资源 */
window.__LEARN__ = [
  { name: 'Hugging Face Courses', desc: 'Transformer / Diffusers / 推理部署', url: 'https://huggingface.co/learn' },
  { name: 'DeepLearning.AI 短课程', desc: '大模型应用、RAG、Agent', url: 'https://www.deeplearning.ai/short-courses' },
  { name: 'ModelScope 魔搭', desc: '中文模型 / 数据集库、Notebook 实验', url: 'https://modelscope.cn' },
  { name: 'Hugging Face Hub', desc: '100 万+ 开源模型与数据集', url: 'https://huggingface.co/models' },
  { name: 'Kaggle', desc: '数据集 + 免费 GPU Notebook', url: 'https://www.kaggle.com' },
  { name: 'Google AI Studio', desc: 'Gemini 免费体验与调试', url: 'https://aistudio.google.com' },
  { name: 'Anthropic Cookbook', desc: 'Claude 集成示例', url: 'https://github.com/anthropics/anthropic-cookbook' },
  { name: 'LangChain 文档', desc: 'Agent / RAG 框架', url: 'https://docs.langchain.com' },
  { name: 'Dify 文档', desc: '开源 LLMOps / 可视化编排', url: 'https://docs.dify.ai' },
  { name: 'AI For Everyone', desc: '吴恩达非技术向 AI 通识课', url: 'https://www.coursera.org/learn/ai-for-everyone' }
];

/* 场景直达：把「我要做什么」映射到具体条目（TAAFT task-based search 的本地化实现） */
window.__SCENARIOS__ = [
  { q: '审计底稿等敏感数据，不能出本机', hit: ['ollama', 'paddleocr', 'libretranslate'], note: '全部本地部署，数据不出内网' },
  { q: '做中文对话 / 客服机器人', hit: ['deepseek', 'zhipu', 'qwen'], note: '中文强且国内节点，合规成本低' },
  { q: '要最快的推理速度做原型', hit: ['groq'], note: '约 2600 tok/s，30 RPM 完全免费' },
  { q: '处理超长文档 / 长上下文', hit: ['gemini', 'claude', 'deepseek'], note: '均支持百万级 token 上下文' },
  { q: '纯前端项目，没有后端服务器', hit: ['openmeteo', 'mymemory', 'restcountries', 'exchangerate', 'jsonplaceholder'], note: '免 Key 且支持 CORS，可浏览器直连' },
  { q: '识别发票 / 票据 / 表格', hit: ['paddleocr', 'baiduocr'], note: '中文票据识别效果好' },
  { q: '取 A 股 / 美股行情数据', hit: ['tushare', 'alphavantage', 'coingecko'], note: '免费档够做研究和原型' },
  { q: '搭一个本地知识库 RAG', hit: ['ollama', 'hf'], note: '配合 Chroma / Qdrant 与 LangChain 使用' },
  { q: '完全不想注册账号', hit: ['openmeteo', 'nominatim', 'mymemory', 'ipapi', 'github', 'wikidata'], note: '无需 Key，拿来即用' }
];
