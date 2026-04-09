import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { companies, comparisonData, keyMetrics, radarData, swotData, competitorMatrix, winRateData } = req.body;

  if (!companies || !comparisonData) {
    return res.status(400).json({ error: "缺少报告数据" });
  }

  try {
    // 构建报告摘要文本
    const leadong = companies.leadong;
    const globalso = companies.globalso;

    let reportText = `# 竞品分析报告\n\n`;
    reportText += `生成时间：${new Date().toLocaleString("zh-CN")}\n\n`;

    // 基本信息
    reportText += `## 一、竞品基本信息\n\n`;
    reportText += `| 项目 | ${leadong?.name || "领动"} | ${globalso?.name || "全球搜"} |\n`;
    reportText += `|------|------|------|\n`;
    reportText += `| 产品 | ${leadong?.product || "-"} | ${globalso?.product || "-"} |\n`;
    reportText += `| 年度价格 | ¥${(leadong?.price || 0).toLocaleString()} | ¥${(globalso?.price || 0).toLocaleString()} |\n`;
    reportText += `| 联系电话 | ${leadong?.phone || "-"} | ${globalso?.phone || "-"} |\n`;
    reportText += `| 产品定位 | ${leadong?.positioning || "-"} | ${globalso?.positioning || "-"} |\n\n`;

    // 胜率统计
    if (winRateData) {
      reportText += `## 二、综合胜率统计\n\n`;
      reportText += `- ${leadong?.name || "领动"} 胜出：${winRateData.leadongWins} 项\n`;
      reportText += `- ${globalso?.name || "全球搜"} 胜出：${winRateData.globalsoWins} 项\n`;
      reportText += `- 持平：${winRateData.ties || 0} 项\n`;
      reportText += `- 总计：${winRateData.total} 项\n\n`;
    }

    // 关键指标
    if (keyMetrics?.length) {
      reportText += `## 三、关键指标对比\n\n`;
      reportText += `| 指标 | ${leadong?.name || "领动"} | ${globalso?.name || "全球搜"} | 单位 |\n`;
      reportText += `|------|------|------|------|\n`;
      keyMetrics.forEach((m: any) => {
        reportText += `| ${m.label} | ${m.leadong} | ${m.globalso} | ${m.unit} |\n`;
      });
      reportText += "\n";
    }

    // 详细对比
    if (comparisonData?.length) {
      reportText += `## 四、详细功能对比\n\n`;
      comparisonData.forEach((cat: any) => {
        reportText += `### ${cat.icon} ${cat.category}\n\n`;
        reportText += `| 对比项 | ${leadong?.name || "领动"} | ${globalso?.name || "全球搜"} | 胜出方 | 备注 |\n`;
        reportText += `|------|------|------|------|------|\n`;
        cat.items.forEach((item: any) => {
          const winner =
            item.winner === "leadong"
              ? leadong?.name || "领动"
              : item.winner === "globalso"
              ? globalso?.name || "全球搜"
              : "持平";
          reportText += `| ${item.name} | ${item.leadong} | ${item.globalso} | ${winner} | ${item.note || "-"} |\n`;
        });
        reportText += "\n";
      });
    }

    // SWOT分析
    if (swotData) {
      reportText += `## 五、SWOT分析\n\n`;
      for (const [compKey, swot] of Object.entries(swotData)) {
        const compName = compKey === "leadong" ? leadong?.name || "领动" : globalso?.name || "全球搜";
        const s = swot as any;
        reportText += `### ${compName}\n\n`;
        if (s.strengths?.length) reportText += `**优势（S）：** ${s.strengths.join("、")}\n\n`;
        if (s.weaknesses?.length) reportText += `**劣势（W）：** ${s.weaknesses.join("、")}\n\n`;
        if (s.opportunities?.length) reportText += `**机会（O）：** ${s.opportunities.join("、")}\n\n`;
        if (s.threats?.length) reportText += `**威胁（T）：** ${s.threats.join("、")}\n\n`;
      }
    }

    // 多竞品矩阵
    if (competitorMatrix?.competitors?.length && competitorMatrix?.dimensions?.length) {
      reportText += `## 六、多竞品对比矩阵\n\n`;
      const comps = competitorMatrix.competitors;
      const dims = competitorMatrix.dimensions;

      reportText += `| 维度 | ${comps.map((c: any) => c.name).join(" | ")} |\n`;
      reportText += `|------| ${comps.map(() => "------").join(" | ")} |\n`;
      dims.forEach((dim: any) => {
        const scores = comps.map((c: any) => dim.scores[c.id] ?? "-");
        reportText += `| ${dim.name} | ${scores.join(" | ")} |\n`;
      });

      // 均分
      const avgScores = comps.map((c: any) => {
        const total = dims.reduce((s: number, d: any) => s + (d.scores[c.id] ?? 50), 0);
        return Math.round(total / dims.length);
      });
      reportText += `| **综合均分** | ${avgScores.join(" | ")} |\n\n`;
    }

    res.json({
      success: true,
      markdown: reportText,
      filename: `竞品分析报告_${new Date().toLocaleDateString("zh-CN").replace(/\//g, "-")}.md`,
    });
  } catch (err: any) {
    console.error("Export error:", err);
    res.status(500).json({ error: err.message || "导出失败" });
  }
}
