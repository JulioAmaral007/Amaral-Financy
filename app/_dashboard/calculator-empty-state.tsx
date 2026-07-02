export function CalculatorEmptyState() {
  return (
    <div className="flex flex-col items-center px-2 py-5 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/12 font-serif text-[22px] font-bold italic text-primary-soft">
        i
      </div>
      <p className="mb-4 text-[17px] font-bold text-foreground">Como Funciona</p>
      <div className="w-full space-y-3 text-left">
        <div className="flex gap-2.5 text-[13.5px] leading-relaxed text-foreground/75">
          <span className="shrink-0 font-bold text-primary-soft">1.</span>
          <span>O Salário 1 paga a conta inteira até seu limite</span>
        </div>
        <div className="flex gap-2.5 text-[13.5px] leading-relaxed text-foreground/75">
          <span className="shrink-0 font-bold text-primary-soft">2.</span>
          <span>Se a conta exceder, o restante é dividido proporcionalmente entre Salário 2 e 3</span>
        </div>
      </div>
      <p className="mt-5 text-[12.5px] text-primary-soft">
        Preencha os valores e clique em &quot;Calcular&quot;
      </p>
    </div>
  );
}
