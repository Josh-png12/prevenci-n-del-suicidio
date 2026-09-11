type Props = { options: string[]; selected: number | null; onSelect: (index: number) => void; disabled?: boolean };
export function Choice({ options, selected, onSelect, disabled = false }: Props) {
  return <div className="choice-grid" role="group" aria-label="Opciones de respuesta">
    {options.map((option, index) => <button key={option} className={`choice ${selected === index ? 'selected' : ''}`} onClick={() => onSelect(index)} disabled={disabled} aria-keyshortcuts={index < 3 ? String(index + 1) : undefined} data-testid={`choice-${index}`}>
      <span className="choice-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>
    </button>)}
  </div>;
}
