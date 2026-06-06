import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sparkles, Wrench, MessageCircle, Star } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function BottomBar() {
  const { location } = useRouterState();
  const [, t] = useLang();

  const tabs = [
    { to: "/home",       label: t.home,       icon: Home          },
    { to: "/ai-tools",   label: t.ai_tools,   icon: Sparkles      },
    { to: "/utilities",  label: t.utilities,  icon: Wrench        },
    { to: "/chat",       label: t.assistant,  icon: MessageCircle },
    { to: "/favorites",  label: t.favorites,  icon: Star          },
  ] as const;

  return (
    /* Outer frame — fixed at bottom, full-width */
    <div
      className="fixed bottom-0 inset-x-0 z-40 flex justify-center pb-[env(safe-area-inset-bottom)]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)", paddingTop: 8 }}
    >
      {/* The pill nav bar — like the reference image */}
      <nav
        className="glass-nav mx-4 flex w-full max-w-md items-center justify-between rounded-[28px] px-3 py-2"
        role="navigation"
        aria-label="التنقل الرئيسي"
      >
        {tabs.map((tab) => {
          const active =
            location.pathname === tab.to ||
            location.pathname.startsWith(tab.to + "/");
          const Icon = tab.icon;

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 group"
              aria-current={active ? "page" : undefined}
            >
              {/* Active background pill */}
              {active && (
                <span
                  className="absolute inset-x-0 mx-1 rounded-[18px] glass-nav-pill"
                  style={{ insetBlock: "0" }}
                  aria-hidden
                />
              )}

              {/* Icon */}
              <span
                className={
                  "relative flex h-8 w-8 items-center justify-center rounded-[14px] transition-all duration-200 " +
                  (active ? "" : "group-hover:scale-110")
                }
              >
                <Icon
                  className={
                    "h-[18px] w-[18px] transition-all duration-200 " +
                    (active
                      ? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                      : "text-[#96b8d6] group-hover:text-[#c4d8ea]")
                  }
                  strokeWidth={active ? 2.4 : 1.8}
                />
              </span>

              {/* Label */}
              <span
                className={
                  "relative text-[10px] font-semibold transition-colors duration-200 " +
                  (active ? "text-white" : "text-[#6b92ba] group-hover:text-[#96b8d6]")
                }
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function WithBottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen pb-28">
      {children}
      <BottomBar />
    </div>
  );
}
