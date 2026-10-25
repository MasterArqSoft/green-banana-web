import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import enCopy from "../../src/content/en/copy.json";
import enLegal from "../../src/content/en/legal.json";
import esCopy from "../../src/content/es-CO/copy.json";
import esLegal from "../../src/content/es-CO/legal.json";

// Fase 12 (FR-25 a FR-28): español predeterminado e inglés bajo /en. La URL es la
// única fuente del idioma; el selector son enlaces nativos a la página equivalente.
const PAREJAS = [
  { es: "/", en: "/en" },
  { es: "/terminos", en: "/en/terms" },
  { es: "/privacidad", en: "/en/privacy" },
  { es: "/garantia", en: "/en/guarantee" },
];
const titulo = {
  "/": "Guineo verde recién cortado",
  "/terminos": esLegal.terminos.title,
  "/privacidad": esLegal.privacidad.title,
  "/garantia": esLegal.garantia.title,
  "/en": "Freshly cut green banana",
  "/en/terms": enLegal.terminos.title,
  "/en/privacy": enLegal.privacidad.title,
  "/en/guarantee": enLegal.garantia.title,
} as Record<string, string>;

// Errores de consola, p. ej. una hidratación que no coincide (AC-22).
function erroresDeConsola(page: Page) {
  const errores: string[] = [];
  page.on("console", (mensaje) => {
    if (mensaje.type() === "error") errores.push(mensaje.text());
  });
  return errores;
}

const selector = (page: Page) =>
  page.getByRole("navigation", { name: /^(Idioma|Language)$/ });

test.describe("navegador en inglés (AC-21)", () => {
  test.use({
    locale: "en-US",
    extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
  });

  for (const { es } of PAREJAS) {
    test(`${es} sigue en español, sin redirigir`, async ({ page }) => {
      const respuesta = await page.goto(es);
      expect(respuesta?.status()).toBe(200);
      expect(respuesta?.request().redirectedFrom()).toBeNull();
      expect(new URL(page.url()).pathname).toBe(es);
      await expect(page.locator("html")).toHaveAttribute("lang", "es-CO");
      await expect(page.locator("h1")).toContainText(titulo[es]);
    });
  }
});

test.describe("rutas inglesas (AC-22)", () => {
  for (const { en } of PAREJAS) {
    test(`${en} abre y recarga directo en inglés, sin errores`, async ({
      page,
    }) => {
      const errores = erroresDeConsola(page);
      const respuesta = await page.goto(en);
      expect(respuesta?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.locator("h1")).toContainText(titulo[en]);
      await page.reload();
      await expect(page).toHaveURL(new RegExp(`${en}$`));
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.locator("h1")).toContainText(titulo[en]);
      await page.waitForLoadState("networkidle");
      // El lang no cambia después de hidratar.
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      expect(errores).toEqual([]);
    });
  }

  test("una ruta no publicada (/es, /fr) es 404, no otra copia", async ({
    page,
  }) => {
    for (const ruta of ["/es", "/fr", "/en/terminos"]) {
      expect((await page.goto(ruta))?.status()).toBe(404);
    }
  });
});

