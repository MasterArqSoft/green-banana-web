"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type Observado = { ruta: string; hero: boolean; pie: boolean };

// Uno de los tres componentes cliente (los otros son MapaFincasInteractivo y SelectorIdioma). Muestra el botón flotante en móvil
// cuando el hero (#hero) ya salió de la pantalla y el pie (#pie) aún no entra,
// para no taparlo (FR-17). Sin JavaScript el botón queda oculto: los demás
// botones Llamar siguen disponibles.
// El layout persiste al navegar entre páginas: en cada ruta se vuelven a buscar el
// hero y el pie, que son nodos nuevos (H-11, T-68). Lo observado se guarda con su ruta;
// si no corresponde a la página actual (p. ej. una legal, sin hero), el botón no se muestra.
export function FloatingCallVisibility({ children }: { children: ReactNode }) {
  const ruta = usePathname();
  const [observado, setObservado] = useState<Observado>({
    ruta: "",
    hero: true,
    pie: false,
  });

  useEffect(() => {
    const hero = document.getElementById("hero");
    const footer = document.getElementById("pie");
    if (!hero) return;
    const observer = new IntersectionObserver((entries) => {
      setObservado((previo) => {
        let siguiente =
          previo.ruta === ruta ? previo : { ruta, hero: true, pie: false };
        for (const entry of entries) {
          if (entry.target === hero)
            siguiente = { ...siguiente, hero: entry.isIntersecting };
          if (entry.target === footer)
            siguiente = { ...siguiente, pie: entry.isIntersecting };
        }
        return siguiente;
      });
    });
    observer.observe(hero);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, [ruta]);

  const visible = observado.ruta === ruta && !observado.hero && !observado.pie;
  return (
    <div
      // Oculto: fuera de la pantalla, sin foco ni lectura (inert).
      inert={!visible}
      className={`fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "translate-y-[150%]"
      }`}
    >
      {children}
    </div>
  );
}
