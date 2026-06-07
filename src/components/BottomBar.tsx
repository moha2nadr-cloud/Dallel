import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sparkles, Wrench, MessageCircle, Bookmark } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function BottomBar() {
  const { location } = useRouterState();
  const [, t] = useLang();

  const tabs = [
    { to: "/home",      label: t.home,      icon: Home          },
    { to: "/ai-tools",  label: t.ai_tools,  icon: Sparkles      },
    { to: "/utilities", label: t.utilities, icon: Wrench        },
    { to: "/chat",      label: t.assistant, icon: MessageCircle },
    { to: "/favorites", label: t.favorites, icon: Bookmark      },
  ] as const;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 flex justify-center"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom),10px)", paddingTop: 8, paddingLeft: 12, paddingRight: 12 }}
    >
      <nav
        className="lg-nav flex w-full max-w-md items-center justify-between rounded-[28px] px-2 py-2"
        role="navigation"
        aria-label="التنقل الرئيسي"
      >
        {tabs.map((tab) => {
          const active = location.pathname === tab.to || location.pathname.startsWith(tab.to + "/");
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 group"
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <span
                  className="absolute lg-nav-pill rounded-[18px]"
                  style={{ inset: 0, margin: "0 3px" }}
                  aria-hidden
                />
              )}
              <span className="relative flex h-7 w-7 items-center justify-center">
                <Icon
                  className={"h-[19px] w-[19px] transition-all duration-200 " +
                    (active ? "text-[#8B7D6F]" : "text-gray-400 group-hover:text-gray-600")}
                  strokeWidth={active ? 2.4 : 1.8}
                />
              </span>
              <span
                className={"relative text-[10px] font-semibold leading-none transition-colors duration-200 " +
                  (active ? "text-[#8B7D6F]" : "text-gray-400 group-hover:text-gray-500")}
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
    <div className="relative min-h-screen pb-28 bg-white">
      {children}
      <BottomBar />
    </div>
  );
}
