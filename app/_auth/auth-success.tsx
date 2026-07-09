import { Button } from "@/components/ui/button";

interface AuthSuccessProps {
  onBackToLogin: () => void;
}

export function AuthSuccess({ onBackToLogin }: AuthSuccessProps) {
  return (
    <div className="flex animate-fade-in flex-col items-center px-1 py-3 text-center">
      <div className="mt-1.5 inline-block -rotate-6 border-2 border-red px-2 py-0.5 text-[15px] font-bold uppercase tracking-[0.12em] text-red opacity-90">
        CONFIRMADO
      </div>
      <div className="mb-2.5 mt-[18px] font-display text-[19px] text-ink">Senha redefinida</div>
      <p className="mb-[22px] text-[13px] leading-relaxed text-ink-soft">
        Sua senha foi alterada com sucesso. Use-a no seu próximo acesso.
      </p>
      <Button onClick={onBackToLogin} className="w-full">
        Ir para o login
      </Button>
    </div>
  );
}
