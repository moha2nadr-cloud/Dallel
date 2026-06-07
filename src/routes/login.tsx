import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { setProfile, setUserId, setUserEmail, isOnboarded, setOnboarded, type Profile } from "@/lib/storage";
import { useEffect, useRef, useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getProfile as getServerProfile } from "@/lib/api/sync.functions";
import { LiquidOrbs } from "@/components/LiquidOrbs";
import logoSrc from "@/assets/logo-daleel.png";
import { UserRound } from "lucide-react";

const CLIENT_ID = "1036057874420-d2h6r8s755huud2336qqanvqj16soh4j.apps.googleusercontent.com";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "دليل — بوابتك الذكية للطلاب" },
      { name: "description", content: "اكتشف أدوات الذكاء الاصطناعي حسب تخصصك الجامعي." },
    ],
  }),
  component: Login,
});

const STATS = [
  { num: "+500", label: "أداة ذكاء اصطناعي" },
  { num: "+60",  label: "تخصص جامعي" },
];

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const loadServerProfile = useServerFn(getServerProfile);

  const handleCredential = useCallback(
    async (response: google.accounts.id.CredentialResponse) => {
      const data = JSON.parse(atob(response.credential.split(".")[1]));
      const userId = data.sub as string;
      setUserId(userId);
      setUserEmail(data.email as string);
      const gp: Profile = { name: data.name, email: data.email, picture: data.picture, age: 0, specialization: "", university: "" };
      setProfile(gp);
      if (isOnboarded()) {
        try {
          const s = await loadServerProfile({ data: { userId } });
          if (s) setProfile({ name: s.name || gp.name, email: gp.email || s.email, picture: gp.picture || s.picture, age: s.age ?? 0, specialization: s.specialization || "", university: s.university || "" });
        } catch {}
        navigate({ to: "/home" });
      } else {
        navigate({ to: "/onboarding" });
      }
    },
    [navigate, loadServerProfile],
  );

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const init = () => {
      google.accounts.id.initialize({ client_id: CLIENT_ID, callback: handleCredential, cancel_on_tap_outside: false });
      if (googleBtnRef.current) {
        google.accounts.id.renderButton(googleBtnRef.current, { type: "standard", shape: "rectangular", theme: "outline", size: "large" });
      }
    };
    if (typeof google !== "undefined" && google.accounts?.id) init();
    else { const s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.defer = true; s.onload = init; document.head.appendChild(s); }
  }, [handleCredential]);

  const handleGoogleSignIn = () => {
    setLoading(true);
    const isMobile = typeof window !== "undefined" && "ontouchstart" in window;
    if (isMobile) {
      google.accounts.id.prompt();
      return;
    }
    const realBtn = googleBtnRef.current?.querySelector("button, div[role=button]") as HTMLElement | null;
    if (realBtn) realBtn.click();
    else google.accounts.id.prompt();
  };

  const handleGuestLogin = () => {
    const guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    setUserId(guestId);
    setProfile({ name: "", age: 0, specialization: "", university: "" });
    setOnboarded(false);
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-white px-5 py-0">
      <LiquidOrbs />

      <div className="relative z-10 flex w-full max-w-sm flex-1 flex-col items-center justify-start pt-12">

        {/* ── TOP: Logo + headline ── */}
        <div className="flex flex-col items-center text-center gap-5 w-full animate-reveal-up">
          {/* Real دليل logo */}
          <img
            src={logoSrc}
            alt="دليل"
            className="animate-logo-enter"
            style={{ width: 160, height: "auto", objectFit: "contain" }}
          />

          <div style={{ animationDelay: "0.3s" }} className="animate-reveal-up">
            <h1 className="text-[28px] font-extrabold text-gray-900 leading-snug">
              أهلاً بك في <span className="logo-gradient">دليل</span>
            </h1>
            <p className="mt-2 text-[13px] text-gray-500 leading-relaxed max-w-[260px]">
              بوابتك الذكية لاكتشاف أفضل أدوات الذكاء الاصطناعي حسب تخصصك الجامعي
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-3 mt-1 animate-reveal-up" style={{ animationDelay: "0.4s" }}>
            {STATS.map((s, i) => (
              <div
                key={i}
                className="lg-card flex flex-col items-center rounded-2xl px-3 py-2.5"
                style={{ minWidth: 82 }}
              >
                <span
                  className="text-[17px] font-extrabold"
                  style={{
                    background: "linear-gradient(135deg, #A09282, #72665A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.num}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 text-center leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM: Sign in + credit ── */}
        <div className="w-full flex flex-col items-center gap-3 mt-4 animate-reveal-up" style={{ animationDelay: "0.5s" }}>
          {/* Glass sign-in card */}
          <div
            className="lg-panel w-full rounded-3xl p-5"
          >
            {/* Shine */}
            <div className="lg-shine-stripe mb-4" />

            <p className="text-center text-[12px] text-gray-500 mb-4">
              سجّل الدخول للوصول إلى كل المميزات
            </p>

            <div className="relative">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border px-5 py-3.5 text-[13px] font-bold text-gray-800 transition-lg active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: "linear-gradient(145deg,rgba(255,255,255,0.98),rgba(250,249,247,0.95))",
                  border: "1px solid rgba(200,195,185,0.40)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
                }}
              >
                {loading
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#B5A898] border-t-transparent" />
                  : <GoogleIcon />
                }
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول بـ Google"}
              </button>
              <div ref={googleBtnRef} className="absolute inset-0 opacity-0 pointer-events-none" aria-hidden />
            </div>

            <div className="relative mt-3 flex items-center gap-3">
              <span className="h-px flex-1" style={{ background: "linear-gradient(90deg,transparent,rgba(200,195,185,0.40),transparent)" }} />
              <span className="text-[10px] text-gray-300">أو</span>
              <span className="h-px flex-1" style={{ background: "linear-gradient(90deg,transparent,rgba(200,195,185,0.40),transparent)" }} />
            </div>

            <button type="button" onClick={handleGuestLogin}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-[12px] font-bold text-gray-500 transition-lg active:scale-[0.98]"
              style={{
                background: "rgba(255,255,255,0.60)",
                border: "1px solid rgba(200,195,185,0.25)",
              }}>
              <UserRound className="h-4 w-4" />
              تسجيل الدخول بدون حساب
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center">
            بدخولك فأنت توافق على شروط الاستخدام وسياسة الخصوصية
          </p>

          {/* Studio credit */}
          <div className="flex flex-col items-center gap-0.5 mt-5 mb-1">
            <span className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-medium">Developed by</span>
            <span
              className="text-[15px] font-black tracking-[0.3em] uppercase"
              style={{
                background: "linear-gradient(135deg, #B5A898, #8B7D6F)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              NOVA STUDIO
            </span>
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
