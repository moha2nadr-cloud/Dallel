import { useEffect, useRef, useState } from "react";

type SlideItem = { id: string; title?: string; subtitle?: string; image: string; url?: string };

export function HeroFallback() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl" style={{ aspectRatio: "16/9" }}>
      {/* Liquid glass panel over gradient */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(145deg,rgba(181,168,152,0.18) 0%,rgba(196,185,173,0.10) 100%)" }} />
      {/* Soft blobs */}
      <div className="absolute -top-6 -right-6 h-36 w-36 rounded-full" style={{ background: "radial-gradient(circle,rgba(196,185,173,0.35) 0%,transparent 70%)", filter: "blur(20px)" }} />
      <div className="absolute bottom-4 left-8 h-20 w-20 rounded-full" style={{ background: "radial-gradient(circle,rgba(181,168,152,0.28) 0%,transparent 70%)", filter: "blur(16px)" }} />

      {/* Glass border */}
      <div className="absolute inset-0 rounded-3xl" style={{ border: "1px solid rgba(255,255,255,0.80)", boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)" }} />

      {/* Top shine */}
      <div className="absolute top-0 inset-x-6 h-px rounded-full" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.90),transparent)" }} />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center gap-3">
        <div className="mb-2 flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(200,195,185,0.35)", backdropFilter: "blur(16px)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)" }} />
          <span className="text-[11px] font-semibold text-gray-600 tracking-wider">دليلك الذكي</span>
        </div>
        <h2 className="text-[18px] font-extrabold text-gray-800">أدوات الذكاء الاصطناعي للطلاب</h2>
        <p className="text-[12px] text-gray-500">كل ما تحتاجه في مكان واحد</p>
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
  const onEnd = (e: React.TouchEvent) => {
    if (!startX.current) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) setI((p) => (dx > 0 ? (p - 1 + n) % n : (p + 1) % n));
    startX.current = null;
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl"
      style={{ aspectRatio: "16/9", border: "1px solid rgba(255,255,255,0.80)", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
      onTouchStart={onStart} onTouchEnd={onEnd}>

      {slides.map((s, idx) => (
        <div key={s.id} className={"absolute inset-0 transition-opacity duration-700 " + (idx === i ? "opacity-100" : "opacity-0 pointer-events-none")}>
          <img src={s.image} alt={s.title} className="h-full w-full object-cover" loading="lazy" />
          {/* Glass gradient overlay at bottom */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(0,0,0,0.50) 0%,rgba(0,0,0,0.12) 50%,transparent 100%)" }} />
          {s.title && (
            <div className="absolute bottom-0 inset-x-0 p-4">
              <div className="inline-block rounded-2xl px-4 py-2"
                style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.85)", boxShadow: "0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)" }}>
                <p className="text-[13px] font-bold text-gray-900">{s.title}</p>
                {s.subtitle && <p className="mt-0.5 text-[11px] text-gray-600">{s.subtitle}</p>}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Liquid glass dot indicator */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-2.5 py-1.5"
        style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.85)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        {slides.map((_, idx) => (
          <button key={idx} type="button" onClick={() => setI(idx)}
            className={"rounded-full transition-all duration-300 " + (idx === i ? "h-1.5 w-5" : "h-1.5 w-1.5")}
            style={{ background: idx === i ? "linear-gradient(90deg,#B5A898,#8B7D6F)" : "#D9D0C7" }}
            aria-label={`شريحة ${idx + 1}`} />
        ))}
      </div>
    </div>
  );
}
