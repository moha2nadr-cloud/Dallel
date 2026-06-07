import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { Star, ExternalLink } from "lucide-react";
import { getFavs } from "@/lib/storage";
import { useEffect, useState } from "react";
import { feedPosts, utilityTools } from "@/lib/mock-data";
import { categories } from "@/lib/daleel";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "المفضلة — دليل" }] }),
  component: Favorites,
});

const TABS = [
  { key: "post", label: "منشورات" },
  { key: "ai",   label: "AI" },
  { key: "tool", label: "أدوات" },
  { key: "chat", label: "محادثات" },
] as const;

const cardSx: React.CSSProperties = {
  background: "linear-gradient(148deg, rgba(200,228,252,0.13) 0%, rgba(140,190,238,0.07) 100%)",
  border: "1px solid rgba(255,255,255,0.20)",
  backdropFilter: "blur(28px) saturate(190%)",
  WebkitBackdropFilter: "blur(28px) saturate(190%)",
  boxShadow: "0 6px 22px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: "1rem",
};

function Favorites() {
  const [active, setActive] = useState<"post" | "ai" | "tool" | "chat">("post");

  const [savedPosts, setSavedPosts] = useState(() => feedPosts.filter((p) => getFavs("post").includes(p.id)));
  const [savedTools, setSavedTools] = useState(() => utilityTools.filter((t) => getFavs("tool").includes(t.id)));
  const [savedAi, setSavedAi] = useState(() =>
    getFavs("ai").map((id) => {
      const [catId, name] = id.split("::");
      const cat = categories[catId];
      const tool = cat?.tools.find((t) => t.name === name);
      return tool ? { ...tool, catName: cat.name, id } : null;
    }).filter(Boolean) as Array<{ name: string; url: string; catName: string; id: string }>
  );

  useEffect(() => {
    setSavedPosts(feedPosts.filter((p) => getFavs("post").includes(p.id)));
    setSavedTools(utilityTools.filter((t) => getFavs("tool").includes(t.id)));
    const ids = getFavs("ai");
    setSavedAi(
      ids.map((id) => {
        const [catId, name] = id.split("::");
        const cat = categories[catId];
        const tool = cat?.tools.find((t) => t.name === name);
        return tool ? { ...tool, catName: cat.name, id } : null;
      }).filter(Boolean) as Array<{ name: string; url: string; catName: string; id: string }>
    );
  }, []);

  const counts = { post: savedPosts.length, ai: savedAi.length, tool: savedTools.length, chat: 0 };

  return (
    <WithBottomBar>
      <Header />

      <div className="px-5 pt-4 pb-2 animate-reveal-up">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-extrabold"
            style={{
              background: "linear-gradient(135deg, #e8f2fb 0%, #6b92ba 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}
          >
            المفضلة
          </h1>
          <Star className="h-4 w-4 text-[#6b92ba]" />
        </div>
        <p className="mt-0.5 text-[12px] text-[#6b92ba]">كل ما حفظته في مكان واحد</p>
      </div>

      {/* Tab bar */}
      <div className="px-4 mt-3 animate-reveal-up" style={{ animationDelay: "0.06s" }}>
        <div
          className="flex rounded-2xl p-1 gap-1"
          style={{
            background: "rgba(200,228,255,0.08)",
            border: "1px solid rgba(255,255,255,0.16)",
            backdropFilter: "blur(20px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key} type="button" onClick={() => setActive(tab.key)}
              className="relative flex-1 rounded-xl py-2 text-[12px] font-semibold transition-all duration-200"
              style={
                active === tab.key
                  ? {
                      background: "linear-gradient(148deg, rgba(200,228,252,0.24) 0%, rgba(107,146,186,0.18) 100%)",
                      border: "1px solid rgba(255,255,255,0.28)",
                      color: "#ffffff",
                      boxShadow: "0 4px 14px rgba(53,87,125,0.28), inset 0 1px 0 rgba(255,255,255,0.20)",
                    }
                  : { color: "#4a70a0" }
              }
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px]"
                  style={
                    active === tab.key
                      ? { background: "rgba(255,255,255,0.22)", color: "#fff" }
                      : { background: "rgba(200,228,255,0.14)", color: "#6b92ba" }
                  }
                >
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8 pt-4">
        {active === "post" && (
          savedPosts.length === 0 ? <Empty msg="لم تحفظ أي منشورات بعد" /> : (
            <ul className="space-y-3">
              {savedPosts.map((p, idx) => (
                <li key={p.id} className="animate-reveal-up p-4" style={{ ...cardSx, animationDelay: `${idx * 0.05}s` }}>
                  {/* Shine */}
                  <div className="mb-2 h-px w-full rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.20), transparent)" }} />
                  <p className="text-[13px] font-bold text-[#d7ebfc]">{p.title}</p>
                </li>
              ))}
            </ul>
          )
        )}

        {active === "ai" && (
          savedAi.length === 0 ? <Empty msg="لم تحفظ أي أداة AI بعد" /> : (
            <ul className="space-y-3">
              {savedAi.map((item, idx) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between p-3.5 animate-reveal-up"
                  style={{ ...cardSx, animationDelay: `${idx * 0.05}s` }}
                >
                  <div>
                    <p className="text-[13px] font-bold text-[#d7ebfc]">{item.name}</p>
                    <p className="text-[10px] text-[#4a70a0]">{item.catName}</p>
                  </div>
                  <a
                    href={item.url.startsWith("http") ? item.url : `https://${item.url}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #35577D, #4a70a0)",
                      boxShadow: "0 2px 8px rgba(53,87,125,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
                    }}
                  >
                    استخدام <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          )
        )}

        {active === "tool" && (
          savedTools.length === 0 ? <Empty msg="لم تحفظ أي أداة بعد" /> : (
            <ul className="space-y-3">
              {savedTools.map((item, idx) => (
                <li key={item.id} className="animate-reveal-up p-4" style={{ ...cardSx, animationDelay: `${idx * 0.05}s` }}>
                  <p className="text-[13px] font-bold text-[#d7ebfc]">{item.name}</p>
                </li>
              ))}
            </ul>
          )
        )}

        {active === "chat" && <Empty msg="لا توجد محادثات محفوظة" />}
      </div>
    </WithBottomBar>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-3xl py-16 text-center animate-reveal-up"
      style={{
        background: "rgba(200,228,255,0.05)",
        border: "1px dashed rgba(180,215,245,0.25)",
      }}
    >
      <Star className="h-8 w-8 text-[#35577D]" />
      <p className="mt-3 text-sm text-[#6b92ba]">{msg}</p>
    </div>
  );
}
