import { useState, useEffect } from "react";
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

interface InventoryAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: { name: string; totalQuantity: number; unit: string }) => void;
}

const units = [
  { value: "un", label: "Unidades" },
  { value: "kg", label: "Quilogramas (kg)" },
  { value: "g", label: "Gramas (g)" },
  { value: "l", label: "Litros (l)" },
  { value: "ml", label: "Mililitros (ml)" },
  { value: "pct", label: "Pacotes" },
  { value: "cx", label: "Caixas" },
];

export function InventoryAddModal({ open, onOpenChange, onSave }: InventoryAddModalProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("un");

  useEffect(() => {
    if (open) {
      setName("");
      setQuantity("");
      setUnit("un");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity) return;
    
    onSave({
      name,
      totalQuantity: Number(quantity),
      unit,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-card p-0 rounded-2xl overflow-hidden border-border">
        <div className="p-6 pb-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold text-foreground">Novo Alimento</DialogTitle>
            <p className="text-sm text-muted-foreground font-normal">
              Cadastre um item para o inventário do mês
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nome do Alimento</label>
            <Input
              placeholder="Ex. Arroz, Leite, Café"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 bg-muted border-border rounded-lg placeholder:text-muted-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Quantidade Total</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex. 5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="h-12 bg-muted border-border rounded-lg placeholder:text-muted-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Unidade</label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="h-12 bg-muted border-border rounded-lg focus:ring-1 focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-brand-dark hover:bg-brand-dark/90 text-white font-medium rounded-lg mt-2"
          >
            Adicionar ao Inventário
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
