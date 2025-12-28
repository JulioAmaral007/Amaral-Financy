"use client";

import { useState, useEffect } from "react";
import { Plus, RotateCcw, Utensils, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryAddModal } from "@/components/InventoryAddModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  name: string;
  totalQuantity: number;
  currentQuantity: number;
  unit: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("financy-inventory");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load inventory", e);
      }
    }
    setMounted(true);
  }, []);

  // Save to local storage whenever items change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("financy-inventory", JSON.stringify(items));
    }
  }, [items, mounted]);

  const handleAddItem = (newItem: { name: string; totalQuantity: number; unit: string }) => {
    const item: InventoryItem = {
      id: crypto.randomUUID(),
      name: newItem.name,
      totalQuantity: newItem.totalQuantity,
      currentQuantity: newItem.totalQuantity,
      unit: newItem.unit,
    };
    setItems((prev) => [...prev, item]);
  };

  const handleConsume = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.currentQuantity - 1);
          return { ...item, currentQuantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleResetMonth = () => {
     setItems((prev) =>
      prev.map((item) => ({
        ...item,
        currentQuantity: item.totalQuantity,
      }))
    );
  };

  const handleDeleteItem = (id: string) => {
     if (confirm("Deseja remover este item do inventário?")) {
        setItems((prev) => prev.filter(item => item.id !== id));
     }
  }

  const getStatusColor = (current: number, total: number) => {
    const percentage = (current / total) * 100;
    if (percentage === 0) return "text-red-500";
    if (percentage <= 20) return "text-red-500";
    if (percentage <= 50) return "text-yellow-500";
    return "text-green-500";
  };
  
  const getProgressColor = (current: number, total: number) => {
      const percentage = (current / total) * 100;
      if (percentage <= 20) return "bg-red-500";
      if (percentage <= 50) return "bg-yellow-500";
      return "bg-green-500";
  }

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Utensils className="h-6 w-6 text-primary" />
              Inventário Mensal
            </h1>
            <p className="text-muted-foreground mt-1">
              Controle o consumo de alimentos e evite desperdícios.
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/10"
              onClick={() => setIsResetModalOpen(true)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar Mês
            </Button>
            <Button 
              className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Item
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed border-border">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Seu inventário está vazio</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Comece adicionando os alimentos que você comprou para o mês para acompanhar o consumo.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              Adicionar Primeiro Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const percentage = Math.min(100, Math.max(0, (item.currentQuantity / item.totalQuantity) * 100));
              const isLow = percentage <= 20 && percentage > 0;
              const isZero = percentage === 0;

              return (
                <div 
                  key={item.id} 
                  onContextMenu={(e) => { e.preventDefault(); handleDeleteItem(item.id); }}
                  className={cn(
                    "group relative bg-card rounded-2xl p-5 border transition-all duration-200 hover:shadow-md",
                    isZero ? "border-red-200 dark:border-red-900/30 opacity-80" : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={cn("font-semibold text-lg truncate pr-2", isZero ? "text-muted-foreground line-through" : "text-foreground")}>
                        {item.name}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground mt-1">
                        {item.totalQuantity} {item.unit} Total
                      </span>
                    </div>
                    <div className={cn("flex items-center justify-center w-8 h-8 rounded-full", 
                      isZero ? "bg-red-100 text-red-600 dark:bg-red-900/20" : 
                      isLow ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20" : 
                      "bg-green-100 text-green-600 dark:bg-green-900/20"
                    )}>
                      {isZero ? <AlertCircle className="h-4 w-4" /> : 
                       isLow ? <AlertCircle className="h-4 w-4" /> :
                       <CheckCircle2 className="h-4 w-4" />}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Restante</span>
                      <span className={cn("font-medium", getStatusColor(item.currentQuantity, item.totalQuantity))}>
                        {item.currentQuantity} {item.unit}
                      </span>
                    </div>
                    {/* Custom Progress Bar since shadcn might limit colors */}
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                            className={cn("h-full transition-all duration-500 ease-out", getProgressColor(item.currentQuantity, item.totalQuantity))} 
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                  </div>

                  <Button 
                    variant="secondary" 
                    className={cn(
                      "w-full font-medium transition-colors",
                      isZero 
                        ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground" 
                        : "hover:bg-primary hover:text-white"
                    )}
                    disabled={isZero}
                    onClick={() => handleConsume(item.id)}
                  >
                    {isZero ? "Esgotado" : "Consumir 1 Unidade"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <InventoryAddModal 
          open={isAddModalOpen} 
          onOpenChange={setIsAddModalOpen} 
          onSave={handleAddItem} 
        />
        
        <ConfirmModal 
            open={isResetModalOpen}
            onOpenChange={setIsResetModalOpen}
            title="Reiniciar Inventário?"
            description="Isso irá restaurar a quantidade restante de todos os itens para seus valores originais. Essa ação não pode ser desfeita."
            confirmText="Sim, Reiniciar"
            onConfirm={() => {
              handleResetMonth();
              setIsResetModalOpen(false);
            }}
            variant="destructive"
        />
    </div>
  );
}
