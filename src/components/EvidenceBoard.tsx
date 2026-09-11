import { evidenceMeta, evidenceOrder } from '../data/cases';
import type { EvidenceKey } from '../types';

type Props = { unlocked: EvidenceKey[]; compact?: boolean };
export function EvidenceBoard({ unlocked, compact = false }: Props) {
  return <section className={`evidence-board ${compact ? 'compact' : ''}`} aria-label="Tablero de evidencias">
    <div className="board-heading"><span>▦ TABLERO DE INVESTIGACIÓN</span><span className="board-count">{unlocked.length}/5 piezas</span></div>
    <div className="evidence-slots">
      {evidenceOrder.map((key, index) => {
        const found = unlocked.includes(key);
        const meta = evidenceMeta[key];
        return <div key={key} className={`evidence-slot ${found ? 'found' : ''}`} data-testid={`evidence-${key}`}>
          <span className="slot-number">0{index + 1}</span><span className="slot-icon">{found ? meta.icon : '?'}</span><span className="slot-label">{found ? meta.label : 'EVIDENCIA'}</span>
        </div>;
      })}
    </div>
  </section>;
}
