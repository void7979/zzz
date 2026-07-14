import { asc, count, desc, eq } from "drizzle-orm";
import { databaseProviderLabel, db } from "@/db";
import { admins, categories, menuItems, reservations, siteInfo } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { brandAssets } from "@/lib/brand";
import type { ReservationStatus } from "@/lib/reservations";

const heroImageUrl = brandAssets.hero;

const sampleCategories = [
  { nameFa: "قهوه", nameEn: "Coffee", sortOrder: 1 },
  { nameFa: "صبحانه", nameEn: "Breakfast", sortOrder: 2 },
  { nameFa: "غذای اصلی", nameEn: "Main Course", sortOrder: 3 },
  { nameFa: "دسر", nameEn: "Dessert", sortOrder: 4 },
  { nameFa: "نوشیدنی", nameEn: "Beverage", sortOrder: 5 },
];

const sampleSiteInfo = {
  hoursFa: "هر روز، ۸ صبح تا ۱۱ شب",
  hoursEn: "Daily, 08:00 AM – 11:00 PM",
  phonePrimary: "021-22213868",
  phoneSecondary: "021-46044296",
  addressFa: "پونک، بلوار کمالی، پلاک ۲۰",
  addressEn: "No. 20, Kamali Blvd., Punak, Tehran",
  instagramUrl: "https://www.instagram.com/rupiyacafe/",
  instagramHandle: "@rupiyacafe",
  mapsUrl: "https://maps.app.goo.gl/mXeKZPBFkiPRyZER8",
  taglineFa: "جایی که شهر آرام می‌شود؛ گفتگوها مثل قهوه نرم و روان جریان پیدا می‌کنند.",
  taglineEn: "A place where the city slows down — conversations flow as smoothly as the coffee.",
};

