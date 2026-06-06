import { useEffect, useState } from "react";

export type Lang = "ar" | "en";
const LANG_KEY = "daleel:lang";

const dict = {
  ar: {
    home: "الرئيسية",
    ai_tools: "أدوات AI",
    utilities: "الأدوات",
    assistant: "المساعد",
    favorites: "المفضلة",
    settings: "الإعدادات",
    language: "اللغة",
    theme: "المظهر",
    notifications: "الإشعارات",
    enabled: "مفعّلة",
    disabled: "معطّلة",
    auto: "تلقائي",
    light: "فاتح",
    dark: "داكن",
    arabic: "عربي",
    english: "إنجليزي",
    logout: "تسجيل الخروج",
    delete_account: "حذف الحساب",
    privacy: "الخصوصية والأمان",
    help: "مركز المساعدة",
    report: "الإبلاغ عن مشكلة",
    suggest: "اقتراح تحسين",
    about: "حول دليل",
    rate: "قيّم التطبيق",
    share: "شارك التطبيق",
    edit_profile: "تعديل الملف الشخصي",
    guest: "زائر",
    posts: "منشورات",
    ai: "AI",
    tools_tab: "أدوات",
    chats: "محادثات",
    no_posts: "لم تحفظ أي منشورات بعد",
    no_ai: "لم تحفظ أي أداة AI بعد",
    no_tools: "لم تحفظ أي أداة بعد",
    no_chats: "لا توجد محادثات محفوظة",
    suggested_for_you: "أدوات مقترحة لك",
    view_all: "عرض الكل",
    feed: "آخر التحديثات",
    search_ai: "ابحث عن أداة ذكاء اصطناعي...",
    search_tools: "ابحث عن أداة...",
    all: "الكل",
    no_results: "لا نتائج.",
    open: "فتح",
    use: "استخدام",
    send: "إرسال",
    type_message: "اكتب رسالتك…",
    clear_chat: "هل تريد مسح المحادثة؟",
    admin_panel: "لوحة التحكم",
    version: "الإصدار 1.0",
    powered_by: "DALEEL · POWERED BY NOVA STUDIO",
    confirm_logout: "هل تريد تسجيل الخروج؟",
    confirm_delete: "هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع.",
    no_data: "لا توجد بيانات بعد. أضف من لوحة التحكم.",
  },
  en: {
    home: "Home",
    ai_tools: "AI Tools",
    utilities: "Utilities",
    assistant: "Assistant",
    favorites: "Favorites",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    notifications: "Notifications",
    enabled: "Enabled",
    disabled: "Disabled",
    auto: "Auto",
    light: "Light",
    dark: "Dark",
    arabic: "Arabic",
    english: "English",
    logout: "Sign out",
    delete_account: "Delete account",
    privacy: "Privacy & Security",
    help: "Help center",
    report: "Report an issue",
    suggest: "Suggest improvement",
    about: "About Daleel",
    rate: "Rate the app",
    share: "Share the app",
    edit_profile: "Edit profile",
    guest: "Guest",
    posts: "Posts",
    ai: "AI",
    tools_tab: "Tools",
    chats: "Chats",
    no_posts: "No saved posts yet",
    no_ai: "No saved AI tools yet",
    no_tools: "No saved tools yet",
    no_chats: "No saved chats",
    suggested_for_you: "Suggested for you",
    view_all: "View all",
    feed: "Latest updates",
    search_ai: "Search AI tools...",
    search_tools: "Search tools...",
    all: "All",
    no_results: "No results.",
    open: "Open",
    use: "Use",
    send: "Send",
    type_message: "Type a message…",
    clear_chat: "Clear the conversation?",
    admin_panel: "Admin Panel",
    version: "Version 1.0",
    powered_by: "DALEEL · POWERED BY NOVA STUDIO",
    confirm_logout: "Sign out?",
    confirm_delete: "Delete account? This cannot be undone.",
    no_data: "No data yet. Add some from Admin Panel.",
  },
} as const;

export type T = Record<keyof typeof dict.ar, string>;

export function getLang(): Lang {
  if (typeof window === "undefined") return "ar";
  return (localStorage.getItem(LANG_KEY) as Lang) || "ar";
}

export function setLang(l: Lang) {
  localStorage.setItem(LANG_KEY, l);
  applyLang(l);
  window.dispatchEvent(new CustomEvent("daleel:lang", { detail: l }));
}

export function applyLang(l: Lang) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = l;
  document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
}

export function useLang(): [Lang, T] {
  const [l, set] = useState<Lang>(() => getLang());
  useEffect(() => {
    const h = (e: Event) => set((e as CustomEvent<Lang>).detail);
    window.addEventListener("daleel:lang", h);
    return () => window.removeEventListener("daleel:lang", h);
  }, []);
  return [l, dict[l]];
}

export function tr(l: Lang): T {
  return dict[l];
}