# Bitácora del proyecto

Registro de lo que se hace en cada sesión: decisiones, cambios y archivos tocados. La entrada más reciente va arriba.
No es fuente de verdad: si algo contradice los specs, ganan los specs (`spec/05-alcance-y-roadmap.md` primero). Los pendientes vigentes viven en `spec/05-alcance-y-roadmap.md` §5 y §7.

---

## 2026-10-18: T-09, esquemas Zod y contenido

### Decisiones del usuario
- **Producción = `SITE_ENV=production`.** Solo la pipeline de producción la define; el build local y el de la demo pasan con datos ficticios.
- **Aviso visible de datos ficticios** fuera de producción: "Demostración: los datos de empresa y contacto son ficticios."
- Con esto, D-11 queda parcialmente resuelto; solo sigue abierto que GitHub Pages no permite cabeceras propias (CSP).

### Cambios
- Dependencia `zod` 4.6.7.
- `src/lib/schema.ts`: esquemas estrictos de `site`, `products` (sin precios), `zones`, `faq`, `recipes` y `origin`. Teléfono E.164 +57, correo y URL https validados, ids únicos y fecha de corte ISO.
- `src/lib/content.ts`: carga y valida los JSON (error legible con `z.prettifyError`), expone `isProduction` y bloquea el build de producción si `phoneIsPlaceholder` es `true`.
- `src/content/*.json`: contenido de `02-content-spec.md` con datos ficticios marcados (FAQ 1 a 9, 5 recetas, 4 presentaciones). Los valores entre corchetes se copiaron tal cual del spec (pendientes de T-03).
- `src/components/DemoBanner.tsx` y `layout.tsx`: franja de aviso y título desde `site.brand`. Así cada build valida el contenido.
- `package.json`: `typecheck` ahora ejecuta `next typegen` antes de `tsc` (sin `.next/` fallaba con `LayoutProps`).
- Specs: `05` D-11 parcial; `03` §5 con `demoNotice`, rango de peso, objetos estrictos y `SITE_ENV`; `02` con el texto del aviso. `CLAUDE.md` actualizado.

### Verificado
- Build normal: pasa, con el título y el aviso en `out/index.html`.
- `SITE_ENV=production npm run build`: falla con "Build de producción bloqueado: site.json tiene phoneIsPlaceholder: true".
- Prueba manual del esquema: agregar `pricePerKg` a un producto, un teléfono sin +57 o un NIT vacío son rechazados con mensajes claros.
- `lint` y `typecheck` pasan.

### Abierto
- Pruebas automáticas del esquema: no se pidieron en T-09; se pueden agregar con T-08, cuando exista el runner de pruebas.

---

## 2026-10-18: demo en GitHub Pages

### Decisiones del usuario
- La demo del POC/MVP se publica en **GitHub Pages**: https://masterarqsoft.github.io/green-banana-web/. Resuelve D-09. El hosting de producción sigue pendiente (R-08).

### Cambios
- `.github/workflows/pages.yml`: en cada push a `main` (o a mano) instala, construye con `basePath` y despliega `out/` en Pages. Primer workflow de GitHub Actions; la pipeline completa sigue en R-10.
- `next.config.ts`: `basePath` desde `PAGES_BASE_PATH` (vacío en local).
- GitHub Pages activado con origen "GitHub Actions" (`gh api`).
- `spec/05-alcance-y-roadmap.md`: D-09 resuelto y URL de la demo en §4. `CLAUDE.md`: demo y nota sobre el prefijo en rutas de `public/`.

### Verificado
- El build con `PAGES_BASE_PATH=/green-banana-web` genera rutas `/green-banana-web/_next/...`.

### Abierto
- D-11: modo demo, datos ficticios visibles y GitHub Pages sin cabeceras propias (CSP).
- Commits con `Co-Authored-By: Claude` todavía en el historial (pendiente de reescritura por el usuario).

---

## 2026-10-18: T-07, proyecto base y repositorio en GitHub

### Decisiones del usuario
- Repositorio **local y en GitHub**, **público** (`MasterArqSoft/green-banana-web`). Resuelve D-10.
- CI/CD (R-10) con **GitHub Actions**, por la regla "repositorio y pipeline en el mismo proveedor". La pipeline se configura más adelante.

### Cambios
- **Proyecto:** creado con `create-next-app` (Next.js 16.4.2, React 19.3, Tailwind CSS 4, ESLint 9, TypeScript, `src/`, App Router).
  - `next.config.ts`: `output: "export"` e `images.unoptimized: true`. Se quitaron `cacheComponents` y `partialPrefetching` de la plantilla porque el build falla con "PPR cannot be enabled in export mode".
  - `src/app/page.tsx` y `layout.tsx`: página provisional, `lang="es-CO"`, sin las fuentes Geist ni los enlaces a Vercel de la plantilla. Las fuentes son T-10 y la composición T-33.
  - Se borraron los SVG de ejemplo de `public/`.
  - Prettier + `eslint-config-prettier`; Husky + lint-staged en pre-commit; scripts `typecheck`, `format` y `format:check`. Se quitó `start` (no aplica a exportación estática).
  - `.prettierignore` deja fuera la documentación escrita a mano; `.gitignore` excluye `.claude/settings.local.json`.
  - `README.md` en español.
  - `.gitattributes` con finales de línea LF: tu git usa `autocrlf`, y sin esto `format:check` y el hook fallarían en un clon nuevo.
  - No se versionan `.claude/skills/` (skills de terceros; se reinstalan desde `skills-lock.json`) ni el informe de investigación de `doc/` (solo local). `doc/bitacora.md` sí se versiona.
  - Commits con el correo personal del usuario (decisión suya, queda público).
  - El usuario no quiere que Claude aparezca como colaborador: regla en `CLAUDE.md`, sin línea `Co-Authored-By`. Los commits `T-07` y `Bitácora: detalle de T-07` aún la tienen; quitarla exige reescribir el historial y hacer push forzado (pendiente de que el usuario lo autorice o lo ejecute).
