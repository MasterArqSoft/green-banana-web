import type { Metadata } from "next";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { copy, site } from "@/lib/content";
import { fill } from "@/lib/template";

export const metadata: Metadata = {
  title: fill(copy.seo.legalTitle, {
    pagina: copy.notFound.title,
    marca: site.brand,
  }),
};

export default function NotFound() {
  return <NotFoundPage />;
}
