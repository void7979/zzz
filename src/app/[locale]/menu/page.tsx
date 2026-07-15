import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { MenuCatalog } from "@/components/public-interactive";
import { PublicSiteShell } from "@/components/public-site-shell";
import { brandAssets } from "@/lib/brand";
import { getPublicData } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { publicCopy, resolveLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function MenuPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const { categories, items, siteInfo } = await getPublicData();
  const t = publicCopy[locale];
  const directionBackIcon = locale === "fa" ? <ArrowLeft className="h-4 w-4 rotate-180" /> : <ArrowLeft className="h-4 w-4" />;

  return (
    <PublicSiteShell locale={locale} currentPath="/menu" siteInfo={siteInfo}>
      <main className="container-shell py-12 pb-16">
        <section className="surface-panel rounded-[2.25rem] p-8 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#c7a94e44] bg-black">
                  <Image src={brandAssets.logo} alt="RUPIYA Café logo" fill sizes="56px" className="object-cover" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#c7a94e44] bg-[#130f0f] px-4 py-2 text-xs tracking-[0.22em] text-[#8aa16a]">
                  <span>{locale === "fa" ? "منوی کامل روپیا" : "RUPIYA Full Menu"}</span>
                </div>
              </div>
              <h1 className="mt-5 font-display text-5xl text-[#f0dfbf]">{t.menu.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-[#bca98a]">{t.menu.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}`} className="luxury-outline inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm">
                {directionBackIcon}
                <span>{t.nav.home}</span>
              </Link>
              <Link href={`/${locale}#reservation`} className="luxury-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm">
                <span>{t.nav.reservation}</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <MenuCatalog locale={locale} categories={categories} items={items} />
        </section>
      </main>
    </PublicSiteShell>
  );
}
