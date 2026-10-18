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
  // Desactiva las reglas de estilo que chocan con Prettier.
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
