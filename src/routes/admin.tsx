import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminLogin, adminLogout, isAdminAuthed, uid, useCMS, type AiToolItem, type Post, type Slide, type UtilityItem } from "@/lib/admin-store";
import { Lock, LogOut, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة التحكم — دليل" }] }),
  component: Admin,
});

/* ── Shared glass styles ── */
const glassCard = {
  background: "linear-gradient(145deg, rgba(53,87,125,0.18), rgba(20,30,48,0.22))",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(16px)",
} as const;

const glassInput: React.CSSProperties = {
  background: "rgba(53,87,125,0.10)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#c4d8ea",
  borderRadius: "0.75rem",
  padding: "0.6rem 0.85rem",
  fontSize: "13px",
  width: "100%",
  outline: "none",
  fontFamily: "Tajawal, sans-serif",
};

function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  useEffect(() => setAuthed(isAdminAuthed()), []);

  if (!authed) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-5"
        style={{ background: "linear-gradient(160deg, #141E30 0%, #0a1220 100%)" }}
      >
        <div
          className="w-full max-w-sm rounded-3xl p-6 shadow-xl animate-reveal-up"
          style={glassCard}
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(53,87,125,0.25)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <Lock className="h-5 w-5 text-[#6b92ba]" />
            </div>
            <div>
              <h1 className="text-[15px] font-extrabold text-[#c4d8ea]">لوحة التحكم</h1>
              <p className="text-[11px] text-[#35577D]">أدخل كلمة السر للمتابعة</p>
            </div>
          </div>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (adminLogin(pw)) { setAuthed(true); toast.success("تم الدخول"); }
                else toast.error("كلمة سر خاطئة");
              }
            }}
            placeholder="كلمة السر"
            style={glassInput}
          />
          <button
            type="button"
            onClick={() => {
              if (adminLogin(pw)) { setAuthed(true); toast.success("تم الدخول"); }
              else toast.error("كلمة سر خاطئة");
            }}
            className="mt-3 w-full rounded-2xl py-3 text-sm font-bold text-white transition-glass"
            style={{
              background: "linear-gradient(135deg, #35577D, #4a70a0)",
              boxShadow: "0 4px 16px rgba(53,87,125,0.40)",
            }}
          >
            دخول
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/home" })}
            className="mt-2 w-full rounded-2xl py-2.5 text-[12px] font-semibold text-[#6b92ba] transition-glass"
            style={{
              background: "rgba(53,87,125,0.10)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard onLogout={() => { adminLogout(); setAuthed(false); }} />;
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [cms, setCms] = useCMS();
  const TABS = [
    { key: "slides", label: "السلايدر" },
    { key: "posts",  label: "منشورات" },
    { key: "ai",     label: "أدوات AI" },
    { key: "utils",  label: "أدوات عامة" },
    { key: "chat",   label: "المساعد" },
  ] as const;
  const [tab, setTab] = useState<typeof TABS[number]["key"]>("slides");

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: "linear-gradient(160deg, #141E30 0%, #0a1220 100%)" }}
    >
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-4"
        style={{
          background: "rgba(14,22,37,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h1
          className="text-[16px] font-extrabold"
          style={{
            background: "linear-gradient(135deg, #d2e6fa, #6b92ba)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          لوحة التحكم
        </h1>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#96b8d6] transition-glass"
          style={{
            background: "rgba(53,87,125,0.15)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <LogOut className="h-3.5 w-3.5" /> خروج
        </button>
      </header>

      {/* Tab bar */}
      <div className="overflow-x-auto no-scrollbar px-4 pt-4">
        <div className="inline-flex gap-1 rounded-2xl p-1" style={{ background: "rgba(53,87,125,0.10)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="whitespace-nowrap rounded-xl px-4 py-2 text-[12px] font-semibold transition-all duration-200"
              style={
                tab === t.key
                  ? {
                      background: "linear-gradient(135deg, rgba(53,87,125,0.55), rgba(74,112,160,0.45))",
                      border: "1px solid rgba(255,255,255,0.13)",
                      color: "#ffffff",
                      boxShadow: "0 4px 12px rgba(53,87,125,0.30)",
                    }
                  : { color: "#6b92ba" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 pt-4">
        {tab === "slides" && <SlidesEditor slides={cms.slides} onChange={(slides) => setCms({ ...cms, slides })} />}
        {tab === "posts"  && <PostsEditor  posts={cms.posts}   onChange={(posts)  => setCms({ ...cms, posts  })} />}
        {tab === "ai"     && <AiEditor    items={cms.aiTools}  cats={cms.aiCategories}   onChange={(aiTools, aiCategories)     => setCms({ ...cms, aiTools, aiCategories })} />}
        {tab === "utils"  && <UtilsEditor items={cms.utilities} cats={cms.utilCategories} onChange={(utilities, utilCategories) => setCms({ ...cms, utilities, utilCategories })} />}
        {tab === "chat"   && (
          <ChatEditor
            prompt={cms.chatSystemPrompt}
            model={cms.chatModel}
            onSave={(chatSystemPrompt, chatModel) => { setCms({ ...cms, chatSystemPrompt, chatModel }); toast.success("تم الحفظ"); }}
          />
        )}
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#35577D] mb-1">{children}</label>;
}

function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...glassInput, ...(props.style ?? {}) }}
      onFocus={(e) => { e.target.style.borderColor = "rgba(74,112,160,0.50)"; }}
      onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
    />
  );
}

function GlassTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        ...glassInput,
        resize: "vertical",
        minHeight: 80,
      }}
      onFocus={(e) => { e.target.style.borderColor = "rgba(74,112,160,0.50)"; }}
      onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
    />
  );
}

function GlassCard({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={glassCard}>
      {children}
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-red-400 transition-glass"
        style={{
          background: "rgba(239,68,68,0.10)",
          border: "1px solid rgba(239,68,68,0.18)",
        }}
      >
        <Trash2 className="h-3 w-3" /> حذف
      </button>
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold text-white transition-glass"
      style={{
        background: "linear-gradient(135deg, #35577D, #4a70a0)",
        boxShadow: "0 2px 10px rgba(53,87,125,0.40)",
      }}
    >
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

/* ── Editors ── */
function SlidesEditor({ slides, onChange }: { slides: Slide[]; onChange: (s: Slide[]) => void }) {
  return (
    <div className="space-y-3">
      <AddButton onClick={() => onChange([...slides, { id: uid(), image: "", title: "" }])} label="إضافة سلايد" />
      {slides.map((s, i) => (
        <GlassCard key={s.id} onDelete={() => onChange(slides.filter((_, j) => j !== i))}>
          <FieldLabel>رابط الصورة</FieldLabel>
          <GlassInput value={s.image} onChange={(e) => { const c = [...slides]; c[i] = { ...s, image: e.target.value }; onChange(c); }} placeholder="https://..." />
          <FieldLabel>عنوان (اختياري)</FieldLabel>
          <GlassInput value={s.title ?? ""} onChange={(e) => { const c = [...slides]; c[i] = { ...s, title: e.target.value }; onChange(c); }} />
          <FieldLabel>رابط (اختياري)</FieldLabel>
          <GlassInput value={s.link ?? ""} onChange={(e) => { const c = [...slides]; c[i] = { ...s, link: e.target.value }; onChange(c); }} />
        </GlassCard>
      ))}
    </div>
  );
}

function PostsEditor({ posts, onChange }: { posts: Post[]; onChange: (p: Post[]) => void }) {
  return (
    <div className="space-y-3">
      <AddButton
        onClick={() => onChange([{ id: uid(), title: "", description: "", type: "new", date: new Date().toISOString(), likes: 0, comments: 0 }, ...posts])}
        label="إضافة منشور"
      />
      {posts.map((p, i) => (
        <GlassCard key={p.id} onDelete={() => onChange(posts.filter((_, j) => j !== i))}>
          <FieldLabel>العنوان</FieldLabel>
          <GlassInput value={p.title} onChange={(e) => { const c = [...posts]; c[i] = { ...p, title: e.target.value }; onChange(c); }} />
          <FieldLabel>الوصف</FieldLabel>
          <GlassTextarea rows={3} value={p.description} onChange={(e) => { const c = [...posts]; c[i] = { ...p, description: e.target.value }; onChange(c); }} />
          <FieldLabel>رابط الصورة (اختياري)</FieldLabel>
          <GlassInput value={p.image ?? ""} onChange={(e) => { const c = [...posts]; c[i] = { ...p, image: e.target.value }; onChange(c); }} />
          <FieldLabel>رابط خارجي (اختياري)</FieldLabel>
          <GlassInput value={p.url ?? ""} onChange={(e) => { const c = [...posts]; c[i] = { ...p, url: e.target.value }; onChange(c); }} />
          <FieldLabel>النوع</FieldLabel>
          <select
            value={p.type}
            onChange={(e) => { const c = [...posts]; c[i] = { ...p, type: e.target.value as Post["type"] }; onChange(c); }}
            style={{ ...glassInput }}
          >
            <option value="new">جديد</option>
            <option value="tip">نصيحة</option>
            <option value="update">تحديث</option>
            <option value="ai">AI</option>
          </select>
        </GlassCard>
      ))}
    </div>
  );
}

function CategoryManager({ cats, onChange }: { cats: string[]; onChange: (c: string[]) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="rounded-2xl p-4" style={glassCard}>
      <FieldLabel>الأصناف</FieldLabel>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {cats.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#96b8d6]"
            style={{ background: "rgba(53,87,125,0.22)", border: "1px solid rgba(255,255,255,0.09)" }}
          >
            {c}
            <button type="button" onClick={() => onChange(cats.filter((x) => x !== c))} className="text-red-400 ml-1">×</button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        <GlassInput value={v} onChange={(e) => setV(e.target.value)} placeholder="اسم الصنف" />
        <button
          type="button"
          onClick={() => { if (v.trim() && !cats.includes(v.trim())) { onChange([...cats, v.trim()]); setV(""); } }}
          className="rounded-xl px-3 py-2 text-[12px] font-bold text-white transition-glass"
          style={{ background: "linear-gradient(135deg, #35577D, #4a70a0)", whiteSpace: "nowrap" }}
        >
          إضافة
        </button>
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
        <GlassCard key={x.id} onDelete={() => onChange(items.filter((_, j) => j !== i), cats)}>
          <FieldLabel>الاسم</FieldLabel>
          <GlassInput value={x.name} onChange={(e) => { const c = [...items]; c[i] = { ...x, name: e.target.value }; onChange(c, cats); }} />
          <FieldLabel>الرابط</FieldLabel>
          <GlassInput value={x.url} onChange={(e) => { const c = [...items]; c[i] = { ...x, url: e.target.value }; onChange(c, cats); }} />
          <FieldLabel>رابط الأيقونة (اختياري)</FieldLabel>
          <GlassInput value={x.icon ?? ""} onChange={(e) => { const c = [...items]; c[i] = { ...x, icon: e.target.value }; onChange(c, cats); }} placeholder="https://..." />
          <FieldLabel>الصنف</FieldLabel>
          <select value={x.category} onChange={(e) => { const c = [...items]; c[i] = { ...x, category: e.target.value }; onChange(c, cats); }} style={glassInput}>
            <option value="">—</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <FieldLabel>الوصف (اختياري)</FieldLabel>
          <GlassTextarea rows={2} value={x.description ?? ""} onChange={(e) => { const c = [...items]; c[i] = { ...x, description: e.target.value }; onChange(c, cats); }} />
        </GlassCard>
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
        <GlassCard key={x.id} onDelete={() => onChange(items.filter((_, j) => j !== i), cats)}>
          <FieldLabel>الاسم</FieldLabel>
          <GlassInput value={x.name} onChange={(e) => { const c = [...items]; c[i] = { ...x, name: e.target.value }; onChange(c, cats); }} />
          <FieldLabel>الرابط</FieldLabel>
          <GlassInput value={x.url} onChange={(e) => { const c = [...items]; c[i] = { ...x, url: e.target.value }; onChange(c, cats); }} />
          <FieldLabel>رابط الأيقونة (اختياري)</FieldLabel>
          <GlassInput value={x.icon ?? ""} onChange={(e) => { const c = [...items]; c[i] = { ...x, icon: e.target.value }; onChange(c, cats); }} placeholder="https://..." />
          <FieldLabel>الصنف</FieldLabel>
          <select value={x.category} onChange={(e) => { const c = [...items]; c[i] = { ...x, category: e.target.value }; onChange(c, cats); }} style={glassInput}>
            <option value="">—</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <FieldLabel>الوصف (اختياري)</FieldLabel>
          <GlassTextarea rows={2} value={x.description ?? ""} onChange={(e) => { const c = [...items]; c[i] = { ...x, description: e.target.value }; onChange(c, cats); }} />
        </GlassCard>
      ))}
    </div>
  );
}

function ChatEditor({ prompt, model, onSave }: { prompt: string; model: string; onSave: (p: string, m: string) => void }) {
  const [p, setP] = useState(prompt);
  const [m, setM] = useState(model);
  return (
    <div className="space-y-4 rounded-2xl p-4" style={glassCard}>
      <div>
        <FieldLabel>توجيه المساعد (System Prompt)</FieldLabel>
        <GlassTextarea rows={12} value={p} onChange={(e) => setP(e.target.value)} />
      </div>
      <div>
        <FieldLabel>النموذج</FieldLabel>
        <GlassInput value={m} onChange={(e) => setM(e.target.value)} placeholder="google/gemini-3-flash-preview" />
      </div>
      <button
        type="button"
        onClick={() => onSave(p, m)}
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold text-white transition-glass"
        style={{
          background: "linear-gradient(135deg, #35577D, #4a70a0)",
          boxShadow: "0 2px 10px rgba(53,87,125,0.40)",
        }}
      >
        <Save className="h-3.5 w-3.5" /> حفظ
      </button>
    </div>
  );
}
