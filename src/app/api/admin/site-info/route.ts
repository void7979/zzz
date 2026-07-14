import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteInfo } from "@/db/schema";
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

  const [row] = await db
    .select({
      id: siteInfo.id,
      hoursFa: siteInfo.hoursFa,
      hoursEn: siteInfo.hoursEn,
      phonePrimary: siteInfo.phonePrimary,
      phoneSecondary: siteInfo.phoneSecondary,
      addressFa: siteInfo.addressFa,
      addressEn: siteInfo.addressEn,
      instagramUrl: siteInfo.instagramUrl,
      instagramHandle: siteInfo.instagramHandle,
      mapsUrl: siteInfo.mapsUrl,
      taglineFa: siteInfo.taglineFa,
      taglineEn: siteInfo.taglineEn,
    })
    .from(siteInfo)
    .limit(1);

  return Response.json(row);
}

export async function PATCH(request: Request) {
  const unauthorizedResponse = await authorize();
  if (unauthorizedResponse) return unauthorizedResponse;

  await ensureSeedData();

  try {
    const body = (await request.json()) as {
      id?: number;
      hoursFa?: string;
      hoursEn?: string;
      phonePrimary?: string;
      phoneSecondary?: string;
      addressFa?: string;
      addressEn?: string;
      instagramUrl?: string;
      instagramHandle?: string;
      mapsUrl?: string;
      taglineFa?: string;
      taglineEn?: string;
    };

    const [current] = await db.select({ id: siteInfo.id }).from(siteInfo).limit(1);

    if (!current) {
      return Response.json({ error: "اطلاعات سایت یافت نشد." }, { status: 404 });
    }

    await db
      .update(siteInfo)
      .set({
        hoursFa: body.hoursFa?.trim() || "",
        hoursEn: body.hoursEn?.trim() || "",
        phonePrimary: body.phonePrimary?.trim() || "",
        phoneSecondary: body.phoneSecondary?.trim() || "",
        addressFa: body.addressFa?.trim() || "",
        addressEn: body.addressEn?.trim() || "",
        instagramUrl: body.instagramUrl?.trim() || "",
        instagramHandle: body.instagramHandle?.trim() || "",
        mapsUrl: body.mapsUrl?.trim() || "",
        taglineFa: body.taglineFa?.trim() || "",
        taglineEn: body.taglineEn?.trim() || "",
        updatedAt: new Date(),
      })
      .where(eq(siteInfo.id, current.id));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "ذخیره اطلاعات سایت ناموفق بود." }, { status: 500 });
  }
}
