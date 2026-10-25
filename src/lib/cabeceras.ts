// Cabeceras HTTP de seguridad del hosting de producción (T-115, DR-06, F-11, NFR-04).
// Fuente única: de aquí salen el `_headers` de Cloudflare Pages (o Workers con assets
// estáticos), el `staticwebapp.config.json` de Azure Static Web Apps, las cabeceras que
// emite el servidor de pruebas y lo que comprueba scripts/verificar-cabeceras.mjs. La CSP
// de cada página la arma cspPolicyCabecera() de csp.ts (los hashes cambian por página).
// R-08 (qué hosting) sigue abierto y lo decide el usuario: el build de producción exige
// elegir uno (HOSTING_PROVEEDOR) y publica solo su archivo; fuera de producción, sin
// elección, se generan los dos para probarlos en local. GitHub Pages no admite cabeceras
// propias (D-11): la demo sigue con la CSP por <meta>.
// Sin imports: lo carga Node desde los scripts y desde tests/e2e/server.mjs.

/**
 * Cabeceras comunes a toda respuesta (HTML, recursos y 404).
 * HSTS sin `preload` (difícil de revertir, DR-06) y sin `includeSubDomains`: obligaría a
 * HTTPS en todos los subdominios del dominio de RP-01, que aún no se conocen; se agrega
 * cuando se compruebe que todos sirven HTTPS (expediente de lanzamiento, F-11).
 * Referrer-Policy no puede ser no-referrer: OpenStreetMap lo prohíbe para las teselas
 * (NFR-04, FR-24).
 */
