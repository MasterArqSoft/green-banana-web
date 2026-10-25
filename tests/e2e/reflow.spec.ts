import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// T-102 (AUD-2026-10-24-FORENSE/F-02): reflow a 320 CSS px (WCAG 1.4.10), también con el
// espaciado de texto de WCAG 1.4.12 y con la fuente al 200 % (1.4.4). Corre en el
// proyecto movil-320 (playwright.config.ts). La auditoría midió 342 px de ancho en / por
// las tarjetas de presentaciones.
const pages = [
  "/",
  "/terminos",
  "/privacidad",
  "/garantia",
  "/en",
  "/en/terms",
  "/en/privacy",
  "/en/guarantee",
  "/no-existe",
];

// Valores mínimos de WCAG 1.4.12 (Text Spacing).
const ESPACIADO_1412 = `
  * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
  p { margin-bottom: 2em !important; }
`;

const variantes: { nombre: string; preparar: (page: Page) => Promise<void> }[] =
  [
    { nombre: "sin cambios", preparar: async () => {} },
    {
      nombre: "con espaciado de texto 1.4.12",
      preparar: async (page) => {
        await page.addStyleTag({ content: ESPACIADO_1412 });
      },
    },
    {
      nombre: "con la fuente al 200 %",
      preparar: async (page) => {
        await page.addStyleTag({
          content: "html { font-size: 200% !important; }",
        });
      },
    },
  ];

// Ancho del documento y elementos visibles de la página que salen por la derecha (o la
// izquierda) del viewport, o cuyo texto se sale de su caja (una palabra o un correo sin
// cortes no mueve la caja del párrafo). Se ignora el texto solo para lectores de pantalla
// (.sr-only, como "Saltar al contenido" mientras no tiene el foco).
async function desbordes(page: Page) {
  return page.evaluate(() => {
    const ancho = document.documentElement.clientWidth;
    const fuera = [...document.querySelectorAll("body *")]
      .filter((el) => !el.closest(".sr-only"))
      .map((el) => ({ el, caja: el.getBoundingClientRect() }))
      .filter(
        ({ el, caja }) =>
          caja.width > 1 &&
          (caja.right > ancho + 0.5 ||
            caja.left < -0.5 ||
            (el.clientWidth > 0 &&
              el.scrollWidth > el.clientWidth + 1 &&
              getComputedStyle(el).overflowX === "visible")),
      )
      .map(
        ({ el, caja }) =>
          `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")} (${Math.round(caja.left)}–${Math.round(caja.right)} px, scroll ${el.scrollWidth}/${el.clientWidth}): ${(el.textContent ?? "").trim().slice(0, 40)}`,
      );
    return {
      clientWidth: ancho,
      scrollWidth: document.documentElement.scrollWidth,
      fuera,
    };
  });
}

test.describe("reflow a 320 px (F-02, WCAG 1.4.10)", () => {
  for (const path of pages) {
    for (const { nombre, preparar } of variantes) {
      test(`${path} ${nombre}: nada se sale a lo ancho`, async ({ page }) => {
        await page.goto(path);
        await preparar(page);
        const medida = await desbordes(page);
        expect(medida.fuera, "elementos fuera del viewport").toEqual([]);
        expect(medida.scrollWidth).toBeLessThanOrEqual(medida.clientWidth);
      });
    }
  }
});

// Revisión independiente del 2026-10-25 (R-01, WCAG 1.4.4, 1.4.10 y 2.4.11): con el
// texto al 200 % la barra superior fija medía 653 px (ES) y 693 px (EN) en una pantalla
// de 640 px y tapaba los controles del contenido; las pruebas de ancho no lo veían. Se
// recorre <main> con Tab y, para cada control con foco: la barra superior no lo tapa en
// ningún punto y al menos uno de sus puntos se ve (el botón flotante puede tapar una
// parte, no todo). 320×256 equivale a un zoom del 400 % en 1280×1024.
const escenarios: {
  nombre: string;
  alto: number;
  preparar: (page: Page) => Promise<void>;
}[] = [
  { nombre: "sin cambios", alto: 640, preparar: async () => {} },
  {
    nombre: "con la fuente al 200 %",
    alto: 640,
    preparar: async (page) => {
      await page.addStyleTag({
        content: "html { font-size: 200% !important; }",
      });
    },
  },
  {
    nombre: "en 320×256 (zoom del 400 %)",
    alto: 256,
    preparar: async () => {},
  },
];

