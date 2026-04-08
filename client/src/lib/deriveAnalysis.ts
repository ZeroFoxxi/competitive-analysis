/**
 * 智能分析推导引擎
 * 根据当前数据动态生成战略建议、竞争态势分析等
 */

import type { ComparisonCategory, CompanyInfo } from "./data";

export interface DerivedRecommendation {
  priority: "高" | "中" | "低";
  area: string;
  detail: string;
  metric?: string; // 关联指标
}

export interface CompetitiveInsight {
  ourAdvantages: string[];
  ourWeaknesses: string[];
  overallScore: number; // 0-100
  verdict: "领先" | "持平" | "落后";
}

interface AnalysisInput {
  companies: Record<string, CompanyInfo>;
  comparisonData: ComparisonCategory[];
  radarData: { dimensions: string[]; leadong: number[]; globalso: number[] };
  keyMetrics: Array<{ label: string; leadong: number; globalso: number; unit: string; format: string }>;
  winRateData: { leadongWins: number; globalsoWins: number; ties: number; total: number };
}

// 计算雷达图各维度差值
function calcRadarGaps(radarData: AnalysisInput["radarData"]) {
  return radarData.dimensions.map((dim, i) => ({
    dim,
    gap: radarData.leadong[i] - radarData.globalso[i],
    leadong: radarData.leadong[i],
    globalso: radarData.globalso[i],
  }));
}

// 找出领动明显落后的雷达维度（差距 < -15）
function findWeakDimensions(radarData: AnalysisInput["radarData"]) {
  return calcRadarGaps(radarData)
    .filter((d) => d.gap < -15)
    .sort((a, b) => a.gap - b.gap);
}

// 找出领动明显领先的雷达维度（差距 > 10）
function findStrongDimensions(radarData: AnalysisInput["radarData"]) {
  return calcRadarGaps(radarData)
    .filter((d) => d.gap > 10)
    .sort((a, b) => b.gap - a.gap);
}

// 找出对比项中领动胜出的类别
function findWinCategories(comparisonData: ComparisonCategory[]) {
  return comparisonData
    .map((cat) => {
      const wins = cat.items.filter((i) => i.winner === "leadong").length;
      const losses = cat.items.filter((i) => i.winner === "globalso").length;
      return { category: cat.category, icon: cat.icon, wins, losses, net: wins - losses };
    })
    .sort((a, b) => b.net - a.net);
}

// 找出对比项中领动落后的类别
function findLoseCategories(comparisonData: ComparisonCategory[]) {
  return comparisonData
    .map((cat) => {
      const wins = cat.items.filter((i) => i.winner === "leadong").length;
      const losses = cat.items.filter((i) => i.winner === "globalso").length;
      return { category: cat.category, icon: cat.icon, wins, losses, net: wins - losses };
    })
    .filter((c) => c.net < 0)
    .sort((a, b) => a.net - b.net);
}

// 价格差分析
function analyzePriceDiff(companies: Record<string, CompanyInfo>) {
  const leadongPrice = companies.leadong?.price ?? 0;
  const globalsoPrice = companies.globalso?.price ?? 0;
  const diff = leadongPrice - globalsoPrice;
  const pct = globalsoPrice > 0 ? Math.round((diff / globalsoPrice) * 100) : 0;
  return { diff, pct, leadongPrice, globalsoPrice };
}

// 关键指标差距分析
function analyzeMetricGaps(keyMetrics: AnalysisInput["keyMetrics"]) {
  return keyMetrics.map((m) => ({
    label: m.label,
    unit: m.unit,
    leadong: m.leadong,
    globalso: m.globalso,
    ratio: m.globalso > 0 ? m.leadong / m.globalso : 1,
    gap: m.leadong - m.globalso,
  }));
}

/**
 * 主推导函数：根据当前数据动态生成战略建议
 */
