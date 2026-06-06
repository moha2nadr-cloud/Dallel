import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { useCMS, type AiToolItem } from "@/lib/admin-store";
import { isFav, toggleFav } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Search, X, Star, ExternalLink, Inbox } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/ai-tools")({
  head: () => ({ meta: [{ title: "أدوات الذكاء الاصطناعي — دليل" }] }),
  component: AiTools,
});

function AiTools() {
  const [, t] = useLang();
  const [cms] = useCMS();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

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

  return (
    <WithBottomBar>
      <Header />
      <div className="px-5 pt-5">
        <h1 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-gold to-gold-soft" />
          {t.ai_tools}
        </h1>
        <p className="mt-1 text-[12px] text-muted-foreground">اكتشف أفضل أدوات الذكاء الاصطناعي للدراسة</p>
      </div>
      <div className="sticky top-[64px] z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search_ai}
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

      <main className="px-4 py-4">
        {cms.aiTools.length === 0 ? (
          <Empty text={t.no_data} />
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">{t.no_results}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((x) => <ToolCard key={x.id} t={x} />)}
          </div>
        )}
      </main>
    </WithBottomBar>
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

function ToolCard({ t: x }: { t: AiToolItem }) {
  const [fav, setFav] = useState(() => isFav("ai", x.id));
  const href = x.url.startsWith("http") ? x.url : `https://${x.url}`;
  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-border bg-card p-3 transition hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 ring-1 ring-primary/25">
          {x.icon ? (
            <img src={x.icon} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-base font-extrabold text-primary">{x.name[0]}</span>
          )}
        </div>
        <button type="button" onClick={() => setFav(toggleFav("ai", x.id))} aria-label="favorite">
          <Star className={"h-4 w-4 " + (fav ? "fill-primary text-primary" : "text-muted-foreground")} />
        </button>
      </div>
      <p className="line-clamp-1 text-[13px] font-bold text-foreground">{x.name}</p>
      <p className="line-clamp-1 text-[10px] text-muted-foreground">{x.category}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center justify-center gap-1 rounded-full bg-primary py-1.5 text-[11px] font-bold text-primary-foreground"
      >
        فتح
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}