import { expect, test as base } from "@playwright/test";

// Todas las pruebas e2e fallan si la página lanza un error de JavaScript sin capturar
// (evento "pageerror"), aunque la interfaz se vea bien. Así se detectó que el error de
// teselas del mapa dejaba un TypeError de Leaflet (revisión de la Fase 9).
export const test = base.extend<{ sinErroresJs: void }>({
  sinErroresJs: [
    async ({ page }, use) => {
      const errores: string[] = [];
      page.on("pageerror", (error) => errores.push(error.message));
      await use();
      expect(errores, "errores de JavaScript en la página").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
