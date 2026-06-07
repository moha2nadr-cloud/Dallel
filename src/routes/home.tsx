import { createFileRoute, Link } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { HeroSlider } from "@/components/HeroSlider";
import { timeAgoAr } from "@/lib/mock-data";
import { useCMS, type Post, type AiToolItem, type Slide } from "@/lib/admin-store";
import { toggleLike, getLikes, toggleFav, isFav, getFavs, getUserId } from "@/lib/storage";
import { Heart, MessageCircle, Bookmark, ExternalLink, Inbox } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import { syncFavorites, syncLikes, getPublicSlides, getPublicPosts, getPublicAiTools } from "@/lib/api/sync.functions";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "الرئيسية — دليل" }] }),
  component: Home,
});

function Home() {
  const [, t] = useLang();
  const [cms] = useCMS();
  const [slidesDb, setSlidesDb] = useState<Slide[]>([]);
  const [postsDb, setPostsDb] = useState<Post[]>([]);
  const [aiDb, setAiDb] = useState<AiToolItem[]>([]);
  const fetchSlides = useServerFn(getPublicSlides);
  const fetchPosts = useServerFn(getPublicPosts);
  const fetchAi = useServerFn(getPublicAiTools);

  useEffect(() => {
    fetchSlides().then(setSlidesDb).catch(() => {});
    fetchPosts().then(setPostsDb).catch(() => {});
    fetchAi().then(setAiDb).catch(() => {});
  }, []);

  // use server data if available, otherwise fall back to CMS hook
  const slides = slidesDb.length > 0 ? slidesDb : cms.slides;
  const posts = postsDb.length > 0 ? postsDb : cms.posts;
  const aiTools = aiDb.length > 0 ? aiDb : cms.aiTools;
  const suggested = useMemo(() => aiTools.slice(0, 8), [aiTools]);
  const sliderItems = useMemo(
    () => slides.map((s) => ({ id: s.id, title: s.title || "", image: s.image, url: s.link })),
    [slides],
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
                  className="lg-card flex w-[128px] shrink-0 flex-col items-center justify-between rounded-3xl p-3 animate-reveal-up"
                  style={{ minHeight: 148, animationDelay: `${idx * 0.04}s` }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl"
                    style={{
                      background: "rgba(255,255,255,0.90)",
                      border: "1px solid rgba(200,195,185,0.30)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    {tool.icon
                      ? <img src={tool.icon} alt="" className="h-full w-full object-cover" />
                      : <span className="text-sm font-extrabold text-logo">{tool.name[0]}</span>
                    }
                  </div>
                  <p className="line-clamp-2 mt-2 text-center text-[11px] font-semibold text-gray-700">{tool.name}</p>
                  <span
                    className="mt-2 inline-flex w-full items-center justify-center rounded-full py-1 text-[10px] font-bold text-white btn-primary"
                    style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)" }}
                  >
                    {t.open}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Feed — "آخر التحديثات" */}
        <section className="px-4 animate-reveal-up" style={{ animationDelay: "0.13s" }}>
          <SectionHeader title="آخر التحديثات" to="/home" viewAll="" isBlack />
          {posts.length === 0 ? <EmptyState text={t.no_data} /> : (
            <div className="space-y-4">
              {posts.map((p, idx) => (
                <PostCard key={p.id} p={p} onToggleFav={handleToggleFav} onToggleLike={handleToggleLike} delay={idx * 0.05} />
              ))}
            </div>
          )}
        </section>
      </main>
    </WithBottomBar>
  );
}

