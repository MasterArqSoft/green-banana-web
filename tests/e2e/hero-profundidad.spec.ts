import type { Page } from "@playwright/test";
import { esRenderizadorSoftware } from "../../src/lib/parallax";
import { expect, test } from "./fixtures";

// Efecto de profundidad de la foto del hero (components/cliente/HeroProfundidad.tsx).
// La foto es el contenido y el LCP; el lienzo WebGL es una mejora que llega después.
// `data-efecto` del contenedor: "foto" (sin efecto), "activo" o "fallo"; con el efecto
// activo, `data-parallax` es "reposo" o "movimiento".
// El efecto solo se activa con GPU: con WebGL por software (Chromium headless usa
// SwiftShader, también en CI) se queda la foto. Las pruebas del efecto activo se omiten
// ahí con su motivo y corren donde hay GPU (WebKit y Firefox locales, o Chromium con
// --use-angle); la alternativa se prueba en todos.

const contenedor = (page: Page) => page.locator("#hero [data-efecto]");
const foto = (page: Page) => page.locator("#hero img");

// WebGL con GPU en un OffscreenCanvas: lo que necesitan profundidad-webgl.ts y su
// worker. Es una predicción desde la página, válida en Chromium y Firefox (donde corren
// las pruebas del efecto activo). No sirve para el WebKit de Linux (CI): da WebGL en la
// página («Apple GPU», nombre enmascarado) pero no en el OffscreenCanvas del worker, y
// el efecto vuelve a la foto con data-motivo «sin WebGL en OffscreenCanvas». La prueba
// de humo por eso no predice: espera a que el efecto decida (efectoDecidido).
const hayGpu = (page: Page) =>
  page
    .evaluate(() => {
      if (
        !("transferControlToOffscreen" in HTMLCanvasElement.prototype) ||
        typeof OffscreenCanvas !== "function"
      )
        return null;
      const gl = new OffscreenCanvas(1, 1).getContext("webgl");
      if (!gl) return null;
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      return String(
        gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER),
      );
    })
    .then((r) => r !== null && !esRenderizadorSoftware(r));
const SIN_GPU =
  "sin GPU, sin WebGL o sin OffscreenCanvas: el efecto no se activa";

// Motivos de fallo que son límites del entorno (el navegador no puede), no errores del
// efecto: un error del shader, una excepción o una capa que no carga hacen fallar.
const MOTIVO_DEL_ENTORNO =
  /^(sin WebGL en OffscreenCanvas|renderizador por software|sin OffscreenCanvas)/;

// Espera a que el efecto se active o vuelva a la foto; true si se activó.
async function efectoDecidido(page: Page) {
  await expect(contenedor(page)).toHaveAttribute(
    "data-efecto",
    /^(activo|fallo)$/,
    { timeout: 10_000 },
  );
  return (await contenedor(page).getAttribute("data-efecto")) === "activo";
}

// Fracción de píxeles que cambian de forma apreciable entre dos capturas (en el navegador).
const fraccionDistinta = (page: Page, a: Buffer, b: Buffer) =>
  page.evaluate(
    async ([x, y]) => {
      const cargar = (src: string) =>
        new Promise<HTMLImageElement>((ok) => {
          const i = new Image();
          i.onload = () => ok(i);
          i.src = src;
        });
      const [ia, ib] = await Promise.all([cargar(x), cargar(y)]);
      const c = document.createElement("canvas");
      c.width = ia.width;
      c.height = ia.height;
      const g = c.getContext("2d")!;
      g.drawImage(ia, 0, 0);
      const da = g.getImageData(0, 0, c.width, c.height).data;
      g.drawImage(ib, 0, 0);
      const db = g.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 0; i < da.length; i += 4)
        if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) > 12) n++;
      return n / (da.length / 4);
    },
    [
      `data:image/png;base64,${a.toString("base64")}`,
      `data:image/png;base64,${b.toString("base64")}`,
    ],
  );

