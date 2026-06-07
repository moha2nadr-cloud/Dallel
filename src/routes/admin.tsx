import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { adminLogin, adminLogout, isAdminAuthed, uid, useCMS, type AiToolItem, type CatItem, type Post, type Slide, type UtilityItem } from "@/lib/admin-store";
import { Lock, LogOut, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة التحكم — دليل" }] }),
  component: Admin,
});

const inputSx: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.80)",
  border: "1px solid rgba(200,195,185,0.35)",
  borderRadius: "0.75rem",
  padding: "0.7rem 1rem",
  fontSize: 14,
  color: "#1A1A24",
  outline: "none",
  fontFamily: "Tajawal, sans-serif",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.90)",
  backdropFilter: "blur(12px)",
};

function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  useEffect(() => setAuthed(isAdminAuthed()), []);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 bg-white">
        <div className="lg-panel w-full max-w-sm rounded-3xl p-6 shadow-xl animate-reveal-up">
          <div className="lg-shine-stripe mb-5" />
          <div className="mb-5 flex items-center gap-3">
            <div className="lg-card flex h-11 w-11 items-center justify-center rounded-2xl">
              <Lock className="h-5 w-5 text-[#8B7D6F]" />
            </div>
            <div>
              <h1 className="text-[15px] font-extrabold text-gray-900">لوحة التحكم</h1>
              <p className="text-[11px] text-gray-400">أدخل كلمة السر للمتابعة</p>
            </div>
          </div>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { if (adminLogin(pw)) { setAuthed(true); toast.success("تم الدخول"); } else toast.error("كلمة سر خاطئة"); } }}
            placeholder="كلمة السر" style={inputSx} />
          <button type="button" onClick={() => { if (adminLogin(pw)) { setAuthed(true); toast.success("تم الدخول"); } else toast.error("كلمة سر خاطئة"); }}
            className="mt-3 w-full rounded-2xl py-3 text-sm font-bold text-white transition-lg"
            style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 4px 16px rgba(181,168,152,0.38)" }}>
            دخول
          </button>
          <button type="button" onClick={() => navigate({ to: "/home" })}
            className="mt-2 w-full rounded-2xl py-2.5 text-[12px] font-semibold text-gray-500 transition-lg"
            style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(200,195,185,0.28)" }}>
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
    { key: "posts",  label: "المنشورات" },
    { key: "ai",     label: "أدوات AI" },
    { key: "utils",  label: "الأدوات العامة" },
    { key: "chat",   label: "المساعد" },
  ] as const;
  const [tab, setTab] = useState<typeof TABS[number]["key"]>("slides");

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[rgba(200,195,185,0.22)] bg-white/90 px-6 py-4"
        style={{ backdropFilter: "blur(12px)" }}>
        <h1 className="text-lg font-extrabold logo-gradient">لوحة التحكم</h1>
        <button type="button" onClick={onLogout}
          className="flex items-center gap-1.5 rounded-lg border border-[rgba(200,195,185,0.28)] bg-white/80 px-4 py-2 text-[13px] font-semibold text-gray-500 transition-lg">
          <LogOut className="h-4 w-4" /> خروج
        </button>
      </header>

      <div className="mx-auto flex max-w-5xl gap-6 px-6 pt-6">
        {/* Sidebar tabs */}
        <div className="flex w-48 shrink-0 flex-col gap-1 rounded-xl border border-[rgba(200,195,185,0.22)] bg-[rgba(255,255,255,0.82)] p-2 h-fit sticky top-20 shadow-sm">
          {TABS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className="w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all text-right"
              style={tab === t.key
                ? { background: "linear-gradient(135deg,rgba(181,168,152,0.22),rgba(160,146,130,0.16))", border: "1px solid rgba(200,195,185,0.35)", color: "#72665A", boxShadow: "0 2px 8px rgba(181,168,152,0.18)" }
                : { color: "#9090A8" }
              }>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-12 animate-reveal-fade" key={tab}>
          {tab === "slides" && <SlidesEditor slides={cms.slides} onChange={(s) => setCms({ ...cms, slides: s })} />}
          {tab === "posts"  && <PostsEditor  posts={cms.posts}   onChange={(p) => setCms({ ...cms, posts: p })} />}
          {tab === "ai"     && <AiEditor    items={cms.aiTools}  cats={cms.aiCategories}   onChange={(i, c) => setCms({ ...cms, aiTools: i, aiCategories: c })} />}
          {tab === "utils"  && <UtilsEditor items={cms.utilities} cats={cms.utilCategories} onChange={(i, c) => setCms({ ...cms, utilities: i, utilCategories: c })} />}
          {tab === "chat"   && <ChatEditor prompt={cms.chatSystemPrompt} model={cms.chatModel} onSave={(p, m) => { setCms({ ...cms, chatSystemPrompt: p, chatModel: m }); toast.success("تم الحفظ"); }} />}
        </div>
      </div>
    </div>
  );
}

