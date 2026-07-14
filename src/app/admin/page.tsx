import { AdminDashboard } from "@/components/admin-dashboard";
import { getAdminDashboardData } from "@/lib/data";
import { requireAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireAdminSession();
  const initialData = await getAdminDashboardData();

  return <AdminDashboard initialData={initialData} session={session} />;
}
