import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, useRouterState, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { applyTheme, getTheme } from "../lib/theme";
import { applyLang, getLang } from "../lib/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-white">
      <div className="lg-panel max-w-sm w-full text-center rounded-3xl p-8">
        <div className="lg-shine-stripe mb-6" />
        <h1 className="text-[80px] font-extrabold leading-none logo-gradient">404</h1>
        <h2 className="mt-3 text-lg font-bold text-gray-900">الصفحة غير موجودة</h2>
        <p className="mt-2 text-[12px] text-gray-500">الصفحة التي تبحث عنها غير موجودة أو تمت إزالتها.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold text-white transition-lg"
          style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)", boxShadow: "0 4px 16px rgba(181,168,152,0.38)" }}>
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-white">
      <div className="lg-panel max-w-sm w-full text-center rounded-3xl p-8">
        <div className="lg-shine-stripe mb-6" />
        <h1 className="text-lg font-bold text-gray-900">حدث خطأ</h1>
        <p className="mt-2 text-[12px] text-gray-500">حدث خطأ أثناء تحميل الصفحة. يمكنك المحاولة مجدداً.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-2xl px-5 py-2.5 text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg,#B5A898,#8B7D6F)" }}>حاول مجدداً</button>
          <a href="/" className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-gray-600"
            style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(200,195,185,0.28)" }}>الرئيسية</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "دليل — بوابتك الذكية لأدوات الطلاب" },
      { name: "description", content: "دليل: اكتشف أفضل أدوات الذكاء الاصطناعي حسب كليتك وتخصصك." },
      { name: "theme-color", content: "#FFFFFF" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { location } = useRouterState();
  useEffect(() => { applyTheme(getTheme()); applyLang(getLang()); }, []);

  // background sync: when app comes to foreground
  useEffect(() => {
    const sync = async () => {
      if (typeof window === "undefined") return;
      const { getUserId, getProfile: getLocalProfile, getFavs, getLikes, getChatHistory } = await import("@/lib/storage");
      const { syncProfile, syncFavorites, syncLikes, syncChat } = await import("@/lib/api/sync.functions");
      const userId = getUserId();
      if (!userId) return;
      try {
        const p = getLocalProfile();
        if (p) await syncProfile({ data: { userId, ...p } });
        for (const kind of ["post", "ai", "tool", "chat"] as const) {
          const ids = getFavs(kind);
          if (ids.length) await syncFavorites({ data: { userId, kind, itemIds: ids } });
        }
        const lm = getLikes();
        const li = Object.keys(lm).filter((k) => lm[k]);
        if (li.length) await syncLikes({ data: { userId, itemIds: li } });
        const ch = getChatHistory();
        if (ch.length) await syncChat({ data: { userId, messages: ch } });
      } catch { /* silent */ }
    };
    // sync on mount
    sync();
    // sync on visibility change (app foreground)
    const h = () => { if (document.visibilityState === "visible") sync(); };
    document.addEventListener("visibilitychange", h);
    return () => document.removeEventListener("visibilitychange", h);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div key={location.pathname} className="animate-page-enter">
        <Outlet />
      </div>
    </QueryClientProvider>
  );
}
