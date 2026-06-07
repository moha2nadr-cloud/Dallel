import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Bot, Send, Trash2, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { sendChat } from "@/lib/chat.functions";
import { type ChatMessage, clearChatHistory, getChatHistory, setChatHistory, getUserId } from "@/lib/storage";
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = getChatHistory();
    if (stored.length > 0) {
      const lastTs = stored[stored.length - 1].ts;
      if (Date.now() - lastTs > 1800000) {
        clearChatHistory();
        setMessages([]);
        return;
      }
    }
    setMessages(stored);
  }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: ChatMessage = { role: "user", content: trimmed, ts: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next); setChatHistory(next); setInput(""); setLoading(true);
    try {
      const res = await send({ data: { messages: next.map(({ role, content }) => ({ role, content })), systemPrompt: cms.chatSystemPrompt, model: cms.chatModel } });
      const bot: ChatMessage = { role: "assistant", content: res.reply || "تعذّر الحصول على رد.", ts: Date.now() };
      const after = [...next, bot];
      setMessages(after); setChatHistory(after);
      const userId = getUserId();
      if (userId) doSyncChat({ data: { userId, messages: after } }).catch(() => {});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
      setMessages(next);
    } finally { setLoading(false); }
  }

  return (
    <WithBottomBar>
      <div className="flex h-[calc(100dvh-140px)] flex-col">

        {/* Chat header — kept as user requested */}
        <header className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="lg-card relative flex h-11 w-11 items-center justify-center rounded-2xl">
              <Bot className="h-5 w-5 text-logo" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white" style={{ background: "#4ade80" }} />
            </div>
            <div>
              <h1 className="text-[15px] font-extrabold text-gray-900">مساعد دليل</h1>
              <p className="text-[10px] text-gray-400">يجيب عن أسئلتك داخل التطبيق</p>
            </div>
          </div>
          <button type="button" disabled={!messages.length}
            onClick={() => setDeleteOpen(true)}
            className="lg-card flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-30" aria-label="مسح">
            <Trash2 className="h-4 w-4 text-gray-400" />
          </button>
          {deleteOpen && (
            <div onClick={() => setDeleteOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div onClick={e => e.stopPropagation()} className="mx-4 w-[280px] rounded-2xl bg-white px-5 py-5 text-center shadow-lg">
                <p className="text-[14px] font-bold text-gray-900">مسح المحادثة؟</p>
                <p className="mt-1 text-[11px] text-gray-500">سيتم حذف جميع الرسائل.</p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => setDeleteOpen(false)}
                    className="flex-1 rounded-xl border border-[rgba(200,195,185,0.28)] bg-white py-2 text-[12px] font-semibold text-gray-600">
                    إلغاء
                  </button>
                  <button type="button" onClick={() => { clearChatHistory(); setMessages([]); setDeleteOpen(false); }}
                    className="flex-1 rounded-xl bg-red-500 py-2 text-[12px] font-bold text-white"
                    style={{ boxShadow: "0 4px 14px rgba(239,68,68,0.35)" }}>
                    احذف
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-2 no-scrollbar">
          {messages.length === 0 && (
            <div className="pt-6 animate-reveal-up">
              <div className="lg-card mb-5 rounded-3xl p-5 text-center">
                <div className="lg-shine-stripe mb-3" />
                <Sparkles className="mx-auto mb-2 h-8 w-8 text-logo" />
                <p className="text-[13px] font-semibold text-gray-800">كيف يمكنني مساعدتك اليوم؟</p>
                <p className="mt-1 text-[11px] text-gray-400">ابدأ بسؤال أو جرّب أحد الاقتراحات أدناه</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTIONS.map((s, idx) => (
                  <button key={s} type="button" onClick={() => ask(s)}
                    className="lg-card rounded-2xl px-4 py-3 text-right text-[12.5px] font-medium text-gray-700 transition-lg active:scale-[0.98] animate-reveal-up"
                    style={{ animationDelay: `${idx * 0.07}s` }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, idx) => (
            <div key={idx} className={"flex " + (m.role === "user" ? "justify-start" : "justify-end")}>
              <div className="max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed"
                style={m.role === "user"
                  ? { background: "linear-gradient(135deg,#B5A898,#8B7D6F)", color: "#fff", boxShadow: "0 4px 14px rgba(181,168,152,0.35)" }
                  : { background: "rgba(255,255,255,0.82)", border: "1px solid rgba(200,195,185,0.28)", color: "#2E2E3A", backdropFilter: "blur(16px)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }
                }>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-end">
              <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[12px] text-gray-500"
                style={{ background: "rgba(255,255,255,0.82)", border: "1px solid rgba(200,195,185,0.28)", backdropFilter: "blur(16px)" }}>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-logo" /> يكتب…
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-3 py-3 lg-header">
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5 lg-input">
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
              placeholder="اكتب رسالتك…"
              className="flex-1 bg-transparent px-2 py-2 text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
              dir="rtl"
            />
            <button type="button" onClick={() => ask(input)} disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-lg active:scale-90 disabled:opacity-35"
              style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 10px rgba(181,168,152,0.40)" }}
              aria-label="إرسال">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </WithBottomBar>
  );
}
