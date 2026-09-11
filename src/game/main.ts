import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './sceneUtils';
import { BootScene } from './scenes/BootScene';
import { OfficeScene } from './scenes/OfficeScene';
import { ArchiveScene, ChatPuzzleScene, EvidenceBoardScene, HiddenObjectScene, MazeScene, MagnifierScene, MythStampScene, SortingScene, ToolkitScene } from './scenes/PuzzleScenes';
import { SafeFinaleScene } from './scenes/SafeFinaleScene';

export default function StartGame(parent: string) {
  return new Phaser.Game({
    type: Phaser.AUTO, width: GAME_WIDTH, height: GAME_HEIGHT, parent,
    backgroundColor: '#dff6f3', render: { antialias: true, roundPixels: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, OfficeScene, ArchiveScene, MagnifierScene, ChatPuzzleScene, EvidenceBoardScene, MythStampScene, HiddenObjectScene, ToolkitScene, MazeScene, SortingScene, SafeFinaleScene]
  });
}
