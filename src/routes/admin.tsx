import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  adminLogin, adminLogout, isAdminAuthed, uid,
  useCMS, type AiToolItem, type Post, type Slide, type UtilityItem, type SyncStatus,
} from "@/lib/admin-store";
import { Lock, LogOut, Plus, Trash2, Save, Upload, Loader2, CheckCircle, AlertCircle, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { uploadImage } from "@/lib/api/sync.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة التحكم — دليل" }] }),
  component: Admin,
});

/* ─── Shared styles ────────────────────────────────────────────────── */
const inputSx: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.80)",
  border: "1px solid rgba(200,195,185,0.35)",
  borderRadius: "0.75rem",
  padding: "0.6rem 0.85rem",
  fontSize: 13,
  color: "#1A1A24",
  outline: "none",
  fontFamily: "Tajawal, sans-serif",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.90)",
};

/* ─── Login screen ─────────────────────────────────────────────────── */
function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  useEffect(() => setAuthed(isAdminAuthed()), []);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 bg-white">
        <div className="lg-panel w-full max-w-sm rounded-3xl p-6 animate-reveal-up">
          <div className="lg-shine-stripe mb-5" />
          <div className="mb-5 flex items-center gap-3">
            <div className="lg-card flex h-11 w-11 items-center justify-center rounded-2xl">
              <Lock className="h-5 w-5 text-logo" />
            </div>
            <div>
              <h1 className="text-[15px] font-extrabold text-gray-900">لوحة التحكم</h1>
              <p className="text-[11px] text-gray-400">أدخل كلمة السر للمتابعة</p>
            </div>
          </div>
          <input
            type="password" value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (adminLogin(pw)) { setAuthed(true); toast.success("تم الدخول"); }
                else toast.error("كلمة سر خاطئة");
              }
            }}
            placeholder="كلمة السر"
            style={inputSx}
          />
          <button
            type="button"
            onClick={() => {
              if (adminLogin(pw)) { setAuthed(true); toast.success("تم الدخول"); }
              else toast.error("كلمة سر خاطئة");
            }}
            className="mt-3 w-full rounded-2xl py-3 text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 4px 16px rgba(181,168,152,0.38)" }}>
            دخول
          </button>
          <button
            type="button" onClick={() => navigate({ to: "/home" })}
            className="mt-2 w-full rounded-2xl py-2.5 text-[12px] font-semibold text-gray-500"
            style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(200,195,185,0.28)" }}>
            رجوع
          </button>
        </div>
      </div>
    );
  }
  return <Dashboard onLogout={() => { adminLogout(); setAuthed(false); }} />;
}

/* ─── Save status badge ─────────────────────────────────────────────── */
function StatusBadge({ status }: { status: SyncStatus }) {
  if (status === "idle") return null;
  const map = {
    saving: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, text: "جاري الحفظ...", color: "#8B7D6F" },
    saved:  { icon: <CheckCircle className="h-3.5 w-3.5" />,           text: "تم الحفظ ✓",   color: "#059669" },
    error:  { icon: <AlertCircle className="h-3.5 w-3.5" />,           text: "فشل الحفظ!",   color: "#dc2626" },
  }[status];
  return (
    <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: `${map.color}18`, color: map.color, border: `1px solid ${map.color}30` }}>
      {map.icon}{map.text}
    </span>
  );
}

