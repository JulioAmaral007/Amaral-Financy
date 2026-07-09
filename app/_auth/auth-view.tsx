"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { AuthConfirmation } from "./auth-confirmation";
import { AuthSuccess } from "./auth-success";
import { ForgotPasswordForm } from "./forgot-password-form";
import { LoginForm } from "./login-form";
import { ResetPasswordForm } from "./reset-password-form";
import { SignupForm } from "./signup-form";

type AuthStep = "login" | "signup" | "forgot" | "sent" | "reset" | "success";

interface AuthViewProps {
  initialStep: "login" | "reset";
}

export function AuthView({ initialStep }: AuthViewProps) {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [sentEmail, setSentEmail] = useState("");
  const today = new Date().toLocaleDateString("pt-BR");

  const showTabs = step === "login" || step === "signup";

  function goToLogin() {
    router.replace("/login");
    setStep("login");
  }

  return (
    <div className="flex min-h-screen items-start justify-center px-6 py-16">
      <div className="w-full max-w-[430px] -rotate-[0.5deg]">
        <div className="paper-card px-[34px] pt-9 pb-8">
          <div className="mb-3 flex flex-col items-center border-b-[2.5px] border-ink pb-4 text-center">
            <Image
              src="/assets/rumo-carimbo-tinta.png"
              alt="Rumo — livro de contas da casa"
              width={140}
              height={140}
              priority
              className="h-[130px] w-[130px] select-none"
            />
          </div>

          <div className="mb-6 flex justify-between text-[11px] tracking-[0.12em] text-ink-faint">
            <span>COMPROVANTE DE ACESSO</span>
            <span suppressHydrationWarning>{today}</span>
          </div>

          {showTabs && (
            <div className="mb-[22px] mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setStep("login")}
                className={cn(
                  "flex-1 border-2 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer",
                  step === "login"
                    ? "border-ink bg-ink text-paper"
                    : "border-rule bg-transparent text-ink-soft hover:text-ink"
                )}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setStep("signup")}
                className={cn(
                  "flex-1 border-2 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer",
                  step === "signup"
                    ? "border-ink bg-ink text-paper"
                    : "border-rule bg-transparent text-ink-soft hover:text-ink"
                )}
              >
                Criar conta
              </button>
            </div>
          )}

          {step === "login" && <LoginForm onForgot={() => setStep("forgot")} />}

          {step === "signup" && (
            <SignupForm
              onNeedsConfirmation={(email) => {
                setSentEmail(email);
                setStep("sent");
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
              stamp="ENVIADO"
              title="Link enviado"
              description={`Se ${sentEmail} estiver cadastrado, você receberá um e-mail com instruções para redefinir sua senha.`}
              onBack={goToLogin}
            />
          )}

          {step === "reset" && <ResetPasswordForm onSuccess={() => setStep("success")} />}

          {step === "success" && <AuthSuccess onBackToLogin={goToLogin} />}

          <div className="mt-6 text-center text-[12px] tracking-[0.18em] text-ink-soft">
            * * * * * * * * * * * * * * *
          </div>
          <div className="mt-2 text-center text-[10.5px] tracking-[0.1em] text-ink-faint">
            © 2026 - DADOS SALVOS NESTE NAVEGADOR
          </div>
        </div>
      </div>
    </div>
  );
}
