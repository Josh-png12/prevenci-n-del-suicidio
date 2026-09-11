import { useEffect, useRef, useState } from 'react';
import { playTone, startWarmMusic, stopWarmMusic } from './audio';
import { EventBus, type ActivityNoticePayload, type ToastPayload } from './game/EventBus';
import { gameStore, type GameState } from './game/GameStore';
import { PhaserGame } from './game/PhaserGame';

function App() {
  const [started, setStarted] = useState(false);
  const [state, setState] = useState<GameState>(gameStore.getState());
  const [toastMessage, setToastMessage] = useState('');
  const [finale, setFinale] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [activityNotice, setActivityNotice] = useState<ActivityNoticePayload | null>(null);
  const [noticeClosing, setNoticeClosing] = useState(false);
  const phaserRef = useRef<{ game: Phaser.Game }>(null);
  const noticeRef = useRef<ActivityNoticePayload | null>(null);
  const noticeTimerRef = useRef<number | undefined>(undefined);
  const noticeCloseTimerRef = useRef<number | undefined>(undefined);
  const noticeOpenedAtRef = useRef(0);

  const dismissNotice = () => {
    if (!noticeRef.current || Date.now() - noticeOpenedAtRef.current < 1400) return;
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    setNoticeClosing(true);
    noticeCloseTimerRef.current = window.setTimeout(() => { noticeRef.current = null; setActivityNotice(null); setNoticeClosing(false); }, 320);
  };

  useEffect(() => {
    const unsubscribe = gameStore.subscribe(setState);
    const onToast = ({ message, tone }: ToastPayload) => { setToastMessage(message); if (tone) playTone(tone, gameStore.getState().audioEnabled); window.setTimeout(() => setToastMessage(''), 2600); };
    const onFinale = () => setFinale(true);
    const onFinaleStart = () => startWarmMusic(gameStore.getState().audioEnabled);
    const onActivityNotice = (payload: ActivityNoticePayload) => {
      noticeRef.current = payload; noticeOpenedAtRef.current = Date.now(); setNoticeClosing(false); setActivityNotice(payload);
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      if (noticeCloseTimerRef.current) window.clearTimeout(noticeCloseTimerRef.current);
      noticeTimerRef.current = window.setTimeout(dismissNotice, payload.duration ?? 4500);
    };
    EventBus.on('toast', onToast); EventBus.on('finale-ready', onFinale); EventBus.on('finale-start', onFinaleStart); EventBus.on('activity-notice', onActivityNotice);
    return () => { unsubscribe(); EventBus.off('toast', onToast); EventBus.off('finale-ready', onFinale); EventBus.off('finale-start', onFinaleStart); EventBus.off('activity-notice', onActivityNotice); if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current); if (noticeCloseTimerRef.current) window.clearTimeout(noticeCloseTimerRef.current); stopWarmMusic(); };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Enter') dismissNotice(); if (event.key.toLowerCase() === 'f') void toggleFullscreen(); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);

  const start = () => { stopWarmMusic(); gameStore.reset(); setFinale(false); setStarted(true); };
  const toggleSound = () => gameStore.update({ audioEnabled: !state.audioEnabled });
  const testSound = () => { playTone('clue', state.audioEnabled); setToastMessage(state.audioEnabled ? '♪ Prueba de sonido: pista encontrada' : '🔇 El sonido está apagado'); };
  const toggleFullscreen = async () => { try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch { document.body.classList.toggle('focus-mode'); } };
  const reset = () => { stopWarmMusic(); gameStore.reset(); setStarted(false); setFinale(false); setResetOpen(false); setToastMessage(''); noticeRef.current = null; setActivityNotice(null); };

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">QD</span><span><b>QUIZ DETECTIVE</b><small>OPERACIÓN: CÓDIGO DE APOYO</small></span></div>
      <div className="top-actions">
        <button className="utility-button" data-testid="sound-toggle" onClick={toggleSound}>{state.audioEnabled ? '🔊' : '🔇'} SONIDO {state.audioEnabled ? 'ON' : 'OFF'}</button>
        <button className="utility-button" data-testid="sound-test" onClick={testSound}>♪ PROBAR SONIDO</button>
        <button className="utility-button" onClick={() => void toggleFullscreen()}>⛶ PANTALLA COMPLETA <kbd>F</kbd></button>
        {started && <button className="reset-button" onClick={() => setResetOpen(true)}>↺ REINICIAR MISIÓN</button>}
      </div>
    </header>
    {!started ? <main className="intro-screen">
      <div className="intro-copy"><p className="eyebrow">UNA AVENTURA COOPERATIVA · 50 MINUTOS</p><h1>QUIZ DETECTIVE<br /><span>Operación: Código de Apoyo</span></h1><p className="intro-lead">La oficina está viva. El teléfono puede sonar, una llave puede estar escondida y cada pista se descubre dentro del mundo.</p><p className="intro-detail">La psicóloga controla el mouse. El escuadrón observa, grita direcciones, vota, arrastra objetos y construye el camino juntos.</p><button className="primary-button" data-testid="start-game" onClick={start}>Entrar a la oficina <span>→</span></button><div className="intro-hint">ENTER para comenzar · F pantalla completa · audio opcional</div></div>
      <div className="intro-art"><div className="art-lamp">◒</div><div className="art-folder">▤<small>EXPEDIENTE<br />05-A</small></div><div className="art-safe">✦<small>?????</small></div><div className="art-note">“Las mejores pistas<br />aparecen cuando<br />miramos juntos.”</div></div>
    </main> : <main className="game-shell">
      <div className="game-hud" data-testid="game-hud"><div className="hud-mission"><span className="hud-label">ESCENA</span><strong>{state.currentScene.replace('Scene', '').toUpperCase()}</strong><div className="hud-progress"><i style={{ width: `${state.missionProgress}%` }} /></div><small>{state.completedMissions.length}/10 misiones · {state.secretsFound} secretos</small></div><div className="hud-evidence"><span className="hud-label">EVIDENCIAS EN EL TABLERO</span><div className="evidence-pills">{['hablar', 'escuchar', 'empatia', 'acompanar', 'apoyo'].map(key => <span className={state.evidences.includes(key as GameState['evidences'][number]) ? 'found' : ''} key={key}>{state.evidences.includes(key as GameState['evidences'][number]) ? '✦' : '?'} {key === 'acompanar' ? 'ACOMPAÑAR' : key === 'empatia' ? 'EMPATÍA' : key === 'apoyo' ? 'PEDIR AYUDA' : key.toUpperCase()}</span>)}</div></div><div className="hud-hints">PISTAS<br /><strong>{state.hintsRemaining}</strong></div></div>
      <PhaserGame ref={phaserRef} />
      {toastMessage && <div className="world-toast" role="status" data-testid="world-toast">{toastMessage}</div>}
      {activityNotice && <div className={`activity-notice${noticeClosing ? ' is-closing' : ''}`} role="status" aria-live="assertive" data-testid="activity-notice" onClick={dismissNotice} tabIndex={0}><span className="activity-notice-icon" aria-hidden="true">{activityNotice.icon ?? '🔒'}</span><div><span className="activity-notice-title">{activityNotice.title}</span><strong>{activityNotice.message}</strong><small>Podemos cerrarlo con un clic o ENTER cuando todos alcancen a leerlo.</small></div></div>}
      {finale && <div className="conversation-prompt" data-testid="conversation-prompt"><span>REFLEXIÓN DEL ESCUADRÓN</span><strong>¿Qué podemos hacer nosotros para que este salón sea un lugar donde sea más fácil pedir ayuda?</strong><small>Que nadie de nuestro equipo tenga que sentirse solo.</small></div>}
    </main>}
    {resetOpen && <div className="reset-confirm" role="dialog" aria-modal="true"><strong>¿Reiniciar la misión?</strong><span>Se borrará el progreso guardado en este navegador.</span><div><button className="utility-button" onClick={() => setResetOpen(false)}>Seguir misión</button><button className="reset-button" onClick={reset}>Reiniciar</button></div></div>}
  </div>;
}

export default App;
