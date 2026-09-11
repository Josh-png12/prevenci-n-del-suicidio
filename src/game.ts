import type { EvidenceKey } from './types';
export function isCorrect(choice: number, expected: number) { return choice === expected; }
export function unlockEvidence(current: EvidenceKey[], next: EvidenceKey) { return current.includes(next) ? current : [...current, next]; }
export function progressLabel(caseIndex: number, total = 10) { return `${Math.min(caseIndex, total)}/${total}`; }
export function isMissionComplete(caseIndex: number, total = 10) { return caseIndex >= total - 1; }
