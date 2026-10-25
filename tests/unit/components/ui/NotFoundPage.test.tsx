import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { MAIN_ID } from "@/components/ui/SkipLink";
import { getContent } from "@/lib/content";

const { copy } = getContent("es-CO");

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

  it("el español va primero y la ayuda en inglés está marcada con lang=en (AC-28)", () => {
    const en = getContent("en").copy;
    const ayuda = html.match(/<section lang="en"[\s\S]*<\/section>/)?.[0] ?? "";
    // React escribe el apóstrofo como &#x27;.
    expect(ayuda).toContain(en.notFound.title.replace("'", "&#x27;"));
    expect(ayuda).toContain(en.notFound.text);
    expect(ayuda).toMatch(/<a [^>]*href="\/en"[^>]*>/);
    expect(ayuda).toContain(en.navigation.backHome);
    expect(html.indexOf("<h1")).toBeLessThan(html.indexOf(ayuda));
    expect(html.match(/<h1/g)).toHaveLength(1);
  });
});
