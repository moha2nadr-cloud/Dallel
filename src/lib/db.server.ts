import { neon } from "@neondatabase/serverless";

/* ─── Connection ──────────────────────────────────────────────────── */
function getSql() {
  const url =
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_ERtCz95FaKoZ@ep-rapid-lab-apr0o1rb.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";
  return neon(url);
}

/* ─── Schema init ─────────────────────────────────────────────────── */
// Called inside every handler (idempotent via IF NOT EXISTS)
export async function initDb() {
  const sql = getSql();

  // profiles — no FK refs from other tables to avoid ordering issues
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL DEFAULT '',
      email         TEXT,
      picture       TEXT,
      age           INTEGER NOT NULL DEFAULT 0,
      specialization TEXT NOT NULL DEFAULT '',
      university    TEXT NOT NULL DEFAULT '',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // favorites — NO FK on user_id (avoids race with profile insert)
  await sql`
    CREATE TABLE IF NOT EXISTS favorites (
      id         SERIAL PRIMARY KEY,
      user_id    TEXT NOT NULL,
      kind       TEXT NOT NULL,
      item_id    TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, kind, item_id)
    )
  `;

  // likes — NO FK on user_id
  await sql`
    CREATE TABLE IF NOT EXISTS likes (
      id         SERIAL PRIMARY KEY,
      user_id    TEXT NOT NULL,
      item_id    TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, item_id)
    )
  `;

  // chat messages — NO FK on user_id
  await sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id         SERIAL PRIMARY KEY,
      user_id    TEXT NOT NULL,
      role       TEXT NOT NULL,
      content    TEXT NOT NULL,
      ts         BIGINT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // cms — single JSONB row for all content
  await sql`
    CREATE TABLE IF NOT EXISTS cms (
      id         TEXT PRIMARY KEY DEFAULT 'main',
      data       JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // ensure the one CMS row always exists
  await sql`
    INSERT INTO cms (id, data)
    VALUES ('main', '{}'::jsonb)
    ON CONFLICT (id) DO NOTHING
  `;
}

/* ─── Profiles ────────────────────────────────────────────────────── */
export async function getProfileDb(userId: string) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM profiles WHERE id = ${userId}`;
  return rows.length ? rows[0] : null;
}

export async function upsertProfileDb(
  userId: string,
  data: {
    name: string;
    email: string | null;
    picture: string | null;
    age: number;
    specialization: string;
    university: string;
  },
) {
  const sql = getSql();
  await sql`
    INSERT INTO profiles (id, name, email, picture, age, specialization, university)
    VALUES (
      ${userId}, ${data.name}, ${data.email}, ${data.picture},
      ${data.age}, ${data.specialization}, ${data.university}
    )
    ON CONFLICT (id) DO UPDATE SET
      name           = EXCLUDED.name,
      email          = COALESCE(EXCLUDED.email, profiles.email),
      picture        = COALESCE(EXCLUDED.picture, profiles.picture),
      age            = EXCLUDED.age,
      specialization = EXCLUDED.specialization,
      university     = EXCLUDED.university,
      updated_at     = NOW()
  `;
}

/* ─── Favorites ───────────────────────────────────────────────────── */
export async function syncFavoritesDb(
  userId: string,
  kind: string,
  itemIds: string[],
) {
  const sql = getSql();
  await sql`DELETE FROM favorites WHERE user_id = ${userId} AND kind = ${kind}`;
  for (const id of itemIds) {
    await sql`
      INSERT INTO favorites (user_id, kind, item_id)
      VALUES (${userId}, ${kind}, ${id})
      ON CONFLICT DO NOTHING
    `;
  }
}

export async function getFavoritesDb(
  userId: string,
): Promise<{ kind: string; item_id: string }[]> {
  const sql = getSql();
  return sql`SELECT kind, item_id FROM favorites WHERE user_id = ${userId}`;
}

/* ─── Likes ───────────────────────────────────────────────────────── */
export async function syncLikesDb(userId: string, itemIds: string[]) {
  const sql = getSql();
  await sql`DELETE FROM likes WHERE user_id = ${userId}`;
  for (const id of itemIds) {
    await sql`
      INSERT INTO likes (user_id, item_id)
      VALUES (${userId}, ${id})
      ON CONFLICT DO NOTHING
    `;
  }
}

export async function getLikesDb(userId: string): Promise<string[]> {
  const sql = getSql();
  const rows = await sql`SELECT item_id FROM likes WHERE user_id = ${userId}`;
  return rows.map((r: { item_id: string }) => r.item_id);
}

/* ─── Chat ────────────────────────────────────────────────────────── */
export async function syncChatDb(
  userId: string,
  messages: { role: string; content: string; ts: number }[],
) {
  const sql = getSql();
  await sql`DELETE FROM chat_messages WHERE user_id = ${userId}`;
  for (const m of messages) {
    await sql`
      INSERT INTO chat_messages (user_id, role, content, ts)
      VALUES (${userId}, ${m.role}, ${m.content}, ${m.ts})
    `;
  }
}

export async function getChatDb(
  userId: string,
): Promise<{ role: string; content: string; ts: number }[]> {
  const sql = getSql();
  return sql`
    SELECT role, content, ts
    FROM chat_messages
    WHERE user_id = ${userId}
    ORDER BY ts ASC
  `;
}

/* ─── CMS ─────────────────────────────────────────────────────────── */
export async function saveCmsDb(data: Record<string, unknown>) {
  const sql = getSql();
  const json = JSON.stringify(data);
  await sql`
    INSERT INTO cms (id, data, updated_at)
    VALUES ('main', ${json}::jsonb, NOW())
    ON CONFLICT (id) DO UPDATE SET
      data       = EXCLUDED.data,
      updated_at = NOW()
  `;
}

export async function loadCmsDb(): Promise<Record<string, unknown> | null> {
  const sql = getSql();
  const rows = await sql`SELECT data FROM cms WHERE id = 'main'`;
  if (!rows.length) return null;
  const d = rows[0].data;
  // Return empty-object as null so callers use DEFAULT
  if (!d || Object.keys(d).length === 0) return null;
  return d;
}
