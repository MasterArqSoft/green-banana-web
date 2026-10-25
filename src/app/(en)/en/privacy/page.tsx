import { LegalPage } from "@/components/ui/LegalPage";
import { legalMetadata } from "@/lib/legal";

export const metadata = legalMetadata("privacidad", "en");

export default function Page() {
  return <LegalPage page="privacidad" locale="en" />;
}
