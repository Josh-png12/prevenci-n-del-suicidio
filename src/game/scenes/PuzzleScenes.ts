import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { gameStore } from '../GameStore';
import { addHotspot, drawEvidenceBoard, enterScene, flyEvidence, palette, paintRoom, toast } from '../sceneUtils';

function timerLabel(scene: Phaser.Scene, seconds: number) {
  const label = scene.add.text(1070, 180, `⏱ INVESTIGACIÓN ${seconds}s`, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '22px', color: '#173c4b', fontStyle: 'bold' }).setOrigin(0.5);
  if (seconds < 8) label.setColor('#be5e55');
  return label;
}

export class MagnifierScene extends Phaser.Scene {
  private found = new Set<string>();
  private lens?: Phaser.GameObjects.Arc;
  private maskShape?: Phaser.GameObjects.Graphics;
  private remaining = 40;
  private timerText?: Phaser.GameObjects.Text;
  constructor() { super('MagnifierScene'); }
  create() {
    enterScene(this); paintRoom(this, 'MISIÓN 1B · LUPA REAL', 'Mueve la lupa por la escena. Las pistas solo aparecen dentro de la lente.');
    this.add.rectangle(640, 420, 1110, 410, 0xd8f0e7).setStrokeStyle(5, palette.ink, 0.2);
    this.add.text(58, 145, 'El escuadrón puede decir “arriba”, “derecha” o “ahí”. Busca tres símbolos escondidos.', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '20px', color: '#52727b' });
    this.timerText = timerLabel(this, this.remaining);
    const hidden = this.add.container(0, 0);
    const clues = [['✦', 'star', 350, 300], ['?', 'question', 825, 365], ['☊', 'ear', 1030, 560]] as const;
    clues.forEach(([icon, id, x, y]) => { const clue = this.add.text(x, y, icon, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '34px', color: '#e77f69', backgroundColor: '#fffdf5', padding: { x: 8, y: 5 } }).setOrigin(0.5); hidden.add(clue); });
    this.maskShape = this.add.graphics().setVisible(false); this.maskShape.fillCircle(0, 0, 92); hidden.setMask(this.maskShape.createGeometryMask());
    this.lens = this.add.circle(640, 400, 94, 0xffffff, 0.05).setStrokeStyle(6, palette.coral, 0.95).setDepth(5);
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => { this.lens?.setPosition(pointer.x, pointer.y); this.maskShape?.setPosition(pointer.x, pointer.y); });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => { clues.forEach(([icon, id, x, y]) => { if (!this.found.has(id) && Phaser.Math.Distance.Between(pointer.x, pointer.y, x, y) < 110) { this.found.add(id); toast(`Símbolo encontrado ${this.found.size}/3: ${icon}`, 'scanner'); if (this.found.size === 3) { gameStore.completeMission('magnifier', 'hablar'); this.time.delayedCall(900, () => this.scene.start('OfficeScene')); } } }); });
    this.time.addEvent({ delay: 1000, loop: true, callback: () => { this.remaining -= 1; this.timerText?.setText(`⏱ INVESTIGACIÓN ${this.remaining}s`); if (this.remaining <= 0) { this.remaining = 40; toast('La lente ilumina una pista extra. Sigue explorando.', 'clue'); this.lens?.setPosition(1030, 560); this.maskShape?.setPosition(1030, 560); } } });
    EventBus.emit('scene-ready', 'MagnifierScene');
  }
}

