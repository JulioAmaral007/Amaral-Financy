import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizes = {
  xs: { box: "h-[26px] w-[26px] rounded-[8px]", text: "text-[13px]" },
  sm: { box: "h-9 w-9 rounded-[10px]", text: "text-base" },
  md: { box: "h-12 w-12 rounded-xl", text: "text-xl" },
  lg: { box: "h-14 w-14 rounded-xl", text: "text-2xl" },
};

export function Logo({ className, size = "md" }: LogoProps) {
  const current = sizes[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-primary font-extrabold text-primary-foreground",
        current.box,
        current.text,
        className
      )}
    >
      ÷
    </div>
  );
}