function FL({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{children}</label>;
}
function GI(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} style={{ ...inputSx, ...(p.style ?? {}) }} onFocus={(e) => { e.target.style.borderColor = "rgba(181,168,152,0.55)"; }} onBlur={(e) => { e.target.style.borderColor = "rgba(200,195,185,0.35)"; }} />;
}
function GT(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} style={{ ...inputSx, resize: "vertical", minHeight: 100 }} onFocus={(e) => { e.target.style.borderColor = "rgba(181,168,152,0.55)"; }} onBlur={(e) => { e.target.style.borderColor = "rgba(200,195,185,0.35)"; }} />;
}
function GCard({ children, onDelete, onEdit }: { children: React.ReactNode; onDelete: () => void; onEdit?: () => void }) {
  return (
    <div className={`border border-[rgba(200,195,185,0.22)] rounded-2xl p-5 space-y-3 bg-white/80 shadow-sm ${onEdit ? "cursor-pointer" : ""}`}
      onClick={(e) => { if (onEdit && (e.target as HTMLElement).tagName !== "BUTTON") onEdit(); }}>
      {children}
      <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(239,68,68,0.18)] bg-red-50/80 px-3.5 py-1.5 text-[12px] font-semibold text-red-500 transition-lg">
        <Trash2 className="h-3.5 w-3.5" /> حذف
      </button>
    </div>
  );
}
function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.15)] px-4 py-2 text-[13px] font-bold text-white transition-lg"
      style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 10px rgba(181,168,152,0.38)" }}>
      <Plus className="h-4 w-4" /> {label}
    </button>
  );
}

