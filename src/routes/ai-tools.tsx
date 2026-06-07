import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { useCMS, type AiToolItem } from "@/lib/admin-store";
import { isFav, toggleFav, getFavs, getUserId } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Search, X, Star, ExternalLink, Inbox } from "lucide-react";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { syncFavorites } from "@/lib/api/sync.functions";

export const Route = createFileRoute("/ai-tools")({
  head: () => ({ meta: [{ title: "أدوات الذكاء الاصطناعي — دليل" }] }),
  component: AiTools,
});

const cardSx: React.CSSProperties = {
  background: "linear-gradient(148deg, rgba(200,228,252,0.13) 0%, rgba(140,190,238,0.07) 100%)",
  border: "1px solid rgba(255,255,255,0.20)",
  backdropFilter: "blur(28px) saturate(190%)",
  WebkitBackdropFilter: "blur(28px) saturate(190%)",
  boxShadow: "0 6px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
};

function AiTools() {
  const [, t] = useLang();
  const [cms] = useCMS();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const doSyncFavs = useServerFn(syncFavorites);
  const userId = typeof window !== "undefined" ? getUserId() : null;

  const cats = useMemo(() => {
    const from = Array.from(new Set(cms.aiTools.map((x) => x.category).filter(Boolean)));
    return Array.from(new Set([...cms.aiCategories, ...from]));
  }, [cms.aiTools, cms.aiCategories]);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return cms.aiTools.filter((x) => {
      if (cat !== "all" && x.category !== cat) return false;
      if (!n) return true;
      return x.name.toLowerCase().includes(n) || (x.description ?? "").toLowerCase().includes(n);
    });
  }, [cms.aiTools, q, cat]);

  const handleFav = (id: string) => {
    const r = toggleFav("ai", id);
    if (userId) doSyncFavs({ data: { userId, kind: "ai", itemIds: getFavs("ai") } }).catch(() => {});
    return r;
  };

  const searchSx: React.CSSProperties = {
    background: "rgba(200,228,255,0.09)",
    border: "1px solid rgba(255,255,255,0.20)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    color: "rgba(215,235,252,0.95)",
    borderRadius: "1rem",
    padding: "0.7rem 2.5rem",
    fontSize: 13,
    width: "100%",
    outline: "none",
    fontFamily: "Tajawal, sans-serif",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
  };

  return (
    <WithBottomBar>
      <Header />

      <div className="px-5 pt-4 pb-3 animate-reveal-up">
        <h1 className="text-[20px] font-extrabold"
          style={{
            background: "linear-gradient(135deg, #e8f2fb 0%, #6b92ba 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}
        >
          {t.ai_tools}
        </h1>
        <p className="mt-0.5 text-[12px] text-[#6b92ba]">اكتشف أفضل أدوات الذكاء الاصطناعي للدراسة</p>
      </div>

      {/* Sticky bar */}
      <div
        className="sticky top-[58px] z-20 px-4 py-3"
        style={{
          background: "rgba(10,18,32,0.72)",
          backdropFilter: "blur(28px)",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.20)",
        }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a70a0]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search_ai} style={searchSx}
            onFocus={(e) => { e.target.style.borderColor = "rgba(107,146,186,0.60)"; e.target.style.boxShadow = "0 0 0 3px rgba(107,146,186,0.14), inset 0 1px 0 rgba(255,255,255,0.14)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.20)"; e.target.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.12)"; }}
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a70a0]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {cats.length > 0 && (
          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Chip active={cat === "all"} onClick={() => setCat("all")}>{t.all}</Chip>
            {cats.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
          </div>
        )}
      </div>

      <main className="px-4 py-4">
        {cms.aiTools.length === 0 ? (
          <Empty text={t.no_data} />
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-[#35577D]">{t.no_results}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((x, idx) => <ToolCard key={x.id} t={x} onFav={handleFav} delay={idx * 0.035} />)}
          </div>
        )}
      </main>
    </WithBottomBar>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick}
      className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-glass"
      style={active
        ? {
            background: "linear-gradient(135deg, rgba(200,228,252,0.22), rgba(107,146,186,0.18))",
            border: "1px solid rgba(255,255,255,0.30)",
            color: "#ffffff",
            boxShadow: "0 4px 12px rgba(53,87,125,0.28), inset 0 1px 0 rgba(255,255,255,0.20)",
          }
        : {
            background: "rgba(200,228,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "#6b92ba",
          }
      }
    >
      {children}
    </button>
  );
}

function ToolCard({ t: x, onFav, delay = 0 }: { t: AiToolItem; onFav: (id: string) => boolean; delay?: number }) {
  const [fav, setFav] = useState(() => isFav("ai", x.id));
  const [hov, setHov] = useState(false);
  const href = x.url.startsWith("http") ? x.url : `https://${x.url}`;

  return (
    <div
      className="flex flex-col gap-2 rounded-3xl p-3 transition-glass animate-reveal-up"
      style={{
        ...cardSx,
        transform: hov ? "translateY(-2px)" : "none",
        ...(hov ? {
          background: "linear-gradient(148deg, rgba(210,235,255,0.19) 0%, rgba(160,210,248,0.11) 100%)",
          border: "1px solid rgba(255,255,255,0.30)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.24)",
        } : {}),
        animationDelay: `${delay}s`,
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      {/* Shine stripe */}
      <div className="h-px w-full rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.20), transparent)" }} />

      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl"
          style={{
            background: "rgba(200,228,255,0.14)",
            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
          }}
        >
          {x.icon
            ? <img src={x.icon} alt="" className="h-full w-full object-cover" />
            : <span className="text-sm font-extrabold text-[#c4d8ea]">{x.name[0]}</span>
          }
        </div>
        <button type="button" onClick={() => setFav(onFav(x.id))} className="p-1 transition-transform hover:scale-110" aria-label="تفضيل">
          <Star className={"h-4 w-4 " + (fav ? "fill-[#6b92ba] text-[#6b92ba]" : "text-[#35577D]")} />
        </button>
      </div>

      <p className="line-clamp-1 text-[12px] font-bold text-[#d7ebfc]">{x.name}</p>
      <p className="line-clamp-1 text-[10px] text-[#4a70a0]">{x.category}</p>

      <a
        href={href} target="_blank" rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-1 rounded-full py-1.5 text-[11px] font-bold text-white transition-glass"
        style={{
          background: "linear-gradient(135deg, #35577D, #4a70a0)",
          boxShadow: "0 2px 8px rgba(53,87,125,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        فتح <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div
      className="mx-auto mt-10 flex max-w-xs flex-col items-center rounded-3xl p-10 text-center"
      style={{ background: "rgba(200,228,255,0.05)", border: "1px dashed rgba(107,146,186,0.28)" }}
    >
      <Inbox className="h-8 w-8 text-[#35577D]" />
      <p className="mt-3 text-sm text-[#6b92ba]">{text}</p>
    </div>
  );
}
