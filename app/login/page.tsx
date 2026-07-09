import { AuthView } from "@/app/_auth/auth-view";

interface LoginPageProps {
  searchParams: Promise<{ step?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initialStep = params.step === "reset" ? "reset" : "login";

  return <AuthView initialStep={initialStep} />;
}
