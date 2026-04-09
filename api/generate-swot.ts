import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { companies, comparisonData, radarData, keyMetrics, winRate } = req.body;

    if (!companies || !comparisonData) {
      return res.status(400).json({ error: "Missing required data" });
    }

    // Build a concise summary of the comparison data
    const leadong = companies.leadong;
    const globalso = companies.globalso;

    // Summarize radar scores
    const radarSummary = radarData
      ? radarData
          .map((d: { dimension: string; leadong: number; globalso: number }) =>
            `${d.dimension}：领动${d.leadong}分 vs 全球搜${d.globalso}分`
          )
          .join("；")
      : "";

    // Summarize win/loss by category
    const categorySummary = comparisonData
      .map((cat: { category: string; items: { winner: string }[] }) => {
        const leadongWins = cat.items.filter((i: { winner: string }) => i.winner === "leadong").length;
        const globalsoWins = cat.items.filter((i: { winner: string }) => i.winner === "globalso").length;
        const ties = cat.items.filter((i: { winner: string }) => i.winner === "tie").length;
        return `${cat.category}（领动胜${leadongWins}项，全球搜胜${globalsoWins}项，持平${ties}项）`;
      })
      .join("；");

    // Key metrics summary
    const metricsSummary = keyMetrics
      ? keyMetrics
          .map((m: { label: string; leadong: string | number; globalso: string | number }) =>
            `${m.label}：领动${m.leadong} vs 全球搜${m.globalso}`
          )
          .join("；")
      : "";

    const prompt = `你是一位专业的外贸营销行业竞品分析师。请根据以下竞品对比数据，为两家公司分别生成专业的SWOT分析。

## 基本信息
- 领动（${leadong?.product || "臻选版"}）：年费${leadong?.price ? Math.round(leadong.price / 10000) + "万元" : "未知"}，定位：${leadong?.positioning || ""}
- 全球搜（${globalso?.product || "SEO Plus"}）：年费${globalso?.price ? Math.round(globalso.price / 10000) + "万元" : "未知"}，定位：${globalso?.positioning || ""}

## 综合胜率
领动胜出${winRate?.leadongWins || 0}项，全球搜胜出${winRate?.globalsoWins || 0}项，持平${winRate?.ties || 0}项，共${winRate?.total || 0}项

## 各维度雷达评分
${radarSummary}

## 各类别胜负统计
${categorySummary}

## 关键指标对比
${metricsSummary}

请为两家公司分别生成SWOT分析，每个象限3-5条，内容要具体、有洞察力、基于数据。

返回严格的JSON格式（不要有任何其他文字）：
{
  "leadong": {
    "strengths": ["...", "...", "..."],
    "weaknesses": ["...", "...", "..."],
    "opportunities": ["...", "...", "..."],
    "threats": ["...", "...", "..."]
  },
  "globalso": {
    "strengths": ["...", "...", "..."],
    "weaknesses": ["...", "...", "..."],
    "opportunities": ["...", "...", "..."],
    "threats": ["...", "...", "..."]
  }
}`;

    const completion = await client.chat.completions.create({
      model: "qwen3-max",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: "AI returned empty response" });
    }

    const swot = JSON.parse(content);
    return res.status(200).json({ swot });
  } catch (err: unknown) {
    console.error("generate-swot error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
