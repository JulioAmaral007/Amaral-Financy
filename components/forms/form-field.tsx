import * as React from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-foreground/70">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-[13px] text-danger-soft">{error}</p>}
    </div>
  );
}
