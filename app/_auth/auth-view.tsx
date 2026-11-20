"use client";

import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { AuthConfirmation } from "./auth-confirmation";
import { AuthSuccess } from "./auth-success";
import { ForgotPasswordForm } from "./forgot-password-form";
import { LoginForm } from "./login-form";
import { ResetPasswordForm } from "./reset-password-form";
import { SignupForm } from "./signup-form";

type AuthStep = "login" | "signup" | "forgot" | "sent" | "confirm-email" | "reset" | "success";

interface AuthViewProps {
  initialStep: "login" | "reset";
  /** O link do e-mail (callback) falhou ou expirou. */
  callbackFailed?: boolean;
}

const TITLES: Partial<Record<AuthStep, string>> = {
  login: "Entre para continuar",
  signup: "Crie sua conta",
};

export function AuthView({ initialStep, callbackFailed = false }: AuthViewProps) {
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [sentEmail, setSentEmail] = useState("");

  const showTabs = step === "login" || step === "signup";

  function goToLogin() {
    // Recarga completa: sai de `?step=reset` e descarta o estado dos formulários.
    window.location.assign("/login");
  }

  return (
    <main className="flex min-h-[calc(100svh-6rem)] flex-col items-center justify-center py-8 lg:min-h-[calc(100svh-2.5rem)]">
      <div className="absolute right-4 top-4 sm:right-8 sm:top-5">
        <ThemeToggle />
      </div>

      <div className="mb-6 flex items-center gap-2.5">
        <Logo className="h-8 w-8" />
        <span className="font-display text-[28px] font-bold tracking-[-0.03em] text-ink">rumo</span>
      </div>

      <Card className="w-full max-w-[420px] p-6 sm:p-8">
        {showTabs && (
          <div className="mb-5 flex gap-0.5 rounded-full bg-ink/5 p-1" role="tablist" aria-label="Acesso">
            {(["login", "signup"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={step === tab}
                onClick={() => setStep(tab)}
                className={cn(
                  "flex-1 cursor-pointer rounded-full py-2 text-[14px] font-semibold transition-all",
                  step === tab ? "bg-surface text-ink shadow-pill" : "text-muted hover:text-ink"
                )}
              >
                {tab === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>
        )}

        {showTabs && (
          <h1 className="mb-4 font-display text-[20px] font-bold tracking-[-0.02em] text-ink">{TITLES[step]}</h1>
        )}

        {step === "login" && (
          <LoginForm
            onForgot={() => setStep("forgot")}
            initialError={callbackFailed ? "O link expirou ou é inválido. Tente de novo." : undefined}
          />
        )}

        {step === "signup" && (
          <SignupForm
            onNeedsConfirmation={(email) => {
              setSentEmail(email);
              setStep("confirm-email");
            }}
          />
        )}

        {step === "forgot" && (
          <ForgotPasswordForm
            onSent={(email) => {
              setSentEmail(email);
              setStep("sent");
            }}
            onBack={() => setStep("login")}
          />
        )}

        {step === "sent" && (
          <AuthConfirmation
            title="Link enviado"
            description={`Se ${sentEmail} tiver uma conta, você vai receber um e-mail com as instruções para criar uma nova senha.`}
            onBack={goToLogin}
          />
        )}

        {step === "confirm-email" && (
          <AuthConfirmation
            title="Confirme seu e-mail"
            description={`Enviamos um link para ${sentEmail}. Clique nele para ativar a conta e entrar.`}
            onBack={goToLogin}
          />
        )}

        {step === "reset" && <ResetPasswordForm onSuccess={() => setStep("success")} />}

        {/* Quem redefine a senha já está logada pelo link do e-mail: segue direto para o app. */}
        {step === "success" && <AuthSuccess onContinue={() => window.location.assign("/")} />}
      </Card>

      <p className="mt-5 text-center text-[13px] text-muted">Seus dados ficam salvos na sua conta.</p>
    </main>
  );
}
