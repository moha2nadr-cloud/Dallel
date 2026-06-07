import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FALLBACK_PROMPT = `أنت "مساعد دليل"، مساعد ذكي ودود من NOVA STUDIO. أجب باختصار وبشكل مفيد.`;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const sendChat = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      messages: z.array(MessageSchema).min(1).max(40),
      systemPrompt: z.string().min(1).max(8000).optional(),
      model: z.string().min(1).max(120).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY غير متوفر");
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: data.model || "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: data.systemPrompt || FALLBACK_PROMPT },
          ...data.messages,
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("تم تجاوز الحد المسموح، حاول لاحقًا");
      if (res.status === 402) throw new Error("نفدت الأرصدة، أضف رصيدًا من إعدادات Lovable AI");
      throw new Error(`خطأ في المساعد (${res.status}): ${text.slice(0, 120)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = json.choices?.[0]?.message?.content?.trim() ?? "";
    return { reply };
  });