import { expect, test } from "./fixtures";

// T-33: composición y revisión móvil a 360 px. Las ocho páginas de los dos idiomas (T-98).
const pages = [
  "/",
  "/terminos",
  "/privacidad",
  "/garantia",
  "/en",
  "/en/terms",
  "/en/privacy",
  "/en/guarantee",
];

test.describe("composición de la landing", () => {
  for (const inicio of ["/", "/en"]) {
    test(`${inicio}: las secciones siguen el orden del spec (FR-01 a FR-17)`, async ({
      page,
    }) => {
      await page.goto(inicio);
      const order = [
        "header",
        "#hero",
        "#presentaciones",
        "#verde-de-verdad",
        "#origen",
        "#mapa-fincas",
        "#recetas",
        "#beneficios",
        "#como-funciona",
        "#cobertura",
        "#negocios",
        "#preguntas-frecuentes",
        "#garantia",
        "#pie",
      ];
      const tops = await Promise.all(
        order.map((selector) =>
          page
            .locator(selector)
            .first()
            .evaluate((el) => el.getBoundingClientRect().top + window.scrollY),
        ),
      );
      expect(tops).toEqual([...tops].sort((a, b) => a - b));
    });
  }

  for (const path of pages) {
    test(`${path} no se desborda a lo ancho`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("móvil a 360 px", () => {
  test.skip(({ isMobile }) => !isMobile, "Solo en móvil");

  for (const [inicio, cta] of [
    ["/", /^Llamar para pedir/],
    ["/en", /^Call to order/],
  ] as const) {
    test(`${inicio}: el H1 y el botón Llamar se ven sin hacer scroll (AC-01)`, async ({
      page,
    }) => {
      await page.goto(inicio);
      await expect(page.locator("h1")).toBeInViewport();
      await expect(
        page.locator("#hero").getByRole("link", { name: cta }),
      ).toBeInViewport();
    });
  }

  test("el botón flotante aparece tras el hero y se esconde en el pie (FR-17)", async ({
    page,
  }) => {
    await page.goto("/");
    // El último hijo del body es el contenedor del botón flotante.
    const floating = page.locator("body > div[class*='fixed']");
    await expect(floating).toHaveAttribute("inert", "");

    await page.locator("#presentaciones").scrollIntoViewIfNeeded();
    await expect(floating).not.toHaveAttribute("inert", "");
    await expect(floating.getByRole("link")).toBeInViewport();

    await page.locator("#pie").scrollIntoViewIfNeeded();
    await expect(floating).toHaveAttribute("inert", "");
  });

  test("al volver de una página legal, el botón flotante sigue al hero nuevo (H-11, T-68)", async ({
    page,
  }) => {
    await page.goto("/");
    const floating = page.locator("body > div[class*='fixed']");
    // Navegación del cliente: el layout (y el componente del flotante) persiste.
    await page
      .locator("#pie")
      .getByRole("link", { name: "Privacidad" })
      .click();
    await expect(page).toHaveURL(/\/privacidad$/);
    // Sin hero en la página, el botón no se muestra.
    await expect(floating).toHaveAttribute("inert", "");

    await page.getByRole("link", { name: "Volver al inicio" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("#hero")).toBeInViewport();
    await expect(floating).toHaveAttribute("inert", "");

    await page.locator("#presentaciones").scrollIntoViewIfNeeded();
    await expect(floating).not.toHaveAttribute("inert", "");
  });

  test("«Ver origen» lleva a la sección sin que la barra fija tape el título", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Ver origen" }).click();
    await expect(page).toHaveURL(/#origen$/);
    const headerBottom = await page
      .locator("header")
      .evaluate((el) => el.getBoundingClientRect().bottom);
    const titleTop = await page
      .locator("#origen-titulo")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(titleTop).toBeGreaterThanOrEqual(headerBottom);
  });
});

test.describe("carga de la página (PERF-05, T-61)", () => {
  test("no descarga otras páginas sin que el visitante haga clic", async ({
    page,
  }) => {
    const fetches: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "fetch") fetches.push(request.url());
    });
    await page.goto("/");
    await page.mouse.wheel(0, 10000);
    await page.locator("#pie").scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");
    expect(fetches).toEqual([]);
  });
});

test.describe("«Saltar al contenido» (T-58)", () => {
  for (const path of [...pages, "/no-existe", "/en/no-existe"]) {
    test(`${path} tiene el enlace y su destino`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('a[href="#contenido"]')).toHaveCount(1);
      await expect(page.locator("main#contenido")).toHaveCount(1);
    });
  }
});

