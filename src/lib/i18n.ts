export const locales = ["fa", "en"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function resolveLocale(value?: string): Locale {
  return value === "en" ? "en" : "fa";
}

export function getDirection(locale: Locale) {
  return locale === "fa" ? "rtl" : "ltr";
}

export function formatPrice(price: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(price);
}

export function localizeDigits(value: string, locale: Locale) {
  return locale === "fa" ? value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit) : value;
}

export const publicCopy = {
  fa: {
    localeLabel: "فارسی",
    switchLabel: "English",
    brand: "روپیا",
    brandExtended: "RUPIYA Café",
    nav: {
      home: "خانه",
      menu: "منو",
      reservation: "رزرو",
      location: "موقعیت",
      instagram: "اینستاگرام",
    },
    hero: {
      eyebrow: "کافه رستوران در پونک",
      title: "روپیا؛ جایی برای طعم‌های ماندگار و لحظه‌هایی که دوستشون داریم",
      subtitle:
        "ترکیبی از فضای گرم و آروم،  برای مهمانانی که کیفیت را انتخاب می‌کنند.",
      ctaMenu: "مشاهده منو",
      ctaReservation: "ثبت درخواست رزرو",
      ctaLocation: "موقعیت مکانی",
      hoursLabel: "ساعات فعالیت",
      hoursValue: "هر روز، ۸ صبح تا ۱۱ شب",
      quickLinksTitle: "دسترسی سریع",
    },
    atmosphere: {
      title: "فضای روپیا",
      subtitle: "نور گرم، حس خوب، جزئیات و حس آرام یک کافه.",
      captions: [
        "جایی که شهر آرام می‌شود",
        "گفتگوها مثل قهوه روان می‌شوند",
        "حس امروز: قهوه... زیاد قهوه",
        "نشیمن گرم برای قرارهای خاص",
      ],
    },
    highlights: {
      title: "چرا روپیا؟",
      items: [
        "فضای آرام برای قرارهای دوستانه",
        "منوی ترکیبی از کافه، صبحانه، غذای اصلی و دسر",
        "دسترسی آسان، رزرو تلفنی و تجربه‌ای ممتاز در تمام ساعات روز",
      ],
    },
    menu: {
      title: "منوی منتخب روپیا",
      subtitle: "دسته‌بندی مورد نظر را انتخاب کنید و آیتم‌ها را با توضیحات فارسی و انگلیسی ببینید.",
      allItems: "همه آیتم‌ها",
      available: "موجود",
      unavailable: "ناموجود",
      currency: "تومان",
      seeFullMenu: "رفتن به صفحه کامل منو",
      empty: "در این دسته‌بندی هنوز آیتمی ثبت نشده است.",
    },
    reservation: {
      title: "رزرو میز",
      subtitle: "برای هماهنگی سریع‌تر می‌توانید مستقیماً تماس بگیرید یا فرم زیر را ارسال کنید.",
      name: "نام و نام خانوادگی",
      phone: "شماره تماس",
      date: "تاریخ",
      time: "ساعت",
      guests: "تعداد مهمان",
      submit: "ثبت درخواست رزرو",
      success: "درخواست شما با موفقیت ثبت شد. به‌زودی با شما تماس می‌گیریم.",
      error: "ثبت درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید.",
      helper: "رزرو تلفنی: ۰۲۱-۲۲۲۱۳۸۶۸ و ۰۲۱-۴۶۰۴۴۲۹۶",
    },
    location: {
      title: "موقعیت و تماس",
      subtitle: "نشانی فارسی و انگلیسی، لینک مستقیم اینستاگرام و دسترسی سریع به گوگل مپ.",
      address: "نشانی",
      phones: "شماره‌های تماس",
      map: "مشاهده در نقشه",
      instagram: "اینستاگرام روپیا",
    },
    footer: {
      rights: "تمام حقوق برای RUPIYA Café محفوظ است.",
    },
  },
  en: {
    localeLabel: "English",
    switchLabel: "فارسی",
    brand: "RUPIYA",
    brandExtended: "RUPIYA Café",
    nav: {
      home: "Home",
      menu: "Menu",
      reservation: "Reservation",
      location: "Location",
      instagram: "Instagram",
    },
    hero: {
      eyebrow: "Luxury café & restaurant in Punak",
      title: "RUPIYA — a refined destination for crafted coffee, elegant dining, and memorable evenings",
      subtitle:
        "A warm, premium ambiance paired with specialty coffee, elevated breakfast, signature entrées, and a polished hospitality experience.",
      ctaMenu: "Explore the Menu",
      ctaReservation: "Request a Reservation",
      ctaLocation: "Find Us",
      hoursLabel: "Opening Hours",
      hoursValue: "Daily, 08:00 AM to 11:00 PM",
      quickLinksTitle: "Quick Access",
    },
    atmosphere: {
      title: "The RUPIYA Space",
      subtitle: "Warm light, natural wood, pistachio-green accents, and the calm of a luxury café.",
      captions: [
        "A place where the city slows down",
        "Conversations flow as smoothly as the coffee",
        "Today’s vibe: coffee… lots of coffee",
        "Warm seating for special gatherings",
      ],
    },
    highlights: {
      title: "Why RUPIYA?",
      items: [
        "A luxurious, intimate interior for business meetings and refined gatherings",
        "A curated menu spanning coffee, breakfast, main dishes, desserts, and beverages",
        "Easy access, reservation support, and a premium guest experience from morning to night",
      ],
    },
    menu: {
      title: "Selected Menu",
      subtitle: "Choose a category to browse menu items with both Persian and English naming.",
      allItems: "All Items",
      available: "Available",
      unavailable: "Unavailable",
      currency: "Toman",
      seeFullMenu: "Open the full menu page",
      empty: "No items have been added to this category yet.",
    },
    reservation: {
      title: "Table Reservation",
      subtitle: "Call us directly for faster coordination or submit the form below.",
      name: "Full name",
      phone: "Phone number",
      date: "Date",
      time: "Time",
      guests: "Guests",
      submit: "Submit Reservation",
      success: "Your reservation request has been saved. We will contact you shortly.",
      error: "Something went wrong while saving your request. Please try again.",
      helper: "Reservation lines: 021-22213868 and 021-46044296",
    },
    location: {
      title: "Location & Contact",
      subtitle: "Persian and English address details, direct Instagram link, and Google Maps access.",
      address: "Address",
      phones: "Phone Numbers",
      map: "Open in Google Maps",
      instagram: "RUPIYA Instagram",
    },
    footer: {
      rights: "All rights reserved for RUPIYA Café.",
    },
  },
} as const;
