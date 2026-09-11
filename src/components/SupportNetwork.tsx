import { useState } from 'react';
import type { DetectiveCase } from '../types';
type Props = { item: DetectiveCase; onComplete: () => void; disabled?: boolean };
const safe = new Set([0, 1, 2, 3, 4]);
export function SupportNetwork({ item, onComplete, disabled = false }: Props) {
  const [chosen, setChosen] = useState<number[]>([]);
  const toggle = (index: number) => { if (disabled) return; const next = chosen.includes(index) ? chosen.filter(x => x !== index) : [...chosen, index]; setChosen(next); if (safe.size === next.filter(x => safe.has(x)).length && next.length === 5) onComplete(); };
  return <article className="case-card network-card" data-testid="support-network"><div className="network-map"><div className="network-person"><span>✦</span><small>PERSONA<br />NEUTRA</small></div>{(item.options ?? []).map((label, index) => <button key={label} className={`ally ally-${index} ${chosen.includes(index) ? 'connected' : ''}`} onClick={() => toggle(index)} disabled={disabled} aria-pressed={chosen.includes(index)}>{chosen.includes(index) && <i className="network-line" />}{label}</button>)}</div><div className="network-footer"><span>{chosen.filter(i => safe.has(i)).length}/5 aliados seguros conectados</span><span className="network-tip">La red se activa al reunir los cinco.</span></div></article>;
}
