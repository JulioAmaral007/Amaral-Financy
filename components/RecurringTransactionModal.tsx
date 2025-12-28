"use client";

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
import { Switch } from "@/components/ui/switch";
import { 
  CircleMinus,
  CirclePlus, 
  Repeat,
  Calendar as CalendarIcon,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";
import { FrequencyType, frequencyLabels, dayOfWeekLabels } from "@/lib/supabase/models";

interface RecurringTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: RecurringTransactionFormData) => void;
  initialData?: Partial<RecurringTransactionFormData>;
}

export interface RecurringTransactionFormData {
  description: string;
  amount: number;
  type: "income" | "expense" | "investment";
  category_id: string;
  frequency: FrequencyType;
  day_of_month?: number;
  day_of_week?: number;
  start_date: string;
  end_date?: string;
  is_installment: boolean;
  total_installments?: number;
}

export function RecurringTransactionModal({ 
  open, 
  onOpenChange,
  onSubmit,
  initialData,
}: RecurringTransactionModalProps) {
  const [type, setType] = useState<"expense" | "income" | "investment">(initialData?.type || "expense");
  const [description, setDescription] = useState(initialData?.description || "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [category, setCategory] = useState(initialData?.category_id || "");
  const [frequency, setFrequency] = useState<FrequencyType>(initialData?.frequency || "monthly");
  const [dayOfMonth, setDayOfMonth] = useState(initialData?.day_of_month?.toString() || "");
  const [dayOfWeek, setDayOfWeek] = useState(initialData?.day_of_week?.toString() || "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.start_date ? new Date(initialData.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.end_date ? new Date(initialData.end_date) : undefined
  );
  const [isInstallment, setIsInstallment] = useState(initialData?.is_installment || false);
  const [totalInstallments, setTotalInstallments] = useState(initialData?.total_installments?.toString() || "");
  const [hasEndDate, setHasEndDate] = useState(!!initialData?.end_date);

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

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      if (!initialData) {
        setType("expense");
        setDescription("");
        setAmount("");
        setCategory("");
        setFrequency("monthly");
        setDayOfMonth("");
        setDayOfWeek("");
        setDayOfMonth("");
        setDayOfWeek("");
        setStartDate(undefined);
        setEndDate(undefined);
        setIsInstallment(false);
        setTotalInstallments("");
        setHasEndDate(false);
      }
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: RecurringTransactionFormData = {
      description,
      amount: parseFloat(amount),
      type: type === "investment" ? "expense" : type,
      category_id: category,
      frequency,
      start_date: startDate ? startDate.toISOString() : new Date().toISOString(),
      is_installment: isInstallment,
    };

    if (frequency === "monthly" && dayOfMonth) {
      data.day_of_month = parseInt(dayOfMonth);
    }
    
    if (frequency === "weekly" && dayOfWeek) {
      data.day_of_week = parseInt(dayOfWeek);
    }

    if (hasEndDate && endDate) {
      data.end_date = endDate.toISOString();
    }

    if (isInstallment && totalInstallments) {
      data.total_installments = parseInt(totalInstallments);
    }

    onSubmit?.(data);
    toast.success(initialData ? "Recorrência atualizada com sucesso!" : "Recorrência criada com sucesso!");
    onOpenChange(false);
  };

  // Generate days of month options
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card p-0 rounded-2xl overflow-hidden border-border max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Repeat className="h-5 w-5 text-primary" />
              {initialData ? "Editar recorrência" : "Nova recorrência"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground font-normal">
              {isInstallment 
                ? "Configure o parcelamento da transação" 
                : "Configure sua despesa ou receita recorrente"}
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Type Toggle */}
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

          {/* Recurrence Type Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Parcelamento</p>
                <p className="text-xs text-muted-foreground">Dividir em parcelas fixas</p>
              </div>
            </div>
            <Switch 
              checked={isInstallment} 
              onCheckedChange={setIsInstallment}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <Input
              placeholder="Ex. Aluguel, Streaming, Cartão de crédito"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="h-12 bg-muted border-border rounded-lg placeholder:text-muted-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Amount and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {isInstallment ? "Valor da parcela" : "Valor"}
              </label>
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
                        <cat.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Installment Options */}
          {isInstallment && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Número de parcelas</label>
                <Input
                  type="number"
                  placeholder="12"
                  value={totalInstallments}
                  onChange={(e) => setTotalInstallments(e.target.value)}
                  required={isInstallment}
                  min="2"
                  max="72"
                  className="h-12 bg-muted border-border rounded-lg placeholder:text-muted-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Valor total</label>
                <div className="h-12 px-3 flex items-center bg-muted/50 border border-border rounded-lg text-muted-foreground">
                  {amount && totalInstallments 
                    ? `R$ ${(parseFloat(amount) * parseInt(totalInstallments)).toFixed(2)}`
                    : "R$ 0,00"
                  }
                </div>
              </div>
            </div>
          )}

          {/* Frequency */}
          {!isInstallment && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Frequência</label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as FrequencyType)} required>
                <SelectTrigger className="h-12 bg-muted border-border rounded-lg focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-lg shadow-lg">
                  {(Object.keys(frequencyLabels) as FrequencyType[]).map((freq) => (
                    <SelectItem key={freq} value={freq} className="hover:bg-muted">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{frequencyLabels[freq]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Day of Month (for monthly) */}
          {(frequency === "monthly" || isInstallment) && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Dia do vencimento</label>
              <Select value={dayOfMonth} onValueChange={setDayOfMonth} required>
                <SelectTrigger className="h-12 bg-muted border-border rounded-lg focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-lg shadow-lg max-h-[200px]">
                  {daysOfMonth.map((day) => (
                    <SelectItem key={day} value={day.toString()} className="hover:bg-muted">
                      Dia {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Day of Week (for weekly) */}
          {frequency === "weekly" && !isInstallment && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Dia da semana</label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek} required>
                <SelectTrigger className="h-12 bg-muted border-border rounded-lg focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-lg shadow-lg">
                  {Object.entries(dayOfWeekLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="hover:bg-muted">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {isInstallment ? "Data da primeira parcela" : "Data de início"}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal bg-muted border-border rounded-lg hover:bg-muted/80 shadow-none border",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date Toggle (for non-installments) */}
          {!isInstallment && (
            <>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-orange-base" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Data de término</p>
                    <p className="text-xs text-muted-foreground">Definir quando a recorrência encerra</p>
                  </div>
                </div>
                <Switch 
                  checked={hasEndDate} 
                  onCheckedChange={setHasEndDate}
                />
              </div>

              {hasEndDate && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Data de término</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal bg-muted border-border rounded-lg hover:bg-muted/80 shadow-none border",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        locale={ptBR}
                        fromDate={startDate} // Disable dates before start date
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </>
          )}

          {/* Summary */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Resumo</p>
            <p className="text-sm text-foreground">
              {isInstallment ? (
                <>
                  <span className="font-semibold">{totalInstallments || "?"} parcelas</span> de{" "}
                  <span className={cn("font-semibold", type === "expense" ? "text-destructive" : "text-success")}>
                    R$ {amount || "0,00"}
                  </span>
                  {dayOfMonth && ` todo dia ${dayOfMonth}`}
                </>
              ) : (
                <>
                  <span className={cn("font-semibold", type === "expense" ? "text-destructive" : "text-success")}>
                    R$ {amount || "0,00"}
                  </span>
                  {" "}{frequencyLabels[frequency].toLowerCase()}
                  {frequency === "monthly" && dayOfMonth && ` no dia ${dayOfMonth}`}
                  {frequency === "weekly" && dayOfWeek && ` às ${dayOfWeekLabels[parseInt(dayOfWeek)]}s`}
                  {hasEndDate && endDate && ` até ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}`}
                  {!hasEndDate && " sem data de término"}
                </>
              )}
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-brand-dark hover:bg-brand-dark/90 text-white font-medium rounded-lg mt-2"
          >
            {initialData ? "Salvar alterações" : "Criar recorrência"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
