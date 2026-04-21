export type PetStage = 'starter' | 'hatchling' | 'stage1' | 'stage2';

/**
 * Combines stage + personality into a single key used to pick the sprite
 * asset. Downstream code should treat this as opaque; the mapping lives
 * in PetView's spriteUrl helper.
 */
export type PetForm =
  | 'starter'
  | 'hatchling'
  | 'stage1_cuddly'
  | 'stage1_powerful'
  | 'stage1_unknown';
export type PetPersonality = 'cuddly' | 'powerful';

export interface PetState {
  id: number;
  created_at: string;
  stage: PetStage;
  personality: PetPersonality | null;
  last_interaction_at: string;
  /** Computed from timestamps on the Rust side — never a running counter. */
  seconds_since_last_interaction: number;
  /** Monotonically non-decreasing. Grows from interactions, never shrinks. */
  bond: number;
}
