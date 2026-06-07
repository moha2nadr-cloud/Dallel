import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { adminLogin, adminLogout, isAdminAuthed, uid, useCMS, type AiToolItem, type Post, type Slide, type UtilityItem } from "@/lib/admin-store";
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
  padding: "0.6rem 0.85rem",
  fontSize: 13,
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
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 lg-header">
        <h1 className="text-[16px] font-extrabold logo-gradient">لوحة التحكم</h1>
        <button type="button" onClick={onLogout}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-gray-500 transition-lg"
          style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(200,195,185,0.28)" }}>
          <LogOut className="h-3.5 w-3.5" /> خروج
        </button>
      </header>

      <div className="flex gap-5 px-4 pt-5">
        {/* Sidebar tabs */}
        <div className="flex w-[150px] shrink-0 flex-col gap-1 rounded-2xl p-1.5 lg-card h-fit sticky top-20">
          {TABS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className="w-full rounded-xl px-3 py-2.5 text-[12.5px] font-semibold transition-all text-right"
              style={tab === t.key
                ? { background: "linear-gradient(135deg,rgba(181,168,152,0.22),rgba(160,146,130,0.16))", border: "1px solid rgba(200,195,185,0.35)", color: "#72665A", boxShadow: "0 2px 8px rgba(181,168,152,0.18)" }
                : { color: "#9090A8" }
              }>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-16 animate-reveal-fade" key={tab}>
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
  return <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{children}</label>;
}
function GI(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} style={{ ...inputSx, ...(p.style ?? {}) }} onFocus={(e) => { e.target.style.borderColor = "rgba(181,168,152,0.55)"; }} onBlur={(e) => { e.target.style.borderColor = "rgba(200,195,185,0.35)"; }} />;
}
function GT(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} style={{ ...inputSx, resize: "vertical", minHeight: 80 }} onFocus={(e) => { e.target.style.borderColor = "rgba(181,168,152,0.55)"; }} onBlur={(e) => { e.target.style.borderColor = "rgba(200,195,185,0.35)"; }} />;
}
function GCard({ children, onDelete, onEdit }: { children: React.ReactNode; onDelete: () => void; onEdit?: () => void }) {
  return (
    <div className={`lg-card rounded-2xl p-4 space-y-3 ${onEdit ? "cursor-pointer" : ""}`}
      onClick={(e) => { if (onEdit && (e.target as HTMLElement).tagName !== "BUTTON") onEdit(); }}>
      <div className="lg-shine-stripe mb-1" />
      {children}
      <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-red-500 transition-lg"
        style={{ background: "rgba(254,242,242,0.80)", border: "1px solid rgba(239,68,68,0.18)" }}>
        <Trash2 className="h-3 w-3" /> حذف
      </button>
    </div>
  );
}
function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold text-white transition-lg"
      style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 10px rgba(181,168,152,0.38)" }}>
      <Plus className="h-3.5 w-3.5" /> {label}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-[15vh]"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setShow(false)}>
          <div className="w-full max-w-sm animate-scale-in rounded-2xl p-5 shadow-2xl"
            style={{ background: "#fff" }}
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
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-[15vh]"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setShow(false)}>
          <div className="w-full max-w-sm animate-scale-in rounded-2xl p-5 shadow-2xl"
            style={{ background: "#fff" }}
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
        </div>
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

