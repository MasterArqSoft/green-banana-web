import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// T-38: auditoría automática de accesibilidad con axe (WCAG 2.2 AA, NFR-02).
// La prueba con lector de pantalla es manual (ver doc/bitacora.md).
// /no-existe: la página 404 propia (src/app/not-found.tsx).
const pages = ["/", "/terminos", "/privacidad", "/garantia", "/no-existe"];
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const path of pages) {
  test(`${path} no tiene infracciones WCAG 2.2 AA`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(tags).analyze();
    const summary = results.violations.map(
      (v) =>
        `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target).join(" | ")}`,
    );
    expect(summary).toEqual([]);
  });
}

test("con el acordeón abierto y el botón flotante visible", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await page
    .locator("#preguntas-frecuentes details")
    .evaluateAll((items) => items.forEach((d) => d.setAttribute("open", "")));
  if (isMobile) {
    await page.locator("#presentaciones").scrollIntoViewIfNeeded();
  }
  const results = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
