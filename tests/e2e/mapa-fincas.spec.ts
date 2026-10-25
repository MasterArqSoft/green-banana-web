import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import copy from "../../src/content/copy.json";

// T-55: mapa de fincas (FR-24) y navegación de retorno (FR-19).
// Las teselas se interceptan y se responden en local: las pruebas no cargan los
// servidores de OpenStreetMap, pero cuentan las peticiones que se habrían hecho.
const TILE = /^https:\/\/tile\.openstreetmap\.org\//;
// PNG transparente de 1×1 px.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);
// Cadena que solo existe en el JS y el CSS de Leaflet, no en el código propio.
const LEAFLET_MARK = "leaflet-zoom-anim";

async function vigilarRed(page: Page) {
  const teselas: string[] = [];
  const leaflet: string[] = [];
  await page.route(TILE, (route) => {
    teselas.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "image/png", body: PNG });
  });
  page.on("response", async (response) => {
    const type = response.request().resourceType();
    if (type !== "script" && type !== "stylesheet") return;
    const body = await response.text().catch(() => "");
    if (body.includes(LEAFLET_MARK)) leaflet.push(response.url());
  });
  return { teselas, leaflet };
}

test.describe("mapa de fincas (FR-24)", () => {
  test("Leaflet y las teselas no se descargan hasta pulsar «Ver mapa» (AC-15, AC-19)", async ({
    page,
  }) => {
    const red = await vigilarRed(page);
    const externas: string[] = [];
    page.on("request", (request) => {
      if (!request.url().startsWith("http://localhost")) {
        externas.push(request.url());
      }
    });
    const svg: string[] = [];
    page.on("request", (request) => {
      if (/mapa-fincas(-movil)?\.svg/.test(request.url()))
        svg.push(request.url());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // El mapa ilustrado no se pide en la carga inicial, solo al acercarse a la sección.
    expect(svg).toEqual([]);
    await page.locator("#mapa-fincas").scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");
    expect(red.leaflet).toEqual([]);
    expect(red.teselas).toEqual([]);
    // El mapa ilustrado de fondo sale del propio sitio: ninguna conexión a terceros.
    await expect(
      page.locator('#mapa-fincas img[src$="mapa-fincas.svg"]'),
    ).toHaveJSProperty("complete", true);
    expect(externas).toEqual([]);
    await expect(page.locator(".leaflet-container")).toHaveCount(0);

    // El aviso está antes del botón (AC-19).
    const aviso = page.locator("#mapa-fincas-aviso");
    await expect(aviso).toContainText(copy.map.consent);
    await expect(
      aviso.getByRole("link", { name: copy.map.privacyLink }),
    ).toHaveAttribute("href", copy.map.privacyUrl);

    await page.getByRole("button", { name: copy.map.showButton }).click();
    const mapa = page.locator(".leaflet-container");
    await expect(mapa).toBeVisible();
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(6);
    await expect.poll(() => red.leaflet.length).toBeGreaterThan(0);
    await expect.poll(() => red.teselas.length).toBeGreaterThan(0);
    // Tras cargar, el foco pasa al mapa para no perderse.
    await expect(mapa).toBeFocused();
  });

  test("la atribución de OpenStreetMap queda visible, sin prefijo (AC-18)", async ({
    page,
  }) => {
    await vigilarRed(page);
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    const atribucion = page.locator(".leaflet-control-attribution");
    await expect(atribucion).toBeVisible();
    await expect(atribucion).toHaveText(copy.map.attribution);
    await expect(
      page.getByRole("button", { name: copy.map.zoomIn }),
    ).toBeVisible();
  });

  test("el popup se abre con el nombre de la finca y cierra en español", async ({
    page,
  }) => {
    await vigilarRed(page);
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    await page.locator(".marcador-acopio.leaflet-marker-icon").click();
    const popup = page.locator(".leaflet-popup");
    await expect(popup).toContainText("Acopio en Santa Marta");
    await expect(popup).toContainText(
      copy.map.acopioDetail.replace("{municipio}", "Santa Marta"),
    );
    await expect(
      popup.getByRole("button", { name: copy.map.closePopup }),
    ).toBeAttached();
  });

  test("con el mapa cargado no hay infracciones WCAG 2.2 AA", async ({
    page,
  }) => {
    await vigilarRed(page);
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(6);
    const results = await new AxeBuilder({ page })
      .include("#mapa-fincas")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const summary = results.violations.map(
      (v) =>
        `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target).join(" | ")}`,
    );
    expect(summary).toEqual([]);
  });
});

test.describe("errores del mapa y reintento (H-03, H-04, T-69)", () => {
  test("si ninguna tesela carga, avisa, vuelve al mapa ilustrado y permite reintentar", async ({
    page,
  }) => {
    let teselasCaidas = true;
    await page.route(TILE, (route) =>
      teselasCaidas
        ? route.fulfill({ status: 500, body: "" })
        : route.fulfill({ status: 200, contentType: "image/png", body: PNG }),
    );
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();

    const estado = page.locator("#mapa-fincas [role='status']");
    await expect(estado).toHaveText(copy.map.error);
    await expect(page.locator(".leaflet-container")).toHaveCount(0);
    await expect(
      page.locator('#mapa-fincas img[src$="mapa-fincas.svg"]'),
    ).toBeVisible();
    // La lista accesible de fincas sigue disponible.
    await expect(page.getByText(copy.map.listTitle)).toBeVisible();
    const reintentar = page.getByRole("button", { name: copy.map.retry });
    await expect(reintentar).toBeFocused();

    teselasCaidas = false;
    await reintentar.click();
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(6);
    await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible();
    await expect(reintentar).toHaveCount(0);
  });

  test("si OpenStreetMap no responde, pasa a error tras la espera", async ({
    page,
  }) => {
    // Las teselas quedan pendientes para siempre; el reloj de la página se adelanta.
    await page.clock.install();
    await page.route(TILE, () => {});
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await page.clock.runFor(16_000);
    await expect(page.locator("#mapa-fincas [role='status']")).toHaveText(
      copy.map.error,
    );
    await expect(
      page.getByRole("button", { name: copy.map.retry }),
    ).toBeVisible();
  });

  test("si falla la descarga de Leaflet, también se puede reintentar", async ({
    page,
  }) => {
    await page.route(TILE, (route) =>
      route.fulfill({ status: 200, contentType: "image/png", body: PNG }),
    );
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Desde aquí, ningún archivo JS nuevo se descarga: falla el import() de Leaflet.
    await page.route("**/_next/static/chunks/**", (route) => route.abort());
    await page.getByRole("button", { name: copy.map.showButton }).click();
    const reintentar = page.getByRole("button", { name: copy.map.retry });
    await expect(reintentar).toBeVisible();
    await expect(page.locator("#mapa-fincas [role='status']")).toHaveText(
      copy.map.error,
    );

    await page.unroute("**/_next/static/chunks/**");
    await reintentar.click();
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(6);
  });
});

// T-78 (auditoría de causa raíz, MAP-01 y MAP-02): la salud del mapa se evalúa por
// vista, no por sesión. Una tesela correcta al principio no puede ocultar fallos
// posteriores. Las teselas que fallan devuelven HTTP 500.
test.describe("salud del mapa por vista (MAP-01, MAP-02, T-78)", () => {
  // Con `fallar`, solo las primeras `buenas` teselas responden bien; el resto, HTTP 500.
  async function teselas(page: Page, buenas = 0) {
    const control = { fallar: false };
    let servidas = 0;
    await page.route(TILE, (route) => {
      servidas += 1;
      return !control.fallar || servidas <= buenas
        ? route.fulfill({ status: 200, contentType: "image/png", body: PNG })
        : route.fulfill({ status: 500, body: "" });
    });
    return control;
  }

  async function sinInfracciones(page: Page) {
    const results = await new AxeBuilder({ page })
      .include("#mapa-fincas")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  }

  const estado = (page: Page) => page.locator("#mapa-fincas [role='status']");

  // Mapa listo y sano: ya cargó alguna tesela, el mapa ilustrado se fue (solo está
  // mientras carga o tras un error) y el estado no anuncia nada. Reemplaza a esperar
  // "networkidle", que Playwright desaconseja.
  async function mapaListo(page: Page) {
    await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible();
    await expect(page.locator("#mapa-fincas picture")).toHaveCount(0);
    await expect(estado(page)).toHaveText("");
  }

  test("fallo parcial: avisa sin quitar el mapa y «Reintentar» recupera las teselas", async ({
    page,
  }) => {
    const control = await teselas(page, 1);
    control.fallar = true;
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();

    await expect(estado(page)).toHaveText(copy.map.partial);
    await expect(page.locator(".leaflet-container")).toHaveCount(1);
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(6);
    const reintentar = page.getByRole("button", { name: copy.map.retry });
    await expect(reintentar).toBeVisible();
    await sinInfracciones(page);

    control.fallar = false;
    await reintentar.click();
    await expect(reintentar).toHaveCount(0);
    await expect(estado(page)).not.toHaveText(copy.map.partial);
    await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible();
  });

  test("carga bien y falla todo al acercar: avisa y «Reintentar» crea un solo mapa", async ({
    page,
  }) => {
    const control = await teselas(page);
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    await mapaListo(page);

    control.fallar = true;
    // Al acercar, todas las teselas del nuevo zoom fallan: basta un clic.
    await page.getByRole("button", { name: copy.map.zoomIn }).click();

    await expect(estado(page)).toHaveText(copy.map.error);
    const reintentar = page.getByRole("button", { name: copy.map.retry });
    await expect(reintentar).toBeFocused();
    await sinInfracciones(page);

    control.fallar = false;
    await reintentar.click();
    await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible();
    await expect(page.locator(".leaflet-container")).toHaveCount(1);
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(6);
  });

  test("carga bien y falla todo al desplazar con el teclado: no queda gris en silencio", async ({
    page,
  }) => {
    const control = await teselas(page);
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    await mapaListo(page);

    control.fallar = true;
    const mapa = page.locator(".leaflet-container");
    await mapa.focus();
    // Mayúsculas + flecha desplaza 240 px (3 × keyboardPanDelta). Se sigue hasta que el
    // mapa pasa a error: por el camino hay un fallo parcial (columnas viejas todavía
    // visibles) y, al quedar la vista sin ninguna tesela válida, se destruye. Leaflet
    // ignora la flecha mientras dura la animación del desplazamiento anterior: antes de
    // cada pulsación se espera a que el panel quede quieto (dos lecturas iguales con
    // 150 ms de diferencia), sin pausas fijas.
    const panel = page.locator(".leaflet-map-pane");
    const estilo = () =>
      panel.getAttribute("style", { timeout: 1000 }).catch(() => null);
    for (let i = 0; i < 20 && (await mapa.count()) > 0; i++) {
      let previo: string | null = null;
      await expect
        .poll(
          async () => {
            const actual = await estilo();
            const quieto = actual === previo;
            previo = actual;
            return quieto || (await mapa.count()) === 0;
          },
          { intervals: [150] },
        )
        .toBe(true);
      if ((await mapa.count()) === 0) break;
      await page.keyboard.press("Shift+ArrowRight");
    }
    await expect(estado(page)).toHaveText(copy.map.error);
    await expect(
      page.getByRole("button", { name: copy.map.retry }),
    ).toBeVisible();
  });

  test("una tesela carga y las demás no responden: tras la espera, avisa del fallo parcial", async ({
    page,
  }) => {
    await page.clock.install();
    // Solo la primera tesela se responde; las demás quedan pendientes.
    let servidas = 0;
    await page.route(TILE, (route) => {
      servidas += 1;
      if (servidas === 1) {
        return route.fulfill({
          status: 200,
          contentType: "image/png",
          body: PNG,
        });
      }
    });
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await page.clock.runFor(16_000);
    await expect(estado(page)).toHaveText(copy.map.partial);
    await expect(page.locator(".leaflet-container")).toHaveCount(1);
  });

  test("tras un lote colgado, «Reintentar» con todo sin respuesta también avisa a los 15 s", async ({
    page,
  }) => {
    // Revisión de la Fase 11 (H1): Leaflet no emite "loading" si el lote anterior no
    // terminó, y la espera dependía de ese evento: el mapa quedaba gris sin aviso.
    await page.clock.install();
    let servidas = 0;
    await page.route(TILE, (route) => {
      servidas += 1;
      if (servidas === 1) {
        return route.fulfill({
          status: 200,
          contentType: "image/png",
          body: PNG,
        });
      }
    });
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await page.clock.runFor(16_000);
    await expect(estado(page)).toHaveText(copy.map.partial);

    // Todo sigue sin responder. La tesela que cargó puede volver de la caché del
    // navegador: el resultado es un aviso parcial o de error, nunca silencio.
    await page.getByRole("button", { name: copy.map.retry }).click();
    await page.clock.runFor(16_000);
    await expect
      .poll(async () =>
        [copy.map.partial, copy.map.error].includes(
          (await estado(page).textContent()) ?? "",
        ),
      )
      .toBe(true);
    await expect(
      page.getByRole("button", { name: copy.map.retry }),
    ).toBeVisible();
  });

  test("salir de la página con el mapa cargando no deja errores ni temporizadores", async ({
    page,
  }) => {
    await page.clock.install();
    await page.route(TILE, () => {});
    await page.goto("/");
    await page.getByRole("button", { name: copy.map.showButton }).click();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    // Navegación del cliente (next/link): el componente se desmonta sin recargar.
    await page.locator('footer a[href$="/terminos"]').click();
    await expect(page).toHaveURL(/\/terminos$/);
    await page.clock.runFor(16_000);
    await expect(page.locator(".leaflet-container")).toHaveCount(0);
    // El fixture hace fallar la prueba si quedó un error de JavaScript.
  });
});

test.describe("navegación de retorno (FR-19, AC-14)", () => {
  for (const path of ["/terminos", "/privacidad", "/garantia"]) {
    test(`${path} vuelve al inicio con el enlace y con la marca`, async ({
      page,
    }) => {
      await page.goto(path);
      const volver = page
        .locator("main")
        .getByRole("link", { name: copy.navigation.backHome });
      const box = await volver.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      await volver.focus();
      await expect(volver).toBeFocused();
      await volver.click();
      await expect(page).toHaveURL(/\/$/);

      await page.goto(path);
      await page.locator("header").getByRole("link").first().click();
      await expect(page).toHaveURL(/\/$/);
    });
  }
});
