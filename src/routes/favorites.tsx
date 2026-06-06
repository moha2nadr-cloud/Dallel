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

function Favorites() {
  const [active, setActive] = useState<"post" | "ai" | "tool" | "chat">("post");

  const postIds  = getFavs("post");
  const aiIds    = getFavs("ai");
  const toolIds  = getFavs("tool");

  const [savedPosts, setSavedPosts] = useState(() => feedPosts.filter((p) => postIds.includes(p.id)));
  const [savedTools, setSavedTools] = useState(() => utilityTools.filter((t) => toolIds.includes(t.id)));
  const [savedAi, setSavedAi] = useState(() =>
    aiIds
      .map((id) => {
        const [catId, name] = id.split("::");
        const cat = categories[catId];
        const tool = cat?.tools.find((t) => t.name === name);
        return tool ? { ...tool, catName: cat.name, id } : null;
      })
      .filter(Boolean) as Array<{ name: string; url: string; catName: string; id: string }>
  );

  useEffect(() => {
    setSavedPosts(feedPosts.filter((p) => getFavs("post").includes(p.id)));
    setSavedTools(utilityTools.filter((t) => getFavs("tool").includes(t.id)));
    const ids = getFavs("ai");
    setSavedAi(
      ids
        .map((id) => {
          const [catId, name] = id.split("::");
          const cat = categories[catId];
          const tool = cat?.tools.find((t) => t.name === name);
          return tool ? { ...tool, catName: cat.name, id } : null;
        })
        .filter(Boolean) as Array<{ name: string; url: string; catName: string; id: string }>
    );
  }, []);

  const counts = {
    post: savedPosts.length,
    ai: savedAi.length,
    tool: savedTools.length,
    chat: 0,
  };

  return (
    <WithBottomBar>
      <Header />

      <div className="px-5 pt-4 pb-2 animate-reveal-up">
        <div className="flex items-center gap-2">
          <h1
            className="text-[20px] font-extrabold"
            style={{
              background: "linear-gradient(135deg, #d2e6fa 0%, #6b92ba 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            المفضلة
          </h1>
          <Star className="h-4 w-4 text-[#4a70a0]" />
        </div>
        <p className="mt-0.5 text-[12px] text-[#6b92ba]">كل ما حفظته في مكان واحد</p>
      </div>

      {/* Tabs bar */}
      <div className="px-4 mt-3 animate-reveal-up" style={{ animationDelay: "0.06s" }}>
        <div
          className="flex rounded-2xl p-1 gap-1"
          style={{
            background: "rgba(53,87,125,0.10)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className="relative flex-1 rounded-xl py-2 text-[12px] font-semibold transition-all duration-200"
              style={
                active === tab.key
                  ? {
                      background: "linear-gradient(135deg, rgba(53,87,125,0.60), rgba(74,112,160,0.50))",
                      border: "1px solid rgba(255,255,255,0.13)",
                      color: "#ffffff",
                      boxShadow: "0 4px 12px rgba(53,87,125,0.30)",
                    }
                  : { color: "#6b92ba" }
              }
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px]"
                  style={{
                    background: active === tab.key ? "rgba(255,255,255,0.20)" : "rgba(53,87,125,0.30)",
                    color: active === tab.key ? "#fff" : "#96b8d6",
                  }}
                >
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-8 pt-4">
        {active === "post" && (
          savedPosts.length === 0 ? <Empty msg="لم تحفظ أي منشورات بعد" /> : (
            <ul className="space-y-3">
              {savedPosts.map((p, idx) => (
                <li
                  key={p.id}
                  className="glass-card rounded-2xl p-4 animate-reveal-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <p className="text-[13px] font-bold text-[#c4d8ea]">{p.title}</p>
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
                  className="glass-card flex items-center justify-between rounded-2xl p-3.5 animate-reveal-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div>
                    <p className="text-[13px] font-bold text-[#c4d8ea]">{item.name}</p>
                    <p className="text-[10px] text-[#35577D]">{item.catName}</p>
                  </div>
                  <a
                    href={item.url.startsWith("http") ? item.url : `https://${item.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #35577D, #4a70a0)",
                      boxShadow: "0 2px 8px rgba(53,87,125,0.40)",
                    }}
                  >
                    استخدام
                    <ExternalLink className="h-3 w-3" />
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
                <li
                  key={item.id}
                  className="glass-card rounded-2xl p-4 animate-reveal-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <p className="text-[13px] font-bold text-[#c4d8ea]">{item.name}</p>
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
        background: "rgba(53,87,125,0.06)",
        border: "1px dashed rgba(107,146,186,0.22)",
      }}
    >
      <Star className="h-8 w-8 text-[#35577D]" />
      <p className="mt-3 text-sm text-[#6b92ba]">{msg}</p>
    </div>
  );
}
