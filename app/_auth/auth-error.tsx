export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-2xl bg-bad/10 px-3.5 py-2.5 text-[13.5px] text-bad">
      {children}
    </p>
  );
}

export const authLinkClass =
  "cursor-pointer text-[13px] font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink";
