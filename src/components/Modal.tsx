import type { ReactNode } from 'react';
type Props = { title: string; children: ReactNode; onConfirm: () => void; onCancel: () => void };
export function Modal({ title, children, onConfirm, onCancel }: Props) { return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}><div className="modal"><p className="eyebrow">CONFIRMACIÓN</p><h2>{title}</h2><p>{children}</p><div className="modal-actions"><button className="ghost-button" onClick={onCancel}>Seguir misión</button><button className="danger-button" onClick={onConfirm}>Nueva misión</button></div></div></div>; }
