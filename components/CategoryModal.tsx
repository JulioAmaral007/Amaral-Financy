import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Utensils,
  Wallet,
  Heart,
  ShoppingCart,
  Car,
  Gamepad2,
  Gift,
  Home,
  Briefcase,
  TrendingUp,
  GraduationCap,
  Plane,
  CreditCard,
  Building2,
  type LucideIcon,
} from "lucide-react";

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const icons: { icon: LucideIcon; name: string }[] = [
  { icon: Utensils, name: "utensils" },
  { icon: Wallet, name: "wallet" },
  { icon: Heart, name: "heart" },
  { icon: ShoppingCart, name: "cart" },
  { icon: Car, name: "car" },
  { icon: Gamepad2, name: "gamepad" },
  { icon: Gift, name: "gift" },
  { icon: Home, name: "home" },
  { icon: Briefcase, name: "briefcase" },
  { icon: TrendingUp, name: "trending" },
  { icon: GraduationCap, name: "education" },
  { icon: Plane, name: "travel" },
  { icon: CreditCard, name: "credit" },
  { icon: Building2, name: "building" },
];

const colors = [
  { name: "green", bg: "bg-green-base", value: "#16A34A" },
  { name: "blue", bg: "bg-blue-base", value: "#2563EB" },
  { name: "indigo", bg: "bg-[#4F46E5]", value: "#4F46E5" },
  { name: "purple", bg: "bg-purple-base", value: "#9333EA" },
  { name: "red", bg: "bg-red-base", value: "#DC2626" },
  { name: "orange", bg: "bg-orange-base", value: "#EA580C" },
  { name: "yellow", bg: "bg-yellow-base", value: "#CA8A04" },
];

export function CategoryModal({ open, onOpenChange }: CategoryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-card p-0 rounded-2xl overflow-hidden border-border">
        <div className="p-6 pb-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold text-foreground">Nova categoria</DialogTitle>
            <p className="text-sm text-muted-foreground font-normal">
              Organize suas transações com categorias
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Título</label>
            <Input
              placeholder="Ex. Alimentação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-12 bg-muted border-border rounded-lg placeholder:text-muted-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <Input
              placeholder="Descrição da categoria"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12 bg-muted border-border rounded-lg placeholder:text-muted-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground">Opcional</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Ícone</label>
            <div className="grid grid-cols-7 gap-2">
              {icons.map(({ icon: Icon, name }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  className={cn(
                    "h-10 w-10 rounded-lg border flex items-center justify-center transition-all",
                    selectedIcon === name
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground bg-card"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    selectedIcon === name ? "text-primary" : "text-muted-foreground"
                  )} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Cor</label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.name)}
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all",
                    color.bg,
                    selectedColor === color.name
                      ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                      : "hover:scale-105"
                  )}
                />
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-brand-dark hover:bg-brand-dark/90 text-white font-medium rounded-lg mt-2"
          >
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
