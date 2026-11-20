import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AuthSuccessProps {
  onContinue: () => void;
}

export function AuthSuccess({ onContinue }: AuthSuccessProps) {
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-good/10 text-good">
        <CheckCircle2 className="h-6 w-6" />
      </span>
      <h1 className="mt-4 font-display text-[20px] font-bold tracking-[-0.02em] text-ink">Senha redefinida</h1>
      <p className="mb-5 mt-1.5 text-[14px] text-muted">Sua senha foi alterada. Use-a no próximo acesso.</p>
      <Button onClick={onContinue} className="w-full">
        Continuar
      </Button>
    </div>
  );
}
