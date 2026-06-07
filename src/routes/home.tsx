import { createFileRoute, Link } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { HeroSlider } from "@/components/HeroSlider";
import { timeAgoAr } from "@/lib/mock-data";
import { useCMS, type Post } from "@/lib/admin-store";
import { toggleLike, getLikes, toggleFav, isFav, getFavs, getUserId } from "@/lib/storage";
import { Heart, MessageCircle, Bookmark, ExternalLink, Inbox } from "lucide-react";
import { useMemo, useState } from "react";
import { useLang } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import { syncFavorites, syncLikes } from "@/lib/api/sync.functions";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "الرئيسية — دليل" },
      { name: "description", content: "اكتشف أدوات الذكاء الاصطناعي والأدوات الطلابية." },
    ],
  }),
  component: Home,
});

/* ── Shared glass surface used throughout this page ── */
const cardStyle: React.CSSProperties = {
  background: "linear-gradient(148deg, rgba(200,228,252,0.13) 0%, rgba(140,190,238,0.07) 100%)",
  border: "1px solid rgba(255,255,255,0.20)",
  backdropFilter: "blur(28px) saturate(190%)",
  WebkitBackdropFilter: "blur(28px) saturate(190%)",
  boxShadow: "0 8px 28px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.18)",
};

const cardHover: React.CSSProperties = {
  background: "linear-gradient(148deg, rgba(210,235,255,0.19) 0%, rgba(160,210,248,0.11) 100%)",
  border: "1px solid rgba(255,255,255,0.30)",
  boxShadow: "0 12px 36px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.24)",
};

