import type { DetectiveCase } from '../types';
import { Choice } from './Choice';
type Props = { item: DetectiveCase; selected: number | null; onSelect: (index: number) => void; disabled?: boolean };
export function CaseCard({ item, selected, onSelect, disabled }: Props) {
  return <article className="case-card paper-card" data-testid="case-card">
    <div className="case-stamp">CASO {String(item.id).padStart(2, '0')}</div><p className="eyebrow">{item.eyebrow}</p><h2>{item.title}</h2><p className="objective">{item.objective}</p><div className="case-prompt">{item.prompt}</div>
    {item.options && <Choice options={item.options} selected={selected} onSelect={onSelect} disabled={disabled} />}
  </article>;
}
