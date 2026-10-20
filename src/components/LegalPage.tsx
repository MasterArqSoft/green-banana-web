import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { copy, legal, site } from "@/lib/content";
import type { LegalPageKey } from "@/lib/schema";
import { formatPhone } from "@/lib/tel";
import { fill } from "@/lib/template";

// Datos de site.json que pueden usar los párrafos de legal.json.
export function legalValues() {
  return {
    razonSocial: site.legal.razonSocial,
    nit: site.legal.nit,
    direccion: site.legal.direccion,
    correo: site.legal.correo,
    telefono: formatPhone(site.phone),
    ciudad: site.acopio.city,
  };
}

// Página legal (FR-18): términos, privacidad o garantía, desde legal.json.
export function LegalPage({ page }: { page: LegalPageKey }) {
  const { title, sections } = legal[page];
  const values = legalValues();
  return (
    <main className="contenedor flex-1 py-12">
      <article className="max-w-prose">
        {/* Retorno al inicio antes del título (FR-19, AC-14); área táctil de 44 px. */}
        <Link
          href="/"
          className="mb-4 inline-flex min-h-11 items-center gap-2 font-semibold text-hoja underline underline-offset-4"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          {copy.navigation.backHome}
        </Link>
        <h1 className="text-3xl font-semibold text-hoja md:text-4xl">
          {title}
        </h1>
        {legal.draftNotice && (
          <p
            role="note"
            className="mt-4 rounded-control bg-hoja-claro p-3 text-sm font-semibold"
          >
            {legal.draftNotice}
          </p>
        )}
        {sections.map((section) => (
          <section key={section.heading} className="mt-8">
            <h2 className="text-xl font-semibold text-hoja">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3">
                {fill(paragraph, values)}
              </p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}
