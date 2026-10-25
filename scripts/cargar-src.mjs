// Permite importar módulos de src/ desde un script de Node (T-117), sin dependencias:
// resuelve el alias "@/" de tsconfig.json y carga los JSON importados sin atributo
// `with { type: "json" }`, como hace el bundler de Next. Node 24 ejecuta el TypeScript
// quitando los tipos. Uso: node --import ./scripts/cargar-src.mjs scripts/<script>.mjs
// (también desde otro directorio, con rutas absolutas).
// Revisión de T-121 (N-6 a): src/ se ubica desde este archivo (import.meta.url), no
// desde el directorio de trabajo, y con module.registerHooks(), que corre en el mismo
// hilo; los tipos de Node 24 marcan module.register() como obsoleto en su favor
// (registerHooks sigue marcado como experimental). Un "@/" que no existe falla con un
// mensaje que dice qué falta y quién lo importa.
import { existsSync, readFileSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = fileURLToPath(new URL("../src/", import.meta.url));

const esArchivo = (ruta) => existsSync(ruta) && statSync(ruta).isFile();

registerHooks({
  resolve(especificador, contexto, siguiente) {
    if (!especificador.startsWith("@/")) {
      return siguiente(especificador, contexto);
    }
    const base = join(SRC, especificador.slice(2));
    const archivo = [base, `${base}.ts`].find(esArchivo);
    if (!archivo) {
      throw new Error(
        `cargar-src: no existe «${especificador}» (se buscó ${base} y ${base}.ts), importado desde ${contexto.parentURL ?? "?"}`,
      );
    }
    return siguiente(pathToFileURL(archivo).href, contexto);
  },
  load(url, contexto, siguiente) {
    if (!url.startsWith("file:") || !url.endsWith(".json")) {
      return siguiente(url, contexto);
    }
    const ruta = fileURLToPath(url);
    const fuente = readFileSync(ruta, "utf8");
    try {
      JSON.parse(fuente);
    } catch (error) {
      throw new Error(`cargar-src: JSON inválido en ${ruta}: ${error.message}`);
    }
    return {
      format: "module",
      source: `export default ${fuente};`,
      shortCircuit: true,
    };
  },
});
