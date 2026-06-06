import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { clearProfile, getProfile, clearChatHistory, getFavs, getLikes, getUserId, clearAll } from "@/lib/storage";
import { useEffect, useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { syncProfile, syncFavorites, syncLikes, syncChat } from "@/lib/api/sync.functions";
import { Globe, Moon, Bell, Shield, Info, LogOut, Trash2, User, Pencil, Lock, Upload, AlertTriangle, X, ChevronLeft } from "lucide-react";
import { useLang, setLang, type Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "الإعدادات — دليل" }] }),
  component: Settings,
});

const NOTIF_KEY = "daleel:notif";

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
  const doSyncFavs = useServerFn(syncFavorites);
  const doSyncLikes = useServerFn(syncLikes);
  const doSyncChat = useServerFn(syncChat);
  useEffect(() => setP(getProfile()), []);

  const [modal, setModal] = useState<"logout" | "delete" | null>(null);
  const [countdown, setCountdown] = useState(7);
  const countRef = useRef(countdown);
  countRef.current = countdown;
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (modal === "delete") {
      setCountdown(7);
      timerRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(timerRef.current); return 0; }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [modal]);

  const closeModal = () => { clearInterval(timerRef.current); setModal(null); };

  const toggleNotif = () => {
    const next = !notif;
    setNotif(next);
    localStorage.setItem(NOTIF_KEY, next ? "1" : "0");
  };

  const pushAllToServer = async () => {
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
    } catch {
      toast.error("فشلت المزامنة");
    } finally {
      setSyncing(false);
    }
  };

  const onLogout = async () => {
    closeModal();
    await pushAllToServer();
    clearProfile();
    clearChatHistory();
    navigate({ to: "/login" });
  };

  const onDelete = () => {
    closeModal();
    clearAll();
    sessionStorage.clear();
    navigate({ to: "/login" });
  };

  const cycleTheme = () => {
    const order: Array<typeof theme> = ["dark", "light", "auto"];
    const i = order.indexOf(theme);
    setTheme(order[(i + 1) % order.length]);
  };

  const themeLabel = theme === "light" ? t.light : theme === "dark" ? t.dark : t.auto;
  const langLabel  = lang === "ar" ? t.arabic : t.english;

  return (
    <WithBottomBar>
      <Header />

      <div className="px-5 pt-4 pb-2 animate-reveal-up">
        <h1
          className="text-[20px] font-extrabold"
          style={{
            background: "linear-gradient(135deg, #d2e6fa 0%, #6b92ba 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {t.settings}
        </h1>
      </div>

      {/* Profile card */}
      <div
        className="mx-4 mt-3 rounded-3xl p-5 animate-reveal-up"
        style={{
          background: "linear-gradient(145deg, rgba(53,87,125,0.22), rgba(20,30,48,0.28))",
          border: "1px solid rgba(255,255,255,0.09)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.05)",
          animationDelay: "0.06s",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full"
            style={{
              background: "linear-gradient(145deg, rgba(53,87,125,0.40), rgba(35,50,82,0.30))",
              border: "2px solid rgba(255,255,255,0.10)",
              boxShadow: "0 4px 16px rgba(53,87,125,0.30)",
            }}
          >
            {profile?.picture ? (
              <img src={profile.picture} alt="" className="h-full w-full object-cover" />
            ) : profile?.name ? (
              <span
                className="text-xl font-extrabold"
                style={{
                  background: "linear-gradient(135deg, #c4d8ea, #6b92ba)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {profile.name[0]}
              </span>
            ) : (
              <User className="h-6 w-6 text-[#6b92ba]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#c4d8ea]">{profile?.name ?? t.guest}</p>
            {profile && (
              <p className="mt-0.5 line-clamp-1 text-[11px] text-[#6b92ba]">
                {profile.specialization} · {profile.university}
              </p>
            )}
          </div>
        </div>
        <Link
          to="/onboarding"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-[12px] font-semibold text-[#96b8d6] transition-glass"
          style={{
            background: "rgba(53,87,125,0.18)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
          {t.edit_profile}
        </Link>
      </div>

      {/* Settings groups */}
      <Group delay={0.10}>
        <Row icon={Globe}  label={t.language}      value={langLabel}  onClick={() => setLang(lang === "ar" ? "en" : "ar" as Lang)} />
        <Row icon={Moon}   label={t.theme}          value={themeLabel} onClick={cycleTheme} />
        <Row icon={Bell}   label={t.notifications}  value={notif ? t.enabled : t.disabled} onClick={toggleNotif} />
      </Group>

      <Group delay={0.14}>
        <Row icon={Upload} label="مزامنة البيانات" onClick={pushAllToServer} value={syncing ? "جارٍ..." : undefined} />
        <Row icon={Shield} label={t.privacy} />
        <Row icon={Lock}   label={t.admin_panel}    onClick={() => navigate({ to: "/admin" })} />
        <Row icon={Trash2} label={t.delete_account} danger onClick={() => setModal("delete")} />
      </Group>

      <Group delay={0.18}>
        <Row icon={Info} label={t.about} value={t.version} />
      </Group>

      {/* Logout button */}
      <div className="px-4 pt-4 pb-2 animate-reveal-up" style={{ animationDelay: "0.22s" }}>
        <button
          type="button"
          onClick={() => setModal("logout")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-glass active:scale-[0.98]"
          style={{
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "rgb(252,165,165)",
          }}
        >
          <LogOut className="h-4 w-4" />
          {t.logout}
        </button>
      </div>

      <p className="mt-6 mb-4 text-center text-[10px] tracking-[0.3em] text-[#1d2f4a]">
        {t.powered_by}
      </p>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: "rgba(10,18,32,0.75)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl animate-reveal-up"
            style={{
              background: "linear-gradient(145deg, rgba(26,39,64,0.95), rgba(14,22,37,0.98))",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(32px)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.50)",
            }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.20)",
              }}
            >
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>
            <h2 className="text-lg font-extrabold text-[#d2e6fa]">
              {modal === "logout" ? "تسجيل الخروج" : "حذف الحساب"}
            </h2>
            <p className="mt-2 text-[13px] text-[#6b92ba]">
              {modal === "logout" ? t.confirm_logout : t.confirm_delete}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-2xl py-3 text-sm font-semibold text-[#96b8d6] transition-glass"
                style={{
                  background: "rgba(53,87,125,0.15)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={modal === "delete" && countdown > 0}
                onClick={modal === "logout" ? onLogout : onDelete}
                className="flex-1 rounded-2xl py-3 text-sm font-bold text-white transition-glass disabled:opacity-40"
                style={{
                  background: countdown > 0 && modal === "delete"
                    ? "rgba(239,68,68,0.20)"
                    : "linear-gradient(135deg, #dc2626, #ef4444)",
                  boxShadow: countdown === 0 || modal === "logout"
                    ? "0 4px 14px rgba(239,68,68,0.40)"
                    : "none",
                }}
              >
                {modal === "delete" && countdown > 0
                  ? `تأكيد (${countdown})`
                  : modal === "logout"
                    ? "تسجيل الخروج"
                    : "نعم، احذف"}
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
    <div
      className="mx-4 mt-3 overflow-hidden rounded-3xl animate-reveal-up"
      style={{
        background: "linear-gradient(145deg, rgba(53,87,125,0.15), rgba(20,30,48,0.18))",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        animationDelay: `${delay}s`,
      }}
    >
      <ul className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {children}
      </ul>
    </div>
  );
}

function Row({
  icon: Icon, label, value, danger, onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-right transition-glass hover:bg-[rgba(53,87,125,0.10)]"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={
            danger
              ? { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.15)" }
              : { background: "rgba(53,87,125,0.20)", border: "1px solid rgba(255,255,255,0.07)" }
          }
        >
          <Icon className={"h-4 w-4 " + (danger ? "text-red-400" : "text-[#6b92ba]")} />
        </span>
        <span
          className={"flex-1 text-start text-[13px] font-semibold " + (danger ? "text-red-400" : "text-[#c4d8ea]")}
        >
          {label}
        </span>
        {value && <span className="text-[11px] text-[#35577D]">{value}</span>}
        <ChevronLeft className={"h-4 w-4 " + (danger ? "text-red-400/40" : "text-[#35577D]")} />
      </button>
    </li>
  );
}
