import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAdminSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN در Environment Variables تنظیم نشده است." }, { status: 500 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/heic", "image/heif"],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ adminId: session.adminId }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Admin menu image uploaded", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Admin client image upload failed", error);
    const message = error instanceof Error ? error.message : "آپلود تصویر ناموفق بود.";
    return NextResponse.json({ error: `آپلود تصویر ناموفق بود: ${message}` }, { status: 400 });
  }
}
