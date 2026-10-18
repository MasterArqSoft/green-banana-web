import type { Metadata } from "next";
import { LegalPage, legalValues } from "@/components/LegalPage";
import { legal, site } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";
import { fill } from "@/lib/template";

export const metadata: Metadata = {
  title: `${legal.privacidad.title} | ${site.brand}`,
  description: fill(legal.privacidad.description, legalValues()),
  alternates: { canonical: absoluteUrl("/privacidad") },
};

export default function Page() {
  return <LegalPage page="privacidad" />;
}
