import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * As regras abaixo são a parte de `.claude/rules/standards.md` que uma máquina consegue verificar.
 * Se algo aqui falha, a política foi violada — não desabilite a regra, corrija o código.
 *
 * Projetos com `src/`: prefixe os globs de `repositories/` e `lib/` com `src/`.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message: "Sem enum. Use um objeto `as const` + `type X = typeof X[keyof typeof X]`.",
        },
        {
          selector: "TSQualifiedName[left.name='React'][right.name='FC']",
          message: "Sem React.FC. Declare `export function Component(props: Props)`.",
        },
      ],
    },
  },
]);

export default eslintConfig;
