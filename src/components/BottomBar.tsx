import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sparkles, Wrench, MessageCircle, Star } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function BottomBar() {
  const { location } = useRouterState();
  const [, t] = useLang();
  const tabs = [
    { to: "/home", label: t.home, icon: Home },
    { to: "/ai-tools", label: t.ai_tools, icon: Sparkles },
    { to: "/utilities", label: t.utilities, icon: Wrench },
    { to: "/chat", label: t.assistant, icon: MessageCircle },
    { to: "/favorites", label: t.favorites, icon: Star },
  ] as const;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
        {tabs.map((t) => {
          const active = location.pathname === t.to || location.pathname.startsWith(t.to + "/");
          const Icon = t.icon;
          return (
            <li key={t.to} className="flex-1">
              <Link
                to={t.to}
                className="group flex flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 transition-colors"
              >
                <span
                  className={
                    "flex h-9 w-14 items-center justify-center rounded-full transition-all " +
                    (active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground group-hover:text-foreground")
                  }
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                </span>
                <span
                  className={
                    "text-[11px] font-medium transition-colors " +
                    (active ? "text-foreground" : "text-muted-foreground")
                  }
                >
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function WithBottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-28">
      {children}
      <BottomBar />
    </div>
  );
}