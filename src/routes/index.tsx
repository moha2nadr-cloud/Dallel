import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { getProfile } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "دليل" },
      { name: "description", content: "بوابتك الذكية لأدوات الطلاب" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 50);
    const t2 = setTimeout(() => {
      const profile = getProfile();
      navigate({ to: profile ? "/home" : "/login" });
    }, 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [navigate]);
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 40%, color-mix(in oklab, var(--gold) 22%, transparent), transparent 70%)",
        }}
      />
      <div className="relative flex flex-col items-center">
        <div className={show ? "animate-logo-reveal" : "opacity-0 scale-75 blur-xl"}>
          <Logo className="h-56 w-56 animate-logo-glow object-contain" />
        </div>
        <div className="mt-10 flex flex-col items-center gap-2">
          <span className="animate-text-reveal text-sm font-medium tracking-[0.4em] text-gold/60 uppercase [animation-delay:400ms] [animation-fill-mode:both]">
            Developed by
          </span>
          <span className="animate-text-reveal bg-gradient-to-r from-gold via-cream via-50% to-gold bg-[length:200%_auto] bg-clip-text text-2xl font-black tracking-[0.28em] text-transparent uppercase [animation-delay:600ms] [animation-fill-mode:both] [animation:shimmer 3s ease-in-out infinite,text-reveal 0.8s cubic-bezier(0.16,1,0.3,1) 600ms both]">
            NOVA STUDIO
          </span>
        </div>
      </div>
    </div>
  );
}
