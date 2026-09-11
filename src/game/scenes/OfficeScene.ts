import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { gameStore, type MissionId } from '../GameStore';
import { activityNotice, addHotspot, drawEvidenceBoard, enterScene, palette, paintRoom, toast, type InteractiveState } from '../sceneUtils';

export class OfficeScene extends Phaser.Scene {
  private keyObject?: Phaser.GameObjects.Container;
  private keyHit?: Phaser.GameObjects.Rectangle;
  private hintText?: Phaser.GameObjects.Text;
  constructor() { super('OfficeScene'); }

  create() {
    enterScene(this);
    paintRoom(this, 'OFICINA CENTRAL · SECTOR 05', 'Explora libremente. El escuadrón decide dónde mirar.');
    drawEvidenceBoard(this);
    this.add.text(42, 124, 'Haz clic en los objetos. Algunos esconden pistas; otros solo tienen algo que decir.', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '19px', color: '#52727b' });
    this.drawDesk();
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {
      if (gameObjects.length > 0) return;
      const inside = (x: number, y: number, width: number, height: number) => Math.abs(pointer.x - x) <= width / 2 && Math.abs(pointer.y - y) <= height / 2;
      if (inside(330, 390, 125, 70)) { gameStore.findSecret('mug'); this.revealKey(); toast('El café ha desaparecido misteriosamente.', 'paper'); }
      else if (this.keyObject && inside(390, 470, 110, 80)) { gameStore.findSecret('key'); this.keyObject.destroy(); this.keyHit?.destroy(); this.keyObject = undefined; this.keyHit = undefined; toast('¡Llave encontrada! El archivador puede abrirse.', 'safe'); }
      else if (inside(885, 390, 170, 70) && gameStore.getState().unlockedObjects.includes('key')) this.scene.start('ArchiveScene');
      else if (inside(505, 390, 150, 70) && gameStore.getState().completedMissions.includes('archive')) this.scene.start('ChatPuzzleScene');
      else if (inside(700, 390, 160, 70) && gameStore.getState().completedMissions.includes('chat')) this.scene.start('EvidenceBoardScene');
      else if (inside(1080, 390, 145, 70)) this.scene.start('MagnifierScene');
    });
    this.add.circle(170, 282, 72, palette.sky).setStrokeStyle(5, palette.blue, 0.9);
    this.add.line(170, 282, 170, 232, 170, 282, palette.ink, 0.8).setLineWidth(4);
    this.add.line(170, 282, 205, 300, 170, 282, palette.ink, 0.8).setLineWidth(4);
    const missionStatus = (mission: MissionId, available: boolean): InteractiveState => gameStore.getState().completedMissions.includes(mission) ? 'COMPLETED' : available ? 'AVAILABLE' : 'LOCKED';
    const secretStatus = (secret: string): InteractiveState => gameStore.getState().unlockedObjects.includes(secret) ? 'COMPLETED' : 'AVAILABLE';
    const lockedNotice = (message: string) => activityNotice('ESTA PISTA TODAVÍA ESTÁ BLOQUEADA', message, '🔒');
    const completedNotice = (message: string) => activityNotice('EXPEDIENTE YA INVESTIGADO', `✓ ${message}\nBusquemos la siguiente pista.`, '✓', 4000);
    addHotspot(this, 170, 390, 135, 70, '🌱 PLANTA', () => { if (gameStore.getState().unlockedObjects.includes('plant')) { completedNotice('La planta ya fue revisada por el escuadrón.'); return; } gameStore.findSecret('plant'); toast('La planta se niega a declarar. 🌱', 'click'); }, palette.mint, secretStatus('plant'));
    addHotspot(this, 330, 390, 125, 70, '☕ TAZA', () => { if (gameStore.getState().unlockedObjects.includes('mug')) { completedNotice('La taza ya reveló la pista de la llave.'); return; } gameStore.findSecret('mug'); this.revealKey(); toast('El café ha desaparecido misteriosamente.', 'paper'); }, palette.mint, secretStatus('mug'));
    addHotspot(this, 505, 390, 150, 70, '☎ TELÉFONO', () => {
      const current = gameStore.getState();
      if (current.completedMissions.includes('chat')) { completedNotice('El mensaje ya fue construido con escucha y compañía.'); return; }
      if (!current.completedMissions.includes('archive')) { lockedNotice('Parece que necesitamos investigar otra parte de la oficina antes de poder abrir este expediente.'); return; }
      this.scene.start('ChatPuzzleScene');
    }, palette.coral, missionStatus('chat', gameStore.getState().completedMissions.includes('archive')));
    addHotspot(this, 700, 390, 160, 70, '▤ RADIO', () => {
      const completed = gameStore.getState().completedMissions;
      if (completed.includes('sorting')) { completedNotice('La secuencia de apoyo ya está completa.'); return; }
      if (!completed.includes('chat')) { lockedNotice('Todavía nos falta abrir una conversación. Revisemos el archivador y el teléfono.'); return; }
      if (!completed.includes('board')) { toast('La radio despierta: un mensaje apunta al tablero.', 'scanner'); this.scene.start('EvidenceBoardScene'); return; }
      if (!completed.includes('myth')) { toast('La radio transmite tres frases para el sello de mitos.', 'scanner'); this.scene.start('MythStampScene'); return; }
      if (!completed.includes('hidden')) { toast('La radio marca una habitación llena de pistas.', 'scanner'); this.scene.start('HiddenObjectScene'); return; }
      toast('La radio despierta: kit del detective desbloqueado.', 'scanner'); this.scene.start('ToolkitScene');
    }, palette.coral, missionStatus('sorting', gameStore.getState().completedMissions.includes('chat')));
    addHotspot(this, 885, 390, 170, 70, '▣ ARCHIVADOR', () => {
      const current = gameStore.getState();
      if (current.completedMissions.includes('archive')) { completedNotice('La primera evidencia ya está clavada en el tablero.'); return; }
      if (current.unlockedObjects.includes('key')) { this.scene.start('ArchiveScene'); return; }
      lockedNotice('Parece que necesitamos investigar otra parte de la oficina antes de poder abrir este expediente.');
    }, palette.gold, missionStatus('archive', gameStore.getState().unlockedObjects.includes('key')));
    addHotspot(this, 1080, 390, 145, 70, '⌕ LUPA', () => { if (gameStore.getState().completedMissions.includes('magnifier')) { completedNotice('La lupa ya reveló los símbolos escondidos.'); return; } this.scene.start('MagnifierScene'); }, palette.blue, missionStatus('magnifier', true));
    addHotspot(this, 240, 545, 135, 60, '▣ PERIÓDICO', () => { if (gameStore.getState().unlockedObjects.includes('newspaper')) { completedNotice('El titular ya fue leído por el equipo.'); return; } gameStore.findSecret('newspaper'); toast('Titular: “El equipo que pregunta, encuentra caminos”.', 'paper'); }, palette.paper, secretStatus('newspaper'));
    addHotspot(this, 470, 545, 135, 60, '▤ FOTOGRAFÍA', () => { if (gameStore.getState().unlockedObjects.includes('photo')) { completedNotice('La fotografía ya nos recordó que la misión se hace en compañía.'); return; } gameStore.findSecret('photo'); toast('Una foto del escuadrón. La misión se hace en compañía.', 'clue'); }, palette.paper, secretStatus('photo'));
    addHotspot(this, 760, 545, 145, 60, '◷ RELOJ', () => { if (gameStore.getState().unlockedObjects.includes('clock')) { completedNotice('El reloj ya fue investigado.'); return; } gameStore.findSecret('clock'); toast('El sospechoso afirma que lleva ahí todo el día.', 'click'); }, palette.mint, secretStatus('clock'));
    addHotspot(this, 980, 545, 145, 60, '✉ CARTA', () => { if (gameStore.getState().clues.includes('letter')) { completedNotice('La carta ya dejó su mensaje en el cuaderno.'); return; } gameStore.addClue('letter'); toast('La carta dice: “Escuchar abre puertas”.', 'paper'); }, palette.paper, gameStore.getState().clues.includes('letter') ? 'COMPLETED' : 'AVAILABLE');
    if (!gameStore.getState().unlockedObjects.includes('key')) this.add.text(815, 610, 'Busca la llave. Una taza sospechosa puede ayudarte.', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '17px', color: '#8a654e', fontStyle: 'italic' });
    this.hintText = this.add.text(44, 680, `Pistas disponibles: ${gameStore.getState().hintsRemaining} · Secretos encontrados: ${gameStore.getState().secretsFound}`, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '16px', color: '#52727b' });
    EventBus.emit('scene-ready', 'OfficeScene');
  }

  private drawDesk() {
    this.add.rectangle(650, 505, 1060, 190, 0xa87956).setStrokeStyle(5, 0x704936, 0.5);
    this.add.rectangle(650, 420, 1060, 35, 0x704936, 0.45);
    this.add.rectangle(1120, 255, 250, 155, palette.brown, 0.7).setStrokeStyle(5, palette.ink, 0.2);
    this.add.text(1005, 180, '✦ CAJA SEGURA', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '22px', color: '#173c4b', fontStyle: 'bold' });
    [0, 1, 2, 3, 4].forEach(index => this.add.rectangle(1050 + index * 34, 250, 23, 23, 0xf7ead0).setStrokeStyle(2, palette.ink, 0.4));
    this.add.circle(1160, 330, 34, palette.gold).setStrokeStyle(4, palette.ink, 0.4);
    this.add.text(1160, 330, '5', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '24px', color: '#173c4b', fontStyle: 'bold' }).setOrigin(0.5);
  }

  private revealKey() {
    if (this.keyObject || gameStore.getState().unlockedObjects.includes('key')) return;
    this.keyObject = this.add.container(345, 435);
    this.keyObject.add(this.add.circle(45, 35, 17, palette.gold).setStrokeStyle(3, palette.brown));
    this.keyObject.add(this.add.rectangle(69, 35, 45, 8, palette.gold).setStrokeStyle(2, palette.brown));
    this.keyObject.add(this.add.text(45, 73, 'LLAVE', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '15px', color: '#173c4b', fontStyle: 'bold' }).setOrigin(0.5));
    this.keyHit = this.add.rectangle(390, 470, 90, 70, palette.gold, 0).setInteractive();
    this.keyHit.on('pointerover', () => this.keyObject?.setScale(1.15));
    this.keyHit.on('pointerout', () => this.keyObject?.setScale(1));
    this.keyHit.on('pointerdown', () => { gameStore.findSecret('key'); this.keyObject?.destroy(); this.keyHit?.destroy(); this.keyObject = undefined; this.keyHit = undefined; toast('¡Llave encontrada! El archivador puede abrirse.', 'safe'); this.hintText?.setText('La llave está lista. Abran el archivador dorado.'); });
    this.tweens.add({ targets: this.keyObject, y: 420, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}
