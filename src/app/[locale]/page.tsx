import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, AtSign, Clock3, MapPin, PhoneCall } from "lucide-react";
import { getPublicData } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { formatPrice, publicCopy, resolveLocale } from "@/lib/i18n";
import { MenuCatalog, ReservationForm } from "@/components/public-interactive";
import { PublicSiteShell } from "@/components/public-site-shell";
import { brandAssets, brandGallery } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { categories, items, siteInfo, heroImageUrl } = await getPublicData();
  const t = publicCopy[locale];
  const phones = [siteInfo.phonePrimary, siteInfo.phoneSecondary];
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(siteInfo.addressEn)}&output=embed`;
  const featuredPrices = items.slice(0, 3).map((item) => item.price);
  const priceRange = featuredPrices.length
    ? `${formatPrice(Math.min(...featuredPrices), locale)} – ${formatPrice(Math.max(...featuredPrices), locale)}`
    : formatPrice(0, locale);

  return (
    <PublicSiteShell locale={locale} currentPath="/" siteInfo={siteInfo}>
      <main>
        <section className="relative isolate overflow-hidden border-b border-[#c7a94e1f]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(10, 10, 10, 0.9), rgba(10, 10, 10, 0.58)), url(${heroImageUrl})`,
            }}
          />
          <div className="container-shell relative z-10 grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
            <div className="max-w-3xl space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c7a94e55] bg-[#110f0ee0] px-4 py-2 text-xs tracking-[0.22em] text-[#cdb48d]">
                <span className="h-2 w-2 rounded-full bg-[#8aa16a]" />
                {t.hero.eyebrow}
              </div>

              <div className="space-y-5">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-[#c7a94e44] bg-black shadow-[0_16px_40px_rgba(0,0,0,0.35)] sm:h-28 sm:w-28">
                  <Image src={brandAssets.logo} alt="RUPIYA Café logo" fill sizes="112px" className="object-cover" priority />
                </div>
                <p className="font-display text-4xl tracking-[0.34em] text-[#e8d6b5] sm:text-5xl lg:text-6xl">RUPIYA</p>
                <h1 className="font-display text-4xl leading-tight text-[#f0dfbf] sm:text-5xl lg:text-6xl">{t.hero.title}</h1>
                <p className="max-w-2xl text-base leading-8 text-[#d4c19f] sm:text-lg">{locale === "fa" ? siteInfo.taglineFa : siteInfo.taglineEn}</p>
                <p className="max-w-2xl text-sm leading-7 text-[#bca98a]">{t.hero.subtitle}</p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href={`/${locale}/menu`} className="luxury-button rounded-full px-6 py-3 text-sm font-medium">
                  {t.hero.ctaMenu}
                </Link>
                <Link href={`/${locale}#reservation`} className="luxury-outline rounded-full px-6 py-3 text-sm font-medium">
                  {t.hero.ctaReservation}
                </Link>
                <a href={siteInfo.mapsUrl} target="_blank" rel="noreferrer" className="luxury-outline rounded-full px-6 py-3 text-sm font-medium">
                  {t.hero.ctaLocation}
                </a>
              </div>
            </div>

            <div className="grid gap-4 self-end sm:grid-cols-2 lg:grid-cols-1">
              <div className="surface-panel overflow-hidden rounded-[1.75rem]">
                <div className="relative h-48">
                  <Image src={brandAssets.seating} alt={locale === "fa" ? "نشیمن روپیا" : "RUPIYA seating"} fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0909] via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-[#d9c7a8]">
                    <Clock3 className="h-5 w-5 text-[#c7a94e]" />
                    <p className="text-sm uppercase tracking-[0.22em]">{t.hero.hoursLabel}</p>
                  </div>
                  <p className="mt-4 font-display text-3xl text-[#f0dfbf]">{locale === "fa" ? siteInfo.hoursFa : siteInfo.hoursEn}</p>
                </div>
              </div>

              <div className="surface-panel rounded-[1.75rem] p-6">
                <div className="flex items-center gap-3 text-[#d9c7a8]">
                  <PhoneCall className="h-5 w-5 text-[#8aa16a]" />
                  <p className="text-sm uppercase tracking-[0.22em]">{t.location.phones}</p>
                </div>
                <div className="mt-4 space-y-2 text-lg text-[#f0dfbf]">
                  {phones.map((phone) => (
                    <a key={phone} href={`tel:${phone.replace(/-/g, "")}`} className="block hover:text-[#e7d7bc]">
                      {phone}
                    </a>
                  ))}
                </div>
              </div>

              <div className="surface-panel rounded-[1.75rem] p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 text-[#d9c7a8]">
                  <MapPin className="h-5 w-5 text-[#c7a94e]" />
                  <p className="text-sm uppercase tracking-[0.22em]">{t.location.address}</p>
                </div>
                <p className="mt-4 text-base leading-8 text-[#f0dfbf]">{locale === "fa" ? siteInfo.addressFa : siteInfo.addressEn}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container-shell grid gap-6 py-10 md:grid-cols-4">
          <a href={`/${locale}/menu`} className="surface-subtle rounded-[1.5rem] p-5 hover:border-[#c7a94e55]">
            <p className="text-xs tracking-[0.22em] text-[#8aa16a]">01</p>
            <p className="mt-2 font-display text-2xl text-[#ead8b7]">{t.nav.menu}</p>
          </a>
          <a href={`/${locale}#reservation`} className="surface-subtle rounded-[1.5rem] p-5 hover:border-[#c7a94e55]">
            <p className="text-xs tracking-[0.22em] text-[#8aa16a]">02</p>
            <p className="mt-2 font-display text-2xl text-[#ead8b7]">{t.nav.reservation}</p>
          </a>
          <a href={siteInfo.mapsUrl} target="_blank" rel="noreferrer" className="surface-subtle rounded-[1.5rem] p-5 hover:border-[#c7a94e55]">
            <p className="text-xs tracking-[0.22em] text-[#8aa16a]">03</p>
            <p className="mt-2 font-display text-2xl text-[#ead8b7]">{t.nav.location}</p>
          </a>
          <a href={siteInfo.instagramUrl} target="_blank" rel="noreferrer" className="surface-subtle rounded-[1.5rem] p-5 hover:border-[#c7a94e55]">
            <p className="text-xs tracking-[0.22em] text-[#8aa16a]">04</p>
            <p className="mt-2 font-display text-2xl text-[#ead8b7]">{t.nav.instagram}</p>
          </a>
        </section>

        <section className="container-shell py-10">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm tracking-[0.22em] text-[#8aa16a]">ATMOSPHERE</p>
            <h2 className="mt-3 font-display text-4xl text-[#f0dfbf]">{t.atmosphere.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#bca98a]">{t.atmosphere.subtitle}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {brandGallery.map((item, index) => (
              <article key={item.src} className="surface-panel group overflow-hidden rounded-[1.75rem]">
                <div className="relative h-72">
                  <Image
                    src={item.src}
                    alt={locale === "fa" ? item.altFa : item.altEn}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0909] via-[#0b090955] to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-xs tracking-[0.22em] text-[#8aa16a]">0{index + 1}</p>
                    <p className="mt-2 font-display text-2xl text-[#f0dfbf]">{t.atmosphere.captions[index]}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container-shell py-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="surface-panel rounded-[2rem] p-8">
              <p className="text-sm tracking-[0.22em] text-[#8aa16a]">RUPIYA EXPERIENCE</p>
              <h2 className="mt-4 font-display text-4xl text-[#f0dfbf]">{t.highlights.title}</h2>
              <div className="mt-6 space-y-4 text-sm leading-8 text-[#bca98a]">
                {t.highlights.items.map((item, index) => (
                  <div key={item} className="flex gap-4">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#c7a94e44] bg-[#120f0f] text-[#c7a94e]">
                      0{index + 1}
                    </span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="surface-subtle overflow-hidden rounded-[1.75rem]">
                <div className="relative h-36">
                  <Image src={brandAssets.wide} alt="RUPIYA hall" fill sizes="280px" className="object-cover" />
                </div>
                <div className="p-6">
                  <p className="text-xs tracking-[0.22em] text-[#8aa16a]">MENU RANGE</p>
                  <p className="mt-3 font-display text-3xl text-[#ead8b7]">{categories.length}</p>
                  <p className="mt-2 text-sm text-[#bca98a]">{locale === "fa" ? "دسته‌بندی منو" : "Menu categories"}</p>
                </div>
              </div>
              <div className="surface-subtle overflow-hidden rounded-[1.75rem]">
                <div className="relative h-36">
                  <Image src={brandAssets.cactus} alt="RUPIYA vibe wall" fill sizes="280px" className="object-cover" />
                </div>
                <div className="p-6">
                  <p className="text-xs tracking-[0.22em] text-[#8aa16a]">SIGNATURES</p>
                  <p className="mt-3 font-display text-3xl text-[#ead8b7]">{items.length}</p>
                  <p className="mt-2 text-sm text-[#bca98a]">{locale === "fa" ? "آیتم‌های فعال" : "Active items"}</p>
                </div>
              </div>
              <div className="surface-subtle overflow-hidden rounded-[1.75rem]">
                <div className="relative h-36">
                  <Image src={brandAssets.seating} alt="RUPIYA seating detail" fill sizes="280px" className="object-cover" />
                </div>
                <div className="p-6">
                  <p className="text-xs tracking-[0.22em] text-[#8aa16a]">PRICE GUIDE</p>
                  <p className="mt-3 font-display text-3xl text-[#ead8b7]">{priceRange}</p>
                  <p className="mt-2 text-sm text-[#bca98a]">{t.menu.currency}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="menu" className="container-shell py-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm tracking-[0.22em] text-[#8aa16a]">CURATED MENU</p>
              <h2 className="mt-3 font-display text-4xl text-[#f0dfbf]">{t.menu.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#bca98a]">{t.menu.subtitle}</p>
            </div>
            <Link href={`/${locale}/menu`} className="inline-flex items-center gap-2 text-sm text-[#e7d7bc] hover:text-[#c7a94e]">
              <span>{t.menu.seeFullMenu}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <MenuCatalog locale={locale} categories={categories} items={items} />
        </section>

        <section id="reservation" className="container-shell py-10">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm tracking-[0.22em] text-[#8aa16a]">RESERVATION</p>
            <h2 className="mt-3 font-display text-4xl text-[#f0dfbf]">{t.reservation.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#bca98a]">{t.reservation.subtitle}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="surface-panel overflow-hidden rounded-[2rem]">
              <div className="relative h-48">
                <Image src={brandAssets.wide} alt={locale === "fa" ? "سالن روپیا" : "RUPIYA dining room"} fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0909] via-[#0b090966] to-transparent" />
              </div>
              <div className="space-y-5 p-8">
                <div>
                  <p className="text-sm tracking-[0.22em] text-[#8aa16a]">CALL DIRECT</p>
                  <h3 className="mt-3 font-display text-3xl text-[#f0dfbf]">{locale === "fa" ? "رزرو با تماس مستقیم" : "Reserve by phone"}</h3>
                </div>
                <div className="space-y-3">
                  {phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/-/g, "")}`}
                      className="flex items-center justify-between rounded-2xl border border-[#c7a94e22] bg-[#140f0f] px-5 py-4 text-[#ead8b7] hover:border-[#8aa16a55]"
                    >
                      <span>{phone}</span>
                      <PhoneCall className="h-4 w-4 text-[#8aa16a]" />
                    </a>
                  ))}
                </div>
                <div className="rounded-[1.5rem] border border-[#8aa16a33] bg-[#11100f] p-5 text-sm leading-7 text-[#bca98a]">
                  {locale === "fa"
                    ? "برای رویدادهای کوچک، قرارهای رسمی و دورهمی‌های خاص، فرم رزرو را ارسال کنید تا تیم روپیا با شما هماهنگ کند."
                    : "For intimate gatherings, formal meetings, and premium evening plans, submit the reservation request and our team will follow up."}
                </div>
              </div>
            </div>
            <ReservationForm locale={locale} />
          </div>
        </section>

        <section id="location" className="container-shell py-10 pb-16">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm tracking-[0.22em] text-[#8aa16a]">LOCATION & CONTACT</p>
            <h2 className="mt-3 font-display text-4xl text-[#f0dfbf]">{t.location.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#bca98a]">{t.location.subtitle}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
            <div className="space-y-6">
              <div className="surface-panel rounded-[2rem] p-8">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-[#c7a94e]" />
                  <div>
                    <p className="text-sm tracking-[0.22em] text-[#8aa16a]">{t.location.address}</p>
                    <p className="mt-3 text-base leading-8 text-[#ead8b7]">{siteInfo.addressFa}</p>
                    <p className="mt-2 text-sm leading-7 text-[#bca98a]">{siteInfo.addressEn}</p>
                  </div>
                </div>
              </div>
              <div className="surface-panel rounded-[2rem] p-8">
                <div className="flex items-center gap-3">
                  <AtSign className="h-5 w-5 text-[#8aa16a]" />
                  <div>
                    <p className="text-sm tracking-[0.22em] text-[#8aa16a]">INSTAGRAM</p>
                    <a href={siteInfo.instagramUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-lg text-[#ead8b7] hover:text-[#c7a94e]">
                      {siteInfo.instagramHandle}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-panel overflow-hidden rounded-[2rem] p-3">
              <iframe title="RUPIYA Café map" src={mapEmbedUrl} className="h-[420px] w-full rounded-[1.4rem]" loading="lazy" />
              <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 text-sm text-[#cfbc9c]">
                <span>{locale === "fa" ? siteInfo.hoursFa : siteInfo.hoursEn}</span>
                <a href={siteInfo.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#e7d7bc] hover:text-[#c7a94e]">
                  <span>{t.location.map}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}
