# QUIZ DETECTIVE — Operación: Código de Apoyo

Aventura 2D cooperativa, offline-first y point-and-click para proyectar en clase. Phaser es el corazón jugable; React se ocupa del shell, HUD mínimo, audio, accesibilidad y fullscreen. No requiere login, base de datos ni envío de datos.

## CÓMO EJECUTAR EL JUEGO MAÑANA

### Opción recomendada

1. Instala Node.js una sola vez.
2. Haz doble clic en `INSTALAR_UNA_VEZ.bat` (solo la primera vez).
3. Haz doble clic en `INICIAR_JUEGO.bat`.
4. Se abrirá el juego en el navegador. Pulsa **PANTALLA COMPLETA** o la tecla `F`.

Para revisar exactamente el build generado, usa `INICIAR_PREVIEW.bat`; si ya existe `dist/`, también puedes servir esa carpeta con cualquier servidor local estático. Para desarrollo: `pnpm dev`.

## Cómo se juega

La psicóloga controla el mouse y el teclado; el salón dirige la investigación. Exploren la oficina, descubran la llave bajo la taza, arrastren carpetas, usen la lupa, construyan respuestas con fragmentos, estampen mitos, conecten el tablero, elijan tres herramientas, atraviesen el laberinto y clasifiquen documentos.

- Mouse: hotspots, drag-and-drop, conexiones y piezas de la caja fuerte.
- Flechas: mover el detective en el laberinto.
- `F`: alternar pantalla completa.
- El botón de sonido es opcional y **PROBAR SONIDO** permite comprobarlo antes de proyectar.

Los retos temporizados dan energía pero no castigan: al terminar se activa una pista y la aventura continúa. Los easter eggs no dan puntos ni bloquean el progreso.

## Verificación técnica

```text
pnpm install
pnpm run build
pnpm test
pnpm run test:e2e
pnpm run lint
```

Los mismos scripts funcionan con `npm` en cualquier instalación estándar de Node.js. En el entorno de desarrollo de este proyecto se verificaron con `pnpm` porque es el gestor disponible.

El progreso se guarda únicamente en `localStorage` del navegador para evitar perder la partida por un recargo. No se almacenan respuestas ni información personal. `REINICIAR MISIÓN` permite borrarlo.

## Arquitectura

- `src/game/GameStore.ts`: estado central de misiones, evidencias, pistas, secretos, timers y flags.
- `src/game/PhaserGame.tsx`: ciclo de vida Phaser dentro de React, con cleanup.
- `src/game/scenes/`: Boot, oficina, archivador, lupa, diálogo, tablero, sello, hidden object, toolkit, laberinto, clasificación y caja fuerte.
- `src/game/EventBus.ts`: comunicación escena ↔ HUD React.
- `src/game/sceneUtils.ts`: hotspots, tablero persistente, toasts, transiciones y animación de evidencias.

La investigación de los repositorios de referencia está en [docs/OPEN_SOURCE_RESEARCH.md](docs/OPEN_SOURCE_RESEARCH.md).

## Limitaciones conocidas

- El navegador puede bloquear el modo fullscreen por políticas de ventana; el botón tiene fallback visual.
- El audio es generado por tonos breves, sin archivos externos; requiere una primera interacción para activarse.
- La tipografía usa fuentes del sistema para que el build sea completamente offline.
- Phaser añade un bundle inicial grande (aprox. 1.45 MB minificado); no se cargan assets remotos y las escenas usan formas/texto propios para mantener la instalación simple.
- La experiencia está optimizada primero para proyección 16:9 en 1920×1080 y conserva controles grandes en 1536×864 y 1366×768.