export class ArchiveScene extends Phaser.Scene {
  private remaining = 30;
  private timerText?: Phaser.GameObjects.Text;
  private expired = false;
  constructor() { super('ArchiveScene'); }
  create() {
    enterScene(this); paintRoom(this, 'MISIÓN 1 · EL ARCHIVADOR', 'Encuentra la carpeta que contiene la primera pieza. Arrastra, prueba y conversa.');
    this.add.text(50, 135, 'La llave hizo clic. Tres carpetas parecen importantes… solo una habla de apoyo.', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '20px', color: '#52727b' });
    this.timerText = timerLabel(this, this.remaining);
    const target = this.add.rectangle(1020, 430, 300, 155, 0x704936, 1).setStrokeStyle(5, palette.brown);
    this.add.text(1020, 370, 'CAJÓN ABIERTO', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '21px', color: '#173c4b', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(1020, 435, 'ARRASTRA AQUÍ\nLA CARPETA CORRECTA', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '18px', color: '#fff8e9', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
    const folders = [['RUTINAS', 315, 420, palette.blue], ['HABLAR', 525, 420, palette.coral], ['CAFÉ', 735, 420, palette.gold]] as const;
    folders.forEach(([label, x, y, color]) => {
      const folder = this.add.container(x, y);
      folder.add(this.add.rectangle(0, 0, 175, 90, color).setStrokeStyle(3, palette.ink, 0.35));
      folder.add(this.add.text(0, 0, `▤ ${label}`, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '22px', color: '#173c4b', fontStyle: 'bold' }).setOrigin(0.5));
      folder.setSize(175, 90).setInteractive({ draggable: true });
      this.input.setDraggable(folder);
      folder.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => { folder.x = dragX; folder.y = dragY; });
      folder.on('dragend', () => {
        if (label === 'HABLAR' && Phaser.Geom.Intersects.RectangleToRectangle(folder.getBounds(), target.getBounds())) {
          toast('Carpeta correcta. La evidencia sale del expediente.', 'clue');
          this.tweens.add({ targets: folder, x: 1030, y: 430, scale: 0.3, duration: 500, onComplete: () => flyEvidence(this, 'HABLAR', 'archive', 'hablar', () => this.scene.start('OfficeScene')) });
        } else { folder.x = x; folder.y = y; toast(label === 'HABLAR' ? 'Acerca la carpeta al cajón abierto.' : 'Esa carpeta guarda otra historia.', 'paper'); }
      });
    });
    this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      if (this.expired) return;
      this.remaining -= 1; this.timerText?.setText(`⏱ INVESTIGACIÓN ${this.remaining}s`);
      if (this.remaining <= 0) { this.expired = true; gameStore.update({ hintsRemaining: Math.max(0, gameStore.getState().hintsRemaining - 1), timers: { archive: 0 } }); toast('Activando pista del escuadrón… el cajón correcto brilla suavemente.', 'clue'); target.setStrokeStyle(7, palette.gold, 0.95); this.tweens.add({ targets: target, alpha: 0.65, yoyo: true, repeat: 4, duration: 180 }); }
    }});
    EventBus.emit('scene-ready', 'ArchiveScene');
  }
}

