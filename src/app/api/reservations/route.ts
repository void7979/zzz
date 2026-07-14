import { db } from "@/db";
import { reservations } from "@/db/schema";
import { ensureSeedData } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeedData();

  try {
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      date?: string;
      time?: string;
      guests?: number;
    };

    const name = body.name?.trim();
    const phone = body.phone?.trim();
    const date = body.date?.trim();
    const time = body.time?.trim();
    const guests = Number(body.guests ?? 0);

    if (!name || !phone || !date || !time || !Number.isFinite(guests) || guests < 1) {
      return Response.json({ error: "اطلاعات رزرو کامل نیست." }, { status: 400 });
    }

    const [createdReservation] = await db
      .insert(reservations)
      .values({
        name,
        phone,
        date,
        time,
        guests,
        status: "pending",
        notes: "",
        updatedAt: new Date(),
      })
      .returning({ id: reservations.id });

    return Response.json({ ok: true, reservationId: createdReservation.id });
  } catch {
    return Response.json({ error: "ثبت رزرو ناموفق بود." }, { status: 500 });
  }
}
