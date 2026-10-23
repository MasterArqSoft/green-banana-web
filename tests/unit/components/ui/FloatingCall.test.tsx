import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FloatingCall } from "@/components/ui/FloatingCall";
import { site } from "@/lib/content";
import { telHref } from "@/lib/tel";

// El comportamiento al hacer scroll (aparecer tras el hero, esconderse en el pie)
// se prueba en el navegador con Playwright (T-37).
describe("FloatingCall (FR-17)", () => {
  const html = renderToStaticMarkup(<FloatingCall />);

  it("contiene el botón de llamada al número de site.json", () => {
    expect(html).toContain(`href="${telHref(site.phone)}"`);
  });

  it("empieza oculto e inerte hasta que el hero sale de la pantalla", () => {
    expect(html).toMatch(/<div[^>]*inert=""/);
    expect(html).toContain("translate-y-[150%]");
  });

  it("es un botón redondo solo con ícono y conserva el texto para lectores de pantalla", () => {
    expect(html).toContain("rounded-full");
    expect(html).toMatch(/<span class="sr-only">[^<]+<\/span>/);
    expect(html).toMatch(/aria-label="[^"]+"/);
  });

  it("solo se muestra en móvil", () => {
    expect(html).toContain("md:hidden");
  });
});
