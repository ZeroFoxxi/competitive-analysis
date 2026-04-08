// 竞品分析核心数据 - 领动臻选版 vs 全球搜SEO Plus
// Design: Business Insight Magazine style

// All visual decorations now use pure CSS gradients - no external images needed

export const COLORS = {
  leadong: "#D4782A",
  leadongLight: "#F5C88A",
  leadongBg: "#FFF8F0",
  globalso: "#2980B9",
  globalsoLight: "#85C1E9",
  globalsoBg: "#F0F7FC",
};

export interface CompanyInfo {
  name: string;
  product: string;
  price: number;
  phone: string;
  positioning: string;
  color: string;
}

export const companies: Record<string, CompanyInfo> = {
  leadong: {
    name: "焦点领动",
    product: "外贸营销型网站运营服务-臻选版",
    price: 228000,
    phone: "400 677 7600",
    positioning: "专案赋能·快速突围，赋能外贸独立站可持续运营",
    color: COLORS.leadong,
  },
  globalso: {
    name: "全球搜",
    product: "SEO Plus版",
    price: 198000,
    phone: "400-86-25660",
    positioning: "定制营销型网站 + Semrush数据保证 + 白帽SEO优化",
    color: COLORS.globalso,
  },
};

export interface ComparisonItem {
  name: string;
  leadong: string;
  globalso: string;
  winner: "leadong" | "globalso" | "tie";
  note: string;
}

export interface ComparisonCategory {
  category: string;
  icon: string;
  items: ComparisonItem[];
}

