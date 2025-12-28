import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CircleMinus, CirclePlus } from "lucide-react";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionModal({ open, onOpenChange }: TransactionModalProps) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-card p-0 rounded-2xl overflow-hidden border-border">
        <div className="p-6 pb-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold text-foreground">Nova transação</DialogTitle>
            <p className="text-sm text-muted-foreground font-normal">
              Registre sua despesa ou receita
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Type Toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all",
                type === "expense"
                  ? "bg-card text-foreground border-r border-border"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <CircleMinus className={cn(
                "h-4 w-4",
                type === "expense" ? "text-danger" : "text-muted-foreground"
              )} />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all",
                type === "income"
                  ? "bg-card text-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <CirclePlus className={cn(
                "h-4 w-4",
                type === "income" ? "text-success" : "text-muted-foreground"
              )} />
              Receita
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <Input
              placeholder="Ex. Almoço no restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="h-12 bg-muted border-border rounded-lg placeholder:text-muted-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Data</label>
              <Input
                type="date"
                placeholder="Selecione"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-12 bg-muted border-border rounded-lg text-muted-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary [&::-webkit-calendar-picker-indicator]:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  R$
                </span>
                <Input
                  type="number"
                  placeholder="0,00"
                  className="h-12 pl-10 bg-muted border-border rounded-lg placeholder:text-muted-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Categoria</label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="h-12 bg-muted border-border rounded-lg text-muted-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-lg shadow-lg">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <cat.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
