import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import copy from "../../src/content/copy.json";

// T-55: mapa de fincas (FR-24) y navegación de retorno (FR-19).
// Las teselas se interceptan y se responden en local: las pruebas no cargan los
// servidores de OpenStreetMap, pero cuentan las peticiones que se habrían hecho.
const TILE = /^https:\/\/tile\.openstreetmap\.org\//;
// PNG transparente de 1×1 px.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);
// Cadena que solo existe en el JS y el CSS de Leaflet, no en el código propio.
const LEAFLET_MARK = "leaflet-zoom-anim";

async function vigilarRed(page: Page) {
  const teselas: string[] = [];
  const leaflet: string[] = [];
  await page.route(TILE, (route) => {
    teselas.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "image/png", body: PNG });
  });
  page.on("response", async (response) => {
    const type = response.request().resourceType();
    if (type !== "script" && type !== "stylesheet") return;
    const body = await response.text().catch(() => "");
    if (body.includes(LEAFLET_MARK)) leaflet.push(response.url());
  });
  return { teselas, leaflet };
}

test.describe("mapa de fincas (FR-24)", () => {
  test("Leaflet y las teselas no se descargan hasta pulsar «Ver mapa» (AC-15, AC-19)", async ({
    page,
  }) => {
    const red = await vigilarRed(page);
    const externas: string[] = [];
    page.on("request", (request) => {
      if (!request.url().startsWith("http://localhost")) {
        externas.push(request.url());
      }
    });
    await page.goto("/");
    await page.locator("#mapa-fincas").scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");
    expect(red.leaflet).toEqual([]);
    expect(red.teselas).toEqual([]);
    // El mapa ilustrado de fondo sale del propio sitio: ninguna conexión a terceros.
    await expect(
      page.locator('#mapa-fincas img[src$="mapa-fincas.svg"]'),
    ).toHaveJSProperty("complete", true);
    expect(externas).toEqual([]);
    await expect(page.locator(".leaflet-container")).toHaveCount(0);

    // El aviso está antes del botón (AC-19).
    const aviso = page.locator("#mapa-fincas-aviso");
    await expect(aviso).toContainText(copy.map.consent);
    await expect(
      aviso.getByRole("link", { name: copy.map.privacyLink }),
    ).toHaveAttribute("href", copy.map.privacyUrl);

    await page.getByRole("button", { name: copy.map.showButton }).click();
    const mapa = page.locator(".leaflet-container");
    await expect(mapa).toBeVisible();
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(6);
    await expect.poll(() => red.leaflet.length).toBeGreaterThan(0);
    await expect.poll(() => red.teselas.length).toBeGreaterThan(0);
    // Tras cargar, el foco pasa al mapa para no perderse.
    await expect(mapa).toBeFocused();
  });

  test("la atribución de OpenStreetMap queda visible, sin prefijo (AC-18)", async ({
    page,
  }) => {
    await vigilarRed(page);
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    const atribucion = page.locator(".leaflet-control-attribution");
    await expect(atribucion).toBeVisible();
    await expect(atribucion).toHaveText(copy.map.attribution);
    await expect(
      page.getByRole("button", { name: copy.map.zoomIn }),
    ).toBeVisible();
  });

  test("el popup se abre con el nombre de la finca y cierra en español", async ({
    page,
  }) => {
    await vigilarRed(page);
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    await page.locator(".marcador-acopio.leaflet-marker-icon").click();
    const popup = page.locator(".leaflet-popup");
    await expect(popup).toContainText("Acopio en Santa Marta");
    await expect(popup).toContainText(copy.map.acopioLabel);
    await expect(
      popup.getByRole("button", { name: copy.map.closePopup }),
    ).toBeAttached();
  });

  test("con el mapa cargado no hay infracciones WCAG 2.2 AA", async ({
    page,
  }) => {
    await vigilarRed(page);
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(6);
    const results = await new AxeBuilder({ page })
      .include("#mapa-fincas")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const summary = results.violations.map(
      (v) =>
        `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target).join(" | ")}`,
    );
    expect(summary).toEqual([]);
  });
});

test.describe("navegación de retorno (FR-19, AC-14)", () => {
  for (const path of ["/terminos", "/privacidad", "/garantia"]) {
    test(`${path} vuelve al inicio con el enlace y con la marca`, async ({
      page,
    }) => {
      await page.goto(path);
      const volver = page
        .locator("main")
        .getByRole("link", { name: copy.navigation.backHome });
      const box = await volver.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      await volver.focus();
      await expect(volver).toBeFocused();
      await volver.click();
      await expect(page).toHaveURL(/\/$/);

      await page.goto(path);
      await page.locator("header").getByRole("link").first().click();
      await expect(page).toHaveURL(/\/$/);
    });
  }
});