export const comparisonData: ComparisonCategory[] = [
  {
    category: "价格与性价比",
    icon: "💰",
    items: [
      { name: "年度服务费", leadong: "228,000元/年", globalso: "198,000元/年", winner: "globalso", note: "全球搜便宜3万元" },
      { name: "广告充值金", leadong: "3万元（含）", globalso: "建议充值（未明确）", winner: "leadong", note: "领动明确包含广告启动金" },
      { name: "综合性价比", leadong: "中等", globalso: "较高", winner: "globalso", note: "全球搜服务项目更多，价格更低" },
    ],
  },
  {
    category: "网站建设",
    icon: "🌐",
    items: [
      { name: "首页定制设计", leadong: "1首页+15内页", globalso: "定制营销型网站", winner: "tie", note: "各有特色" },
      { name: "多语种支持", leadong: "50个小语种", globalso: "190种语言", winner: "globalso", note: "全球搜语言覆盖更广" },
      { name: "移动端优化", leadong: "响应式设计", globalso: "响应式+AMP独立站", winner: "globalso", note: "全球搜额外提供AMP" },
      { name: "服务器配置", leadong: "SaaS云平台共享", globalso: "独立IP云服务器", winner: "globalso", note: "全球搜提供独立IP" },
      { name: "VR全景", leadong: "无", globalso: "VR拍摄+在线展览", winner: "globalso", note: "全球搜独有" },
    ],
  },
  {
    category: "SEO优化服务",
    icon: "🔍",
    items: [
      { name: "关键词排名保证", leadong: "SEMrush排名≥500", globalso: "Google首页≥500", winner: "globalso", note: "全球搜承诺更明确" },
      { name: "小语种关键词", leadong: "未明确", globalso: "≥2000个首页排名", winner: "globalso", note: "全球搜有明确承诺" },
      { name: "Google收录页面", leadong: "≥1,000", globalso: "≥5,000", winner: "globalso", note: "全球搜5倍于领动" },
      { name: "自然搜索流量", leadong: "SEMrush≥500", globalso: "Organic Traffic>1K", winner: "globalso", note: "全球搜承诺更高" },
      { name: "反向链接总量", leadong: "700条", globalso: "6,500条", winner: "globalso", note: "全球搜外链量远超" },
      { name: "SEO专题页面", leadong: "10个", globalso: "≤20个", winner: "globalso", note: "全球搜数量翻倍" },
      { name: "Bing/Yandex SEO", leadong: "✓", globalso: "未明确", winner: "leadong", note: "领动覆盖更多搜索引擎" },
      { name: "结构化数据优化", leadong: "✓", globalso: "未明确", winner: "leadong", note: "领动有明确提及" },
    ],
  },
  {
    category: "内容营销",
    icon: "📝",
    items: [
      { name: "深度文章", leadong: "120篇/年", globalso: "≈624篇/年", winner: "globalso", note: "全球搜内容量5倍以上" },
      { name: "视频内容", leadong: "无", globalso: "≈312条/年", winner: "globalso", note: "全球搜独有视频内容" },
      { name: "GEO核心文章", leadong: "无", globalso: "50篇", winner: "globalso", note: "全球搜独有AI搜索优化" },
      { name: "内容质量", leadong: "人工深度撰写", globalso: "AI+人工结合", winner: "leadong", note: "领动人工比重更高" },
      { name: "产品上传优化", leadong: "50个", globalso: "支持批量导入", winner: "tie", note: "各有优势" },
    ],
  },
  {
    category: "AI与数智化",
    icon: "🤖",
    items: [
      { name: "AI内容生成", leadong: "MoliAI 3000点", globalso: "多模型集成", winner: "globalso", note: "全球搜AI生态更丰富" },
      { name: "AI GEO优化", leadong: "无", globalso: "AI GEO首案推荐保证", winner: "globalso", note: "全球搜前瞻性更强" },
      { name: "AI私有化系统", leadong: "无", globalso: "知识库+智能客服", winner: "globalso", note: "全球搜独有" },
      { name: "AI采购商推荐", leadong: "无", globalso: "≥1500条", winner: "globalso", note: "全球搜独有" },
      { name: "AI决策人查找", leadong: "无", globalso: "✓", winner: "globalso", note: "全球搜独有" },
      { name: "互动营销", leadong: "2000个有效通话", globalso: "未明确", winner: "leadong", note: "领动独有" },
      { name: "企业AI员工", leadong: "无", globalso: "FAQ/内容/场景智能", winner: "globalso", note: "全球搜独有" },
    ],
  },
  {
    category: "广告投放",
    icon: "📢",
    items: [
      { name: "广告启动金", leadong: "3万元充值", globalso: "建议充值（未含）", winner: "leadong", note: "领动明确包含" },
      { name: "投放策略", leadong: "✓（含市场分析）", globalso: "✓（行业大数据）", winner: "tie", note: "均提供" },
      { name: "效果报告", leadong: "1次/月", globalso: "未明确频率", winner: "leadong", note: "领动有明确频率" },
      { name: "社媒广告", leadong: "未明确", globalso: "FB/LinkedIn/YT/TikTok", winner: "globalso", note: "全球搜社媒广告更全面" },
    ],
  },
  {
    category: "客户管理工具",
    icon: "👥",
    items: [
      { name: "CRM系统", leadong: "无", globalso: "客户画像/标签/分组", winner: "globalso", note: "全球搜独有" },
      { name: "邮件营销", leadong: "无", globalso: "群发十万封", winner: "globalso", note: "全球搜独有" },
      { name: "海关数据", leadong: "无", globalso: "2000+国/15亿数据", winner: "globalso", note: "全球搜独有" },
      { name: "在线支付", leadong: "无", globalso: "PayPal+信用卡", winner: "globalso", note: "全球搜独有" },
    ],
  },
  {
    category: "服务模式",
    icon: "🤝",
    items: [
      { name: "上门调研", leadong: "✓（深度访谈）", globalso: "企业调研（未明确上门）", winner: "leadong", note: "领动明确上门服务" },
      { name: "专属顾问", leadong: "✓（全程响应）", globalso: "未明确", winner: "leadong", note: "领动服务更个性化" },
      { name: "月度报告", leadong: "12期+4次SEO报告", globalso: "未明确频率", winner: "leadong", note: "领动报告体系更完善" },
      { name: "交付逻辑", leadong: "三阶逻辑体系", globalso: "未明确", winner: "leadong", note: "领动方法论更清晰" },
      { name: "竞品分析", leadong: "✓", globalso: "≤5家", winner: "globalso", note: "全球搜有明确数量" },
    ],
  },
];

export const radarData = {
  dimensions: ["价格性价比", "网站建设", "SEO优化", "内容营销", "AI数智化", "广告投放", "客户管理", "服务模式"],
  leadong: [65, 75, 70, 60, 45, 80, 30, 90],
  globalso: [80, 85, 90, 90, 95, 70, 90, 60],
};

