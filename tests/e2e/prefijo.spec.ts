import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import copy from "../../src/content/copy.json";

// Prueba de humo del artefacto publicado en GitHub Pages (T-71, H-01). Corre con
// playwright.prefijo.config.ts sobre out-pages/, servido solo bajo el prefijo: un
// enlace o recurso sin prefijo da 404 y falla. Las rutas son relativas a baseURL y
// llevan barra final, como en la demo (trailingSlash con prefijo, next.config.ts).
const TILE = /^https:\/\/tile\.openstreetmap\.org\//;
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

// Respuestas con error del propio sitio y violaciones de la CSP durante la visita.
async function vigilar(page: Page) {
  const errores: string[] = [];
  page.on("response", (response) => {
    const url = response.url();
    if (!url.startsWith("http://localhost")) return;
    // La única respuesta 404 esperada es el documento de una ruta inexistente.
    const esperado =
      response.request().resourceType() === "document" &&
      url.endsWith("/no-existe");
    if (response.status() >= 400 && !esperado) {
      errores.push(`${response.status()} ${url}`);
    }
  });
  await page.addInitScript(() => {
    (window as unknown as { csp: string[] }).csp = [];
    document.addEventListener("securitypolicyviolation", (event) =>
      (window as unknown as { csp: string[] }).csp.push(
        `${event.violatedDirective} ${event.blockedURI}`,
      ),
    );
  });
  const violaciones = () =>
    page.evaluate(() => (window as unknown as { csp: string[] }).csp);
  return { errores, violaciones };
}

test.describe("artefacto con prefijo de GitHub Pages (T-71)", () => {
  for (const ruta of [
    "",
    "terminos/",
    "privacidad/",
    "garantia/",
    "no-existe",
  ]) {
    test(`/${ruta} carga completa, sin recursos rotos ni violaciones de CSP`, async ({
      page,
    }) => {
      const { errores, violaciones } = await vigilar(page);
      await page.goto(ruta);
      // Baja hasta el pie para que se pidan también las imágenes diferidas.
      await page.locator("#pie").scrollIntoViewIfNeeded();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("main#contenido")).toHaveCount(1);
      expect(errores).toEqual([]);
      expect(await violaciones()).toEqual([]);
    });
  }

  test("las imágenes de la landing y el mapa ilustrado se ven", async ({
    page,
  }) => {
    await page.goto("");
    await page.locator("#mapa-fincas").scrollIntoViewIfNeeded();
    const svg = page.locator('#mapa-fincas img[src*="mapa-fincas"]');
    await expect(svg).toHaveJSProperty("complete", true);
    const rotas = await page.locator("img").evaluateAll((imgs) =>
      imgs
        .filter((img) => (img as HTMLImageElement).complete)
        .filter((img) => (img as HTMLImageElement).naturalWidth === 0)
        .map((img) => (img as HTMLImageElement).currentSrc),
    );
    expect(rotas).toEqual([]);
  });

  test("ir a una página legal y volver al inicio, con el prefijo", async ({
    page,
  }) => {
    const { errores } = await vigilar(page);
    await page.goto("");
    await page
      .locator("#pie")
      .getByRole("link", { name: copy.footer.links.privacidad })
      .click();
    await expect(page).toHaveURL(/\/green-banana-web\/privacidad\/$/);
    await page.getByRole("link", { name: copy.navigation.backHome }).click();
    await expect(page).toHaveURL(/\/green-banana-web\/$/);
    await expect(page.locator("#hero")).toBeVisible();
    expect(errores).toEqual([]);
  });

  test("el mapa interactivo carga Leaflet bajo el prefijo", async ({
    page,
  }) => {
    await page.route(TILE, (route) =>
      route.fulfill({ status: 200, contentType: "image/png", body: PNG }),
    );
    const { errores, violaciones } = await vigilar(page);
    await page.goto("");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(6);
    expect(errores).toEqual([]);
    expect(await violaciones()).toEqual([]);
  });

  test("íconos, robots, sitemap y security.txt se publican bajo el prefijo", async ({
    page,
  }) => {
    await page.goto("");
    const enlaces = await page
      .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
      .evaluateAll((links) =>
        links.map((link) => (link as HTMLLinkElement).href),
      );
    // Con prefijo, Next no enlaza favicon.ico (lo espera en la raíz del dominio):
    // se enlazan icon.svg y apple-icon.png, y favicon.ico se publica igual.
    expect(enlaces.length).toBeGreaterThanOrEqual(2);
    for (const url of enlaces) {
      expect(url).toContain("/green-banana-web/");
      expect((await page.request.get(url)).status()).toBe(200);
    }
    for (const archivo of ["favicon.ico", "robots.txt", "sitemap.xml"]) {
      expect((await page.request.get(archivo)).status()).toBe(200);
    }
    // El sitemap usa las mismas URL que el canonical de cada página (con barra final).
    const sitemap = await (await page.request.get("sitemap.xml")).text();
    await page.goto("terminos/");
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(canonical).toMatch(/\/terminos\/$/);
    expect(sitemap).toContain(`<loc>${canonical}</loc>`);

    const security = await page.request.get(".well-known/security.txt");
    expect(security.status()).toBe(200);
    expect(await security.text()).toContain(
      "/green-banana-web/.well-known/security.txt",
    );
  });
});
