import type { DetectiveCase } from '../types';
import { Choice } from './Choice';
type Props = { item: DetectiveCase; selected: number | null; onSelect: (index: number) => void; disabled?: boolean };
export function ChatCase({ item, selected, onSelect, disabled }: Props) {
  return <article className="case-card chat-card" data-testid="chat-case"><div className="chat-top"><span className="avatar">◌</span><div><strong>PERSONA</strong><small>mensaje encontrado · ahora</small></div></div><div className="chat-bubble">{item.prompt}</div><p className="chat-instruction">Selecciona el mensaje que enviaría un buen detective:</p><Choice options={item.options ?? []} selected={selected} onSelect={onSelect} disabled={disabled} /></article>;
}
