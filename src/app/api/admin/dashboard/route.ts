import { getAdminSession } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getAdminDashboardData();
  return Response.json(data);
}
