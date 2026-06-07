import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { useCMS, type AiToolItem } from "@/lib/admin-store";
import { isFav, toggleFav, getFavs, getUserId } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Search, X, ExternalLink, Copy, Check, Inbox } from "lucide-react";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { syncFavorites } from "@/lib/api/sync.functions";

export const Route = createFileRoute("/ai-tools")({
  head: () => ({ meta: [{ title: "أدوات AI — دليل" }] }),
  component: AiTools,
});

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
      return !n || x.name.toLowerCase().includes(n) || (x.description ?? "").toLowerCase().includes(n);
    });
  }, [cms.aiTools, q, cat]);

  const handleFav = (id: string) => {
    const r = toggleFav("ai", id);
    if (userId) doSyncFavs({ data: { userId, kind: "ai", itemIds: getFavs("ai") } }).catch(() => {});
    return r;
  };

  return (
    <WithBottomBar>
      <Header />

      <div className="px-4 pt-2 pb-1 animate-reveal-up">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search_ai}
            className="w-full rounded-2xl py-3 pr-10 pl-10 text-[13px] text-gray-800 placeholder:text-gray-400 lg-input"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
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

      <main className="px-4 pb-4">
        {cms.aiTools.length === 0 ? <Empty text={t.no_data} /> :
          filtered.length === 0
            ? <p className="mt-12 text-center text-sm text-gray-400">{t.no_results}</p>
            : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((x, idx) => (
                  <ToolCard key={x.id} t={x} onFav={handleFav} delay={idx * 0.04} index={idx} />
                ))}
              </div>
            )
        }
      </main>
    </WithBottomBar>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-lg"
      style={active
        ? { background: "linear-gradient(135deg,#B5A898,#8B7D6F)", color: "#fff", border: "1px solid transparent", boxShadow: "0 4px 12px rgba(181,168,152,0.32)" }
        : { background: "rgba(255,255,255,0.72)", border: "1px solid rgba(200,195,185,0.32)", color: "#6E6E82", backdropFilter: "blur(12px)" }
      }
    >
      {children}
    </button>
  );
}

function ToolCard({ t: x, onFav, delay = 0, index = 0 }: { t: AiToolItem; onFav: (id: string) => boolean; delay?: number; index?: number }) {
  const [copied, setCopied] = useState(false);
  const href = x.url.startsWith("http") ? x.url : `https://${x.url}`;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(href); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {}
  };

  return (
    <div
      className="lg-card relative flex flex-col rounded-3xl animate-reveal-up"
      style={{ aspectRatio: "1 / 1", padding: "12px 12px 10px", animationDelay: `${delay}s` }}
    >
      <div className="lg-shine-stripe mb-1.5" />

      {/* NUMBER — top-right corner (start in RTL) */}
      <span
        className="absolute top-2.5 right-3 select-none leading-none"
        style={{ fontSize: 26, fontWeight: 900, color: "#B5A898", opacity: 0.80, fontVariantNumeric: "tabular-nums", fontFamily: "Tajawal, sans-serif" }}
      >
        {index + 1}
      </span>

      {/* NAME + subtitle */}
      <div style={{ paddingRight: "38px", minHeight: 34 }}>
        <h3 className="text-[12.5px] font-extrabold text-gray-900 leading-tight line-clamp-1" title={x.name}>
          {x.name}
        </h3>
        <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5 leading-tight">
          {x.description || x.category}
        </p>
      </div>

      {/* LARGE ICON — centered */}
      <div className="flex flex-1 items-center justify-center py-1">
        <div
          className="flex items-center justify-center overflow-hidden rounded-[18px]"
          style={{ width: 56, height: 56, background: "rgba(255,255,255,0.92)", border: "1px solid rgba(200,195,185,0.28)", boxShadow: "0 3px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.98)" }}
        >
          {x.icon
            ? <img src={x.icon} alt={x.name} className="object-contain" style={{ width: 36, height: 36 }} />
            : <span style={{ fontSize: 22, fontWeight: 900, color: "#B5A898", fontFamily: "Tajawal,sans-serif" }}>{x.name[0]}</span>
          }
        </div>
      </div>

      {/* CATEGORY BADGE */}
      <div className="flex justify-center mb-2">
        <span className="rounded-full px-3 py-0.5 text-[10px] font-semibold"
          style={{ background: "rgba(255,205,50,0.14)", color: "#7A6010", border: "1px solid rgba(255,200,50,0.28)" }}>
          {x.category || "عام"}
        </span>
      </div>

      {/* BUTTONS: فتح + نسخ */}
      <div className="flex gap-1.5">
        <a href={href} target="_blank" rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1 rounded-2xl text-[11px] font-bold text-white"
          style={{ padding: "8px 4px", background: "#1A1A24", boxShadow: "0 2px 8px rgba(0,0,0,0.22)" }}>
          <ExternalLink className="h-[13px] w-[13px]" />
          فتح
        </a>
        <button type="button" onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition-lg"
          style={{ padding: "8px 4px", background: "rgba(255,255,255,0.85)", border: "1px solid rgba(200,195,185,0.35)", color: copied ? "#059669" : "#1A1A24", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          {copied ? <Check className="h-[13px] w-[13px]" /> : <Copy className="h-[13px] w-[13px]" />}
          {copied ? "تم!" : "نسخ"}
        </button>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="lg-card mx-auto mt-10 flex max-w-xs flex-col items-center rounded-3xl p-10 text-center">
      <Inbox className="h-8 w-8 text-logo" />
      <p className="mt-3 text-sm text-gray-500">{text}</p>
    </div>
  );
}
