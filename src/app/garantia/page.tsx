import type { Metadata } from "next";
import { LegalPage, legalValues } from "@/components/LegalPage";
import { legal, site } from "@/lib/content";
import { fill } from "@/lib/template";

export const metadata: Metadata = {
  title: `${legal.garantia.title} | ${site.brand}`,
  description: fill(legal.garantia.description, legalValues()),
};

export default function Page() {
  return <LegalPage page="garantia" />;
}
