import { randomUUID } from "crypto";
import { mkdir, writeFile, access } from "fs/promises";
import { join } from "path";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getExtension(fileName: string, mimeType: string) {
  const fileExtension = fileName.split(".").pop()?.toLowerCase();

  if (fileExtension) {
    return fileExtension;
  }

  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

async function isWritableDir(dir: string): Promise<boolean> {
  try {
    await access(dir);
    return true;
  } catch {
    try {
      await mkdir(dir, { recursive: true });
      return true;
    } catch {
      return false;
    }
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isProduction = process.env.NODE_ENV === "production";
  const uploadsDirectory = join(process.cwd(), "public", "uploads");
  const uploadsWritable = !isProduction || (await isWritableDir(uploadsDirectory));

  if (!uploadsWritable) {
    return Response.json(
      {
        error:
          "آپلود مستقیم فایل در این محیط در دسترس نیست. لطفاً از آدرس URL تصویر استفاده کنید. می‌توانید تصویر را در یک سرویس میزبانی تصویر (مانند Cloudinary یا Imgur) آپلود کرده و آدرس آن را اینجا قرار دهید.",
        fallback: "use-url",
      },
      { status: 501 },
    );
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${randomUUID()}.${getExtension(file.name, file.type)}`;

    await writeFile(join(uploadsDirectory, fileName), buffer);

    return Response.json({ ok: true, url: `/uploads/${fileName}` });
  } catch {
    return Response.json({ error: "آپلود تصویر ناموفق بود." }, { status: 500 });
  }
}
