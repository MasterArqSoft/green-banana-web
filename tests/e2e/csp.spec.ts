import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import copy from "../../src/content/copy.json";

// T-66: CSP por <meta> (SEC-01 parcial). Cualquier violación falla: un script en línea
// sin hash o un origen no declarado quedaría bloqueado en la demo.
const pages = ["/", "/terminos", "/privacidad", "/garantia", "/no-existe"];
const TILE = /^https:\/\/tile\.openstreetmap\.org\//;
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

// Registra las violaciones desde antes de que corra cualquier script de la página.
async function vigilarCsp(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { cspViolations: string[] }).cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      (window as unknown as { cspViolations: string[] }).cspViolations.push(
        `${event.violatedDirective} ${event.blockedURI}`,
      );
    });
  });
  return () =>
    page.evaluate(
      () => (window as unknown as { cspViolations: string[] }).cspViolations,
    );
}

test.describe("Content-Security-Policy (T-66)", () => {
  for (const path of pages) {
    test(`${path} declara la CSP y carga sin violaciones`, async ({ page }) => {
      const violaciones = await vigilarCsp(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expect(
        page.locator('meta[http-equiv="Content-Security-Policy"]'),
      ).toHaveCount(1);
      expect(await violaciones()).toEqual([]);
    });
  }

  test("el mapa interactivo y sus teselas no generan violaciones", async ({
    page,
  }) => {
    await page.route(TILE, (route) =>
      route.fulfill({ status: 200, contentType: "image/png", body: PNG }),
    );
    const violaciones = await vigilarCsp(page);
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible();
    expect(await violaciones()).toEqual([]);
  });

  test("navegar a una página legal y volver no genera violaciones", async ({
    page,
  }) => {
    const violaciones = await vigilarCsp(page);
    await page.goto("/");
    await page
      .locator("#pie")
      .getByRole("link")
      .filter({ hasText: copy.footer.links.terminos })
      .click();
    await expect(page).toHaveURL(/\/terminos$/);
    await page.getByRole("link", { name: copy.navigation.backHome }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.waitForLoadState("networkidle");
    expect(await violaciones()).toEqual([]);
  });
});