- **Specs:** D-10 resuelto y nuevas decisiones en `05` §4; R-10 con proveedor GitHub Actions en `05`, `03` §6 y §10, y `04`; T-07 incluye el repositorio remoto.
- **`CLAUDE.md`:** comandos, restricciones de Next.js 16 con exportación estática; CI/CD decidido.

### Verificado
- `npm run build` genera `out/index.html`; `lint`, `typecheck` y `format:check` pasan.

### Abierto
- `npm audit`: 5 vulnerabilidades **altas** en dependencias de desarrollo (`braces` vía `eslint-config-next` → `fast-glob`). Sin arreglo compatible: `npm audit fix --force` bajaría a `eslint-config-next@14`. Las dependencias de producción tienen 0 (`npm audit --omit=dev`). Revisar en T-40: el umbral del plan §10 bloquea altas o críticas.
- `npm install` bloqueó el script de instalación de `unrs-resolver` (lo usa ESLint para resolver imports). El lint funciona; revisar si hace falta aprobarlo.
- Conflictos D-09 y D-11 siguen abiertos.

---

## 2026-10-18: alineación de specs con el alcance de la Fase 1

### Decisiones del usuario
- El reparto llega a **personas naturales y puntos de venta** (Q15, resuelto).
- La Fase 1 es un **POC/MVP**: demostración funcional con datos ficticios para dar visibilidad al negocio y apoyar el marketing. Se amplía de forma progresiva.
- La demo se publicará en **GitHub** de forma pública. Choca con algunas reglas de los specs (D-09 a D-11). Se dejan abiertos y **hay que recordárselos al usuario cuando pregunte por pendientes**.
- Política de garantía, procedimiento de PQR y publicación de medios de pago y tiempo de entrega: **sin definir**. Pasan al roadmap de producción (RP-04, RP-05 y RP-03).
- Los specs se ajustan uno a uno, con confirmación del usuario.

### Cambios
- **`CLAUDE.md`:** encabezado estándar, arquitectura resumida, estado y comandos, qué no es fuente de verdad, conflictos abiertos y uso de esta bitácora.
- **`doc/bitacora.md`:** creada. El contexto del proyecto vive en el repositorio; se eliminó la memoria local de Claude que duplicaba el recordatorio de pendientes.
- **`spec/00-constitution.md`:** propósito POC/MVP; distribución a personas naturales y puntos de venta (§1 y §3).
- **`spec/01-spec.md`:**
  - R-10 y la nueva descripción de R-08 en §3.
  - FR-06: esquema hacia hogares y puntos de venta.
  - FR-14 remite a RP-04 y FR-16 a RP-05.
  - Preguntas Q15 a Q18.
  - Lista legal §9 enlazada a RP-03, RP-04 y RP-05.
- **`spec/02-content-spec.md`:**
  - FAQ 10 (facturación) fuera de la Fase 1, va con R-09.
  - Marcadores D-01 cambiados a RP-03.
  - Copy ajustado a "hogares y puntos de venta": franja de confianza, origen, cobertura, FAQ 6 y meta description.
  - Marcadores RP-04 (garantía) y RP-05 (PQR).
- **`spec/03-plan.md`:**
  - Analítica eliminada del diagrama del botón Llamar.
  - Flecha de CI/CD marcada como R-08/R-10.
  - Quitado `src/layouts/`.
  - Cabeceras según el hosting de R-08 (con exportación estática, `next.config` no aplica cabeceras).
  - `npm audit` local y Dependabot o equivalente con R-10.
  - Riesgo R1 actualizado.
  - Roadmap técnico completo (R-03, R-04, R-05, R-10).
- **`spec/04-tasks.md`:**
  - T-07 crea solo el git local; el repositorio remoto se crea en R-10.
  - T-11 es un script local de validación, no una pipeline.
  - T-30 usa Lighthouse local.
  - T-40 queda alineada con R-10.
  - Dependencias: R-08 en T-32 y T-43; R-08 y R-10 en T-44; RP-02 a RP-05 en T-42.
  - T-33 apunta a `src/app/page.tsx`.
  - Hito del MVP y ruta crítica exigen RP-01 a RP-05.
  - Criterio de salida de la Fase 0 ajustado.
  - Nuevas RP-04 y RP-05.
- **`spec/05-alcance-y-roadmap.md`:**
  - Propósito y etapa POC/MVP.
  - Decisiones Q15 y demo en GitHub.
  - Riesgos D-06 a D-11.
  - RP-03 ampliada; nuevas RP-04 y RP-05.

### Abierto
- **Conflictos D-09 a D-11** (demo en GitHub frente al hosting de R-08, el CI/CD de R-10 y el bloqueo de `phoneIsPlaceholder`).
- **Pendientes de producción:** RP-01 a RP-05.
- **Estimaciones:** la de T-11 quizá baje (ya no incluye pipeline). Mover T-36 a la Fase 6 está sin decidir.
- **Siguiente paso:** T-07. Antes conviene decidir si el repositorio va a GitHub desde el inicio (D-10).