// Desplazamiento de cada zona (px CSS) entre dos capturas del hero a escala CSS, en el
// navegador: búsqueda exhaustiva de ±16 px del menor error absoluto medio en gris, con
// ajuste parabólico al subpíxel en cada eje. `error` es el error medio que queda: bajo
// si la zona solo se trasladó, alto si se deformó. Zonas en fracciones (x, y, ancho, alto).
const desplazamientos = <Z extends string>(
  page: Page,
  a: Buffer,
  b: Buffer,
  zonas: Record<Z, number[]>,
) =>
  page.evaluate(
    async ([x, y, zs]) => {
      const cargar = (src: string) =>
        new Promise<HTMLImageElement>((ok) => {
          const i = new Image();
          i.onload = () => ok(i);
          i.src = src;
        });
      const [ia, ib] = await Promise.all([cargar(x), cargar(y)]);
      const W = ia.width;
      const H = ia.height;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const g = c.getContext("2d", { willReadFrequently: true })!;
      const gris = (i: HTMLImageElement) => {
        g.drawImage(i, 0, 0);
        const d = g.getImageData(0, 0, W, H).data;
        const v = new Float32Array(W * H);
        for (let k = 0; k < v.length; k++)
          v[k] = 0.299 * d[k * 4] + 0.587 * d[k * 4 + 1] + 0.114 * d[k * 4 + 2];
        return v;
      };
      const A = gris(ia);
      const B = gris(ib);
      const R = 16;
      const salida: Record<string, { x: number; y: number; error: number }> =
        {};
      for (const [nombre, [fx, fy, fw, fh]] of Object.entries(
        zs as Record<string, number[]>,
      )) {
        const x0 = Math.max(R, Math.round(fx * W));
        const y0 = Math.max(R, Math.round(fy * H));
        const x1 = Math.min(W - R, Math.round((fx + fw) * W));
        const y1 = Math.min(H - R, Math.round((fy + fh) * H));
        const n = (x1 - x0) * (y1 - y0);
        const err = (dx: number, dy: number) => {
          let t = 0;
          for (let j = y0; j < y1; j++)
            for (let i = x0; i < x1; i++)
              t += Math.abs(A[j * W + i] - B[(j + dy) * W + i + dx]);
          return t / n;
        };
        let mejor = { dx: 0, dy: 0, e: Infinity };
        for (let dy = -R; dy <= R; dy++)
          for (let dx = -R; dx <= R; dx++) {
            const e = err(dx, dy);
            if (e < mejor.e) mejor = { dx, dy, e };
          }
        const { dx, dy, e } = mejor;
        const fino = (m: number, c0: number, p: number) => {
          const den = m - 2 * c0 + p;
          return den > 0
            ? Math.max(-0.5, Math.min(0.5, (m - p) / (2 * den)))
            : 0;
        };
        // El contenido se ve en `posición + desplazamiento`: B(p + d) ≈ A(p).
        salida[nombre] = {
          x:
            dx +
            (Math.abs(dx) < R ? fino(err(dx - 1, dy), e, err(dx + 1, dy)) : 0),
          y:
            dy +
            (Math.abs(dy) < R ? fino(err(dx, dy - 1), e, err(dx, dy + 1)) : 0),
          error: e,
        };
      }
      return salida as Record<Z, { x: number; y: number; error: number }>;
    },
    [
      `data:image/png;base64,${a.toString("base64")}`,
      `data:image/png;base64,${b.toString("base64")}`,
      zonas,
    ] as const,
  );

async function esperarActivo(page: Page) {
  await expect(contenedor(page)).toHaveAttribute("data-efecto", "activo", {
    timeout: 10_000,
  });
  await expect(contenedor(page)).toHaveAttribute("data-parallax", "reposo");
  // Al activarse la foto no cambia: el lienzo espera oculto al primer movimiento.
  await expect(page.locator("#hero canvas")).toHaveCSS("visibility", "hidden");
}

// Primer gesto (el lienzo aparece con el primer cuadro en movimiento y se queda) y vuelta
// al reposo: desde aquí las capturas en reposo son del lienzo.
async function primerGesto(page: Page) {
  const hero = contenedor(page);
  const caja = (await hero.boundingBox())!;
  await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
  await page.mouse.move(caja.x + caja.width * 0.7, caja.y + caja.height / 2, {
    steps: 3,
  });
  await expect(page.locator("#hero canvas")).toHaveCSS("visibility", "visible");
  await page.mouse.move(1, 1);
  await expect(hero).toHaveAttribute("data-parallax", "reposo");
}

