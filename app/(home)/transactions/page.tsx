"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryBadge } from "@/components/CategoryBadge";
import { TransactionModal } from "@/components/TransactionModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  Search,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { 
  getTransactions, 
  getCategories,
  deleteTransaction as deleteTransactionService 
} from "@/lib/supabase/services";
import type { Transaction, Category } from "@/lib/supabase/models";
import { getIconByName } from "@/lib/icons";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const itemsPerPage = 10;

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      // Don't necessarily strictly set isLoading to true here to avoid full page flash on small updates
      // or handle it gracefully. For now, let's keep the initial load logic separate or check if we want spinner.
      const [transactionsData, categoriesData] = await Promise.all([
        getTransactions(),
        getCategories(),
      ]);
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refetch after modal closes (in case a new transaction was added)
  const handleModalChange = async (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      await fetchData();
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteTransactionService(deleteId);
      await fetchData(); // Reload data from server
      toast.success("Transação excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Erro ao excluir transação.");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" || t.type === typeFilter;
    const matchesCategory =
      categoryFilter === "all" || t.category_id === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando transações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as suas transações financeiras
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-brand-dark text-white shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova transação
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-5 border border-border shadow-sm transition-colors">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground mb-5">
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
                  <SelectItem value="investment">Investimentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground">
                Categoria
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-12 w-full bg-card border-border">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground">
                Período
              </label>
              <Select defaultValue="all">
                <SelectTrigger className="h-12 w-full bg-card border-border">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="this-month">Este mês</SelectItem>
                  <SelectItem value="last-month">Mês passado</SelectItem>
                  <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
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
                    Data
                  </th>
                  <th className="text-center p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Categoria
                  </th>
                  <th className="text-center p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tipo
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
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Nenhuma transação encontrada
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction) => {
                    const Icon = transaction.category 
                      ? getIconByName(transaction.category.icon)
                      : null;
                    return (
                      <tr
                        key={transaction.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            {Icon && transaction.category && (
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center bg-category-${transaction.category.color}-light`}
                              >
                                <Icon
                                  className={`h-5 w-5 text-category-${transaction.category.color}`}
                                />
                              </div>
                            )}
                            <span className="font-medium text-foreground">
                              {transaction.description}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center">
                            {transaction.category && (
                              <CategoryBadge
                                name={transaction.category.name}
                                color={transaction.category.color}
                              />
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {transaction.type === "income" ? (
                              <>
                                <div className="w-5 h-5 rounded-full bg-green-light flex items-center justify-center">
                                  <ArrowUpCircle className="h-3.5 w-3.5 text-success" />
                                </div>
                                <span className="text-success text-sm font-medium">
                                  Entrada
                                </span>
                              </>
                            ) : transaction.type === "investment" ? (
                              <>
                                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                                  <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                                </div>
                                <span className="text-amber-500 text-sm font-medium">
                                  Investimento
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="w-5 h-5 rounded-full bg-red-light flex items-center justify-center">
                                  <ArrowDownCircle className="h-3.5 w-3.5 text-destructive" />
                                </div>
                                <span className="text-destructive text-sm font-medium">
                                  Saída
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span
                            className={`font-semibold ${
                              transaction.type === "income"
                                ? "text-success"
                                : transaction.type === "investment"
                                  ? "text-amber-500"
                                  : "text-foreground"
                            }`}
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
                              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-red-light"
                              onClick={() => handleDeleteClick(transaction.id)}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
            <span className="text-sm text-muted-foreground">
              {filteredTransactions.length > 0 ? (
                <>
                  {(currentPage - 1) * itemsPerPage + 1} a{" "}
                  {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} |{" "}
                  {filteredTransactions.length} resultados
                </>
              ) : (
                "0 resultados"
              )}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 border border-border"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "ghost"}
                    size="icon"
                    className={`h-9 w-9 ${
                      page === currentPage 
                        ? "bg-primary text-white" 
                        : "border border-border hover:bg-muted"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 border border-border"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      
      <ConfirmModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Tem certeza absoluta?"
        description="Essa ação não pode ser desfeita. Isso excluirá permanentemente a transação e removerá os dados de nossos servidores."
        confirmText="Excluir"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      <TransactionModal open={isModalOpen} onOpenChange={handleModalChange} />
    </div>
  );
}
