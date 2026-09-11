import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { cases } from '../src/data/cases';
import { CaseCard } from '../src/components/CaseCard';
import { EvidenceBoard } from '../src/components/EvidenceBoard';
import { ChatCase } from '../src/components/ChatCase';
import { MythCase } from '../src/components/MythCase';
import { SupportNetwork } from '../src/components/SupportNetwork';
import { FinalScreen } from '../src/components/FinalScreen';
import { Modal } from '../src/components/Modal';

describe('reusable game components', () => {
  it('renders CaseCard choices', () => { render(<CaseCard item={cases[0]} selected={null} onSelect={vi.fn()} />); expect(screen.getByTestId('case-card')).toBeInTheDocument(); expect(screen.getAllByRole('button')).toHaveLength(3); });
  it('renders the evidence board with found and hidden slots', () => { render(<EvidenceBoard unlocked={['hablar']} />); expect(screen.getByTestId('evidence-hablar')).toHaveClass('found'); expect(screen.getAllByText('EVIDENCIA')).toHaveLength(4); });
  it('renders chat and myth variants', () => { render(<ChatCase item={cases[1]} selected={null} onSelect={vi.fn()} />); expect(screen.getByTestId('chat-case')).toBeInTheDocument(); render(<MythCase item={cases[3]} selected={null} onSelect={vi.fn()} />); expect(screen.getByTestId('myth-case')).toBeInTheDocument(); });
  it('renders network and final screens', () => { render(<SupportNetwork item={cases[9]} onComplete={vi.fn()} />); expect(screen.getByTestId('support-network')).toBeInTheDocument(); render(<FinalScreen onRestart={vi.fn()} />); expect(screen.getByTestId('final-screen')).toBeInTheDocument(); });
  it('renders the reset modal with both actions', () => { render(<Modal title="¿Reiniciar?" onConfirm={vi.fn()} onCancel={vi.fn()}>Confirmación</Modal>); expect(screen.getByRole('dialog')).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Nueva misión' })).toBeInTheDocument(); });
});
