import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile } from "@/lib/storage";
import { LiquidOrbs } from "@/components/LiquidOrbs";

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
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t0 = setTimeout(() => setPhase(1), 80);
    const t1 = setTimeout(() => setPhase(2), 700);
    const t2 = setTimeout(() => {
      navigate({ to: getProfile() ? "/home" : "/login" });
    }, 3600);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [navigate]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0e1828 0%, #09121e 100%)" }}
    >
      <LiquidOrbs />

      {/* Rotating ring */}
      <div
        className="absolute animate-spin-slow"
        style={{
          width: "110vw", height: "110vw",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.07)",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-7">
        {/* Glass logo box */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 112, width: 112,
            borderRadius: "2rem",
            background: "linear-gradient(145deg, rgba(200,228,255,0.18) 0%, rgba(80,140,210,0.12) 100%)",
            border: "1px solid rgba(255,255,255,0.28)",
            boxShadow:
              "0 24px 64px rgba(80,140,220,0.40), " +
              "inset 0 1px 0 rgba(255,255,255,0.24)",
            backdropFilter: "blur(28px)",
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "scale(1)" : "scale(0.6)",
            filter: phase >= 1 ? "blur(0)" : "blur(16px)",
            transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1), filter 0.9s",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute", inset: 0, borderRadius: "2rem",
              background: "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, transparent 50%)",
            }}
          />
          <svg viewBox="0 0 64 64" style={{ height: 64, width: 64, position: "relative" }} aria-label="دليل">
            <defs>
              <linearGradient id="sp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e8f2fb" />
                <stop offset="60%" stopColor="#c4d8ea" />
                <stop offset="100%" stopColor="#6b92ba" />
              </linearGradient>
            </defs>
            <text x="32" y="48" textAnchor="middle"
              fontFamily="Tajawal, sans-serif" fontWeight="900" fontSize="44"
              fill="url(#sp-grad)">
              د
            </text>
          </svg>
        </div>

        {/* Word-mark */}
        <div
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(18px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: 44,
              fontWeight: 900,
              background: "linear-gradient(135deg, #e8f2fb 0%, #c4d8ea 45%, #4a70a0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: 0,
            }}
          >
            دليل
          </h1>
          <p
            style={{
              marginTop: 8, fontSize: 11, fontWeight: 600,
              letterSpacing: "0.35em", textTransform: "uppercase",
              color: "#35577D",
            }}
          >
            بوابتك الذكية للطلاب
          </p>
        </div>
      </div>

      {/* Studio credit */}
      <div
        className="absolute bottom-10 flex flex-col items-center gap-1 z-10"
        style={{ opacity: phase >= 2 ? 0.60 : 0, transition: "opacity 0.7s ease 0.5s" }}
      >
        <span style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "#1d2f4a" }}>
          Developed by
        </span>
        <span
          style={{
            fontSize: 13, fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase",
            background: "linear-gradient(135deg, #35577D, #4a70a0)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}
        >
          NOVA STUDIO
        </span>
      </div>
    </div>
  );
}
