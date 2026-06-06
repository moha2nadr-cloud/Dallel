import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { Bot, Send, Trash2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { sendChat } from "@/lib/chat.functions";
import {
  type ChatMessage,
  clearChatHistory,
  getChatHistory,
  setChatHistory,
} from "@/lib/storage";
import { toast } from "sonner";
import { useCMS } from "@/lib/admin-store";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "المساعد الذكي — دليل" }] }),
  component: Chat,
});

const SUGGESTIONS = [
  "اقترح لي أداة AI لتلخيص المحاضرات",
  "ما هي أدوات الذكاء الاصطناعي لطلاب الطب؟",
  "كيف أحوّل PDF إلى Word؟",
  "اقترح خطة دراسة لأسبوع الامتحانات",
];

function Chat() {
  const send = useServerFn(sendChat);
  const [cms] = useCMS();
  const [, t] = useLang();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(getChatHistory());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: ChatMessage = { role: "user", content: trimmed, ts: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setChatHistory(next);
    setInput("");
    setLoading(true);
    try {
      const res = await send({
        data: {
          messages: next.map(({ role, content }) => ({ role, content })),
          systemPrompt: cms.chatSystemPrompt,
          model: cms.chatModel,
        },
      });
      const botMsg: ChatMessage = {
        role: "assistant",
        content: res.reply || "تعذّر الحصول على رد.",
        ts: Date.now(),
      };
      const after = [...next, botMsg];
      setMessages(after);
      setChatHistory(after);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
      setMessages(next);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    if (!messages.length) return;
    if (confirm("هل تريد مسح المحادثة؟")) {
      clearChatHistory();
      setMessages([]);
    }
  }

  return (
    <WithBottomBar>
      <Header />
      <div className="flex h-[calc(100dvh-140px)] flex-col">
        <header className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 ring-1 ring-gold/30">
              <Bot className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-cream">مساعد دليل</h1>
              <p className="text-[10px] text-muted-foreground">يجيب عن أسئلتك داخل التطبيق</p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition active:scale-95"
            aria-label="مسح"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.length === 0 && (
            <div className="pt-6">
              <p className="mb-3 text-center text-[12px] text-muted-foreground">
                ابدأ بسؤال أو جرّب أحد الاقتراحات
              </p>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="rounded-2xl border border-border bg-card px-4 py-3 text-right text-[12.5px] font-medium text-cream transition active:scale-[0.98] hover:border-gold/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                "flex " + (m.role === "user" ? "justify-start" : "justify-end")
              }
            >
              <div
                className={
                  "max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed " +
                  (m.role === "user"
                    ? "bg-gold text-ink"
                    : "border border-border bg-card text-cream")
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-end">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-[12px] text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                يكتب…
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="border-t border-border bg-card/60 px-3 py-3 backdrop-blur"
        >
          <div className="flex items-center gap-2 rounded-full border border-border bg-ink px-3 py-1.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك…"
              className="flex-1 bg-transparent px-2 py-2 text-[13.5px] text-cream outline-none placeholder:text-muted-foreground"
              dir="rtl"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-ink transition active:scale-95 disabled:opacity-40"
              aria-label="إرسال"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </WithBottomBar>
  );
}