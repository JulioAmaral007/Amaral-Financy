import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { TabBar } from "@/components/TabBar";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary transition-colors">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-5 lg:px-8 py-5 pb-24 md:pb-5">{children}</main>
      
      {/* Mobile TabBar */}
      <TabBar />
    </div>
  );
}
