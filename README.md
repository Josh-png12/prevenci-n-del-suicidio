# QUIZ DETECTIVE — Operación: Código de Apoyo

Experiencia web cooperativa y offline-first para proyectar en clase. No requiere login, base de datos ni envío de datos.

## CÓMO EJECUTAR EL JUEGO MAÑANA

### Opción recomendada

1. Instala Node.js una sola vez.
2. Haz doble clic en `INSTALAR_UNA_VEZ.bat` (solo la primera vez).
3. Haz doble clic en `INICIAR_JUEGO.bat`.
4. Se abrirá el juego en el navegador. Pulsa **PANTALLA COMPLETA** o la tecla `F`.

Si ya existe `dist/`, también puedes servir esa carpeta con cualquier servidor local estático. Para desarrollo: `pnpm dev`.

## Controles

Mouse o teclado: `1 / 2 / 3` elige respuesta, `ENTER` continúa, `ESC` cierra la confirmación, `F` alterna pantalla completa. El botón de sonido es opcional y la app funciona aunque el navegador bloquee autoplay.

## Verificación técnica

```text
pnpm install
pnpm run build
pnpm test
pnpm run test:e2e
pnpm run lint
```

El progreso se guarda únicamente en `localStorage` del navegador para evitar perder la partida por un recargo. No se almacenan respuestas ni información personal. `REINICIAR MISIÓN` permite borrarlo.

## Open source evaluado

- React + Vite: elegidos por estabilidad y carga local sencilla.
- Vitest (MIT): pruebas unitarias y de componentes.
- Playwright (Apache-2.0): recorrido E2E en navegador.
- Howler.js (MIT) y Motion (MIT) fueron revisados, pero no incorporados: los sonidos breves con Web Audio y las animaciones CSS mantienen el paquete pequeño y offline.

## Limitaciones conocidas

- El navegador puede bloquear el modo fullscreen por políticas de ventana; el botón tiene fallback visual.
- El audio es generado por tonos breves, sin archivos externos; requiere una primera interacción para activarse.
- La tipografía usa fuentes del sistema para que el build sea completamente offline.
