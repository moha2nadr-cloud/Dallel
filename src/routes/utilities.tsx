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
      <div className="px-5 pt-5">
        <h1 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-gold to-gold-soft" />
          {t.utilities}
        </h1>
        <p className="mt-1 text-[12px] text-muted-foreground">أدوات سريعة للملفات والحسابات والمهام الطلابية</p>
      </div>
      <div className="sticky top-[64px] z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search_tools}
            className="w-full rounded-2xl border border-border bg-card py-3 pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {cats.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          <p className="mt-12 text-center text-sm text-muted-foreground">{t.no_results}</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
            {filtered.map((x) => <Row key={x.id} x={x} useLabel={t.use} />)}
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
      className={
        "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition " +
        (active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-foreground/80 hover:border-primary/40")
      }
    >
      {children}
    </button>
  );
}

function Row({ x, useLabel }: { x: UtilityItem; useLabel: string }) {
  return (
    <li>
      <a
        href={x.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 transition hover:bg-muted/40 active:bg-muted/60"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 ring-1 ring-primary/25">
          {x.icon ? (
            <img src={x.icon} alt="" className="h-full w-full object-cover" />
          ) : (
            <Wrench className="h-5 w-5 text-primary" />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-foreground">{x.name}</p>
          {x.description && (
            <p className="line-clamp-1 text-[12px] text-muted-foreground">{x.description}</p>
          )}
        </div>
        <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">{useLabel}</span>
        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      </a>
    </li>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="mx-auto mt-10 flex max-w-xs flex-col items-center rounded-3xl border border-dashed border-border p-10 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}