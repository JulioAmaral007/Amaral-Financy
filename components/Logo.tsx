import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
}

export function Logo({ className, size = "md", iconOnly = false }: LogoProps) {
  const sizes = {
    sm: { width: 120, height: 24 },
    md: { width: 150, height: 30 },
    lg: { width: 180, height: 36 },
  };

  const iconSizes = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 },
  };

  const currentSize = iconOnly ? iconSizes[size] : sizes[size];

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src={iconOnly ? "/assets/Logo_Icon.png" : "/assets/Logo.svg"}
        alt="Financy Logo"
        width={currentSize.width}
        height={currentSize.height}
        priority
      />
    </div>
  );
}
