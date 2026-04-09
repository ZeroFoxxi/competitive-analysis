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
    const { companies, comparisonData, radarData, keyMetrics, winRate, swotData } = req.body;

    if (!companies || !comparisonData) {
      return res.status(400).json({ error: "Missing required data" });
    }

    const leadong = companies.leadong;
    const globalso = companies.globalso;

    // Summarize radar scores with diff
    const radarSummary = radarData
      ? radarData
          .map((d: { dimension: string; leadong: number; globalso: number }) => {
            const diff = d.leadong - d.globalso;
            const status = diff > 0 ? `领动领先${diff}分` : diff < 0 ? `全球搜领先${Math.abs(diff)}分` : "持平";
            return `${d.dimension}：领动${d.leadong} vs 全球搜${d.globalso}（${status}）`;
          })
          .join("\n")
      : "";

    // Category win/loss
    const categorySummary = comparisonData
      .map((cat: { category: string; items: { winner: string; name: string; note: string }[] }) => {
        const leadongWins = cat.items.filter((i: { winner: string }) => i.winner === "leadong").length;
        const globalsoWins = cat.items.filter((i: { winner: string }) => i.winner === "globalso").length;
        const ties = cat.items.filter((i: { winner: string }) => i.winner === "tie").length;
        // Include key items
        const keyItems = cat.items
          .filter((i: { winner: string }) => i.winner !== "tie")
          .slice(0, 2)
          .map((i: { name: string; winner: string; note: string }) => `  - ${i.name}（${i.winner === "leadong" ? "领动胜" : "全球搜胜"}）：${i.note}`)
          .join("\n");
        return `【${cat.category}】领动胜${leadongWins}项，全球搜胜${globalsoWins}项，持平${ties}项\n${keyItems}`;
      })
      .join("\n\n");

    // SWOT summary for leadong
    const swotSummary = swotData?.leadong
      ? `领动优势：${swotData.leadong.strengths?.slice(0, 3).join("；")}\n领动劣势：${swotData.leadong.weaknesses?.slice(0, 3).join("；")}`
      : "";

    const prompt = `你是一位专业的外贸营销行业战略顾问。请根据以下竞品分析数据，为【领动】生成一份深度战略建议报告。

## 基本信息
- 领动（${leadong?.product || "臻选版"}）：年费${leadong?.price ? Math.round(leadong.price / 10000) + "万元" : "未知"}
- 全球搜（${globalso?.product || "SEO Plus"}）：年费${globalso?.price ? Math.round(globalso.price / 10000) + "万元" : "未知"}

## 综合胜率
领动胜出${winRate?.leadongWins || 0}项，全球搜胜出${winRate?.globalsoWins || 0}项，持平${winRate?.ties || 0}项（共${winRate?.total || 0}项）

## 各维度雷达评分
${radarSummary}

## 各类别详细对比
${categorySummary}

## SWOT摘要
${swotSummary}

请生成以下内容，返回严格的JSON格式（不要有任何其他文字）：

{
  "overallStatus": "领先" | "持平" | "落后",
  "overallScore": <综合评分0-100的整数>,
  "strategySummary": "<50字以内的核心竞争策略一句话总结>",
  "strategyDetail": "<150字以内的策略详细说明，要有洞察力和行动指导性>",
  "recommendations": [
    {
      "priority": "高" | "中" | "低",
      "area": "<改进领域名称>",
      "title": "<建议标题，15字以内>",
      "detail": "<具体建议内容，80-120字，要有数据支撑和可执行的行动方案>"
    }
  ]
}

要求：
1. recommendations 生成4-6条，按优先级从高到低排列
2. 每条建议要具体可执行，不要泛泛而谈
3. 结合具体数据（如评分差值、胜负项数）来支撑建议
4. 语言专业、简洁、有洞察力`;

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

    const strategy = JSON.parse(content);
    return res.status(200).json({ strategy });
  } catch (err: unknown) {
    console.error("generate-strategy error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
