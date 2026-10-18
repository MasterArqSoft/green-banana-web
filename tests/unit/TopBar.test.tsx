import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CallButton } from "@/components/CallButton";
import { TopBar } from "@/components/TopBar";
import { site } from "@/lib/content";
import { formatPhone, telHref } from "@/lib/tel";

describe("CallButton", () => {
  it("enlaza al número de site.json (AC-03)", () => {
    const html = renderToStaticMarkup(<CallButton />);
    expect(html).toContain(`href="${telHref(site.phone)}"`);
    expect(html).toContain(">Llamar</a>");
  });

  it("usa el texto recibido y lo incluye en el nombre accesible", () => {
    const html = renderToStaticMarkup(
      <CallButton label="Llamar para precio" />,
    );
    expect(html).toContain(
      `aria-label="Llamar para precio al ${formatPhone(site.phone)}"`,
    );
  });
});

describe("TopBar (FR-01)", () => {
  const html = renderToStaticMarkup(<TopBar />);

  it("muestra la empresa, el acopio y el número", () => {
    expect(html).toContain(site.brand);
    expect(html).toContain(`Acopio en ${site.acopio.city}`);
    expect(html).toContain(formatPhone(site.phone));
  });

  it("incluye el botón Llamar con el enlace tel:", () => {
    expect(html).toContain(`href="${telHref(site.phone)}"`);
  });

  it("no muestra ningún precio (AC-02)", () => {
    expect(html).not.toMatch(/\$\s?\d|COP/);
  });
});
