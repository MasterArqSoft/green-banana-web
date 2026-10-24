import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { MAIN_ID } from "@/components/ui/SkipLink";
import { copy } from "@/lib/content";

describe("NotFoundPage (404)", () => {
  const html = renderToStaticMarkup(<NotFoundPage />);

  it("tiene el <main> destino de «Saltar al contenido» (T-58)", () => {
    expect(html).toContain(`<main id="${MAIN_ID}"`);
  });

  it("muestra los textos de copy.json y el enlace de retorno al inicio", () => {
    expect(html).toContain(copy.notFound.title);
    expect(html).toContain(copy.notFound.text);
    expect(html).toContain('href="/"');
    expect(html).toContain(copy.navigation.backHome);
  });
});
