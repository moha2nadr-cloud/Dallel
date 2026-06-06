import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { getProfile, setProfile, type Profile } from "@/lib/storage";
import { useEffect, useRef, useCallback, useState } from "react";

const CLIENT_ID = "1036057874420-d2h6r8s755huud2336qqanvqj16soh4j.apps.googleusercontent.com";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — دليل" },
      { name: "description", content: "سجّل الدخول بحساب Google أو تخطَّ للدخول مباشرة." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const handleCredential = useCallback(
    (response: google.accounts.id.CredentialResponse) => {
      const data = JSON.parse(atob(response.credential.split(".")[1]));
      const profile: Profile = {
        name: data.name,
        email: data.email,
        picture: data.picture,
        age: 0,
        specialization: "",
        university: "",
      };
      setProfile(profile);
      navigate({ to: "/home" });
    },
    [navigate],
  );

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const init = () => {
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
        cancel_on_tap_outside: false,
      });
      if (googleBtnRef.current) {
        google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          shape: "rectangular",
          theme: "outline",
          size: "large",
          text: "signin_with",
        });
      }
    };

    if (typeof google !== "undefined" && google.accounts?.id) {
      init();
    } else {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = init;
      document.head.appendChild(s);
    }
  }, [handleCredential]);

  const handleGoogleSignIn = () => {
    const btn = googleBtnRef.current?.querySelector("button[aria-labelledby]");
    if (btn) {
      setLoading(true);
      (btn as HTMLButtonElement).click();
    } else {
      google.accounts.id.prompt();
    }
  };

  const goNext = () => {
    const p = getProfile();
    navigate({ to: p ? "/home" : "/onboarding" });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-ink px-6 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55%] opacity-50"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 0%, color-mix(in oklab, var(--gold) 18%, transparent), transparent 70%)",
        }}
      />
      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        <Logo className="mb-10 h-28 w-28 object-contain" />
        <h1 className="text-[26px] font-extrabold leading-tight text-cream">
          مرحباً بك في دليل
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
          بوابتك الذكية لاكتشاف أدوات الذكاء الاصطناعي حسب تخصصك الجامعي.
        </p>
      </div>

      <div className="relative w-full max-w-sm space-y-3">
        <div className="relative">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-cream px-5 py-3.5 text-sm font-semibold text-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
            ) : (
              <GoogleIcon />
            )}
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول بحساب Google"}
          </button>
          <div
            ref={googleBtnRef}
            className="absolute inset-0 opacity-0"
            aria-hidden
          />
        </div>

        <button
          type="button"
          onClick={goNext}
          className="flex w-full items-center justify-center rounded-2xl border border-border bg-transparent px-5 py-3.5 text-sm font-semibold text-cream/90 transition hover:border-gold/40 active:scale-[0.98]"
        >
          تخطّي والدخول كزائر
        </button>

        <p className="pt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
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