"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        // Traduz mensagens de erro comuns do Supabase
        if (err.message.includes("Invalid login credentials")) {
          setError("E-mail ou senha incorretos");
        } else if (err.message.includes("Email not confirmed")) {
          setError("Por favor, confirme seu e-mail antes de fazer login");
        } else {
          setError(err.message);
        }
      } else {
        setError("Ocorreu um erro ao fazer login. Tente novamente.");
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
              <h1 className="text-2xl font-bold text-foreground">Fazer login</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Entre na sua conta para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Lembrar-me
                  </label>
                </div>
                <Link
                  href="/recuperar-senha"
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Recuperar senha
                </Link>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive text-center">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
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
                Ainda não tem uma conta?
              </p>
              <Button variant="outline" className="w-full h-12 text-base font-medium" size="lg" asChild>
                <Link href="/register">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Criar conta
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
