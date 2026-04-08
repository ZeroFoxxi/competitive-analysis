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
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
    const data = await pdfParse(buffer);
    return data.text;
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

      const truncated = text.slice(0, 12000);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
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
}
无法提取的字段填null。`,
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
      const { leadongData, globalsoData, currentComparison } = req.body;
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
        model: "gpt-4.1-mini",
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
