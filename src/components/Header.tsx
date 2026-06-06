import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useEffect, useState } from "react";
import { getProfile, type Profile } from "@/lib/storage";
import { User } from "lucide-react";

export function Header() {
  const [profile, setP] = useState<Profile | null>(null);
  useEffect(() => setP(getProfile()), []);
  const initial = profile?.name?.trim()?.[0] ?? "";
  return (
    <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-xl">
      <Link to="/home" className="flex items-center" aria-label="Daleel">
        <Logo className="h-12 w-12 object-contain" />
      </Link>
      <Link
        to="/settings"
        aria-label="الإعدادات والملف الشخصي"
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gold/15 ring-1 ring-gold/30"
      >
        {profile?.picture ? (
          <img src={profile.picture} alt="" className="h-full w-full object-cover" />
        ) : initial ? (
          <span className="text-sm font-bold text-gold">{initial}</span>
        ) : (
          <User className="h-4 w-4 text-gold" />
        )}
      </Link>
    </header>
  );
}