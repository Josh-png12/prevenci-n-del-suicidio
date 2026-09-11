import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { gameStore } from '../GameStore';
import { enterScene, palette, paintRoom, toast } from '../sceneUtils';
import type { EvidenceKey } from '../../types';

const labels: Array<[EvidenceKey, string]> = [['hablar', 'HABLAR'], ['escuchar', 'ESCUCHAR'], ['empatia', 'EMPATÍA'], ['acompanar', 'ACOMPAÑAR'], ['apoyo', 'PEDIR AYUDA']];

function typewriter(scene: Phaser.Scene, target: Phaser.GameObjects.Text, message: string, speed = 8, onComplete?: () => void) {
  let index = 0;
  target.setText('');
  scene.time.addEvent({ delay: speed, repeat: Math.max(0, message.length - 1), callback: () => { index += 1; target.setText(message.slice(0, index)); if (index === message.length) onComplete?.(); } });
}

export class SafeFinaleScene extends Phaser.Scene {
  private placed: EvidenceKey[] = [];
  private locked = false;
  constructor() { super('SafeFinaleScene'); }

  create() {
    enterScene(this); paintRoom(this, 'FINAL · CAJA SEGURA', 'El escuadrón recuperó cinco piezas. Colóquenlas para abrir el cierre mecánico.');
    this.add.rectangle(650, 420, 500, 360, palette.brown).setStrokeStyle(12, palette.ink, 0.4); this.add.circle(650, 425, 95, palette.gold).setStrokeStyle(8, palette.ink, 0.4); this.add.text(650, 425, 'CAJA\nSEGURA', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '30px', color: '#173c4b', fontStyle: 'bold', align: 'center' }).setOrigin(0.5); this.add.text(650, 175, 'Cada pieza hace girar un engranaje.', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '23px', color: '#52727b' }).setOrigin(0.5);
    labels.forEach(([key, label], index) => {
      const chip = this.add.text(180 + index * 225, 625, `✦ ${label}`, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '19px', color: '#173c4b', backgroundColor: '#fffdf5', padding: { x: 15, y: 14 }, fontStyle: 'bold' }).setOrigin(0.5).setInteractive();
      chip.on('pointerdown', () => {
        if (this.locked || this.placed.includes(key)) return;
        this.placed.push(key); chip.setAlpha(0.35);
        const slot = this.add.circle(520 + (this.placed.length - 1) * 65, 425, 24, palette.mint).setStrokeStyle(3, palette.ink);
        this.tweens.add({ targets: chip, x: slot.x, y: slot.y, scale: 0.55, duration: 650, ease: 'Back.easeOut', onComplete: () => { toast(`${label} encaja. El mecanismo avanza.`, 'safe'); if (this.placed.length === labels.length) this.beginResolution(); } });
      });
    });
    EventBus.emit('scene-ready', 'SafeFinaleScene');
  }

  private beginResolution() {
    this.locked = true; this.input.enabled = false; gameStore.completeMission('safe'); EventBus.emit('finale-start');
    const veil = this.add.rectangle(640, 360, 1280, 720, palette.ink, 0.94).setDepth(20).setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 0.93, duration: 700, ease: 'Sine.easeInOut' });
    this.cameras.main.pan(640, 350, 850, 'Sine.easeInOut');

    const detective = this.add.text(640, 170, '', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '26px', color: '#fff8e9', fontStyle: 'bold', align: 'center' }).setOrigin(0.5).setDepth(22);
    const pattern = this.add.text(640, 215, 'PATRÓN IDENTIFICADO', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '31px', color: '#f5c75b', fontStyle: 'bold', align: 'center' }).setOrigin(0.5).setDepth(22).setAlpha(0);
    const recovered = this.add.text(640, 260, 'CÓDIGO DE APOYO RECUPERADO', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '24px', color: '#f39b83', fontStyle: 'bold', align: 'center' }).setOrigin(0.5).setDepth(22).setAlpha(0);
    const evidenceLine = this.add.text(640, 302, 'HABLAR  ·  ESCUCHAR  ·  EMPATÍA  ·  ACOMPAÑAR  ·  PEDIR AYUDA', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '17px', color: '#b9ead5', fontStyle: 'bold', align: 'center' }).setOrigin(0.5).setDepth(22).setAlpha(0);
    const narrative = this.add.text(640, 430, '', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '18px', color: '#fffdf5', align: 'center', wordWrap: { width: 1040 }, lineSpacing: 5 }).setOrigin(0.5).setDepth(22);
    const closing = this.add.text(640, 635, 'Que nadie de nuestro equipo tenga que sentirse solo.', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '20px', color: '#f5c75b', fontStyle: 'bold', align: 'center' }).setOrigin(0.5).setDepth(22).setAlpha(0);

    this.time.delayedCall(850, () => typewriter(this, detective, 'Escuadrón… ahora todo encaja.', 18));
    this.time.delayedCall(1650, () => this.tweens.add({ targets: pattern, alpha: 1, y: 205, duration: 500, ease: 'Back.easeOut' }));
    this.time.delayedCall(2250, () => this.tweens.add({ targets: recovered, alpha: 1, duration: 550 }));
    this.time.delayedCall(2750, () => this.tweens.add({ targets: evidenceLine, alpha: 1, duration: 650 }));
    this.time.delayedCall(3350, () => typewriter(this, narrative, 'Escuadrón, lo lograron.\n\nTodas las pistas nos llevaron al mismo lugar: nadie tiene que cargar solo con todo.\n\nA veces ayudar no significa tener todas las respuestas. Puede comenzar con algo tan simple como escuchar de verdad, quedarse cerca, hablar con alguien de confianza o acompañar a una persona a buscar ayuda.\n\nTodos podemos necesitar apoyo alguna vez, y todos podemos convertirnos en una parte segura de la red de alguien.\n\nEl caso termina aquí… pero cuidar a los demás continúa fuera de esta oficina.', 6));
    this.time.delayedCall(7200, () => this.tweens.add({ targets: closing, alpha: 1, duration: 700, ease: 'Sine.easeInOut' }));
    this.time.delayedCall(8100, () => EventBus.emit('finale-ready'));
  }
}
