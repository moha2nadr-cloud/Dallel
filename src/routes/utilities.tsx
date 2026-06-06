import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { useCMS, type UtilityItem } from "@/lib/admin-store";
import { useLang } from "@/lib/i18n";
import { Search, X, ChevronLeft, Wrench, Inbox } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/utilities")({
  head: () => ({ meta: [{ title: "الأدوات — دليل" }] }),
  component: Utilities,
});

function Utilities() {
  const [, t] = useLang();
  const [cms] = useCMS();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const cats = useMemo(() => {
    const fromItems = Array.from(new Set(cms.utilities.map((x) => x.category).filter(Boolean)));
    return Array.from(new Set([...cms.utilCategories, ...fromItems]));
  }, [cms.utilities, cms.utilCategories]);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return cms.utilities.filter((x) => {
      if (cat !== "all" && x.category !== cat) return false;
      if (!n) return true;
      return x.name.toLowerCase().includes(n) || (x.description ?? "").toLowerCase().includes(n);
    });
  }, [cms.utilities, q, cat]);

  return (
    <WithBottomBar>
      <Header />

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
          {t.utilities}
        </h1>
        <p className="mt-0.5 text-[12px] text-[#6b92ba]">أدوات سريعة للملفات والحسابات والمهام الطلابية</p>
      </div>

      {/* Sticky search */}
      <div
        className="sticky top-[60px] z-20 px-4 py-3"
        style={{
          background: "rgba(14,22,37,0.75)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b92ba]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search_tools}
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
            <button type="button" onClick={() => setQ("")} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b92ba]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {cats.length > 0 && (
          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Chip active={cat === "all"} onClick={() => setCat("all")}>{t.all}</Chip>
            {cats.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
            ))}
          </div>
        )}
      </div>

      <main className="px-4 py-3">
        {cms.utilities.length === 0 ? (
          <Empty text={t.no_data} />
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-[#35577D]">{t.no_results}</p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((x, idx) => (
              <Row key={x.id} x={x} useLabel={t.use} delay={idx * 0.04} />
            ))}
          </ul>
        )}
      </main>
    </WithBottomBar>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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

function Row({ x, useLabel, delay = 0 }: { x: UtilityItem; useLabel: string; delay?: number }) {
  return (
    <li
      className="animate-reveal-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <a
        href={x.url}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-card flex items-center gap-3 rounded-2xl p-3.5 transition-glass"
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
          style={{
            background: "rgba(53,87,125,0.25)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          {x.icon ? (
            <img src={x.icon} alt="" className="h-full w-full object-cover" />
          ) : (
            <Wrench className="h-5 w-5 text-[#96b8d6]" />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#c4d8ea]">{x.name}</p>
          {x.description && (
            <p className="line-clamp-1 text-[11px] text-[#6b92ba]">{x.description}</p>
          )}
        </div>
        <span
          className="rounded-full px-3 py-1 text-[10px] font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #35577D, #4a70a0)",
            boxShadow: "0 2px 8px rgba(53,87,125,0.35)",
          }}
        >
          {useLabel}
        </span>
        <ChevronLeft className="h-4 w-4 text-[#35577D]" />
      </a>
    </li>
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
