import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { setProfile, setUserId, setUserEmail, isOnboarded, type Profile } from "@/lib/storage";
import { useEffect, useRef, useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getProfile as getServerProfile } from "@/lib/api/sync.functions";
import { LiquidOrbs } from "@/components/LiquidOrbs";

const CLIENT_ID = "1036057874420-d2h6r8s755huud2336qqanvqj16soh4j.apps.googleusercontent.com";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — دليل" },
      { name: "description", content: "سجّل الدخول بحساب Google." },
    ],
  }),
  component: Login,
});

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
      const googleProfile: Profile = {
        name: data.name, email: data.email, picture: data.picture,
        age: 0, specialization: "", university: "",
      };
      setProfile(googleProfile);
      if (isOnboarded()) {
        try {
          const server = await loadServerProfile({ data: { userId } });
          if (server) {
            setProfile({
              name: server.name || googleProfile.name,
              email: googleProfile.email || server.email,
              picture: googleProfile.picture || server.picture,
              age: server.age ?? 0,
              specialization: server.specialization || "",
              university: server.university || "",
            });
          }
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
        google.accounts.id.renderButton(googleBtnRef.current, { type: "standard", shape: "rectangular", theme: "outline", size: "large", text: "signin_with" });
      }
    };
    if (typeof google !== "undefined" && google.accounts?.id) { init(); }
    else {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true; s.defer = true; s.onload = init;
      document.head.appendChild(s);
    }
  }, [handleCredential]);

  const handleGoogleSignIn = () => {
    const btn = googleBtnRef.current?.querySelector("button[aria-labelledby]");
    if (btn) { setLoading(true); (btn as HTMLButtonElement).click(); }
    else google.accounts.id.prompt();
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-6 py-16"
      style={{ background: "linear-gradient(160deg, #0e1828 0%, #0a1422 100%)" }}
    >
      {/* Vivid liquid orbs */}
      <LiquidOrbs />

      {/* Logo + headline */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center gap-6">
        {/* Glass logo */}
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-[1.75rem] animate-logo-enter"
          style={{
            background: "linear-gradient(145deg, rgba(200,228,255,0.16) 0%, rgba(80,140,210,0.12) 100%)",
            border: "1px solid rgba(255,255,255,0.28)",
            boxShadow:
              "0 20px 56px rgba(80,140,220,0.35), " +
              "0 4px 16px rgba(0,0,0,0.30), " +
              "inset 0 1px 0 rgba(255,255,255,0.24)",
            backdropFilter: "blur(28px)",
          }}
        >
          {/* Top-left shine */}
          <div
            className="absolute inset-0 rounded-[1.75rem]"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, transparent 50%)" }}
          />
          <svg viewBox="0 0 48 48" className="relative h-14 w-14" aria-hidden>
            <defs>
              <linearGradient id="lg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e8f2fb" />
                <stop offset="100%" stopColor="#96b8d6" />
              </linearGradient>
            </defs>
            <text x="24" y="37" textAnchor="middle"
              fontFamily="Tajawal, sans-serif" fontWeight="900" fontSize="34"
              fill="url(#lg-grad)">
              د
            </text>
          </svg>
        </div>

        <div className="animate-reveal-up" style={{ animationDelay: "0.28s" }}>
          <h1
            className="text-[32px] font-extrabold leading-tight"
            style={{
              background: "linear-gradient(135deg, #e8f2fb 0%, #c4d8ea 55%, #6b92ba 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}
          >
            مرحباً بك في دليل
          </h1>
          <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-[#6b92ba]">
            بوابتك الذكية لاكتشاف أدوات الذكاء الاصطناعي حسب تخصصك الجامعي
          </p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 animate-reveal-up" style={{ animationDelay: "0.38s" }}>
          {["أدوات AI", "دراسة ذكية", "مجتمع طلابي"].map((f) => (
            <span
              key={f}
              className="rounded-full px-3 py-1 text-[11px] font-semibold text-[#c4d8ea]"
              style={{
                background: "rgba(200,228,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                backdropFilter: "blur(12px)",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Sign-in card */}
      <div className="relative z-10 w-full max-w-sm animate-reveal-up" style={{ animationDelay: "0.48s" }}>
        <div
          className="rounded-3xl p-5"
          style={{
            background: "linear-gradient(148deg, rgba(200,228,252,0.14) 0%, rgba(120,175,235,0.09) 100%)",
            border: "1px solid rgba(255,255,255,0.26)",
            backdropFilter: "blur(32px) saturate(200%)",
            boxShadow:
              "0 20px 56px rgba(0,0,0,0.32), " +
              "inset 0 1px 0 rgba(255,255,255,0.22)",
          }}
        >
          {/* Inset shine stripe */}
          <div
            className="absolute top-0 left-6 right-6 h-px rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }}
          />

          <p className="mb-4 text-center text-[12px] text-[#6b92ba]">
            تسجيل الدخول للوصول إلى كل المميزات
          </p>
          <div className="relative">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-3.5 text-[13px] font-bold transition-glass active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(230,245,255,0.90))",
                color: "#141E30",
                boxShadow: "0 6px 20px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.70)",
              }}
            >
              {loading
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#35577D] border-t-transparent" />
                : <GoogleIcon />
              }
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول بـ Google"}
            </button>
            <div ref={googleBtnRef} className="absolute inset-0 opacity-0" aria-hidden />
          </div>
        </div>
        <p className="pt-5 text-center text-[10px] leading-relaxed text-[#2a4166]">
          بدخولك فأنت توافق على شروط الاستخدام وسياسة الخصوصية
        </p>
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
