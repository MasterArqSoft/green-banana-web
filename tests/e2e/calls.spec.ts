import { expect, test } from "./fixtures";
import type { Locator, Page } from "@playwright/test";
import enCopy from "../../src/content/en/copy.json";
import copy from "../../src/content/es-CO/copy.json";
import site from "../../src/content/site.json";
import { rutaDe } from "../../src/lib/i18n";

// T-37: botones de llamada en todos los puntos de contacto (AC-01 a AC-03),
// acordeón y navegación por teclado (AC-09).
const telHref = `tel:${site.phone}`;

// Tab desde donde esté el foco hasta que `objetivo` lo tenga.
async function tabHasta(page: Page, objetivo: Locator, max = 150) {
  for (let i = 0; i < max; i++) {
    if (await objetivo.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  await expect(objetivo).toBeFocused();
}

test.describe("botones de llamada (AC-03)", () => {
  for (const inicio of ["/", "/en"]) {
    test(
      `${inicio}: todos los enlaces tel: usan el número de site.json (AC-26)`,
      { tag: "@smoke" },
      async ({ page }) => {
        await page.goto(inicio);
        const hrefs = await page
          .locator('a[href^="tel:"]')
          .evaluateAll((links) =>
            links.map((link) => link.getAttribute("href")),
          );
        expect(new Set(hrefs)).toEqual(new Set([telHref]));
      },
    );
  }

  for (const inicio of ["/", "/en"]) {
    test(`${inicio}: hay un botón de llamada en cada punto de contacto`, async ({
      page,
    }) => {
      await page.goto(inicio);
      const points = {
        "barra superior": "header",
        hero: "#hero",
        presentaciones: "#presentaciones",
        cobertura: "#cobertura",
        negocios: "#negocios",
        "pie legal": "#pie",
      };
      for (const [name, selector] of Object.entries(points)) {
        await expect(
          page.locator(`${selector} a[href="${telHref}"]`).first(),
          name,
        ).toBeAttached();
      }
      // Una tarjeta de presentación = un botón "Llamar para precio" (FR-04).
      await expect(
        page.locator(`#presentaciones a[href="${telHref}"]`),
      ).toHaveCount(4);
      // CTA final (FR-15): la sección anterior al pie.
      await expect(
        page.locator(`section:has(#cta-final-titulo) a[href="${telHref}"]`),
      ).toHaveCount(1);
    });
  }

  test("ninguna página publica precios (AC-02)", async ({ page }) => {
    for (const path of [
      "/",
      "/terminos",
      "/privacidad",
      "/garantia",
      "/en",
      "/en/terms",
      "/en/privacy",
      "/en/guarantee",
    ]) {
      await page.goto(path);
      await expect(page.locator("body")).not.toContainText(/\$\s?\d|COP/);
    }
  });
});

test.describe("teclado (AC-09)", () => {
  test.skip(({ isMobile }) => isMobile, "Teclado físico: solo escritorio");

  // ES y EN (revisión de teclado de F-09, 2026-10-25): antes solo se probaba /.
  for (const { inicio, otro, copia } of [
    { inicio: "/", otro: "/en", copia: copy },
    { inicio: "/en", otro: "/", copia: enCopy },
  ]) {
    test(`${inicio}: el primer Tab muestra «Saltar al contenido» y Enter lleva al <main> (T-58)`, async ({
      page,
    }) => {
      await page.goto(inicio);
      await page.keyboard.press("Tab");
      const skip = page.locator(":focus");
      await expect(skip).toHaveAttribute("href", "#contenido");
      await expect(skip).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/#contenido$/);
      // El siguiente Tab sigue desde el contenido: el primer botón del hero.
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toHaveAttribute("href", telHref);
      await expect(page.locator("#hero :focus")).toHaveCount(1);
    });

    test(`${inicio}: después del salto, el Tab pasa por la marca (FR-19), el selector de idioma y el botón Llamar con el foco visible`, async ({
      page,
    }) => {
      await page.goto(inicio);
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toHaveAttribute("href", inicio);
      await page.keyboard.press("Tab");
      // Selector integrado en la cabecera (FR-26).
      await expect(page.locator(":focus")).toHaveAttribute("href", otro);
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      await expect(focused).toHaveAttribute("href", telHref);
      const outline = await focused.evaluate(
        (el) => getComputedStyle(el).outlineStyle,
      );
      expect(outline).not.toBe("none");
    });

    test(`${inicio}: el acordeón de preguntas se abre y se cierra con Enter y con Espacio`, async ({
      page,
    }) => {
      await page.goto(inicio);
      const first = page.locator("#preguntas-frecuentes details").first();
      const summary = first.locator("summary");
      await summary.focus();
      await page.keyboard.press("Enter");
      await expect(first).toHaveAttribute("open", "");
      await expect(first.locator("p")).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(first).not.toHaveAttribute("open", "");
      await page.keyboard.press("Space");
      await expect(first).toHaveAttribute("open", "");
      await page.keyboard.press("Space");
      await expect(first).not.toHaveAttribute("open", "");
    });

    // Shift+Tab recorre el mismo orden al revés: sin saltos ni trampas en la página.
    test(`${inicio}: Shift+Tab desanda el mismo recorrido que Tab`, async ({
      page,
    }) => {
      await page.goto(inicio);
      const id = () =>
        page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return "";
          el.setAttribute(
            "data-orden",
            el.getAttribute("data-orden") ??
              String(document.querySelectorAll("[data-orden]").length),
          );
          return el.getAttribute("data-orden") ?? "";
        });
      // Hasta el último control: el siguiente Tab sale de la página o vuelve a uno visto.
      const ida: string[] = [];
      for (let i = 0; i < 120; i++) {
        await page.keyboard.press("Tab");
        const actual = await id();
        if (!actual || ida.includes(actual)) break;
        ida.push(actual);
      }
      expect(ida.length).toBeGreaterThan(20);
      await page.keyboard.press("Shift+Tab");
      expect(await id()).toBe(ida.at(-1));
      const vuelta: string[] = [];
      for (let i = 0; i < ida.length - 1; i++) {
        await page.keyboard.press("Shift+Tab");
        vuelta.push(await id());
      }
      expect(vuelta).toEqual(ida.slice(0, -1).reverse());
    });

    // Cada página legal con el teclado, ida y vuelta, sin cambiar de idioma. Ningún
    // enlace tel: ni mailto: se activa.
    for (const legal of ["terminos", "privacidad", "garantia"] as const) {
      test(`${inicio}: la página legal «${legal}» se abre y se vuelve al inicio con el teclado, en el mismo idioma`, async ({
        page,
      }) => {
        const lang = inicio === "/" ? "es-CO" : "en";
        const destino = rutaDe(legal, lang);
        await page.goto(inicio);
        await tabHasta(page, page.locator(`#pie a[href="${destino}"]`));
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(new RegExp(`${destino}$`));
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        await tabHasta(
          page,
          page.getByRole("link", { name: copia.navigation.backHome }),
        );
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(
          new RegExp(`${inicio === "/" ? "" : "/en"}/?$`),
        );
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
      });
    }
  }

  // Alcance real (T-108, F-10): enlaces y preguntas de la FAQ con el mapa sin cargar. Los
  // botones del mapa se recorren por estado en mapa-fincas.spec.ts («teclado del mapa por
  // estado»).
  test("los enlaces y las preguntas de / se alcanzan con Tab (sin los controles del mapa)", async ({
    page,
  }) => {
    await page.goto("/");
    // Numera cada enlace y pregunta visible (los botones Llamar son idénticos).
    const interactive = await page
      .locator("a[href], summary")
      .evaluateAll((elements) => {
        const visible = elements.filter((el) => !el.closest("[inert]"));
        visible.forEach((el, i) => el.setAttribute("data-tab", String(i)));
        return visible.length;
      });
    const reached = new Set<string>();
    for (let i = 0; i < interactive + 5; i++) {
      await page.keyboard.press("Tab");
      const index = await page.evaluate(
        () => document.activeElement?.getAttribute("data-tab") ?? null,
      );
      if (index !== null) reached.add(index);
    }
    expect(reached.size).toBe(interactive);
  });
});
