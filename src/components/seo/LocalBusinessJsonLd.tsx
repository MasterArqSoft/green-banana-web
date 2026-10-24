import { fincas, site, zones } from "@/lib/content";
import { absoluteUrl, jsonLd, ogImage } from "@/lib/seo";

// Datos estructurados LocalBusiness (NFR-03), desde site.json y zones.json.
// Sin precios ni catálogo de ofertas (R-01). jsonLd() escapa "<" para que ningún texto
// cierre el <script>. geo sale del acopio de fincas.json (SEO-07, T-65).
export function LocalBusinessJsonLd() {
  const acopio = fincas.fincas.find((finca) => finca.tipo === "acopio");
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.brand,
    url: absoluteUrl("/"),
    image: ogImage().url,
    telephone: site.phone,
    email: site.legal.correo,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.legal.direccion,
      addressLocality: site.acopio.city,
      addressRegion: site.acopio.department,
      addressCountry: "CO",
    },
    ...(acopio && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: acopio.lat,
        longitude: acopio.lng,
      },
    }),
    areaServed: zones.map((zone) => zone.name),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
    />
  );
}
