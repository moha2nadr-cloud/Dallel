import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";

type SlideItem = { id: string; title?: string; subtitle?: string; image: string; url?: string };

export function HeroFallback() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl ring-1 ring-border" style={{ aspectRatio: "16 / 9" }}>
      <div className="absolute inset-0 hero-glow" />
      <div className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <Logo className="h-14 w-14 object-contain opacity-90" />
        <p className="mt-3 text-[15px] font-extrabold text-gradient-gold">دليلك الذكي يبدأ هنا</p>
        <p className="mt-1 text-[11px] text-cream/70">أدوات الذكاء الاصطناعي والأدوات الطلابية في مكان واحد</p>
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
    timer.current = window.setTimeout(() => setI((p) => (p + 1) % n), 4000);
  };

  useEffect(() => {
    reset();
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, n]);

  // Touch swipe
  const startX = useRef<number | null>(null);
  const onStart = (e: React.TouchEvent) => (startX.current = e.touches[0].clientX);
  const onEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) {
      // RTL: swipe right (positive dx) -> previous
      setI((p) => (dx > 0 ? (p - 1 + n) % n : (p + 1) % n));
    }
    startX.current = null;
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-card" onTouchStart={onStart} onTouchEnd={onEnd}>
      <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={
              "absolute inset-0 transition-opacity duration-700 " +
              (idx === i ? "opacity-100" : "opacity-0 pointer-events-none")
            }
          >
            <img src={s.image} alt={s.title} className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-4">
              <p className="text-sm font-bold text-cream">{s.title}</p>
              {s.subtitle && <p className="mt-1 text-[11px] text-cream/80">{s.subtitle}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`شريحة ${idx + 1}`}
            onClick={() => setI(idx)}
            className={
              "h-1.5 rounded-full transition-all " +
              (idx === i ? "w-5 bg-gold" : "w-1.5 bg-cream/40")
            }
          />
        ))}
      </div>
    </div>
  );
}