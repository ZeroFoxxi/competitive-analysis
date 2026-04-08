import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { IncomingForm } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

async function extractText(filePath: string, filename: string): Promise<string> {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  const buffer = fs.readFileSync(filePath);

  if (ext === "pdf") {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === "docx" || ext === "doc") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (ext === "xlsx" || ext === "xls") {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    let text = "";
    workbook.SheetNames.forEach((name) => {
      const sheet = workbook.Sheets[name];
      text += XLSX.utils.sheet_to_csv(sheet) + "\n";
    });
    return text;
  }

  // txt / csv
  return buffer.toString("utf-8");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new IncomingForm({ maxFileSize: 20 * 1024 * 1024 });

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      return res.status(400).json({ error: "文件上传失败: " + err.message });
    }

    const fileArr = files.file;
    const file = Array.isArray(fileArr) ? fileArr[0] : fileArr;
    if (!file) {
      return res.status(400).json({ error: "未收到文件" });
    }

    try {
      const text = await extractText(file.filepath, file.originalFilename || "file.txt");
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
        filename: file.originalFilename,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      res.status(500).json({ error: err.message || "文件处理失败" });
    }
  });
}
