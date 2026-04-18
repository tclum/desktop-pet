/**
 * Typed wrappers around Tauri's invoke(). All `any` usage is quarantined
 * here so the rest of the app has fully-typed boundaries.
 */
import { invoke } from '@tauri-apps/api/core';
import type { PetState } from '../pet/types';

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
