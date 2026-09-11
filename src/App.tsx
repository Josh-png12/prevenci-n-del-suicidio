import { useEffect, useRef, useState } from 'react';
import { playTone } from './audio';
import { EventBus, type ToastPayload } from './game/EventBus';
import { gameStore, type GameState } from './game/GameStore';
import { PhaserGame } from './game/PhaserGame';

function App() {
  const [started, setStarted] = useState(false);
  const [state, setState] = useState<GameState>(gameStore.getState());
  const [toastMessage, setToastMessage] = useState('');
  const [finale, setFinale] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const phaserRef = useRef<{ game: Phaser.Game }>(null);

  useEffect(() => {
    const unsubscribe = gameStore.subscribe(setState);
    const onToast = ({ message, tone }: ToastPayload) => { setToastMessage(message); if (tone) playTone(tone, gameStore.getState().audioEnabled); window.setTimeout(() => setToastMessage(''), 2600); };
    const onFinale = () => setFinale(true);
    EventBus.on('toast', onToast); EventBus.on('finale-ready', onFinale);
    return () => { unsubscribe(); EventBus.off('toast', onToast); EventBus.off('finale-ready', onFinale); };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key.toLowerCase() === 'f') void toggleFullscreen(); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);

  const start = () => { gameStore.reset(); setFinale(false); setStarted(true); };
  const toggleSound = () => gameStore.update({ audioEnabled: !state.audioEnabled });
  const testSound = () => { playTone('clue', state.audioEnabled); setToastMessage(state.audioEnabled ? '♪ Prueba de sonido: pista encontrada' : '🔇 El sonido está apagado'); };
  const toggleFullscreen = async () => { try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch { document.body.classList.toggle('focus-mode'); } };
  const reset = () => { gameStore.reset(); setStarted(false); setFinale(false); setResetOpen(false); setToastMessage(''); };

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
      {finale && <div className="conversation-prompt" data-testid="conversation-prompt"><span>CONVERSACIÓN FINAL</span><strong>¿Qué hace que una persona se sienta segura para pedir ayuda?</strong><small>Detengan el videojuego aquí y conversen con el escuadrón.</small></div>}
    </main>}
    {resetOpen && <div className="reset-confirm" role="dialog" aria-modal="true"><strong>¿Reiniciar la misión?</strong><span>Se borrará el progreso guardado en este navegador.</span><div><button className="utility-button" onClick={() => setResetOpen(false)}>Seguir misión</button><button className="reset-button" onClick={reset}>Reiniciar</button></div></div>}
  </div>;
}

export default App;
