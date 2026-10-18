import { ImageResponse } from "next/og";
import { copy, site } from "@/lib/content";
import { OG_IMAGE_SIZE } from "@/lib/seo";
import { fill } from "@/lib/template";

// Imagen para compartir en redes (Open Graph, 1200 × 630), generada en el build como
// out/og.png. Se usa una ruta con extensión y no la convención opengraph-image porque
// esta exporta un archivo sin extensión, que GitHub Pages no serviría como PNG.
// Provisional: cuando llegue la foto del hero (T-04), se reemplaza por un recorte de ella.

// Requerido por `output: "export"`: la imagen se genera una sola vez en el build.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "#2f6b3a",
        color: "#fffbf2",
      }}
    >
      <div style={{ fontSize: 40, color: "#f2b705" }}>{site.brand}</div>
      <div style={{ fontSize: 72, fontWeight: 700, marginTop: 24 }}>
        {fill(copy.hero.title, { ciudad: site.acopio.city })}
      </div>
    </div>,
    OG_IMAGE_SIZE,
  );
}
