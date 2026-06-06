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

function Home() {
  const [, t] = useLang();
  const [cms] = useCMS();
  const suggested = useMemo(() => cms.aiTools.slice(0, 8), [cms.aiTools]);
  const sliderItems = useMemo(
    () => cms.slides.map((s) => ({ id: s.id, title: s.title || "", image: s.image, url: s.link })),
    [cms.slides],
  );
  const doSyncFavs = useServerFn(syncFavorites);
  const doSyncLikes = useServerFn(syncLikes);
  const userId = typeof window !== "undefined" ? getUserId() : null;

  const handleToggleFav = (kind: "post" | "ai" | "tool" | "chat", id: string) => {
    const result = toggleFav(kind, id);
    if (userId) {
      const items = getFavs(kind);
      doSyncFavs({ data: { userId, kind, itemIds: items } }).catch(() => {});
    }
    return result;
  };

  const handleToggleLike = (id: string) => {
    const result = toggleLike(id);
    if (userId) {
      const likesMap = getLikes();
      const likedIds = Object.keys(likesMap).filter((k) => likesMap[k]);
      doSyncLikes({ data: { userId, itemIds: likedIds } }).catch(() => {});
    }
    return result;
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
          <section className="animate-reveal-up" style={{ animationDelay: "0.08s" }}>
            <SectionHeader title={t.suggested_for_you} to="/ai-tools" viewAll={t.view_all} />
            <div className="flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar">
              {suggested.map((tool, idx) => (
                <a
                  key={tool.id}
                  href={tool.url.startsWith("http") ? tool.url : `https://${tool.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card transition-glass flex w-[130px] shrink-0 flex-col items-center justify-between rounded-3xl p-3"
                  style={{ minHeight: 150, animationDelay: `${idx * 0.04}s` }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl"
                    style={{
                      background: "rgba(53,87,125,0.25)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    {tool.icon ? (
                      <img src={tool.icon} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-extrabold text-[#96b8d6]">{tool.name[0]}</span>
                    )}
                  </div>
                  <p className="line-clamp-2 mt-2 text-center text-[11px] font-semibold text-[#c4d8ea]">
                    {tool.name}
                  </p>
                  <span
                    className="mt-2 inline-flex w-full items-center justify-center rounded-full py-1 text-[10px] font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #35577D, #4a70a0)",
                      boxShadow: "0 2px 8px rgba(53,87,125,0.40)",
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
        <section className="px-4 animate-reveal-up" style={{ animationDelay: "0.14s" }}>
          <SectionHeader title={t.feed} to="/home" viewAll="" />
          {cms.posts.length === 0 ? (
            <EmptyState text={t.no_data} />
          ) : (
            <div className="space-y-4">
              {cms.posts.map((p, idx) => (
                <PostCard
                  key={p.id}
                  p={p}
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

function SectionHeader({
  title, to, viewAll,
}: { title: string; to: string; viewAll: string }) {
  return (
    <div className="mb-3 flex items-center justify-between px-5">
      <h2 className="flex items-center gap-2 text-[13px] font-bold text-[#c4d8ea]">
        {/* Liquid accent bar */}
        <span
          className="h-4 w-1 rounded-full"
          style={{ background: "linear-gradient(180deg, #96b8d6, #4a70a0)" }}
        />
        {title}
      </h2>
      {viewAll && (
        <Link to={to} className="text-[11px] font-semibold text-[#6b92ba] hover:text-[#96b8d6] transition-colors">
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
        background: "rgba(53,87,125,0.06)",
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
  const [liked, setLiked] = useState<boolean>(() => !!getLikes()[p.id]);
  const [likes, setLikes] = useState(p.likes ?? 0);
  const [saved, setSaved] = useState<boolean>(() => isFav("post", p.id));
  const [expanded, setExpanded] = useState(false);

  const badge = { new: "أداة جديدة", tip: "نصيحة", update: "تحديث", ai: "AI" }[p.type];
  const badgeCls = {
    new:    "bg-[rgba(52,211,153,0.12)] text-[#6ee7b7]",
    tip:    "bg-[rgba(56,189,248,0.12)] text-[#7dd3fc]",
    update: "bg-[rgba(167,139,250,0.12)] text-[#c4b5fd]",
    ai:     "bg-[rgba(53,87,125,0.25)] text-[#96b8d6]",
  }[p.type];

  return (
    <article
      className="glass-card overflow-hidden rounded-3xl transition-glass animate-reveal-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {p.image && (
        <div className="w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
          <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeCls}`}>{badge}</span>
          <span className="text-[10px] text-[#6b92ba]">{timeAgoAr(p.date)}</span>
        </div>

        <h3 className="mt-2.5 text-[14px] font-bold text-[#d2e6fa]">{p.title}</h3>
        <p
          className={
            "mt-1.5 text-[12px] leading-relaxed text-[#6b92ba] " +
            (expanded ? "" : "line-clamp-3")
          }
        >
          {p.description}
        </p>
        {!expanded && p.description.length > 100 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-1 text-[11px] font-semibold text-[#4a70a0] hover:text-[#6b92ba] transition-colors"
          >
            اقرأ المزيد
          </button>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Like */}
            <button
              type="button"
              onClick={() => {
                const n = onToggleLike(p.id);
                setLiked(n);
                setLikes((x) => x + (n ? 1 : -1));
              }}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 transition-glass"
              style={{ background: "rgba(53,87,125,0.12)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Heart
                className={"h-3.5 w-3.5 " + (liked ? "fill-red-400 text-red-400" : "text-[#6b92ba]")}
              />
              <span className="text-[10px] text-[#96b8d6]">{likes}</span>
            </button>

            {/* Comment */}
            <button
              type="button"
              className="flex items-center gap-1 rounded-full px-3 py-1.5"
              style={{ background: "rgba(53,87,125,0.12)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <MessageCircle className="h-3.5 w-3.5 text-[#6b92ba]" />
              <span className="text-[10px] text-[#96b8d6]">{p.comments ?? 0}</span>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={() => setSaved(onToggleFav("post", p.id))}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 transition-glass"
              style={{ background: "rgba(53,87,125,0.12)", border: "1px solid rgba(255,255,255,0.06)" }}
              aria-label="حفظ"
            >
              <Bookmark
                className={"h-3.5 w-3.5 " + (saved ? "fill-[#96b8d6] text-[#96b8d6]" : "text-[#6b92ba]")}
              />
            </button>
          </div>

          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-white transition-glass"
              style={{
                background: "linear-gradient(135deg, #35577D, #4a70a0)",
                boxShadow: "0 2px 10px rgba(53,87,125,0.45)",
              }}
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
