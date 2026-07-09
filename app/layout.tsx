import type { Metadata, Viewport } from "next";
import { Courier_Prime, Special_Elite } from "next/font/google";

import { Toaster } from "@/components/feedback/toaster";
import { Header } from "@/components/layout/header";
import * as accountService from "@/services/account.service";
import "./globals.css";

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-courier-prime",
});

const specialElite = Special_Elite({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-special-elite",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Rumo",
  description: "Divida contas, acompanhe sua carteira de investimentos e controle seu recebimento PJ em um só lugar.",
  icons: {
    icon: [
      { url: "/assets/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/assets/favicon-256.png", sizes: "256x256", type: "image/png" },
    ],
    apple: { url: "/assets/favicon-256.png", sizes: "256x256", type: "image/png" },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const account = await accountService.getAccountProfile();

  return (
    <html lang="pt-BR" className={`${courierPrime.variable} ${specialElite.variable}`}>
      <body className="antialiased">
        <div className="min-h-screen overflow-x-clip">
          <Header account={account} />
          <div className="mx-auto max-w-[1080px] overflow-x-clip px-4 py-8 sm:px-8 sm:py-12">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
