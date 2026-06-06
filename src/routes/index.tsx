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
      <div
        className={
          "relative flex flex-col items-center transition-all duration-1000 ease-out " +
          (show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")
        }
      >
        <Logo className="h-52 w-52 animate-logo-float object-contain" />
        <div className="mt-8 flex flex-col items-center">
          <span className="animate-fade-up text-[10px] font-medium tracking-[0.5em] text-gold/70 uppercase [animation-delay:200ms]">
            Developed by
          </span>
          <span className="animate-fade-up mt-1.5 bg-gradient-to-r from-gold-soft via-cream to-gold-soft bg-[length:200%_auto] bg-clip-text text-sm font-semibold tracking-[0.32em] text-transparent uppercase [animation-delay:400ms]">
            NOVA STUDIO
          </span>
        </div>
      </div>
    </div>
  );
}
