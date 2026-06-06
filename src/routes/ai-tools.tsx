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

function AiTools() {
  const [, t] = useLang();
  const [cms] = useCMS();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const doSyncFavs = useServerFn(syncFavorites);
  const userId = typeof window !== "undefined" ? getUserId() : null;

  const cats = useMemo(() => {
    const fromTools = Array.from(new Set(cms.aiTools.map((x) => x.category).filter(Boolean)));
    return Array.from(new Set([...cms.aiCategories, ...fromTools]));
  }, [cms.aiTools, cms.aiCategories]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cms.aiTools.filter((x) => {
      if (cat !== "all" && x.category !== cat) return false;
      if (!needle) return true;
      return (
        x.name.toLowerCase().includes(needle) ||
        (x.description ?? "").toLowerCase().includes(needle) ||
        x.category.toLowerCase().includes(needle)
      );
    });
  }, [cms.aiTools, q, cat]);

  const handleFav = (id: string) => {
    const result = toggleFav("ai", id);
    if (userId) {
      const items = getFavs("ai");
      doSyncFavs({ data: { userId, kind: "ai", itemIds: items } }).catch(() => {});
    }
    return result;
  };

  return (
    <WithBottomBar>
      <Header />

      {/* Page Header */}
      <div className="px-5 pt-4 pb-3 animate-reveal-up">
        <h1
          className="text-[20px] font-extrabold"
          style={{
            background: "linear-gradient(135deg, #d2e6fa 0%, #6b92ba 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {t.ai_tools}
        </h1>
        <p className="mt-0.5 text-[12px] text-[#6b92ba]">اكتشف أفضل أدوات الذكاء الاصطناعي للدراسة</p>
      </div>

      {/* Sticky Search + Filters */}
      <div
        className="sticky top-[60px] z-20 px-4 py-3"
        style={{
          background: "rgba(14,22,37,0.75)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Search bar */}
        <div className="relative">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b92ba]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search_ai}
            className="w-full rounded-2xl py-3 pr-10 pl-10 text-[13px] text-[#d2e6fa] placeholder:text-[#35577D] transition-glass"
            style={{
              background: "rgba(53,87,125,0.12)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(74,112,160,0.50)";
              e.target.style.boxShadow = "0 0 0 3px rgba(53,87,125,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.08)";
              e.target.style.boxShadow = "none";
            }}
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b92ba] hover:text-[#96b8d6]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category chips */}
        {cats.length > 0 && (
          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Chip active={cat === "all"} onClick={() => setCat("all")}>{t.all}</Chip>
            {cats.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
            ))}
          </div>
        )}
      </div>

      {/* Tools grid */}
      <main className="px-4 py-4">
        {cms.aiTools.length === 0 ? (
          <Empty text={t.no_data} />
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-[#35577D]">{t.no_results}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((x, idx) => (
              <ToolCard key={x.id} t={x} onFav={handleFav} delay={idx * 0.035} />
            ))}
          </div>
        )}
      </main>
    </WithBottomBar>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div
      className="mx-auto mt-10 flex max-w-xs flex-col items-center rounded-3xl p-10 text-center"
      style={{
        background: "rgba(53,87,125,0.06)",
        border: "1px dashed rgba(107,146,186,0.25)",
      }}
    >
      <Inbox className="h-8 w-8 text-[#35577D]" />
      <p className="mt-3 text-sm text-[#6b92ba]">{text}</p>
    </div>
  );
}

function Chip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-glass"
      style={
        active
          ? {
              background: "linear-gradient(135deg, rgba(53,87,125,0.55), rgba(74,112,160,0.45))",
              border: "1px solid rgba(255,255,255,0.16)",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(53,87,125,0.30)",
            }
          : {
              background: "rgba(53,87,125,0.10)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#6b92ba",
            }
      }
    >
      {children}
    </button>
  );
}

function ToolCard({
  t: x, onFav, delay = 0,
}: { t: AiToolItem; onFav: (id: string) => boolean; delay?: number }) {
  const [fav, setFav] = useState(() => isFav("ai", x.id));
  const href = x.url.startsWith("http") ? x.url : `https://${x.url}`;

  return (
    <div
      className="glass-card flex flex-col gap-2 rounded-3xl p-3 transition-glass animate-reveal-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl"
          style={{
            background: "rgba(53,87,125,0.25)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          {x.icon ? (
            <img src={x.icon} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-extrabold text-[#96b8d6]">{x.name[0]}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setFav(onFav(x.id))}
          className="p-1 transition-transform hover:scale-110"
          aria-label="تفضيل"
        >
          <Star
            className={
              "h-4 w-4 " +
              (fav ? "fill-[#4a70a0] text-[#4a70a0]" : "text-[#35577D]")
            }
          />
        </button>
      </div>

      <p className="line-clamp-1 text-[12px] font-bold text-[#c4d8ea]">{x.name}</p>
      <p className="line-clamp-1 text-[10px] text-[#35577D]">{x.category}</p>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-1 rounded-full py-1.5 text-[11px] font-bold text-white transition-glass"
        style={{
          background: "linear-gradient(135deg, #35577D, #4a70a0)",
          boxShadow: "0 2px 8px rgba(53,87,125,0.40)",
        }}
      >
        فتح
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