function SectionHeader({ title, to, viewAll, isBlack }: { title: string; to: string; viewAll: string; isBlack?: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between px-5">
      <h2 className="flex items-center gap-2 text-[14px] font-bold">
        {/* Logo-colored vertical bar */}
        <span
          className="h-4 w-1 rounded-full logo-bar"
          aria-hidden
        />
        <span className={isBlack ? "text-gray-900" : "text-gray-800"}>{title}</span>
      </h2>
      {viewAll && (
        <Link to={to} className="text-[11px] font-semibold text-logo hover:opacity-70 transition-opacity">
          {viewAll}
        </Link>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="lg-card flex flex-col items-center justify-center rounded-3xl py-12 text-center">
      <Inbox className="h-7 w-7 text-logo" />
      <p className="mt-3 text-sm text-gray-500">{text}</p>
    </div>
  );
}

function PostCard({ p, onToggleFav, onToggleLike, delay = 0 }: {
  p: Post;
  onToggleFav: (kind: "post", id: string) => boolean;
  onToggleLike: (id: string) => boolean;
  delay?: number;
}) {
  const [liked, setLiked] = useState<boolean>(() => !!getLikes()[p.id]);
  const [likes, setLikes] = useState(p.likes ?? 0);
  const [saved, setSaved] = useState<boolean>(() => isFav("post", p.id));
  const [expanded, setExpanded] = useState(false);

  const badgeSx = {
    new:    { background: "rgba(52,211,153,0.10)", color: "#059669", border: "1px solid rgba(52,211,153,0.22)" },
    tip:    { background: "rgba(56,189,248,0.10)", color: "#0284c7", border: "1px solid rgba(56,189,248,0.22)" },
    update: { background: "rgba(167,139,250,0.10)",color: "#7c3aed", border: "1px solid rgba(167,139,250,0.22)" },
    ai:     { background: "rgba(181,168,152,0.12)", color: "#8B7D6F", border: "1px solid rgba(181,168,152,0.28)" },
  }[p.type];

  const badge = { new: "أداة جديدة", tip: "نصيحة", update: "تحديث", ai: "AI" }[p.type];

  const actionSx: React.CSSProperties = {
    background: "rgba(255,255,255,0.80)",
    border: "1px solid rgba(200,195,185,0.28)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  };

  return (
    <article className="lg-card overflow-hidden rounded-3xl animate-reveal-up" style={{ animationDelay: `${delay}s` }}>
      {/* Top shine stripe */}
      <div className="lg-shine-stripe" />

      {p.image && (
        <div className="w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={badgeSx}>{badge}</span>
          <span className="text-[10px] text-gray-400">{timeAgoAr(p.date)}</span>
        </div>

        <h3 className="mt-2.5 text-[14px] font-bold text-gray-900">{p.title}</h3>
        <p className={"mt-1.5 text-[12px] leading-relaxed text-gray-500 " + (expanded ? "" : "line-clamp-3")}>
          {p.description}
        </p>
        {!expanded && p.description.length > 100 && (
          <button type="button" onClick={() => setExpanded(true)} className="mt-1 text-[11px] font-semibold text-logo hover:opacity-70">
            اقرأ المزيد
          </button>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => { const n = onToggleLike(p.id); setLiked(n); setLikes((x) => x + (n ? 1 : -1)); }}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 transition-lg" style={actionSx}>
              <Heart className={"h-3.5 w-3.5 " + (liked ? "fill-red-400 text-red-400" : "text-gray-400")} />
              <span className="text-[10px] text-gray-500">{likes}</span>
            </button>
            <button type="button" className="flex items-center gap-1 rounded-full px-3 py-1.5" style={actionSx}>
              <MessageCircle className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[10px] text-gray-500">{p.comments ?? 0}</span>
            </button>
            <button type="button" onClick={() => setSaved(onToggleFav("post", p.id))}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 transition-lg" style={actionSx}>
              <Bookmark className={"h-3.5 w-3.5 " + (saved ? "fill-[#B5A898] text-[#B5A898]" : "text-gray-400")} />
            </button>
          </div>
          {p.url && (
            <a href={p.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-white transition-lg"
              style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 8px rgba(181,168,152,0.35)" }}>
              جرّب الآن <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
