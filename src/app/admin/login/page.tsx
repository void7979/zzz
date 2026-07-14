import Image from "next/image";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { brandAssets } from "@/lib/brand";
import { defaultAdminCredentials } from "@/lib/data";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="surface-panel w-full max-w-md rounded-[2rem] p-8 sm:p-10">
        <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-[#c7a94e44] bg-black">
          <Image src={brandAssets.logo} alt="RUPIYA Café logo" fill sizes="80px" className="object-cover" />
        </div>
        <p className="mt-5 text-center text-sm tracking-[0.24em] text-[#8aa16a]">RUPIYA ADMIN</p>
        <h1 className="mt-4 text-center font-display text-4xl text-[#f0dfbf]">ورود مدیر</h1>
        <p className="mt-3 text-center text-sm leading-7 text-[#bca98a]">
          برای مدیریت دسته‌بندی‌ها، آیتم‌های منو، رزروها و اطلاعات سایت وارد شوید.
        </p>
        <div className="mt-4 rounded-2xl border border-[#c7a94e22] bg-[#120f0f] p-4 text-xs leading-7 text-[#d4c19f]">
          <p>نام کاربری پیش‌فرض: {defaultAdminCredentials.username}</p>
          <p>رمز عبور پیش‌فرض: {defaultAdminCredentials.password}</p>
        </div>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
