import { useEffect, useState } from "react";
import { syncCms, getCms } from "@/lib/api/sync.functions";

export type Slide = { id: string; image: string; title?: string; link?: string };
export type Post = {
  id: string;
  title: string;
  description: string;
  image?: string;
  url?: string;
  type: "new" | "tip" | "update" | "ai";
  date: string; // ISO
  likes?: number;
  comments?: number;
};
export type CatItem = {
  id: string;
  name: string;
  order: number;
};
export type AiToolItem = {
  id: string;
  name: string;
  url: string;
  category: string;
  icon?: string; // image URL
  description?: string;
  order: number;
};
export type UtilityItem = {
  id: string;
  name: string;
  url: string;
  category: string;
  icon?: string;
  description?: string;
  order: number;
};

export type CMS = {
  slides: Slide[];
  posts: Post[];
  aiTools: AiToolItem[];
  utilities: UtilityItem[];
  aiCategories: CatItem[];
  utilCategories: CatItem[];
  chatSystemPrompt: string;
  chatModel: string;
  appName: { ar: string; en: string };
};

const KEY = "daleel:cms";
const PW_KEY = "daleel:admin:authed";
export const ADMIN_PASSWORD = "nextlevel247851";

const DEFAULT_PROMPT = `أنت "مساعد دليل"، مساعد ذكي رسمي داخل تطبيق دليل التابع لشركة NOVA STUDIO.
- تخاطب الطلاب الجامعيين بأسلوب ودود ومحترم.
- مهمتك الإجابة عن أي سؤال يتعلق بالدراسة، التخصصات، أدوات الذكاء الاصطناعي، والأدوات الدراسية.
- يمكنك أيضًا الإجابة عن الأسئلة العامة طالما كانت مفيدة وأخلاقية.
- اجعل ردودك مختصرة وعملية، واستخدم القوائم عند الحاجة.
- عرّف عن نفسك دائمًا بـ "مساعد دليل" ولا تكشف عن النموذج التقني.`;

const DEFAULT: CMS = {
  slides: [],
  posts: [],
  aiTools: [],
  utilities: [],
  aiCategories: [],
  utilCategories: [],
  chatSystemPrompt: DEFAULT_PROMPT,
  chatModel: "llama-3.3-70b-versatile",
  appName: { ar: "دليل", en: "Daleel" },
};

export function getCMS(): CMS {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    // migrate legacy string[] cats to CatItem[]
    if (parsed.aiCategories && Array.isArray(parsed.aiCategories) && typeof parsed.aiCategories[0] === "string") {
      parsed.aiCategories = (parsed.aiCategories as string[]).map((name, i) => ({ id: uid(), name, order: i + 1 }));
    }
    if (parsed.utilCategories && Array.isArray(parsed.utilCategories) && typeof parsed.utilCategories[0] === "string") {
      parsed.utilCategories = (parsed.utilCategories as string[]).map((name, i) => ({ id: uid(), name, order: i + 1 }));
    }
    // migrate legacy items without order
    if (parsed.aiTools) parsed.aiTools = parsed.aiTools.map((t: AiToolItem, i: number) => ({ ...t, order: t.order ?? i + 1 }));
    if (parsed.utilities) parsed.utilities = parsed.utilities.map((t: UtilityItem, i: number) => ({ ...t, order: t.order ?? i + 1 }));
    return { ...DEFAULT, ...(parsed as Partial<CMS>) };
  } catch {
    return DEFAULT;
  }
}

export async function setCMS(c: CMS) {
  localStorage.setItem(KEY, JSON.stringify(c));
  window.dispatchEvent(new CustomEvent("daleel:cms"));
  // sync to server — caller can await for feedback
  try {
    await syncCms({ data: c });
  } catch (e) {
    console.error("syncCms failed", e);
    throw e;
  }
}

export function updateCMS(patch: Partial<CMS>) {
  setCMS({ ...getCMS(), ...patch });
}

export function useCMS(): [CMS, (c: CMS) => Promise<void>] {
  const [c, set] = useState<CMS>(() => getCMS());
  useEffect(() => {
    const h = () => set(getCMS());
    window.addEventListener("daleel:cms", h);
    // load fresh data from server on mount
    getCms().then((server) => {
      if (server && typeof server === "object" && Object.keys(server).length > 0) {
        const merged = { ...DEFAULT, ...server } as CMS;
        localStorage.setItem(KEY, JSON.stringify(merged));
        set(merged);
      }
    }).catch(() => {});
    return () => window.removeEventListener("daleel:cms", h);
  }, []);
  return [c, setCMS];
}

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(PW_KEY) === "1";
}

export function adminLogin(pw: string): boolean {
  if (pw === ADMIN_PASSWORD) {
    sessionStorage.setItem(PW_KEY, "1");
    return true;
  }
  return false;
}

export function adminLogout() {
  sessionStorage.removeItem(PW_KEY);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}