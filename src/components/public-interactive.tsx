"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { formatPrice, publicCopy } from "@/lib/i18n";
import type { PublicData } from "@/lib/data";

type MenuCatalogProps = {
  locale: Locale;
  categories: PublicData["categories"];
  items: PublicData["items"];
};

type ReservationFormProps = {
  locale: Locale;
};

export function MenuCatalog({ locale, categories, items }: MenuCatalogProps) {
  const t = publicCopy[locale].menu;
  const [activeCategoryId, setActiveCategoryId] = useState<number | "all">("all");

  const filteredItems = useMemo(() => {
    if (activeCategoryId === "all") {
      return items;
    }

    return items.filter((item) => item.categoryId === activeCategoryId);
  }, [activeCategoryId, items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveCategoryId("all")}
          className={`rounded-full px-5 py-2.5 text-sm ${
            activeCategoryId === "all"
              ? "bg-[#89a86a] text-[#120f0e] shadow-[0_10px_24px_rgba(137,168,106,0.26)]"
              : "border border-[#8aa16a44] bg-[#181313] text-[#d2c0a1] hover:border-[#8aa16a88]"
          }`}
        >
          {t.allItems}
        </button>

        {categories.map((category) => {
          const label = locale === "fa" ? category.nameFa : category.nameEn;
          const isActive = activeCategoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategoryId(category.id)}
              className={`rounded-full px-5 py-2.5 text-sm ${
                isActive
                  ? "bg-[#89a86a] text-[#120f0e] shadow-[0_10px_24px_rgba(137,168,106,0.26)]"
                  : "border border-[#8aa16a44] bg-[#181313] text-[#d2c0a1] hover:border-[#8aa16a88]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <div className="surface-subtle rounded-[1.75rem] p-8 text-sm text-[#bca98a]">{t.empty}</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const category = categories.find((entry) => entry.id === item.categoryId);
            const name = locale === "fa" ? item.nameFa : item.nameEn;
            const altName = locale === "fa" ? item.nameEn : item.nameFa;
            const description = locale === "fa" ? item.descriptionFa : item.descriptionEn;

            return (
              <article key={item.id} className="surface-panel overflow-hidden rounded-[1.75rem]">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={name}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_15%,rgba(11,9,9,0.82)_100%)]" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                    <span className="rounded-full border border-[#c7a94e55] bg-[#110f0edd] px-3 py-1 text-xs text-[#e5d5b6]">
                      {locale === "fa" ? category?.nameFa : category?.nameEn}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs ${item.isAvailable ? "bg-[#89a86a] text-[#140f0f]" : "bg-[#3a2323] text-[#d8be9a]"}`}>
                      {item.isAvailable ? t.available : t.unavailable}
                    </span>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-2xl text-[#eedcc0]">{name}</h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#8aa16a]">{altName}</p>
                      </div>
                      <div className="rounded-full border border-[#c7a94e44] bg-[#151110] px-3 py-2 text-sm text-[#e6d5b7]">
                        {formatPrice(item.price, locale)} {t.currency}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[#bca98a]">{description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ReservationForm({ locale }: ReservationFormProps) {
  const t = publicCopy[locale].reservation;
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          guests: Number(form.guests),
        }),
      });

      if (!response.ok) {
        throw new Error("Reservation failed");
      }

      setForm({
        name: "",
        phone: "",
        date: "",
        time: "",
        guests: "2",
      });
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface-panel rounded-[2rem] p-6 sm:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-[#d8c6a8]">
          <span>{t.name}</span>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder={t.name}
            required
          />
        </label>
        <label className="space-y-2 text-sm text-[#d8c6a8]">
          <span>{t.phone}</span>
          <input
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            placeholder={t.phone}
            required
          />
        </label>
        <label className="space-y-2 text-sm text-[#d8c6a8]">
          <span>{t.date}</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            required
          />
        </label>
        <label className="space-y-2 text-sm text-[#d8c6a8]">
          <span>{t.time}</span>
          <input
            type="time"
            value={form.time}
            onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
            required
          />
        </label>
        <label className="space-y-2 text-sm text-[#d8c6a8] md:col-span-2">
          <span>{t.guests}</span>
          <input
            type="number"
            min="1"
            max="20"
            value={form.guests}
            onChange={(event) => setForm((current) => ({ ...current, guests: event.target.value }))}
            required
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={isSubmitting} className="luxury-button rounded-full px-6 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? "..." : t.submit}
        </button>
        <p className="text-sm text-[#bca98a]">{t.helper}</p>
      </div>

      {status === "success" ? <p className="mt-4 text-sm text-[#8aa16a]">{t.success}</p> : null}
      {status === "error" ? <p className="mt-4 text-sm text-[#d49e92]">{t.error}</p> : null}
    </form>
  );
}
