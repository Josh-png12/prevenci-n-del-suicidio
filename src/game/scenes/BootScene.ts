import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { gameStore } from '../GameStore';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create() {
    gameStore.update({ currentScene: 'BootScene' });
    EventBus.emit('scene-ready', 'BootScene');
    this.scene.start('OfficeScene');
  }
}
