import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { useCMS, type UtilityItem } from "@/lib/admin-store";
import { useLang } from "@/lib/i18n";
import { Search, X, ChevronLeft, Wrench } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/utilities")({
  head: () => ({ meta: [{ title: "الأدوات — دليل" }] }),
  component: Utilities,
});

function Utilities() {
  const [, t] = useLang();
  const [cms] = useCMS();
  const [q, setQ]   = useState("");
  const [cat, setCat] = useState("all");

  const cats = useMemo(() => {
    const from = Array.from(new Set(cms.utilities.map((x) => x.category).filter(Boolean)));
    return Array.from(new Set([...cms.utilCategories, ...from]));
  }, [cms.utilities, cms.utilCategories]);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return cms.utilities.filter((x) => {
      if (cat !== "all" && x.category !== cat) return false;
      return !n || x.name.toLowerCase().includes(n) || (x.description ?? "").toLowerCase().includes(n);
    });
  }, [cms.utilities, q, cat]);

  return (
    <WithBottomBar>
      <Header />

      {/* ── Search at very top ── */}
      <div className="px-4 pt-2 pb-2 animate-reveal-up">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search_tools}
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
        {cms.utilities.length === 0 ? <Empty /> :
          filtered.length === 0 ? <p className="mt-12 text-center text-sm text-gray-400">{t.no_results}</p> : (
            <ul className="space-y-2">
              {filtered.map((x, idx) => <Row key={x.id} x={x} useLabel={t.use} delay={idx * 0.04} />)}
            </ul>
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

function Row({ x, useLabel, delay = 0 }: { x: UtilityItem; useLabel: string; delay?: number }) {
  return (
    <li className="animate-reveal-up" style={{ animationDelay: `${delay}s` }}>
      <a href={x.url} target="_blank" rel="noopener noreferrer"
        className="lg-card flex items-center gap-3 rounded-2xl p-3.5 transition-lg">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
          style={{ background: "rgba(255,255,255,0.90)", border: "1px solid rgba(200,195,185,0.28)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          {x.icon ? <img src={x.icon} alt="" className="h-full w-full object-cover" /> : <Wrench className="h-5 w-5 text-logo" />}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-gray-800">{x.name}</p>
          {x.description && <p className="line-clamp-1 text-[11px] text-gray-500">{x.description}</p>}
        </div>
        <span className="rounded-full px-3 py-1 text-[10px] font-bold text-white"
          style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 8px rgba(181,168,152,0.32)" }}>
          {useLabel}
        </span>
        <ChevronLeft className="h-4 w-4 text-gray-300" />
      </a>
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
