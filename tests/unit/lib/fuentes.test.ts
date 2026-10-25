import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fueraDeInter, INTER_UNICODES } from "@/lib/fuentes";

describe("recorte de Inter (T-82)", () => {
  it("cubre el español: tildes, ñ, ü, signos de apertura y comillas", () => {
    expect(fueraDeInter("¿Cómo? ¡Ñandú, pingüino! «Sí» – “ok”… © ·")).toEqual(
      [],
    );
  });

  it("detecta caracteres fuera del recorte, sin repetir", () => {
    expect(fueraDeInter("Precio en € y €, flecha →")).toEqual(["€", "→"]);
  });

  it("ignora saltos de línea y tabulaciones", () => {
    expect(fueraDeInter("línea\n\totra")).toEqual([]);
  });

  it("los rangos están ordenados y no se solapan", () => {
    for (let i = 1; i < INTER_UNICODES.length; i++) {
      expect(INTER_UNICODES[i][0]).toBeGreaterThan(INTER_UNICODES[i - 1][1]);
    }
  });

  // Todo texto visible sale de src/content/: si aparece un carácter nuevo, hay que
  // regenerar el recorte (procedimiento en doc/bitacora.md, T-82) y ampliar los rangos.
  const contenido = readdirSync("src/content").filter((f) =>
    f.endsWith(".json"),
  );
  it.each(contenido)("src/content/%s solo usa caracteres del recorte", (f) => {
    expect(fueraDeInter(readFileSync(join("src/content", f), "utf8"))).toEqual(
      [],
    );
  });
});
