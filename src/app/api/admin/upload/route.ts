import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getSafeFileName(fileName: string) {
  const cleanName = fileName.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleanName || "image";
}

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "فایلی ارسال نشده است." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "فقط فایل تصویری مجاز است." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "حجم تصویر باید کمتر از ۵ مگابایت باشد." }, { status: 400 });
    }

    const blob = await put(`menu/${Date.now()}-${randomUUID()}-${getSafeFileName(file.name)}`, file, {
      access: "public",
    });

    return Response.json({ ok: true, url: blob.url });
  } catch {
    return Response.json({ error: "آپلود تصویر ناموفق بود." }, { status: 500 });
  }
}