export class ChatPuzzleScene extends Phaser.Scene {
  private selected: string[] = [];
  private slots: Phaser.GameObjects.Text[] = [];
  constructor() { super('ChatPuzzleScene'); }
  create() {
    enterScene(this); paintRoom(this, 'MISIÓN 2 · MENSAJE ENTRANTE', 'El teléfono vibró. Construye una respuesta que abra la conversación.');
    this.add.text(60, 145, '“Últimamente tengo demasiadas cosas encima.”', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '28px', color: '#173c4b', fontStyle: 'bold' });
    this.add.text(62, 192, 'Elige dos fragmentos y arrástralos a la burbuja. El escuadrón puede probar más de una combinación saludable.', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '18px', color: '#52727b' });
    const response = this.add.rectangle(850, 250, 690, 100, palette.blue).setStrokeStyle(4, palette.ink, 0.25);
    this.add.text(850, 212, 'RESPUESTA DEL ESCUADRÓN', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '16px', color: '#52727b', fontStyle: 'bold' }).setOrigin(0.5);
    for (let i = 0; i < 2; i++) this.slots.push(this.add.text(680 + i * 340, 265, 'arrastra aquí', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '20px', color: '#52727b', backgroundColor: '#fff8e9', padding: { x: 18, y: 12 }, align: 'center' }).setOrigin(0.5));
    const fragments = [['Estoy aquí', 230, 410], ['No exageres', 480, 410], ['¿Quieres contarme?', 755, 410], ['No es para tanto', 1010, 410], ['Podemos buscar ayuda', 330, 545], ['Todos tenemos problemas', 730, 545]] as const;
    fragments.forEach(([label, x, y]) => {
      const token = this.add.text(x, y, label, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '20px', color: '#173c4b', backgroundColor: '#fffdf5', padding: { x: 18, y: 14 }, fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ draggable: true });
      this.input.setDraggable(token);
      token.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => { token.x = dragX; token.y = dragY; });
      token.on('dragend', () => {
        const slot = this.slots.find(item => Phaser.Geom.Intersects.RectangleToRectangle(token.getBounds(), item.getBounds()) && !this.selected.includes(item.text));
        if (!slot) { token.x = x; token.y = y; return; }
        const slotIndex = this.slots.indexOf(slot); this.selected[slotIndex] = label; slot.setText(label).setColor('#173c4b'); token.setVisible(false); toast('Fragmento conectado. ¿Qué añadiría el escuadrón?', 'clue');
        if (this.selected.filter(Boolean).length === 2) this.finish();
      });
    });
    EventBus.emit('scene-ready', 'ChatPuzzleScene');
  }
  private finish() {
    const useful = this.selected.includes('Estoy aquí') && (this.selected.includes('¿Quieres contarme?') || this.selected.includes('Podemos buscar ayuda'));
    if (!useful) { toast('Esa combinación no abre la conversación. Prueben con escucha y compañía.', 'click'); this.selected = []; this.slots.forEach(slot => slot.setText('arrastra aquí')); this.children.list.filter(item => item instanceof Phaser.GameObjects.Text && ['Estoy aquí', '¿Quieres contarme?', 'Podemos buscar ayuda'].includes((item as Phaser.GameObjects.Text).text)).forEach(item => (item as Phaser.GameObjects.Text).setVisible(true)); return; }
    toast('Respuesta construida: escuchar y acompañar abre un camino.', 'safe');
    this.time.delayedCall(900, () => { gameStore.completeMission('chat', 'escuchar'); gameStore.completeMission('chat', 'acompanar'); this.scene.start('OfficeScene'); });
  }
}

export class MythStampScene extends Phaser.Scene {
  private stamped = 0;
  constructor() { super('MythStampScene'); }
  create() {
    enterScene(this); paintRoom(this, 'MISIÓN 3 · SELLO DE MITOS', 'Arrastra el sello MITO sobre las frases que cierran puertas.');
    const stamp = this.add.container(210, 560);
    stamp.add(this.add.circle(0, 0, 62, palette.coral).setStrokeStyle(5, palette.ink, 0.35)); stamp.add(this.add.text(0, 0, 'MITO', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '24px', color: '#173c4b', fontStyle: 'bold' }).setOrigin(0.5));
    const stampHit = this.add.rectangle(210, 560, 125, 125, 0xffffff, 0).setInteractive({ draggable: true }); this.input.setDraggable(stampHit);
    const targets: Array<{ label: string; myth: boolean; doc: Phaser.GameObjects.Text }> = [];
    const docs = [['Pedir ayuda significa ser débil.', 520, 280, true], ['Hablar con alguien de confianza puede ayudar.', 900, 280, false], ['Tenemos que resolver todo solos.', 700, 470, true]] as const;
    docs.forEach(([label, x, y, myth]) => { const doc = this.add.text(x, y, label, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '21px', color: '#173c4b', backgroundColor: '#fffdf5', padding: { x: 22, y: 20 }, align: 'center', wordWrap: { width: 270 } }).setOrigin(0.5); targets.push({ label, myth, doc }); });
    stampHit.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => { stampHit.x = dragX; stampHit.y = dragY; stamp.x = dragX; stamp.y = dragY; });
    stampHit.on('dragend', () => { const target = targets.find(item => Phaser.Geom.Intersects.RectangleToRectangle(stampHit.getBounds(), item.doc.getBounds())); if (!target) { stampHit.setPosition(210, 560); stamp.setPosition(210, 560); return; } if (!target.myth) { toast('Esta frase acompaña. No necesita sello.', 'clue'); stampHit.setPosition(210, 560); stamp.setPosition(210, 560); return; } stampHit.setPosition(210, 560); stamp.setPosition(210, 560); target.doc.setColor('#be5e55'); target.doc.setAlpha(0.68); target.doc.setText(`${target.label}\n\n✦ MITO SELLADO`); this.stamped += 1; toast('CLACK. El escuadrón detectó un mito.', 'seal'); if (this.stamped === 2) { gameStore.completeMission('myth', 'empatia'); this.time.delayedCall(900, () => this.scene.start('HiddenObjectScene')); } });
    EventBus.emit('scene-ready', 'MythStampScene');
  }
}

