import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

interface CompetitorInput {
  id: string;
  name: string;
  price: number;
  positioning: string;
  currentScores: Record<string, number>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { competitors, dimensions } = req.body as {
    competitors: CompetitorInput[];
    dimensions: string[];
  };

  if (!competitors?.length || !dimensions?.length) {
    return res.status(400).json({ error: "缺少竞品或维度数据" });
  }

  // 构建竞品描述
  const competitorDesc = competitors
    .map(
      (c) =>
        `- ${c.name}：年价¥${c.price?.toLocaleString() || "未知"}，定位：${c.positioning || "未填写"}`
    )
    .join("\n");

  const dimList = dimensions.map((d, i) => `${i + 1}. ${d}`).join("\n");

  const prompt = `你是专业的竞品分析师。请根据以下竞品信息，为每个竞品在各评估维度上打分（0-100分）。

评分标准：
- 0-30：明显弱势
- 31-50：低于平均
- 51-70：接近平均
- 71-85：高于平均
- 86-100：明显优势

竞品列表：
${competitorDesc}

评估维度：
${dimList}

要求：
1. 评分要有区分度，不同竞品在同一维度的分数应该有差异
2. 根据价格、定位和行业常识推断各维度能力
3. 严格输出JSON，格式如下：

{
  "results": [
    {
      "competitorId": "竞品id",
      "competitorName": "竞品名称",
      "scores": {
        "维度名称": 分数,
        ...
      }
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "qwen-plus",
      messages: [
        { role: "system", content: "你是专业竞品分析师，只输出JSON，不要任何解释文字。" },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let parsed: any = {};
    try {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    } catch {
      return res.status(500).json({ error: "AI返回格式错误，请重试", raw });
    }

    if (!parsed.results?.length) {
      return res.status(500).json({ error: "AI未返回有效评分数据" });
    }

    // 将竞品id映射回去（AI可能只返回名称）
    const results = parsed.results.map((r: any) => {
      const comp = competitors.find(
        (c) => c.id === r.competitorId || c.name === r.competitorName
      );
      return {
        competitorId: comp?.id || r.competitorId,
        competitorName: r.competitorName || comp?.name,
        scores: r.scores || {},
      };
    });

    res.json({ success: true, data: results });
  } catch (err: any) {
    console.error("Matrix score error:", err);
    res.status(500).json({ error: err.message || "评分失败" });
  }
}
