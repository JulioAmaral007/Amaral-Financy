import { useState, useEffect } from "react";
import { toast } from "sonner";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, CircleMinus, CirclePlus, TrendingUp, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { createTransaction } from "@/lib/supabase/services";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getCategories } from "@/lib/supabase/services";
import type { Category } from "@/lib/supabase/models";
import { cn } from "@/lib/utils";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionModal({ open, onOpenChange }: TransactionModalProps) {
  const [type, setType] = useState<"expense" | "income" | "investment">("expense");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to determine type based on category name
  const getCategoryType = (name: string): "income" | "expense" | 'investment' => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("investimento")) return "investment";
    const incomeKeywords = ["salário", "freelance", "renda", "venda", "depósito", "prêmio", "receita"];
    return incomeKeywords.some(k => lowerName.includes(k)) ? "income" : "expense";
  };

  // Handle category selection and auto-set type
  const handleCategoryChange = (categoryId: string) => {
    setCategory(categoryId);
    const selectedCategory = categories.find(c => c.id === categoryId);
    if (selectedCategory) {
      setType(getCategoryType(selectedCategory.name));
    }
  };

  // Fetch categories when modal opens
  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        try {
          const data = await getCategories();
          setCategories(data);
        } catch (error) {
          console.error("Error fetching categories:", error);
          toast.error("Erro ao carregar categorias");
        }
      };
      
      fetchCategories();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error("Selecione uma data");
      return;
    }

    try {
      setIsLoading(true);
      await createTransaction({
        description,
        amount: parseFloat(amount),
        type: type === "investment" ? "expense" : type,
        category_id: category,
        date: date.toISOString(),
      });
      
      let successMessage = "Despesa adicionada com sucesso!";
      if (type === "income") successMessage = "Receita adicionada com sucesso!";
      if (type === "investment") successMessage = "Investimento adicionado com sucesso!";
      
      toast.success(successMessage);
      
      // Reset form
      setDescription("");
      setAmount("");
      setCategory("");
      setDate(undefined);
      setType("expense");
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Erro ao criar transação.");
    } finally {
      setIsLoading(false);
    }
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
          {/* Type Display (Read-only) */}
          <div className="flex border border-border rounded-lg overflow-hidden opacity-80 cursor-not-allowed">
            <div
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all",
                type === "expense"
                  ? "bg-card text-foreground border-r border-border"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <CircleMinus className={cn(
                "h-4 w-4",
                type === "expense" ? "text-danger" : "text-muted-foreground"
              )} />
              Despesa
            </div>
            <div
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all",
                type === "income"
                  ? "bg-card text-foreground border-r border-border"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <CirclePlus className={cn(
                "h-4 w-4",
                type === "income" ? "text-success" : "text-muted-foreground"
              )} />
              Receita
            </div>
            <div
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all",
                type === "investment"
                  ? "bg-card text-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <TrendingUp className={cn(
                "h-4 w-4",
                type === "investment" ? "text-amber-500" : "text-muted-foreground"
              )} />
              Investimento
            </div>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-12 justify-start text-left font-normal bg-muted border-border rounded-lg hover:bg-muted/80 shadow-none border",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
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
            <Select value={category} onValueChange={handleCategoryChange} required>
              <SelectTrigger className="h-12 bg-muted border-border rounded-lg text-muted-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-lg shadow-lg">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="hover:bg-muted">
                    <div className="flex items-center gap-2">
                      {/* We could add icon logic here later if needed, but for now just name */}
                      <span className="text-foreground">{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 bg-brand-dark hover:bg-brand-dark/90 text-white font-medium rounded-lg mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