/* ─── Dashboard ─────────────────────────────────────────────────────── */
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [cms, setCms, syncStatus] = useCMS();
  const TABS = [
    { key: "slides", label: "السلايدر" },
    { key: "posts",  label: "منشورات"  },
    { key: "ai",     label: "أدوات AI" },
    { key: "utils",  label: "أدوات عامة" },
    { key: "chat",   label: "المساعد"  },
  ] as const;
  const [tab, setTab] = useState<typeof TABS[number]["key"]>("slides");

  const handleSave = async (updated: typeof cms) => {
    try {
      await setCms(updated);
      toast.success("تم الحفظ في قاعدة البيانات ✓");
    } catch {
      toast.error("فشل الحفظ — تحقق من الاتصال");
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-white">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 lg-header">
        <div className="flex items-center gap-2">
          <h1 className="text-[16px] font-extrabold logo-gradient">لوحة التحكم</h1>
          <StatusBadge status={syncStatus} />
        </div>
        <button
          type="button" onClick={onLogout}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-gray-500"
          style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(200,195,185,0.28)" }}>
          <LogOut className="h-3.5 w-3.5" /> خروج
        </button>
      </header>

      {/* Tabs */}
      <div className="overflow-x-auto no-scrollbar px-4 pt-4">
        <div className="inline-flex gap-1 rounded-2xl p-1 lg-card">
          {TABS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className="whitespace-nowrap rounded-xl px-4 py-2 text-[12px] font-semibold transition-lg"
              style={tab === t.key
                ? { background: "linear-gradient(135deg,rgba(181,168,152,0.22),rgba(160,146,130,0.16))", border: "1px solid rgba(200,195,185,0.35)", color: "#72665A" }
                : { color: "#9090A8" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {tab === "slides" && (
          <SlidesEditor slides={cms.slides}
            onChange={(slides) => handleSave({ ...cms, slides })} />
        )}
        {tab === "posts" && (
          <PostsEditor posts={cms.posts}
            onChange={(posts) => handleSave({ ...cms, posts })} />
        )}
        {tab === "ai" && (
          <AiEditor items={cms.aiTools} cats={cms.aiCategories}
            onChange={(aiTools, aiCategories) => handleSave({ ...cms, aiTools, aiCategories })} />
        )}
        {tab === "utils" && (
          <UtilsEditor items={cms.utilities} cats={cms.utilCategories}
            onChange={(utilities, utilCategories) => handleSave({ ...cms, utilities, utilCategories })} />
        )}
        {tab === "chat" && (
          <ChatEditor
            prompt={cms.chatSystemPrompt}
            model={cms.chatModel}
            onSave={(chatSystemPrompt, chatModel) => handleSave({ ...cms, chatSystemPrompt, chatModel })}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Image Upload button ───────────────────────────────────────────── */
function ImageUpload({ onUrl }: { onUrl: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const doUpload = useServerFn(uploadImage);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const result = await doUpload({ data: { base64, folder: "daleel" } });
      onUrl(result.url);
      toast.success("تم رفع الصورة ✓");
    } catch {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-white transition-lg disabled:opacity-50"
        style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 8px rgba(181,168,152,0.35)" }}>
        {uploading
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <Upload className="h-3.5 w-3.5" />
        }
        {uploading ? "جاري الرفع..." : "رفع صورة"}
      </button>
    </>
  );
}

/* ─── Shared sub-components ─────────────────────────────────────────── */
function FL({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{children}</label>;
}

function GI(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...p} style={{ ...inputSx, ...(p.style ?? {}) }}
      onFocus={(e) => { e.target.style.borderColor = "rgba(181,168,152,0.55)"; }}
      onBlur={(e)  => { e.target.style.borderColor = "rgba(200,195,185,0.35)"; }}
    />
  );
}

function GT(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...p} style={{ ...inputSx, resize: "vertical", minHeight: 80 }}
      onFocus={(e) => { e.target.style.borderColor = "rgba(181,168,152,0.55)"; }}
      onBlur={(e)  => { e.target.style.borderColor = "rgba(200,195,185,0.35)"; }}
    />
  );
}

function GCard({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <div className="lg-card rounded-2xl p-4 space-y-3">
      <div className="lg-shine-stripe mb-1" />
      {children}
      <button type="button" onClick={onDelete}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-red-500"
        style={{ background: "rgba(254,242,242,0.80)", border: "1px solid rgba(239,68,68,0.18)" }}>
        <Trash2 className="h-3 w-3" /> حذف
      </button>
    </div>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold text-white"
      style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 10px rgba(181,168,152,0.38)" }}>
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

/* ── Image field: URL input + upload button ── */
function ImageField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <FL>{label}</FL>
      <div className="flex gap-2 items-center">
        <GI value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." style={{ flex: 1 }} />
        <ImageUpload onUrl={onChange} />
      </div>
      {value && (
        <img src={value} alt="" className="mt-1 h-16 rounded-xl object-cover"
          style={{ border: "1px solid rgba(200,195,185,0.28)" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
    </div>
  );
}

/* ─── Editors ───────────────────────────────────────────────────────── */
function SlidesEditor({ slides, onChange }: { slides: Slide[]; onChange: (s: Slide[]) => void }) {
  return (
    <div className="space-y-3">
      <AddBtn onClick={() => onChange([...slides, { id: uid(), image: "", title: "" }])} label="إضافة سلايد" />
      {slides.map((s, i) => (
        <GCard key={s.id} onDelete={() => onChange(slides.filter((_, j) => j !== i))}>
          <ImageField label="الصورة" value={s.image}
            onChange={(v) => { const c = [...slides]; c[i] = { ...s, image: v }; onChange(c); }} />
          <FL>عنوان (اختياري)</FL>
          <GI value={s.title ?? ""} onChange={(e) => { const c = [...slides]; c[i] = { ...s, title: e.target.value }; onChange(c); }} />
          <FL>رابط (اختياري)</FL>
          <GI value={s.link ?? ""} onChange={(e) => { const c = [...slides]; c[i] = { ...s, link: e.target.value }; onChange(c); }} />
        </GCard>
      ))}
    </div>
  );
}

function PostsEditor({ posts, onChange }: { posts: Post[]; onChange: (p: Post[]) => void }) {
  return (
    <div className="space-y-3">
      <AddBtn
        onClick={() => onChange([
          { id: uid(), title: "", description: "", type: "new", date: new Date().toISOString(), likes: 0, comments: 0 },
          ...posts,
        ])}
        label="إضافة منشور"
      />
      {posts.map((p, i) => (
        <GCard key={p.id} onDelete={() => onChange(posts.filter((_, j) => j !== i))}>
          <FL>العنوان</FL>
          <GI value={p.title} onChange={(e) => { const c = [...posts]; c[i] = { ...p, title: e.target.value }; onChange(c); }} />
          <FL>الوصف</FL>
          <GT rows={3} value={p.description} onChange={(e) => { const c = [...posts]; c[i] = { ...p, description: e.target.value }; onChange(c); }} />
          <ImageField label="الصورة (اختياري)" value={p.image ?? ""}
            onChange={(v) => { const c = [...posts]; c[i] = { ...p, image: v }; onChange(c); }} />
          <FL>رابط خارجي (اختياري)</FL>
          <GI value={p.url ?? ""} onChange={(e) => { const c = [...posts]; c[i] = { ...p, url: e.target.value }; onChange(c); }} />
          <FL>النوع</FL>
          <select value={p.type}
            onChange={(e) => { const c = [...posts]; c[i] = { ...p, type: e.target.value as Post["type"] }; onChange(c); }}
            style={inputSx}>
            <option value="new">جديد</option>
            <option value="tip">نصيحة</option>
            <option value="update">تحديث</option>
            <option value="ai">AI</option>
          </select>
        </GCard>
      ))}
    </div>
  );
}

function CatMgr({ cats, onChange }: { cats: import("@/lib/admin-store").CatItem[]; onChange: (c: import("@/lib/admin-store").CatItem[]) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="lg-card rounded-2xl p-4">
      <FL>الأصناف</FL>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {cats.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#8B7D6F]"
            style={{ background: "rgba(181,168,152,0.12)", border: "1px solid rgba(181,168,152,0.25)" }}>
            {c.name}
            <button type="button" onClick={() => onChange(cats.filter((x) => x.id !== c.id))} className="text-red-400 ml-1">×</button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        <GI value={v} onChange={(e) => setV(e.target.value)} placeholder="اسم الصنف" />
        <button type="button"
          onClick={() => {
            if (v.trim() && !cats.find((c) => c.name === v.trim())) {
              onChange([...cats, { id: uid(), name: v.trim(), order: cats.length + 1 }]);
              setV("");
            }
          }}
          className="rounded-xl px-3 py-2 text-[12px] font-bold text-white"
          style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", whiteSpace: "nowrap" }}>
          إضافة
        </button>
      </div>
    </div>
  );
}

function AiEditor({
  items, cats, onChange,
}: {
  items: AiToolItem[];
  cats: import("@/lib/admin-store").CatItem[];
  onChange: (i: AiToolItem[], c: import("@/lib/admin-store").CatItem[]) => void;
}) {
  return (
    <div className="space-y-3">
      <CatMgr cats={cats} onChange={(c) => onChange(items, c)} />
      <AddBtn onClick={() => onChange([...items, { id: uid(), name: "", url: "", category: cats[0]?.name ?? "", order: items.length + 1 }], cats)} label="إضافة أداة AI" />
      {items.map((x, i) => (
        <GCard key={x.id} onDelete={() => onChange(items.filter((_, j) => j !== i), cats)}>
          <FL>الاسم</FL>
          <GI value={x.name} onChange={(e) => { const c=[...items]; c[i]={...x,name:e.target.value}; onChange(c,cats); }} />
          <FL>الرابط</FL>
          <GI value={x.url}  onChange={(e) => { const c=[...items]; c[i]={...x,url:e.target.value};  onChange(c,cats); }} />
          <ImageField label="أيقونة الأداة" value={x.icon ?? ""}
            onChange={(v) => { const c=[...items]; c[i]={...x,icon:v}; onChange(c,cats); }} />
          <FL>الصنف</FL>
          <select value={x.category} onChange={(e) => { const c=[...items]; c[i]={...x,category:e.target.value}; onChange(c,cats); }} style={inputSx}>
            <option value="">—</option>
            {cats.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <FL>الوصف (اختياري)</FL>
          <GT rows={2} value={x.description??""} onChange={(e) => { const c=[...items]; c[i]={...x,description:e.target.value}; onChange(c,cats); }} />
        </GCard>
      ))}
    </div>
  );
}

function UtilsEditor({
  items, cats, onChange,
}: {
  items: UtilityItem[];
  cats: import("@/lib/admin-store").CatItem[];
  onChange: (i: UtilityItem[], c: import("@/lib/admin-store").CatItem[]) => void;
}) {
  return (
    <div className="space-y-3">
      <CatMgr cats={cats} onChange={(c) => onChange(items, c)} />
      <AddBtn onClick={() => onChange([...items, { id: uid(), name: "", url: "", category: cats[0]?.name ?? "", order: items.length + 1 }], cats)} label="إضافة أداة" />
      {items.map((x, i) => (
        <GCard key={x.id} onDelete={() => onChange(items.filter((_, j) => j !== i), cats)}>
          <FL>الاسم</FL>
          <GI value={x.name} onChange={(e) => { const c=[...items]; c[i]={...x,name:e.target.value}; onChange(c,cats); }} />
          <FL>الرابط</FL>
          <GI value={x.url}  onChange={(e) => { const c=[...items]; c[i]={...x,url:e.target.value};  onChange(c,cats); }} />
          <ImageField label="أيقونة الأداة" value={x.icon ?? ""}
            onChange={(v) => { const c=[...items]; c[i]={...x,icon:v}; onChange(c,cats); }} />
          <FL>الصنف</FL>
          <select value={x.category} onChange={(e) => { const c=[...items]; c[i]={...x,category:e.target.value}; onChange(c,cats); }} style={inputSx}>
            <option value="">—</option>
            {cats.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <FL>الوصف (اختياري)</FL>
          <GT rows={2} value={x.description??""} onChange={(e) => { const c=[...items]; c[i]={...x,description:e.target.value}; onChange(c,cats); }} />
        </GCard>
      ))}
    </div>
  );
}

function ChatEditor({
  prompt, model, onSave,
}: { prompt: string; model: string; onSave: (p: string, m: string) => void }) {
  const [p, setP] = useState(prompt);
  const [m, setM] = useState(model);
  return (
    <div className="space-y-4 lg-card rounded-2xl p-4">
      <div className="lg-shine-stripe mb-1" />
      <div><FL>توجيه المساعد (System Prompt)</FL><GT rows={12} value={p} onChange={(e) => setP(e.target.value)} /></div>
      <div><FL>النموذج</FL><GI value={m} onChange={(e) => setM(e.target.value)} /></div>
      <button type="button" onClick={() => onSave(p, m)}
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold text-white"
        style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 10px rgba(181,168,152,0.38)" }}>
        <Save className="h-3.5 w-3.5" /> حفظ الإعدادات
      </button>
    </div>
  );
}
