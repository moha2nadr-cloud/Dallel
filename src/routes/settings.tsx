import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { clearProfile, getProfile, clearChatHistory, getFavs, getLikes, getUserId, clearAll } from "@/lib/storage";
import { useEffect, useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { syncProfile, syncFavorites, syncLikes, syncChat } from "@/lib/api/sync.functions";
import { Globe, Info, LogOut, Trash2, User, Pencil, AlertTriangle, ChevronLeft } from "lucide-react";
import { useLang, setLang, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "الإعدادات — دليل" }] }),
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const [lang, t] = useLang();
  const [profile, setP] = useState<ReturnType<typeof getProfile>>(null);
  const doSyncProfile = useServerFn(syncProfile);
  const doSyncFavs    = useServerFn(syncFavorites);
  const doSyncLikes   = useServerFn(syncLikes);
  const doSyncChat    = useServerFn(syncChat);
  useEffect(() => setP(getProfile()), []);

  const [modal, setModal] = useState<"logout" | "delete" | "lang" | null>(null);
  const [countdown, setCountdown] = useState(7);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (modal === "delete") {
      setCountdown(7);
      timerRef.current = setInterval(() => setCountdown((c) => { if (c <= 1) { clearInterval(timerRef.current); return 0; } return c - 1; }), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [modal]);

  const closeModal = () => { clearInterval(timerRef.current); setModal(null); };

  const pushAll = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const p = getProfile();
      if (p) await doSyncProfile({ data: { userId, ...p } });
      for (const kind of ["post", "ai", "tool", "chat"] as const) { const items = getFavs(kind); if (items.length) await doSyncFavs({ data: { userId, kind, itemIds: items } }); }
      const lm = getLikes(); const li = Object.keys(lm).filter((k) => lm[k]); if (li.length) await doSyncLikes({ data: { userId, itemIds: li } });
      const { getChatHistory: gch } = await import("@/lib/storage"); const ch = gch(); if (ch.length) await doSyncChat({ data: { userId, messages: ch } });
    } catch { /* silent */ }
  };

  const onLogout = async () => { closeModal(); await pushAll(); clearProfile(); clearChatHistory(); navigate({ to: "/login" }); };
  const onDelete = () => { closeModal(); clearAll(); sessionStorage.clear(); navigate({ to: "/login" }); };

  return (
    <WithBottomBar>
      {/* Profile card — directly after header, no title above */}
      <div className="lg-panel mx-4 mt-3 rounded-3xl p-5 animate-reveal-up">
        <div className="lg-shine-stripe mb-4" />
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.90)", border: "1px solid rgba(200,195,185,0.35)", boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}>
            {profile?.picture ? <img src={profile.picture} alt="" className="h-full w-full object-cover" /> :
              profile?.name ? <span className="text-xl font-extrabold logo-gradient">{profile.name[0]}</span> :
              <User className="h-6 w-6 text-gray-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-gray-900">{profile?.name ?? t.guest}</p>
            {profile && <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">{profile.specialization} · {profile.university}</p>}
          </div>
        </div>
        <Link to="/onboarding"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-[12px] font-semibold text-[#8B7D6F] transition-lg"
          style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(200,195,185,0.30)", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <Pencil className="h-3.5 w-3.5" /> {t.edit_profile}
        </Link>
      </div>

      <Group delay={0.10}>
        <Row icon={Globe}  label={t.language}     value={lang === "ar" ? t.arabic : t.english} onClick={() => setModal("lang")} />
      </Group>

      <Group delay={0.14}>
        <Row icon={Info} label={t.about} value={t.version} />
      </Group>

      <Group delay={0.18}>
        <Row icon={Trash2} label={t.delete_account} danger onClick={() => setModal("delete")} />
      </Group>

      <div className="px-4 pt-4 pb-2 animate-reveal-up" style={{ animationDelay: "0.22s" }}>
        <button type="button" onClick={() => setModal("logout")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-lg active:scale-[0.98]"
          style={{ background: "rgba(254,242,242,0.80)", border: "1px solid rgba(239,68,68,0.20)", color: "#dc2626", backdropFilter: "blur(16px)" }}>
          <LogOut className="h-4 w-4" /> {t.logout}
        </button>
      </div>

      <div className="mt-8 mb-6 flex flex-col items-center gap-1 px-4 animate-reveal-up" style={{ animationDelay: "0.26s" }}>
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium">POWERED BY</span>
        <span className="text-[16px] font-black tracking-[0.25em] uppercase"
          style={{
            background: "linear-gradient(135deg, #B5A898, #8B7D6F)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
          NOVA STUDIO
        </span>
      </div>

      {/* Language modal */}
      {modal === "lang" && (
        <div onClick={closeModal} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
          <div onClick={e => e.stopPropagation()} className="mx-4 w-[300px] rounded-2xl bg-white px-5 py-5 text-center shadow-lg animate-scale-in">
            <p className="text-[15px] font-bold text-gray-900 mb-4">اختر اللغة</p>
            <button type="button" onClick={() => { setLang("ar"); closeModal(); }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-[13px] font-semibold transition-all mb-2"
              style={lang === "ar"
                ? { background: "linear-gradient(135deg,rgba(181,168,152,0.15),rgba(139,125,111,0.10))", border: "1px solid rgba(181,168,152,0.30)", color: "#72665A" }
                : { background: "rgba(255,255,255,0.80)", border: "1px solid rgba(200,195,185,0.20)", color: "#9090A8" }}>
              <span>عربي</span>
              {lang === "ar" && <span className="text-[#8B7D6F]">✓</span>}
            </button>
            <button type="button" onClick={() => { setLang("en"); closeModal(); }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-[13px] font-semibold transition-all"
              style={lang === "en"
                ? { background: "linear-gradient(135deg,rgba(181,168,152,0.15),rgba(139,125,111,0.10))", border: "1px solid rgba(181,168,152,0.30)", color: "#72665A" }
                : { background: "rgba(255,255,255,0.80)", border: "1px solid rgba(200,195,185,0.20)", color: "#9090A8" }}>
              <span>English</span>
              {lang === "en" && <span className="text-[#8B7D6F]">✓</span>}
            </button>
          </div>
        </div>
      )}

      {/* Logout / Delete modal */}
      {(modal === "logout" || modal === "delete") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: "rgba(0,0,0,0.18)", backdropFilter: "blur(8px)" }}>
          <div className="lg-panel w-full max-w-sm rounded-3xl p-6 text-center animate-reveal-up">
            <div className="lg-shine-stripe mb-5" />
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "rgba(254,242,242,0.80)", border: "1px solid rgba(239,68,68,0.20)" }}>
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900">{modal === "logout" ? "تسجيل الخروج" : "حذف الحساب"}</h2>
            <p className="mt-2 text-[13px] text-gray-500">{modal === "logout" ? t.confirm_logout : t.confirm_delete}</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={closeModal} className="flex-1 rounded-2xl py-3 text-sm font-semibold text-gray-600 transition-lg"
                style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(200,195,185,0.30)" }}>
                إلغاء
              </button>
              <button type="button" disabled={modal === "delete" && countdown > 0} onClick={modal === "logout" ? onLogout : onDelete}
                className="flex-1 rounded-2xl py-3 text-sm font-bold text-white transition-lg disabled:opacity-40"
                style={{ background: countdown > 0 && modal === "delete" ? "rgba(239,68,68,0.15)" : "linear-gradient(135deg,#dc2626,#ef4444)", color: countdown > 0 && modal === "delete" ? "#dc2626" : "#fff", boxShadow: (countdown === 0 || modal === "logout") ? "0 4px 14px rgba(239,68,68,0.30)" : "none" }}>
                {modal === "delete" && countdown > 0 ? `تأكيد (${countdown})` : modal === "logout" ? "تسجيل الخروج" : "نعم، احذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </WithBottomBar>
  );
}

function Group({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div className="lg-panel mx-4 mt-3 overflow-hidden rounded-3xl animate-reveal-up" style={{ animationDelay: `${delay}s` }}>
      <div className="lg-shine-stripe" />
      <ul className="divide-y divide-[rgba(200,195,185,0.18)]">{children}</ul>
    </div>
  );
}

function Row({ icon: Icon, label, value, danger, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; value?: string; danger?: boolean; onClick?: () => void }) {
  return (
    <li>
      <button type="button" onClick={onClick}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-right transition-lg hover:bg-[rgba(181,168,152,0.06)]">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={danger
            ? { background: "rgba(254,242,242,0.80)", border: "1px solid rgba(239,68,68,0.18)" }
            : { background: "rgba(255,255,255,0.80)", border: "1px solid rgba(200,195,185,0.28)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.95)" }
          }>
          <Icon className={"h-4 w-4 " + (danger ? "text-red-500" : "text-[#8B7D6F]")} />
        </span>
        <span className={"flex-1 text-start text-[13px] font-semibold " + (danger ? "text-red-500" : "text-gray-800")}>{label}</span>
        {value && <span className="text-[11px] text-gray-400">{value}</span>}
        <ChevronLeft className={"h-4 w-4 " + (danger ? "text-red-300" : "text-gray-300")} />
      </button>
    </li>
  );
}
