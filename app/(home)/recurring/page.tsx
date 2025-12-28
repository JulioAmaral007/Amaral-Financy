"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecurringTransactionModal, RecurringTransactionFormData } from "@/components/RecurringTransactionModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Repeat,
  Calendar,
  Pause,
  Play,
  Trash2,
  Edit2,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getRecurringTransactions, 
  createRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
  getRecurringStats,
} from "@/lib/supabase/services";
import type { RecurringTransaction } from "@/lib/supabase/models";
import { frequencyLabels, FrequencyType } from "@/lib/supabase/models";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function RecurringTransactionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [stats, setStats] = useState({
    monthlyExpenses: 0,
    monthlyIncome: 0,
    activeInstallments: [] as RecurringTransaction[],
    totalActive: 0,
  });

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [recurringData, statsData] = await Promise.all([
          getRecurringTransactions(),
          getRecurringStats(),
        ]);
        setRecurringTransactions(recurringData);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching recurring transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refetch after modal closes
  const handleModalChange = async (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      try {
        const [recurringData, statsData] = await Promise.all([
          getRecurringTransactions(),
          getRecurringStats(),
        ]);
        setRecurringTransactions(recurringData);
        setStats(statsData);
      } catch (error) {
        console.error("Error refetching recurring transactions:", error);
      }
    }
  };

  const handleSubmit = async (data: RecurringTransactionFormData) => {
    try {
      await createRecurringTransaction({
        description: data.description,
        amount: data.amount,
        type: data.type,
        category_id: data.category_id,
        frequency: data.frequency,
        day_of_month: data.day_of_month,
        start_date: data.start_date,
        is_installment: data.is_installment,
        total_installments: data.total_installments,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating recurring transaction:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta recorrência?")) return;
    
    try {
      await deleteRecurringTransaction(id);
      setRecurringTransactions(prev => prev.filter(r => r.id !== id));
      toast.success("Recorrência excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting recurring transaction:", error);
      toast.error("Erro ao excluir recorrência.");
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await toggleRecurringTransaction(id, !currentStatus);
      setRecurringTransactions(prev => 
        prev.map(r => r.id === id ? updated : r)
      );
      toast.success(updated.is_active ? "Recorrência ativada!" : "Recorrência pausada!");
    } catch (error) {
      console.error("Error toggling recurring transaction:", error);
      toast.error("Erro ao alterar status da recorrência.");
    }
  };

  const filteredTransactions = recurringTransactions.filter((t) => {
    const matchesSearch = t.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" || t.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || 
      (statusFilter === "active" && t.is_active) ||
      (statusFilter === "paused" && !t.is_active) ||
      (statusFilter === "installment" && t.is_installment);
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate totals from current data
  const activeTransactions = recurringTransactions.filter(t => t.is_active);
  const totalMonthlyExpenses = activeTransactions
    .filter(t => t.type === "expense" && t.frequency === "monthly")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalMonthlyIncome = activeTransactions
    .filter(t => t.type === "income" && t.frequency === "monthly")
    .reduce((sum, t) => sum + t.amount, 0);
  const activeInstallments = activeTransactions.filter(t => t.is_installment);

  const formatNextDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Vencido";
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Amanhã";
    if (diffDays <= 7) return `Em ${diffDays} dias`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando recorrências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Repeat className="h-8 w-8 text-primary" />
            Recorrentes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas despesas e receitas recorrentes
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-brand-dark text-white shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova recorrência
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-light flex items-center justify-center">
                <ArrowDownCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Despesas Mensais</p>
                <p className="text-lg font-bold text-destructive">
                  {formatCurrency(totalMonthlyExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-light flex items-center justify-center">
                <ArrowUpCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Receitas Mensais</p>
                <p className="text-lg font-bold text-success">
                  {formatCurrency(totalMonthlyIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-light flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-base" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Parcelamentos</p>
                <p className="text-lg font-bold text-foreground">
                  {activeInstallments.length} ativos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-light flex items-center justify-center">
                <Repeat className="h-5 w-5 text-purple-base" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Ativas</p>
                <p className="text-lg font-bold text-foreground">
                  {activeTransactions.length} recorrências
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 border border-border shadow-sm transition-colors">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground">
                Buscar
              </label>
              <Input
                placeholder="Buscar por descrição"
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full"
              />
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground">
                Tipo
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-12 w-full bg-card border-border">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 w-full bg-card border-border">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="paused">Pausadas</SelectItem>
                  <SelectItem value="installment">Parcelamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recurring Transactions List */}
      <Card className="border border-border shadow-sm transition-colors">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Descrição
                  </th>
                  <th className="text-center p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Frequência
                  </th>
                  <th className="text-center p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Próximo
                  </th>
                  <th className="text-center p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Valor
                  </th>
                  <th className="text-center p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <Repeat className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Nenhuma recorrência encontrada
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Crie sua primeira transação recorrente para começar a automatizar suas finanças.
                      </p>
                      <Button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-brand-dark text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova recorrência
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className={cn(
                        "border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors",
                        !transaction.is_active && "opacity-60"
                      )}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              transaction.category 
                                ? `bg-category-${transaction.category.color}-light`
                                : "bg-muted"
                            }`}
                          >
                            {transaction.is_installment ? (
                              <CreditCard className={`h-5 w-5 ${
                                transaction.category 
                                  ? `text-category-${transaction.category.color}`
                                  : "text-muted-foreground"
                              }`} />
                            ) : (
                              <Repeat className={`h-5 w-5 ${
                                transaction.category 
                                  ? `text-category-${transaction.category.color}`
                                  : "text-muted-foreground"
                              }`} />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-foreground block">
                              {transaction.description}
                            </span>
                            {transaction.is_installment && (
                              <span className="text-xs text-muted-foreground">
                                Parcela {transaction.current_installment}/{transaction.total_installments}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {frequencyLabels[transaction.frequency as FrequencyType]}
                            {transaction.day_of_month && ` (dia ${transaction.day_of_month})`}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          "text-sm font-medium",
                          transaction.next_due_date 
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}>
                          {formatNextDate(transaction.next_due_date)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {transaction.is_active ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            <span className="text-xs font-medium text-success">Ativa</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Pausada</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={cn(
                            "font-semibold",
                            transaction.type === "income"
                              ? "text-success"
                              : "text-foreground"
                          )}
                        >
                          {transaction.type === "income" ? "+ " : "- "}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                            title={transaction.is_active ? "Pausar" : "Ativar"}
                            onClick={() => handleToggle(transaction.id, transaction.is_active)}
                          >
                            {transaction.is_active ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-red-light"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-green-light"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer info */}
          {filteredTransactions.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
              <span className="text-sm text-muted-foreground">
                {filteredTransactions.length} recorrência{filteredTransactions.length !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Saldo mensal:{" "}
                  <span className={cn(
                    "font-semibold",
                    totalMonthlyIncome - totalMonthlyExpenses >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {formatCurrency(totalMonthlyIncome - totalMonthlyExpenses)}
                  </span>
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RecurringTransactionModal 
        open={isModalOpen} 
        onOpenChange={handleModalChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
