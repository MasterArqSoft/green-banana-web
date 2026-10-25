import { expect, test } from "./fixtures";
import site from "../../src/content/site.json";

// T-37: botones de llamada en todos los puntos de contacto (AC-01 a AC-03),
// acordeón y navegación por teclado (AC-09).
const telHref = `tel:${site.phone}`;

test.describe("botones de llamada (AC-03)", () => {
  for (const inicio of ["/", "/en"]) {
    test(`${inicio}: todos los enlaces tel: usan el número de site.json (AC-26)`, async ({
      page,
    }) => {
      await page.goto(inicio);
      const hrefs = await page
        .locator('a[href^="tel:"]')
        .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
      expect(new Set(hrefs)).toEqual(new Set([telHref]));
    });
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

  test("el primer Tab muestra «Saltar al contenido» y Enter lleva al <main> (T-58)", async ({
    page,
  }) => {
    await page.goto("/");
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

  test("después del salto, el Tab pasa por el selector de idioma, la marca (FR-19) y el botón Llamar con el foco visible", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    // Selector de idioma (FR-26), arriba de la barra.
    await expect(page.locator(":focus")).toHaveAttribute("href", "/en");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveAttribute("href", "/");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveAttribute("href", telHref);
    const outline = await focused.evaluate(
      (el) => getComputedStyle(el).outlineStyle,
    );
    expect(outline).not.toBe("none");
  });

  test("el acordeón de preguntas se abre y se cierra con el teclado", async ({
    page,
  }) => {
    await page.goto("/");
    const first = page.locator("#preguntas-frecuentes details").first();
    const summary = first.locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("open", "");
    await expect(first.locator("p")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(first).not.toHaveAttribute("open", "");
  });

  test("todos los elementos interactivos se alcanzan con Tab", async ({
    page,
  }) => {
    await page.goto("/");
    // Numera cada elemento interactivo visible (los botones Llamar son idénticos).
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