export function deriveRecommendations(input: AnalysisInput): DerivedRecommendation[] {
  const { companies, comparisonData, radarData, keyMetrics, winRateData } = input;
  const recommendations: DerivedRecommendation[] = [];

  const weakDims = findWeakDimensions(radarData);
  const strongDims = findStrongDimensions(radarData);
  const loseCategories = findLoseCategories(comparisonData);
  const winCategories = findWinCategories(comparisonData);
  const priceDiff = analyzePriceDiff(companies);
  const metricGaps = analyzeMetricGaps(keyMetrics);

  // 1. 价格策略建议
  if (priceDiff.diff > 10000) {
    recommendations.push({
      priority: "高",
      area: "价格策略调整",
      detail: `当前定价比竞品高出 ${(priceDiff.diff / 10000).toFixed(1)} 万元（高 ${priceDiff.pct}%），在服务内容未形成显著优势的情况下，建议要么适当降价，要么通过增加差异化服务内容来提升性价比，降低客户决策阻力。`,
      metric: `价差：+${(priceDiff.diff / 10000).toFixed(1)}万元`,
    });
  } else if (priceDiff.diff < -10000) {
    recommendations.push({
      priority: "中",
      area: "价格优势强化",
      detail: `当前定价比竞品低 ${Math.abs(priceDiff.diff / 10000).toFixed(1)} 万元，具备明显价格优势。建议在销售话术中突出性价比，同时注意不要让客户误解为"价格低=服务差"，需要配合服务质量的可视化呈现。`,
      metric: `价差：${(priceDiff.diff / 10000).toFixed(1)}万元`,
    });
  }

  // 2. 基于雷达图弱项生成建议
  weakDims.slice(0, 3).forEach((dim) => {
    const absGap = Math.abs(dim.gap);
    const priority: "高" | "中" | "低" = absGap > 30 ? "高" : absGap > 20 ? "中" : "低";

    const dimAdvice: Record<string, string> = {
      AI数智化: `AI能力差距显著（评分差 ${absGap} 分），竞品在AI生态上布局更完整。建议尽快引入多模型AI集成、AI内容生成、AI GEO优化等能力，AI搜索优化将成为未来SEO的关键战场，需要提前布局。`,
      内容营销: `内容产出能力明显落后（评分差 ${absGap} 分），建议借助AI工具大幅提升内容产出量，同时增加视频内容制作能力，形成图文+视频的全媒体内容矩阵。`,
      客户管理: `客户管理工具体系薄弱（评分差 ${absGap} 分），建议开发或集成CRM系统，提供客户管理、邮件营销、海关数据等功能，形成从获客到转化的完整闭环。`,
      SEO优化: `SEO核心指标落后（评分差 ${absGap} 分），需要在Google收录页面数、关键词排名数量、外链总量等指标上制定更有竞争力的承诺，并建立可量化的交付标准。`,
      网站建设: `网站建设能力有待提升（评分差 ${absGap} 分），建议在多语种支持、独立IP服务器、AMP技术等方面加大投入，提升网站技术竞争力。`,
      广告投放: `广告投放体系需要完善（评分差 ${absGap} 分），建议拓展社媒广告渠道，增加Facebook、LinkedIn、YouTube等平台的广告代运营服务。`,
      价格性价比: `性价比感知偏低（评分差 ${absGap} 分），需要重新梳理服务内容与定价的匹配关系，通过增值服务或价格调整来改善客户的性价比认知。`,
      服务模式: `服务模式需要优化（评分差 ${absGap} 分），建议完善服务交付体系，建立更清晰的服务标准和报告机制。`,
    };

    recommendations.push({
      priority,
      area: `${dim.dim}能力提升`,
      detail: dimAdvice[dim.dim] ?? `${dim.dim}维度评分（${dim.leadong}分）落后竞品（${dim.globalso}分），差距 ${absGap} 分，需要重点补强。`,
      metric: `评分差：-${absGap}分`,
    });
  });

  // 3. 基于对比项落后类别生成建议
  loseCategories.slice(0, 2).forEach((cat) => {
    const alreadyCovered = recommendations.some((r) => r.area.includes(cat.category.replace("与", "").substring(0, 4)));
    if (!alreadyCovered) {
      recommendations.push({
        priority: Math.abs(cat.net) >= 3 ? "高" : "中",
        area: `${cat.category}短板补齐`,
        detail: `在"${cat.category}"类别中，竞品胜出 ${cat.losses} 项，我方仅胜出 ${cat.wins} 项，差距明显。建议针对该类别的具体落后项制定专项改进计划，逐步缩小差距。`,
        metric: `胜负差：-${Math.abs(cat.net)}项`,
      });
    }
  });

  // 4. 基于强项生成巩固建议
  if (strongDims.length > 0) {
    const topStrong = strongDims[0];
    recommendations.push({
      priority: "低",
      area: `${topStrong.dim}优势巩固`,
      detail: `在"${topStrong.dim}"维度具有明显优势（领先 ${topStrong.gap} 分），这是核心竞争壁垒。建议在销售材料和客户沟通中重点突出这一优势，同时持续深化，防止竞品追赶。`,
      metric: `领先：+${topStrong.gap}分`,
    });
  }

  // 5. 基于胜率生成综合建议
  const winRate = winRateData.total > 0 ? winRateData.leadongWins / winRateData.total : 0;
  if (winRate < 0.3) {
    recommendations.push({
      priority: "高",
      area: "全面竞争力提升",
      detail: `当前综合胜率仅 ${Math.round(winRate * 100)}%（${winRateData.leadongWins}/${winRateData.total}项），整体处于明显劣势。建议优先聚焦2-3个关键维度进行突破，而非全面铺开，通过差异化策略在细分领域建立竞争优势。`,
      metric: `胜率：${Math.round(winRate * 100)}%`,
    });
  } else if (winRate >= 0.5) {
    recommendations.push({
      priority: "低",
      area: "竞争优势转化",
      detail: `综合胜率达 ${Math.round(winRate * 100)}%（${winRateData.leadongWins}/${winRateData.total}项），整体竞争力较强。建议将数据优势转化为销售话术，通过可视化的对比报告帮助客户直观感受差异，提升成单率。`,
      metric: `胜率：${Math.round(winRate * 100)}%`,
    });
  }

  // 6. 关键指标差距建议
  const contentMetric = metricGaps.find((m) => m.label.includes("内容") || m.label.includes("文章"));
  if (contentMetric && contentMetric.ratio < 0.5) {
    const alreadyCovered = recommendations.some((r) => r.area.includes("内容"));
    if (!alreadyCovered) {
      recommendations.push({
        priority: "中",
        area: "内容产出量提升",
        detail: `内容产出量（${contentMetric.leadong}${contentMetric.unit}/年）仅为竞品（${contentMetric.globalso}${contentMetric.unit}/年）的 ${Math.round(contentMetric.ratio * 100)}%，差距悬殊。建议借助AI工具将内容产出量提升至竞品的60%以上，同时保持人工深度撰写的质量优势。`,
        metric: `产出比：${Math.round(contentMetric.ratio * 100)}%`,
      });
    }
  }

  // 按优先级排序：高 > 中 > 低
  const priorityOrder = { 高: 0, 中: 1, 低: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // 最多返回6条
  return recommendations.slice(0, 6);
}

/**
 * 生成竞争态势洞察
 */
export function deriveCompetitiveInsight(input: AnalysisInput): CompetitiveInsight {
  const { comparisonData, radarData, winRateData } = input;

  const strongDims = findStrongDimensions(radarData);
  const weakDims = findWeakDimensions(radarData);
  const winCategories = findWinCategories(comparisonData);

  const ourAdvantages = [
    ...strongDims.slice(0, 3).map((d) => `${d.dim}（领先${d.gap}分）`),
    ...winCategories.filter((c) => c.net > 0).slice(0, 2).map((c) => `${c.category}（胜出${c.wins}项）`),
  ].slice(0, 4);

  const ourWeaknesses = [
    ...weakDims.slice(0, 3).map((d) => `${d.dim}（落后${Math.abs(d.gap)}分）`),
  ].slice(0, 4);

  const radarAvgLeadong = radarData.leadong.reduce((a, b) => a + b, 0) / radarData.leadong.length;
  const radarAvgGlobalso = radarData.globalso.reduce((a, b) => a + b, 0) / radarData.globalso.length;
  const overallScore = Math.round((radarAvgLeadong / Math.max(radarAvgGlobalso, 1)) * 50 + (winRateData.leadongWins / Math.max(winRateData.total, 1)) * 50);

  const verdict: "领先" | "持平" | "落后" =
    overallScore >= 55 ? "领先" : overallScore >= 45 ? "持平" : "落后";

  return { ourAdvantages, ourWeaknesses, overallScore, verdict };
}

/**
 * 生成策略核心口号（根据数据动态生成）
 */
export function deriveStrategyCopy(input: AnalysisInput): { headline: string; body: string } {
  const { comparisonData, radarData, winRateData } = input;
  const strongDims = findStrongDimensions(radarData);
  const winCategories = findWinCategories(comparisonData);

  const topStrong = strongDims[0]?.dim ?? "服务模式";
  const topWinCat = winCategories.find((c) => c.net > 0)?.category ?? "服务质量";

  const winRate = winRateData.total > 0 ? Math.round((winRateData.leadongWins / winRateData.total) * 100) : 0;

  if (winRate >= 50) {
    return {
      headline: `以${topStrong}为核心，构建差异化竞争壁垒`,
      body: `在${topStrong}和${topWinCat}等关键维度具备明显优势，综合胜率达${winRate}%。建议以此为核心竞争力，通过深化服务质量和客户成功案例，将数据优势转化为品牌溢价。`,
    };
  } else {
    return {
      headline: `聚焦${topStrong}优势，差异化突围竞争`,
      body: `尽管综合胜率（${winRate}%）仍有提升空间，但在${topStrong}维度具备独特优势。建议采取"扬长补短"策略：一方面深化${topStrong}的差异化价值，另一方面有针对性地补齐关键短板，逐步提升综合竞争力。`,
    };
  }
}
