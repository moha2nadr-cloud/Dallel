import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  setProfile, setUserId, setUserEmail, isOnboarded,
  type Profile, getFavs, getLikes,
  setChatHistory, setProfileBackup,
} from "@/lib/storage";
import { useEffect, useRef, useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { loadUserData, syncProfile } from "@/lib/api/sync.functions";
import { LiquidOrbs } from "@/components/LiquidOrbs";
import logoSrc from "@/assets/logo-daleel.png";
import { toast } from "sonner";

const CLIENT_ID = "1036057874420-d2h6r8s755huud2336qqanvqj16soh4j.apps.googleusercontent.com";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "دليل — بوابتك الذكية للطلاب" },
      { name: "description", content: "اكتشف أدوات الذكاء الاصطناعي حسب تخصصك." },
    ],
  }),
  component: Login,
});

const STATS = [
  { num: "+500", label: "أداة ذكاء اصطناعي" },
  { num: "+60",  label: "تخصص جامعي"       },
  { num: "+10K", label: "طالب يستخدمه"     },
];

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const doLoadUser = useServerFn(loadUserData);
  const doSyncProfile = useServerFn(syncProfile);

  const handleCredential = useCallback(
    async (response: google.accounts.id.CredentialResponse) => {
      setLoading(true);
      try {
        const jwt = JSON.parse(atob(response.credential.split(".")[1]));
        const userId: string = jwt.sub;
        const googleProfile: Profile = {
          name:           jwt.name  || "",
          email:          jwt.email || "",
          picture:        jwt.picture || "",
          age:            0,
          specialization: "",
          university:     "",
        };

        // Save locally immediately
        setUserId(userId);
        setUserEmail(googleProfile.email ?? "");
        setProfile(googleProfile);
        setProfileBackup(userId, googleProfile);

        // Sync Google profile to DB (upsert — keeps existing data if already there)
        doSyncProfile({
          data: {
            userId,
            name:           googleProfile.name,
            email:          googleProfile.email,
            picture:        googleProfile.picture,
            age:            0,
            specialization: "",
            university:     "",
          },
        }).catch(() => {});

        // Load all saved data from DB
        try {
          const userData = await doLoadUser({ data: { userId } });

          // Restore profile from DB if it has more data
          if (userData?.profile) {
            const dbProfile: Profile = {
              name:           userData.profile.name  || googleProfile.name,
              email:          userData.profile.email || googleProfile.email || "",
              picture:        userData.profile.picture || googleProfile.picture || "",
              age:            userData.profile.age   || 0,
              specialization: userData.profile.specialization || "",
              university:     userData.profile.university     || "",
            };
            setProfile(dbProfile);
            setProfileBackup(userId, dbProfile);
          }

          // Restore favorites from DB
          if (userData?.favorites?.length) {
            const groupedByKind: Record<string, string[]> = {};
            for (const f of userData.favorites) {
              if (!groupedByKind[f.kind]) groupedByKind[f.kind] = [];
              groupedByKind[f.kind].push(f.item_id);
            }
            for (const [kind, ids] of Object.entries(groupedByKind)) {
              localStorage.setItem(`daleel:fav:${kind}`, JSON.stringify(ids));
            }
          }

          // Restore likes from DB
          if (userData?.likedIds?.length) {
            const likesMap: Record<string, boolean> = {};
            for (const id of userData.likedIds) likesMap[id] = true;
            localStorage.setItem("daleel:likes", JSON.stringify(likesMap));
          }

          // Restore chat from DB
          if (userData?.chatMessages?.length) {
            setChatHistory(
              userData.chatMessages.map((m: { role: "user" | "assistant"; content: string; ts: number }) => m),
            );
          }
        } catch {
          // DB unreachable — local data is fine
        }

        if (isOnboarded()) {
          navigate({ to: "/home" });
        } else {
          navigate({ to: "/onboarding" });
        }
      } catch (err) {
        toast.error("حدث خطأ أثناء تسجيل الدخول");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [navigate, doLoadUser, doSyncProfile],
  );

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const init = () => {
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback:  handleCredential,
        cancel_on_tap_outside: false,
      });
      if (googleBtnRef.current) {
        google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard", shape: "rectangular",
          theme: "outline", size: "large",
        });
      }
    };
    if (typeof google !== "undefined" && google.accounts?.id) init();
    else {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true; s.defer = true; s.onload = init;
      document.head.appendChild(s);
    }
  }, [handleCredential]);

  const handleGoogleSignIn = () => {
    const btn = googleBtnRef.current?.querySelector("button[aria-labelledby]") as HTMLButtonElement | null;
    if (btn) { setLoading(true); btn.click(); }
    else google.accounts.id.prompt();
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-white px-5 py-0">
      <LiquidOrbs />
      <div className="relative z-10 flex w-full max-w-sm flex-1 flex-col items-center justify-between py-14">

        {/* Logo + headline */}
        <div className="flex flex-col items-center text-center gap-5 w-full animate-reveal-up">
          <img src={logoSrc} alt="دليل" className="animate-logo-enter" style={{ width: 160, objectFit: "contain" }} />

          <div className="animate-reveal-up" style={{ animationDelay: "0.3s" }}>
            <h1 className="text-[28px] font-extrabold text-gray-900 leading-snug">
              أهلاً بك في <span className="logo-gradient">دليل</span>
            </h1>
            <p className="mt-2 text-[13px] text-gray-500 leading-relaxed max-w-[260px]">
              بوابتك الذكية لاكتشاف أفضل أدوات الذكاء الاصطناعي حسب تخصصك الجامعي
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-3 mt-1 animate-reveal-up" style={{ animationDelay: "0.4s" }}>
            {STATS.map((s, i) => (
              <div key={i} className="lg-card flex flex-col items-center rounded-2xl px-3 py-2.5" style={{ minWidth: 82 }}>
                <span className="text-[17px] font-extrabold logo-gradient">{s.num}</span>
                <span className="text-[10px] text-gray-500 mt-0.5 text-center leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        {/* Sign-in card */}
        <div className="w-full flex flex-col items-center gap-4 animate-reveal-up" style={{ animationDelay: "0.5s" }}>
          <div className="lg-panel w-full rounded-3xl p-5">
            <div className="lg-shine-stripe mb-4" />
            <p className="text-center text-[12px] text-gray-500 mb-4">سجّل الدخول للوصول إلى كل المميزات</p>
            <div className="relative">
              <button
                type="button" onClick={handleGoogleSignIn} disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border px-5 py-3.5 text-[13px] font-bold text-gray-800 active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: "linear-gradient(145deg,rgba(255,255,255,0.98),rgba(250,249,247,0.95))",
                  border: "1px solid rgba(200,195,185,0.40)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
                }}>
                {loading
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#B5A898] border-t-transparent" />
                  : <GoogleIcon />
                }
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول بـ Google"}
              </button>
              <div ref={googleBtnRef} className="absolute inset-0 opacity-0" aria-hidden />
            </div>
          </div>

          <p className="text-[10px] text-gray-400 text-center">
            بدخولك فأنت توافق على شروط الاستخدام وسياسة الخصوصية
          </p>

          <div className="flex flex-col items-center gap-0.5 pb-2">
            <span className="text-[9px] uppercase tracking-[0.35em] text-gray-300">Developed by</span>
            <span className="text-[12px] font-black tracking-[0.25em] uppercase logo-gradient">NOVA STUDIO</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29.1 4.5 24 4.5 16.3 4.5 9.6 8.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13-4.7l-6-5c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.3 5.3l6 5c-.4.4 6.5-4.7 6.5-14.3 0-1.2-.1-2.4-.3-3.5z"/>
    </svg>
  );
}
