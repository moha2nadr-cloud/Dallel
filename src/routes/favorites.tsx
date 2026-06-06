import { createFileRoute } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { Star } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getFavs } from "@/lib/storage";
import { useEffect, useState } from "react";
import { feedPosts, utilityTools } from "@/lib/mock-data";
import { categories } from "@/lib/daleel";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "المفضلة — دليل" }] }),
  component: Favorites,
});

function Favorites() {
  const [counts, setCounts] = useState({ post: 0, ai: 0, tool: 0, chat: 0 });
  useEffect(() => {
    setCounts({
      post: getFavs("post").length,
      ai: getFavs("ai").length,
      tool: getFavs("tool").length,
      chat: getFavs("chat").length,
    });
  }, []);

  const postIds = getFavs("post");
  const aiIds = getFavs("ai");
  const toolIds = getFavs("tool");
  const savedPosts = feedPosts.filter((p) => postIds.includes(p.id));
  const savedTools = utilityTools.filter((t) => toolIds.includes(t.id));
  const savedAi = aiIds
    .map((id) => {
      const [catId, name] = id.split("::");
      const cat = categories[catId];
      const tool = cat?.tools.find((t) => t.name === name);
      return tool ? { ...tool, catName: cat.name, id } : null;
    })
    .filter(Boolean) as Array<{ name: string; url: string; catName: string; id: string }>;

  return (
    <WithBottomBar>
      <Header />
      <header className="px-5 pt-5">
        <h1 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-gold to-gold-soft" />
          المفضلة
          <Star className="h-4 w-4 text-gold" />
        </h1>
        <p className="mt-1 text-[12px] text-muted-foreground">كل ما حفظته في مكان واحد</p>
      </header>
      <Tabs defaultValue="post" className="mt-4">
        <TabsList className="mx-5 grid w-[calc(100%-2.5rem)] grid-cols-4 bg-card">
          <TabsTrigger value="post">منشورات</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="tool">أدوات</TabsTrigger>
          <TabsTrigger value="chat">محادثات</TabsTrigger>
        </TabsList>
        <div className="px-5 pb-8 pt-4">
          <TabsContent value="post">
            {savedPosts.length === 0 ? <Empty msg="لم تحفظ أي منشورات بعد" /> : (
              <ul className="space-y-3">
                {savedPosts.map((p) => (
                  <li key={p.id} className="rounded-2xl border border-border bg-card p-3">
                    <p className="text-[13px] font-bold text-cream">{p.title}</p>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="ai">
            {savedAi.length === 0 ? <Empty msg="لم تحفظ أي أداة AI بعد" /> : (
              <ul className="space-y-3">
                {savedAi.map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3">
                    <div>
                      <p className="text-[13px] font-bold text-cream">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.catName}</p>
                    </div>
                    <a
                      href={t.url.startsWith("http") ? t.url : `https://${t.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-ink"
                    >
                      استخدام
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="tool">
            {savedTools.length === 0 ? <Empty msg="لم تحفظ أي أداة بعد" /> : (
              <ul className="space-y-3">
                {savedTools.map((t) => (
                  <li key={t.id} className="rounded-2xl border border-border bg-card p-3">
                    <p className="text-[13px] font-bold text-cream">{t.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="chat">
            <Empty msg="لا توجد محادثات محفوظة" />
          </TabsContent>
        </div>
      </Tabs>
    </WithBottomBar>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center">
      <Star className="h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{msg}</p>
    </div>
  );
}