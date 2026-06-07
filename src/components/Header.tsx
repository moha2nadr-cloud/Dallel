import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile, type Profile } from "@/lib/storage";
import { User } from "lucide-react";
import logoSrc from "@/assets/logo-daleel.png";

export function Header() {
  const [profile, setP] = useState<Profile | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { location } = useRouterState();
  const isHome = location.pathname === "/home";

  useEffect(() => {
    setP(getProfile());
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initial = profile?.name?.trim()?.[0] ?? "";
  const firstName = profile?.name?.trim().split(" ")[0] ?? "";

  return (
    <header
      className={"sticky top-0 z-30 flex h-[58px] items-center justify-between px-5 transition-all duration-300 " +
        (scrolled ? "lg-header" : "bg-transparent")}
    >
      {/* Right side */}
      {isHome ? (
        /* Home: greeting text */
        <div className="flex items-center gap-1.5 animate-reveal-up">
          <span className="text-[17px] font-bold text-gray-800">
            أهلاً!{firstName ? ` ${firstName}` : ""}
          </span>
          {/* Small logo-colored dot accent */}
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "linear-gradient(135deg, #B5A898, #8B7D6F)" }}
          />
        </div>
      ) : (
        /* Other pages: brand logo */
        <Link to="/home" aria-label="دليل" className="flex items-center">
          <img src={logoSrc} alt="دليل" style={{ height: 28, width: "auto", objectFit: "contain" }} />
        </Link>
      )}

      {/* Left side: profile avatar */}
      <Link
        to="/settings"
        aria-label="الإعدادات"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full transition-lg"
        style={{
          background: "rgba(255,255,255,0.80)",
          border: "1px solid rgba(200,195,185,0.32)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)",
        }}
      >
        {profile?.picture ? (
          <img src={profile.picture} alt="" className="h-full w-full object-cover" />
        ) : initial ? (
          <span className="text-sm font-bold logo-gradient">{initial}</span>
        ) : (
          <User className="h-4 w-4 text-gray-400" />
        )}
      </Link>
    </header>
  );
}
