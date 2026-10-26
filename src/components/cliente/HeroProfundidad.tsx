"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { Efecto } from "./profundidad-webgl";

// Cuarto componente cliente: efecto de profundidad (2.5D) sobre la foto del hero.
// Recibe el <picture> ya renderizado como `children`: la foto es el contenido, el LCP y
// la alternativa estática. Después de que carga, y con el navegador libre, importa
// profundidad-webgl.ts (fuera del JavaScript inicial) y muestra el lienzo encima cuando
// el primer cuadro está dibujado (WebGL en un worker). Sin efecto con movimiento reducido
// (también si cambia durante la sesión), con Save-Data, sin GPU, sin OffscreenCanvas o
// si falla alguna capa: queda la foto.
// El lienzo lo crea y lo quita profundidad-webgl.ts; es decorativo (aria-hidden) y no
// agrega controles ni foco. `data-efecto` dice qué se ve: "foto", "activo" o "fallo".

/** URL de las capas de una foto (tools/profundidad/capas.py). */
export type Capas = { profundidad: string; fondo: string; alfa: string };

type ConexionSaveData = { connection?: { saveData?: boolean } };

export function HeroProfundidad({
  capas,
  className = "",
  children,
}: {
  capas: { escritorio: Capas; movil: Capas };
  /** Tamaño de la caja (p. ej. su proporción): la foto ocupa la caja más el margen. */
  className?: string;
  children: ReactNode;
}) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const caja = contenedor.current;
    const foto = caja?.querySelector("img");
    if (!caja || !foto) return;
    caja.dataset.efecto = "foto";
    if ((navigator as ConexionSaveData).connection?.saveData) return;

    const reducido = matchMedia("(prefers-reduced-motion: reduce)");
    let efecto: Efecto | null = null;
    let cancelarEspera = () => {};
    let cancelado = false;
    // Cada inicio es un intento: un import que llega después de apagar no crea nada.
    let intento = 0;

    const apagar = () => {
      intento++;
      cancelarEspera();
      efecto?.destruir();
      efecto = null;
      caja.dataset.efecto = "foto";
    };
    const encender = () => {
      apagar();
      if (cancelado || reducido.matches || !foto.complete || !foto.naturalWidth)
        return;
      const mio = intento;
      const iniciar = () =>
        import("./profundidad-webgl")
          .then(({ crearEfecto }) => {
            if (mio !== intento) return;
            efecto = crearEfecto({
              contenedor: caja,
              foto,
              // La misma proporción y encuadre que la foto que eligió <picture>.
              capas: foto.currentSrc.includes("hero-escritorio")
                ? capas.escritorio
                : capas.movil,
              alActivar: () => {
                if (mio === intento) caja.dataset.efecto = "activo";
              },
              alFallar: () => {
                if (mio !== intento) return;
                efecto = null;
                caja.dataset.efecto = "fallo";
              },
            });
          })
          .catch(() => {
            if (mio === intento) caja.dataset.efecto = "fallo";
          });
      // Fuera del camino del LCP: espera a que el navegador esté libre.
      // Safari no tiene requestIdleCallback.
      if (typeof requestIdleCallback === "function") {
        const id = requestIdleCallback(iniciar, { timeout: 2000 });
        cancelarEspera = () => cancelIdleCallback(id);
      } else {
        const id = setTimeout(iniciar, 200);
        cancelarEspera = () => clearTimeout(id);
      }
    };

    // `load` también llega si <picture> cambia de foto (p. ej. al cruzar 768 px):
    // el efecto se rehace con la foto y el mapa nuevos.
    foto.addEventListener("load", encender);
    reducido.addEventListener("change", encender);
    encender();
    return () => {
      cancelado = true;
      foto.removeEventListener("load", encender);
      reducido.removeEventListener("change", encender);
      apagar();
    };
  }, [capas.escritorio, capas.movil]);

  return (
    // Recorta la foto ampliada y el lienzo con las esquinas de la tarjeta.
    <div
      ref={contenedor}
      className={`relative overflow-hidden rounded-card ${className}`}
    >
      {children}
    </div>
  );
}
