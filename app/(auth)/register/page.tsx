"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, User, LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      await signUp(email, password, name);
      setSuccess(true);
      // Aguarda um pouco e redireciona para login
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        // Traduz mensagens de erro comuns do Supabase
        if (err.message.includes("already registered")) {
          setError("Este e-mail já está cadastrado");
        } else if (err.message.includes("Password should be")) {
          setError("A senha deve ter no mínimo 6 caracteres");
        } else if (err.message.includes("Invalid email")) {
          setError("E-mail inválido");
        } else {
          setError(err.message);
        }
      } else {
        setError("Ocorreu um erro ao criar a conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary transition-colors animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>

        <Card className="border border-border shadow-sm rounded-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Comece a controlar suas finanças ainda hoje
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Nome completo
                </label>
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  icon={User}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  E-mail
                </label>
                <Input
                  type="email"
                  placeholder="mail@exemplo.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Senha
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  icon={Lock}
                  iconRight={showPassword ? EyeOff : Eye}
                  onIconRightClick={() => setShowPassword(!showPassword)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  A senha deve ter no mínimo 8 caracteres
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive text-center">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-light border border-success/20">
                <p className="text-sm text-success text-center">
                  Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro. Redirecionando...
                </p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium" 
                size="lg"
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Cadastrar"
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground">ou</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Já tem uma conta?
              </p>
              <Button variant="outline" className="w-full h-12 text-base font-medium" size="lg" asChild>
                <Link href="/login">
                  <LogIn className="h-5 w-5 mr-2" />
                  Fazer login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
