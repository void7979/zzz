import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { getAdminSession, hashPassword, setAdminSession, verifyPassword } from "@/lib/auth";
import { ensureSeedData } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureSeedData();

  try {
    const body = (await request.json()) as {
      username?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const username = body.username?.trim();
    const currentPassword = body.currentPassword?.trim();
    const newPassword = body.newPassword?.trim();

    const [currentAdmin] = await db
      .select({
        id: admins.id,
        username: admins.username,
        passwordHash: admins.passwordHash,
      })
      .from(admins)
      .where(eq(admins.id, session.adminId))
      .limit(1);

    if (!currentAdmin) {
      return Response.json({ error: "مدیر یافت نشد." }, { status: 404 });
    }

    if (!username && !newPassword) {
      return Response.json({ error: "هیچ تغییری برای ذخیره ارسال نشده است." }, { status: 400 });
    }

    const updates: Partial<typeof admins.$inferInsert> = {
      updatedAt: new Date(),
    };

    const nextUsername = username || currentAdmin.username;

    if (username) {
      if (username.length < 3) {
        return Response.json({ error: "نام کاربری باید حداقل ۳ کاراکتر باشد." }, { status: 400 });
      }

      const [duplicateAdmin] = await db
        .select({ id: admins.id })
        .from(admins)
        .where(and(eq(admins.username, username), ne(admins.id, currentAdmin.id)))
        .limit(1);

      if (duplicateAdmin) {
        return Response.json({ error: "این نام کاربری قبلاً استفاده شده است." }, { status: 409 });
      }

      updates.username = username;
    }

    if (newPassword) {
      if (!currentPassword) {
        return Response.json({ error: "برای تغییر رمز، رمز فعلی الزامی است." }, { status: 400 });
      }

      const isPasswordValid = await verifyPassword(currentPassword, currentAdmin.passwordHash);

      if (!isPasswordValid) {
        return Response.json({ error: "رمز فعلی صحیح نیست." }, { status: 401 });
      }

      if (newPassword.length < 8) {
        return Response.json({ error: "رمز جدید باید حداقل ۸ کاراکتر باشد." }, { status: 400 });
      }

      updates.passwordHash = await hashPassword(newPassword);
    }

    await db.update(admins).set(updates).where(eq(admins.id, currentAdmin.id));
    await setAdminSession({ id: currentAdmin.id, username: nextUsername });

    return Response.json({ ok: true, username: nextUsername });
  } catch {
    return Response.json({ error: "به‌روزرسانی حساب ناموفق بود." }, { status: 500 });
  }
}
