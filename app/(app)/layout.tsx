import { Header } from "@/components/layout/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-[1180px] px-8 py-11 sm:px-14">{children}</div>
    </div>
  );
}
