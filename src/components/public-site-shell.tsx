import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AtSign, Clock3, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { publicCopy } from "@/lib/i18n";
import type { PublicData } from "@/lib/data";
import { brandAssets } from "@/lib/brand";

type Props = {
  locale: Locale;
  currentPath: "/" | "/menu";
  siteInfo: PublicData["siteInfo"];
  children: ReactNode;
};

export function PublicSiteShell({ locale, currentPath, siteInfo, children }: Props) {
  const t = publicCopy[locale];
  const alternateLocale: Locale = locale === "fa" ? "en" : "fa";
  const alternateHref = currentPath === "/menu" ? `/${alternateLocale}/menu` : `/${alternateLocale}`;
  const phones = [siteInfo.phonePrimary, siteInfo.phoneSecondary].filter(Boolean);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(199,169,78,0.08),transparent_58%)]" />
      <header className="sticky top-0 z-40 border-b border-[#c7a94e22] bg-[#0d0a0ae6] backdrop-blur-xl">
        <div className="container-shell flex flex-wrap items-center justify-between gap-4 py-3.5">
          <Link href={`/${locale}`} className="group flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#c7a94e44] bg-black shadow-[0_8px_20px_rgba(0,0,0,0.28)]">
              <Image src={brandAssets.logo} alt="RUPIYA Café logo" fill sizes="48px" className="object-cover" priority />
            </div>
            <div>
              <p className="font-display text-2xl tracking-[0.22em] text-[#ead8b7]">RUPIYA</p>
              <p className="text-xs tracking-[0.3em] text-[#8aa16a]">{locale === "fa" ? "روپیا کافه رستوران" : "CAFÉ & RESTAURANT"}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-[#cfbc9c] md:flex">
            <Link href={`/${locale}`} className="hover:text-[#e7d7bc]">
              {t.nav.home}
            </Link>
            <Link href={`/${locale}/menu`} className="hover:text-[#8aa16a]">
              {t.nav.menu}
            </Link>
            <Link href={`/${locale}#reservation`} className="hover:text-[#e7d7bc]">
              {t.nav.reservation}
            </Link>
            <Link href={`/${locale}#location`} className="hover:text-[#e7d7bc]">
              {t.nav.location}
            </Link>
            <a href={siteInfo.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-[#e7d7bc]">
              {t.nav.instagram}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href={alternateHref} className="rounded-full border border-[#8aa16a55] bg-[#151211] px-4 py-2 text-sm text-[#d7c39f] hover:border-[#8aa16a99] hover:text-[#e7d7bc]">
              {t.switchLabel}
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-[#c7a94e22] bg-[#0c0909] py-10">
        <div className="container-shell grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#c7a94e44] bg-black">
                <Image src={brandAssets.logo} alt="RUPIYA Café logo" fill sizes="56px" className="object-cover" />
              </div>
              <div>
                <p className="font-display text-3xl tracking-[0.2em] text-[#ead8b7]">RUPIYA</p>
                <p className="text-xs tracking-[0.24em] text-[#8aa16a]">CAFÉ</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#bca98a]">
              {locale === "fa" ? siteInfo.taglineFa : siteInfo.taglineEn}
            </p>
            <p className="text-xs tracking-[0.2em] text-[#8aa16a]">{t.footer.rights}</p>
          </div>

          <div className="space-y-3 text-sm text-[#cfbc9c]">
            <div className="flex items-center gap-2 text-[#e4d3b3]">
              <Clock3 className="h-4 w-4 text-[#c7a94e]" />
              <span>{locale === "fa" ? siteInfo.hoursFa : siteInfo.hoursEn}</span>
            </div>
            {phones.map((phone) => (
              <a key={phone} href={`tel:${phone.replace(/-/g, "")}`} className="flex items-center gap-2 hover:text-[#e7d7bc]">
                <Phone className="h-4 w-4 text-[#8aa16a]" />
                <span>{phone}</span>
              </a>
            ))}
          </div>

          <div className="space-y-3 text-sm text-[#cfbc9c]">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-[#c7a94e]" />
              <span>{locale === "fa" ? siteInfo.addressFa : siteInfo.addressEn}</span>
            </div>
            <a href={siteInfo.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#e7d7bc]">
              <AtSign className="h-4 w-4 text-[#8aa16a]" />
              <span>{siteInfo.instagramHandle}</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