// Proporción interna del lienzo: 1 con la foto móvil (cuadrada) y 1,6 con la de escritorio.
const proporcionLienzo = (page: Page) =>
  page
    .locator("#hero canvas")
    .evaluate((c: HTMLCanvasElement) => +(c.width / c.height).toFixed(1))
    .catch(() => 0);

for (const ruta of ["/", "/en"]) {
  test(`${ruta}: la foto del hero no espera al efecto y el efecto no deja errores @smoke`, async ({
    page,
  }) => {
    const errores: string[] = [];
    page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
    await page.goto(ruta);
    // La foto sigue siendo el LCP: prioridad alta, sin lazy y con su texto alternativo.
    await expect(foto(page)).toHaveAttribute("fetchpriority", "high");
    await expect(foto(page)).not.toHaveAttribute("loading", "lazy");
    await expect(foto(page)).toHaveAttribute("alt", /.+/);
    await expect(foto(page)).toBeVisible();
    if (await efectoDecidido(page)) {
      await esperarActivo(page);
      const lienzo = page.locator("#hero canvas");
      await expect(lienzo).toHaveAttribute("aria-hidden", "true");
      // Mismo tamaño que la caja visible de la foto: sin saltos al aparecer.
      const [a, b] = await Promise.all([
        contenedor(page).boundingBox(),
        lienzo.boundingBox(),
      ]);
      expect(b).toEqual(a);
    } else {
      // Vuelve a la foto solo por un límite del navegador, nunca por un error propio.
      await expect(contenedor(page)).toHaveAttribute(
        "data-motivo",
        MOTIVO_DEL_ENTORNO,
      );
      await expect(page.locator("#hero canvas")).toHaveCount(0);
    }
    expect(errores).toEqual([]);
  });
}

// La foto es la que se ve hasta el primer gesto: activarse no cambia ningún píxel (el
// lienzo en reposo no coincide exactamente con el <img> en los contornos; ver
// profundidad-webgl.ts).
test("al activarse el efecto la foto no cambia", async ({ page }) => {
  await page.goto("/");
  test.skip(!(await hayGpu(page)), SIN_GPU);
  const hero = contenedor(page);
  await expect(foto(page)).toBeVisible();
  await hero.scrollIntoViewIfNeeded();
  const antes = await hero.screenshot();
  await esperarActivo(page);
  expect((await hero.screenshot()).equals(antes)).toBe(true);
});

