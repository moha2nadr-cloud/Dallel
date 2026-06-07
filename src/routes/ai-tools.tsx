import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { useCMS, type AiToolItem } from "@/lib/admin-store";
import { isFav, toggleFav, getFavs, getUserId } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Search, X, Star, ExternalLink, Inbox } from "lucide-react";
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
  const [q, setQ]   = useState("");
  const [cat, setCat] = useState("all");
  const [focused, setFocused] = useState(false);
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
      {/* ── Search at very top, no dark bg, crystal glass ── */}
      <div className="px-4 pt-2 pb-2 animate-reveal-up">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search_ai}
            className="w-full rounded-2xl py-3 pr-10 pl-10 text-[13px] text-gray-800 placeholder:text-gray-400 lg-input"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category chips */}
        {cats.length > 0 && (
          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Chip active={cat === "all"} onClick={() => setCat("all")}>{t.all}</Chip>
            {cats.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
          </div>
        )}
      </div>

      {/* Tools grid */}
      <main className="px-4 pb-4">
        {cms.aiTools.length === 0 ? <Empty text={t.no_data} /> :
          filtered.length === 0 ? <p className="mt-12 text-center text-sm text-gray-400">{t.no_results}</p> : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((x, idx) => <ToolCard key={x.id} t={x} onFav={handleFav} delay={idx * 0.035} />)}
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

function ToolCard({ t: x, onFav, delay = 0 }: { t: AiToolItem; onFav: (id: string) => boolean; delay?: number }) {
  const [fav, setFav] = useState(() => isFav("ai", x.id));
  const href = x.url.startsWith("http") ? x.url : `https://${x.url}`;
  return (
    <div className="lg-card flex flex-col gap-2 rounded-3xl p-3 animate-reveal-up" style={{ animationDelay: `${delay}s` }}>
      <div className="lg-shine-stripe" />
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl"
          style={{ background: "rgba(255,255,255,0.90)", border: "1px solid rgba(200,195,185,0.28)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          {x.icon ? <img src={x.icon} alt="" className="h-full w-full object-cover" /> : <span className="text-sm font-extrabold text-logo">{x.name[0]}</span>}
        </div>
        <button type="button" onClick={() => setFav(onFav(x.id))} className="p-1 transition-transform hover:scale-110" aria-label="تفضيل">
          <Star className={"h-4 w-4 " + (fav ? "fill-[#B5A898] text-[#B5A898]" : "text-gray-300")} />
        </button>
      </div>
      <p className="line-clamp-1 text-[12px] font-bold text-gray-800">{x.name}</p>
      <p className="line-clamp-1 text-[10px] text-gray-400">{x.category}</p>
      <a href={href} target="_blank" rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-1 rounded-full py-1.5 text-[11px] font-bold text-white transition-lg"
        style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 8px rgba(181,168,152,0.35)" }}>
        فتح <ExternalLink className="h-3 w-3" />
      </a>
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
