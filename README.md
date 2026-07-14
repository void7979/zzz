# RUPIYA Café - وب‌سایت کافه رستوران

وب‌سایت رسمی RUPIYA Café با پنل مدیریت کامل، طراحی لوکس و آماده استقرار روی Vercel.

## ✨ ویژگی‌ها

### سایت عمومی (فارسی/انگلیسی)
- صفحه اصلی با طراحی لوکس و تم تیره
- منوی کامل با دسته‌بندی و فیلتر
- فرم رزرو آنلاین
- بخش موقعیت مکانی و تماس
- سوییچر زبان (فارسی/انگلیسی)
- کاملاً واکنش‌گرا (Responsive)

### پنل مدیریت (`/admin`)
- مدیریت دسته‌بندی‌های منو (افزودن/ویرایش/حذف/مرتب‌سازی)
- مدیریت آیتم‌های منو (با آپلود تصویر و جست‌وجو)
- مدیریت رزروها (تغییر وضعیت، یادداشت، حذف)
- ویرایش اطلاعات سایت (ساعات کاری، تماس، نشانی)
- امنیت حساب (تغییر نام کاربری و رمز عبور)
- ورود پیش‌فرض: `admin` / `rupiya123`

### فنی
- **Next.js 16** با App Router
- **TypeScript** کامل
- **PostgreSQL** (Neon-ready)
- **Drizzle ORM**
- طراحی با **Tailwind CSS**
- بدون وابستگی به CDN خارجی (همه تصاویر محلی)

---

## 🚀 استقرار روی Vercel (بدون دردسر)

### مرحله ۱: ساخت دیتابیس Neon

