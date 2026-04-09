import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { apiKey, baseURL, model } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: "缺少 API Key" });
  }

  try {
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL || undefined,
    });

    const completion = await client.chat.completions.create({
      model: model || "qwen3-max",
      messages: [
        {
          role: "user",
          content: '请回复"连接成功"四个字，不要任何其他内容。',
        },
      ],
      max_tokens: 20,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "OK";
    return res.status(200).json({ ok: true, reply });
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "未知错误";
    return res.status(200).json({ ok: false, error: errMsg });
  }
}