function CatMgr({ cats, onChange }: { cats: string[]; onChange: (c: string[]) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="lg-card rounded-2xl p-4">
      <FL>الأصناف</FL>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {cats.map((c) => (
          <span key={c} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#8B7D6F]"
            style={{ background: "rgba(181,168,152,0.12)", border: "1px solid rgba(181,168,152,0.25)" }}>
            {c}
            <button type="button" onClick={() => onChange(cats.filter(x=>x!==c))} className="text-red-400 ml-1">×</button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        <GI value={v} onChange={(e)=>setV(e.target.value)} placeholder="اسم الصنف" />
        <button type="button" onClick={()=>{if(v.trim()&&!cats.includes(v.trim())){onChange([...cats,v.trim()]);setV("");}}}
          className="rounded-xl px-3 py-2 text-[12px] font-bold text-white transition-lg"
          style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", whiteSpace:"nowrap" }}>
          إضافة
        </button>
      </div>
    </div>
  );
}

function AiEditor({ items, cats, onChange }: { items: AiToolItem[]; cats: string[]; onChange: (i: AiToolItem[], c: string[]) => void }) {
  return (
    <div className="space-y-3">
      <CatMgr cats={cats} onChange={(c)=>onChange(items,c)} />
      <AddBtn onClick={()=>onChange([...items,{id:uid(),name:"",url:"",category:cats[0]??""}],cats)} label="إضافة أداة AI" />
      {items.map((x,i)=>(
        <GCard key={x.id} onDelete={()=>onChange(items.filter((_,j)=>j!==i),cats)}>
          <FL>الاسم</FL><GI value={x.name} onChange={(e)=>{const c=[...items];c[i]={...x,name:e.target.value};onChange(c,cats);}} />
          <FL>الرابط</FL><GI value={x.url}  onChange={(e)=>{const c=[...items];c[i]={...x,url:e.target.value};onChange(c,cats);}}  />
          <FL>رابط الأيقونة</FL><GI value={x.icon??""} onChange={(e)=>{const c=[...items];c[i]={...x,icon:e.target.value};onChange(c,cats);}} placeholder="https://..." />
          <FL>الصنف</FL>
          <select value={x.category} onChange={(e)=>{const c=[...items];c[i]={...x,category:e.target.value};onChange(c,cats);}} style={inputSx}>
            <option value="">—</option>{cats.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <FL>الوصف</FL><GT rows={2} value={x.description??""} onChange={(e)=>{const c=[...items];c[i]={...x,description:e.target.value};onChange(c,cats);}} />
        </GCard>
      ))}
    </div>
  );
}

function UtilsEditor({ items, cats, onChange }: { items: UtilityItem[]; cats: string[]; onChange: (i: UtilityItem[], c: string[]) => void }) {
  return (
    <div className="space-y-3">
      <CatMgr cats={cats} onChange={(c)=>onChange(items,c)} />
      <AddBtn onClick={()=>onChange([...items,{id:uid(),name:"",url:"",category:cats[0]??""}],cats)} label="إضافة أداة" />
      {items.map((x,i)=>(
        <GCard key={x.id} onDelete={()=>onChange(items.filter((_,j)=>j!==i),cats)}>
          <FL>الاسم</FL><GI value={x.name} onChange={(e)=>{const c=[...items];c[i]={...x,name:e.target.value};onChange(c,cats);}} />
          <FL>الرابط</FL><GI value={x.url}  onChange={(e)=>{const c=[...items];c[i]={...x,url:e.target.value};onChange(c,cats);}}  />
          <FL>رابط الأيقونة</FL><GI value={x.icon??""} onChange={(e)=>{const c=[...items];c[i]={...x,icon:e.target.value};onChange(c,cats);}} placeholder="https://..." />
          <FL>الصنف</FL>
          <select value={x.category} onChange={(e)=>{const c=[...items];c[i]={...x,category:e.target.value};onChange(c,cats);}} style={inputSx}>
            <option value="">—</option>{cats.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <FL>الوصف</FL><GT rows={2} value={x.description??""} onChange={(e)=>{const c=[...items];c[i]={...x,description:e.target.value};onChange(c,cats);}} />
        </GCard>
      ))}
    </div>
  );
}

function ChatEditor({ prompt, model, onSave }: { prompt: string; model: string; onSave: (p: string, m: string) => void }) {
  const [p, setP] = useState(prompt);
  const [m, setM] = useState(model);
  return (
    <div className="space-y-4 lg-card rounded-2xl p-4">
      <div className="lg-shine-stripe mb-1" />
      <div><FL>توجيه المساعد (System Prompt)</FL><GT rows={12} value={p} onChange={(e)=>setP(e.target.value)} /></div>
      <div><FL>النموذج</FL><GI value={m} onChange={(e)=>setM(e.target.value)} placeholder="llama-3.3-70b-versatile" /></div>
      <button type="button" onClick={()=>onSave(p,m)}
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold text-white transition-lg"
        style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 2px 10px rgba(181,168,152,0.38)" }}>
        <Save className="h-3.5 w-3.5" /> حفظ
      </button>
    </div>
  );
}
