import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FormCraft — High-Conversion Conversational Form Engine",
  description:
    "Open-source conversational form engine with branching logic, real-time analytics, and zero response limits. Self-hosted on SQLite.",
  openGraph: {
    title: "FormCraft — High-Conversion Conversational Form Engine",
    description: "Build conversational forms people actually finish. Open-source, fast, and self-hosted.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
