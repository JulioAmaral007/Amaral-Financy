"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import { getProfile, updateProfile } from "@/lib/supabase/services";
import type { Profile } from "@/lib/supabase/models";

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;
      
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        setIsLoading(true);
        const profileData = await getProfile();
        setProfile(profileData);
        setName(profileData?.full_name || user.user_metadata?.full_name || "");
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Erro ao carregar perfil");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, router]);

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const updatedProfile = await updateProfile({ full_name: name });
      setProfile(updatedProfile);
      setSuccess("Perfil atualizado com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao atualizar perfil. Tente novamente.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Erro ao sair da conta");
    }
  };

  // Show loading state
  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] animate-fade-in py-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const displayName = name || user?.user_metadata?.full_name || "Usuário";
  const email = user?.email || "";

  return (
    <div className="flex justify-center animate-fade-in py-8">
      <Card className="w-full max-w-lg shadow-sm border border-border transition-colors">
        <CardContent className="p-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarFallback className="bg-muted-foreground text-primary-foreground text-xl font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-6" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nome completo
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 border-border rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="pl-10 h-12 border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-light border border-success/20">
                <p className="text-sm text-success text-center">{success}</p>
              </div>
            )}

            <div className="pt-2 space-y-3">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium rounded-lg"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base font-medium rounded-lg border-border text-foreground hover:bg-muted"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2 text-red-500" />
                Sair da conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