const sampleItems = [
  {
    categoryNameFa: "قهوه",
    nameFa: "اسپرسو ویژه روپیا",
    nameEn: "RUPIYA Signature Espresso",
    descriptionFa: "شات دوبل عربیکا با رُست تیره، کرمای غلیظ و پایان طعمی شکلاتی.",
    descriptionEn: "Double-shot arabica espresso with a dark roast profile, dense crema, and a chocolate finish.",
    price: 125000,
    imageUrl: "/images/menu/espresso.jpg",
    isAvailable: true,
    sortOrder: 1,
  },
  {
    categoryNameFa: "قهوه",
    nameFa: "لاته زعفرانی",
    nameEn: "Saffron Latte",
    descriptionFa: "لاته لطیف با شیر مخملی و رایحه ملایم زعفران برای تجربه‌ای خاص.",
    descriptionEn: "A silky latte with velvety milk and a subtle saffron aroma for a distinct premium experience.",
    price: 168000,
    imageUrl: "/images/menu/latte.jpg",
    isAvailable: true,
    sortOrder: 2,
  },
  {
    categoryNameFa: "صبحانه",
    nameFa: "صبحانه ویژه روپیا",
    nameEn: "RUPIYA Breakfast Board",
    descriptionFa: "ترکیب کروسان، پنیر، میوه تازه، قهوه و جزئیات ظریف برای شروع یک روز ممتاز.",
    descriptionEn: "A curated breakfast board with croissant, cheese, fresh fruit, coffee, and elegant touches.",
    price: 285000,
    imageUrl: "/images/menu/breakfast.jpg",
    isAvailable: true,
    sortOrder: 1,
  },
  {
    categoryNameFa: "صبحانه",
    nameFa: "کروسان بوقلمون و پنیر",
    nameEn: "Turkey & Cheese Croissant",
    descriptionFa: "کروسان کره‌ای با بوقلمون دودی، پنیر نرم و سرو شیک برای وعده‌ای سبک و مجلل.",
    descriptionEn: "Buttery croissant layered with smoked turkey and soft cheese for a light yet refined plate.",
    price: 214000,
    imageUrl: "/images/menu/croissant.jpg",
    isAvailable: true,
    sortOrder: 2,
  },
  {
    categoryNameFa: "غذای اصلی",
    nameFa: "استیک فیله با سس قارچ",
    nameEn: "Filet Steak with Mushroom Sauce",
    descriptionFa: "فیله گریل‌شده با سس قارچ خامه‌ای، سبزیجات فصلی و ارائه‌ای مناسب میزهای خاص.",
    descriptionEn: "Grilled filet steak with creamy mushroom sauce, seasonal vegetables, and fine-dining presentation.",
    price: 895000,
    imageUrl: "/images/menu/steak.jpg",
    isAvailable: true,
    sortOrder: 1,
  },
  {
    categoryNameFa: "غذای اصلی",
    nameFa: "پاستای سیاه میگو",
    nameEn: "Black Shrimp Pasta",
    descriptionFa: "پاستای مرکب ماهی با میگوی مزه‌دار، گوجه گیلاسی و جزئیات بصری لوکس.",
    descriptionEn: "Squid-ink pasta with seasoned shrimp, cherry tomatoes, and a dramatic upscale plating.",
    price: 648000,
    imageUrl: "/images/menu/pasta.jpg",
    isAvailable: true,
    sortOrder: 2,
  },
  {
    categoryNameFa: "دسر",
    nameFa: "چیزکیک پسته",
    nameEn: "Pistachio Cheesecake",
    descriptionFa: "چیزکیک خامه‌ای با لایه پسته و بافتی متعادل برای پایان یک وعده لوکس.",
    descriptionEn: "Creamy cheesecake layered with pistachio notes for a balanced and elegant finish.",
    price: 235000,
    imageUrl: "/images/menu/cheesecake.jpg",
    isAvailable: true,
    sortOrder: 1,
  },
  {
    categoryNameFa: "دسر",
    nameFa: "دسر شکلات تلخ",
    nameEn: "Dark Chocolate Dome",
    descriptionFa: "موس شکلات تلخ با پودر کاکائو و سرو مینیمال روی بشقاب تیره.",
    descriptionEn: "Dark chocolate mousse dome finished with cocoa dust and a minimalist dark-plated presentation.",
    price: 248000,
    imageUrl: "/images/menu/chocolate.jpg",
    isAvailable: true,
    sortOrder: 2,
  },
  {
    categoryNameFa: "نوشیدنی",
    nameFa: "آیس لاته امضای روپیا",
    nameEn: "RUPIYA Iced Latte",
    descriptionFa: "نوشیدنی خنک با قهوه غلیظ، بافت ابریشمی و سرو مناسب عصرهای طولانی.",
    descriptionEn: "A chilled latte with bold coffee, silky texture, and a relaxed premium serving style.",
    price: 176000,
    imageUrl: "/images/menu/iced-latte.jpg",
    isAvailable: true,
    sortOrder: 1,
  },
];

export type CategoryRecord = {
  id: number;
  nameFa: string;
  nameEn: string;
  sortOrder: number;
};

export type MenuItemRecord = {
  id: number;
  categoryId: number;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  sortOrder: number;
};

export type SiteInfoRecord = {
  id: number;
  hoursFa: string;
  hoursEn: string;
  phonePrimary: string;
  phoneSecondary: string;
  addressFa: string;
  addressEn: string;
  instagramUrl: string;
  instagramHandle: string;
  mapsUrl: string;
  taglineFa: string;
  taglineEn: string;
};

