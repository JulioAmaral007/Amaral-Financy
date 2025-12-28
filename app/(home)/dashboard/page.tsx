"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionModal } from "@/components/TransactionModal";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  Eye,
  EyeOff,
  Download,
  PiggyBank,
  Loader2,
} from "lucide-react";
import {
  getTransactions,
  getTotalBalance as fetchTotalBalance,
  getCategoryTotals as fetchCategoryTotals,
} from "@/lib/supabase/services";
import type { Transaction, Category } from "@/lib/supabase/models";
import { getIconByName } from "@/lib/icons";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<{ category: Category; total: number }[]>([]);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [transactionsData, balance, catTotals] = await Promise.all([
          getTransactions({ limit: 10 }),
          fetchTotalBalance(),
          fetchCategoryTotals({ type: "expense" }),
        ]);
        setTransactions(transactionsData);
        setTotalBalance(balance);
        setCategoryTotals(catTotals.slice(0, 4));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculando totais para o gráfico
  const totalIncome = useMemo(() => 
    transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  
  const totalExpenses = useMemo(() =>
    transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  
  // Calcula total investido a partir da categoria "Investimento"
  const totalInvested = useMemo(() => {
    const investmentCategory = categoryTotals.find(
      c => c.category.name.toLowerCase().includes("investimento")
    );
    // Se não encontrar na categoria de despesas, busca nas transações
    if (investmentCategory) {
      return investmentCategory.total;
    }
    // Fallback: buscar transações com categoria de investimento
    return transactions
      .filter(t => t.category?.name.toLowerCase().includes("investimento"))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, categoryTotals]);

  const total = totalIncome + totalExpenses + totalInvested || 1;
  const incomePercentage = Math.round((totalIncome / total) * 100);
  const expensePercentage = Math.round((totalExpenses / total) * 100);
  const investedPercentage = Math.round((totalInvested / total) * 100);

  // Dados para o gráfico de donut
  const chartData = useMemo(() => [
    { name: "Ganhos", value: totalIncome || 1, fill: "#22c55e" },
    { name: "Gastos", value: totalExpenses || 1, fill: "#ef4444" },
    { name: "Investimentos", value: totalInvested || 1, fill: "#f59e0b" },
  ], [totalIncome, totalExpenses, totalInvested]);

  // Configuração do chart para shadcn/ui
  const chartConfig: ChartConfig = {
    ganhos: {
      label: "Ganhos",
      color: "#22c55e",
    },
    gastos: {
      label: "Gastos",
      color: "#ef4444",
    },
    investimentos: {
      label: "Investimentos",
      color: "#f59e0b",
    },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Layout principal em grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal (2/3) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Card de Saldo Principal */}
          <Card className="border border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">Saldo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-4xl font-bold text-foreground">
                      {showBalance ? formatCurrency(totalBalance) : "••••••"}
                    </p>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showBalance ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  className="bg-success hover:bg-success/90 text-white font-medium"
                  onClick={() => setIsModalOpen(true)}
                >
                  Adicionar Transação
                  <Download className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Investido, Receita e Despesas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card Investido */}
            <Card className="border border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <PiggyBank className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">Investido</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalInvested)}
                </p>
              </CardContent>
            </Card>

            {/* Card Receita */}
            <Card className="border border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-xs text-muted-foreground">Receita</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalIncome)}
                </p>
              </CardContent>
            </Card>

            {/* Card Despesas */}
            <Card className="border border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <ArrowDownCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <span className="text-xs text-muted-foreground">Despesas</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalExpenses)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Donut e Gastos por Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de Donut */}
            <Card className="border border-border bg-card">
              <CardContent className="p-6">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square h-[200px]"
                >
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                {/* Legenda */}
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowUpCircle className="h-4 w-4 text-success" />
                      <span className="text-sm text-muted-foreground">Ganhos</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{incomePercentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowDownCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-muted-foreground">Gastos</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{expensePercentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-muted-foreground">Investimentos</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{investedPercentage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gastos por Categoria */}
            <Card className="border border-border bg-card">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-foreground mb-6">
                  Gastos por categoria
                </h3>

                <div className="space-y-5">
                  {categoryTotals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma despesa registrada
                    </p>
                  ) : (
                    categoryTotals.map(({ category, total }) => {
                      const percentage = totalExpenses > 0 
                        ? Math.round((total / totalExpenses) * 100) 
                        : 0;
                      return (
                        <div key={category.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-foreground">{category.name}</span>
                            <span className="text-sm text-muted-foreground">{percentage}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-success rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(total)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar de Transações (1/3) */}
        <div className="lg:col-span-1">
          <Card className="border border-border bg-card h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-foreground">Transações</h3>
                <Link
                  href="/transactions"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1 bg-muted rounded-md"
                >
                  Ver mais
                </Link>
              </div>

              <div className="space-y-1">
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma transação registrada
                  </p>
                ) : (
                  transactions.map((transaction) => {
                    const Icon = transaction.category 
                      ? getIconByName(transaction.category.icon)
                      : Wallet;
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              transaction.type === "income"
                                ? "bg-green-500/20"
                                : "bg-muted"
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 ${
                                transaction.type === "income"
                                  ? "text-success"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-sm font-semibold ${
                            transaction.type === "income"
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <TransactionModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
