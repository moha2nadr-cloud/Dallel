import { neon } from "@neondatabase/serverless";

const getSql = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
};

export async function initDb() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      email TEXT,
      picture TEXT,
      age INTEGER NOT NULL DEFAULT 0,
      specialization TEXT NOT NULL DEFAULT '',
      university TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES profiles(id),
      kind TEXT NOT NULL,
      item_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, kind, item_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES profiles(id),
      item_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, item_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES profiles(id),
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      ts BIGINT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getProfileDb(userId: string) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM profiles WHERE id = ${userId}`;
  return rows.length ? rows[0] : null;
}

export async function upsertProfileDb(
  userId: string,
  data: { name: string; email: string | null; picture: string | null; age: number; specialization: string; university: string },
) {
  const sql = getSql();
  await sql`
    INSERT INTO profiles (id, name, email, picture, age, specialization, university)
    VALUES (${userId}, ${data.name}, ${data.email}, ${data.picture}, ${data.age}, ${data.specialization}, ${data.university})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      picture = EXCLUDED.picture,
      age = EXCLUDED.age,
      specialization = EXCLUDED.specialization,
      university = EXCLUDED.university,
      updated_at = NOW()
  `;
}

export async function syncFavoritesDb(userId: string, kind: string, itemIds: string[]) {
  const sql = getSql();
  await sql`DELETE FROM favorites WHERE user_id = ${userId} AND kind = ${kind}`;
  if (itemIds.length > 0) {
    const values = itemIds.map((id) => ({ user_id: userId, kind, item_id: id }));
    for (const v of values) {
      await sql`INSERT INTO favorites (user_id, kind, item_id) VALUES (${v.user_id}, ${v.kind}, ${v.item_id}) ON CONFLICT DO NOTHING`;
    }
  }
}

export async function getFavoritesDb(userId: string): Promise<{ kind: string; item_id: string }[]> {
  const sql = getSql();
  return sql`SELECT kind, item_id FROM favorites WHERE user_id = ${userId}`;
}

export async function syncLikesDb(userId: string, itemIds: string[]) {
  const sql = getSql();
  await sql`DELETE FROM likes WHERE user_id = ${userId}`;
  for (const id of itemIds) {
    await sql`INSERT INTO likes (user_id, item_id) VALUES (${userId}, ${id}) ON CONFLICT DO NOTHING`;
  }
}

export async function getLikesDb(userId: string): Promise<string[]> {
  const sql = getSql();
  const rows = await sql`SELECT item_id FROM likes WHERE user_id = ${userId}`;
  return rows.map((r: { item_id: string }) => r.item_id);
}

export async function syncChatDb(userId: string, messages: { role: string; content: string; ts: number }[]) {
  const sql = getSql();
  await sql`DELETE FROM chat_messages WHERE user_id = ${userId}`;
  for (const m of messages) {
    await sql`INSERT INTO chat_messages (user_id, role, content, ts) VALUES (${userId}, ${m.role}, ${m.content}, ${m.ts})`;
  }
}

export async function getChatDb(userId: string): Promise<{ role: string; content: string; ts: number }[]> {
  const sql = getSql();
  return sql`SELECT role, content, ts FROM chat_messages WHERE user_id = ${userId} ORDER BY ts ASC`;
}
