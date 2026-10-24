// Build de la demo con el prefijo de GitHub Pages (T-71): el mismo `npm run build`
// (exportación + CSP) con PAGES_BASE_PATH, movido a out-pages/. Es el artefacto que se
// prueba (playwright.prefijo.config.ts) y el que pages.yml publica, sin reconstruir.
// Va antes del build sin prefijo, que deja out/ para las demás pruebas, budget y lighthouse.
import { execSync } from "node:child_process";
import { renameSync, rmSync } from "node:fs";

const BASE_PATH = process.env.PAGES_BASE_PATH ?? "/green-banana-web";

execSync("npm run build", {
  stdio: "inherit",
  env: { ...process.env, PAGES_BASE_PATH: BASE_PATH },
});
rmSync("out-pages", { recursive: true, force: true });
renameSync("out", "out-pages");
console.log(`Build con prefijo ${BASE_PATH} en out-pages/`);