test.describe("con el efecto activo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    test.skip(!(await hayGpu(page)), SIN_GPU);
    await esperarActivo(page);
  });

  test("el cursor desplaza la imagen y al salir vuelve al reposo", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "el cursor es de escritorio; el móvil usa el arrastre");
    const hero = contenedor(page);
    const caja = (await hero.boundingBox())!;
    await primerGesto(page);
    const reposo = await hero.screenshot();
    await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.mouse.move(
      caja.x + caja.width * 0.95,
      caja.y + caja.height / 2,
      {
        steps: 5,
      },
    );
    await expect(hero).toHaveAttribute("data-parallax", "movimiento");
    await page.waitForTimeout(600);
    expect((await hero.screenshot()).equals(reposo)).toBe(false);
    await page.mouse.move(1, 1);
    await expect(hero).toHaveAttribute("data-parallax", "reposo");
    expect((await hero.screenshot()).equals(reposo)).toBe(true);
  });

  // Movimiento relativo por zonas, en los dos ejes: el fondo se desplaza claramente y el
  // racimo lo acompaña poco y en sentido contrario (su capa, por delante del foco),
  // entero (la zona desplazada coincide con el reposo: no se deforma) y con la mesa en
  // contacto moviéndose igual (no flota). Con la variante A el racimo quedaba quieto.
  test("el racimo acompaña el gesto contra el fondo, sin deformarse y apoyado en la mesa", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "el cursor es de escritorio");
    const hero = contenedor(page);
    const caja = (await hero.boundingBox())!;
    // Fracciones de la caja (x, y, ancho, alto): fondo lejano (ventana y planta), centro
    // del racimo y mesa justo bajo él.
    const zonas = {
      fondo: [0.04, 0.06, 0.16, 0.2],
      racimo: [0.36, 0.42, 0.16, 0.18],
      contacto: [0.5, 0.74, 0.16, 0.1],
    };
    await primerGesto(page);
    const reposo = await hero.screenshot({ scale: "css" });
    for (const [fx, fy, eje] of [
      [0.02, 0.5, "x"],
      [0.98, 0.5, "x"],
      [0.5, 0.02, "y"],
      [0.5, 0.98, "y"],
    ] as const) {
      await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
      await page.mouse.move(
        caja.x + caja.width * fx,
        caja.y + caja.height * fy,
        {
          steps: 4,
        },
      );
      await page.waitForTimeout(1300);
      const d = await desplazamientos(
        page,
        reposo,
        await hero.screenshot({ scale: "css" }),
        zonas,
      );
      const otro = eje === "x" ? "y" : "x";
      const posicion = `cursor en (${fx}, ${fy}): ${JSON.stringify(d)}`;
      // Medido en 1280×800: fondo 11,5 px en horizontal y 8,5 en vertical.
      expect(Math.abs(d.fondo[eje]), posicion).toBeGreaterThan(5);
      // El racimo se mueve (A: 0), poco (B: ~2 px) y al revés que el fondo.
      expect(Math.abs(d.racimo[eje]), posicion).toBeGreaterThan(0.75);
      expect(Math.abs(d.racimo[eje]), posicion).toBeLessThan(4);
      expect(Math.sign(d.racimo[eje]), posicion).toBe(-Math.sign(d.fondo[eje]));
      expect(Math.abs(d.racimo[otro]), posicion).toBeLessThan(1);
      // Entero: desplazado, coincide con el reposo (gris medio, 0 a 255).
      expect(d.racimo.error, posicion).toBeLessThan(3);
      // Apoyado: la mesa bajo el racimo va con él.
      expect(
        Math.hypot(d.contacto.x - d.racimo.x, d.contacto.y - d.racimo.y),
        posicion,
      ).toBeLessThan(1.25);
    }
  });

  // Con un solo mapa (variantes A y B) el fondo que el racimo destapa se rellenaba
  // estirando el borde: el corte del tallo dejaba vetas de su color hacia el fondo
  // (~220 px de 2×2 con el cursor en las esquinas superiores). Con las capas, el fondo
  // destapado sale de la reconstrucción y el color del corte no sale de su silueta.
  test("el fondo que destapa el tallo no toma su color", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "el cursor es de escritorio");
    const hero = contenedor(page);
    const caja = (await hero.boundingBox())!;
    const leer = async () => {
      const png = await hero.screenshot({ scale: "css" });
      return page.evaluate(
        async (src) => {
          const i = new Image();
          i.src = src;
          await i.decode();
          const c = document.createElement("canvas");
          c.width = i.width;
          c.height = i.height;
          const g = c.getContext("2d")!;
          g.drawImage(i, 0, 0);
          return {
            ancho: i.width,
            alto: i.height,
            datos: Array.from(g.getImageData(0, 0, i.width, i.height).data),
          };
        },
        `data:image/png;base64,${png.toString("base64")}`,
      );
    };
    const reposo = await leer();
    const { ancho, alto } = reposo;
    // Zona alrededor del corte (fracciones de la caja) y su color, en el centro del corte.
    const zona = {
      x0: 0.38 * ancho,
      y0: 0.1 * alto,
      x1: 0.58 * ancho,
      y1: 0.3 * alto,
    };
    const color = [0, 1, 2].map((k) => {
      let s = 0;
      let n = 0;
      for (let y = Math.round(0.2 * alto); y < 0.23 * alto; y++)
        for (let x = Math.round(0.46 * ancho); x < 0.49 * ancho; x++) {
          s += reposo.datos[(y * ancho + x) * 4 + k];
          n++;
        }
      return s / n;
    });
    const parecido = (d: number[], i: number) =>
      Math.hypot(
        d[i * 4] - color[0],
        d[i * 4 + 1] - color[1],
        d[i * 4 + 2] - color[2],
      ) < 40;
    // La silueta del corte en reposo, ensanchada 4 px (el producto se mueve ~2 px).
    const corte = new Set<number>();
    for (let y = Math.round(zona.y0); y < zona.y1; y++)
      for (let x = Math.round(zona.x0); x < zona.x1; x++)
        if (parecido(reposo.datos, y * ancho + x))
          for (let dy = -4; dy <= 4; dy++)
            for (let dx = -4; dx <= 4; dx++)
              corte.add((y + dy) * ancho + x + dx);
    const fuera = (d: number[]) => {
      let n = 0;
      for (let y = Math.round(zona.y0); y < zona.y1; y++)
        for (let x = Math.round(zona.x0); x < zona.x1; x++) {
          const i = y * ancho + x;
          if (!corte.has(i) && parecido(d, i)) n++;
        }
      return n;
    };
    expect(fuera(reposo.datos)).toBe(0);
    for (const [fx, fy] of [
      [0.98, 0.02],
      [0.02, 0.02],
      [0.5, 0.02],
      [0.98, 0.5],
    ]) {
      await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
      await page.mouse.move(
        caja.x + caja.width * fx,
        caja.y + caja.height * fy,
        {
          steps: 4,
        },
      );
      await page.waitForTimeout(1300);
      expect(
        fuera((await leer()).datos),
        `cursor en (${fx}, ${fy})`,
      ).toBeLessThan(5);
    }
  });

  test("con el dedo: arrastre horizontal mueve y el vertical sigue desplazando la página", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "gestos táctiles solo en el perfil móvil");
    const hero = contenedor(page);
    await hero.scrollIntoViewIfNeeded();
    const caja = (await hero.boundingBox())!;
    const cdp = await page.context().newCDPSession(page);
    const toque = (
      type: "touchStart" | "touchMove" | "touchEnd",
      punto?: { x: number; y: number },
    ) =>
      cdp.send("Input.dispatchTouchEvent", {
        type,
        touchPoints: punto ? [punto] : [],
      });
    const x0 = caja.x + caja.width / 2;
    const y0 = caja.y + caja.height / 2;
    await toque("touchStart", { x: x0, y: y0 });
    for (let i = 1; i <= 6; i++)
      await toque("touchMove", { x: x0 + i * 15, y: y0 });
    await expect(hero).toHaveAttribute("data-parallax", "movimiento");
    await toque("touchEnd");
    await expect(hero).toHaveAttribute("data-parallax", "reposo");

    // Arrastre vertical sobre la foto: el navegador desplaza la página (touch-action:
    // pan-y) y el efecto no se mueve.
    const antes = await page.evaluate(() => scrollY);
    await toque("touchStart", { x: x0, y: y0 });
    for (let i = 1; i <= 10; i++)
      await toque("touchMove", { x: x0, y: y0 - i * 15 });
    await toque("touchEnd");
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThan(antes + 50);
    await expect(hero).toHaveAttribute("data-parallax", "reposo");
  });

  test("con movimiento reducido activado durante la sesión, vuelve a la foto", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(contenedor(page)).toHaveAttribute("data-efecto", "foto");
    await expect(page.locator("#hero canvas")).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await esperarActivo(page);
  });

  test("al cambiar entre la foto móvil y la de escritorio se rehace con su mapa", async ({
    page,
    isMobile,
  }) => {
    test.skip(
      isMobile,
      "el cambio de foto se prueba redimensionando el escritorio",
    );
    await page.setViewportSize({ width: 700, height: 800 });
    await expect.poll(() => proporcionLienzo(page)).toBe(1);
    await esperarActivo(page);
    await expect(page.locator("#hero canvas")).toHaveCount(1);
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect.poll(() => proporcionLienzo(page)).toBe(1.6);
    await esperarActivo(page);
    const [a, b] = await Promise.all([
      contenedor(page).boundingBox(),
      page.locator("#hero canvas").boundingBox(),
    ]);
    expect(b).toEqual(a);
  });
});

