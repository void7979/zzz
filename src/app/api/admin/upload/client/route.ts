import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "BLOB_READ_WRITE_TOKEN در Environment Variables تنظیم نشده است." }, { status: 500 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/heic", "image/heif"],
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ adminId: session.adminId }),
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("Admin menu image uploaded", blob.url);
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    console.error("Admin client image upload failed", error);
    const message = error instanceof Error ? error.message : "آپلود تصویر ناموفق بود.";
    return Response.json({ error: `آپلود تصویر ناموفق بود: ${message}` }, { status: 400 });
  }
}
