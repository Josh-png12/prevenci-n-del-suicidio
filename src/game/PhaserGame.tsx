import { forwardRef, useLayoutEffect, useRef } from 'react';
import Phaser from 'phaser';
import StartGame from './main';
import { EventBus } from './EventBus';

export const PhaserGame = forwardRef<{ game: Phaser.Game }>(function PhaserGame(_, ref) {
  const game = useRef<Phaser.Game | undefined>(undefined);
  useLayoutEffect(() => {
    if (!game.current) {
      game.current = StartGame('game-container');
      if (ref && typeof ref === 'object') ref.current = { game: game.current };
    }
    return () => { game.current?.destroy(true); game.current = undefined; };
  }, [ref]);
  return <div id="game-container" data-testid="phaser-game" />;
});
