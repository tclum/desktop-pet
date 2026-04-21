/**
 * Typed wrappers around Tauri's invoke(). All `any` usage is quarantined
 * here so the rest of the app has fully-typed boundaries.
 */
import { invoke } from '@tauri-apps/api/core';
import type { PetState } from '../pet/types';
import type { Task, FocusSession, CompleteTaskResult, CompleteFocusResult } from '../productivity/types';

export function getPet(): Promise<PetState> {
  return invoke('get_pet');
}

export function recordPetInteraction(petId: number): Promise<PetState> {
  return invoke('record_pet_interaction', { petId });
}

export function isNotificationPermissionNeeded(): Promise<boolean> {
  return invoke('is_notification_permission_needed');
}

export function markNotificationPermissionAsked(): Promise<void> {
  return invoke('mark_notification_permission_asked');
}

// ---------------------------------------------------------------------------
// Task commands
// ---------------------------------------------------------------------------

export function getTasks(): Promise<Task[]> {
  return invoke('get_tasks');
}

export function createTask(title: string): Promise<Task> {
  return invoke('create_task', { title });
}

export function completeTask(taskId: number): Promise<CompleteTaskResult> {
  return invoke('complete_task', { taskId });
}

export function evolveToHatchling(): Promise<PetState> {
  return invoke('evolve_to_hatchling');
}

export function deleteTask(taskId: number): Promise<void> {
  return invoke('delete_task', { taskId });
}

export function updateTask(taskId: number, newTitle: string): Promise<void> {
  return invoke('update_task', { taskId, newTitle });
}

export function reorderTasks(orderedTaskIds: number[]): Promise<void> {
  return invoke('reorder_tasks', { orderedTaskIds });
}

// ---------------------------------------------------------------------------
// Focus session commands
// ---------------------------------------------------------------------------

export function startFocusSession(durationMinutes: number): Promise<FocusSession> {
  return invoke('start_focus_session', { durationMinutes });
}

export function completeFocusSession(sessionId: number): Promise<CompleteFocusResult> {
  return invoke('complete_focus_session', { sessionId });
}

export function abortFocusSession(sessionId: number): Promise<void> {
  return invoke('abort_focus_session', { sessionId });
}

// ---------------------------------------------------------------------------
// Window position commands
// ---------------------------------------------------------------------------

export interface WindowPosition {
  x: number;
  y: number;
}

export function getWindowPosition(): Promise<WindowPosition | null> {
  return invoke('get_window_position');
}

export function setWindowPosition(x: number, y: number): Promise<void> {
  return invoke('set_window_position', { x, y });
}

// ---------------------------------------------------------------------------
// Debug / demo commands — only invoked by the hidden DebugPanel
// ---------------------------------------------------------------------------

export interface DebugAddGrowthResult {
  evolved: boolean;
  pet: PetState;
}

export function debugResetPet(): Promise<PetState> {
  return invoke('debug_reset_pet');
}

export function debugAddGrowth(delta: number): Promise<DebugAddGrowthResult> {
  return invoke('debug_add_growth', { delta });
}

export type GreetingTier = 'none' | 'small' | 'medium' | 'large';

export function checkGreeting(): Promise<GreetingTier> {
  return invoke('check_greeting');
}

export interface StartSessionResult {
  tier: GreetingTier;
  pet: PetState;
}

export function startSession(): Promise<StartSessionResult> {
  return invoke('start_session');
}
