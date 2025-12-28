"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/CategoryBadge";
import { CategoryModal } from "@/components/CategoryModal";
import { Tag, ArrowUpDown, Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { 
  getCategories, 
  getTransactions,
  deleteCategory as deleteCategoryService 
} from "@/lib/supabase/services";
import type { Category, Transaction } from "@/lib/supabase/models";
import { getIconByName } from "@/lib/icons";

export default function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [categoriesData, transactionsData] = await Promise.all([
          getCategories(),
          getTransactions(),
        ]);
        setCategories(categoriesData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error fetching categories:", error);
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
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error refetching categories:", error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    
    try {
      await deleteCategoryService(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Count transactions per category
  const getCategoryItemCount = (categoryId: string) => {
    return transactions.filter(t => t.category_id === categoryId).length;
  };

  // Find most used category
  const getMostUsedCategory = () => {
    if (categories.length === 0) return null;
    
    const counts = categories.map(cat => ({
      category: cat,
      count: getCategoryItemCount(cat.id),
    }));
    
    return counts.reduce((max, curr) => 
      curr.count > max.count ? curr : max, 
      counts[0]
    );
  };

  const mostUsed = getMostUsedCategory();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  const MostUsedIcon = mostUsed ? getIconByName(mostUsed.category.icon) : Tag;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organize suas transações por categorias
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 rounded-lg"
        >
          <Plus className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Nova categoria</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Categories */}
        <Card className="border border-border shadow-sm transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {categories.length}
                </p>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Total de Categorias
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card className="border border-border shadow-sm transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <ArrowUpDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {transactions.length}
                </p>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Total de Transações
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Most Used Category */}
        <Card className="border border-border shadow-sm transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              {mostUsed ? (
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-category-${mostUsed.category.color}-light`}>
                  <MostUsedIcon className={`h-5 w-5 text-category-${mostUsed.category.color}`} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <Tag className="h-5 w-5" />
                </div>
              )}
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mostUsed?.category.name || "—"}
                </p>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Categoria Mais Utilizada
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card className="border border-border shadow-sm">
          <CardContent className="p-12 text-center">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma categoria encontrada
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie sua primeira categoria para organizar suas transações.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova categoria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = getIconByName(category.icon);
            const itemCount = getCategoryItemCount(category.id);
            return (
              <Card 
                key={category.id} 
                className="border border-border shadow-sm hover:shadow-md transition-all"
              >
                <CardContent className="p-5">
                  {/* Icon and Actions Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center bg-category-${category.color}-light`}
                    >
                      <Icon
                        className={`h-5 w-5 text-category-${category.color}`}
                      />
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-light"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Category Name */}
                  <h3 className="font-semibold text-foreground mb-1">
                    {category.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                    {category.description || "Sem descrição"}
                  </p>

                  {/* Badge and Count */}
                  <div className="flex items-center justify-between">
                    <CategoryBadge name={category.name} color={category.color} />
                    <span className="text-sm text-muted-foreground">
                      {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CategoryModal open={isModalOpen} onOpenChange={handleModalChange} />
    </div>
  );
}
