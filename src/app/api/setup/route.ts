import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { db } from "@/db";

type SetupResult = {
  ok: boolean;
  steps: Array<{
    name: string;
    ok: boolean;
    message: string;
  }>;
  error?: string;
};

const SETUP_SECRET = process.env.SETUP_SECRET;

function validateSetupSecret(request: Request): string | null {
  if (!SETUP_SECRET) {
    return "SETUP_SECRET در محیط تعریف نشده است. این endpoint برای حفاظت به متغیر SETUP_SECRET نیاز دارد.";
  }

  const authorization = request.headers.get("authorization");
  const expected = `Bearer ${SETUP_SECRET}`;

  if (authorization !== expected) {
    return "اعتبارسنجی SETUP_SECRET ناموفق بود.";
  }

  return null;
}

async function tableExists(tableName: string): Promise<boolean> {
  try {
    const client = await (await import("@/db")).pool.connect();
    const result = await client.query(
      `SELECT COUNT(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
      [tableName],
    );
    client.release();
    return result.rows[0]?.count > 0;
  } catch {
    return false;
  }
}

async function listTables(): Promise<string[]> {
  const client = await (await import("@/db")).pool.connect();
  const result = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
  );
  client.release();
  return result.rows.map((row: any) => row.table_name);
}

async function createTables(): Promise<string> {
  const tables = ["categories", "menu_items", "reservations", "site_info", "admins"];
  const existingTables = await listTables();
  const missing = tables.filter((table) => !existingTables.includes(table));

  if (missing.length === 0) {
    return "تمام جداول از قبل در دیتابیس موجود بودند.";
  }

  const schemaStatements: string[] = [];

  if (missing.includes("categories")) {
    schemaStatements.push(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name_fa VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }

  if (missing.includes("menu_items")) {
    schemaStatements.push(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        name_fa VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        description_fa TEXT NOT NULL,
        description_en TEXT NOT NULL,
        price INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }

  if (missing.includes("reservations")) {
    schemaStatements.push(`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(50) NOT NULL,
        guests INTEGER NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        notes TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }

  if (missing.includes("site_info")) {
    schemaStatements.push(`
      CREATE TABLE IF NOT EXISTS site_info (
        id SERIAL PRIMARY KEY,
        hours_fa VARCHAR(255) NOT NULL,
        hours_en VARCHAR(255) NOT NULL,
        phone_primary VARCHAR(50) NOT NULL,
        phone_secondary VARCHAR(50) NOT NULL,
        address_fa TEXT NOT NULL,
        address_en TEXT NOT NULL,
        instagram_url TEXT NOT NULL,
        instagram_handle VARCHAR(255) NOT NULL,
        maps_url TEXT NOT NULL,
        tagline_fa TEXT NOT NULL,
        tagline_en TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }

  if (missing.includes("admins")) {
    schemaStatements.push(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS admins_username_idx ON admins (username);
    `);
  }

  const client = await (await import("@/db")).pool.connect();
  try {
    await client.query("BEGIN");
    for (const statement of schemaStatements) {
      await client.query(statement);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return `جدول‌های زیر ساخته شدند: ${missing.join("، ")}.`;
}

async function seedData(): Promise<string> {
  const { ensureSeedData } = await import("@/lib/data");
  await ensureSeedData();
  return "داده‌های اولیه (دسته‌بندی‌ها، آیتم‌های منو، اطلاعات سایت و مدیر پیش‌فرض) با موفقیت ثبت شدند.";
}

export async function GET(request: Request) {
  const authError = validateSetupSecret(request);
  if (authError) {
    return Response.json({ error: authError }, { status: 401 });
  }

  const tables = await listTables();

  return Response.json({
    ok: true,
    tables,
    nextSteps: [
      tables.length === 0 ? "اجرای POST برای ساخت جداول" : "جداول آماده‌اند",
      tables.includes("admins") ? "پنل ادمین آماده ورود است (admin / RupiyaAdmin!2026)" : "پس از ساخت جداول، حساب ادمین ساخته می‌شود",
    ],
  });
}

export async function POST(request: Request) {
  const authError = validateSetupSecret(request);
  if (authError) {
    return Response.json({ error: authError }, { status: 401 });
  }

  const result: SetupResult = { ok: true, steps: [] };

  try {
    const createMessage = await createTables();
    result.steps.push({ name: "create-tables", ok: true, message: createMessage });
  } catch (error) {
    result.ok = false;
    result.error = error instanceof Error ? error.message : "ساخت جداول ناموفق بود.";
    result.steps.push({ name: "create-tables", ok: false, message: result.error });
    return Response.json(result, { status: 500 });
  }

  try {
    const seedMessage = await seedData();
    result.steps.push({ name: "seed-data", ok: true, message: seedMessage });
  } catch (error) {
    result.ok = false;
    result.error = error instanceof Error ? error.message : "ثبت داده‌های اولیه ناموفق بود.";
    result.steps.push({ name: "seed-data", ok: false, message: result.error });
    return Response.json(result, { status: 500 });
  }

  return Response.json(result);
}
