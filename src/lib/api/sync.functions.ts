import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { initDb, upsertProfileDb, getProfileDb, syncFavoritesDb, getFavoritesDb, syncLikesDb, getLikesDb, syncChatDb, getChatDb, initCmsDb, saveCmsDb, loadCmsDb } from "../db.server";

const ensureDb = Promise.all([initDb(), initCmsDb()]);

export const syncProfile = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userId: z.string().min(1),
    name: z.string(),
    email: z.string().optional(),
    picture: z.string().optional(),
    age: z.number(),
    specialization: z.string(),
    university: z.string(),
  }))
  .handler(async ({ data }) => {
    await ensureDb;
    await upsertProfileDb(data.userId, {
      name: data.name,
      email: data.email ?? null,
      picture: data.picture ?? null,
      age: data.age,
      specialization: data.specialization,
      university: data.university,
    });
    return { ok: true };
  });

export const getProfile = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await ensureDb;
    return getProfileDb(data.userId);
  });

export const syncFavorites = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userId: z.string().min(1),
    kind: z.string().min(1),
    itemIds: z.array(z.string()),
  }))
  .handler(async ({ data }) => {
    await ensureDb;
    await syncFavoritesDb(data.userId, data.kind, data.itemIds);
    return { ok: true };
  });

export const getFavorites = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await ensureDb;
    return getFavoritesDb(data.userId);
  });

export const syncLikes = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userId: z.string().min(1),
    itemIds: z.array(z.string()),
  }))
  .handler(async ({ data }) => {
    await ensureDb;
    await syncLikesDb(data.userId, data.itemIds);
    return { ok: true };
  });

export const getLikes = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await ensureDb;
    return getLikesDb(data.userId);
  });

export const syncChat = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userId: z.string().min(1),
    messages: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      ts: z.number(),
    })),
  }))
  .handler(async ({ data }) => {
    await ensureDb;
    await syncChatDb(data.userId, data.messages);
    return { ok: true };
  });

export const getChat = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await ensureDb;
    return getChatDb(data.userId);
  });

export const syncCms = createServerFn({ method: "POST" })
  .inputValidator(z.object({ data: z.record(z.unknown()) }))
  .handler(async ({ data }) => {
    await ensureDb;
    await saveCmsDb(data.data);
    return { ok: true };
  });

export const getCms = createServerFn({ method: "POST" })
  .handler(async () => {
    await ensureDb;
    return loadCmsDb();
  });

// Public read-only server functions — each page calls its own
export const getPublicSlides = createServerFn({ method: "POST" })
  .handler(async () => {
    await ensureDb;
    const data = await loadCmsDb();
    return (data?.slides ?? []) as import("../admin-store").Slide[];
  });

export const getPublicPosts = createServerFn({ method: "POST" })
  .handler(async () => {
    await ensureDb;
    const data = await loadCmsDb();
    return (data?.posts ?? []) as import("../admin-store").Post[];
  });

export const getPublicAiTools = createServerFn({ method: "POST" })
  .handler(async () => {
    await ensureDb;
    const data = await loadCmsDb();
    return (data?.aiTools ?? []) as import("../admin-store").AiToolItem[];
  });

export const getPublicUtilities = createServerFn({ method: "POST" })
  .handler(async () => {
    await ensureDb;
    const data = await loadCmsDb();
    return (data?.utilities ?? []) as import("../admin-store").UtilityItem[];
  });

export const getPublicAiCategories = createServerFn({ method: "POST" })
  .handler(async () => {
    await ensureDb;
    const data = await loadCmsDb();
    return (data?.aiCategories ?? []) as import("../admin-store").CatItem[];
  });

export const getPublicUtilCategories = createServerFn({ method: "POST" })
  .handler(async () => {
    await ensureDb;
    const data = await loadCmsDb();
    return (data?.utilCategories ?? []) as import("../admin-store").CatItem[];
  });
