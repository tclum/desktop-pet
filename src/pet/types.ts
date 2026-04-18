export type PetStage = 'starter' | 'hatchling' | 'stage1' | 'stage2';
export type PetPersonality = 'cuddly' | 'powerful';

export interface PetState {
  id: number;
  created_at: string;
  stage: PetStage;
  personality: PetPersonality | null;
  last_interaction_at: string;
  /** Computed from timestamps on the Rust side — never a running counter. */
  seconds_since_last_interaction: number;
}
