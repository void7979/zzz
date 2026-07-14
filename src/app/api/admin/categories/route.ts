import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { ensureSeedData } from "@/lib/data";

export const dynamic = "force-dynamic";

async function authorize() {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function GET() {
  const unauthorizedResponse = await authorize();
  if (unauthorizedResponse) return unauthorizedResponse;

  await ensureSeedData();

  const rows = await db
    .select({
      id: categories.id,
      nameFa: categories.nameFa,
      nameEn: categories.nameEn,
      sortOrder: categories.sortOrder,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.id));

  return Response.json(rows);
}

export async function POST(request: Request) {
  const unauthorizedResponse = await authorize();
  if (unauthorizedResponse) return unauthorizedResponse;

  await ensureSeedData();

  try {
    const body = (await request.json()) as { nameFa?: string; nameEn?: string };
    const nameFa = body.nameFa?.trim();
    const nameEn = body.nameEn?.trim();

    if (!nameFa || !nameEn) {
      return Response.json({ error: "نام فارسی و انگلیسی لازم است." }, { status: 400 });
    }

    const [lastCategory] = await db
      .select({ sortOrder: categories.sortOrder })
      .from(categories)
      .orderBy(desc(categories.sortOrder), desc(categories.id))
      .limit(1);

    const [created] = await db
      .insert(categories)
      .values({
        nameFa,
        nameEn,
        sortOrder: (lastCategory?.sortOrder ?? 0) + 1,
        updatedAt: new Date(),
      })
      .returning({ id: categories.id });

    return Response.json({ ok: true, id: created.id });
  } catch {
    return Response.json({ error: "ایجاد دسته‌بندی ناموفق بود." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const unauthorizedResponse = await authorize();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const body = (await request.json()) as { id?: number; nameFa?: string; nameEn?: string };
    const id = Number(body.id);
    const nameFa = body.nameFa?.trim();
    const nameEn = body.nameEn?.trim();

    if (!id || !nameFa || !nameEn) {
      return Response.json({ error: "اطلاعات دسته‌بندی ناقص است." }, { status: 400 });
    }

    await db
      .update(categories)
      .set({
        nameFa,
        nameEn,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "ویرایش دسته‌بندی ناموفق بود." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const unauthorizedResponse = await authorize();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const body = (await request.json()) as { id?: number; direction?: "up" | "down" };
    const id = Number(body.id);
    const direction = body.direction;

    if (!id || (direction !== "up" && direction !== "down")) {
      return Response.json({ error: "درخواست جابجایی نامعتبر است." }, { status: 400 });
    }

    const rows = await db
      .select({ id: categories.id, sortOrder: categories.sortOrder })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.id));

    const currentIndex = rows.findIndex((row) => row.id === id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= rows.length) {
      return Response.json({ ok: true });
    }

    const current = rows[currentIndex];
    const target = rows[targetIndex];

    await db.update(categories).set({ sortOrder: target.sortOrder, updatedAt: new Date() }).where(eq(categories.id, current.id));
    await db.update(categories).set({ sortOrder: current.sortOrder, updatedAt: new Date() }).where(eq(categories.id, target.id));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "جابجایی دسته‌بندی ناموفق بود." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const unauthorizedResponse = await authorize();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const body = (await request.json()) as { id?: number };
    const id = Number(body.id);

    if (!id) {
      return Response.json({ error: "شناسه دسته‌بندی نامعتبر است." }, { status: 400 });
    }

    await db.delete(categories).where(eq(categories.id, id));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "حذف دسته‌بندی ناموفق بود." }, { status: 500 });
  }
}
