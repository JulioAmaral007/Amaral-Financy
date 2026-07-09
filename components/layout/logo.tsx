import Image from "next/image";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizes = {
  xs: 26,
  sm: 36,
  md: 48,
  lg: 56,
};

/** The Rumo "R" monogram stamp tile (public/assets/rumo-monograma.png). */
export function Logo({ className, size = "md" }: LogoProps) {
  const px = sizes[size];

  return (
    <Image
      src="/assets/rumo-monograma.png"
      alt="Rumo"
      width={px}
      height={px}
      priority
      className={cn("-rotate-3 select-none", className)}
      style={{ width: px, height: px }}
    />
  );
}