function SlidesEditor({ slides, onChange }: { slides: Slide[]; onChange: (s: Slide[]) => void }) {
  const [show, setShow] = useState(false);
  const [imgData, setImgData] = useState("");
  const [imgErr, setImgErr] = useState(false);
  const [title, setTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function open() { setImgData(""); setTitle(""); setImgErr(false); setShow(true); }
  function save() {
    if (!imgData) { setImgErr(true); return; }
    onChange([...slides, { id: uid(), image: imgData, title: title.trim() || undefined }]);
    setShow(false);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setImgData(r.result as string); setImgErr(false); };
    r.readAsDataURL(f);
  }

  return (
    <div className="space-y-3">
      <AddBtn onClick={open} label="إضافة سلايد" />

      {/* Modal */}
      {show && (
        <>
          <div className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={() => setShow(false)} />
          <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 animate-scale-in rounded-t-2xl p-6 pb-8 shadow-2xl"
            style={{ background: "#fff", maxHeight: "85vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-[15px] font-extrabold text-gray-900">إضافة سلايد</h2>

            <FL>الصورة</FL>
            <div onClick={() => fileRef.current?.click()}
              className={`mb-3 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed p-4 transition-lg ${imgErr ? "border-red-400 bg-red-50" : "border-[rgba(200,195,185,0.5)] bg-[rgba(200,195,185,0.08)]"}`}>
              {imgData
                ? <img src={imgData} alt="" className="max-h-32 rounded-lg object-contain" />
                : <span className="text-[12px] font-semibold text-gray-400">اضغط لاختيار صورة</span>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            <FL>العنوان</FL>
            <GI value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان السلايد (اختياري)" />

            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShow(false)}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-gray-500 transition-lg"
                style={{ background: "rgba(200,195,185,0.2)" }}>
                إلغاء
              </button>
              <button type="button" onClick={save}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-white transition-lg"
                style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 10px rgba(181,168,152,0.38)" }}>
                حفظ
              </button>
            </div>
          </div>
        </>
      )}

      {slides.map((s, i) => (
        <GCard key={s.id} onDelete={() => onChange(slides.filter((_, j) => j !== i))}>
          {s.image && <img src={s.image} alt="" className="w-full rounded-xl object-cover max-h-40" />}
          <FL>العنوان</FL><GI value={s.title??""} onChange={(e) => { const c=[...slides]; c[i]={...s,title:e.target.value}; onChange(c); }} />
          <FL>الرابط</FL><GI value={s.link??""} onChange={(e) => { const c=[...slides]; c[i]={...s,link:e.target.value}; onChange(c); }} placeholder="https://..." />
        </GCard>
      ))}
    </div>
  );
}

function PostsEditor({ posts, onChange }: { posts: Post[]; onChange: (p: Post[]) => void }) {
  const [show, setShow] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [imgData, setImgData] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<Post["type"]>("new");
  const fileRef = useRef<HTMLInputElement>(null);

  function openForAdd() {
    setEditIdx(null); setImgData(""); setTitle(""); setDesc(""); setUrl(""); setType("new"); setShow(true);
  }
  function openForEdit(i: number) {
    const p = posts[i];
    setEditIdx(i); setImgData(p.image ?? ""); setTitle(p.title); setDesc(p.description); setUrl(p.url ?? ""); setType(p.type); setShow(true);
  }
  function save() {
    const post: Post = {
      id: editIdx !== null ? posts[editIdx].id : uid(),
      title,
      description: desc,
      image: imgData || undefined,
      url: url || undefined,
      type,
      date: editIdx !== null ? posts[editIdx].date : new Date().toISOString(),
      likes: editIdx !== null ? posts[editIdx].likes : 0,
      comments: editIdx !== null ? posts[editIdx].comments : 0,
    };
    const c = [...posts];
    if (editIdx !== null) c[editIdx] = post; else c.unshift(post);
    onChange(c);
    setShow(false);
  }
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImgData(r.result as string);
    r.readAsDataURL(f);
  }

  return (
    <div className="space-y-3">
      <AddBtn onClick={openForAdd} label="إضافة منشور" />

      {show && (
        <>
          <div className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={() => setShow(false)} />
          <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 animate-scale-in rounded-t-2xl p-6 pb-8 shadow-2xl"
            style={{ background: "#fff", maxHeight: "85vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-[15px] font-extrabold text-gray-900">
              {editIdx !== null ? "تعديل منشور" : "إضافة منشور"}
            </h2>

            <div onClick={() => fileRef.current?.click()}
              className="mb-3 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed p-4 transition-lg"
              style={{ borderColor: "rgba(200,195,185,0.5)", background: "rgba(200,195,185,0.08)" }}>
              {imgData
                ? <img src={imgData} alt="" className="max-h-32 rounded-lg object-contain" />
                : <span className="text-[12px] font-semibold text-gray-400">اضغط لاختيار صورة</span>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            <FL>العنوان</FL>
            <GI value={title} onChange={(e) => setTitle(e.target.value)} placeholder="العنوان (اختياري)" />
            <div className="mt-3"><FL>النص</FL>
            <GT rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="النص (اختياري)" /></div>
            <div className="mt-3"><FL>الرابط</FL>
            <GI value={url} onChange={(e) => setUrl(e.target.value)} placeholder="رابط خارجي (اختياري)" /></div>
            <div className="mt-3"><FL>النوع</FL>
            <select value={type} onChange={(e) => setType(e.target.value as Post["type"])} style={inputSx}>
              <option value="new">جديد</option><option value="tip">نصيحة</option><option value="update">تحديث</option><option value="ai">AI</option>
            </select></div>

            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShow(false)}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-gray-500 transition-lg"
                style={{ background: "rgba(200,195,185,0.2)" }}>
                إلغاء
              </button>
              <button type="button" onClick={save}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-white transition-lg"
                style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 10px rgba(181,168,152,0.38)" }}>
                حفظ
              </button>
            </div>
          </div>
        </>
      )}

      {posts.map((p, i) => (
        <GCard key={p.id} onEdit={() => openForEdit(i)} onDelete={() => onChange(posts.filter((_,j)=>j!==i))}>
          {(p.image ?? imgData) && <img src={p.image} alt="" className="w-full rounded-xl object-cover max-h-40" />}
          {p.title && <h3 className="text-[14px] font-bold text-gray-800">{p.title}</h3>}
          {p.description && <p className="text-[12px] text-gray-500 leading-relaxed">{p.description}</p>}
        </GCard>
      ))}
    </div>
  );
}

type CatOrTool<T> = { cats: CatItem[]; items: T[]; onCats: (c: CatItem[]) => void; onItems: (i: T[]) => void; catLabel: string; itemLabel: string };

function CatModal({ show, onClose, onSave, edit }: { show: boolean; onClose: () => void; onSave: (name: string, order: number) => void; edit?: CatItem }) {
  const [name, setName] = useState("");
  const [order, setOrder] = useState(0);
  useEffect(() => { if (show) { setName(edit?.name ?? ""); setOrder(edit?.order ?? 0); } }, [show, edit]);
  if (!show) return null;
  return (
    <>
      <div className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 animate-scale-in rounded-t-2xl p-6 pb-8 shadow-2xl" style={{ background: "#fff" }}
        onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-[15px] font-extrabold text-gray-900">{edit ? "تعديل صنف" : "إضافة صنف"}</h2>
        <FL>اسم الصنف</FL>
        <GI value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الصنف" />
        <div className="mt-3"><FL>الترتيب</FL>
        <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))}
          style={inputSx} placeholder="0" min={0} /></div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-gray-500 transition-lg"
            style={{ background: "rgba(200,195,185,0.2)" }}>إلغاء</button>
          <button type="button" onClick={() => onSave(name, order)} className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-white transition-lg"
            style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 10px rgba(181,168,152,0.38)" }}>حفظ</button>
        </div>
      </div>
    </>
  );
}

