import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile, type Profile } from "@/lib/storage";
import { User } from "lucide-react";

export function Header() {
  const [profile, setP] = useState<Profile | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setP(getProfile());
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initial = profile?.name?.trim()?.[0] ?? "";

  return (
    <header
      className={
        "sticky top-0 z-30 flex h-[60px] items-center justify-between px-5 transition-all duration-300 " +
        (scrolled
          ? "glass-nav shadow-lg"
          : "bg-transparent")
      }
    >
      {/* Logo */}
      <Link to="/home" aria-label="دليل" className="flex items-center gap-2.5 group">
        <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl glass transition-glass">
          <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[rgba(74,112,160,0.3)] to-[rgba(35,50,82,0.2)]" />
          <svg viewBox="0 0 48 48" className="relative h-7 w-7" aria-hidden>
            <text x="24" y="36" textAnchor="middle"
              fontFamily="Tajawal, sans-serif" fontWeight="900" fontSize="32"
              fill="rgba(196,216,234,0.95)">د</text>
          </svg>
        </div>
        <span
          className="text-[17px] font-extrabold tracking-wide"
          style={{
            background: "linear-gradient(135deg, #c4d8ea 0%, #96b8d6 60%, #6b92ba 100%)",
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
        className="group flex h-9 w-9 items-center justify-center overflow-hidden rounded-full transition-glass glass"
        style={{ border: "1px solid rgba(255,255,255,0.12)" }}
      >
        {profile?.picture ? (
          <img src={profile.picture} alt="" className="h-full w-full object-cover" />
        ) : initial ? (
          <span
            className="text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #c4d8ea, #6b92ba)",
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
