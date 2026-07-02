import { CalculatorForm } from "./calculator-form";

export function CalculatorSection() {
  return (
    <section className="mb-16 border-t border-border/10 pt-11">
      <div className="mb-7">
        <h2 className="text-[30px] text-foreground">Calculadora</h2>
        <p className="mt-1 text-[13.5px] text-foreground/60">
          Divida a conta usando o salário 1 como prioritário
        </p>
      </div>
      <CalculatorForm />
    </section>
  );
}
