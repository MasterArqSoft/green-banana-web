import { LegalPage } from "@/components/ui/LegalPage";
import { legalMetadata } from "@/lib/legal";

export const metadata = legalMetadata("privacidad");

export default function Page() {
  return <LegalPage page="privacidad" />;
}