export class HiddenObjectScene extends Phaser.Scene {
  private found = 0;
  constructor() { super('HiddenObjectScene'); }
  create() {
    enterScene(this); paintRoom(this, 'MISIÓN 4 · HABITACIÓN DE PISTAS', 'Encuentra cuatro elementos que pueden representar apoyo.');
    this.add.text(52, 142, 'No hay penalización por curiosear. Mira los detalles y dirige al equipo.', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '20px', color: '#52727b' });
    const objects = [['☎', 'TELÉFONO', 250, 320, true], ['▣', 'FOTO FAMILIAR', 520, 310, true], ['ID', 'CREDENCIAL DOCENTE', 810, 315, true], ['◫', 'DOS SILLAS', 1050, 315, true], ['☂', 'PARAGUAS', 350, 525, false], ['★', 'TROFEO', 650, 535, false], ['⌁', 'PAPEL EN BLANCO', 930, 535, true], ['☕', 'TAZA', 1150, 535, false]] as const;
    objects.forEach(([icon, label, x, y, helpful]) => addHotspot(this, x, y, 190, 100, `${icon}\n${label}`, () => { if (helpful) { this.found += 1; toast(`${this.found}/4 · Pista de apoyo encontrada.`, 'clue'); if (this.found === 4) { gameStore.completeMission('hidden', 'acompanar'); this.time.delayedCall(900, () => this.scene.start('ToolkitScene')); } } else toast('Interesante… pero esa no parece nuestra pista.', 'click'); }, helpful ? palette.mint : palette.cream));
    EventBus.emit('scene-ready', 'HiddenObjectScene');
  }
}

export class EvidenceBoardScene extends Phaser.Scene {
  private first?: string;
  private connections = 0;
  constructor() { super('EvidenceBoardScene'); }
  create() {
    enterScene(this); paintRoom(this, 'MISIÓN 5 · TABLERO DE INVESTIGACIÓN', 'Conecta personas y acciones. La psicóloga puede arrastrar; el escuadrón puede señalar.');
    this.add.rectangle(640, 410, 1110, 420, 0xe7c98e).setStrokeStyle(8, palette.brown, 0.65);
    const nodes = [['AMIGO', 270, 300], ['DOCENTE', 530, 300], ['FAMILIA', 790, 300], ['ORIENTADOR', 1050, 300], ['ESCUCHAR', 400, 510], ['ACOMPAÑAR', 680, 510], ['PEDIR AYUDA', 970, 510]] as const;
    const pins = new Map<string, Phaser.GameObjects.Container>();
    nodes.forEach(([label, x, y]) => {
      const node = this.add.container(x, y); node.add(this.add.circle(0, -30, 8, palette.coral)); node.add(this.add.rectangle(0, 8, 190, 65, palette.cream).setStrokeStyle(3, palette.ink, 0.25)); node.add(this.add.text(0, 8, label, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '18px', color: '#173c4b', fontStyle: 'bold', align: 'center', wordWrap: { width: 170 } }).setOrigin(0.5)); node.setSize(190, 65).setInteractive(); node.on('pointerdown', () => { if (!this.first) { this.first = label; toast(`Pin seleccionado: ${label}. Elijan con qué conectarlo.`, 'click'); return; } if (this.first === label) return; const valid = (this.first === 'AMIGO' && label === 'ESCUCHAR') || (this.first === 'DOCENTE' && label === 'ACOMPAÑAR') || (this.first === 'FAMILIA' && label === 'PEDIR AYUDA') || (this.first === 'ORIENTADOR' && label === 'PEDIR AYUDA'); if (valid) { const a = pins.get(this.first); const b = pins.get(label); if (a && b) this.add.line(0, 0, a.x, a.y, b.x, b.y, palette.coral, 0.9).setLineWidth(8); this.connections += 1; toast('La conexión queda sujeta con hilo.', 'safe'); if (this.connections === 2) { gameStore.completeMission('board', 'apoyo'); this.time.delayedCall(900, () => this.scene.start('MythStampScene')); } } else toast('Esa conexión no parece llevarnos a ninguna parte.', 'click'); this.first = undefined; }); pins.set(label, node);
    });
    this.add.text(65, 145, 'Prueben: AMIGO → ESCUCHAR · DOCENTE → ACOMPAÑAR · FAMILIA → PEDIR AYUDA', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '18px', color: '#52727b' });
    EventBus.emit('scene-ready', 'EvidenceBoardScene');
  }
}

