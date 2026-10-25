import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MAIN_ID } from "@/components/ui/SkipLink";
import { getContent } from "@/lib/content";
import { rutaDe } from "@/lib/i18n";

// Página 404 (out/404.html), la misma para toda URL desconocida: el hosting estático no
// elige una 404 por idioma (AC-28). Español como idioma principal y una ayuda en inglés
// marcada con lang="en", cada una con el enlace a su inicio. Lleva el <main> destino de
// "Saltar al contenido" (T-58) y el mismo enlace de retorno que las páginas legales (FR-19).
export function NotFoundPage() {
  const es = getContent("es-CO").copy;
  const en = getContent("en").copy;
  const linkClass =
    "mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-hoja underline underline-offset-4";
  return (
    <main id={MAIN_ID} className="contenedor flex-1 py-12">
      <div className="max-w-prose">
        <h1 className="text-3xl font-semibold text-hoja md:text-4xl">
          {es.notFound.title}
        </h1>
        <p className="mt-4">{es.notFound.text}</p>
        <Link
          href={rutaDe("inicio", "es-CO")}
          prefetch={false}
          className={linkClass}
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          {es.navigation.backHome}
        </Link>
        <section
          lang="en"
          aria-labelledby="no-encontrada-en"
          className="mt-10 border-t border-hoja/15 pt-6"
        >
          <h2 id="no-encontrada-en" className="text-xl font-semibold text-hoja">
            {en.notFound.title}
          </h2>
          <p className="mt-3">{en.notFound.text}</p>
          <Link
            href={rutaDe("inicio", "en")}
            prefetch={false}
            hrefLang="en"
            className={linkClass}
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
            {en.navigation.backHome}
          </Link>
        </section>
      </div>
    </main>
  );
}