function ToolModal({ show, onClose, onSave, onDelete, edit, cats }: {
  show: boolean; onClose: () => void;
  onSave: (data: { name: string; url: string; category: string; icon?: string; description?: string; order: number; imgData?: string }) => void;
  onDelete?: () => void; edit?: AiToolItem | UtilityItem | null; cats: CatItem[];
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);
  const [imgData, setImgData] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!show) return;
    setName(edit?.name ?? ""); setUrl(edit?.url ?? ""); setCategory(edit?.category ?? cats[0]?.name ?? "");
    setIcon(edit?.icon ?? ""); setDescription(edit?.description ?? ""); setOrder(edit?.order ?? 0); setImgData("");
  }, [show, edit, cats]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setImgData(r.result as string); r.readAsDataURL(f);
  }

  if (!show) return null;
  return (
    <>
      <div className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 animate-scale-in rounded-t-2xl p-6 pb-8 shadow-2xl" style={{ background: "#fff", maxHeight: "80vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-[15px] font-extrabold text-gray-900">{edit ? "تعديل موقع" : "إضافة موقع"}</h2>

        <FL>رقم الموقع (الترتيب)</FL>
        <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} style={inputSx} min={0} />

        <div className="mt-3"><FL>الاسم</FL>
        <GI value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الموقع" /></div>

        <div className="mt-3"><FL>الوصف</FL>
        <GT rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف الموقع (اختياري)" /></div>

        <div className="mt-3"><FL>الصنف</FL>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputSx}>
          {cats.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select></div>

        <div className="mt-3"><FL>الرابط</FL>
        <GI value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></div>

        <div className="mt-3"><FL>رابط الصورة (اختياري)</FL>
        <GI value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="https://..." /></div>

        <div className="mt-3">
          <FL>رفع صورة (اختياري)</FL>
          <div onClick={() => fileRef.current?.click()}
            className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed p-3 transition-lg"
            style={{ borderColor: "rgba(200,195,185,0.5)", background: "rgba(200,195,185,0.08)" }}>
            {imgData
              ? <img src={imgData} alt="" className="max-h-24 rounded-lg object-contain" />
              : <span className="text-[12px] font-semibold text-gray-400">اضغط لاختيار صورة</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-gray-500 transition-lg"
            style={{ background: "rgba(200,195,185,0.2)" }}>إلغاء</button>
          <button type="button" onClick={() => onSave({ name, url, category, icon: icon || undefined, description: description || undefined, order, imgData: imgData || undefined })}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-white transition-lg"
            style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 10px rgba(181,168,152,0.38)" }}>حفظ</button>
          {edit && onDelete && (
            <button type="button" onClick={onDelete} className="rounded-xl px-3 py-2.5 text-[13px] font-bold text-red-500 transition-lg"
              style={{ background: "rgba(254,242,242,0.80)", border: "1px solid rgba(239,68,68,0.18)" }}>
              <Trash2 className="inline h-3.5 w-3.5 ml-1" />حذف
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function CatList({ cats, onEdit, onDelete }: { cats: CatItem[]; onEdit: (c: CatItem) => void; onDelete: (id: string) => void }) {
  const sorted = [...cats].sort((a, b) => a.order - b.order);
  return (
    <div className="space-y-2">
      {sorted.map((c) => (
        <div key={c.id} onClick={() => onEdit(c)}
          className="flex items-center justify-between rounded-xl border border-[rgba(200,195,185,0.22)] bg-white/80 px-4 py-3 cursor-pointer transition-lg shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)" }}>{c.order}</span>
            <span className="text-[14px] font-semibold text-gray-700">{c.name}</span>
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
            className="rounded-lg border border-[rgba(239,68,68,0.18)] bg-red-50/80 px-3 py-1 text-[11px] font-semibold text-red-500">× حذف</button>
        </div>
      ))}
    </div>
  );
}

function AiEditor({ items, cats, onChange }: { items: AiToolItem[]; cats: CatItem[]; onChange: (i: AiToolItem[], c: CatItem[]) => void }) {
  const [subTab, setSubTab] = useState<"cats" | "tools">("cats");
  const [catShow, setCatShow] = useState(false); const [catEdit, setCatEdit] = useState<CatItem | undefined>();
  const [toolShow, setToolShow] = useState(false); const [toolEditIdx, setToolEditIdx] = useState<number | null>(null);

  function saveCat(name: string, order: number) {
    if (!name.trim()) return;
    if (catEdit) {
      const c = cats.map((x) => x.id === catEdit.id ? { ...x, name: name.trim(), order } : x);
      onChange(items, c);
    } else {
      onChange(items, [...cats, { id: uid(), name: name.trim(), order }]);
    }
    setCatShow(false); setCatEdit(undefined);
  }
  function deleteCat(id: string) {
    onChange(items.filter((x) => x.category !== cats.find((c) => c.id === id)?.name), cats.filter((c) => c.id !== id));
  }

  function saveTool(data: { name: string; url: string; category: string; icon?: string; description?: string; order: number; imgData?: string }) {
    if (!data.name.trim() || !data.url.trim()) return;
    const tool: AiToolItem = {
      id: toolEditIdx !== null ? items[toolEditIdx].id : uid(),
      name: data.name.trim(), url: data.url.trim(), category: data.category,
      icon: data.imgData || data.icon || undefined,
      description: data.description?.trim() || undefined, order: data.order,
    };
    const c = [...items];
    if (toolEditIdx !== null) c[toolEditIdx] = tool; else c.push(tool);
    onChange(c, cats);
    setToolShow(false); setToolEditIdx(null);
  }
  function deleteTool() {
    if (toolEditIdx === null) return;
    onChange(items.filter((_, j) => j !== toolEditIdx), cats);
    setToolShow(false); setToolEditIdx(null);
  }
  function openToolAdd() { setToolEditIdx(null); setToolShow(true); }
  function openToolEdit(i: number) { setToolEditIdx(i); setToolShow(true); }

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button type="button" onClick={() => setSubTab("cats")} className="rounded-lg border border-[rgba(200,195,185,0.22)] px-4 py-2 text-[13px] font-bold transition-all"
          style={subTab === "cats"
            ? { background: "linear-gradient(135deg,rgba(181,168,152,0.22),rgba(160,146,130,0.16))", border: "1px solid rgba(200,195,185,0.35)", color: "#72665A", boxShadow: "0 2px 8px rgba(181,168,152,0.18)" }
            : { background: "rgba(255,255,255,0.80)", color: "#9090A8" }}>الأصناف</button>
        <button type="button" onClick={() => setSubTab("tools")} className="rounded-lg border border-[rgba(200,195,185,0.22)] px-4 py-2 text-[13px] font-bold transition-all"
          style={subTab === "tools"
            ? { background: "linear-gradient(135deg,rgba(181,168,152,0.22),rgba(160,146,130,0.16))", border: "1px solid rgba(200,195,185,0.35)", color: "#72665A", boxShadow: "0 2px 8px rgba(181,168,152,0.18)" }
            : { background: "rgba(255,255,255,0.80)", color: "#9090A8" }}>المواقع</button>
      </div>

      {subTab === "cats" && (
        <div className="space-y-3">
          <AddBtn onClick={() => { setCatEdit(undefined); setCatShow(true); }} label="إضافة صنف" />
          <CatList cats={cats} onEdit={(c) => { setCatEdit(c); setCatShow(true); }} onDelete={deleteCat} />
        </div>
      )}

      {subTab === "tools" && (
        <div className="space-y-3">
          <AddBtn onClick={openToolAdd} label="إضافة موقع" />
          {sortedItems.map((x) => {
            const realIdx = items.findIndex((t) => t.id === x.id);
            return (
              <GCard key={x.id} onEdit={() => openToolEdit(realIdx)} onDelete={() => onChange(items.filter((_, j) => j !== realIdx), cats)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)" }}>{x.order}</span>
                  <h3 className="text-[14px] font-bold text-gray-800">{x.name}</h3>
                </div>
                {x.description && <p className="text-[12px] text-gray-500 leading-relaxed">{x.description}</p>}
                <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-[#8B7D6F]"
                  style={{ background: "rgba(181,168,152,0.12)", border: "1px solid rgba(181,168,152,0.25)" }}>{x.category}</span>
              </GCard>
            );
          })}
        </div>
      )}

      <CatModal show={catShow} onClose={() => { setCatShow(false); setCatEdit(undefined); }} onSave={saveCat} edit={catEdit} />
      <ToolModal show={toolShow} onClose={() => { setToolShow(false); setToolEditIdx(null); }}
        onSave={saveTool} onDelete={toolEditIdx !== null ? deleteTool : undefined}
        edit={toolEditIdx !== null ? items[toolEditIdx] : null} cats={cats} />
    </div>
  );
}

function UtilsEditor({ items, cats, onChange }: { items: UtilityItem[]; cats: CatItem[]; onChange: (i: UtilityItem[], c: CatItem[]) => void }) {
  const [subTab, setSubTab] = useState<"cats" | "tools">("cats");
  const [catShow, setCatShow] = useState(false); const [catEdit, setCatEdit] = useState<CatItem | undefined>();
  const [toolShow, setToolShow] = useState(false); const [toolEditIdx, setToolEditIdx] = useState<number | null>(null);

  function saveCat(name: string, order: number) {
    if (!name.trim()) return;
    if (catEdit) {
      const c = cats.map((x) => x.id === catEdit.id ? { ...x, name: name.trim(), order } : x);
      onChange(items, c);
    } else {
      onChange(items, [...cats, { id: uid(), name: name.trim(), order }]);
    }
    setCatShow(false); setCatEdit(undefined);
  }
  function deleteCat(id: string) {
    onChange(items.filter((x) => x.category !== cats.find((c) => c.id === id)?.name), cats.filter((c) => c.id !== id));
  }

  function saveTool(data: { name: string; url: string; category: string; icon?: string; description?: string; order: number; imgData?: string }) {
    if (!data.name.trim() || !data.url.trim()) return;
    const tool: UtilityItem = {
      id: toolEditIdx !== null ? items[toolEditIdx].id : uid(),
      name: data.name.trim(), url: data.url.trim(), category: data.category,
      icon: data.imgData || data.icon || undefined,
      description: data.description?.trim() || undefined, order: data.order,
    };
    const c = [...items];
    if (toolEditIdx !== null) c[toolEditIdx] = tool; else c.push(tool);
    onChange(c, cats);
    setToolShow(false); setToolEditIdx(null);
  }
  function deleteTool() {
    if (toolEditIdx === null) return;
    onChange(items.filter((_, j) => j !== toolEditIdx), cats);
    setToolShow(false); setToolEditIdx(null);
  }
  function openToolAdd() { setToolEditIdx(null); setToolShow(true); }
  function openToolEdit(i: number) { setToolEditIdx(i); setToolShow(true); }

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button type="button" onClick={() => setSubTab("cats")} className="rounded-lg border border-[rgba(200,195,185,0.22)] px-4 py-2 text-[13px] font-bold transition-all"
          style={subTab === "cats"
            ? { background: "linear-gradient(135deg,rgba(181,168,152,0.22),rgba(160,146,130,0.16))", border: "1px solid rgba(200,195,185,0.35)", color: "#72665A", boxShadow: "0 2px 8px rgba(181,168,152,0.18)" }
            : { background: "rgba(255,255,255,0.80)", color: "#9090A8" }}>الأصناف</button>
        <button type="button" onClick={() => setSubTab("tools")} className="rounded-lg border border-[rgba(200,195,185,0.22)] px-4 py-2 text-[13px] font-bold transition-all"
          style={subTab === "tools"
            ? { background: "linear-gradient(135deg,rgba(181,168,152,0.22),rgba(160,146,130,0.16))", border: "1px solid rgba(200,195,185,0.35)", color: "#72665A", boxShadow: "0 2px 8px rgba(181,168,152,0.18)" }
            : { background: "rgba(255,255,255,0.80)", color: "#9090A8" }}>الأدوات</button>
      </div>

      {subTab === "cats" && (
        <div className="space-y-3">
          <AddBtn onClick={() => { setCatEdit(undefined); setCatShow(true); }} label="إضافة صنف" />
          <CatList cats={cats} onEdit={(c) => { setCatEdit(c); setCatShow(true); }} onDelete={deleteCat} />
        </div>
      )}

      {subTab === "tools" && (
        <div className="space-y-3">
          <AddBtn onClick={openToolAdd} label="إضافة أداة" />
          {sortedItems.map((x) => {
            const realIdx = items.findIndex((t) => t.id === x.id);
            return (
              <GCard key={x.id} onEdit={() => openToolEdit(realIdx)} onDelete={() => onChange(items.filter((_, j) => j !== realIdx), cats)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)" }}>{x.order}</span>
                  <h3 className="text-[14px] font-bold text-gray-800">{x.name}</h3>
                </div>
                {x.description && <p className="text-[12px] text-gray-500 leading-relaxed">{x.description}</p>}
                <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-[#8B7D6F]"
                  style={{ background: "rgba(181,168,152,0.12)", border: "1px solid rgba(181,168,152,0.25)" }}>{x.category}</span>
              </GCard>
            );
          })}
        </div>
      )}

      <CatModal show={catShow} onClose={() => { setCatShow(false); setCatEdit(undefined); }} onSave={saveCat} edit={catEdit} />
      <ToolModal show={toolShow} onClose={() => { setToolShow(false); setToolEditIdx(null); }}
        onSave={saveTool} onDelete={toolEditIdx !== null ? deleteTool : undefined}
        edit={toolEditIdx !== null ? items[toolEditIdx] : null} cats={cats} />
    </div>
  );
}

function ChatEditor({ prompt, model, onSave }: { prompt: string; model: string; onSave: (p: string, m: string) => void }) {
  const [p, setP] = useState(prompt);
  const [m, setM] = useState(model);
  return (
    <div className="space-y-4 rounded-2xl border border-[rgba(200,195,185,0.22)] bg-white/80 p-5 shadow-sm">
      <div><FL>توجيه المساعد (System Prompt)</FL><GT rows={15} value={p} onChange={(e)=>setP(e.target.value)} /></div>
      <div><FL>النموذج</FL><GI value={m} onChange={(e)=>setM(e.target.value)} placeholder="llama-3.3-70b-versatile" /></div>
      <button type="button" onClick={()=>onSave(p,m)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.15)] px-5 py-2.5 text-[13px] font-bold text-white transition-lg"
        style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 10px rgba(181,168,152,0.38)" }}>
        <Save className="h-4 w-4" /> حفظ
      </button>
    </div>
  );
}
