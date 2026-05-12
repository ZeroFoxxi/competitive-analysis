import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(pdf|docx|doc|xlsx|xls|txt|csv)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("不支持的文件格式，请上传 PDF、Word、Excel 或 TXT 文件"));
    }
  },
});

async function extractText(buffer: Buffer, mimetype: string, filename: string): Promise<string> {
  const ext = (filename.split(".").pop() || "").toLowerCase();

  if (ext === "pdf" || mimetype === "application/pdf") {
    try {
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
      const data = await pdfParse(buffer);
      return data.text;
    } catch (pdfErr: any) {
      // pdf-parse 某些特殊PDF会崩溃，给出友好错误
      console.error("PDF parse error:", pdfErr.message);
      throw new Error(`PDF解析失败：${pdfErr.message || "文件格式异常或加密"}。请尝试使用文本较少的PDF或转换为TXT后上传。`);
    }
  }

  if (ext === "docx" || ext === "doc" || mimetype.includes("word")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (ext === "xlsx" || ext === "xls" || mimetype.includes("excel") || mimetype.includes("spreadsheet")) {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    let text = "";
    workbook.SheetNames.forEach((name) => {
      const sheet = workbook.Sheets[name];
      text += `\n=== ${name} ===\n${XLSX.utils.sheet_to_csv(sheet)}`;
    });
    return text;
  }

  return buffer.toString("utf-8");
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "10mb" }));

  // ---- API: 上传文档提取竞品数据 ----
  app.post("/api/upload-document", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "未收到文件" });

      const text = await extractText(req.file.buffer, req.file.mimetype, req.file.originalname);
      if (!text || text.trim().length < 30) {
        return res.status(400).json({ error: "文件内容为空或无法读取" });
      }

      // 文本截断保护：12000字符以内，防止超出API token限制
      const MAX_TEXT_LENGTH = 12000;
      const truncated = text.slice(0, MAX_TEXT_LENGTH);
      const wasTruncated = text.length > MAX_TEXT_LENGTH;

      // 读取前端传来的AI配置（如果有），否则使用服务端默认
      let aiConfig: any = null;
      try {
        aiConfig = JSON.parse(req.body.aiConfig || "null");
      } catch {}

      const useCustomAI = aiConfig && aiConfig.apiKey;
      const model = useCustomAI ? (aiConfig.model || "qwen3-max") : "gpt-4.1-mini";
      const apiKey = useCustomAI ? aiConfig.apiKey : process.env.OPENAI_API_KEY;
      const baseURL = useCustomAI ? aiConfig.baseURL : (process.env.OPENAI_BASE_URL || undefined);

      if (!apiKey) {
        return res.status(400).json({ error: "未配置API Key，请先在AI配置面板中填写您的API Key" });
      }

      const client = new OpenAI({ apiKey, baseURL });

      // 读取前端传来的矩阵维度名称
      let dimNames: string[] = [];
      try {
        dimNames = JSON.parse(req.body.dimensionNames || "[]");
      } catch {}

      const dimensionPrompt = dimNames.length > 0
        ? `此外，请根据文档内容推断该竞品在以下矩阵维度的评分（0-100），加入"dimensionScores"字段：${dimNames.join("、")}`
        : "";

      const truncatedNotice = wasTruncated
        ? "\n⚠️ 注意：文档内容较长已被截断，请基于已有内容尽力提取。"
        : "";

      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `你是专业竞品分析数据提取助手。从文档中提取竞品信息，严格输出JSON，不要任何解释文字。
格式：
{
  "companyName": "公司名",
  "productName": "产品名",
  "price": 数字（年度价格，元，如198000），
  "phone": "电话",
  "positioning": "一句话定位",
  "features": {
    "网站建设": ["特性1","特性2"],
    "SEO优化": ["特性1"],
    "内容营销": ["特性1"],
    "AI能力": ["特性1"],
    "广告投放": ["特性1"],
    "客户管理": ["特性1"],
    "服务模式": ["特性1"]
  },
  "keyMetrics": {
    "年度内容产出": {"value": 数字, "unit": "篇/年"},
    "外链建设": {"value": 数字, "unit": "条/年"},
    "关键词排名": {"value": 数字, "unit": "个"},
    "服务响应时间": {"value": 数字, "unit": "小时"}
  },
  "strengths": ["优势1","优势2","优势3"],
  "weaknesses": ["劣势1","劣势2"],
  "summary": "整体评价2-3句"
}${dimensionPrompt}
无法提取的字段填null。${truncatedNotice}`,
          },
          { role: "user", content: `从以下文档提取竞品信息：\n\n${truncated}` },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      let parsed: any = {};
      try {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
      } catch {
        return res.status(500).json({ error: "AI解析结果格式错误，请重试", raw });
      }

      res.json({
        success: true,
        data: parsed,
        preview: text.slice(0, 300) + (text.length > 300 ? "…" : ""),
        filename: req.file.originalname,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      res.status(500).json({ error: err.message || "文件处理失败" });
    }
  });

  // ---- API: 基于最新数据AI重算对比分析 ----
  app.post("/api/recompute-comparison", async (req, res) => {
    try {
      const { leadongData, globalsoData, currentComparison, aiConfig: clientAiConfig } = req.body;
      if (!leadongData || !globalsoData) {
        return res.status(400).json({ error: "缺少竞品数据" });
      }

      // 读取前端传来的AI配置（如果有），否则使用服务端默认
      const useCustomAI = clientAiConfig && clientAiConfig.apiKey;
      const model = useCustomAI ? (clientAiConfig.model || "qwen3-max") : "gpt-4.1-mini";
      const apiKey = useCustomAI ? clientAiConfig.apiKey : process.env.OPENAI_API_KEY;
      const baseURL = useCustomAI ? clientAiConfig.baseURL : (process.env.OPENAI_BASE_URL || undefined);

      if (!apiKey) {
        return res.status(400).json({ error: "未配置API Key，请先在AI配置面板中填写您的API Key" });
      }

      const client = new OpenAI({ apiKey, baseURL });

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

      const completion = await client.chat.completions.create({
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
  });

  // ---- API: 测试AI配置连接 ----
  app.post("/api/test-ai-config", async (req, res) => {
    try {
      const { apiKey, baseURL, model } = req.body;
      if (!apiKey) return res.status(400).json({ ok: false, error: "缺少 API Key" });

      const client = new OpenAI({
        apiKey,
        baseURL: baseURL || undefined,
      });

      const completion = await client.chat.completions.create({
        model: model || "qwen3-max",
        messages: [{ role: "user", content: "回复：连接成功" }],
        max_tokens: 20,
      });

      const reply = completion.choices[0]?.message?.content || "";
      res.json({ ok: true, reply });
    } catch (err: any) {
      console.error("Test AI config error:", err.message);
      res.status(200).json({
        ok: false,
        error: err.message || "连接失败",
      });
    }
  });

  // ---- API: AI生成SWOT分析 ----
  app.post("/api/generate-swot", async (req, res) => {
    try {
      const { companies, comparisonData, radarData, keyMetrics, winRate, aiConfig: clientAiConfig } = req.body;

      const useCustomAI = clientAiConfig && clientAiConfig.apiKey;
      const model = useCustomAI ? (clientAiConfig.model || "qwen3-max") : "gpt-4.1-mini";
      const apiKey = useCustomAI ? clientAiConfig.apiKey : process.env.OPENAI_API_KEY;
      const baseURL = useCustomAI ? clientAiConfig.baseURL : (process.env.OPENAI_BASE_URL || undefined);

      if (!apiKey) return res.status(400).json({ error: "未配置API Key" });

      const client = new OpenAI({ apiKey, baseURL });

      const context = `
【竞品基本信息】
领动：${companies?.leadong?.name || "焦点领动"}，年度价格${companies?.leadong?.price || 0}元，定位：${companies?.leadong?.positioning || ""}
全球搜：${companies?.globalso?.name || "全球搜"}，年度价格${companies?.globalso?.price || 0}元，定位：${companies?.globalso?.positioning || ""}

【核心指标】${JSON.stringify(keyMetrics || [])}
【雷达图评分】${JSON.stringify(radarData || [])}
【对比详情】${JSON.stringify((comparisonData || []).slice(0, 4), null, 2)}
【胜率分析】${JSON.stringify(winRate || {})}
`;

      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `你是专业竞品分析助手。根据提供的竞品数据，为两个竞品分别生成SWOT分析，严格输出JSON，不要任何解释文字。
格式：
{
  "leadong": {
    "strengths": ["优势1", "优势2", "优势3"],
    "weaknesses": ["劣势1", "劣势2"],
    "opportunities": ["机会1", "机会2"],
    "threats": ["威胁1", "威胁2"]
  },
  "globalso": {
    "strengths": ["优势1", "优势2", "优势3"],
    "weaknesses": ["劣势1", "劣势2"],
    "opportunities": ["机会1", "机会2"],
    "threats": ["威胁1", "威胁2"]
  }
}
每项3-5条，需具体、有数据支撑。`,
          },
          { role: "user", content: `根据以下数据生成SWOT分析：\n\n${context}` },
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
        return res.status(500).json({ error: "SWOT生成结果格式错误，请重试" });
      }

      res.json({ success: true, swot: parsed });
    } catch (err: any) {
      console.error("SWOT error:", err);
      res.status(500).json({ error: err.message || "SWOT生成失败" });
    }
  });

  // ---- API: AI生成战略建议 ----
  app.post("/api/generate-strategy", async (req, res) => {
    try {
      const { companies, comparisonData, radarData, keyMetrics, winRate, swotData, aiConfig: clientAiConfig } = req.body;

      const useCustomAI = clientAiConfig && clientAiConfig.apiKey;
      const model = useCustomAI ? (clientAiConfig.model || "qwen3-max") : "gpt-4.1-mini";
      const apiKey = useCustomAI ? clientAiConfig.apiKey : process.env.OPENAI_API_KEY;
      const baseURL = useCustomAI ? clientAiConfig.baseURL : (process.env.OPENAI_BASE_URL || undefined);

      if (!apiKey) return res.status(400).json({ error: "未配置API Key" });

      const client = new OpenAI({ apiKey, baseURL });

      const context = `
【竞品基本信息】
领动：${companies?.leadong?.name || "焦点领动"}，年度价格${companies?.leadong?.price || 0}元
全球搜：${companies?.globalso?.name || "全球搜"}，年度价格${companies?.globalso?.price || 0}元

【核心指标】${JSON.stringify(keyMetrics || [])}
【雷达图评分】${JSON.stringify(radarData || [])}
【对比详情】${JSON.stringify((comparisonData || []).slice(0, 4), null, 2)}
【胜率分析】${JSON.stringify(winRate || {})}
【SWOT分析】${JSON.stringify(swotData || {})}
`;

      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `你是专业竞品战略分析顾问。基于提供的竞品对比数据，给出针对领动的战略建议，严格输出JSON，不要任何解释文字。
格式：
{
  "coreAdvantage": "核心竞争优势总结（1句话）",
  "keyRisks": ["风险1", "风险2", "风险3"],
  "strategicActions": [
    { "action": "战略行动1", "priority": "high/medium/low", "reason": "原因" },
    { "action": "战略行动2", "priority": "high/medium/low", "reason": "原因" },
    { "action": "战略行动3", "priority": "high/medium/low", "reason": "原因" }
  ],
  "pricingStrategy": "定价策略建议（1-2句话）",
  "positioningAdvice": "定位建议（1-2句话）"
}`,
          },
          { role: "user", content: `根据以下数据给出战略建议：\n\n${context}` },
        ],
        temperature: 0.4,
        max_tokens: 2000,
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      let parsed: any = {};
      try {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
      } catch {
        return res.status(500).json({ error: "战略建议格式错误，请重试" });
      }

      res.json({ success: true, strategy: parsed });
    } catch (err: any) {
      console.error("Strategy error:", err);
      res.status(500).json({ error: err.message || "战略建议生成失败" });
    }
  });

  // ---- API: 矩阵AI评分 ----
  app.post("/api/matrix-score", async (req, res) => {
    try {
      const { competitors, dimensions, aiConfig: clientAiConfig } = req.body;

      const useCustomAI = clientAiConfig && clientAiConfig.apiKey;
      const model = useCustomAI ? (clientAiConfig.model || "qwen3-max") : "gpt-4.1-mini";
      const apiKey = useCustomAI ? clientAiConfig.apiKey : process.env.OPENAI_API_KEY;
      const baseURL = useCustomAI ? clientAiConfig.baseURL : (process.env.OPENAI_BASE_URL || undefined);

      if (!apiKey) return res.status(400).json({ error: "未配置API Key" });

      const client = new OpenAI({ apiKey, baseURL });

      const context = `
【矩阵维度】${JSON.stringify(dimensions)}
【竞品列表】${JSON.stringify(competitors)}
`;

      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `你是专业竞品分析评估助手。根据竞品信息，评估每个竞品在指定维度的评分（0-100），严格输出JSON数组，不要任何解释文字。
格式：
[
  { "id": "竞品ID", "name": "竞品名", "scores": { "维度1": 分数, "维度2": 分数, ... } },
  ...
]`,
          },
          { role: "user", content: `评估以下竞品的矩阵维度评分：\n\n${context}` },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      });

      const raw = completion.choices[0]?.message?.content || "[]";
      let parsed: any[] = [];
      try {
        const m = raw.match(/\[[\s\S]*\]/);
        if (m) parsed = JSON.parse(m[0]);
      } catch {
        return res.status(500).json({ error: "矩阵评分格式错误，请重试" });
      }

      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Matrix score error:", err);
      res.status(500).json({ error: err.message || "矩阵评分失败" });
    }
  });

  // ---- API: 导出Markdown报告 ----
  app.post("/api/export-report", async (req, res) => {
    try {
      const { companies, comparisonData, keyMetrics, radarData, swotData, competitorMatrix, winRateData } = req.body;

      // 服务端直接生成Markdown，不需要AI
      const leadongName = companies?.leadong?.name || "焦点领动";
      const globalsoName = companies?.globalso?.name || "全球搜";

      let md = `# 竞品分析报告\n\n`;
      md += `> 生成时间：${new Date().toLocaleString("zh-CN")}\n\n`;

      // 基本信息
      md += `## 基本信息\n\n`;
      md += `| 项目 | ${leadongName} | ${globalsoName} |\n`;
      md += `|------|------|------|\n`;
      md += `| 年度价格 | ¥${(companies?.leadong?.price || 0).toLocaleString()} | ¥${(companies?.globalso?.price || 0).toLocaleString()} |\n`;
      md += `| 产品定位 | ${companies?.leadong?.positioning || "-"} | ${companies?.globalso?.positioning || "-"} |\n\n`;

      // 关键指标
      if (keyMetrics?.length) {
        md += `## 关键指标\n\n`;
        md += `| 指标 | ${leadongName} | ${globalsoName} | 单位 |\n`;
        md += `|------|------|------|------|\n`;
        keyMetrics.forEach((m: any) => {
          md += `| ${m.label} | ${m.leadong} | ${m.globalso} | ${m.unit || ""} |\n`;
        });
        md += "\n";
      }

      // 对比详情
      if (comparisonData?.length) {
        md += `## 详细对比\n\n`;
        comparisonData.forEach((cat: any) => {
          md += `### ${cat.icon || ""} ${cat.category}\n\n`;
          md += `| 对比项 | ${leadongName} | ${globalsoName} | 胜出方 | 备注 |\n`;
          md += `|--------|------|------|------|------|\n`;
          cat.items?.forEach((item: any) => {
            const winner = item.winner === "leadong" ? leadongName : item.winner === "globalso" ? globalsoName : "持平";
            md += `| ${item.name} | ${item.leadong} | ${item.globalso} | ${winner} | ${item.note || ""} |\n`;
          });
          md += "\n";
        });
      }

      // SWOT
      if (swotData) {
        md += `## SWOT分析\n\n`;
        ["leadong", "globalso"].forEach((key) => {
          const name = key === "leadong" ? leadongName : globalsoName;
          const data = (swotData as any)[key];
          if (data) {
            md += `### ${name}\n\n`;
            const labels: Record<string, string> = { strengths: "优势", weaknesses: "劣势", opportunities: "机会", threats: "威胁" };
            Object.entries(labels).forEach(([k, label]) => {
              const items = data[k] || [];
              md += `**${label}：**\n`;
              items.forEach((item: string) => { md += `- ${item}\n`; });
              md += "\n";
            });
          }
        });
      }

      // 矩阵
      if (competitorMatrix?.competitors?.length) {
        md += `## 多竞品对比矩阵\n\n`;
        const compNames = competitorMatrix.competitors.map((c: any) => c.name);
        md += `| 维度 | ${compNames.join(" | ")} |\n`;
        md += `|------|${compNames.map(() => "------").join("|")}|\n`;
        competitorMatrix.dimensions?.forEach((dim: any) => {
          const scores = competitorMatrix.competitors.map((c: any) => String(dim.scores?.[c.id] ?? "-"));
          md += `| ${dim.name} | ${scores.join(" | ")} |\n`;
        });
        md += "\n";
      }

      res.json({
        success: true,
        markdown: md,
        filename: `竞品分析报告_${new Date().toLocaleDateString("zh-CN").replace(/\//g, "-")}.md`,
      });
    } catch (err: any) {
      console.error("Export error:", err);
      res.status(500).json({ error: err.message || "导出失败" });
    }
  });

  // ---- Static files ----
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
