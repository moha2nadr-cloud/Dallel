import { useEffect, useRef, useState } from "react";

type SlideItem = {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  url?: string;
};

export function HeroFallback() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{ aspectRatio: "16 / 9" }}
    >
      {/* Layered glass background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(145deg, rgba(53,87,125,0.35) 0%, rgba(20,30,48,0.6) 100%)",
          backdropFilter: "blur(2px)",
        }}
      />
      {/* Orbs */}
      <div
        className="absolute -top-8 -right-8 h-40 w-40 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, #4a70a0 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="absolute bottom-4 left-8 h-24 w-24 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #35577D 0%, transparent 70%)",
          filter: "blur(16px)",
        }}
      />
      <div
        className="absolute inset-0 rounded-3xl"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center gap-3">
        {/* Glass badge */}
        <div
          className="mb-2 flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: "rgba(53,87,125,0.25)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#96b8d6] animate-pulse" />
          <span className="text-[11px] font-semibold text-[#c4d8ea] tracking-wider">
            دليلك الذكي
          </span>
        </div>

        <h2
          className="text-[18px] font-extrabold"
          style={{
            background: "linear-gradient(135deg, #e8f0f8 0%, #96b8d6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          أدوات الذكاء الاصطناعي للطلاب
        </h2>
        <p className="text-[12px] text-[#6b92ba]">
          كل ما تحتاجه في مكان واحد
        </p>
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

  useEffect(() => {
    reset();
    return () => { if (timer.current) window.clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, n]);

  const startX = useRef<number | null>(null);
  const onStart = (e: React.TouchEvent) => (startX.current = e.touches[0].clientX);
  const onEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) setI((p) => (dx > 0 ? (p - 1 + n) % n : (p + 1) % n));
    startX.current = null;
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{ aspectRatio: "16 / 9", border: "1px solid rgba(255,255,255,0.08)" }}
      onTouchStart={onStart}
      onTouchEnd={onEnd}
    >
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={
            "absolute inset-0 transition-opacity duration-700 " +
            (idx === i ? "opacity-100" : "opacity-0 pointer-events-none")
          }
        >
          <img
            src={s.image}
            alt={s.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {/* Glass gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(14,22,37,0.92) 0%, rgba(14,22,37,0.35) 50%, transparent 100%)",
            }}
          />

          {/* Text overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4">
            {s.title && (
              <div
                className="inline-block rounded-2xl px-4 py-2"
                style={{
                  background: "rgba(14,22,37,0.55)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p className="text-[13px] font-bold text-[#d2e6fa]">{s.title}</p>
                {s.subtitle && (
                  <p className="mt-0.5 text-[11px] text-[#6b92ba]">{s.subtitle}</p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Dots indicator */}
      <div
        className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-2.5 py-1.5"
        style={{
          background: "rgba(14,22,37,0.50)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`شريحة ${idx + 1}`}
            onClick={() => setI(idx)}
            className={
              "rounded-full transition-all duration-300 " +
              (idx === i
                ? "h-1.5 w-5 bg-[#96b8d6]"
                : "h-1.5 w-1.5 bg-[rgba(107,146,186,0.45)]")
            }
          />
        ))}
      </div>
    </div>
  );
}
