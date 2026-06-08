import { useEffect, useState, useCallback } from "react";
import { syncCms, getCms } from "@/lib/api/sync.functions";

/* ─── Types ───────────────────────────────────────────────────────── */
export type Slide = { id: string; image: string; title?: string; link?: string };

export type Post = {
  id: string;
  title: string;
  description: string;
  image?: string;
  url?: string;
  type: "new" | "tip" | "update" | "ai";
  date: string;
  likes?: number;
  comments?: number;
};

export type CatItem = { id: string; name: string; order: number };

export type AiToolItem = {
  id: string;
  name: string;
  url: string;
  category: string;
  icon?: string;
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

/* ─── Constants ───────────────────────────────────────────────────── */
const KEY = "daleel:cms:v2";
const PW_KEY = "daleel:admin:authed";
export const ADMIN_PASSWORD = "nextlevel247851";

const DEFAULT_PROMPT = `أنت "مساعد دليل"، مساعد ذكي رسمي داخل تطبيق دليل التابع لشركة NOVA STUDIO.
- تخاطب الطلاب الجامعيين بأسلوب ودود ومحترم.
- مهمتك الإجابة عن أي سؤال يتعلق بالدراسة، التخصصات، أدوات الذكاء الاصطناعي، والأدوات الدراسية.
- يمكنك أيضًا الإجابة عن الأسئلة العامة طالما كانت مفيدة وأخلاقية.
- اجعل ردودك مختصرة وعملية، واستخدم القوائم عند الحاجة.
- عرّف عن نفسك دائمًا بـ "مساعد دليل" ولا تكشف عن النموذج التقني.`;

export const DEFAULT_CMS: CMS = {
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

/* ─── LocalStorage helpers ────────────────────────────────────────── */
function readLocal(): CMS {
  if (typeof window === "undefined") return DEFAULT_CMS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CMS;
    const p = JSON.parse(raw) as Partial<CMS>;
    // migrate legacy string[] cats → CatItem[]
    if (p.aiCategories?.length && typeof (p.aiCategories[0] as unknown) === "string") {
      p.aiCategories = (p.aiCategories as unknown as string[]).map((n, i) => ({
        id: uid(), name: n, order: i + 1,
      }));
    }
    if (p.utilCategories?.length && typeof (p.utilCategories[0] as unknown) === "string") {
      p.utilCategories = (p.utilCategories as unknown as string[]).map((n, i) => ({
        id: uid(), name: n, order: i + 1,
      }));
    }
    if (p.aiTools) p.aiTools = p.aiTools.map((t, i) => ({ ...t, order: t.order ?? i + 1 }));
    if (p.utilities) p.utilities = p.utilities.map((t, i) => ({ ...t, order: t.order ?? i + 1 }));
    return { ...DEFAULT_CMS, ...p };
  } catch {
    return DEFAULT_CMS;
  }
}

function writeLocal(c: CMS) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(c));
}

/* ─── Merge server CMS into local ────────────────────────────────── */
function mergeServer(server: Record<string, unknown>): CMS {
  const s = server as Partial<CMS>;
  // migrate same as readLocal
  if (s.aiCategories?.length && typeof (s.aiCategories[0] as unknown) === "string") {
    s.aiCategories = (s.aiCategories as unknown as string[]).map((n, i) => ({
      id: uid(), name: n, order: i + 1,
    }));
  }
  if (s.utilCategories?.length && typeof (s.utilCategories[0] as unknown) === "string") {
    s.utilCategories = (s.utilCategories as unknown as string[]).map((n, i) => ({
      id: uid(), name: n, order: i + 1,
    }));
  }
  if (s.aiTools) s.aiTools = (s.aiTools as AiToolItem[]).map((t, i) => ({ ...t, order: t.order ?? i + 1 }));
  if (s.utilities) s.utilities = (s.utilities as UtilityItem[]).map((t, i) => ({ ...t, order: t.order ?? i + 1 }));
  return { ...DEFAULT_CMS, ...s };
}

/* ─── useCMS hook ─────────────────────────────────────────────────── */
export type SyncStatus = "idle" | "saving" | "saved" | "error";

export function useCMS(): [CMS, (c: CMS) => Promise<void>, SyncStatus] {
  const [cms, set] = useState<CMS>(() => readLocal());
  const [status, setStatus] = useState<SyncStatus>("idle");

  // Load from DB on mount — DB is source of truth
  useEffect(() => {
    getCms()
      .then((server) => {
        if (server && typeof server === "object" && Object.keys(server).length > 0) {
          const merged = mergeServer(server as Record<string, unknown>);
          writeLocal(merged);
          set(merged);
        }
      })
      .catch(() => {
        // DB unreachable — keep localStorage version
      });

    const handler = () => set(readLocal());
    window.addEventListener("daleel:cms", handler);
    return () => window.removeEventListener("daleel:cms", handler);
  }, []);

  const saveCMS = useCallback(async (c: CMS) => {
    // 1. Write locally first so UI responds instantly
    writeLocal(c);
    set(c);
    window.dispatchEvent(new CustomEvent("daleel:cms"));

    // 2. Persist to DB
    setStatus("saving");
    try {
      await syncCms({ data: c as unknown as Record<string, unknown> });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("[CMS] sync failed:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
      throw err; // let caller show toast
    }
  }, []);

  return [cms, saveCMS, status];
}

/* ─── Admin auth ─────────────────────────────────────────────────── */
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

/* ─── Utility ─────────────────────────────────────────────────────── */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
