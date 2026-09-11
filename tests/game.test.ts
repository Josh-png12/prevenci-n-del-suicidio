import { describe, expect, it } from 'vitest';
import { formatTimer, isCorrect, isMissionComplete, progressLabel, timedChallengeExpired, unlockEvidence } from '../src/game';

describe('mission rules', () => {
  it('detects correct and incorrect answers', () => { expect(isCorrect(1, 1)).toBe(true); expect(isCorrect(0, 1)).toBe(false); });
  it('unlocks evidence without duplicates', () => { expect(unlockEvidence([], 'hablar')).toEqual(['hablar']); expect(unlockEvidence(['hablar'], 'hablar')).toEqual(['hablar']); });
  it('reports progress safely', () => { expect(progressLabel(3)).toBe('3/10'); expect(progressLabel(11)).toBe('10/10'); });
  it('knows when the final case is reached', () => { expect(isMissionComplete(9)).toBe(true); expect(isMissionComplete(8)).toBe(false); });
  it('formats timed investigations without negative values', () => { expect(formatTimer(20)).toBe('20s'); expect(formatTimer(-1)).toBe('0s'); expect(timedChallengeExpired(0)).toBe(true); expect(timedChallengeExpired(1)).toBe(false); });
});
