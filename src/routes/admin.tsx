import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminLogin, adminLogout, isAdminAuthed, uid, useCMS, type AiToolItem, type Post, type Slide, type UtilityItem } from "@/lib/admin-store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Lock, LogOut, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة التحكم — دليل" }] }),
  component: Admin,
});

function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  useEffect(() => setAuthed(isAdminAuthed()), []);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (adminLogin(pw)) {
              setAuthed(true);
              toast.success("تم الدخول");
            } else toast.error("كلمة سر خاطئة");
          }}
          className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/30">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-foreground">لوحة التحكم</h1>
              <p className="text-[11px] text-muted-foreground">أدخل كلمة السر للمتابعة</p>
            </div>
          </div>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="كلمة السر"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          <button type="submit" className="mt-3 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
            دخول
          </button>
          <button type="button" onClick={() => navigate({ to: "/home" })} className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-[12px] text-foreground">
            رجوع
          </button>
        </form>
      </div>
    );
  }

  return <Dashboard onLogout={() => { adminLogout(); setAuthed(false); }} />;
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [cms, setCms] = useCMS();
  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
        <h1 className="text-lg font-extrabold text-foreground">لوحة التحكم</h1>
        <button type="button" onClick={onLogout} className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-foreground">
          <LogOut className="h-3.5 w-3.5" /> خروج
        </button>
      </header>
      <Tabs defaultValue="slides" className="px-4 pt-4">
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="inline-flex w-max gap-1 bg-card p-1">
            <TabsTrigger value="slides" className="text-[12px]">السلايدر</TabsTrigger>
            <TabsTrigger value="posts" className="text-[12px]">منشورات</TabsTrigger>
            <TabsTrigger value="ai" className="text-[12px]">أدوات AI</TabsTrigger>
            <TabsTrigger value="utils" className="text-[12px]">أدوات عامة</TabsTrigger>
            <TabsTrigger value="chat" className="text-[12px]">المساعد</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="slides" className="pt-4">
          <SlidesEditor slides={cms.slides} onChange={(slides) => setCms({ ...cms, slides })} />
        </TabsContent>
        <TabsContent value="posts" className="pt-4">
          <PostsEditor posts={cms.posts} onChange={(posts) => setCms({ ...cms, posts })} />
        </TabsContent>
        <TabsContent value="ai" className="pt-4">
          <AiEditor items={cms.aiTools} cats={cms.aiCategories} onChange={(aiTools, aiCategories) => setCms({ ...cms, aiTools, aiCategories })} />
        </TabsContent>
        <TabsContent value="utils" className="pt-4">
          <UtilsEditor items={cms.utilities} cats={cms.utilCategories} onChange={(utilities, utilCategories) => setCms({ ...cms, utilities, utilCategories })} />
        </TabsContent>
        <TabsContent value="chat" className="pt-4">
          <ChatEditor
            prompt={cms.chatSystemPrompt}
            model={cms.chatModel}
            onSave={(chatSystemPrompt, chatModel) => { setCms({ ...cms, chatSystemPrompt, chatModel }); toast.success("تم الحفظ"); }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-semibold text-muted-foreground">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={"w-full rounded-xl border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none " + (props.className ?? "")} />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={"w-full rounded-xl border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none " + (props.className ?? "")} />;
}

