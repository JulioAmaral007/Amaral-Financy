interface AuthConfirmationProps {
  stamp?: string;
  title: string;
  description: string;
  onBack: () => void;
}

export function AuthConfirmation({ stamp = "ENVIADO", title, description, onBack }: AuthConfirmationProps) {
  return (
    <div className="flex animate-fade-in flex-col items-center px-1 py-3 text-center">
      <div className="mt-1.5 inline-block -rotate-6 border-2 border-red px-2 py-0.5 text-[15px] font-bold uppercase tracking-[0.12em] text-red opacity-90">
        {stamp}
      </div>
      <div className="mb-2.5 mt-[18px] font-display text-[19px] text-ink">{title}</div>
      <p className="mb-[22px] text-[13px] leading-relaxed text-ink-soft">{description}</p>
      <button
        type="button"
        onClick={onBack}
        className="cursor-pointer text-[12px] text-ink-faint underline decoration-dotted underline-offset-[3px] hover:text-ink"
      >
        &lt;- voltar para o login
      </button>
    </div>
  );
}
