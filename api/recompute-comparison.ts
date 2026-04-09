import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { leadongData, globalsoData, currentComparison, aiConfig } = req.body;
    // 优先使用前端传入的配置，否则使用环境变量
    const apiKey = aiConfig?.apiKey || process.env.OPENAI_API_KEY;
    const baseURL = aiConfig?.baseURL || process.env.OPENAI_BASE_URL || undefined;
    const model = aiConfig?.model || "qwen3-max";
    const openai = new OpenAI({ apiKey, baseURL });
    if (!leadongData || !globalsoData) {
      return res.status(400).json({ error: "缺少竞品数据" });
    }

    const context = `
【领动臻选版 最新数据】
年度价格：${(leadongData.price || 0).toLocaleString()}元
产品定位：${leadongData.positioning || ""}
核心指标：${JSON.stringify(leadongData.metrics || {})}
主要功能：${JSON.stringify(leadongData.features || {})}

【全球搜SEO Plus 最新数据】
年度价格：${(globalsoData.price || 0).toLocaleString()}元
产品定位：${globalsoData.positioning || ""}
核心指标：${JSON.stringify(globalsoData.metrics || {})}
主要功能：${JSON.stringify(globalsoData.features || {})}

【当前对比项参考（请更新数值和胜出方）】
${JSON.stringify((currentComparison || []).slice(0, 4), null, 2)}
`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `你是专业竞品对比分析助手。根据最新数据重新生成完整对比分析，严格输出JSON，不要任何解释文字。
格式：
{
  "categories": [
    {
      "category": "类别名",
      "icon": "emoji",
      "items": [
        {
          "name": "对比项名称",
          "leadong": "领动的具体描述（含数字）",
          "globalso": "全球搜的具体描述（含数字）",
          "winner": "leadong或globalso或tie",
          "note": "一句话分析说明"
        }
      ]
    }
  ]
}
必须包含8个类别：价格与性价比、网站建设、SEO优化服务、内容营销、AI与数智化、广告投放、客户管理工具、服务模式。
winner规则：更优的一方胜出；相当填tie。`,
        },
        { role: "user", content: `根据以下最新数据重新生成完整对比分析：\n\n${context}` },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let parsed: any = {};
    try {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    } catch {
      return res.status(500).json({ error: "AI重算结果格式错误，请重试", raw });
    }

    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Recompute error:", err);
    res.status(500).json({ error: err.message || "重算失败" });
  }
}
