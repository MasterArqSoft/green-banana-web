import { LegalPage } from "@/components/ui/LegalPage";
import { legalMetadata } from "@/lib/legal";

export const metadata = legalMetadata("terminos", "en");

export default function Page() {
  return <LegalPage page="terminos" locale="en" />;
}
