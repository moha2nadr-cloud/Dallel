import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
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
    setSavedAi(ids.map((id) => {
      const [catId, name] = id.split("::");
      const cat = categories[catId];
      const tool = cat?.tools.find((t) => t.name === name);
      return tool ? { ...tool, catName: cat.name, id } : null;
    }).filter(Boolean) as Array<{ name: string; url: string; catName: string; id: string }>);
  }, []);

  const counts = { post: savedPosts.length, ai: savedAi.length, tool: savedTools.length, chat: 0 };

  return (
    <WithBottomBar>
      {/* Tab bar — no section title above */}
      <div className="px-4 pt-3 mt-1 animate-reveal-up">
        <div className="lg-card flex rounded-2xl p-1 gap-1">
          {TABS.map((tab) => (
            <button key={tab.key} type="button" onClick={() => setActive(tab.key)}
              className="relative flex-1 rounded-xl py-2 text-[12px] font-semibold transition-lg"
              style={active === tab.key
                ? { background: "linear-gradient(135deg,rgba(181,168,152,0.20),rgba(160,146,130,0.15))", border: "1px solid rgba(200,195,185,0.35)", color: "#72665A", boxShadow: "0 2px 8px rgba(181,168,152,0.18)" }
                : { color: "#9090A8" }
              }>
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px]"
                  style={active === tab.key ? { background: "rgba(181,168,152,0.25)", color: "#72665A" } : { background: "#F4F4F6", color: "#9090A8" }}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8 pt-3">
        {active === "post" && (
          savedPosts.length === 0 ? <Empty msg="لم تحفظ أي منشورات بعد" /> :
            <ul className="space-y-3">
              {savedPosts.map((p, idx) => (
                <li key={p.id} className="lg-card rounded-2xl p-4 animate-reveal-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="lg-shine-stripe mb-2" />
                  <p className="text-[13px] font-bold text-gray-900">{p.title}</p>
                </li>
              ))}
            </ul>
        )}

        {active === "ai" && (
          savedAi.length === 0 ? <Empty msg="لم تحفظ أي أداة AI بعد" /> :
            <ul className="space-y-3">
              {savedAi.map((item, idx) => (
                <li key={item.id} className="lg-card flex items-center justify-between rounded-2xl p-3.5 animate-reveal-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div><p className="text-[13px] font-bold text-gray-900">{item.name}</p><p className="text-[10px] text-gray-400">{item.catName}</p></div>
                  <a href={item.url.startsWith("http") ? item.url : `https://${item.url}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 8px rgba(181,168,152,0.35)" }}>
                    استخدام <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
        )}

        {active === "tool" && (
          savedTools.length === 0 ? <Empty msg="لم تحفظ أي أداة بعد" /> :
            <ul className="space-y-3">
              {savedTools.map((item, idx) => (
                <li key={item.id} className="lg-card rounded-2xl p-4 animate-reveal-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <p className="text-[13px] font-bold text-gray-900">{item.name}</p>
                </li>
              ))}
            </ul>
        )}

        {active === "chat" && <Empty msg="لا توجد محادثات محفوظة" />}
      </div>
    </WithBottomBar>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="lg-card flex flex-col items-center justify-center rounded-3xl py-16 text-center animate-reveal-up mt-4">
      <Star className="h-8 w-8 text-logo" />
      <p className="mt-3 text-sm text-gray-400">{msg}</p>
    </div>
  );
}