export const keyMetrics = [
  { label: "年度服务费", leadong: 228000, globalso: 198000, unit: "元", format: "currency" },
  { label: "Google收录页面", leadong: 1000, globalso: 5000, unit: "页", format: "number" },
  { label: "关键词排名数", leadong: 500, globalso: 500, unit: "个", format: "number" },
  { label: "反向链接总量", leadong: 700, globalso: 6500, unit: "条", format: "number" },
  { label: "内容产出量/年", leadong: 120, globalso: 624, unit: "篇", format: "number" },
  { label: "多语种支持", leadong: 50, globalso: 190, unit: "种", format: "number" },
  { label: "自然搜索流量", leadong: 500, globalso: 1000, unit: "", format: "number" },
];

export const swotData = {
  leadong: {
    strengths: [
      "系统化运营方法论（调研-策略-执行-分析-优化闭环）",
      "上门调研深度服务，策略前置",
      "专属顾问全程跟进响应",
      "明确包含3万元广告启动金",
      "完善的月度报告体系（12期+4次SEO报告）",
    ],
    weaknesses: [
      "价格偏高（228,000元/年）",
      "AI能力较弱，仅MoliAI单一工具",
      "内容产出量少（120篇/年 vs 624篇/年）",
      "外链数量不足（700条 vs 6,500条）",
      "缺少CRM系统和邮件营销功能",
    ],
    opportunities: [
      "强化AI能力建设，引入多模型集成",
      "增加内容产出量至300+篇/年",
      "开发CRM功能形成获客转化闭环",
      "拓展社媒运营和视频内容服务",
    ],
    threats: [
      "竞品AI能力快速提升形成代差",
      "价格竞争压力持续加大",
      "客户对数据承诺要求不断提高",
      "AI搜索趋势改变SEO格局",
    ],
  },
  globalso: {
    strengths: [
      "价格竞争力强（198,000元/年）",
      "AI生态完整（多模型+私有化+GEO）",
      "内容产出量大（624篇文章+312条视频/年）",
      "SEMrush数据承诺高且全面",
      "工具链丰富（CRM+邮件+海关数据）",
    ],
    weaknesses: [
      "缺少上门调研的深度服务",
      "无明确的专属顾问机制",
      "报告体系不够明确",
      "服务项目过多可能分散精力",
      "AI内容质量可能不如人工深度撰写",
    ],
    opportunities: [
      "深化服务模式建立专属顾问制度",
      "完善报告体系提升客户信任",
      "提升品牌知名度和市场影响力",
      "利用AI优势打造差异化壁垒",
    ],
    threats: [
      "领动深化服务优势形成护城河",
      "客户对服务质量要求持续提高",
      "AI内容质量被市场质疑",
      "行业价格战挤压利润空间",
    ],
  },
};

export const recommendations = [
  {
    priority: "高" as const,
    area: "AI能力升级",
    detail: "全球搜在AI领域的布局远超领动，建议尽快引入多模型AI集成、AI GEO优化、AI私有化系统等能力。特别是AI搜索优化（GEO）将成为未来SEO的关键战场，需要提前布局。",
  },
  {
    priority: "高" as const,
    area: "内容产出提量",
    detail: "当前120篇/年的文章产出量与竞品624篇/年差距巨大，建议借助AI工具将内容产出量提升至至少300篇/年，同时增加视频内容制作能力。",
  },
  {
    priority: "高" as const,
    area: "SEO数据承诺提升",
    detail: "在Google收录页面（1,000 vs 5,000）、关键词数量（500 vs 1,000）、外链数量（700 vs 6,500）等核心指标上与竞品差距明显，需要制定更有竞争力的承诺。",
  },
  {
    priority: "中" as const,
    area: "CRM与客户管理",
    detail: "建议开发或集成CRM系统，提供客户管理、邮件营销等功能，形成从获客到转化的完整闭环。",
  },
  {
    priority: "中" as const,
    area: "价格策略调整",
    detail: "在服务内容不占优的情况下价格高出3万元，建议要么降价，要么通过增加服务内容来提升性价比。",
  },
  {
    priority: "中" as const,
    area: "社媒运营强化",
    detail: "增加SNS社媒运营服务，包括视频主页运营、社媒广告代运营等，满足客户全渠道营销需求。",
  },
];

export const winRateData = {
  leadongWins: 8,
  globalsoWins: 28,
  ties: 10,
  total: 46,
};
