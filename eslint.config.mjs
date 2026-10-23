import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

// Configuración propia en lugar de eslint-config-next (T-49): su plugin
// @next/eslint-plugin-next traía fast-glob → micromatch → braces, con 5
// vulnerabilidades altas sin arreglo publicado (riesgo D-12). Se mantienen las
// mismas reglas base (TypeScript, React, Hooks, import) y se amplía accesibilidad
// a todo jsx-a11y recommended. Se pierden solo las reglas @next/next, que en un
// sitio estático sin <Script> ni pages/ casi no aplican.
// Restricciones de importación entre capas (ver los bloques de "Capas de src/").
const SOLO_CONTENT_TS = {
  group: ["@/content/*", "**/content/*.json"],
  message:
    "Los JSON de contenido solo se importan en src/lib/content.ts, que los valida. Usa @/lib/content.",
};
const NO_APP = {
  group: ["@/app/*", "**/app/*"],
  message: "Las capas inferiores no importan rutas de src/app/.",
};
const NO_COMPONENTS = {
  group: ["@/components/*", "**/components/*"],
  message: "src/lib/ es lógica sin React: no importa componentes.",
};

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    plugins: { import: importPlugin },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: "detect" } },
    rules: {
      // Las mismas que ajustaba eslint-config-next.
      "import/no-anonymous-default-export": "warn",
      "react/prop-types": "off",
      "react/no-unknown-property": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  },
  // Capas de src/ (spec/03-plan.md §4): app → components → lib → content, en un
  // solo sentido. En flat config, un bloque posterior reemplaza las restricciones
  // de uno anterior (no las suma), por eso cada bloque repite las que le aplican.
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [SOLO_CONTENT_TS] }],
    },
  },
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [SOLO_CONTENT_TS, NO_APP] },
      ],
    },
  },
  {
    files: ["src/components/cliente/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/content",
              message:
                "Un componente cliente no importa el contenido: viajaría todo en el JavaScript del navegador. Recíbelo por props desde un componente de servidor.",
            },
          ],
          patterns: [SOLO_CONTENT_TS, NO_APP],
        },
      ],
    },
  },
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    ignores: ["src/lib/content.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [SOLO_CONTENT_TS, NO_APP, NO_COMPONENTS] },
      ],
    },
  },
  {
    files: ["src/lib/content.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [NO_APP, NO_COMPONENTS] }],
    },
  },
  // "use client" solo en src/components/cliente/ (CLAUDE.md, JavaScript mínimo).
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/cliente/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Program > ExpressionStatement[directive='use client']",
          message:
            'Los componentes cliente viven en src/components/cliente/. Cada "use client" suma JavaScript a la carga inicial.',
        },
      ],
    },
  },
  // Desactiva las reglas de estilo que chocan con Prettier.
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
