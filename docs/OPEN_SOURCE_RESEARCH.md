# Investigación open source

Los cuatro repositorios fueron clonados temporalmente en `C:\Users\y\OneDrive\Desktop\_reference_repos` y revisados únicamente como material de estudio. No se incorporaron sus assets gráficos, música, voces ni el pipeline local de IA.

| Repositorio | Licencia verificada | Patrón estudiado | Adaptación propia |
|---|---|---|---|
| [phaserjs/template-react](https://github.com/phaserjs/template-react) | MIT | `PhaserGame` encapsulado, ciclo de vida de la instancia y EventBus React ↔ Phaser. | `src/game/PhaserGame.tsx`, `src/game/main.ts`, `src/game/EventBus.ts`. Modificación significativa: tipado TypeScript, cleanup y HUD React mínimo. |
| [lewiji/phaser-pnc](https://github.com/lewiji/phaser-pnc) | MIT | Habitaciones, hotspots, inventario, flags, diálogos y separación entre contenido y lógica. | `src/game/scenes/OfficeScene.ts`, `src/game/GameStore.ts`. Modificación significativa: estado cooperativo y escenas educativas propias. |
| [pnstickne/phaser-examples](https://github.com/pnstickne/phaser-examples) | MIT según la sección License del README; sus assets no se reutilizan. | Drag-and-drop, pointer events, tweens, timers, keyboard input y cámara/feedback. | `src/game/scenes/PuzzleScenes.ts`, `src/game/sceneUtils.ts`. Modificación significativa: mecánicas nuevas dibujadas con formas y texto propios. |
| [2CoderOK/prompt-n-click](https://github.com/2CoderOK/prompt-n-click) | MIT para el pipeline del repositorio; sus componentes de terceros conservan sus propias licencias. | Room architecture, inventory/flags, transiciones, partículas y sistemas modulares. | `src/game/GameStore.ts`, `src/game/scenes/*`. Modificación significativa: no se incorporó el pipeline de IA ni dependencias de generación. |

## Decisiones de adaptación

- Phaser 3.90.0 es el corazón jugable; React conserva shell, accesibilidad, fullscreen, audio y HUD mínimo.
- Las escenas usan geometría, texto y color generados en runtime; no dependen de imágenes externas ni CDN.
- El estado se centraliza en `GameStore` y se persiste de forma local para que una proyección no pierda la misión al recargar.
- Las interacciones conservan el espíritu point-and-click: hotspots, drag-and-drop, lupa con `GeometryMask`, conexiones de tablero, teclado, timers y escenas encadenadas.
