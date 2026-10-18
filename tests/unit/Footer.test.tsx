import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/Footer";
import { copy, site } from "@/lib/content";
import { formatPhone, telHref } from "@/lib/tel";

describe("Footer (FR-16, AC-05)", () => {
  const html = renderToStaticMarkup(<Footer />);

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
