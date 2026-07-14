import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { setAdminSession, verifyPassword } from "@/lib/auth";
import { ensureSeedData } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeedData();

  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = body.username?.trim();
    const password = body.password?.trim();

    if (!username || !password) {
      return Response.json({ error: "نام کاربری و رمز عبور الزامی است." }, { status: 400 });
    }

    const [admin] = await db
      .select({
        id: admins.id,
        username: admins.username,
        passwordHash: admins.passwordHash,
      })
      .from(admins)
      .where(eq(admins.username, username))
      .limit(1);

    if (!admin) {
      return Response.json({ error: "اطلاعات ورود نادرست است." }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, admin.passwordHash);

    if (!isPasswordValid) {
      return Response.json({ error: "اطلاعات ورود نادرست است." }, { status: 401 });
    }

    await setAdminSession({ id: admin.id, username: admin.username });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "ورود ناموفق بود." }, { status: 500 });
  }
}
