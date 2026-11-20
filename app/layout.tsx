import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Onest } from "next/font/google";

import { Toaster } from "@/components/feedback/toaster";
import { Header } from "@/components/layout/header";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f2f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1014" },
  ],
};

export const metadata: Metadata = {
  title: "Rumo",
  description: "Quem paga quanto em casa, mês a mês.",
  icons: {
    icon: [
      { url: "/assets/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/assets/favicon-256.png", sizes: "256x256", type: "image/png" },
    ],
    apple: { url: "/assets/favicon-256.png", sizes: "256x256", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `suppressHydrationWarning`: o script abaixo pode pôr `data-theme` no <html> antes de o React hidratar.
    <html lang="pt-BR" className={`${bricolage.variable} ${onest.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased">
        <div className="mx-auto min-h-screen max-w-[1120px] overflow-x-clip px-4 pb-24 sm:px-8 lg:pb-10">
          <Header />
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