export class ToolkitScene extends Phaser.Scene {
  private opened = false;
  private selected: string[] = [];
  constructor() { super('ToolkitScene'); }
  create() {
    enterScene(this); paintRoom(this, 'MISIÓN 6 · KIT DEL DETECTIVE', 'La radio dejó un mensaje. Abre la caja y elige solo tres herramientas útiles.');
    const box = this.add.container(640, 390); box.add(this.add.rectangle(0, 0, 500, 245, palette.coral).setStrokeStyle(6, palette.brown)); box.add(this.add.rectangle(0, -108, 500, 32, palette.gold)); box.add(this.add.text(0, 0, '▣ KIT CERRADO\nHaz clic para abrir', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '28px', color: '#173c4b', fontStyle: 'bold', align: 'center' }).setOrigin(0.5)); box.setSize(500, 245).setInteractive(); box.on('pointerdown', () => { if (!this.opened) { this.opened = true; box.destroy(); toast('La caja se abre. Solo caben tres herramientas.', 'safe'); this.showTools(); } });
    EventBus.emit('scene-ready', 'ToolkitScene');
  }
  private showTools() {
    const tools = [['EMPATÍA', 310, 330], ['ESCUCHA', 520, 330], ['INDIFERENCIA', 730, 330], ['COMPETENCIA', 940, 330], ['ACOMPAÑAMIENTO', 430, 500], ['PEDIR APOYO', 760, 500]] as const;
    tools.forEach(([label, x, y]) => addHotspot(this, x, y, 190, 85, label, () => { if (this.selected.includes(label)) return; if (this.selected.length >= 3) { toast('El kit ya tiene tres herramientas. Conversen antes de cambiar.', 'click'); return; } this.selected.push(label); toast(`${this.selected.length}/3 · ${label} guardada.`, 'clue'); if (this.selected.length === 3) { gameStore.completeMission('toolkit', 'empatia'); this.time.delayedCall(900, () => this.scene.start('MazeScene')); } }, label === 'INDIFERENCIA' ? palette.cream : palette.mint));
  }
}

