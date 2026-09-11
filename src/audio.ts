let context: AudioContext | null = null;
let warmMusic: { oscillators: OscillatorNode[]; gain: GainNode } | null = null;
export function playTone(type: 'click' | 'clue' | 'seal' | 'safe' | 'phone' | 'scanner' | 'paper', enabled: boolean) {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    const now = context.currentTime;
    const notes = type === 'safe' ? [220, 330, 440] : type === 'clue' ? [392, 523, 659] : type === 'seal' ? [260, 180] : type === 'phone' ? [660, 520] : type === 'scanner' ? [740, 880, 1040] : type === 'paper' ? [300, 360] : [440];
    notes.forEach((frequency, index) => { const oscillator = context!.createOscillator(); const gain = context!.createGain(); oscillator.type = type === 'seal' ? 'triangle' : 'sine'; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(0.0001, now + index * 0.09); gain.gain.exponentialRampToValueAtTime(0.05, now + index * 0.09 + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.09 + 0.18); oscillator.connect(gain).connect(context!.destination); oscillator.start(now + index * 0.09); oscillator.stop(now + index * 0.09 + 0.2); });
  } catch { /* Audio is optional and browsers may block it. */ }
}

export function startWarmMusic(enabled: boolean) {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    stopWarmMusic();
    const gain = context.createGain();
    const now = context.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.018, now + 1.2);
    gain.connect(context.destination);
    const oscillators = [220, 277.18, 329.63].map((frequency, index) => {
      const oscillator = context!.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = frequency; oscillator.detune.value = index === 1 ? 3 : -2; oscillator.connect(gain); oscillator.start(); return oscillator;
    });
    warmMusic = { oscillators, gain };
  } catch { /* Warm audio is optional and browsers may block it. */ }
}

export function stopWarmMusic() {
  if (!warmMusic || !context) return;
  const current = warmMusic; warmMusic = null;
  const now = context.currentTime;
  current.gain.gain.cancelScheduledValues(now); current.gain.gain.setValueAtTime(current.gain.gain.value, now); current.gain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
  current.oscillators.forEach(oscillator => oscillator.stop(now + 0.85));
}
