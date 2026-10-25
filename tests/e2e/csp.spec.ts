import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import enCopy from "../../src/content/en/copy.json";
import copy from "../../src/content/es-CO/copy.json";
import {
  CSP,
  CSP_TODA_RESPUESTA,
  cspDeMeta,
  politicasCsp,
  revisarCabeceras,
} from "../../src/lib/cabeceras";

// T-66: CSP por <meta> (SEC-01 parcial). Cualquier violación falla: un script en línea
// sin hash o un origen no declarado quedaría bloqueado en la demo.
const pages = [
  "/",
  "/terminos",
  "/privacidad",
  "/garantia",
  "/en",
  "/en/terms",
  "/en/privacy",
  "/en/guarantee",
  "/no-existe",
  "/en/no-existe",
];
const TILE = /^https:\/\/tile\.openstreetmap\.org\//;
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

// Registra las violaciones desde antes de que corra cualquier script de la página.
async function vigilarCsp(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { cspViolations: string[] }).cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      (window as unknown as { cspViolations: string[] }).cspViolations.push(
        `${event.violatedDirective} ${event.blockedURI}`,
      );
    });
  });
  return () =>
    page.evaluate(
      () => (window as unknown as { cspViolations: string[] }).cspViolations,
    );
}

test.describe("Content-Security-Policy (T-66)", () => {
  for (const path of pages) {
    test(
      `${path} declara la CSP y carga sin violaciones`,
      { tag: "@smoke" },
      async ({ page }) => {
        const violaciones = await vigilarCsp(page);
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await expect(
          page.locator('meta[http-equiv="Content-Security-Policy"]'),
        ).toHaveCount(1);
        expect(await violaciones()).toEqual([]);
      },
    );
  }

  for (const [inicio, boton] of [
    ["/", copy.map.showButton],
    ["/en", enCopy.map.showButton],
  ]) {
    test(`${inicio}: el mapa interactivo y sus teselas no generan violaciones`, async ({
      page,
    }) => {
      await page.route(TILE, (route) =>
        route.fulfill({ status: 200, contentType: "image/png", body: PNG }),
      );
      const violaciones = await vigilarCsp(page);
      await page.goto(inicio);
      await page.getByRole("button", { name: boton }).click();
      await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible();
      expect(await violaciones()).toEqual([]);
    });
  }

  test("cambiar de idioma con el selector no genera violaciones", async ({
    page,
  }) => {
    const violaciones = await vigilarCsp(page);
    await page.goto("/garantia");
    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/guarantee$/);
    await page.waitForLoadState("networkidle");
    expect(await violaciones()).toEqual([]);
  });

  test("navegar a una página legal y volver no genera violaciones", async ({
    page,
  }) => {
    const violaciones = await vigilarCsp(page);
    await page.goto("/");
    await page
      .locator("#pie")
      .getByRole("link")
      .filter({ hasText: copy.footer.links.terminos })
      .click();
    await expect(page).toHaveURL(/\/terminos$/);
    await page.getByRole("link", { name: copy.navigation.backHome }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.waitForLoadState("networkidle");
    expect(await violaciones()).toEqual([]);
  });
});

