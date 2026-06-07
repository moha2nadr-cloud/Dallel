import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile, type Profile } from "@/lib/storage";
import { User } from "lucide-react";

export function Header() {
  const [profile, setP] = useState<Profile | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setP(getProfile());
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initial = profile?.name?.trim()?.[0] ?? "";

  return (
    <header
      className={"sticky top-0 z-30 flex h-[58px] items-center justify-between px-5 transition-all duration-300 " +
        (scrolled ? "glass-header" : "bg-transparent")}
    >
      {/* Logo */}
      <Link to="/home" aria-label="دليل" className="flex items-center gap-2.5 group">
        <div
          className="relative flex h-9 w-9 items-center justify-center rounded-2xl transition-glass glass"
          style={{ border: "1px solid rgba(255,255,255,0.22)" }}
        >
          {/* Shine */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.14) 0%, transparent 55%)",
            }}
          />
          <svg viewBox="0 0 48 48" className="relative h-7 w-7" aria-hidden>
            <text
              x="24" y="36" textAnchor="middle"
              fontFamily="Tajawal, sans-serif" fontWeight="900" fontSize="32"
              fill="rgba(210,235,252,0.97)"
            >
              د
            </text>
          </svg>
        </div>
        <span
          className="text-[17px] font-extrabold tracking-wide"
          style={{
            background: "linear-gradient(135deg, #e8f2fb 0%, #c4d8ea 55%, #6b92ba 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          دليل
        </span>
      </Link>

      {/* Profile avatar */}
      <Link
        to="/settings"
        aria-label="الإعدادات"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full transition-glass glass"
        style={{ border: "1px solid rgba(255,255,255,0.22)" }}
      >
        {profile?.picture ? (
          <img src={profile.picture} alt="" className="h-full w-full object-cover" />
        ) : initial ? (
          <span
            className="text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #e8f2fb, #6b92ba)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {initial}
          </span>
        ) : (
          <User className="h-4 w-4 text-[#96b8d6]" />
        )}
      </Link>
    </header>
  );
}
