import { site, zones } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

// Datos estructurados LocalBusiness (NFR-03), desde site.json y zones.json.
// Sin precios (R-01). "<" se escapa para que ningún texto cierre el <script>.
export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.brand,
    url: absoluteUrl("/"),
    telephone: site.phone,
    email: site.legal.correo,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.legal.direccion,
      addressLocality: site.acopio.city,
      addressRegion: site.acopio.department,
      addressCountry: "CO",
    },
    areaServed: zones.map((zone) => zone.name),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
