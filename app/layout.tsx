import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { SITE_CONFIG } from "@/lib/config/siteConfig";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: `${SITE_CONFIG.farmName} — Pigeon Farm Management ERP`,
  description:
    "Comprehensive Pigeon Farm Management ERP for genealogy, pedigree, breeding performance, feed stock, health schedules, and farm finances.",
  manifest: "/manifest.webmanifest",
  applicationName: "Himel Agro ERP",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Himel Agro",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased h-full`}
        suppressHydrationWarning
      >
        <PwaProvider>
          <AppShell>{children}</AppShell>
        </PwaProvider>
      </body>
    </html>
  );
}