export type ReservationRecord = {
  id: number;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PublicData = {
  heroImageUrl: string;
  categories: CategoryRecord[];
  items: MenuItemRecord[];
  siteInfo: SiteInfoRecord;
};

export type AdminDashboardData = PublicData & {
  reservations: ReservationRecord[];
  databaseProvider: string;
};

export const defaultAdminCredentials = {
  username: "admin",
  password: "rupiya123",
};

const globalForSeed = globalThis as typeof globalThis & {
  __rupiyaSeedPromise?: Promise<void>;
};

export async function ensureSeedData() {
  if (globalForSeed.__rupiyaSeedPromise) {
    return globalForSeed.__rupiyaSeedPromise;
  }

  globalForSeed.__rupiyaSeedPromise = (async () => {
    const [{ count: categoryCount }] = await db.select({ count: count() }).from(categories);

    if (Number(categoryCount) === 0) {
      await db.insert(categories).values(
        sampleCategories.map((category) => ({
          ...category,
          updatedAt: new Date(),
        })),
      );
    }

    const orderedCategories = await db
      .select({
        id: categories.id,
        nameFa: categories.nameFa,
      })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.id));

    const categoryMap = new Map(orderedCategories.map((category) => [category.nameFa, category.id]));

    const [{ count: itemCount }] = await db.select({ count: count() }).from(menuItems);

    if (Number(itemCount) === 0) {
      await db.insert(menuItems).values(
        sampleItems.map((item) => ({
          categoryId: categoryMap.get(item.categoryNameFa) ?? orderedCategories[0]?.id ?? 1,
          nameFa: item.nameFa,
          nameEn: item.nameEn,
          descriptionFa: item.descriptionFa,
          descriptionEn: item.descriptionEn,
          price: item.price,
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
          sortOrder: item.sortOrder,
          updatedAt: new Date(),
        })),
      );
    }

    const [{ count: siteInfoCount }] = await db.select({ count: count() }).from(siteInfo);

    if (Number(siteInfoCount) === 0) {
      await db.insert(siteInfo).values({
        ...sampleSiteInfo,
        updatedAt: new Date(),
      });
    }

    const [{ count: adminCount }] = await db.select({ count: count() }).from(admins);

    if (Number(adminCount) === 0) {
      await db.insert(admins).values({
        username: defaultAdminCredentials.username,
        passwordHash: await hashPassword(defaultAdminCredentials.password),
        updatedAt: new Date(),
      });
    }
  })();

  return globalForSeed.__rupiyaSeedPromise;
}

