# Reporte de QA

## Release · aventura 2D v1.0.0

Validación final ejecutada el 11 de septiembre de 2026 sobre la rama `main`, con viewport de proyección 1920×1080 y comprobaciones adicionales en 1536×864 y 1366×768.

## Resultado final

- Build: PASA (`pnpm run build`, Vite 8.2.2).
- Unit/component: PASA (13 tests Vitest).
- E2E: PASA (3 escenarios: vertical slice, lupa/diálogo y recorrido completo hasta la caja fuerte).
- Lint: PASA (ESLint sin warnings).
- Consola: PASA (sin errores de página capturados durante E2E).
- Aceptación de los cambios narrativos 39–42: PASA (avisos bloqueados, estados visuales, secuencia automática y reflexión final).

## Cobertura

- Reglas de juego: aciertos, errores, reintento, progreso y deduplicación de evidencias.
- Componentes: shell React, HUD, controles de audio/fullscreen/reset y pantalla final.
- E2E: vertical slice de oficina/llave/archivador/HABLAR, lupa real, puzzle de diálogo y recorrido hasta la caja fuerte.
- Interacción: objetos explorables de oficina, drag-and-drop, GeometryMask, tablero, temporizadores no punitivos y ausencia de errores de página.
- UX de actividad: estados `LOCKED`, `AVAILABLE` y `COMPLETED`; avisos de bloqueo con título, icono, contraste, animación y permanencia de 4.5 segundos, cerrables con clic/ENTER después de una lectura mínima.
- Cierre narrativo: secuencia automática después de la caja fuerte, patrón identificado, evidencias destacadas, mensaje progresivo, frase de cuidado, música cálida opcional y pregunta de reflexión.
- Build: `pnpm run build`.
- Offline: recursos críticos locales; no hay fetch, API ni CDN.

## Inspección visual

Se revisó el canvas Phaser a 1920×1080 y se prepararon breakpoints para 1536×864 y 1366×768, con controles grandes, contraste alto, avisos legibles para TV y `prefers-reduced-motion`.

## Seguridad de contenido

No se representan autolesiones, métodos, escenas gráficas, vidas, rankings ni cuenta regresiva. El lenguaje es general, no diagnostica y orienta hacia adultos/profesionales.
