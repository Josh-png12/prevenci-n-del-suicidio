import type { EvidenceKey } from '../types';
import { EventBus } from './EventBus';

export type MissionId = 'archive' | 'magnifier' | 'chat' | 'myth' | 'hidden' | 'board' | 'toolkit' | 'maze' | 'sorting' | 'safe';
export type GameState = {
  completedMissions: MissionId[];
  unlockedObjects: string[];
  evidences: EvidenceKey[];
  clues: string[];
  hintsRemaining: number;
  secretsFound: number;
  currentScene: string;
  audioEnabled: boolean;
  missionProgress: number;
  timers: Record<string, number>;
  flags: Record<string, boolean>;
};

const STORAGE = 'quiz-detective-game-state-v2';
export const initialGameState: GameState = {
  completedMissions: [], unlockedObjects: [], evidences: [], clues: [], hintsRemaining: 3,
  secretsFound: 0, currentScene: 'OfficeScene', audioEnabled: true, missionProgress: 0,
  timers: {}, flags: {}
};

function readState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE);
    return saved ? { ...initialGameState, ...JSON.parse(saved) as Partial<GameState> } : { ...initialGameState };
  } catch { return { ...initialGameState }; }
}

class GameStore {
  private state = readState();
  private listeners = new Set<(state: GameState) => void>();
  getState() { return this.state; }
  subscribe(listener: (state: GameState) => void) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  update(patch: Partial<GameState>) {
    this.state = { ...this.state, ...patch };
    try { localStorage.setItem(STORAGE, JSON.stringify(this.state)); } catch { /* offline persistence is optional */ }
    this.listeners.forEach(listener => listener(this.state));
    EventBus.emit('state-changed', this.state);
  }
  reset() { this.state = { ...initialGameState }; try { localStorage.removeItem(STORAGE); } catch { /* optional */ } this.listeners.forEach(listener => listener(this.state)); EventBus.emit('state-changed', this.state); }
  addClue(clue: string) { if (!this.state.clues.includes(clue)) this.update({ clues: [...this.state.clues, clue] }); }
  findSecret(secret: string) { if (!this.state.unlockedObjects.includes(secret)) this.update({ unlockedObjects: [...this.state.unlockedObjects, secret], secretsFound: this.state.secretsFound + 1 }); }
  completeMission(mission: MissionId, evidence?: EvidenceKey) {
    const completed = this.state.completedMissions.includes(mission) ? this.state.completedMissions : [...this.state.completedMissions, mission];
    const evidences = evidence && !this.state.evidences.includes(evidence) ? [...this.state.evidences, evidence] : this.state.evidences;
    this.update({ completedMissions: completed, evidences, missionProgress: Math.round((completed.length / 10) * 100) });
  }
}

export const gameStore = new GameStore();
