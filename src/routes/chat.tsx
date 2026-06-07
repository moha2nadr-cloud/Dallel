import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Bot, Send, Trash2, Loader2, Sparkles, MessagesSquare } from "lucide-react";
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
  { icon: Sparkles, text: "اقترح لي أداة AI لتلخيص المحاضرات" },
  { icon: MessagesSquare, text: "ما هي أدوات الذكاء الاصطناعي لطلاب الطب؟" },
  { icon: Sparkles, text: "كيف أحوّل PDF إلى Word؟" },
  { icon: MessagesSquare, text: "اقترح خطة دراسة لأسبوع الامتحانات" },
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
      <div className="flex h-[calc(100dvh-140px)] flex-col bg-white">

        {/* Header */}
        <div className="px-5 pt-3 pb-2">
          <div className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(200,195,185,0.25)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", backdropFilter: "blur(16px)" }}>
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg,rgba(181,168,152,0.15),rgba(139,125,111,0.10))" }}>
                <Bot className="h-5 w-5 text-[#8B7D6F]" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white" style={{ background: "#4ade80" }} />
              </div>
              <div>
                <h1 className="text-[14px] font-extrabold text-gray-900 leading-tight">مساعد دليل</h1>
                <p className="text-[10px] text-gray-400 leading-tight">ذكاء اصطناعي — يجيب عن أسئلتك</p>
              </div>
            </div>
            <button type="button" disabled={!messages.length}
              onClick={() => setDeleteOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 hover:bg-red-50 disabled:opacity-20 disabled:hover:bg-transparent"
              style={{ border: "1px solid rgba(200,195,185,0.20)" }}>
              <Trash2 className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </div>
          {deleteOpen && (
            <div onClick={() => setDeleteOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
              <div onClick={e => e.stopPropagation()} className="mx-4 w-[320px] rounded-2xl bg-white px-6 py-6 text-center shadow-lg animate-scale-in">
                <p className="text-[15px] font-bold text-gray-900">مسح المحادثة؟</p>
                <p className="mt-1.5 text-[12px] text-gray-500">سيتم حذف جميع الرسائل. لا يمكن التراجع.</p>
                <div className="mt-5 flex gap-3">
                  <button type="button" onClick={() => setDeleteOpen(false)}
                    className="flex-1 rounded-xl border border-[rgba(200,195,185,0.28)] bg-white py-2.5 text-[12px] font-semibold text-gray-600">
                    إلغاء
                  </button>
                  <button type="button" onClick={() => { clearChatHistory(); setMessages([]); setDeleteOpen(false); }}
                    className="flex-1 rounded-xl bg-red-500 py-2.5 text-[12px] font-bold text-white"
                    style={{ boxShadow: "0 4px 14px rgba(239,68,68,0.35)" }}>
                    احذف
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 pb-2 no-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-12 animate-reveal-up">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg,rgba(181,168,152,0.12),rgba(139,125,111,0.08))" }}>
                <Bot className="h-8 w-8 text-[#B5A898]" />
              </div>
              <h2 className="text-[17px] font-extrabold text-gray-900">كيف يمكنني مساعدتك؟</h2>
              <p className="mt-1 text-[12px] text-gray-400">اختر اقتراحاً أو اكتب سؤالك</p>
              <div className="mt-6 grid w-full max-w-sm grid-cols-1 gap-2.5">
                {SUGGESTIONS.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <button key={s.text} type="button" onClick={() => ask(s.text)}
                      className="group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-right transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-reveal-up"
                      style={{
                        background: "rgba(255,255,255,0.85)",
                        border: "1px solid rgba(200,195,185,0.25)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        animationDelay: `${idx * 0.08}s`,
                      }}>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: "linear-gradient(135deg,rgba(181,168,152,0.12),rgba(139,125,111,0.08))" }}>
                        <Icon className="h-4 w-4 text-[#8B7D6F]" />
                      </span>
                      <span className="text-[12.5px] font-medium text-gray-700 leading-snug">{s.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {messages.map((m, idx) => (
            <div key={idx} className={"flex " + (m.role === "user" ? "justify-start" : "justify-end") + " animate-reveal-up"}
              style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
                style={m.role === "user"
                  ? { background: "linear-gradient(135deg,#B5A898,#8B7D6F)", color: "#fff", boxShadow: "0 4px 14px rgba(181,168,152,0.35)" }
                  : { background: "rgba(255,255,255,0.85)", border: "1px solid rgba(200,195,185,0.25)", color: "#2E2E3A", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }
                }>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-end animate-reveal-up">
              <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[12px] text-gray-500"
                style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(200,195,185,0.25)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <span className="flex gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B5A898] animate-bounce" style={{ animationDelay: "0s" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B5A898] animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B5A898] animate-bounce" style={{ animationDelay: "0.3s" }} />
                </span>
                <span>يكتب…</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-5 pt-1">
          <div className="flex items-center gap-2 rounded-2xl px-4 py-1.5"
            style={{ background: "rgba(255,255,255,0.90)", border: "1px solid rgba(200,195,185,0.30)", boxShadow: "0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)" }}>
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
              placeholder="اكتب رسالتك…"
              className="flex-1 bg-transparent px-1 py-2.5 text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
              dir="rtl"
            />
            <button type="button" onClick={() => ask(input)} disabled={loading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition-all duration-200 active:scale-90 disabled:opacity-30"
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
