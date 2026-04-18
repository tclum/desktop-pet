export interface Task {
  id: number;
  title: string;
  created_at: string;
  completed_at: string | null;
}

export interface CompleteTaskResult {
  points_awarded: number;
}

export interface FocusSession {
  id: number;
  started_at: string;
  duration_minutes: number;
}

export interface CompleteFocusResult {
  points_awarded: number;
}

export type FocusPhase = 'idle' | 'running' | 'paused' | 'done';
