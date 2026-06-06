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
        <Logo className="h-40 w-40 object-contain" />
        <div className="mt-8 flex flex-col items-center">
          <span className="text-[10px] font-medium tracking-[0.5em] text-gold/70 uppercase">
            Powered by
          </span>
          <span className="mt-1.5 text-sm font-semibold tracking-[0.32em] text-cream/90">
            NOVA STUDIO
          </span>
        </div>
      </div>
    </div>
  );
}
