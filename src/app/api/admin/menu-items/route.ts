import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
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
      id: menuItems.id,
      categoryId: menuItems.categoryId,
      nameFa: menuItems.nameFa,
      nameEn: menuItems.nameEn,
      descriptionFa: menuItems.descriptionFa,
      descriptionEn: menuItems.descriptionEn,
      price: menuItems.price,
      imageUrl: menuItems.imageUrl,
      isAvailable: menuItems.isAvailable,
      sortOrder: menuItems.sortOrder,
    })
    .from(menuItems)
    .orderBy(asc(menuItems.categoryId), asc(menuItems.sortOrder), asc(menuItems.id));

  return Response.json(rows);
}

export async function POST(request: Request) {
  const unauthorizedResponse = await authorize();
  if (unauthorizedResponse) return unauthorizedResponse;

  await ensureSeedData();

  try {
    const body = (await request.json()) as {
      categoryId?: number;
      nameFa?: string;
      nameEn?: string;
      descriptionFa?: string;
      descriptionEn?: string;
      price?: number;
      imageUrl?: string;
      isAvailable?: boolean;
    };

    const categoryId = Number(body.categoryId);
    const price = Number(body.price);
    const nameFa = body.nameFa?.trim();
    const nameEn = body.nameEn?.trim();
    const descriptionFa = body.descriptionFa?.trim();
    const descriptionEn = body.descriptionEn?.trim();
    const imageUrl = body.imageUrl?.trim();

    if (!categoryId || !nameFa || !nameEn || !descriptionFa || !descriptionEn || !imageUrl || !Number.isFinite(price) || price < 0) {
      return Response.json({ error: "اطلاعات آیتم کامل نیست." }, { status: 400 });
    }

    const [lastItemInCategory] = await db
      .select({ sortOrder: menuItems.sortOrder })
      .from(menuItems)
      .where(eq(menuItems.categoryId, categoryId))
      .orderBy(desc(menuItems.sortOrder), desc(menuItems.id))
      .limit(1);

    const [created] = await db
      .insert(menuItems)
      .values({
        categoryId,
        nameFa,
        nameEn,
        descriptionFa,
        descriptionEn,
        price,
        imageUrl,
        isAvailable: body.isAvailable ?? true,
        sortOrder: (lastItemInCategory?.sortOrder ?? 0) + 1,
        updatedAt: new Date(),
      })
      .returning({ id: menuItems.id });

    return Response.json({ ok: true, id: created.id });
  } catch {
    return Response.json({ error: "ایجاد آیتم منو ناموفق بود." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const unauthorizedResponse = await authorize();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const body = (await request.json()) as {
      id?: number;
      categoryId?: number;
      nameFa?: string;
      nameEn?: string;
      descriptionFa?: string;
      descriptionEn?: string;
      price?: number;
      imageUrl?: string;
      isAvailable?: boolean;
    };

    const id = Number(body.id);
    const categoryId = Number(body.categoryId);
    const price = Number(body.price);
    const nameFa = body.nameFa?.trim();
    const nameEn = body.nameEn?.trim();
    const descriptionFa = body.descriptionFa?.trim();
    const descriptionEn = body.descriptionEn?.trim();
    const imageUrl = body.imageUrl?.trim();

    if (!id || !categoryId || !nameFa || !nameEn || !descriptionFa || !descriptionEn || !imageUrl || !Number.isFinite(price) || price < 0) {
      return Response.json({ error: "اطلاعات آیتم کامل نیست." }, { status: 400 });
    }

    await db
      .update(menuItems)
      .set({
        categoryId,
        nameFa,
        nameEn,
        descriptionFa,
        descriptionEn,
        price,
        imageUrl,
        isAvailable: body.isAvailable ?? true,
        updatedAt: new Date(),
      })
      .where(eq(menuItems.id, id));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "ویرایش آیتم منو ناموفق بود." }, { status: 500 });
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

    const [currentItem] = await db
      .select({
        id: menuItems.id,
        categoryId: menuItems.categoryId,
        sortOrder: menuItems.sortOrder,
      })
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1);

    if (!currentItem) {
      return Response.json({ error: "آیتم یافت نشد." }, { status: 404 });
    }

    const rows = await db
      .select({
        id: menuItems.id,
        sortOrder: menuItems.sortOrder,
      })
      .from(menuItems)
      .where(eq(menuItems.categoryId, currentItem.categoryId))
      .orderBy(asc(menuItems.sortOrder), asc(menuItems.id));

    const currentIndex = rows.findIndex((row) => row.id === id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= rows.length) {
      return Response.json({ ok: true });
    }

    const current = rows[currentIndex];
    const target = rows[targetIndex];

    await db.update(menuItems).set({ sortOrder: target.sortOrder, updatedAt: new Date() }).where(eq(menuItems.id, current.id));
    await db.update(menuItems).set({ sortOrder: current.sortOrder, updatedAt: new Date() }).where(eq(menuItems.id, target.id));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "جابجایی آیتم ناموفق بود." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const unauthorizedResponse = await authorize();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const body = (await request.json()) as { id?: number };
    const id = Number(body.id);

    if (!id) {
      return Response.json({ error: "شناسه آیتم نامعتبر است." }, { status: 400 });
    }

    await db.delete(menuItems).where(eq(menuItems.id, id));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "حذف آیتم ناموفق بود." }, { status: 500 });
  }
}