test.describe("selector de idioma (FR-26, AC-23)", () => {
  for (const { es, en } of PAREJAS) {
    test(`${es} y ${en}: el selector marca el idioma activo y enlaza la pareja`, async ({
      page,
    }) => {
      await page.goto(es);
      let nav = selector(page);
      await expect(nav).toHaveAccessibleName(esCopy.language.navLabel);
      await expect(nav.locator('[aria-current="true"]')).toHaveText("Español");
      const english = nav.getByRole("link", { name: "English" });
      await expect(english).toHaveAttribute("href", en);
      await expect(english).toHaveAttribute("hreflang", "en");
      await expect(english).toHaveAttribute("lang", "en");

      await page.goto(en);
      nav = selector(page);
      await expect(nav).toHaveAccessibleName(enCopy.language.navLabel);
      await expect(nav.locator('[aria-current="true"]')).toHaveText("English");
      await expect(nav.getByRole("link", { name: "Español" })).toHaveAttribute(
        "href",
        es,
      );
    });
  }

  test("cambia en los dos sentidos y la recarga conserva el idioma", async ({
    page,
  }) => {
    await page.goto("/terminos");
    await selector(page).getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/terms$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.reload();
    await expect(page.locator("h1")).toHaveText(enLegal.terminos.title);

    await selector(page).getByRole("link", { name: "Español" }).click();
    await expect(page).toHaveURL(/\/terminos$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es-CO");
  });

  test("con JavaScript conserva la consulta y el ancla (también tras cambiar el ancla)", async ({
    page,
  }) => {
    await page.goto("/?ref=demo#origen");
    const english = selector(page).getByRole("link", { name: "English" });
    await expect(english).toHaveAttribute("href", "/en?ref=demo#origen");
    await english.click();
    await expect(page).toHaveURL(/\/en\?ref=demo#origen$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.goto("/en");
    await page.getByRole("link", { name: enCopy.hero.secondaryCta }).click();
    await expect(page).toHaveURL(/#origen$/);
    await expect(
      selector(page).getByRole("link", { name: "Español" }),
    ).toHaveAttribute("href", "/#origen");
  });

  test("abrir el otro idioma en una pestaña nueva lleva consulta y ancla", async ({
    page,
    context,
    isMobile,
  }) => {
    test.skip(isMobile, "Clic con modificador: solo escritorio");
    await page.goto("/privacidad?ref=demo");
    const [nueva] = await Promise.all([
      context.waitForEvent("page"),
      selector(page)
        .getByRole("link", { name: "English" })
        .click({ modifiers: ["ControlOrMeta"] }),
    ]);
    await nueva.waitForLoadState();
    expect(new URL(nueva.url()).pathname).toBe("/en/privacy");
    expect(new URL(nueva.url()).search).toBe("?ref=demo");
    await expect(nueva.locator("html")).toHaveAttribute("lang", "en");
    // La página de origen sigue en español.
    await expect(page.locator("html")).toHaveAttribute("lang", "es-CO");
  });

  test("con teclado: segundo Tab, foco visible y 44 px de alto", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Teclado físico: solo escritorio");
    await page.goto("/en");
    await page.keyboard.press("Tab"); // «Skip to content»
    await page.keyboard.press("Tab");
    const foco = page.locator(":focus");
    await expect(foco).toHaveText("Español");
    expect(
      await foco.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).not.toBe("none");
    expect((await foco.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es-CO");
  });

  test("marca y pie mantienen el idioma", async ({ page }) => {
    await page.goto("/en/guarantee");
    await page
      .locator("#pie")
      .getByRole("link", { name: enCopy.footer.links.privacidad })
      .click();
    await expect(page).toHaveURL(/\/en\/privacy$/);
    await page.locator("header").getByRole("link").first().click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("cargar /en no descarga otras páginas ni Leaflet (T-61, AC-15)", async ({
    page,
  }) => {
    const pedidos: string[] = [];
    page.on("request", (request) => {
      const tipo = request.resourceType();
      if (tipo === "fetch" || /leaflet/i.test(request.url())) {
        pedidos.push(request.url());
      }
    });
    await page.goto("/en");
    await page.locator("#pie").scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");
    expect(pedidos).toEqual([]);
  });
});

test.describe("sin JavaScript (AC-23)", () => {
  test.use({ javaScriptEnabled: false });

  test("el selector lleva a la página equivalente", async ({ page }) => {
    await page.goto("/privacidad");
    await selector(page).getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/privacy$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveText(enLegal.privacidad.title);
    await selector(page).getByRole("link", { name: "Español" }).click();
    await expect(page).toHaveURL(/\/privacidad$/);
  });
});

test.describe("404 global (AC-28)", () => {
  for (const ruta of ["/no-existe", "/en/no-existe"]) {
    test(`${ruta}: 404 real, español principal y ayuda en inglés`, async ({
      page,
    }) => {
      const respuesta = await page.goto(ruta);
      expect(respuesta?.status()).toBe(404);
      await expect(page.locator("html")).toHaveAttribute("lang", "es-CO");
      await expect(page.locator("h1")).toHaveText(esCopy.notFound.title);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
      const ayuda = page.locator('main section[lang="en"]');
      await expect(ayuda).toContainText(enCopy.notFound.text);
      await ayuda
        .getByRole("link", { name: enCopy.navigation.backHome })
        .click();
      await expect(page).toHaveURL(/\/en$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });
  }
});
