import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  initDb,
  getProfileDb,
  upsertProfileDb,
  syncFavoritesDb,
  getFavoritesDb,
  syncLikesDb,
  getLikesDb,
  syncChatDb,
  getChatDb,
  saveCmsDb,
  loadCmsDb,
} from "../db.server";

/* ─── Helper: always init DB inside each handler ─────────────────── */
// Do NOT cache this at module level — Vercel serverless may reuse or
// discard module instances unpredictably. Each call is idempotent.
async function db() {
  await initDb();
}

/* ─── Profile ─────────────────────────────────────────────────────── */
export const syncProfile = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId:         z.string().min(1),
      name:           z.string().default(""),
      email:          z.string().optional(),
      picture:        z.string().optional(),
      age:            z.number().default(0),
      specialization: z.string().default(""),
      university:     z.string().default(""),
    }),
  )
  .handler(async ({ data }) => {
    await db();
    await upsertProfileDb(data.userId, {
      name:           data.name,
      email:          data.email ?? null,
      picture:        data.picture ?? null,
      age:            data.age,
      specialization: data.specialization,
      university:     data.university,
    });
    return { ok: true };
  });

export const getProfile = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await db();
    return getProfileDb(data.userId);
  });

/* ─── Favorites ───────────────────────────────────────────────────── */
export const syncFavorites = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId:  z.string().min(1),
      kind:    z.string().min(1),
      itemIds: z.array(z.string()),
    }),
  )
  .handler(async ({ data }) => {
    await db();
    await syncFavoritesDb(data.userId, data.kind, data.itemIds);
    return { ok: true };
  });

export const getFavorites = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await db();
    return getFavoritesDb(data.userId);
  });

/* ─── Likes ───────────────────────────────────────────────────────── */
export const syncLikes = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId:  z.string().min(1),
      itemIds: z.array(z.string()),
    }),
  )
  .handler(async ({ data }) => {
    await db();
    await syncLikesDb(data.userId, data.itemIds);
    return { ok: true };
  });

export const getLikes = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await db();
    return getLikesDb(data.userId);
  });

/* ─── Chat ────────────────────────────────────────────────────────── */
export const syncChat = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string().min(1),
      messages: z.array(
        z.object({
          role:    z.enum(["user", "assistant"]),
          content: z.string(),
          ts:      z.number(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    await db();
    await syncChatDb(data.userId, data.messages);
    return { ok: true };
  });

export const getChat = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await db();
    return getChatDb(data.userId);
  });

/* ─── CMS — Content Management ────────────────────────────────────── */
export const syncCms = createServerFn({ method: "POST" })
  .inputValidator(z.object({ data: z.record(z.unknown()) }))
  .handler(async ({ data }) => {
    await db();
    await saveCmsDb(data.data);
    return { ok: true };
  });

export const getCms = createServerFn({ method: "POST" })
  .handler(async () => {
    await db();
    return loadCmsDb();
  });

/* ─── Public read-only CMS loaders (used by each page) ───────────── */
export const getPublicSlides = createServerFn({ method: "POST" })
  .handler(async () => {
    await db();
    const d = await loadCmsDb();
    return (d?.slides ?? []) as import("../admin-store").Slide[];
  });

export const getPublicPosts = createServerFn({ method: "POST" })
  .handler(async () => {
    await db();
    const d = await loadCmsDb();
    return (d?.posts ?? []) as import("../admin-store").Post[];
  });

export const getPublicAiTools = createServerFn({ method: "POST" })
  .handler(async () => {
    await db();
    const d = await loadCmsDb();
    return (d?.aiTools ?? []) as import("../admin-store").AiToolItem[];
  });

export const getPublicUtilities = createServerFn({ method: "POST" })
  .handler(async () => {
    await db();
    const d = await loadCmsDb();
    return (d?.utilities ?? []) as import("../admin-store").UtilityItem[];
  });

export const getPublicAiCategories = createServerFn({ method: "POST" })
  .handler(async () => {
    await db();
    const d = await loadCmsDb();
    return (d?.aiCategories ?? []) as import("../admin-store").CatItem[];
  });

export const getPublicUtilCategories = createServerFn({ method: "POST" })
  .handler(async () => {
    await db();
    const d = await loadCmsDb();
    return (d?.utilCategories ?? []) as import("../admin-store").CatItem[];
  });

/* ─── Image Upload via Cloudinary ─────────────────────────────────── */
export const uploadImage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      base64: z.string().min(10),
      folder: z.string().default("daleel"),
    }),
  )
  .handler(async ({ data }) => {
    const cloudinary = await import("cloudinary");
    const cld = cloudinary.v2;
    cld.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dypoefnz9",
      api_key:    process.env.CLOUDINARY_API_KEY    || "624795252793334",
      api_secret: process.env.CLOUDINARY_API_SECRET || "-gnEQEquUPdv-yJr9uWB4tsDpq4",
    });
    const result = await cld.uploader.upload(data.base64, {
      folder:        data.folder,
      resource_type: "auto",
    });
    return { url: result.secure_url, publicId: result.public_id };
  });

/* ─── Load all user data at once (called after login) ─────────────── */
export const loadUserData = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await db();
    const [profile, favorites, likedIds, chatMessages] = await Promise.all([
      getProfileDb(data.userId),
      getFavoritesDb(data.userId),
      getLikesDb(data.userId),
      getChatDb(data.userId),
    ]);
    return { profile, favorites, likedIds, chatMessages };
  });