test.describe("sin efecto, queda la foto", () => {
  test("con movimiento reducido desde el inicio", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(contenedor(page)).toHaveAttribute("data-efecto", "foto");
    // Pasado el tiempo en que se activaría (requestIdleCallback con plazo de 2 s).
    await page.waitForTimeout(2_500);
    await expect(contenedor(page)).toHaveAttribute("data-efecto", "foto");
    await expect(page.locator("#hero canvas")).toHaveCount(0);
  });

  test("con Save-Data", async ({ page }) => {
    await page.addInitScript(() =>
      Object.defineProperty(Navigator.prototype, "connection", {
        get: () => ({ saveData: true }),
      }),
    );
    await page.goto("/");
    await page.waitForTimeout(2_500);
    await expect(contenedor(page)).toHaveAttribute("data-efecto", "foto");
    await expect(page.locator("#hero canvas")).toHaveCount(0);
  });

  for (const capa of ["profundidad", "fondo", "alfa"]) {
    test(`si la capa «${capa}» no carga`, async ({ page }) => {
      await page.route(`**/hero-*-${capa}.webp`, (ruta) => ruta.abort());
      await page.goto("/");
      // Sin GPU fallaría igual: no probaría la capa.
      test.skip(!(await hayGpu(page)), SIN_GPU);
      await expect(contenedor(page)).toHaveAttribute("data-efecto", "fallo", {
        timeout: 10_000,
      });
      await expect(page.locator("#hero canvas")).toHaveCount(0);
      await expect(foto(page)).toBeVisible();
    });
  }

  test("sin OffscreenCanvas (navegadores antiguos)", async ({ page }) => {
    await page.addInitScript(() => {
      // @ts-expect-error: se quita a propósito para simular un navegador sin la API
      delete HTMLCanvasElement.prototype.transferControlToOffscreen;
    });
    await page.goto("/");
    await expect(contenedor(page)).toHaveAttribute("data-efecto", "fallo", {
      timeout: 10_000,
    });
    await expect(page.locator("#hero canvas")).toHaveCount(0);
    await expect(foto(page)).toBeVisible();
  });

  test("si se cae el proceso de la GPU (contexto WebGL perdido)", async ({
    page,
    browser,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "solo Chromium permite tumbar la GPU",
    );
    await page.goto("/");
    test.skip(!(await hayGpu(page)), SIN_GPU);
    await esperarActivo(page);
    // El contexto vive en el worker (OffscreenCanvas): se pierde de verdad.
    const cdp = await browser.newBrowserCDPSession();
    await cdp.send("Browser.crashGpuProcess");
    await expect(contenedor(page)).toHaveAttribute("data-efecto", "fallo");
    await expect(page.locator("#hero canvas")).toHaveCount(0);
    await expect(foto(page)).toBeVisible();
  });
});

