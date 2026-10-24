import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MAIN_ID } from "@/components/ui/SkipLink";
import { copy } from "@/lib/content";

// Página 404 (out/404.html). Lleva el <main> destino de "Saltar al contenido" (T-58) y
// el mismo enlace de retorno que las páginas legales (FR-19).
export function NotFoundPage() {
  return (
    <main id={MAIN_ID} className="contenedor flex-1 py-12">
      <div className="max-w-prose">
        <h1 className="text-3xl font-semibold text-hoja md:text-4xl">
          {copy.notFound.title}
        </h1>
        <p className="mt-4">{copy.notFound.text}</p>
        <Link
          href="/"
          prefetch={false}
          className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-hoja underline underline-offset-4"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          {copy.navigation.backHome}
        </Link>
      </div>
    </main>
  );
}