// T-115 (DR-06, F-11): cabeceras de producción generadas en out/ y emitidas por
// tests/e2e/server.mjs como documenta el proveedor (Cloudflare por defecto; Azure con
// HOSTING_PROVEEDOR=azure). Cada página recibe dos políticas, la mínima de toda respuesta
// (frame-ancestors 'none') y la suya completa (la de la <meta> más frame-ancestors); con
// las dos activas, las pruebas de arriba siguen sin violaciones en los tres motores. La
// 404 recibe la mínima por cabecera y la completa por <meta> (N-6). Es el servidor de
// pruebas, no el hosting: F-11 solo cierra al verificar el dominio final (tras R-08).
test.describe("cabeceras de seguridad de producción (T-115)", () => {
  for (const path of pages.filter((p) => !p.includes("no-existe"))) {
    test(`${path}: cabeceras completas y CSP en cabecera igual a la <meta>`, async ({
      page,
    }) => {
      const respuesta = await page.goto(path);
      const cabeceras = respuesta?.headers() ?? {};
      expect(revisarCabeceras(cabeceras, "html")).toEqual([]);
      const meta = await page
        .locator('meta[http-equiv="Content-Security-Policy"]')
        .getAttribute("content");
      expect(politicasCsp(cabeceras[CSP.toLowerCase()])).toContain(
        `${meta}; frame-ancestors 'none'`,
      );
    });
  }

  for (const path of pages.filter((p) => p.includes("no-existe"))) {
    test(`${path}: la 404 lleva frame-ancestors por cabecera y la CSP completa por <meta>`, async ({
      request,
    }) => {
      const noExiste = await request.get(path);
      expect(noExiste.status()).toBe(404);
      const cabeceras = noExiste.headers();
      expect(
        revisarCabeceras(cabeceras, "404", {
          metaCsp: cspDeMeta(await noExiste.text()),
        }),
      ).toEqual([]);
      expect(politicasCsp(cabeceras[CSP.toLowerCase()])).toEqual([
        CSP_TODA_RESPUESTA,
      ]);
    });
  }

  test("los recursos llevan las cabeceras comunes y la configuración del hosting no se sirve", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const script = await page
      .locator('script[src*="/_next/static/"]')
      .first()
      .getAttribute("src");
    const recurso = await request.get(script ?? "");
    expect(recurso.status()).toBe(200);
    expect(revisarCabeceras(recurso.headers(), "recurso")).toEqual([]);
    for (const archivo of ["/_headers", "/staticwebapp.config.json"]) {
      expect((await request.get(archivo)).status()).toBe(404);
    }
  });

  // La protección es efectiva, no solo declarada: el navegador no muestra la página ni la
  // 404 dentro de un iframe de otro origen. La página que enmarca la sirve un servidor
  // local propio (127.0.0.1, otro origen que localhost): desde about:blank o una respuesta
  // interceptada, Chromium bloquea cualquier marco a localhost (acceso a la red local) y la
  // prueba no distinguiría nada. El control es otro servidor propio en localhost, sin CSP:
  // ese sí se enmarca (todo lo que sirve el sitio lleva frame-ancestors). Solo en
  // Chromium: Firefox no responde al evaluar un marco bloqueado.
  test.describe("enmarcado", () => {
    test.skip(({ browserName }) => browserName !== "chromium", "Solo Chromium");
    let marco: Server;
    let libre: Server;
    let origen = "";
    let control = "";
    let sitio = "";
    const escuchar = async (servidor: Server, host: string) => {
      await new Promise<void>((listo) => servidor.listen(0, host, listo));
      return `http://${host}:${(servidor.address() as AddressInfo).port}`;
    };
    test.beforeAll(async ({ baseURL }) => {
      // La página que enmarca recibe la URL completa del marco.
      marco = createServer((req, res) => {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(
          `<iframe src="${decodeURIComponent((req.url ?? "/").slice(1))}" title="marco"></iframe>`,
        );
      });
      libre = createServer((_req, res) => {
        res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
        res.end("control sin CSP");
      });
      origen = await escuchar(marco, "127.0.0.1");
      control = `${await escuchar(libre, "localhost")}/`;
      sitio = baseURL ?? "";
    });
    test.afterAll(async () => {
      for (const servidor of [marco, libre]) {
        await new Promise<void>((listo) => servidor.close(() => listo()));
      }
    });

    const contenido = async (page: Page, url: string) => {
      await page.goto(`${origen}/${encodeURIComponent(url)}`);
      // Margen para que cargue si no estuviera protegida.
      await page.waitForTimeout(1000);
      const frame = page.frames()[1];
      return (
        (await frame?.evaluate(() => document.body?.innerText.length ?? 0)) ?? 0
      );
    };

    test("control: un archivo sin CSP sí se deja enmarcar", async ({
      page,
    }) => {
      expect(await contenido(page, control)).toBeGreaterThan(0);
    });

    for (const path of ["/", "/en/terms", "/no-existe", "/en/no-existe"]) {
      test(`${path} no se deja enmarcar`, async ({ page }) => {
        expect(await contenido(page, `${sitio}${path}`)).toBe(0);
      });
    }
  });
});