export async function getPublicData(): Promise<PublicData> {
  await ensureSeedData();

  const categoryRows = await db
    .select({
      id: categories.id,
      nameFa: categories.nameFa,
      nameEn: categories.nameEn,
      sortOrder: categories.sortOrder,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.id));

  const itemRows = await db
    .select({
      id: menuItems.id,
      categoryId: menuItems.categoryId,
      nameFa: menuItems.nameFa,
      nameEn: menuItems.nameEn,
      descriptionFa: menuItems.descriptionFa,
      descriptionEn: menuItems.descriptionEn,
      price: menuItems.price,
      imageUrl: menuItems.imageUrl,
      isAvailable: menuItems.isAvailable,
      sortOrder: menuItems.sortOrder,
    })
    .from(menuItems)
    .where(eq(menuItems.isAvailable, true))
    .orderBy(asc(menuItems.categoryId), asc(menuItems.sortOrder), asc(menuItems.id));

  const [siteInfoRow] = await db
    .select({
      id: siteInfo.id,
      hoursFa: siteInfo.hoursFa,
      hoursEn: siteInfo.hoursEn,
      phonePrimary: siteInfo.phonePrimary,
      phoneSecondary: siteInfo.phoneSecondary,
      addressFa: siteInfo.addressFa,
      addressEn: siteInfo.addressEn,
      instagramUrl: siteInfo.instagramUrl,
      instagramHandle: siteInfo.instagramHandle,
      mapsUrl: siteInfo.mapsUrl,
      taglineFa: siteInfo.taglineFa,
      taglineEn: siteInfo.taglineEn,
    })
    .from(siteInfo)
    .limit(1);

  return {
    heroImageUrl,
    categories: categoryRows,
    items: itemRows,
    siteInfo: siteInfoRow || {
      id: 0,
      hoursFa: "هر روز، ۸ صبح تا ۱۱ شب",
      hoursEn: "Daily, 08:00 AM – 11:00 PM",
      phonePrimary: "021-22213868",
      phoneSecondary: "021-46044296",
      addressFa: "پونک، بلوار کمالی، پلاک ۲۰",
      addressEn: "No. 20, Kamali Blvd., Punak, Tehran",
      instagramUrl: "https://www.instagram.com/rupiyacafe/",
      instagramHandle: "@rupiyacafe",
      mapsUrl: "https://maps.app.goo.gl/mXeKZPBFkiPRyZER8",
      taglineFa: "لوکس، آرام و به‌یادماندنی",
      taglineEn: "Luxurious, intimate, and memorable",
    },
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  await ensureSeedData();

  const categoryRows = await db
    .select({
      id: categories.id,
      nameFa: categories.nameFa,
      nameEn: categories.nameEn,
      sortOrder: categories.sortOrder,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.id));

  const itemRows = await db
    .select({
      id: menuItems.id,
      categoryId: menuItems.categoryId,
      nameFa: menuItems.nameFa,
      nameEn: menuItems.nameEn,
      descriptionFa: menuItems.descriptionFa,
      descriptionEn: menuItems.descriptionEn,
      price: menuItems.price,
      imageUrl: menuItems.imageUrl,
      isAvailable: menuItems.isAvailable,
      sortOrder: menuItems.sortOrder,
    })
    .from(menuItems)
    .orderBy(asc(menuItems.categoryId), asc(menuItems.sortOrder), asc(menuItems.id));

  const reservationRows = await db
    .select({
      id: reservations.id,
      name: reservations.name,
      phone: reservations.phone,
      date: reservations.date,
      time: reservations.time,
      guests: reservations.guests,
      status: reservations.status,
      notes: reservations.notes,
      createdAt: reservations.createdAt,
      updatedAt: reservations.updatedAt,
    })
    .from(reservations)
    .orderBy(desc(reservations.createdAt));

  const [siteInfoRow] = await db
    .select({
      id: siteInfo.id,
      hoursFa: siteInfo.hoursFa,
      hoursEn: siteInfo.hoursEn,
      phonePrimary: siteInfo.phonePrimary,
      phoneSecondary: siteInfo.phoneSecondary,
      addressFa: siteInfo.addressFa,
      addressEn: siteInfo.addressEn,
      instagramUrl: siteInfo.instagramUrl,
      instagramHandle: siteInfo.instagramHandle,
      mapsUrl: siteInfo.mapsUrl,
      taglineFa: siteInfo.taglineFa,
      taglineEn: siteInfo.taglineEn,
    })
    .from(siteInfo)
    .limit(1);

  return {
    heroImageUrl,
    categories: categoryRows,
    items: itemRows,
    reservations: reservationRows.map((reservation) => ({
      ...reservation,
      status: reservation.status as ReservationStatus,
      createdAt: reservation.createdAt ? reservation.createdAt.toISOString() : null,
      updatedAt: reservation.updatedAt ? reservation.updatedAt.toISOString() : null,
    })),
    siteInfo: siteInfoRow || {
      id: 0,
      hoursFa: "هر روز،  صبح تا ۱۱ شب",
      hoursEn: "Daily, 08:00 AM – 11:00 PM",
      phonePrimary: "021-22213868",
      phoneSecondary: "021-46044296",
      addressFa: "پونک، بلوار کمالی، پلاک ۲",
      addressEn: "No. 20, Kamali Blvd., Punak, Tehran",
      instagramUrl: "https://www.instagram.com/rupiyacafe/",
      instagramHandle: "@rupiyacafe",
      mapsUrl: "https://maps.app.goo.gl/mXeKZPBFkiPRyZER8",
      taglineFa: "لوکس، آرام و به‌یادماندنی",
      taglineEn: "Luxurious, intimate, and memorable",
    },
    databaseProvider: databaseProviderLabel,
  };
}
