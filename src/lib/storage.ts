export type Profile = {
  name: string;
  age: number;
  specialization: string;
  university: string;
  email?: string;
  picture?: string;
};

const PROFILE_KEY = "daleel:profile";
const FAV_PREFIX = "daleel:fav:";
const LIKE_KEY = "daleel:likes";
const CHAT_KEY = "daleel:chat";

export type ChatMessage = { role: "user" | "assistant"; content: string; ts: number };

export function getChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function setChatHistory(msgs: ChatMessage[]) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(msgs.slice(-40)));
}

export function clearChatHistory() {
  localStorage.removeItem(CHAT_KEY);
}

export function getProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function setProfile(p: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

export type FavKind = "post" | "ai" | "tool" | "chat";

export function getFavs(kind: FavKind): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAV_PREFIX + kind);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleFav(kind: FavKind, id: string): boolean {
  const cur = getFavs(kind);
  const has = cur.includes(id);
  const next = has ? cur.filter((x) => x !== id) : [...cur, id];
  localStorage.setItem(FAV_PREFIX + kind, JSON.stringify(next));
  return !has;
}

export function isFav(kind: FavKind, id: string): boolean {
  return getFavs(kind).includes(id);
}

export function getLikes(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LIKE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function toggleLike(id: string): boolean {
  const cur = getLikes();
  cur[id] = !cur[id];
  localStorage.setItem(LIKE_KEY, JSON.stringify(cur));
  return cur[id];
}