export class MazeScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Arc;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private goal?: Phaser.GameObjects.Rectangle;
  constructor() { super('MazeScene'); }
  create() {
    enterScene(this); paintRoom(this, 'MISIÓN 7 · LABERINTO DE APOYO', 'Usa las flechas. Lleva el mensaje hacia alguien que pueda ayudar.');
    this.add.rectangle(640, 410, 1100, 420, palette.mint).setStrokeStyle(6, palette.ink, 0.2);
    this.add.text(220, 275, 'INICIO', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '20px', color: '#52727b', fontStyle: 'bold' });
    this.add.rectangle(500, 410, 25, 270, palette.brown); this.add.rectangle(780, 310, 25, 210, palette.brown); this.add.rectangle(930, 500, 260, 25, palette.brown);
    addHotspot(this, 600, 290, 160, 70, 'IGNORAR', () => this.resetPlayer(), palette.cream); addHotspot(this, 900, 290, 160, 70, 'BURLARSE', () => this.resetPlayer(), palette.cream); addHotspot(this, 1070, 430, 185, 72, 'ADULTO DE\nCONFIANZA', () => this.finish(), palette.mint); addHotspot(this, 1080, 570, 160, 70, 'ORIENTACIÓN', () => this.finish(), palette.blue);
    this.player = this.add.circle(220, 520, 22, palette.coral).setStrokeStyle(4, palette.ink); this.add.text(220, 520, '✦', { fontSize: '22px', color: '#173c4b' }).setOrigin(0.5); this.goal = this.add.rectangle(1120, 430, 175, 80, palette.gold, 0.45).setStrokeStyle(4, palette.coral); this.cursors = this.input.keyboard?.createCursorKeys();
    EventBus.emit('scene-ready', 'MazeScene');
  }
  update() { if (!this.player || !this.cursors) return; const speed = 3; if (this.cursors.left.isDown) this.player.x -= speed; if (this.cursors.right.isDown) this.player.x += speed; if (this.cursors.up.isDown) this.player.y -= speed; if (this.cursors.down.isDown) this.player.y += speed; this.player.x = Phaser.Math.Clamp(this.player.x, 180, 1130); this.player.y = Phaser.Math.Clamp(this.player.y, 245, 600); if (this.goal && Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.goal.getBounds())) this.finish(); }
  private resetPlayer() { if (this.player) { this.player.x = 220; this.player.y = 520; toast('Por aquí no encontramos apoyo. Volvamos a la última bifurcación.', 'click'); } }
  private finish() { if (gameStore.getState().completedMissions.includes('maze')) return; gameStore.completeMission('maze', 'apoyo'); toast('Ruta encontrada: pedir apoyo nos acerca a una respuesta.', 'safe'); this.time.delayedCall(900, () => this.scene.start('SortingScene')); }
}

