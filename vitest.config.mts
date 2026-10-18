import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resuelve el alias "@/..." de tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    include: ["tests/unit/**/*.test.ts"],
  },
});
