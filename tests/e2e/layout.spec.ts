import { expect, test } from "@playwright/test";

// T-33: composición y revisión móvil a 360 px.
const pages = ["/", "/terminos", "/privacidad", "/garantia"];

test.describe("composición de la landing", () => {
  test("las secciones siguen el orden del spec (FR-01 a FR-17)", async ({
    page,
  }) => {
    await page.goto("/");
    const order = [
      "header",
      "#hero",
      "#presentaciones",
      "#verde-de-verdad",
      "#origen",
      "#mapa-fincas",
      "#recetas",
      "#beneficios",
      "#como-funciona",
      "#cobertura",
      "#negocios",
      "#preguntas-frecuentes",
      "#garantia",
      "#pie",
    ];
    const tops = await Promise.all(
      order.map((selector) =>
        page
          .locator(selector)
          .first()
          .evaluate((el) => el.getBoundingClientRect().top + window.scrollY),
      ),
    );
    expect(tops).toEqual([...tops].sort((a, b) => a - b));
  });

  for (const path of pages) {
    test(`${path} no se desborda a lo ancho`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("móvil a 360 px", () => {
  test.skip(({ isMobile }) => !isMobile, "Solo en móvil");

  test("el H1 y el botón Llamar se ven sin hacer scroll (AC-01)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeInViewport();
    await expect(
      page.locator("#hero").getByRole("link", { name: /^Llamar para pedir/ }),
    ).toBeInViewport();
  });

  test("el botón flotante aparece tras el hero y se esconde en el pie (FR-17)", async ({
    page,
  }) => {
    await page.goto("/");
    // El último hijo del body es el contenedor del botón flotante.
    const floating = page.locator("body > div[class*='fixed']");
    await expect(floating).toHaveAttribute("inert", "");

    await page.locator("#presentaciones").scrollIntoViewIfNeeded();
    await expect(floating).not.toHaveAttribute("inert", "");
    await expect(floating.getByRole("link")).toBeInViewport();

    await page.locator("#pie").scrollIntoViewIfNeeded();
    await expect(floating).toHaveAttribute("inert", "");
  });

  test("«Ver origen» lleva a la sección sin que la barra fija tape el título", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Ver origen" }).click();
    await expect(page).toHaveURL(/#origen$/);
    const headerBottom = await page
      .locator("header")
      .evaluate((el) => el.getBoundingClientRect().bottom);
    const titleTop = await page
      .locator("#origen-titulo")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(titleTop).toBeGreaterThanOrEqual(headerBottom);
  });
});
