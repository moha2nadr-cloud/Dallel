export type Slide = { id: string; title: string; subtitle?: string; image: string; url?: string };
export type FeedPost = {
  id: string;
  title: string;
  description: string;
  image?: string;
  type: "new" | "tip" | "update" | "ai";
  url?: string;
  likes: number;
  comments: number;
  date: string;
};
export type UtilityTool = {
  id: string;
  name: string;
  description: string;
  category: "pdf" | "image" | "convert" | "calc" | "other";
  url: string;
};

// All defaults removed — content is sourced from the Admin Panel CMS now.
export const slides: Slide[] = [];
export const feedPosts: FeedPost[] = [];
export const utilityTools: UtilityTool[] = [];
export const utilityCategories: { id: string; label: string }[] = [{ id: "all", label: "الكل" }];

export function timeAgoAr(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  const d = Math.floor(diff / 86400);
  if (d < 30) return `منذ ${d} يوم`;
  return `منذ ${Math.floor(d / 30)} شهر`;
}