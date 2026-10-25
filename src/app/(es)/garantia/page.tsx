import { LegalPage } from "@/components/ui/LegalPage";
import { legalMetadata } from "@/lib/legal";

export const metadata = legalMetadata("garantia", "es-CO");

export default function Page() {
  return <LegalPage page="garantia" locale="es-CO" />;
}
