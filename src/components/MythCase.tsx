import type { DetectiveCase } from '../types';
type Props = { item: DetectiveCase; selected: number | null; onSelect: (index: number) => void; disabled?: boolean };
export function MythCase({ item, selected, onSelect, disabled }: Props) {
  return <article className="case-card myth-card" data-testid="myth-case"><p className="eyebrow">{item.eyebrow}</p><div className="myth-file"><span className="redacted">RUMOR // 04</span><p>{item.prompt}</p></div><p className="myth-question">¿Qué dice la evidencia?</p><div className="myth-actions">{(item.options ?? []).map((option, index) => <button key={option} className={`myth-button ${selected === index ? 'selected' : ''}`} onClick={() => onSelect(index)} disabled={disabled} data-testid={`choice-${index}`}>{option}</button>)}</div>{selected === 1 && <div className="myth-seal">MITO<br />DESTRUIDO</div>}</article>;
}
