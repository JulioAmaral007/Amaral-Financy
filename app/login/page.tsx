import { AuthView } from "@/app/_auth/auth-view";

interface LoginPageProps {
  searchParams: Promise<{ step?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initialStep = params.step === "reset" ? "reset" : "login";
  const callbackFailed = params.error === "auth";

  return <AuthView initialStep={initialStep} callbackFailed={callbackFailed} />;
}
