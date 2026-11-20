/**
 * Classes de cor de cada pessoa (salary1/2/3). Ficam como literais para o
 * Tailwind encontrá-las; os nomes exibidos continuam em `lib/people.ts`.
 */
export const PERSON_COLORS = {
  salary1: { dot: "bg-pai", text: "text-ink", segment: "bg-pai text-onyx" },
  salary2: { dot: "bg-thais", text: "text-thais", segment: "bg-thais text-on-thais" },
  salary3: { dot: "bg-julio", text: "text-julio", segment: "bg-julio text-onyx" },
} as const;

export type PersonKey = keyof typeof PERSON_COLORS;
