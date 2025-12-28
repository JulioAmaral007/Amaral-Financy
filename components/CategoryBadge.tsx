import { cn } from "@/lib/utils";

type CategoryColor = "green" | "blue" | "purple" | "pink" | "red" | "orange" | "yellow";

interface CategoryBadgeProps {
  name: string;
  color: CategoryColor;
  className?: string;
}

const colorStyles: Record<CategoryColor, string> = {
  green: "bg-category-green-light text-category-green",
  blue: "bg-category-blue-light text-category-blue",
  purple: "bg-category-purple-light text-category-purple",
  pink: "bg-category-pink-light text-category-pink",
  red: "bg-category-red-light text-category-red",
  orange: "bg-category-orange-light text-category-orange",
  yellow: "bg-category-yellow-light text-category-yellow",
};

export function CategoryBadge({ name, color, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        colorStyles[color],
        className
      )}
    >
      {name}
    </span>
  );
}
