import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { clearProfile, getProfile, clearChatHistory, getFavs, getLikes, getUserId, clearAll } from "@/lib/storage";
import { useEffect, useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { syncProfile, syncFavorites, syncLikes, syncChat } from "@/lib/api/sync.functions";
import { Globe, Moon, Bell, Shield, Info, LogOut, Trash2, User, Pencil, Lock, Upload, AlertTriangle, ChevronLeft } from "lucide-react";
import { useLang, setLang, type Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "الإعدادات — دليل" }] }),
  component: Settings,
});

const NOTIF_KEY = "daleel:notif";

/* Shared glass surface */
const glassGroup: React.CSSProperties = {
  background: "linear-gradient(148deg, rgba(200,228,252,0.12) 0%, rgba(130,185,235,0.07) 100%)",
  border: "1px solid rgba(255,255,255,0.20)",
  backdropFilter: "blur(28px) saturate(190%)",
  WebkitBackdropFilter: "blur(28px) saturate(190%)",
  boxShadow: "0 8px 28px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: "1.5rem",
  overflow: "hidden",
};

function Settings() {
  const navigate = useNavigate();
  const [lang, t] = useLang();
  const [theme, setTheme] = useTheme();
  const [profile, setP] = useState<ReturnType<typeof getProfile>>(null);
  const [syncing, setSyncing] = useState(false);
  const [notif, setNotif] = useState<boolean>(() =>
    typeof window === "undefined" ? true : localStorage.getItem(NOTIF_KEY) !== "0",
  );
  const doSyncProfile = useServerFn(syncProfile);
  const doSyncFavs    = useServerFn(syncFavorites);
  const doSyncLikes   = useServerFn(syncLikes);
  const doSyncChat    = useServerFn(syncChat);
  useEffect(() => setP(getProfile()), []);

  const [modal, setModal]       = useState<"logout" | "delete" | null>(null);
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
    if (!userId) { toast.error("سجّل الدخول أولاً"); return; }
    setSyncing(true);
    try {
      const p = getProfile();
      if (p) await doSyncProfile({ data: { userId, ...p } });
      for (const kind of ["post", "ai", "tool", "chat"] as const) {
        const items = getFavs(kind);
        if (items.length > 0) await doSyncFavs({ data: { userId, kind, itemIds: items } });
      }
      const likesMap = getLikes();
      const likedIds = Object.keys(likesMap).filter((k) => likesMap[k]);
      if (likedIds.length > 0) await doSyncLikes({ data: { userId, itemIds: likedIds } });
      const { getChatHistory } = await import("@/lib/storage");
      const chat = getChatHistory();
      if (chat.length > 0) await doSyncChat({ data: { userId, messages: chat } });
      toast.success("تمت المزامنة بنجاح");
    } catch { toast.error("فشلت المزامنة"); }
    finally { setSyncing(false); }
  };

  const onLogout = async () => { closeModal(); await pushAll(); clearProfile(); clearChatHistory(); navigate({ to: "/login" }); };
  const onDelete = () => { closeModal(); clearAll(); sessionStorage.clear(); navigate({ to: "/login" }); };
  const cycleTheme = () => { const o = ["dark", "light", "auto"] as const; setTheme(o[(o.indexOf(theme) + 1) % 3]); };

  const themeLabel = { dark: t.dark, light: t.light, auto: t.auto }[theme];
  const langLabel  = lang === "ar" ? t.arabic : t.english;

  return (
    <WithBottomBar>
      <Header />

      <div className="px-5 pt-4 pb-2 animate-reveal-up">
        <h1 className="text-[20px] font-extrabold"
          style={{
            background: "linear-gradient(135deg, #e8f2fb 0%, #6b92ba 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}
        >
          {t.settings}
        </h1>
      </div>

      {/* Profile card */}
      <div
        className="mx-4 mt-3 rounded-3xl p-5 animate-reveal-up"
        style={{ ...glassGroup, animationDelay: "0.06s" }}
      >
        {/* Shine stripe */}
        <div className="mb-4 h-px w-full rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.24), transparent)" }} />

        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
            style={{
              background: "linear-gradient(148deg, rgba(200,228,255,0.18) 0%, rgba(80,140,210,0.12) 100%)",
              border: "2px solid rgba(255,255,255,0.26)",
              boxShadow: "0 6px 20px rgba(53,87,125,0.30), inset 0 1px 0 rgba(255,255,255,0.20)",
            }}
          >
            {profile?.picture
              ? <img src={profile.picture} alt="" className="h-full w-full object-cover" />
              : profile?.name
                ? <span className="text-xl font-extrabold" style={{ background: "linear-gradient(135deg, #e8f2fb, #6b92ba)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{profile.name[0]}</span>
                : <User className="h-6 w-6 text-[#6b92ba]" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#d7ebfc]">{profile?.name ?? t.guest}</p>
            {profile && <p className="mt-0.5 line-clamp-1 text-[11px] text-[#6b92ba]">{profile.specialization} · {profile.university}</p>}
          </div>
        </div>
        <Link to="/onboarding"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-[12px] font-semibold text-[#c4d8ea] transition-glass"
          style={{
            background: "rgba(200,228,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          <Pencil className="h-3.5 w-3.5" /> {t.edit_profile}
        </Link>
      </div>

      {/* Settings groups */}
      <Group style={{ animationDelay: "0.10s" }}>
        <Row icon={Globe}  label={t.language}     value={langLabel}  onClick={() => setLang(lang === "ar" ? "en" : "ar" as Lang)} />
        <Row icon={Moon}   label={t.theme}         value={themeLabel} onClick={cycleTheme} />
        <Row icon={Bell}   label={t.notifications} value={notif ? t.enabled : t.disabled} onClick={() => { const n = !notif; setNotif(n); localStorage.setItem(NOTIF_KEY, n ? "1" : "0"); }} />
      </Group>

      <Group style={{ animationDelay: "0.14s" }}>
        <Row icon={Upload} label="مزامنة البيانات" onClick={pushAll} value={syncing ? "جارٍ..." : undefined} />
        <Row icon={Shield} label={t.privacy} />
        <Row icon={Lock}   label={t.admin_panel}   onClick={() => navigate({ to: "/admin" })} />
        <Row icon={Trash2} label={t.delete_account} danger onClick={() => setModal("delete")} />
      </Group>

      <Group style={{ animationDelay: "0.18s" }}>
        <Row icon={Info} label={t.about} value={t.version} />
      </Group>

      {/* Logout */}
      <div className="px-4 pt-4 pb-2 animate-reveal-up" style={{ animationDelay: "0.22s" }}>
        <button
          type="button" onClick={() => setModal("logout")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-glass active:scale-[0.98]"
          style={{
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.28)",
            color: "rgb(252,165,165)",
            backdropFilter: "blur(16px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <LogOut className="h-4 w-4" /> {t.logout}
        </button>
      </div>

      <p className="mt-6 mb-4 text-center text-[10px] tracking-[0.3em] text-[#1d2f4a]">{t.powered_by}</p>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: "rgba(7,14,26,0.80)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 text-center animate-reveal-up"
            style={{
              background: "linear-gradient(148deg, rgba(200,228,252,0.16) 0%, rgba(20,30,48,0.94) 100%)",
              border: "1px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(40px)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          >
            {/* Shine */}
            <div className="mb-5 h-px w-full rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.24), transparent)" }} />

            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.28)" }}
            >
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>
            <h2 className="text-lg font-extrabold text-[#d7ebfc]">
              {modal === "logout" ? "تسجيل الخروج" : "حذف الحساب"}
            </h2>
            <p className="mt-2 text-[13px] text-[#6b92ba]">
              {modal === "logout" ? t.confirm_logout : t.confirm_delete}
            </p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={closeModal}
                className="flex-1 rounded-2xl py-3 text-sm font-semibold text-[#96b8d6]"
                style={{ background: "rgba(200,228,255,0.10)", border: "1px solid rgba(255,255,255,0.18)" }}
              >
                إلغاء
              </button>
              <button type="button"
                disabled={modal === "delete" && countdown > 0}
                onClick={modal === "logout" ? onLogout : onDelete}
                className="flex-1 rounded-2xl py-3 text-sm font-bold text-white transition-glass disabled:opacity-40"
                style={{
                  background: countdown > 0 && modal === "delete"
                    ? "rgba(239,68,68,0.20)"
                    : "linear-gradient(135deg, #dc2626, #ef4444)",
                  boxShadow: (countdown === 0 || modal === "logout") ? "0 4px 14px rgba(239,68,68,0.40)" : "none",
                }}
              >
                {modal === "delete" && countdown > 0 ? `تأكيد (${countdown})` : modal === "logout" ? "تسجيل الخروج" : "نعم، احذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </WithBottomBar>
  );
}

function Group({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="mx-4 mt-3 animate-reveal-up" style={{ ...glassGroup, ...style }}>
      {/* Shine stripe */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }} />
      <ul className="divide-y" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {children}
      </ul>
    </div>
  );
}

function Row({
  icon: Icon, label, value, danger, onClick,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value?: string; danger?: boolean; onClick?: () => void }) {
  return (
    <li>
      <button
        type="button" onClick={onClick}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-right transition-glass hover:bg-[rgba(200,228,255,0.06)]"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={
            danger
              ? { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.22)" }
              : { background: "rgba(200,228,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)" }
          }
        >
          <Icon className={"h-4 w-4 " + (danger ? "text-red-400" : "text-[#6b92ba]")} />
        </span>
        <span className={"flex-1 text-start text-[13px] font-semibold " + (danger ? "text-red-400" : "text-[#d7ebfc]")}>
          {label}
        </span>
        {value && <span className="text-[11px] text-[#35577D]">{value}</span>}
        <ChevronLeft className={"h-4 w-4 " + (danger ? "text-red-400/40" : "text-[#35577D]")} />
      </button>
    </li>
  );
}
