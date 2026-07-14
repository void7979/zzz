import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { ensureSeedData } from "@/lib/data";
import { isReservationStatus } from "@/lib/reservations";

export const dynamic = "force-dynamic";

async function authorize() {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function PATCH(request: Request) {
  const unauthorizedResponse = await authorize();
  if (unauthorizedResponse) return unauthorizedResponse;

  await ensureSeedData();

  try {
    const body = (await request.json()) as {
      id?: number;
      status?: string;
      notes?: string;
    };

    const id = Number(body.id);
    const status = body.status?.trim() ?? "";
    const notes = body.notes?.trim() ?? "";

    if (!id || !isReservationStatus(status)) {
      return Response.json({ error: "اطلاعات رزرو نامعتبر است." }, { status: 400 });
    }

    await db
      .update(reservations)
      .set({
        status,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, id));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "به‌روزرسانی رزرو ناموفق بود." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const unauthorizedResponse = await authorize();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const body = (await request.json()) as { id?: number };
    const id = Number(body.id);

    if (!id) {
      return Response.json({ error: "شناسه رزرو نامعتبر است." }, { status: 400 });
    }

    await db.delete(reservations).where(eq(reservations.id, id));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "حذف رزرو ناموفق بود." }, { status: 500 });
  }
}
