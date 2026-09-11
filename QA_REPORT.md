# Reporte de QA

## Resultado final

- Build: PASA (`vite build`, Vite 8.2.2).
- Unit/component: PASA (9 tests).
- E2E: PASA (2 escenarios, recorrido completo y controles).
- Lint: PASA (ESLint sin warnings).
- Consola: PASA (sin errores ni warnings capturados).

## Cobertura

- Reglas de juego: aciertos, errores, reintento, progreso y deduplicación de evidencias.
- Componentes: CaseCard, Choice, EvidenceBoard, ChatCase, MythCase, SupportNetwork, Modal y FinalScreen.
- E2E: recorrido completo de los 10 casos, respuesta incorrecta/reintento, teclado, reset y fullscreen fallback.
- Build: `pnpm run build`.
- Offline: recursos críticos locales; no hay fetch, API ni CDN.

## Inspección visual

Se prepararon breakpoints para 1366×768, 1536×864 y 1920×1080, con controles grandes, tarjetas dentro del viewport, contraste alto y `prefers-reduced-motion`.

## Seguridad de contenido

No se representan autolesiones, métodos, escenas gráficas, vidas, rankings ni cuenta regresiva. El lenguaje es general, no diagnostica y orienta hacia adultos/profesionales.
