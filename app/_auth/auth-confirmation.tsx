import { MailCheck } from "lucide-react";

import { authLinkClass } from "./auth-error";

interface AuthConfirmationProps {
  title: string;
  description: string;
  onBack: () => void;
}

export function AuthConfirmation({ title, description, onBack }: AuthConfirmationProps) {
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-good/10 text-good">
        <MailCheck className="h-6 w-6" />
      </span>
      <h1 className="mt-4 font-display text-[20px] font-bold tracking-[-0.02em] text-ink">{title}</h1>
      <p className="mb-5 mt-1.5 text-[14px] text-muted">{description}</p>
      <button type="button" onClick={onBack} className={authLinkClass}>
        Voltar para o login
      </button>
    </div>
  );
}