test("sin WebGL en el navegador, queda la foto", async ({
  playwright,
  browserName,
  baseURL,
}) => {
  test.skip(browserName !== "chromium", "--disable-webgl es de Chromium");
  const navegador = await playwright.chromium.launch({
    args: ["--disable-webgl"],
  });
  const page = await navegador.newPage();
  const errores: string[] = [];
  page.on("pageerror", (e) => errores.push(e.message));
  await page.goto(`${baseURL}/`);
  await expect(contenedor(page)).toHaveAttribute("data-efecto", "fallo", {
    timeout: 10_000,
  });
  await expect(page.locator("#hero canvas")).toHaveCount(0);
  await expect(foto(page)).toBeVisible();
  expect(errores).toEqual([]);
  await navegador.close();
});

// Regresión: la textura de la foto se creaba con la unidad del mapa activa y la
// reemplazaba; el desplazamiento seguía el brillo de la foto (bordes dentados). Con un
// mapa uniforme en el plano del producto, mover el cursor no debe cambiar la imagen.
test("con todo en el plano del producto, el cursor no deforma la imagen", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "el cursor es de escritorio");
  // WebP sin pérdida de 1×1 px con valor 192 (192/255 ≈ 0,75: FOCO de src/lib/parallax.ts).
  const plano = Buffer.from(
    "UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAdQ4AIXuP+BiOh/AAA=",
    "base64",
  );
  await page.route("**/*-profundidad.webp", (ruta) =>
    ruta.fulfill({ body: plano, contentType: "image/webp" }),
  );
  await page.goto("/");
  test.skip(!(await hayGpu(page)), SIN_GPU);
  await esperarActivo(page);
  const hero = contenedor(page);
  const caja = (await hero.boundingBox())!;
  await primerGesto(page);
  const reposo = await hero.screenshot();
  await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
  await page.mouse.move(caja.x + caja.width - 2, caja.y + caja.height / 2, {
    steps: 5,
  });
  await expect(hero).toHaveAttribute("data-parallax", "movimiento");
  await page.waitForTimeout(1200);
  const movido = await hero.screenshot();
  // Misma imagen salvo redondeos: comparación por píxeles en el navegador.
  const distintos = await fraccionDistinta(page, reposo, movido);
  expect(distintos).toBeLessThan(0.002);
});
