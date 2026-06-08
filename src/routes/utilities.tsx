import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { useCMS, type UtilityItem, type CatItem } from "@/lib/admin-store";
import { useLang } from "@/lib/i18n";
import { Search, X, Wrench, ExternalLink, Copy, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPublicUtilities, getPublicUtilCategories } from "@/lib/api/sync.functions";

export const Route = createFileRoute("/utilities")({
  head: () => ({ meta: [{ title: "الأدوات — دليل" }] }),
  component: Utilities,
});

function Utilities() {
  const [, t] = useLang();
  const [cms] = useCMS();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  // Load from DB
  const [dbUtils, setDbUtils] = useState<UtilityItem[]>([]);
  const [dbCats,  setDbCats]  = useState<CatItem[]>([]);
  const [loaded,  setLoaded]  = useState(false);
  const fetchUtils = useServerFn(getPublicUtilities);
  const fetchCats  = useServerFn(getPublicUtilCategories);

  useEffect(() => {
    Promise.all([fetchUtils(), fetchCats()])
      .then(([utils, cats]) => { setDbUtils(utils); setDbCats(cats); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const tools    = loaded && dbUtils.length > 0 ? dbUtils : cms.utilities;
  const cats     = loaded && dbCats.length  > 0 ? dbCats  : cms.utilCategories;
  const catNames = useMemo(() => {
    const fromItems = tools.map((x) => x.category).filter(Boolean);
    const fromCats  = cats.map((c) => (typeof c === "string" ? c : c.name));
    return Array.from(new Set([...fromCats, ...fromItems]));
  }, [tools, cats]);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return tools.filter((x) => {
      if (cat !== "all" && x.category !== cat) return false;
      return !n || x.name.toLowerCase().includes(n) || (x.description ?? "").toLowerCase().includes(n);
    });
  }, [tools, q, cat]);

  return (
    <WithBottomBar>
      <Header />

      <div className="px-4 pt-2 pb-1 animate-reveal-up">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search_tools}
            className="w-full rounded-2xl py-3 pr-10 pl-10 text-[13px] text-gray-800 placeholder:text-gray-400 lg-input" />
          {q && (
            <button type="button" onClick={() => setQ("")} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {catNames.length > 0 && (
          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Chip active={cat === "all"} onClick={() => setCat("all")}>{t.all}</Chip>
            {catNames.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
          </div>
        )}
      </div>

      <main className="px-4 pb-4">
        {!loaded ? (
          <ul className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="skeleton-lg rounded-2xl" style={{ height: 88 }} />
            ))}
          </ul>
        ) : tools.length === 0 ? (
          <Empty />
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-gray-400">{t.no_results}</p>
        ) : (
          <ul className="space-y-2.5">
            {filtered.map((x, idx) => <UtilCard key={x.id} x={x} delay={idx * 0.04} index={idx} />)}
          </ul>
        )}
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
      }>
      {children}
    </button>
  );
}

function UtilCard({ x, delay = 0, index = 0 }: { x: UtilityItem; delay?: number; index?: number }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(x.url); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {}
  };
  const displayUrl = x.url.replace(/^https?:\/\//, "").replace(/\/$/, "").slice(0, 32) +
    (x.url.replace(/^https?:\/\//, "").length > 32 ? "…" : "");

  return (
    <li className="animate-reveal-up" style={{ animationDelay: `${delay}s` }}>
      <div className="lg-card relative flex overflow-hidden rounded-2xl" style={{ minHeight: 88 }}>
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.90),transparent)" }} />

        {/* Icon — RIGHT (first in RTL) */}
        <div className="flex shrink-0 items-center justify-center"
          style={{ width: 78, background: "rgba(255,255,255,0.60)", borderLeft: "1px solid rgba(200,195,185,0.18)" }}>
          <div className="flex items-center justify-center overflow-hidden rounded-2xl"
            style={{ width: 50, height: 50, background: "rgba(255,255,255,0.92)", border: "1px solid rgba(200,195,185,0.28)", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            {x.icon
              ? <img src={x.icon} alt={x.name} className="object-contain" style={{ width: 32, height: 32 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              : <Wrench className="h-6 w-6" style={{ color: "#B5A898" }} />
            }
          </div>
        </div>

        {/* Text — LEFT */}
        <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-[13.5px] font-extrabold text-gray-900 line-clamp-1 flex-1 leading-snug" title={x.name}>
              {x.name}
            </h3>
            <span className="shrink-0 leading-none select-none"
              style={{ fontSize: 22, fontWeight: 900, color: "#B5A898", opacity: 0.78, fontFamily: "Tajawal, sans-serif", marginRight: 2 }}>
              {(index ?? 0) + 1}
            </span>
          </div>
          <p className="text-[10px] truncate" style={{ color: "#9090A8", marginTop: 2, marginBottom: 4 }}>
            {displayUrl}
          </p>
          <div className="flex gap-1.5">
            <a href={x.url} target="_blank" rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded-xl text-[11px] font-bold text-white transition-lg"
              style={{ padding: "6px 4px", background: "#1A1A24", boxShadow: "0 2px 8px rgba(0,0,0,0.22)" }}>
              <ExternalLink className="h-3 w-3" /> فتح
            </a>
            <button type="button" onClick={handleCopy}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition-lg"
              style={{ padding: "6px 4px", background: "rgba(255,255,255,0.85)", border: "1px solid rgba(200,195,185,0.32)", color: copied ? "#059669" : "#1A1A24", boxShadow: "0 1px 5px rgba(0,0,0,0.05)" }}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "تم!" : "نسخ"}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function Empty() {
  return (
    <div className="lg-card mx-auto mt-10 flex max-w-xs flex-col items-center rounded-3xl p-10 text-center">
      <Wrench className="h-8 w-8 text-logo" />
      <p className="mt-3 text-sm text-gray-500">لا توجد أدوات بعد</p>
    </div>
  );
}
