import type { Metadata } from "next";
import { LegalPage, legalValues } from "@/components/ui/LegalPage";
import { legal, site } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";
import { fill } from "@/lib/template";

export const metadata: Metadata = {
  title: `${legal.garantia.title} | ${site.brand}`,
  description: fill(legal.garantia.description, legalValues()),
  alternates: { canonical: absoluteUrl("/garantia") },
};

export default function Page() {
  return <LegalPage page="garantia" />;
}