function Home() {
  const [, t] = useLang();
  const [cms] = useCMS();
  const suggested = useMemo(() => cms.aiTools.slice(0, 8), [cms.aiTools]);
  const sliderItems = useMemo(
    () => cms.slides.map((s) => ({ id: s.id, title: s.title || "", image: s.image, url: s.link })),
    [cms.slides],
  );
  const doSyncFavs  = useServerFn(syncFavorites);
  const doSyncLikes = useServerFn(syncLikes);
  const userId = typeof window !== "undefined" ? getUserId() : null;

  const handleToggleFav = (kind: "post" | "ai" | "tool" | "chat", id: string) => {
    const r = toggleFav(kind, id);
    if (userId) doSyncFavs({ data: { userId, kind, itemIds: getFavs(kind) } }).catch(() => {});
    return r;
  };
  const handleToggleLike = (id: string) => {
    const r = toggleLike(id);
    if (userId) {
      const m = getLikes();
      doSyncLikes({ data: { userId, itemIds: Object.keys(m).filter((k) => m[k]) } }).catch(() => {});
    }
    return r;
  };

  return (
    <WithBottomBar>
      <Header />
      <main className="space-y-7 pb-4">

        {/* Hero Slider */}
        <section className="px-4 pt-3 animate-reveal-up">
          <HeroSlider slides={sliderItems} />
        </section>

        {/* Suggested AI Tools */}
        {suggested.length > 0 && (
          <section className="animate-reveal-up" style={{ animationDelay: "0.07s" }}>
            <SectionHeader title={t.suggested_for_you} to="/ai-tools" viewAll={t.view_all} />
            <div className="flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar">
              {suggested.map((tool, idx) => (
                <a
                  key={tool.id}
                  href={tool.url.startsWith("http") ? tool.url : `https://${tool.url}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex w-[130px] shrink-0 flex-col items-center justify-between rounded-3xl p-3 transition-glass animate-reveal-up"
                  style={{ ...cardStyle, minHeight: 152, animationDelay: `${idx * 0.04}s` }}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
                >
                  {/* Icon */}
                  <div
                    className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl"
                    style={{
                      background: "rgba(200,228,255,0.14)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
                    }}
                  >
                    {tool.icon
                      ? <img src={tool.icon} alt="" className="h-full w-full object-cover" />
                      : <span className="text-sm font-extrabold text-[#c4d8ea]">{tool.name[0]}</span>
                    }
                  </div>
                  <p className="line-clamp-2 mt-2 text-center text-[11px] font-semibold text-[#d7ebfc]">
                    {tool.name}
                  </p>
                  <span
                    className="mt-2 inline-flex w-full items-center justify-center rounded-full py-1 text-[10px] font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #35577D, #4a70a0)",
                      boxShadow: "0 2px 8px rgba(53,87,125,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
                    }}
                  >
                    {t.open}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Feed */}
        <section className="px-4 animate-reveal-up" style={{ animationDelay: "0.13s" }}>
          <SectionHeader title={t.feed} to="/home" viewAll="" />
          {cms.posts.length === 0 ? (
            <EmptyState text={t.no_data} />
          ) : (
            <div className="space-y-4">
              {cms.posts.map((p, idx) => (
                <PostCard
                  key={p.id} p={p}
                  onToggleFav={handleToggleFav}
                  onToggleLike={handleToggleLike}
                  delay={idx * 0.05}
                />
              ))}
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
      <h2 className="flex items-center gap-2 text-[13px] font-bold text-[#d2e6fa]">
        <span
          className="h-4 w-1 rounded-full"
          style={{
            background: "linear-gradient(180deg, #c4d8ea, #4a70a0)",
            boxShadow: "0 0 8px rgba(107,146,186,0.55)",
          }}
        />
        {title}
      </h2>
      {viewAll && (
        <Link to={to} className="text-[11px] font-semibold text-[#4a70a0] hover:text-[#96b8d6] transition-colors">
          {viewAll}
        </Link>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-3xl py-12 text-center"
      style={{
        background: "rgba(200,228,255,0.05)",
        border: "1px dashed rgba(107,146,186,0.30)",
      }}
    >
      <Inbox className="h-7 w-7 text-[#35577D]" />
      <p className="mt-3 text-sm text-[#6b92ba]">{text}</p>
    </div>
  );
}

function PostCard({
  p, onToggleFav, onToggleLike, delay = 0,
}: {
  p: Post;
  onToggleFav: (kind: "post", id: string) => boolean;
  onToggleLike: (id: string) => boolean;
  delay?: number;
}) {
  const [liked, setLiked]   = useState<boolean>(() => !!getLikes()[p.id]);
  const [likes, setLikes]   = useState(p.likes ?? 0);
  const [saved, setSaved]   = useState<boolean>(() => isFav("post", p.id));
  const [expanded, setExpanded] = useState(false);

  const badge   = { new: "أداة جديدة", tip: "نصيحة", update: "تحديث", ai: "AI" }[p.type];
  const badgeSx = {
    new:    { background: "rgba(52,211,153,0.14)", border: "1px solid rgba(52,211,153,0.25)", color: "#6ee7b7" },
    tip:    { background: "rgba(56,189,248,0.14)", border: "1px solid rgba(56,189,248,0.22)", color: "#7dd3fc" },
    update: { background: "rgba(167,139,250,0.14)",border: "1px solid rgba(167,139,250,0.22)", color: "#c4b5fd" },
    ai:     { background: "rgba(200,228,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", color: "#96b8d6" },
  }[p.type];

  const actionSx: React.CSSProperties = {
    background: "rgba(200,228,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    backdropFilter: "blur(12px)",
  };

  return (
    <article
      className="overflow-hidden rounded-3xl transition-glass animate-reveal-up"
      style={{ ...cardStyle, animationDelay: `${delay}s` }}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
    >
      {/* Shine stripe on top */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.20), transparent)" }}
      />

      {p.image && (
        <div className="w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
          <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
            style={badgeSx}
          >
            {badge}
          </span>
          <span className="text-[10px] text-[#4a70a0]">{timeAgoAr(p.date)}</span>
        </div>

        <h3 className="mt-2.5 text-[14px] font-bold text-[#d7ebfc]">{p.title}</h3>
        <p
          className={"mt-1.5 text-[12px] leading-relaxed text-[#6b92ba] " +
            (expanded ? "" : "line-clamp-3")}
        >
          {p.description}
        </p>
        {!expanded && p.description.length > 100 && (
          <button
            type="button" onClick={() => setExpanded(true)}
            className="mt-1 text-[11px] font-semibold text-[#4a70a0] hover:text-[#6b92ba] transition-colors"
          >
            اقرأ المزيد
          </button>
        )}

        {/* Action row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const n = onToggleLike(p.id);
                setLiked(n);
                setLikes((x) => x + (n ? 1 : -1));
              }}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 transition-glass"
              style={actionSx}
            >
              <Heart className={"h-3.5 w-3.5 " + (liked ? "fill-red-400 text-red-400" : "text-[#6b92ba]")} />
              <span className="text-[10px] text-[#96b8d6]">{likes}</span>
            </button>

            <button type="button" className="flex items-center gap-1 rounded-full px-3 py-1.5" style={actionSx}>
              <MessageCircle className="h-3.5 w-3.5 text-[#6b92ba]" />
              <span className="text-[10px] text-[#96b8d6]">{p.comments ?? 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setSaved(onToggleFav("post", p.id))}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 transition-glass"
              style={actionSx}
              aria-label="حفظ"
            >
              <Bookmark className={"h-3.5 w-3.5 " + (saved ? "fill-[#96b8d6] text-[#96b8d6]" : "text-[#6b92ba]")} />
            </button>
          </div>

          {p.url && (
            <a
              href={p.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-white transition-glass"
              style={{
                background: "linear-gradient(135deg, #35577D, #4a70a0)",
                boxShadow: "0 2px 10px rgba(53,87,125,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
              }}
            >
              جرّب الآن <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
