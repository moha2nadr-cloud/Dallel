import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { applyTheme, getTheme } from "../lib/theme";
import { applyLang, getLang } from "../lib/i18n";

function NotFoundComponent() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #141E30 0%, #0a1220 100%)" }}
    >
      <div
        className="max-w-sm w-full text-center rounded-3xl p-8"
        style={{
          background: "rgba(53,87,125,0.14)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.30)",
        }}
      >
        <h1
          className="text-[80px] font-extrabold leading-none"
          style={{
            background: "linear-gradient(135deg, #c4d8ea, #4a70a0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </h1>
        <h2 className="mt-3 text-lg font-bold text-[#c4d8ea]">الصفحة غير موجودة</h2>
        <p className="mt-2 text-[12px] text-[#6b92ba]">
          الصفحة التي تبحث عنها غير موجودة أو تمت إزالتها.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #35577D, #4a70a0)",
            boxShadow: "0 4px 16px rgba(53,87,125,0.40)",
          }}
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #141E30 0%, #0a1220 100%)" }}
    >
      <div
        className="max-w-sm w-full text-center rounded-3xl p-8"
        style={{
          background: "rgba(53,87,125,0.14)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        <h1 className="text-lg font-bold text-[#c4d8ea]">حدث خطأ</h1>
        <p className="mt-2 text-[12px] text-[#6b92ba]">
          حدث خطأ أثناء تحميل الصفحة. يمكنك المحاولة مجدداً.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-2xl px-5 py-2.5 text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #35577D, #4a70a0)" }}
          >
            حاول مجدداً
          </button>
          <a
            href="/"
            className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-[#96b8d6]"
            style={{ background: "rgba(53,87,125,0.15)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            الرئيسية
          </a>
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
      { name: "theme-color", content: "#141E30" },
      { name: "author", content: "NOVA STUDIO" },
      { property: "og:title", content: "دليل" },
      { property: "og:description", content: "بوابتك الذكية لأدوات الطلاب" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap",
      },
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
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    applyTheme(getTheme());
    applyLang(getLang());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