1. به [neon.tech](https://neon.tech) بروید و ثبت‌نام کنید
2. یک پروژه جدید بسازید
3. از بخش **Connection Details**، آدرس اتصال را کپی کنید (شامل نام کاربری، رمز و نام دیتابیس)

مثال:
```
postgresql://user:password@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### مرحله ۲: آپلود پروژه روی GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

**مهم:** فایل `.env` در `.gitignore` است و آپلود نمی‌شود (امنیت!).

### مرحله ۳: استقرار روی Vercel

1. به [vercel.com](https://vercel.com) بروید
2. روی **Add New Project** کلیک کنید
3. مخزن GitHub خود را انتخاب کنید
4. در صفحه **Configure Project**، متغیرهای محیطی زیر را اضافه کنید:

| Name | Value |
|------|-------|
| `DATABASE_URL` | آدرس اتصال Neon از مرحله ۱ |
| `ADMIN_SESSION_SECRET` | یک رشته تصادفی (با `openssl rand -hex 32` بسازید) |
| `SETUP_SECRET` | یک رشته تصادفی برای محافظت از endpoint راه‌اندازی (مثلاً `my-secret-setup-token-123`) |

5. روی **Deploy** کلیک کنید

### مرحله ۴: راه‌اندازی دیتابیس (فقط یک بار)

بعد از استقرار، یک بار endpoint راه‌اندازی را صدا بزنید تا جداول ساخته و داده‌های اولیه ثبت شوند:

```bash
curl -X POST https://your-domain.vercel.app/api/setup \
  -H "Authorization: Bearer my-secret-setup-token-123"
```

جای `your-domain.vercel.app` دامنه Vercel خود را بگذارید.

پاسخ موفق:
```json
{
  "ok": true,
  "steps": [
    {
      "name": "create-tables",
      "ok": true,
      "message": "جدول‌های زیر ساخته شدند: categories، menu_items، reservations، site_info، admins."
    },
    {
      "name": "seed-data",
      "ok": true,
      "message": "داده‌های اولیه با موفقیت ثبت شدند."
    }
  ]
}
```

### مرحله ۵: ورود به پنل مدیریت

به آدرس زیر بروید:
```
https://your-domain.vercel.app/admin/login
```

- **نام کاربری:** `admin`
- **رمز عبور:** `rupiya123`

**مهم:** پس از اولین ورود، از تب **امنیت حساب** رمز عبور را تغییر دهید.

---

## 🛠 توسعه محلی

### نیازمندی‌ها
- Node.js 18+
- PostgreSQL (محلی یا Neon)

### راه‌اندازی

```bash
# ۱. نصب وابستگی‌ها
npm install

# ۲. ساخت فایل .env
cp .env.example .env

# ۳. ویرایش .env و اضافه کردن DATABASE_URL
# برای PostgreSQL محلی:
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
ADMIN_SESSION_SECRET=your-secret-here
SETUP_SECRET=your-setup-secret-here

# ۴. ساخت دیتابیس (اگر محلی کار می‌کنید)
createdb app_db

# ۵. اعمال اسکیمای دیتابیس
npx drizzle-kit push

# ۶. اجرای حالت توسعه
npm run dev
```

پروژه روی `http://localhost:3000` در دسترس است.

---

## 📁 ساختار پروژه

```
/
├── public/
│   ├── brand/              # لوگوی برند
│   │   └── rupiya-logo.png
│   └── images/             # تصاویر سایت
│       ├── menu/           # تصاویر آیتم‌های منو
│       ├── rupiya-*.jpg    # تصاویر فضای داخلی
├── src/
│   ├── app/
│   │   ├── [locale]/       # صفحات عمومی (فا/انگلیسی)
│   │   ├── admin/          # پنل مدیریت
│   │   └── api/            # APIها
│   │       ├── admin/      # APIهای مدیریت
│   │       ├── reservations/
│   │       └── setup/      # راه‌اندازی اولیه
│   ├── components/
│   │   ├── admin-dashboard.tsx
│   │   ├── public-interactive.tsx
│   │   └── public-site-shell.tsx
│   ├── db/
│   │   ├── index.ts        # اتصال دیتابیس
│   │   └── schema.ts       # جداول
│   ── lib/
│       ├── auth.ts         # احراز هویت
│       ├── brand.ts        # دارایی‌های برند
│       ├── data.ts         # داده‌ها و seed
│       ├── i18n.ts         # چندزبانه
│       └── reservations.ts # وضعیت رزرو
├── .env.example            # قالب env
├── .gitignore
── vercel.json             # تنظیمات Vercel
└── README.md
```

---

## 🔐 امنیت

- رمزهای عبور با **bcrypt** هش می‌شوند
- سشن‌ها با **HMAC** امضا می‌شوند
- endpoint راه‌اندازی با `SETUP_SECRET` محافظت می‌شود
- پنل مدیریت با cookie-based auth
- پسورد پیش‌فرض را حتماً تغییر دهید!

---

##  متغیرهای محیطی

| متغیر | توضیح | الزامی |
|------|------|--------|
| `DATABASE_URL` | آدرس اتصال PostgreSQL یا Neon | ✅ |
| `ADMIN_SESSION_SECRET` | کلید امضای سشن ادمین (با `openssl rand -hex 32` بسازید) | ✅ |
| `SETUP_SECRET` | کلید محافظت از endpoint راه‌اندازی | ✅ |

---

##  اسکریپت‌های npm

```bash
npm run dev          # اجرای حالت توسعه
npm run build        # بیلد production
npm run start        # اجرای production
npm run lint         # بررسی ESLint
npm run typecheck    # بررسی TypeScript
```

---

## 🎨 طراحی

- **تم:** لوکس، تیره، مشکی/زرشکی/پسته‌ای/طلایی
- **فونت:** Vazirmatn (فارسی)، Cormorant Garamond (انگلیسی)
- **تصاویر:** همه محلی (بدون وابستگی به CDN خارجی)

---

##  مشکلات رایج

### خطای "DATABASE_URL is required"
مطمئن شوید فایل `.env` وجود دارد و `DATABASE_URL` در آن تنظیم شده است.

### خطای اتصال به دیتابیس
- برای Neon، مطمئن شوید آدرس شامل `?sslmode=require` است
- کد به‌صورت خودکار SSL را برای دامنه‌های `neon.tech` فعال می‌کند

### پنل مدیریت لود نمی‌شود
endpoint راه‌اندازی را صدا بزنید (مرحله ۴ بالا) تا جداول ساخته شوند.

### آپلود تصویر کار نمی‌کند
در production روی Vercel، آپلود مستقیم فایل در دسترس نیست. از آدرس URL تصویر استفاده کنید (Cloudinary، Imgur، یا هر سرویس میزبانی تصویر).

---

## 📞 پشتیبانی

برای مشکلات فنی یا سؤالات، به مستندات پروژه مراجعه کنید.

---

## 📄 مجوز

تمام حقوق برای RUPIYA Café محفوظ است.
