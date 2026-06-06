import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { Bot, Send, Trash2, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { sendChat } from "@/lib/chat.functions";
import {
  type ChatMessage,
  clearChatHistory,
  getChatHistory,
  setChatHistory,
  getUserId,
} from "@/lib/storage";
import { syncChat } from "@/lib/api/sync.functions";
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
  const doSyncChat = useServerFn(syncChat);
  const [cms] = useCMS();
  const [, t] = useLang();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMessages(getChatHistory()); }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function pushChatToServer(msgs: ChatMessage[]) {
    const userId = getUserId();
    if (!userId) return;
    try { await doSyncChat({ data: { userId, messages: msgs } }); } catch {}
  }

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
      const botMsg: ChatMessage = { role: "assistant", content: res.reply || "تعذّر الحصول على رد.", ts: Date.now() };
      const after = [...next, botMsg];
      setMessages(after);
      setChatHistory(after);
      pushChatToServer(after);
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
      const userId = getUserId();
      if (userId) doSyncChat({ data: { userId, messages: [] } }).catch(() => {});
    }
  }

  return (
    <WithBottomBar>
      <Header />
      <div className="flex h-[calc(100dvh-140px)] flex-col">

        {/* Chat header */}
        <header className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(145deg, rgba(53,87,125,0.40), rgba(20,30,48,0.50))",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 4px 16px rgba(53,87,125,0.30)",
              }}
            >
              <Bot className="h-5 w-5 text-[#96b8d6]" />
              {/* Online dot */}
              <span
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2"
                style={{
                  background: "#4ade80",
                  borderColor: "#141E30",
                  boxShadow: "0 0 6px rgba(74,222,128,0.55)",
                }}
              />
            </div>
            <div>
              <h1
                className="text-[15px] font-extrabold"
                style={{
                  background: "linear-gradient(135deg, #c4d8ea, #6b92ba)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                مساعد دليل
              </h1>
              <p className="text-[10px] text-[#35577D]">يجيب عن أسئلتك داخل التطبيق</p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-glass"
            style={{
              background: "rgba(53,87,125,0.12)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            aria-label="مسح"
          >
            <Trash2 className="h-4 w-4 text-[#6b92ba]" />
          </button>
        </header>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-2 no-scrollbar">
          {messages.length === 0 && (
            <div className="pt-6 animate-reveal-up">
              {/* Welcome card */}
              <div
                className="mb-5 rounded-3xl p-5 text-center"
                style={{
                  background: "linear-gradient(145deg, rgba(53,87,125,0.18), rgba(20,30,48,0.25))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <Sparkles className="mx-auto mb-2 h-8 w-8 text-[#4a70a0]" />
                <p className="text-[13px] font-semibold text-[#96b8d6]">
                  كيف يمكنني مساعدتك اليوم؟
                </p>
                <p className="mt-1 text-[11px] text-[#35577D]">
                  ابدأ بسؤال أو جرّب أحد الاقتراحات أدناه
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="glass-card rounded-2xl px-4 py-3 text-right text-[12.5px] font-medium text-[#c4d8ea] transition-glass animate-reveal-up active:scale-[0.98]"
                    style={{ animationDelay: `${idx * 0.07}s` }}
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
              className={"flex " + (m.role === "user" ? "justify-start" : "justify-end")}
            >
              <div
                className="max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed"
                style={
                  m.role === "user"
                    ? {
                        background: "linear-gradient(135deg, #35577D, #4a70a0)",
                        color: "#ffffff",
                        boxShadow: "0 4px 14px rgba(53,87,125,0.40)",
                      }
                    : {
                        background: "rgba(53,87,125,0.15)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#c4d8ea",
                        backdropFilter: "blur(12px)",
                      }
                }
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-end">
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[12px] text-[#6b92ba]"
                style={{
                  background: "rgba(53,87,125,0.15)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#4a70a0]" />
                يكتب…
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div
          className="px-3 py-3"
          style={{
            background: "rgba(14,22,37,0.75)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{
              background: "rgba(53,87,125,0.14)",
              border: "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(16px)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
              placeholder="اكتب رسالتك…"
              className="flex-1 bg-transparent px-2 py-2 text-[13px] text-[#c4d8ea] outline-none placeholder:text-[#35577D]"
              dir="rtl"
            />
            <button
              type="button"
              onClick={() => ask(input)}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all active:scale-90 disabled:opacity-35"
              style={{
                background: "linear-gradient(135deg, #35577D, #4a70a0)",
                boxShadow: "0 2px 10px rgba(53,87,125,0.45)",
              }}
              aria-label="إرسال"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </WithBottomBar>
  );
}
