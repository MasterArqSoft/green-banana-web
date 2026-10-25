import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resuelve el alias "@/..." de tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    // Cobertura informativa (T-108, DR-05): `npm run test:coverage`, solo sobre la lógica
    // de src/lib/ y sin umbral. Sirve para ver ramas sin probar, no para exigir un
    // porcentaje; no forma parte de `validate`.
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      reporter: ["text-summary", "text", "html"],
      reportsDirectory: "coverage",
    },
  },
});
