"use client";

import { useEffect, useState, type ReactNode } from "react";

// Uno de los dos componentes cliente (el otro es MapaFincasInteractivo). Muestra el botón flotante en móvil
// cuando el hero (#hero) ya salió de la pantalla y el pie (#pie) aún no entra,
// para no taparlo (FR-17). Sin JavaScript el botón queda oculto: los demás
// botones Llamar siguen disponibles.
export function FloatingCallVisibility({ children }: { children: ReactNode }) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const footer = document.getElementById("pie");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) setHeroVisible(entry.isIntersecting);
        if (entry.target === footer) setFooterVisible(entry.isIntersecting);
      }
    });
    if (hero) observer.observe(hero);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const visible = !heroVisible && !footerVisible;
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
