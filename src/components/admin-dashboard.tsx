"use client";

import Image from "next/image";
import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Clock3,
  Database,
  ImagePlus,
  KeyRound,
  LogOut,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Shield,
  Trash2,
  UserRound,
} from "lucide-react";
import type { AdminDashboardData, ReservationRecord } from "@/lib/data";
import { brandAssets } from "@/lib/brand";
import {
  reservationStatusColors,
  reservationStatusLabelsFa,
  reservationStatuses,
  type ReservationStatus,
} from "@/lib/reservations";

type Props = {
  initialData: AdminDashboardData;
  session: {
    adminId: number;
    username: string;
    exp: number;
  };
};

type CategoryForm = {
  id: number | null;
  nameFa: string;
  nameEn: string;
};

type ItemForm = {
  id: number | null;
  categoryId: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  price: string;
  imageUrl: string;
  isAvailable: boolean;
};

type AccountForm = {
  username: string;
  currentPassword: string;
  newPassword: string;
};

type ReservationDrafts = Record<number, { status: ReservationStatus; notes: string }>;

const tabs = [
  { key: "overview", label: "نمای کلی" },
  { key: "site", label: "اطلاعات سایت" },
  { key: "categories", label: "دسته‌بندی‌ها" },
  { key: "items", label: "آیتم‌های منو" },
  { key: "reservations", label: "رزروها" },
  { key: "security", label: "امنیت حساب" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

function createEmptyCategoryForm(): CategoryForm {
  return {
    id: null,
    nameFa: "",
    nameEn: "",
  };
}

function createEmptyItemForm(categories: AdminDashboardData["categories"]): ItemForm {
  return {
    id: null,
    categoryId: categories[0] ? String(categories[0].id) : "",
    nameFa: "",
    nameEn: "",
    descriptionFa: "",
    descriptionEn: "",
    price: "",
    imageUrl: "",
    isAvailable: true,
  };
}

function createReservationDrafts(reservations: ReservationRecord[]): ReservationDrafts {
  return Object.fromEntries(
    reservations.map((reservation) => [reservation.id, { status: reservation.status, notes: reservation.notes }]),
  );
}

async function getErrorMessage(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error || fallbackMessage;
}

function StatCard({ title, value, description }: { title: string; value: string | number; description: string }) {
  return (
    <div className="surface-subtle rounded-[1.5rem] p-5">
      <p className="text-xs tracking-[0.22em] text-[#8aa16a]">{title}</p>
      <p className="mt-3 font-display text-3xl text-[#ead8b7]">{value}</p>
      <p className="mt-2 text-sm text-[#bca98a]">{description}</p>
    </div>
  );
}

export function AdminDashboard({ initialData, session }: Props) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [siteForm, setSiteForm] = useState(initialData.siteInfo);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(createEmptyCategoryForm());
  const [itemForm, setItemForm] = useState<ItemForm>(createEmptyItemForm(initialData.categories));
  const [accountForm, setAccountForm] = useState<AccountForm>({
    username: session.username,
    currentPassword: "",
    newPassword: "",
  });
  const [reservationDrafts, setReservationDrafts] = useState<ReservationDrafts>(
    createReservationDrafts(initialData.reservations),
  );
  const [currentUsername, setCurrentUsername] = useState(session.username);
  const [feedback, setFeedback] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [itemAvailabilityFilter, setItemAvailabilityFilter] = useState<"all" | "available" | "hidden">("all");
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>("all");
  const [reservationSearch, setReservationSearch] = useState("");
  const [reservationStatusFilter, setReservationStatusFilter] = useState<"all" | ReservationStatus>("all");

  const todayIso = new Date().toISOString().slice(0, 10);
  const reservationsCount = data.reservations.length;
  const pendingReservationsCount = data.reservations.filter((reservation) => reservation.status === "pending").length;
  const confirmedReservationsCount = data.reservations.filter((reservation) => reservation.status === "confirmed").length;
  const todaysReservationsCount = data.reservations.filter((reservation) => reservation.date === todayIso).length;
  const availableItemsCount = useMemo(() => data.items.filter((item) => item.isAvailable).length, [data.items]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = itemSearch.trim().toLowerCase();

    return data.items.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.nameFa.toLowerCase().includes(normalizedSearch) ||
        item.nameEn.toLowerCase().includes(normalizedSearch) ||
        item.descriptionFa.toLowerCase().includes(normalizedSearch) ||
        item.descriptionEn.toLowerCase().includes(normalizedSearch);

      const matchesAvailability =
        itemAvailabilityFilter === "all" ||
        (itemAvailabilityFilter === "available" ? item.isAvailable : !item.isAvailable);

      const matchesCategory = itemCategoryFilter === "all" || String(item.categoryId) === itemCategoryFilter;

      return matchesSearch && matchesAvailability && matchesCategory;
    });
  }, [data.items, itemAvailabilityFilter, itemCategoryFilter, itemSearch]);

  const filteredReservations = useMemo(() => {
    const normalizedSearch = reservationSearch.trim().toLowerCase();

    return data.reservations.filter((reservation) => {
      const matchesSearch =
        !normalizedSearch ||
        reservation.name.toLowerCase().includes(normalizedSearch) ||
        reservation.phone.toLowerCase().includes(normalizedSearch) ||
        reservation.date.toLowerCase().includes(normalizedSearch) ||
        reservation.time.toLowerCase().includes(normalizedSearch);

      const matchesStatus = reservationStatusFilter === "all" || reservation.status === reservationStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data.reservations, reservationSearch, reservationStatusFilter]);

  async function refreshDashboard(message?: string) {
    const response = await fetch("/api/admin/dashboard", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "دریافت داده‌های داشبورد ناموفق بود."));
    }

    const nextData = (await response.json()) as AdminDashboardData;
    setData(nextData);
    setSiteForm(nextData.siteInfo);
    setReservationDrafts(createReservationDrafts(nextData.reservations));
    setItemForm((current) => {
      if (current.id) {
        const updatedItem = nextData.items.find((item) => item.id === current.id);

        if (updatedItem) {
          return {
            id: updatedItem.id,
            categoryId: String(updatedItem.categoryId),
            nameFa: updatedItem.nameFa,
            nameEn: updatedItem.nameEn,
            descriptionFa: updatedItem.descriptionFa,
            descriptionEn: updatedItem.descriptionEn,
            price: String(updatedItem.price),
            imageUrl: updatedItem.imageUrl,
            isAvailable: updatedItem.isAvailable,
          };
        }
      }

      return createEmptyItemForm(nextData.categories);
    });

    if (message) {
      setFeedback(message);
    }
  }

  async function handleLogout() {
    setIsBusy(true);

    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setIsBusy(false);
    }
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setFeedback("");

    try {
      const method = categoryForm.id ? "PATCH" : "POST";
      const response = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "ذخیره دسته‌بندی انجام نشد."));
      }

      setCategoryForm(createEmptyCategoryForm());
      await refreshDashboard("دسته‌بندی با موفقیت ذخیره شد.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "ذخیره دسته‌بندی انجام نشد.");
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteCategory(id: number) {
    if (!window.confirm("با حذف این دسته‌بندی، آیتم‌های وابسته نیز حذف می‌شوند. ادامه می‌دهید؟")) {
      return;
    }

    setIsBusy(true);
    setFeedback("");

    try {
      const response = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "حذف دسته‌بندی ناموفق بود."));
      }

      if (categoryForm.id === id) {
        setCategoryForm(createEmptyCategoryForm());
      }

      await refreshDashboard("دسته‌بندی حذف شد.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "حذف دسته‌بندی ناموفق بود.");
    } finally {
      setIsBusy(false);
    }
  }

  async function moveCategory(id: number, direction: "up" | "down") {
    setIsBusy(true);
    setFeedback("");

    try {
      const response = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, direction }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "جابجایی دسته‌بندی ناموفق بود."));
      }

      await refreshDashboard("ترتیب دسته‌بندی‌ها به‌روز شد.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "جابجایی دسته‌بندی ناموفق بود.");
    } finally {
      setIsBusy(false);
    }
  }

  async function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setFeedback("");

    try {
      const method = itemForm.id ? "PATCH" : "POST";
      const response = await fetch("/api/admin/menu-items", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...itemForm,
          categoryId: Number(itemForm.categoryId),
          price: Number(itemForm.price),
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "ذخیره آیتم منو انجام نشد."));
      }

      setItemForm(createEmptyItemForm(data.categories));
      await refreshDashboard("آیتم منو با موفقیت ذخیره شد.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "ذخیره آیتم منو انجام نشد.");
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteItem(id: number) {
    if (!window.confirm("این آیتم از منو حذف شود؟")) {
      return;
    }

    setIsBusy(true);
    setFeedback("");

    try {
      const response = await fetch("/api/admin/menu-items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "حذف آیتم ناموفق بود."));
      }

      if (itemForm.id === id) {
        setItemForm(createEmptyItemForm(data.categories));
      }

      await refreshDashboard("آیتم منو حذف شد.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "حذف آیتم ناموفق بود.");
    } finally {
      setIsBusy(false);
    }
  }

  async function moveItem(id: number, direction: "up" | "down") {
    setIsBusy(true);
    setFeedback("");

    try {
      const response = await fetch("/api/admin/menu-items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, direction }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "جابجایی آیتم ناموفق بود."));
      }

      await refreshDashboard("ترتیب آیتم‌های منو به‌روز شد.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "جابجایی آیتم ناموفق بود.");
    } finally {
      setIsBusy(false);
    }
  }

  async function uploadImage(file: File): Promise<boolean> {
    setIsUploading(true);
    setFeedback("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "آپلود تصویر ناموفق بود."));
      }

      const payload = (await response.json()) as { url: string };

      if (!payload.url) {
        throw new Error("آدرس تصویر از سرور دریافت نشد.");
      }

      setItemForm((current) => ({ ...current, imageUrl: payload.url }));
      setFeedback("تصویر با موفقیت آپلود شد.");
      return true;
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "آپلود تصویر ناموفق بود.");
      return false;
    } finally {
      setIsUploading(false);
    }
  }

  async function saveSiteInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setFeedback("");

    try {
      const response = await fetch("/api/admin/site-info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteForm),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "ذخیره اطلاعات سایت ناموفق بود."));
      }

      await refreshDashboard("اطلاعات سایت ذخیره شد.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "ذخیره اطلاعات سایت ناموفق بود.");
    } finally {
      setIsBusy(false);
    }
  }

  async function saveReservation(id: number) {
    const draft = reservationDrafts[id];
    if (!draft) return;

    setIsBusy(true);
    setFeedback("");

    try {
      const response = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: draft.status,
          notes: draft.notes,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "به‌روزرسانی رزرو ناموفق بود."));
      }

      await refreshDashboard("رزرو با موفقیت به‌روزرسانی شد.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "به‌روزرسانی رزرو ناموفق بود.");
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteReservation(id: number) {
    if (!window.confirm("این رزرو حذف شود؟")) {
      return;
    }

    setIsBusy(true);
    setFeedback("");

    try {
      const response = await fetch("/api/admin/reservations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "حذف رزرو ناموفق بود."));
      }

      await refreshDashboard("رزرو حذف شد.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "حذف رزرو ناموفق بود.");
    } finally {
      setIsBusy(false);
    }
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setFeedback("");

    try {
      const response = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "به‌روزرسانی حساب ناموفق بود."));
      }

      const payload = (await response.json()) as { username: string };
      setCurrentUsername(payload.username);
      setAccountForm({ username: payload.username, currentPassword: "", newPassword: "" });
      router.refresh();
      setFeedback("اطلاعات حساب با موفقیت ذخیره شد.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "به‌روزرسانی حساب ناموفق بود.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="container-shell py-8 pb-14">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[#c7a94e44] bg-black">
              <Image src={brandAssets.logo} alt="RUPIYA Café logo" fill sizes="64px" className="object-cover" />
            </div>
            <div>
              <p className="text-sm tracking-[0.22em] text-[#8aa16a]">RUPIYA ADMIN PANEL</p>
              <h1 className="mt-3 font-display text-4xl text-[#f0dfbf]">داشبورد مدیریت</h1>
              <p className="mt-3 text-sm leading-7 text-[#bca98a]">
                خوش آمدید، {currentUsername}. این پنل با دیتابیس {data.databaseProvider} کار می‌کند و برای مدیریت کامل منو، رزرو و تنظیمات آماده است.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c7a94e33] bg-[#171110] px-4 py-3 text-sm text-[#d7c39f]">
              <Database className="h-4 w-4 text-[#8aa16a]" />
              <span>{data.databaseProvider}</span>
            </div>
            <button
              type="button"
              onClick={() => refreshDashboard("اطلاعات داشبورد تازه‌سازی شد.")}
              className="luxury-outline inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm"
            >
              <RefreshCcw className="h-4 w-4" />
              تازه‌سازی
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isBusy}
              className="rounded-full border border-[#8f1f2466] bg-[#2a1414] px-5 py-3 text-sm text-[#efcfbf] hover:border-[#b0323899]"
            >
              <span className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                خروج
              </span>
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="CATEGORIES" value={data.categories.length} description="دسته‌بندی‌های منو" />
          <StatCard title="VISIBLE ITEMS" value={availableItemsCount} description="آیتم‌های قابل نمایش" />
          <StatCard title="ALL RESERVATIONS" value={reservationsCount} description="کل درخواست‌های رزرو" />
          <StatCard title="PENDING" value={pendingReservationsCount} description="رزروهای در انتظار" />
          <StatCard title="TODAY" value={todaysReservationsCount} description="رزروهای امروز" />
        </div>
      </section>

      <section className="mt-6">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-5 py-3 text-sm ${
                activeTab === tab.key
                  ? "bg-[#89a86a] text-[#140f0f] shadow-[0_10px_24px_rgba(137,168,106,0.26)]"
                  : "border border-[#8aa16a44] bg-[#181313] text-[#d2c0a1]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {feedback ? <p className="mt-4 text-sm text-[#d8c6a8]">{feedback}</p> : null}
      </section>

      {activeTab === "overview" ? (
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-[#8aa16a]" />
              <h2 className="font-display text-3xl text-[#f0dfbf]">خلاصه وضعیت رزروها</h2>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard title="PENDING" value={pendingReservationsCount} description="نیازمند پیگیری" />
              <StatCard title="CONFIRMED" value={confirmedReservationsCount} description="تأییدشده" />
              <StatCard title="TODAY" value={todaysReservationsCount} description="رزرو برای امروز" />
            </div>
            <div className="mt-6 space-y-4">
              {data.reservations.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="rounded-[1.5rem] border border-[#c7a94e22] bg-[#110f0f] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-display text-2xl text-[#ead8b7]">{reservation.name}</p>
                      <p className="mt-1 text-sm text-[#bca98a]">
                        {reservation.date} | {reservation.time} | {reservation.phone}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs ${reservationStatusColors[reservation.status]}`}>
                      {reservationStatusLabelsFa[reservation.status]}
                    </span>
                  </div>
                </div>
              ))}
              {data.reservations.length === 0 ? <p className="text-sm text-[#bca98a]">رزروی ثبت نشده است.</p> : null}
            </div>
          </div>

          <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-[#8aa16a]" />
              <h2 className="font-display text-3xl text-[#f0dfbf]">اقدام‌های سریع</h2>
            </div>
            <div className="mt-6 grid gap-4">
              <button type="button" onClick={() => setActiveTab("items")} className="luxury-outline flex items-center justify-between rounded-[1.4rem] px-5 py-4 text-sm">
                <span>افزودن یا ویرایش آیتم منو</span>
                <Plus className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setActiveTab("reservations")} className="luxury-outline flex items-center justify-between rounded-[1.4rem] px-5 py-4 text-sm">
                <span>پیگیری رزروهای در انتظار</span>
                <Clock3 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setActiveTab("site")} className="luxury-outline flex items-center justify-between rounded-[1.4rem] px-5 py-4 text-sm">
                <span>به‌روزرسانی اطلاعات تماس سایت</span>
                <Save className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setActiveTab("security")} className="luxury-outline flex items-center justify-between rounded-[1.4rem] px-5 py-4 text-sm">
                <span>تغییر نام کاربری یا رمز عبور</span>
                <Shield className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "site" ? (
        <section className="surface-panel mt-6 rounded-[2rem] p-6 sm:p-8">
          <h2 className="font-display text-3xl text-[#f0dfbf]">ویرایش اطلاعات پایه سایت</h2>
          <form onSubmit={saveSiteInfo} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-[#d7c39f]">
              <span>ساعات کاری فارسی</span>
              <input value={siteForm.hoursFa} onChange={(event) => setSiteForm((current) => ({ ...current, hoursFa: event.target.value }))} required />
            </label>
            <label className="space-y-2 text-sm text-[#d7c39f]">
              <span>Opening hours (English)</span>
              <input value={siteForm.hoursEn} onChange={(event) => setSiteForm((current) => ({ ...current, hoursEn: event.target.value }))} required />
            </label>
            <label className="space-y-2 text-sm text-[#d7c39f]">
              <span>شماره تماس اول</span>
              <input value={siteForm.phonePrimary} onChange={(event) => setSiteForm((current) => ({ ...current, phonePrimary: event.target.value }))} required />
            </label>
            <label className="space-y-2 text-sm text-[#d7c39f]">
              <span>شماره تماس دوم</span>
              <input value={siteForm.phoneSecondary} onChange={(event) => setSiteForm((current) => ({ ...current, phoneSecondary: event.target.value }))} required />
            </label>
            <label className="space-y-2 text-sm text-[#d7c39f] md:col-span-2">
              <span>نشانی فارسی</span>
              <textarea rows={3} value={siteForm.addressFa} onChange={(event) => setSiteForm((current) => ({ ...current, addressFa: event.target.value }))} required />
            </label>
            <label className="space-y-2 text-sm text-[#d7c39f] md:col-span-2">
              <span>Address (English)</span>
              <textarea rows={3} value={siteForm.addressEn} onChange={(event) => setSiteForm((current) => ({ ...current, addressEn: event.target.value }))} required />
            </label>
            <label className="space-y-2 text-sm text-[#d7c39f]">
              <span>لینک اینستاگرام</span>
              <input value={siteForm.instagramUrl} onChange={(event) => setSiteForm((current) => ({ ...current, instagramUrl: event.target.value }))} required />
            </label>
            <label className="space-y-2 text-sm text-[#d7c39f]">
              <span>شناسه اینستاگرام</span>
              <input value={siteForm.instagramHandle} onChange={(event) => setSiteForm((current) => ({ ...current, instagramHandle: event.target.value }))} required />
            </label>
            <label className="space-y-2 text-sm text-[#d7c39f] md:col-span-2">
              <span>لینک Google Maps</span>
              <input value={siteForm.mapsUrl} onChange={(event) => setSiteForm((current) => ({ ...current, mapsUrl: event.target.value }))} required />
            </label>
            <label className="space-y-2 text-sm text-[#d7c39f] md:col-span-2">
              <span>تگ‌لاین فارسی</span>
              <textarea rows={3} value={siteForm.taglineFa} onChange={(event) => setSiteForm((current) => ({ ...current, taglineFa: event.target.value }))} required />
            </label>
            <label className="space-y-2 text-sm text-[#d7c39f] md:col-span-2">
              <span>Tagline (English)</span>
              <textarea rows={3} value={siteForm.taglineEn} onChange={(event) => setSiteForm((current) => ({ ...current, taglineEn: event.target.value }))} required />
            </label>
            <div className="md:col-span-2">
              <button type="submit" disabled={isBusy} className="luxury-button inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70">
                <Save className="h-4 w-4" />
                ذخیره اطلاعات سایت
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {activeTab === "categories" ? (
        <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={submitCategory} className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-3xl text-[#f0dfbf]">{categoryForm.id ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}</h2>
              {categoryForm.id ? (
                <button type="button" onClick={() => setCategoryForm(createEmptyCategoryForm())} className="text-sm text-[#bca98a] hover:text-[#e7d7bc]">
                  انصراف
                </button>
              ) : null}
            </div>
            <div className="mt-6 grid gap-4">
              <label className="space-y-2 text-sm text-[#d7c39f]">
                <span>نام فارسی</span>
                <input value={categoryForm.nameFa} onChange={(event) => setCategoryForm((current) => ({ ...current, nameFa: event.target.value }))} required />
              </label>
              <label className="space-y-2 text-sm text-[#d7c39f]">
                <span>نام انگلیسی</span>
                <input value={categoryForm.nameEn} onChange={(event) => setCategoryForm((current) => ({ ...current, nameEn: event.target.value }))} required />
              </label>
            </div>
            <button type="submit" disabled={isBusy} className="luxury-button mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70">
              {categoryForm.id ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {categoryForm.id ? "ذخیره تغییرات" : "افزودن دسته‌بندی"}
            </button>
          </form>

          <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <h2 className="font-display text-3xl text-[#f0dfbf]">فهرست دسته‌بندی‌ها</h2>
            <div className="mt-6 space-y-4">
              {data.categories.map((category) => (
                <div key={category.id} className="rounded-[1.5rem] border border-[#c7a94e22] bg-[#110f0f] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-display text-2xl text-[#ead8b7]">{category.nameFa}</p>
                      <p className="mt-1 text-sm uppercase tracking-[0.2em] text-[#8aa16a]">{category.nameEn}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => moveCategory(category.id, "up")} className="luxury-outline rounded-full p-3" aria-label="move up">
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => moveCategory(category.id, "down")} className="luxury-outline rounded-full p-3" aria-label="move down">
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryForm({ id: category.id, nameFa: category.nameFa, nameEn: category.nameEn })}
                        className="luxury-outline rounded-full p-3"
                        aria-label="edit category"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => deleteCategory(category.id)} className="rounded-full border border-[#8f1f2466] bg-[#281313] p-3 text-[#efcfbf]" aria-label="delete category">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {data.categories.length === 0 ? <p className="text-sm text-[#bca98a]">هنوز دسته‌بندی‌ای ثبت نشده است.</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "items" ? (
        <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={submitItem} className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-3xl text-[#f0dfbf]">{itemForm.id ? "ویرایش آیتم منو" : "افزودن آیتم جدید"}</h2>
              {itemForm.id ? (
                <button type="button" onClick={() => setItemForm(createEmptyItemForm(data.categories))} className="text-sm text-[#bca98a] hover:text-[#e7d7bc]">
                  انصراف
                </button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4">
              <label className="space-y-2 text-sm text-[#d7c39f]">
                <span>دسته‌بندی</span>
                <select value={itemForm.categoryId} onChange={(event) => setItemForm((current) => ({ ...current, categoryId: event.target.value }))} required>
                  {data.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nameFa}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-[#d7c39f]">
                <span>نام فارسی</span>
                <input value={itemForm.nameFa} onChange={(event) => setItemForm((current) => ({ ...current, nameFa: event.target.value }))} required />
              </label>
              <label className="space-y-2 text-sm text-[#d7c39f]">
                <span>نام انگلیسی</span>
                <input value={itemForm.nameEn} onChange={(event) => setItemForm((current) => ({ ...current, nameEn: event.target.value }))} required />
              </label>
              <label className="space-y-2 text-sm text-[#d7c39f]">
                <span>توضیح فارسی</span>
                <textarea rows={3} value={itemForm.descriptionFa} onChange={(event) => setItemForm((current) => ({ ...current, descriptionFa: event.target.value }))} required />
              </label>
              <label className="space-y-2 text-sm text-[#d7c39f]">
                <span>توضیح انگلیسی</span>
                <textarea rows={3} value={itemForm.descriptionEn} onChange={(event) => setItemForm((current) => ({ ...current, descriptionEn: event.target.value }))} required />
              </label>
              <label className="space-y-2 text-sm text-[#d7c39f]">
                <span>قیمت (تومان)</span>
                <input type="number" min="0" value={itemForm.price} onChange={(event) => setItemForm((current) => ({ ...current, price: event.target.value }))} required />
              </label>
              <label className="space-y-2 text-sm text-[#d7c39f]">
                <span>آدرس تصویر</span>
                <input value={itemForm.imageUrl} onChange={(event) => setItemForm((current) => ({ ...current, imageUrl: event.target.value }))} required />
              </label>
              <label className="space-y-2 text-sm text-[#d7c39f]">
                <span className="inline-flex items-center gap-2">
                  <ImagePlus className="h-4 w-4" />
                  آپلود تصویر جدید
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      const uploaded = await uploadImage(file);
                      if (uploaded) {
                        event.currentTarget.value = "";
                      }
                    }
                  }}
                />
                <span className="text-xs text-[#bca98a]">{isUploading ? "در حال آپلود..." : "پس از آپلود، آدرس تصویر به‌صورت خودکار ثبت می‌شود."}</span>
              </label>
              {itemForm.imageUrl ? (
                <div className="overflow-hidden rounded-[1.5rem] border border-[#c7a94e22] bg-[#110f0f]">
                  <img src={itemForm.imageUrl} alt={itemForm.nameFa || "preview"} className="h-52 w-full object-cover" />
                </div>
              ) : null}
              <label className="flex items-center gap-3 rounded-2xl border border-[#8aa16a33] bg-[#11100f] px-4 py-3 text-sm text-[#d7c39f]">
                <input
                  type="checkbox"
                  checked={itemForm.isAvailable}
                  onChange={(event) => setItemForm((current) => ({ ...current, isAvailable: event.target.checked }))}
                  className="h-4 w-4"
                />
                <span>این آیتم در سایت قابل نمایش باشد</span>
              </label>
            </div>

            <button type="submit" disabled={isBusy || isUploading || !data.categories.length} className="luxury-button mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70">
              {itemForm.id ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {itemForm.id ? "ذخیره تغییرات آیتم" : "افزودن آیتم"}
            </button>
          </form>

          <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-display text-3xl text-[#f0dfbf]">فهرست آیتم‌های منو</h2>
                <p className="mt-2 text-sm text-[#bca98a]">جست‌وجو، فیلتر و مدیریت کامل آیتم‌ها</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8aa16a]" />
                  <input className="pl-11" value={itemSearch} onChange={(event) => setItemSearch(event.target.value)} placeholder="جست‌وجوی آیتم" />
                </label>
                <select value={itemCategoryFilter} onChange={(event) => setItemCategoryFilter(event.target.value)}>
                  <option value="all">همه دسته‌ها</option>
                  {data.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nameFa}
                    </option>
                  ))}
                </select>
                <select value={itemAvailabilityFilter} onChange={(event) => setItemAvailabilityFilter(event.target.value as "all" | "available" | "hidden")}>
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="available">فقط قابل نمایش</option>
                  <option value="hidden">فقط مخفی</option>
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {filteredItems.map((item) => {
                const category = data.categories.find((entry) => entry.id === item.categoryId);

                return (
                  <article key={item.id} className="overflow-hidden rounded-[1.5rem] border border-[#c7a94e22] bg-[#110f0f]">
                    <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                      <img src={item.imageUrl} alt={item.nameFa} className="h-full min-h-[180px] w-full object-cover" />
                      <div className="p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-display text-2xl text-[#ead8b7]">{item.nameFa}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#8aa16a]">{item.nameEn}</p>
                            <p className="mt-3 text-sm leading-7 text-[#bca98a]">{item.descriptionFa}</p>
                          </div>
                          <div className="rounded-full border border-[#c7a94e33] bg-[#171110] px-4 py-2 text-sm text-[#ead8b7]">{item.price.toLocaleString("fa-IR")} تومان</div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#d7c39f]">
                          <span className="rounded-full border border-[#8aa16a33] px-3 py-1">{category?.nameFa}</span>
                          <span className={`rounded-full px-3 py-1 ${item.isAvailable ? "bg-[#89a86a] text-[#140f0f]" : "bg-[#351d1d] text-[#e0bf9a]"}`}>
                            {item.isAvailable ? "قابل نمایش" : "مخفی"}
                          </span>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <button type="button" onClick={() => moveItem(item.id, "up")} className="luxury-outline rounded-full p-3" aria-label="move item up">
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => moveItem(item.id, "down")} className="luxury-outline rounded-full p-3" aria-label="move item down">
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setItemForm({
                                id: item.id,
                                categoryId: String(item.categoryId),
                                nameFa: item.nameFa,
                                nameEn: item.nameEn,
                                descriptionFa: item.descriptionFa,
                                descriptionEn: item.descriptionEn,
                                price: String(item.price),
                                imageUrl: item.imageUrl,
                                isAvailable: item.isAvailable,
                              })
                            }
                            className="luxury-outline rounded-full p-3"
                            aria-label="edit item"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => deleteItem(item.id)} className="rounded-full border border-[#8f1f2466] bg-[#281313] p-3 text-[#efcfbf]" aria-label="delete item">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
              {filteredItems.length === 0 ? <p className="text-sm text-[#bca98a]">آیتمی با این فیلترها پیدا نشد.</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "reservations" ? (
        <section className="surface-panel mt-6 rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-display text-3xl text-[#f0dfbf]">درخواست‌های رزرو</h2>
              <p className="mt-2 text-sm text-[#bca98a]">مدیریت وضعیت، ثبت یادداشت و حذف رزروها</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8aa16a]" />
                <input className="pl-11" value={reservationSearch} onChange={(event) => setReservationSearch(event.target.value)} placeholder="جست‌وجوی رزرو" />
              </label>
              <select value={reservationStatusFilter} onChange={(event) => setReservationStatusFilter(event.target.value as "all" | ReservationStatus)}>
                <option value="all">همه وضعیت‌ها</option>
                {reservationStatuses.map((status) => (
                  <option key={status} value={status}>
                    {reservationStatusLabelsFa[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {filteredReservations.map((reservation) => {
              const draft = reservationDrafts[reservation.id] ?? {
                status: reservation.status,
                notes: reservation.notes,
              };

              return (
                <article key={reservation.id} className="rounded-[1.5rem] border border-[#c7a94e22] bg-[#110f0f] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-2xl text-[#ead8b7]">{reservation.name}</p>
                      <p className="mt-2 text-sm text-[#bca98a]">{reservation.phone}</p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs ${reservationStatusColors[draft.status]}`}>
                      {reservationStatusLabelsFa[draft.status]}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-[#d7c39f]">
                    <p>تاریخ: {reservation.date}</p>
                    <p>ساعت: {reservation.time}</p>
                    <p>تعداد مهمان: {reservation.guests.toLocaleString("fa-IR")}</p>
                    <p>ثبت: {reservation.createdAt ? new Date(reservation.createdAt).toLocaleString("fa-IR") : "-"}</p>
                  </div>

                  <div className="mt-4 grid gap-4">
                    <label className="space-y-2 text-sm text-[#d7c39f]">
                      <span>وضعیت رزرو</span>
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          setReservationDrafts((current) => ({
                            ...current,
                            [reservation.id]: {
                              status: event.target.value as ReservationStatus,
                              notes: current[reservation.id]?.notes ?? reservation.notes,
                            },
                          }))
                        }
                      >
                        {reservationStatuses.map((status) => (
                          <option key={status} value={status}>
                            {reservationStatusLabelsFa[status]}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2 text-sm text-[#d7c39f]">
                      <span>یادداشت داخلی</span>
                      <textarea
                        rows={3}
                        value={draft.notes}
                        onChange={(event) =>
                          setReservationDrafts((current) => ({
                            ...current,
                            [reservation.id]: {
                              status: current[reservation.id]?.status ?? reservation.status,
                              notes: event.target.value,
                            },
                          }))
                        }
                        placeholder="مثلاً تماس گرفته شد، رزرو تأیید شد..."
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button type="button" onClick={() => saveReservation(reservation.id)} className="luxury-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium">
                      <Save className="h-4 w-4" />
                      ذخیره وضعیت رزرو
                    </button>
                    <button type="button" onClick={() => deleteReservation(reservation.id)} className="rounded-full border border-[#8f1f2466] bg-[#281313] px-5 py-3 text-sm text-[#efcfbf]">
                      حذف رزرو
                    </button>
                  </div>
                </article>
              );
            })}
            {filteredReservations.length === 0 ? <p className="text-sm text-[#bca98a]">رزروی با این فیلترها پیدا نشد.</p> : null}
          </div>
        </section>
      ) : null}

      {activeTab === "security" ? (
        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[#8aa16a]" />
              <h2 className="font-display text-3xl text-[#f0dfbf]">امنیت و حساب مدیر</h2>
            </div>
            <form onSubmit={saveAccount} className="mt-6 grid gap-4">
              <label className="space-y-2 text-sm text-[#d7c39f]">
                <span>نام کاربری</span>
                <input value={accountForm.username} onChange={(event) => setAccountForm((current) => ({ ...current, username: event.target.value }))} required />
              </label>
              <label className="space-y-2 text-sm text-[#d7c39f]">
                <span>رمز فعلی</span>
                <input type="password" value={accountForm.currentPassword} onChange={(event) => setAccountForm((current) => ({ ...current, currentPassword: event.target.value }))} placeholder="برای تغییر رمز وارد کنید" />
              </label>
              <label className="space-y-2 text-sm text-[#d7c39f]">
                <span>رمز جدید</span>
                <input type="password" value={accountForm.newPassword} onChange={(event) => setAccountForm((current) => ({ ...current, newPassword: event.target.value }))} placeholder="حداقل ۸ کاراکتر" />
              </label>
              <button type="submit" disabled={isBusy} className="luxury-button inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70">
                <KeyRound className="h-4 w-4" />
                ذخیره تنظیمات حساب
              </button>
            </form>
          </div>

          <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-[#8aa16a]" />
              <h2 className="font-display text-3xl text-[#f0dfbf]">راهنمای حساب ادمین</h2>
            </div>
            <div className="mt-6 space-y-4 text-sm leading-8 text-[#bca98a]">
              <p>• برای تغییر رمز عبور، وارد کردن رمز فعلی الزامی است.</p>
              <p>• رمز جدید باید حداقل ۸ کاراکتر باشد.</p>
              <p>• پس از تغییر نام کاربری، نشست فعلی شما به‌روزرسانی می‌شود.</p>
              <p>• این پنل روی {data.databaseProvider} اجرا می‌شود و برای Neon نیز آماده است.</p>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