export const CABECERAS_COMUNES: Readonly<Record<string, string>> = {
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

export const CSP = "Content-Security-Policy";

/**
 * Política mínima para toda respuesta, también la 404 (N-6): solo prohíbe que otro sitio
 * la enmarque. La 404 no tiene ruta propia (se sirve en cualquier URL inexistente), así
 * que no puede llevar la CSP con hashes por ruta; la trae por <meta>, y por <meta>
 * frame-ancestors no tiene efecto. Si en una página coincide con su CSP completa, el
 * navegador aplica las dos; esta no restringe nada más, así que no se contradicen.
 */
export const CSP_TODA_RESPUESTA = "frame-ancestors 'none'";

/** CSP propia de cada ruta publicada (p. ej. "/terminos"). */
export type CspPorRuta = { ruta: string; csp: string }[];

// Límites documentados de Cloudflare para `_headers`: 100 reglas y 2000 caracteres por línea.
export const LIMITE_REGLAS_CLOUDFLARE = 100;
export const LIMITE_LINEA_CLOUDFLARE = 2000;

/** Proveedores contemplados en R-08 y el archivo de cabeceras de cada uno. */
export const ARCHIVO_PROVEEDOR = {
  cloudflare: "_headers",
  azure: "staticwebapp.config.json",
} as const;
export type Proveedor = keyof typeof ARCHIVO_PROVEEDOR;

/**
 * Proveedores cuyo archivo genera el build. Producción (SITE_ENV=production) exige
 * HOSTING_PROVEEDOR: así el artefacto no publica la configuración del otro proveedor, y
 * hasta R-08 el build de producción no puede salir sin una elección explícita. Fuera de
 * producción, sin elección, los dos (para probar cada variante en local).
 */
export function proveedoresDelBuild(
  env: Record<string, string | undefined>,
): Proveedor[] {
  const elegido = env.HOSTING_PROVEEDOR?.trim();
  if (elegido) {
    if (!Object.hasOwn(ARCHIVO_PROVEEDOR, elegido)) {
      throw new Error(
        `HOSTING_PROVEEDOR="${elegido}" no es válido: usa ${Object.keys(ARCHIVO_PROVEEDOR).join(" o ")}`,
      );
    }
    return [elegido as Proveedor];
  }
  if (env.SITE_ENV === "production") {
    throw new Error(
      "Build de producción sin HOSTING_PROVEEDOR (cloudflare o azure): elige el hosting (R-08) antes de publicar",
    );
  }
  return Object.keys(ARCHIVO_PROVEEDOR) as Proveedor[];
}

/**
 * `_headers` de Cloudflare: las comunes y la política mínima en "/*" y la CSP completa en
 * una regla exacta por página. Cloudflare une con coma una cabecera que aparece en dos
 * reglas: la página recibe las dos políticas, que el navegador aplica a la vez.
 */
export function archivoCloudflare(paginas: CspPorRuta): string {
  const reglas: [string, [string, string][]][] = [
    ["/*", [...Object.entries(CABECERAS_COMUNES), [CSP, CSP_TODA_RESPUESTA]]],
    ...paginas.map(({ ruta, csp }): [string, [string, string][]] => [
      ruta,
      [[CSP, csp]],
    ]),
  ];
  if (reglas.length > LIMITE_REGLAS_CLOUDFLARE) {
    throw new Error(
      `_headers: ${reglas.length} reglas (máximo ${LIMITE_REGLAS_CLOUDFLARE})`,
    );
  }
  const lineas = reglas.flatMap(([ruta, cabeceras]) => [
    ruta,
    ...cabeceras.map(([nombre, valor]) => `  ${nombre}: ${valor}`),
  ]);
  if (lineas.some((linea) => linea.length > LIMITE_LINEA_CLOUDFLARE)) {
    throw new Error(
      `_headers: una línea supera ${LIMITE_LINEA_CLOUDFLARE} caracteres`,
    );
  }
  return `${lineas.join("\n")}\n`;
}

export type ConfigAzure = {
  globalHeaders: Record<string, string>;
  routes: { route: string; headers: Record<string, string> }[];
  responseOverrides: Record<string, { rewrite: string }>;
};

/**
 * `staticwebapp.config.json` de Azure: comunes y política mínima en globalHeaders (toda
 * respuesta, también la 404) y la CSP completa por ruta, que según la documentación de
 * Azure sustituye a la global del mismo nombre. La 404 se reescribe a /404.html (con su
 * CSP completa por <meta>). Cómo combina Azure las cabeceras en el dominio real se
 * comprueba con scripts/verificar-cabeceras.mjs (F-11, tras R-08).
 */
export function archivoAzure(paginas: CspPorRuta): string {
  const config: ConfigAzure = {
    globalHeaders: { ...CABECERAS_COMUNES, [CSP]: CSP_TODA_RESPUESTA },
    routes: paginas.map(({ ruta, csp }) => ({
      route: ruta,
      headers: { [CSP]: csp },
    })),
    responseOverrides: { "404": { rewrite: "/404.html" } },
  };
  return `${JSON.stringify(config, null, 2)}\n`;
}

export type ReglaCloudflare = {
  ruta: string;
  cabeceras: Record<string, string>;
};

/** Reglas de un `_headers` (formato de Cloudflare), en orden. */
export function leerCloudflare(texto: string): ReglaCloudflare[] {
  const reglas: ReglaCloudflare[] = [];
  for (const linea of texto.split(/\r?\n/)) {
    if (!linea.trim() || linea.trimStart().startsWith("#")) continue;
    if (!/^\s/.test(linea)) {
      reglas.push({ ruta: linea.trim(), cabeceras: {} });
      continue;
    }
    const regla = reglas.at(-1);
    const separador = linea.indexOf(":");
    if (!regla || separador === -1) {
      throw new Error(`_headers: línea inválida «${linea}»`);
    }
    regla.cabeceras[linea.slice(0, separador).trim()] = linea
      .slice(separador + 1)
      .trim();
  }
  return reglas;
}

/**
 * Cabeceras que Cloudflare aplicaría a `ruta`: las de "/*" y las de la regla exacta; una
 * cabecera presente en las dos se une con coma, como documenta Cloudflare.
 */
export function cabecerasPara(
  reglas: ReglaCloudflare[],
  ruta: string,
): Record<string, string> {
  const resultado: Record<string, string> = {};
  for (const regla of reglas) {
    if (regla.ruta !== "/*" && regla.ruta !== ruta) continue;
    for (const [nombre, valor] of Object.entries(regla.cabeceras)) {
      resultado[nombre] =
        nombre in resultado ? `${resultado[nombre]}, ${valor}` : valor;
    }
  }
  return resultado;
}

/**
 * Cabeceras que Azure aplicaría a `ruta` según su documentación: las globales y, si hay
 * una ruta exacta, las suyas, que sustituyen a las globales del mismo nombre.
 */
export function cabecerasAzurePara(
  config: ConfigAzure,
  ruta: string,
): Record<string, string> {
  const propia = config.routes.find((r) => r.route === ruta);
  return { ...config.globalHeaders, ...propia?.headers };
}

/**
 * Ruta pública de un HTML de out/ ("en/terms.html" → "/en/terms"). La 404 y la interna
 * de Next (_not-found) no tienen: no son rutas que se pidan por su nombre.
 */
export function rutaDeHtml(archivo: string): string | null {
  const limpio = archivo.replaceAll("\\", "/").replace(/\.html$/, "");
  if (limpio === "404" || limpio === "_not-found") return null;
  if (limpio === "index") return "/";
  return `/${limpio.replace(/\/index$/, "")}`;
}

/** Contenido de la CSP por <meta> de un HTML, o null si no la tiene. */
export function cspDeMeta(html: string): string | null {
  return (
    html.match(
      /<meta http-equiv="Content-Security-Policy" content="([^"]*)"/i,
    )?.[1] ?? null
  );
}

