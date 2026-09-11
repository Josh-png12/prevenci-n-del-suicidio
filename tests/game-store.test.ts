import { beforeEach, describe, expect, it } from 'vitest';
import { gameStore } from '../src/game/GameStore';

describe('cooperative GameStore', () => {
  beforeEach(() => gameStore.reset());

  it('keeps mission progress and evidence in one state', () => {
    gameStore.completeMission('archive', 'hablar');
    expect(gameStore.getState().completedMissions).toEqual(['archive']);
    expect(gameStore.getState().evidences).toEqual(['hablar']);
    expect(gameStore.getState().missionProgress).toBe(10);
  });

  it('deduplicates secrets and clues', () => {
    gameStore.findSecret('plant'); gameStore.findSecret('plant'); gameStore.addClue('letter'); gameStore.addClue('letter');
    expect(gameStore.getState().secretsFound).toBe(1); expect(gameStore.getState().unlockedObjects).toEqual(['plant']); expect(gameStore.getState().clues).toEqual(['letter']);
  });

  it('resets progress, flags and hints without leaving local state', () => {
    gameStore.completeMission('archive', 'hablar'); gameStore.update({ hintsRemaining: 0, flags: { key: true } }); gameStore.reset();
    expect(gameStore.getState().completedMissions).toEqual([]); expect(gameStore.getState().evidences).toEqual([]); expect(gameStore.getState().hintsRemaining).toBe(3); expect(gameStore.getState().flags).toEqual({});
  });
});