test.describe("controles con foco no tapados (R-01, WCAG 2.4.11)", () => {
  for (const ruta of ["/", "/en"]) {
    for (const { nombre, alto, preparar } of escenarios) {
      test(`${ruta} ${nombre}: la barra superior no tapa el contenido`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 320, height: alto });
        await page.goto(ruta);
        await preparar(page);
        const problemas: string[] = [];
        let enMain = 0;
        for (let i = 0; i < 80; i++) {
          await page.keyboard.press("Tab");
          const foco = await page.evaluate(() => {
            const el = document.activeElement as HTMLElement | null;
            if (!el || el === document.body) return { fin: true };
            if (el.closest("footer")) return { fin: true };
            if (!el.closest("main")) return { fin: false };
            const r = el.getBoundingClientRect();
            const cabecera = document.querySelector("header");
            const h = cabecera?.getBoundingClientRect();
            const tapadoPorCabecera =
              !!h &&
              r.top < h.bottom - 0.5 &&
              r.bottom > h.top + 0.5 &&
              r.left < h.right &&
              r.right > h.left;
            const puntos = [
              [r.left + r.width / 2, r.top + r.height / 2],
              [r.left + 2, r.top + 2],
              [r.right - 2, r.top + 2],
              [r.left + 2, r.bottom - 2],
              [r.right - 2, r.bottom - 2],
            ];
            const visibles = puntos.filter(([x, y]) => {
              if (x < 0 || y < 0 || x > innerWidth || y > innerHeight)
                return false;
              const arriba = document.elementFromPoint(x, y);
              return !!arriba && (arriba === el || el.contains(arriba));
            }).length;
            return {
              fin: false,
              control: `${el.tagName.toLowerCase()} «${(el.textContent ?? "").trim().slice(0, 30)}» (${Math.round(r.top)}–${Math.round(r.bottom)} px; barra ${Math.round(h?.top ?? 0)}–${Math.round(h?.bottom ?? 0)} px)`,
              tapadoPorCabecera,
              visibles,
            };
          });
          if (foco.fin) break;
          if (!("control" in foco)) continue;
          enMain += 1;
          if (foco.tapadoPorCabecera)
            problemas.push(`tapado por la barra: ${foco.control}`);
          else if (foco.visibles === 0)
            problemas.push(`no se ve: ${foco.control}`);
        }
        expect(enMain, "controles de <main> recorridos").toBeGreaterThan(5);
        expect(problemas).toEqual([]);
      });
    }
  }
});

test("a tamaño normal en móvil la barra superior sigue fija (R-01, FR-01)", async ({
  page,
}) => {
  for (const ruta of ["/", "/en"]) {
    await page.goto(ruta);
    await expect(page.locator("header")).toHaveCSS("position", "sticky");
  }
});

// Revisión independiente de T-121 (N-1): un overflow-wrap demasiado agresivo partía
// palabras que sí cabían («Finca» → «F/i/n/c/a» a 768 px). A tamaño normal, ninguna palabra
// visible se parte en dos líneas en / y /en, de 320 a 1280 px. Los cortes naturales (guion,
// barra, raya) no cuentan: las palabras que los tienen se ignoran.
test.describe("a tamaño normal ninguna palabra se parte (N-1)", () => {
  for (const ruta of ["/", "/en"]) {
    test(`${ruta}: palabras enteras a 320, 768, 1024 y 1280 px`, async ({
      page,
    }) => {
      const partidas: string[] = [];
      for (const ancho of [320, 768, 1024, 1280]) {
        await page.setViewportSize({ width: ancho, height: 800 });
        await page.goto(ruta);
        const aqui = await page.evaluate(() => {
          const encontradas: string[] = [];
          const recorrido = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
          );
          for (
            let nodo = recorrido.nextNode();
            nodo;
            nodo = recorrido.nextNode()
          ) {
            const padre = nodo.parentElement;
            if (!padre || padre.closest(".sr-only, script, style")) continue;
            if (padre.getClientRects().length === 0) continue;
            const texto = nodo.textContent ?? "";
            for (const coincidencia of texto.matchAll(/\S{2,}/g)) {
              const palabra = coincidencia[0];
              if (/[-–—/]/.test(palabra)) continue;
              const rango = document.createRange();
              rango.setStart(nodo, coincidencia.index);
              rango.setEnd(nodo, coincidencia.index + palabra.length);
              const lineas = new Set(
                [...rango.getClientRects()]
                  .filter((r) => r.width > 0)
                  .map((r) => Math.round(r.top)),
              );
              if (lineas.size > 1) encontradas.push(palabra);
            }
          }
          return encontradas;
        });
        partidas.push(...aqui.map((palabra) => `${ancho} px: ${palabra}`));
      }
      expect(partidas).toEqual([]);
    });
  }
});
