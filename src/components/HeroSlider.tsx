import { useEffect, useRef, useState } from "react";

type SlideItem = { id: string; title?: string; subtitle?: string; image: string; url?: string };

/* Reusable bright glass style */
const glassOverlay: React.CSSProperties = {
  background: "linear-gradient(148deg, rgba(200,228,252,0.13) 0%, rgba(130,185,235,0.07) 100%)",
  border: "1px solid rgba(255,255,255,0.22)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  boxShadow: "0 8px 28px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.18)",
};

export function HeroFallback() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{ aspectRatio: "16 / 9", border: "1px solid rgba(255,255,255,0.18)" }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(145deg, rgba(100,165,230,0.32) 0%, rgba(20,30,48,0.70) 100%)",
        }}
      />
      {/* Bright orb top-right */}
      <div
        className="absolute -top-6 -right-6 h-36 w-36 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(190,225,255,0.55) 0%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />
      {/* Orb bottom-left */}
      <div
        className="absolute bottom-2 left-4 h-20 w-20 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(110,175,238,0.45) 0%, transparent 70%)",
          filter: "blur(18px)",
        }}
      />

      {/* Shine stripe */}
      <div
        className="absolute top-0 inset-x-6 h-px rounded-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent)" }}
      />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center gap-3">
        <div
          className="mb-2 flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: "rgba(200,228,255,0.14)",
            border: "1px solid rgba(255,255,255,0.26)",
            backdropFilter: "blur(16px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#96b8d6] animate-pulse" />
          <span className="text-[11px] font-semibold text-[#d7ebfc] tracking-wider">دليلك الذكي</span>
        </div>

        <h2
          className="text-[18px] font-extrabold"
          style={{
            background: "linear-gradient(135deg, #e8f2fb 0%, #96b8d6 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}
        >
          أدوات الذكاء الاصطناعي للطلاب
        </h2>
        <p className="text-[12px] text-[#6b92ba]">كل ما تحتاجه في مكان واحد</p>
      </div>
    </div>
  );
}

export function HeroSlider({ slides }: { slides: SlideItem[] }) {
  const [i, setI] = useState(0);
  const timer = useRef<number | null>(null);
  const n = slides.length;
  if (n === 0) return <HeroFallback />;

  const reset = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setI((p) => (p + 1) % n), 4200);
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => { reset(); return () => { if (timer.current) window.clearTimeout(timer.current); }; }, [i, n]);

  const startX = useRef<number | null>(null);
  const onStart = (e: React.TouchEvent) => (startX.current = e.touches[0].clientX);
  const onEnd   = (e: React.TouchEvent) => {
    if (!startX.current) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) setI((p) => (dx > 0 ? (p - 1 + n) % n : (p + 1) % n));
    startX.current = null;
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{ aspectRatio: "16 / 9", border: "1px solid rgba(255,255,255,0.20)" }}
      onTouchStart={onStart} onTouchEnd={onEnd}
    >
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={"absolute inset-0 transition-opacity duration-700 " + (idx === i ? "opacity-100" : "opacity-0 pointer-events-none")}
        >
          <img src={s.image} alt={s.title} className="h-full w-full object-cover" loading="lazy" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(10,18,32,0.90) 0%, rgba(10,18,32,0.25) 55%, transparent 100%)" }}
          />
          {s.title && (
            <div className="absolute bottom-0 inset-x-0 p-4">
              <div
                className="inline-block rounded-2xl px-4 py-2"
                style={{
                  background: "rgba(200,228,252,0.12)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  backdropFilter: "blur(16px)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
                }}
              >
                <p className="text-[13px] font-bold text-[#d7ebfc]">{s.title}</p>
                {s.subtitle && <p className="mt-0.5 text-[11px] text-[#6b92ba]">{s.subtitle}</p>}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Dot indicator */}
      <div
        className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-2.5 py-1.5"
        style={{
          background: "rgba(200,228,252,0.13)",
          border: "1px solid rgba(255,255,255,0.22)",
          backdropFilter: "blur(12px)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
        }}
      >
        {slides.map((_, idx) => (
          <button
            key={idx} type="button" onClick={() => setI(idx)}
            className={"rounded-full transition-all duration-300 " + (idx === i ? "h-1.5 w-5 bg-[#c4d8ea]" : "h-1.5 w-1.5 bg-[rgba(200,228,255,0.35)]")}
            aria-label={`شريحة ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
