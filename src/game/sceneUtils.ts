import Phaser from 'phaser';
import type { EvidenceKey } from '../types';
import { EventBus } from './EventBus';
import { gameStore, type MissionId } from './GameStore';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const palette = { ink: 0x173c4b, blue: 0x8edce5, sky: 0xdff6f3, mint: 0xb9ead5, cream: 0xfff8e9, coral: 0xf39b83, gold: 0xf5c75b, brown: 0x8a654e, paper: 0xfffdf5 };

export function paintRoom(scene: Phaser.Scene, title: string, subtitle: string) {
  scene.cameras.main.setBackgroundColor(palette.sky);
  scene.add.rectangle(GAME_WIDTH / 2, 470, GAME_WIDTH, 500, palette.cream);
  scene.add.rectangle(GAME_WIDTH / 2, 650, GAME_WIDTH, 140, 0xd8b889);
  scene.add.rectangle(GAME_WIDTH / 2, 70, GAME_WIDTH, 140, 0xf9fffb);
  scene.add.text(42, 34, title, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '30px', color: '#173c4b', fontStyle: 'bold' });
  scene.add.text(44, 77, subtitle, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '16px', color: '#52727b' });
  scene.add.circle(1170, 70, 26, palette.coral, 0.26);
  scene.add.circle(1210, 70, 12, palette.gold, 0.45);
}

export function addButton(scene: Phaser.Scene, x: number, y: number, width: number, height: number, label: string, onClick: () => void, color = palette.blue) {
  const background = scene.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(2, palette.ink, 0.2);
  const text = scene.add.text(x, y, label, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '18px', color: '#173c4b', fontStyle: 'bold', align: 'center', wordWrap: { width: width - 22 } }).setOrigin(0.5);
  const hit = scene.add.zone(x, y, width, height).setRectangleDropZone(width, height).setInteractive();
  hit.on('pointerover', () => { background.setFillStyle(Phaser.Display.Color.IntegerToColor(color).brighten(12).color); text.setScale(1.03); });
  hit.on('pointerout', () => { background.setFillStyle(color); text.setScale(1); });
  hit.on('pointerdown', onClick);
  return { background, text, hit };
}

export function addHotspot(scene: Phaser.Scene, x: number, y: number, width: number, height: number, label: string, onClick: () => void, color = palette.mint) {
  const body = scene.add.rectangle(x, y, width, height, color, 0.92).setStrokeStyle(2, palette.ink, 0.25).setInteractive();
  scene.add.text(x, y, label, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '16px', color: '#173c4b', fontStyle: 'bold', align: 'center', wordWrap: { width: width - 20 } }).setOrigin(0.5);
  body.on('pointerover', () => { body.setFillStyle(palette.gold); body.setScale(1.04); });
  body.on('pointerout', () => { body.setFillStyle(color); body.setScale(1); });
  body.on('pointerdown', onClick);
  return body;
}

export function toast(message: string, tone: 'click' | 'clue' | 'seal' | 'safe' | 'phone' | 'scanner' | 'paper' = 'click') {
  EventBus.emit('toast', { message, tone });
}

export function enterScene(scene: Phaser.Scene) {
  gameStore.update({ currentScene: scene.scene.key });
  EventBus.emit('scene-ready', scene.scene.key);
}

export function drawEvidenceBoard(scene: Phaser.Scene, x = 1040, y = 135) {
  scene.add.rectangle(x, y, 390, 118, 0xe7c98e, 1).setStrokeStyle(4, palette.brown, 0.7);
  scene.add.text(x - 170, y - 47, 'TABLERO · CÓDIGO DE APOYO', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '15px', color: '#173c4b', fontStyle: 'bold' });
  const labels: Array<[EvidenceKey, string]> = [['hablar', 'HABLAR'], ['escuchar', 'ESCUCHAR'], ['empatia', 'EMPATÍA'], ['acompanar', 'ACOMPAÑAR'], ['apoyo', 'PEDIR AYUDA']];
  labels.forEach(([key, label], index) => {
    const has = gameStore.getState().evidences.includes(key);
    const px = x - 155 + index * 78;
    scene.add.circle(px, y + 15, 7, has ? palette.coral : 0x9f805d);
    scene.add.rectangle(px, y + 47, 67, 32, has ? palette.cream : 0xd9bd85, 1).setStrokeStyle(1, palette.brown, 0.5);
    scene.add.text(px, y + 47, has ? label : '???', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '10px', color: '#173c4b', fontStyle: 'bold', align: 'center', wordWrap: { width: 60 } }).setOrigin(0.5);
  });
}

export function flyEvidence(scene: Phaser.Scene, label: string, mission: MissionId, evidence: EvidenceKey, onDone: () => void) {
  const token = scene.add.container(310, 305);
  token.add(scene.add.rectangle(0, 0, 210, 58, palette.coral).setStrokeStyle(2, palette.ink, 0.35));
  token.add(scene.add.text(0, 0, `✦ ${label}`, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '20px', color: '#173c4b', fontStyle: 'bold' }).setOrigin(0.5));
  scene.tweens.add({ targets: token, x: 1040, y: 135, scale: 0.55, angle: 8, duration: 1200, ease: 'Cubic.easeInOut', onComplete: () => { gameStore.completeMission(mission, evidence); token.destroy(); toast(`${label} quedó clavada en el tablero.`, 'safe'); onDone(); } });
}
