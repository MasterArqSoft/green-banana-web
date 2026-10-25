import { LegalPage } from "@/components/ui/LegalPage";
import { legalMetadata } from "@/lib/legal";

export const metadata = legalMetadata("garantia", "en");

export default function Page() {
  return <LegalPage page="garantia" locale="en" />;
}