export class SortingScene extends Phaser.Scene {
  private remaining = 30;
  private count = 0;
  private timerText?: Phaser.GameObjects.Text;
  constructor() { super('SortingScene'); }
  create() {
    enterScene(this); paintRoom(this, 'MISIÓN 8 · ARCADE DE CLASIFICACIÓN', 'Arrastra a la papelera solo las frases que NO ayudan.'); this.timerText = timerLabel(this, 30);
    const trash = this.add.rectangle(1020, 460, 260, 170, palette.coral).setStrokeStyle(5, palette.ink, 0.25); this.add.text(1020, 460, '🗑 PAPELERA\nNO AYUDA', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '24px', color: '#173c4b', fontStyle: 'bold', align: 'center' }).setOrigin(0.5); const keep = this.add.rectangle(350, 460, 260, 170, palette.mint).setStrokeStyle(5, palette.ink, 0.25); this.add.text(350, 460, '✦ CONSERVAR\nSÍ ACOMPAÑA', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '24px', color: '#173c4b', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
    const phrases = [['Solo quiere llamar la atención.', true], ['Estoy aquí para escucharte.', false], ['No exageres.', true], ['Podemos buscar ayuda juntos.', false], ['Tienes que resolverlo solo.', true], ['¿Quieres que busquemos a un adulto?', false]] as const;
    const cards: Array<{ body: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text; homeX: number; homeY: number; shouldTrash: boolean; handled: boolean }> = [];
    let activeCard: (typeof cards)[number] | undefined;
    let pointerWasDown = false;
    phrases.forEach(([label, shouldTrash], index) => {
      const homeX = 350 + (index % 3) * 285; const homeY = 245 + Math.floor(index / 3) * 95;
      const body = this.add.rectangle(homeX, homeY, 260, 70, 0xfffdf5).setStrokeStyle(2, palette.ink, 0.22).setInteractive();
      const text = this.add.text(homeX, homeY, label, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '17px', color: '#173c4b', align: 'center', wordWrap: { width: 230 } }).setOrigin(0.5);
      const card = { body, text, homeX, homeY, shouldTrash, handled: false };
      cards.push(card);
      body.on('pointerdown', () => { activeCard = card; pointerWasDown = true; });
    });
    const resetCard = (card: (typeof cards)[number]) => { if (!card.body.active) return; card.body.setPosition(card.homeX, card.homeY); card.text.setPosition(card.homeX, card.homeY); };
    const validDrop = (card: (typeof cards)[number], pointer: Phaser.Input.Pointer) => {
      const bin = (card.shouldTrash ? trash : keep).getBounds();
      const drop = new Phaser.Geom.Rectangle(pointer.x, pointer.y, 1, 1);
      return Phaser.Geom.Intersects.RectangleToRectangle(drop, bin) || Phaser.Geom.Intersects.RectangleToRectangle(card.body.getBounds(), bin);
    };
    const registerDrop = (card: (typeof cards)[number]) => {
      if (!card.body.active || card.handled) return;
      card.handled = true; this.count += 1; card.body.destroy(); card.text.destroy();
      toast(`${this.count}/6 · Clasificación registrada.`, card.shouldTrash ? 'paper' : 'clue');
      if (this.count === 6) { gameStore.completeMission('sorting', 'apoyo'); this.time.delayedCall(900, () => this.scene.start('SafeFinaleScene')); }
    };
    const findCardAt = (pointer: Phaser.Input.Pointer) => [...cards].reverse().find(card => {
      if (!card.body.active) return false;
      const bounds = card.body.getBounds();
      return pointer.x >= bounds.left && pointer.x <= bounds.right && pointer.y >= bounds.top && pointer.y <= bounds.bottom;
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      activeCard = findCardAt(pointer);
      pointerWasDown = true;
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!activeCard?.body.active) return;
      activeCard.body.setPosition(pointer.x, pointer.y); activeCard.text.setPosition(pointer.x, pointer.y);
    });
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const card = activeCard; activeCard = undefined;
      if (card) { if (validDrop(card, pointer)) registerDrop(card); else resetCard(card); pointerWasDown = false; return; }
      const overTrash = pointer.x >= trash.x - trash.width / 2 && pointer.x <= trash.x + trash.width / 2 && pointer.y >= trash.y - trash.height / 2 && pointer.y <= trash.y + trash.height / 2;
      const overKeep = pointer.x >= keep.x - keep.width / 2 && pointer.x <= keep.x + keep.width / 2 && pointer.y >= keep.y - keep.height / 2 && pointer.y <= keep.y + keep.height / 2;
      if (overTrash || overKeep) {
        const fallback = cards.find(item => item.body.active && !item.handled && item.shouldTrash === overTrash);
        if (fallback) registerDrop(fallback);
      }
      pointerWasDown = false;
    });
    this.events.on('update', () => {
      const pointer = this.input.activePointer;
      if (pointer.isDown) {
        pointerWasDown = true;
        if (!activeCard) activeCard = findCardAt(pointer);
        if (activeCard?.body.active) { activeCard.body.setPosition(pointer.x, pointer.y); activeCard.text.setPosition(pointer.x, pointer.y); }
        return;
      }
      if (!pointerWasDown) return;
      pointerWasDown = false;
      if (activeCard) { const card = activeCard; activeCard = undefined; if (validDrop(card, pointer)) registerDrop(card); else resetCard(card); return; }
      const overTrash = pointer.x >= trash.x - trash.width / 2 && pointer.x <= trash.x + trash.width / 2 && pointer.y >= trash.y - trash.height / 2 && pointer.y <= trash.y + trash.height / 2;
      const overKeep = pointer.x >= keep.x - keep.width / 2 && pointer.x <= keep.x + keep.width / 2 && pointer.y >= keep.y - keep.height / 2 && pointer.y <= keep.y + keep.height / 2;
      if (overTrash || overKeep) {
        const fallback = cards.find(item => item.body.active && !item.handled && item.shouldTrash === overTrash);
        if (fallback) registerDrop(fallback);
      }
    });
    this.time.addEvent({ delay: 1000, loop: true, callback: () => { if (this.count >= 6) return; this.remaining -= 1; this.timerText?.setText(`⏱ INVESTIGACIÓN ${this.remaining}s`); if (this.remaining <= 0) { this.remaining = 30; toast('La mesa activa una pista extra. El arcade continúa sin castigo.', 'clue'); } } });
    EventBus.emit('scene-ready', 'SortingScene');
  }
}
