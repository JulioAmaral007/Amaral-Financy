"use client";

import { useRouter } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-[400px] rounded-[20px] border border-border/7 bg-surface p-9">
        <div className="mb-6 flex flex-col items-center">
          <Logo size="md" className="mb-3.5" />
          <h1 className="text-[19px] font-bold text-foreground">Divisão de Contas</h1>
          <p className="mt-1 text-[13px] text-foreground/50">
            Seus dados ficam salvos apenas neste navegador
          </p>
        </div>

        <Button className="w-full" onClick={() => router.push("/")}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
