let context: AudioContext | null = null;
export function playTone(type: 'click' | 'clue' | 'seal' | 'safe' | 'phone', enabled: boolean) {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    const now = context.currentTime;
    const notes = type === 'safe' ? [220, 330, 440] : type === 'clue' ? [392, 523, 659] : type === 'seal' ? [260, 180] : type === 'phone' ? [660, 520] : [440];
    notes.forEach((frequency, index) => { const oscillator = context!.createOscillator(); const gain = context!.createGain(); oscillator.type = type === 'seal' ? 'triangle' : 'sine'; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(0.0001, now + index * 0.09); gain.gain.exponentialRampToValueAtTime(0.05, now + index * 0.09 + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.09 + 0.18); oscillator.connect(gain).connect(context!.destination); oscillator.start(now + index * 0.09); oscillator.stop(now + index * 0.09 + 0.2); });
  } catch { /* Audio is optional and browsers may block it. */ }
}
