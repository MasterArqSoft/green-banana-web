import { homeMetadata } from "@/lib/seo";
import { Landing } from "@/app/landing";

export const metadata = homeMetadata("es-CO");

export default function Inicio() {
  return <Landing locale="es-CO" />;
}
