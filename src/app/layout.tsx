import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/* Bricolage Grotesque — main font, bold neobrutalist feel */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QCC — Quezee & Learning Platform",
  description: "Aplikasi Edukasi & Gamifikasi QCC Seven Tools & 8 Steps",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${bricolage.variable} ${plusJakartaSans.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
