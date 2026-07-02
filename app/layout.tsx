import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import { Toaster } from "@/components/feedback/toaster";
import { Header } from "@/components/layout/header";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Divisão de Contas",
  description: "Divida suas contas usando o salário 1 como prioritário",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={jetbrainsMono.variable}>
      <body className="antialiased">
        <div className="min-h-screen">
          <Header />
          <div className="mx-auto max-w-[1180px] px-8 py-11 sm:px-14">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
