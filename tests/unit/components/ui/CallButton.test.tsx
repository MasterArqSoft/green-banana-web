import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CallButton } from "@/components/ui/CallButton";
import { getContent, site } from "@/lib/content";
import { formatPhone, telHref } from "@/lib/tel";

const { copy } = getContent("es-CO");

describe("CallButton", () => {
  it("enlaza al número de site.json (AC-03)", () => {
    const html = renderToStaticMarkup(<CallButton locale="es-CO" />);
    expect(html).toContain(`href="${telHref(site.phone)}"`);
    expect(html).toContain(`>${copy.callButton.label}</a>`);
  });

  it("usa el texto recibido y lo incluye en el nombre accesible", () => {
    const html = renderToStaticMarkup(
      <CallButton locale="es-CO" label="Llamar para precio" />,
    );
    expect(html).toContain(
      `aria-label="Llamar para precio al ${formatPhone(site.phone)}"`,
    );
  });

  it("con context, lo agrega al nombre accesible después del texto visible (T-59)", () => {
    const html = renderToStaticMarkup(
      <CallButton locale="es-CO" label="Llamar para precio" context="Kilo" />,
    );
    expect(html).toContain(
      `aria-label="Llamar para precio: Kilo, al ${formatPhone(site.phone)}"`,
    );
    expect(html).toContain(">Llamar para precio</a>");
  });

  it("en inglés cambia el texto, no el número (AC-26)", () => {
    const html = renderToStaticMarkup(
      <CallButton locale="en" label="Call for price" context="Kilo" />,
    );
    expect(html).toContain(`href="${telHref(site.phone)}"`);
    expect(html).toContain(
      `aria-label="Call for price: Kilo, ${formatPhone(site.phone)}"`,
    );
    expect(renderToStaticMarkup(<CallButton locale="en" />)).toContain(
      `>${getContent("en").copy.callButton.label}</a>`,
    );
  });
});