/** Políticas de un valor de CSP: varias cabeceras llegan unidas con coma. */
export function politicasCsp(valor: string): string[] {
  return valor
    .split(",")
    .map((politica) => politica.trim())
    .filter(Boolean);
}

const directiva = (politica: string, nombre: string) =>
  politica
    .split(";")
    .map((d) => d.trim())
    .find((d) => d === nombre || d.startsWith(`${nombre} `));

export type TipoRespuesta = "html" | "recurso" | "404";

/**
 * Problemas de las cabeceras de una respuesta (los nombres no distinguen mayúsculas).
 * Lo que se exige a cada tipo:
 * - toda respuesta: las comunes; ninguna política con 'unsafe-inline' ni 'unsafe-eval'
 *   en script-src;
 * - página HTML: CSP por cabecera con frame-ancestors 'none' y la política completa
 *   (con script-src) por cabecera;
 * - 404: CSP por cabecera con frame-ancestors 'none' (la <meta> no lo sustituye) y la
 *   política completa por cabecera o por <meta> (`metaCsp`, la de su cuerpo);
 * - recurso (JS, CSS, imágenes): las comunes; la CSP no se exige.
 */
export function revisarCabeceras(
  recibidas: Record<string, string>,
  tipo: TipoRespuesta,
  { metaCsp = null }: { metaCsp?: string | null } = {},
): string[] {
  const valor = (nombre: string) =>
    Object.entries(recibidas).find(
      ([clave]) => clave.toLowerCase() === nombre.toLowerCase(),
    )?.[1];
  const problemas: string[] = [];
  for (const [nombre, esperado] of Object.entries(CABECERAS_COMUNES)) {
    const recibido = valor(nombre);
    if (recibido === undefined) problemas.push(`falta ${nombre}`);
    else if (recibido !== esperado) {
      problemas.push(`${nombre}: «${recibido}» en vez de «${esperado}»`);
    }
  }
  const cabecera = valor(CSP);
  const politicas = cabecera === undefined ? [] : politicasCsp(cabecera);
  const inseguras = [...politicas, ...(metaCsp ? [metaCsp] : [])].some(
    (politica) =>
      /'unsafe-(inline|eval)'/.test(directiva(politica, "script-src") ?? ""),
  );
  if (inseguras) {
    problemas.push(`${CSP}: script-src con 'unsafe-inline' o 'unsafe-eval'`);
  }
  if (tipo === "recurso") return problemas;
  if (cabecera === undefined) return [...problemas, `falta ${CSP}`];
  if (
    !politicas.some(
      (p) => directiva(p, "frame-ancestors") === CSP_TODA_RESPUESTA,
    )
  ) {
    problemas.push(`${CSP} sin frame-ancestors 'none'`);
  }
  const completa = (p: string) => directiva(p, "script-src") !== undefined;
  if (tipo === "html" && !politicas.some(completa)) {
    problemas.push(`${CSP} por cabecera sin la política completa (script-src)`);
  }
  if (
    tipo === "404" &&
    !politicas.some(completa) &&
    !(metaCsp && completa(metaCsp))
  ) {
    problemas.push(
      `${CSP}: sin política completa (script-src) por cabecera ni por <meta>`,
    );
  }
  return problemas;
}