function Card({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="space-y-2">{children}</div>
      <button type="button" onClick={onDelete} className="mt-3 inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-[11px] font-semibold text-destructive">
        <Trash2 className="h-3 w-3" /> حذف
      </button>
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12px] font-bold text-primary-foreground">
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function SlidesEditor({ slides, onChange }: { slides: Slide[]; onChange: (s: Slide[]) => void }) {
  return (
    <div className="space-y-3">
      <AddButton onClick={() => onChange([...slides, { id: uid(), image: "", title: "" }])} label="إضافة سلايد" />
      {slides.map((s, i) => (
        <Card key={s.id} onDelete={() => onChange(slides.filter((_, j) => j !== i))}>
          <FieldLabel>رابط الصورة</FieldLabel>
          <Input value={s.image} onChange={(e) => { const c = [...slides]; c[i] = { ...s, image: e.target.value }; onChange(c); }} placeholder="https://..." />
          <FieldLabel>عنوان (اختياري)</FieldLabel>
          <Input value={s.title ?? ""} onChange={(e) => { const c = [...slides]; c[i] = { ...s, title: e.target.value }; onChange(c); }} />
          <FieldLabel>رابط (اختياري)</FieldLabel>
          <Input value={s.link ?? ""} onChange={(e) => { const c = [...slides]; c[i] = { ...s, link: e.target.value }; onChange(c); }} />
        </Card>
      ))}
    </div>
  );
}

function PostsEditor({ posts, onChange }: { posts: Post[]; onChange: (p: Post[]) => void }) {
  return (
    <div className="space-y-3">
      <AddButton onClick={() => onChange([{ id: uid(), title: "", description: "", type: "new", date: new Date().toISOString(), likes: 0, comments: 0 }, ...posts])} label="إضافة منشور" />
      {posts.map((p, i) => (
        <Card key={p.id} onDelete={() => onChange(posts.filter((_, j) => j !== i))}>
          <FieldLabel>العنوان</FieldLabel>
          <Input value={p.title} onChange={(e) => { const c = [...posts]; c[i] = { ...p, title: e.target.value }; onChange(c); }} />
          <FieldLabel>الوصف</FieldLabel>
          <Textarea rows={3} value={p.description} onChange={(e) => { const c = [...posts]; c[i] = { ...p, description: e.target.value }; onChange(c); }} />
          <FieldLabel>رابط الصورة (اختياري)</FieldLabel>
          <Input value={p.image ?? ""} onChange={(e) => { const c = [...posts]; c[i] = { ...p, image: e.target.value }; onChange(c); }} />
          <FieldLabel>رابط خارجي (اختياري)</FieldLabel>
          <Input value={p.url ?? ""} onChange={(e) => { const c = [...posts]; c[i] = { ...p, url: e.target.value }; onChange(c); }} />
          <FieldLabel>النوع</FieldLabel>
          <select value={p.type} onChange={(e) => { const c = [...posts]; c[i] = { ...p, type: e.target.value as Post["type"] }; onChange(c); }} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-[13px] text-foreground">
            <option value="new">جديد</option>
            <option value="tip">نصيحة</option>
            <option value="update">تحديث</option>
            <option value="ai">AI</option>
          </select>
        </Card>
      ))}
    </div>
  );
}

function CategoryManager({ cats, onChange }: { cats: string[]; onChange: (c: string[]) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <FieldLabel>الأصناف</FieldLabel>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {cats.map((c) => (
          <span key={c} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/25">
            {c}
            <button type="button" onClick={() => onChange(cats.filter((x) => x !== c))} className="text-destructive">×</button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        <Input value={v} onChange={(e) => setV(e.target.value)} placeholder="اسم الصنف" />
        <button type="button" onClick={() => { if (v.trim() && !cats.includes(v.trim())) { onChange([...cats, v.trim()]); setV(""); } }} className="rounded-xl bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground">إضافة</button>
      </div>
    </div>
  );
}

function AiEditor({ items, cats, onChange }: { items: AiToolItem[]; cats: string[]; onChange: (i: AiToolItem[], c: string[]) => void }) {
  return (
    <div className="space-y-3">
      <CategoryManager cats={cats} onChange={(c) => onChange(items, c)} />
      <AddButton onClick={() => onChange([...items, { id: uid(), name: "", url: "", category: cats[0] ?? "" }], cats)} label="إضافة أداة AI" />
      {items.map((x, i) => (
        <Card key={x.id} onDelete={() => onChange(items.filter((_, j) => j !== i), cats)}>
          <FieldLabel>الاسم</FieldLabel>
          <Input value={x.name} onChange={(e) => { const c = [...items]; c[i] = { ...x, name: e.target.value }; onChange(c, cats); }} />
          <FieldLabel>الرابط</FieldLabel>
          <Input value={x.url} onChange={(e) => { const c = [...items]; c[i] = { ...x, url: e.target.value }; onChange(c, cats); }} />
          <FieldLabel>رابط الأيقونة (اختياري)</FieldLabel>
          <Input value={x.icon ?? ""} onChange={(e) => { const c = [...items]; c[i] = { ...x, icon: e.target.value }; onChange(c, cats); }} placeholder="https://..." />
          <FieldLabel>الصنف</FieldLabel>
          <select value={x.category} onChange={(e) => { const c = [...items]; c[i] = { ...x, category: e.target.value }; onChange(c, cats); }} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-[13px] text-foreground">
            <option value="">—</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <FieldLabel>الوصف (اختياري)</FieldLabel>
          <Textarea rows={2} value={x.description ?? ""} onChange={(e) => { const c = [...items]; c[i] = { ...x, description: e.target.value }; onChange(c, cats); }} />
        </Card>
      ))}
    </div>
  );
}

function UtilsEditor({ items, cats, onChange }: { items: UtilityItem[]; cats: string[]; onChange: (i: UtilityItem[], c: string[]) => void }) {
  return (
    <div className="space-y-3">
      <CategoryManager cats={cats} onChange={(c) => onChange(items, c)} />
      <AddButton onClick={() => onChange([...items, { id: uid(), name: "", url: "", category: cats[0] ?? "" }], cats)} label="إضافة أداة" />
      {items.map((x, i) => (
        <Card key={x.id} onDelete={() => onChange(items.filter((_, j) => j !== i), cats)}>
          <FieldLabel>الاسم</FieldLabel>
          <Input value={x.name} onChange={(e) => { const c = [...items]; c[i] = { ...x, name: e.target.value }; onChange(c, cats); }} />
          <FieldLabel>الرابط</FieldLabel>
          <Input value={x.url} onChange={(e) => { const c = [...items]; c[i] = { ...x, url: e.target.value }; onChange(c, cats); }} />
          <FieldLabel>رابط الأيقونة (اختياري)</FieldLabel>
          <Input value={x.icon ?? ""} onChange={(e) => { const c = [...items]; c[i] = { ...x, icon: e.target.value }; onChange(c, cats); }} placeholder="https://..." />
          <FieldLabel>الصنف</FieldLabel>
          <select value={x.category} onChange={(e) => { const c = [...items]; c[i] = { ...x, category: e.target.value }; onChange(c, cats); }} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-[13px] text-foreground">
            <option value="">—</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <FieldLabel>الوصف (اختياري)</FieldLabel>
          <Textarea rows={2} value={x.description ?? ""} onChange={(e) => { const c = [...items]; c[i] = { ...x, description: e.target.value }; onChange(c, cats); }} />
        </Card>
      ))}
    </div>
  );
}

function ChatEditor({ prompt, model, onSave }: { prompt: string; model: string; onSave: (p: string, m: string) => void }) {
  const [p, setP] = useState(prompt);
  const [m, setM] = useState(model);
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-3">
      <FieldLabel>توجيه المساعد (System Prompt)</FieldLabel>
      <Textarea rows={12} value={p} onChange={(e) => setP(e.target.value)} />
      <FieldLabel>النموذج</FieldLabel>
      <Input value={m} onChange={(e) => setM(e.target.value)} placeholder="google/gemini-3-flash-preview" />
      <button type="button" onClick={() => onSave(p, m)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-bold text-primary-foreground">
        <Save className="h-3.5 w-3.5" /> حفظ
      </button>
    </div>
  );
}