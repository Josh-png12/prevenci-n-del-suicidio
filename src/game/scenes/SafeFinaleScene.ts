import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { gameStore } from '../GameStore';
import { enterScene, palette, paintRoom, toast } from '../sceneUtils';
import type { EvidenceKey } from '../../types';

export class SafeFinaleScene extends Phaser.Scene {
  private placed: EvidenceKey[] = [];
  private labels: Array<[EvidenceKey, string]> = [['hablar', 'HABLAR'], ['escuchar', 'ESCUCHAR'], ['empatia', 'EMPATÍA'], ['acompanar', 'ACOMPAÑAR'], ['apoyo', 'PEDIR AYUDA']];
  constructor() { super('SafeFinaleScene'); }
  create() {
    enterScene(this); paintRoom(this, 'FINAL · CAJA SEGURA', 'El escuadrón recuperó cinco piezas. Colóquenlas para abrir el cierre mecánico.');
    this.add.rectangle(650, 420, 500, 360, palette.brown).setStrokeStyle(12, palette.ink, 0.4); this.add.circle(650, 425, 95, palette.gold).setStrokeStyle(8, palette.ink, 0.4); this.add.text(650, 425, 'CAJA\nSEGURA', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '30px', color: '#173c4b', fontStyle: 'bold', align: 'center' }).setOrigin(0.5); this.add.text(650, 175, 'Cada pieza hace girar un engranaje.', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '23px', color: '#52727b' }).setOrigin(0.5);
    this.labels.forEach(([key, label], index) => { const chip = this.add.text(180 + index * 225, 625, `✦ ${label}`, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '19px', color: '#173c4b', backgroundColor: '#fffdf5', padding: { x: 15, y: 14 }, fontStyle: 'bold' }).setOrigin(0.5).setInteractive(); chip.on('pointerdown', () => { if (this.placed.includes(key)) return; this.placed.push(key); chip.setAlpha(0.35); const slot = this.add.circle(520 + (this.placed.length - 1) * 65, 425, 24, palette.mint).setStrokeStyle(3, palette.ink); this.tweens.add({ targets: chip, x: slot.x, y: slot.y, scale: 0.55, duration: 650, ease: 'Back.easeOut', onComplete: () => { toast(`${label} encaja. El mecanismo avanza.`, 'safe'); if (this.placed.length === 5) this.openSafe(); } }); }); });
    EventBus.emit('scene-ready', 'SafeFinaleScene');
  }
  private openSafe() { gameStore.completeMission('safe'); this.tweens.add({ targets: this.children.list.filter(item => item instanceof Phaser.GameObjects.Rectangle), angle: 3, yoyo: true, repeat: 5, duration: 90 }); this.time.delayedCall(1000, () => { this.cameras.main.flash(700, 255, 247, 220); this.add.text(650, 300, '✦ CÓDIGO DE APOYO RECUPERADO ✦', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '30px', color: '#fff8e9', backgroundColor: '#e77f69', padding: { x: 24, y: 18 }, fontStyle: 'bold', align: 'center' }).setOrigin(0.5); this.add.text(650, 525, 'NO TENEMOS QUE CARGAR SOLOS CON TODO.\n\nEscuchar importa. Hablar importa. Acompañar importa.\nY pedir ayuda también es cuidarnos.', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '22px', color: '#173c4b', align: 'center' }).setOrigin(0.5); EventBus.emit('finale-ready'); }); }
}
