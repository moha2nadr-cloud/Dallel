import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  const [phase, setPhase] = useState(0); // 0=hidden 1=logo 2=text

  useEffect(() => {
    const t0 = setTimeout(() => setPhase(1), 80);
    const t1 = setTimeout(() => setPhase(2), 700);
    const t2 = setTimeout(() => {
      const profile = getProfile();
      navigate({ to: profile ? "/home" : "/login" });
    }, 3800);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [navigate]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #141E30 0%, #0a1220 100%)" }}
    >
      {/* Animated orbs */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 30% 20%, rgba(53,87,125,0.30) 0%, transparent 60%),
            radial-gradient(ellipse 55% 45% at 75% 70%, rgba(42,65,102,0.22) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(74,112,160,0.12) 0%, transparent 60%)
          `,
        }}
      />

      {/* Rotating rings */}
      <div
        className="pointer-events-none absolute animate-spin-slow"
        style={{
          width: "110vw",
          height: "110vw",
          borderRadius: "50%",
          border: "1px solid rgba(53,87,125,0.10)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: "75vw",
          height: "75vw",
          borderRadius: "50%",
          border: "1px solid rgba(74,112,160,0.08)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          animation: "spin-slow 18s linear infinite reverse",
        }}
        aria-hidden
      />

      {/* Logo + brand */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Glass logo box */}
        <div
          className="flex h-28 w-28 items-center justify-center rounded-[2rem]"
          style={{
            background: "linear-gradient(145deg, rgba(53,87,125,0.38), rgba(20,30,48,0.55))",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 64px rgba(53,87,125,0.40), inset 0 1px 0 rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "scale(1)" : "scale(0.6)",
            filter: phase >= 1 ? "blur(0)" : "blur(16px)",
            transition: "opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1), filter 0.8s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 rounded-[2rem]"
            style={{
              background: "radial-gradient(circle at 35% 20%, rgba(255,255,255,0.07), transparent 60%)",
            }}
          />
          <svg viewBox="0 0 64 64" className="relative h-16 w-16" aria-label="دليل">
            <defs>
              <linearGradient id="splash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e8f0f8" />
                <stop offset="50%" stopColor="#c4d8ea" />
                <stop offset="100%" stopColor="#6b92ba" />
              </linearGradient>
            </defs>
            <text x="32" y="48" textAnchor="middle"
              fontFamily="Tajawal, sans-serif" fontWeight="900" fontSize="44"
              fill="url(#splash-grad)">
              د
            </text>
          </svg>
        </div>

        {/* Word-mark */}
        <div
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <h1
            className="text-[40px] font-extrabold tracking-wide text-center"
            style={{
              background: "linear-gradient(135deg, #e8f0f8 0%, #96b8d6 55%, #4a70a0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            دليل
          </h1>

          <p
            className="mt-2 text-center text-[12px] font-semibold tracking-[0.35em] uppercase text-[#35577D]"
          >
            بوابتك الذكية للطلاب
          </p>
        </div>
      </div>

      {/* Subtle studio credit */}
      <div
        className="absolute bottom-10 flex flex-col items-center gap-1"
        style={{
          opacity: phase >= 2 ? 0.55 : 0,
          transition: "opacity 0.7s ease 0.5s",
        }}
      >
        <span className="text-[9px] tracking-[0.4em] uppercase text-[#1d2f4a]">Developed by</span>
        <span
          className="text-[13px] font-black tracking-[0.3em] uppercase"
          style={{
            background: "linear-gradient(135deg, #35577D, #4a70a0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          NOVA STUDIO
        </span>
      </div>
    </div>
  );
}
