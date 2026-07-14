import type { Metadata } from "next";
import { Cormorant_Garamond, Vazirmatn } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RUPIYA Café | روپیا",
    template: "%s | RUPIYA Café",
  },
  description:
    "وب‌سایت رسمی RUPIYA Café برای مشاهده منو، ثبت درخواست رزرو و مدیریت آیتم‌ها از طریق داشبورد ادمین.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} ${cormorant.variable} antialiased`}>{children}</body>
    </html>
  );
}
