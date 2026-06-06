import { createFileRoute, Link } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { HeroSlider } from "@/components/HeroSlider";
import { timeAgoAr } from "@/lib/mock-data";
import { useCMS, type Post } from "@/lib/admin-store";
import { toggleLike, getLikes, toggleFav, isFav } from "@/lib/storage";
import { Heart, MessageCircle, Bookmark, ExternalLink, Inbox } from "lucide-react";
import { useMemo, useState } from "react";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "الرئيسية — دليل" },
      { name: "description", content: "اكتشف أدوات الذكاء الاصطناعي والأدوات الطلابية." },
    ],
  }),
  component: Home,
});

function Home() {
  const [, t] = useLang();
  const [cms] = useCMS();
  const suggested = useMemo(() => cms.aiTools.slice(0, 8), [cms.aiTools]);
  const sliderItems = useMemo(
    () => cms.slides.map((s) => ({ id: s.id, title: s.title || "", image: s.image, url: s.link })),
    [cms.slides],
  );

  return (
    <WithBottomBar>
      <Header />
      <main className="space-y-7 pb-4">
        <section className="px-4 pt-4">
          <HeroSlider slides={sliderItems} />
        </section>

        {suggested.length > 0 && (
          <section>
            <SectionHeader title={t.suggested_for_you} to="/ai-tools" viewAll={t.view_all} />
            <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {suggested.map((tool) => (
                <a
                  key={tool.id}
                  href={tool.url.startsWith("http") ? tool.url : `https://${tool.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-[140px] shrink-0 flex-col items-center justify-between rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40"
                  style={{ minHeight: 160 }}
                >
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 ring-1 ring-primary/25">
                    {tool.icon ? (
                      <img src={tool.icon} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-base font-extrabold text-primary">{tool.name[0]}</span>
                    )}
                  </div>
                  <p className="line-clamp-2 mt-2 text-center text-[12px] font-semibold text-foreground">{tool.name}</p>
                  <span className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">{t.open}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="px-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <span className="h-4 w-1 rounded-full bg-gradient-to-b from-gold to-gold-soft" />
            {t.feed}
          </h2>
          {cms.posts.length === 0 ? (
            <EmptyState text={t.no_data} />
          ) : (
            <div className="space-y-4">
              {cms.posts.map((p) => <PostCard key={p.id} p={p} />)}
            </div>
          )}
        </section>
      </main>
    </WithBottomBar>
  );
}

function SectionHeader({ title, to, viewAll }: { title: string; to: string; viewAll: string }) {
  return (
    <div className="mb-3 flex items-center justify-between px-5">
      <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="h-4 w-1 rounded-full bg-gradient-to-b from-gold to-gold-soft" />
        {title}
      </h2>
      <Link to={to} className="text-[11px] font-semibold text-primary">{viewAll}</Link>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-12 text-center">
      <Inbox className="h-7 w-7 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function PostCard({ p }: { p: Post }) {
  const [liked, setLiked] = useState<boolean>(() => !!getLikes()[p.id]);
  const [likes, setLikes] = useState(p.likes ?? 0);
  const [saved, setSaved] = useState<boolean>(() => isFav("post", p.id));
  const [expanded, setExpanded] = useState(false);

  const badge = { new: "أداة جديدة", tip: "نصيحة", update: "تحديث", ai: "AI" }[p.type];
  const badgeColor = {
    new: "bg-emerald-500/15 text-emerald-300",
    tip: "bg-sky-500/15 text-sky-300",
    update: "bg-violet-500/15 text-violet-300",
    ai: "bg-primary/20 text-primary",
  }[p.type];

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card">
      {p.image && (
        <div className="w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
          <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badgeColor}`}>{badge}</span>
          <span className="text-[10px] text-muted-foreground">{timeAgoAr(p.date)}</span>
        </div>
        <h3 className="mt-2.5 text-[15px] font-bold text-foreground">{p.title}</h3>
        <p className={"mt-1.5 text-[13px] leading-relaxed text-muted-foreground " + (expanded ? "" : "line-clamp-3")}>
          {p.description}
        </p>
        {!expanded && p.description.length > 100 && (
          <button type="button" onClick={() => setExpanded(true)} className="mt-1 text-[12px] font-semibold text-primary">
            اقرأ المزيد
          </button>
        )}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => { const n = toggleLike(p.id); setLiked(n); setLikes((x) => x + (n ? 1 : -1)); }}
              className="flex items-center gap-1 rounded-full bg-background px-3 py-1.5"
            >
              <Heart className={"h-4 w-4 " + (liked ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
              <span className="text-[11px] text-foreground/90">{likes}</span>
            </button>
            <button type="button" className="flex items-center gap-1 rounded-full bg-background px-3 py-1.5">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-[11px] text-foreground/90">{p.comments ?? 0}</span>
            </button>
            <button
              type="button"
              onClick={() => setSaved(toggleFav("post", p.id))}
              className="flex items-center gap-1 rounded-full bg-background px-3 py-1.5"
              aria-label="حفظ"
            >
              <Bookmark className={"h-4 w-4 " + (saved ? "fill-primary text-primary" : "text-muted-foreground")} />
            </button>
          </div>
          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground"
            >
              جرّب الآن
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}