"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  RotateCcw, 
  Tags, 
  Calculator, 
  Utensils 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dash", icon: LayoutDashboard },
  { href: "/transactions", label: "Trans.", icon: ArrowLeftRight },
  { href: "/recurring", label: "Recorr.", icon: RotateCcw },
  { href: "/categories", label: "Categ.", icon: Tags },
  { href: "/bill-split", label: "Divisão", icon: Calculator },
  { href: "/inventory", label: "Inv.", icon: Utensils },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
      <nav className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-current/10")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