// N-5 (revisión de T-121): las fotos de las tarjetas tienen dos versiones, 200 y 600 px.
// La elegida debe cubrir el ancho real en píxeles del dispositivo (nitidez) sin bajar la
// grande cuando basta la pequeña (peso). Se mide en los anchos donde cambia la grilla
// (40rem, 64rem) o la tarjeta (consulta de contenedor de 18rem: 352 y 688 px) y con el
// texto al 200 %. `sizes` empieza por `auto` (el navegador usa el ancho maquetado);
// el respaldo, para navegadores sin `auto`, se comprueba también contra la maqueta a
// tamaño normal: si cambia la grilla y no `sizes`, esto falla.
test.describe("fotos de las tarjetas a la medida (N-5)", () => {
  // Un solo proyecto (escritorio, Chromium) recorre todos los anchos.
  test.skip(
    ({ isMobile, browserName }) => isMobile || browserName !== "chromium",
    "Recorre los anchos con un solo proyecto",
  );
  const ANCHOS = [320, 351, 352, 360, 640, 687, 688, 768, 1023, 1024, 1280];

  for (const inicio of ["/", "/en"]) {
    for (const texto of ["100%", "200%"]) {
      test(`${inicio} con el texto al ${texto}: cada foto baja la versión que le corresponde`, async ({
        browser,
        baseURL,
      }) => {
        const fallos: string[] = [];
        for (const ancho of ANCHOS) {
          // Contexto nuevo por ancho: con la caché de otro ancho, el navegador reutiliza
          // la versión grande ya descargada y la medida no diría nada.
          const contexto = await browser.newContext({
            baseURL,
            viewport: { width: ancho, height: 800 },
          });
          const page = await contexto.newPage();
          page.on("pageerror", (error) =>
            fallos.push(`${ancho} px: ${error.message}`),
          );
          // El texto aumentado va en el HTML desde el principio, como lo tendría quien lo
          // usa: aplicado después de cargar, el navegador ya habría elegido las fotos
          // diferidas con la maqueta a tamaño normal.
          if (texto !== "100%") {
            await page.route(
              (url) => url.pathname === inicio,
              async (route) => {
                const original = await route.fetch();
                await route.fulfill({
                  response: original,
                  body: (await original.text()).replace(
                    "</head>",
                    `<style>html { font-size: ${texto} !important; }</style></head>`,
                  ),
                });
              },
            );
          }
          await page.goto(inicio);
          const fotos = page.locator("#presentaciones img");
          await fotos.first().scrollIntoViewIfNeeded();
          await page.waitForFunction(() =>
            [...document.querySelectorAll("#presentaciones img")].every(
              (img) => (img as HTMLImageElement).currentSrc,
            ),
          );
          const medidas = await fotos.evaluateAll((imgs) =>
            imgs.map((img) => {
              const foto = img as HTMLImageElement;
              // Primer hueco del respaldo cuya condición se cumple (rem a 16 px).
              let respaldo: number | null = null;
              for (const parte of foto.sizes.split(",").map((p) => p.trim())) {
                const m = parte.match(/^(.*?)\s*([\d.]+)(px|rem)$/);
                if (!m) continue;
                if (!m[1] || matchMedia(m[1]).matches) {
                  respaldo = Number(m[2]) * (m[3] === "rem" ? 16 : 1);
                  break;
                }
              }
              return {
                ancho: foto.getBoundingClientRect().width * devicePixelRatio,
                elegida: /-200\.\w+$/.test(foto.currentSrc) ? 200 : 600,
                respaldo:
                  respaldo === null ? null : respaldo * devicePixelRatio,
              };
            }),
          );
          for (const [
            i,
            { ancho: px, elegida, respaldo },
          ] of medidas.entries()) {
            const esperada = px <= 200 ? 200 : 600;
            if (elegida !== esperada) {
              fallos.push(
                `${ancho} px, foto ${i + 1}: ${Math.round(px)} px reales, bajó ${elegida} (esperada ${esperada})`,
              );
            }
            if (
              texto === "100%" &&
              (respaldo === null || (respaldo <= 200 ? 200 : 600) !== esperada)
            ) {
              fallos.push(
                `${ancho} px, foto ${i + 1}: el respaldo de sizes (${respaldo}) no corresponde a ${Math.round(px)} px reales`,
              );
            }
          }
          await contexto.close();
        }
        expect(fallos).toEqual([]);
      });
    }
  }
});
