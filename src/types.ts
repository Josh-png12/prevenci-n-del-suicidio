export type EvidenceKey = 'hablar' | 'escuchar' | 'empatia' | 'acompanar' | 'apoyo';
export type CaseKind = 'choice' | 'chat' | 'scanner' | 'myth' | 'tool' | 'trash' | 'network';
export type Phase = 'intro' | 'office' | 'case' | 'feedback' | 'unlock' | 'final_unlock' | 'reflection';

export type DetectiveCase = {
  id: number;
  title: string;
  eyebrow: string;
  kind: CaseKind;
  evidence: EvidenceKey;
  objective: string;
  prompt: string;
  options?: string[];
  correctIndex?: number;
  feedback: string;
  clue: string;
};
