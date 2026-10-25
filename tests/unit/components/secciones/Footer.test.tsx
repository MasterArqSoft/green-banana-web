import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/secciones/Footer";
import { getContent, site } from "@/lib/content";
import { formatPhone, telHref } from "@/lib/tel";

const { copy } = getContent("es-CO");

describe("Footer (FR-16, AC-05)", () => {
  const html = renderToStaticMarkup(<Footer locale="es-CO" />);

  it("muestra la identidad del vendedor desde site.json", () => {
    expect(html).toContain(site.legal.razonSocial);
    expect(html).toContain(site.legal.nit);
    expect(html).toContain(site.legal.direccion);
  });

  it("enlaza el teléfono y el correo", () => {
    expect(html).toContain(`href="${telHref(site.phone)}"`);
    expect(html).toContain(formatPhone(site.phone));
    expect(html).toContain(`href="mailto:${site.legal.correo}"`);
  });

  it("tiene el enlace visible a la SIC", () => {
    expect(html).toContain(`href="${site.sicUrl}"`);
    expect(html).toContain(copy.footer.sic);
  });

  it("incluye PQR y los enlaces legales", () => {
    expect(html).toContain("PQR");
    expect(html).toContain('href="/terminos"');
    expect(html).toContain('href="/privacidad"');
    expect(html).toContain('href="/garantia"');
  });
});

describe("Footer en inglés (FR-26, AC-26)", () => {
  const html = renderToStaticMarkup(<Footer locale="en" />);

  it("enlaza las páginas legales inglesas", () => {
    expect(html).toContain('href="/en/terms"');
    expect(html).toContain('href="/en/privacy"');
    expect(html).toContain('href="/en/guarantee"');
    expect(html).not.toContain('href="/terminos"');
  });

  it("conserva sin traducir la identidad, el teléfono y el correo", () => {
    expect(html).toContain(site.legal.razonSocial);
    expect(html).toContain(site.legal.nit);
    expect(html).toContain(`href="${telHref(site.phone)}"`);
    expect(html).toContain(`href="mailto:${site.legal.correo}"`);
    expect(html).toContain(getContent("en").copy.footer.sic);
  });
});
