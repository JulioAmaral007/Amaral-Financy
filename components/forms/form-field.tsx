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
      <label
        htmlFor={htmlFor}
        className="mb-0.5 block text-[11px] font-normal uppercase tracking-[0.2em] text-ink-soft"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-[12.5px] text-red">!! {error}</p>}
    </div>
  );
}
