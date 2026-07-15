import { getAdminSession } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/uploaded-images";

export const dynamic = "force-dynamic";

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

    const id = await saveUploadedImage(file);

    return Response.json({ ok: true, url: `/api/images/${id}` });
  } catch {
    return Response.json({ error: "آپلود تصویر ناموفق بود." }, { status: 500 });
  }
}
