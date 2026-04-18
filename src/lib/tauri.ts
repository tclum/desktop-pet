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

export function deleteTask(taskId: number): Promise<void> {
  return invoke('delete_task', { taskId });
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
