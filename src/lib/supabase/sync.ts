/**
 * Supabase Sync Service
 * Handles offline-first data synchronization with localStorage fallback
 */

import { isSupabaseConfigured } from './client';
import { syncUsageToSupabase, syncUsageToLocalStorage } from './usage';
import { SYNC_CONFIG } from './constants';
import { storage } from '../config/localStorage';

/**
 * Offline action types
 */
export type OfflineActionType =
  | 'increment_check'
  | 'mark_free_check_used'
  | 'start_session'
  | 'end_session';

/**
 * Offline action structure
 */
export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

/**
 * Offline queue management (stored in localStorage)
 */
const OFFLINE_QUEUE_KEY = 'supabase_offline_queue';

/**
 * Get offline queue from localStorage
 */
function getOfflineQueue(): OfflineAction[] {
  try {
    const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (err) {
    console.error('[Sync] Error reading offline queue:', err);
    return [];
  }
}

/**
 * Save offline queue to localStorage
 */
function saveOfflineQueue(queue: OfflineAction[]): void {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('[Sync] Error saving offline queue:', err);
  }
}

/**
 * Add action to offline queue
 */
export function queueOfflineAction(
  type: OfflineActionType,
  payload: Record<string, unknown>
): void {
  const queue = getOfflineQueue();

  // Check queue size limit
  if (queue.length >= SYNC_CONFIG.MAX_OFFLINE_QUEUE_SIZE) {
    console.warn('[Sync] Offline queue is full, removing oldest action');
    queue.shift();
  }

  const action: OfflineAction = {
    id: crypto.randomUUID(),
    type,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
  };

  queue.push(action);
  saveOfflineQueue(queue);

  console.log('[Sync] Queued offline action:', type, payload);
}

/**
 * Remove action from offline queue
 */
function removeFromQueue(actionId: string): void {
  let queue = getOfflineQueue();
  queue = queue.filter((action) => action.id !== actionId);
  saveOfflineQueue(queue);
}

/**
 * Clear entire offline queue
 */
export function clearOfflineQueue(): void {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
  console.log('[Sync] Offline queue cleared');
}

/**
 * Get offline queue size
 */
export function getOfflineQueueSize(): number {
  return getOfflineQueue().length;
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Process a single offline action
 */
async function processOfflineAction(
  action: OfflineAction,
  userId: string
): Promise<boolean> {
  console.log('[Sync] Processing offline action:', action.type);

  try {
    switch (action.type) {
      case 'increment_check':
        // Usage increment is handled by the usage service
        // Just sync the total to Supabase
        return await syncUsageToSupabase(userId);

      case 'mark_free_check_used':
        return await syncUsageToSupabase(userId);

      case 'start_session':
        // Sessions are handled individually, not queued
        // This is here for future extensibility
        console.log('[Sync] Session start actions are handled individually');
        return true;

      case 'end_session':
        console.log('[Sync] Session end actions are handled individually');
        return true;

      default:
        console.warn('[Sync] Unknown action type:', action.type);
        return false;
    }
  } catch (err) {
    console.error('[Sync] Error processing action:', action.type, err);
    return false;
  }
}

/**
 * Process all queued offline actions
 */
export async function processOfflineQueue(userId: string): Promise<{
  processed: number;
  failed: number;
}> {
  if (!isSupabaseConfigured() || !isOnline()) {
    console.warn('[Sync] Cannot process queue: Supabase not configured or offline');
    return { processed: 0, failed: 0 };
  }

  const queue = getOfflineQueue();
  let processed = 0;
  let failed = 0;

  console.log(`[Sync] Processing ${queue.length} queued actions`);

  for (const action of queue) {
    const success = await processOfflineAction(action, userId);

    if (success) {
      removeFromQueue(action.id);
      processed++;
    } else {
      action.retryCount++;

      if (action.retryCount >= SYNC_CONFIG.MAX_RETRY_ATTEMPTS) {
        console.error('[Sync] Action failed after max retries, removing:', action);
        removeFromQueue(action.id);
        failed++;
      } else {
        // Update retry count in queue
        const updatedQueue = getOfflineQueue().map((a) =>
          a.id === action.id ? action : a
        );
        saveOfflineQueue(updatedQueue);
        failed++;
      }
    }
  }

  console.log(`[Sync] Queue processing complete. Processed: ${processed}, Failed: ${failed}`);
  return { processed, failed };
}

/**
 * Sync all data (usage, sessions, etc.)
 */
export async function syncAllData(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !isOnline()) {
    return false;
  }

  console.log('[Sync] Starting full data sync for user:', userId);

  try {
    // First, sync localStorage usage data to Supabase
    await syncUsageToSupabase(userId);

    // Then process any queued offline actions
    await processOfflineQueue(userId);

    // Finally, sync Supabase data back to localStorage (to get latest)
    await syncUsageToLocalStorage(userId);

    console.log('[Sync] Full data sync completed successfully');
    return true;
  } catch (err) {
    console.error('[Sync] Error during full sync:', err);
    return false;
  }
}

/**
 * Setup background sync interval
 * Returns cleanup function to stop background sync
 */
export function setupBackgroundSync(userId: string): () => void {
  if (!isSupabaseConfigured()) {
    console.warn('[Sync] Supabase not configured, background sync disabled');
    return () => {};
  }

  console.log(
    `[Sync] Setting up background sync (interval: ${SYNC_CONFIG.BACKGROUND_SYNC_INTERVAL}ms)`
  );

  const intervalId = setInterval(async () => {
    if (isOnline() && userId) {
      console.log('[Sync] Running scheduled background sync');
      await syncAllData(userId);
    }
  }, SYNC_CONFIG.BACKGROUND_SYNC_INTERVAL);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.log('[Sync] Background sync stopped');
  };
}

/**
 * Listen for online/offline events and sync when coming online
 */
export function setupOnlineSync(userId: string): () => void {
  const handleOnline = async () => {
    console.log('[Sync] Device came online, syncing data...');
    await syncAllData(userId);
  };

  const handleOffline = () => {
    console.log('[Sync] Device went offline');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    console.log('[Sync] Online/offline listeners removed');
  };
}

/**
 * Setup all sync mechanisms (background + online/offline)
 * Returns cleanup function
 */
export function setupSync(userId: string | null): () => void {
  if (!userId) {
    console.warn('[Sync] No user ID provided, sync not initialized');
    return () => {};
  }

  const cleanupBackground = setupBackgroundSync(userId);
  const cleanupOnline = setupOnlineSync(userId);

  // Initial sync when setup is called
  if (isOnline()) {
    syncAllData(userId).catch((err) => {
      console.error('[Sync] Initial sync failed:', err);
    });
  }

  // Return combined cleanup function
  return () => {
    cleanupBackground();
    cleanupOnline();
  };
}

/**
 * Check sync status
 */
export interface SyncStatus {
  isOnline: boolean;
  isConfigured: boolean;
  queueSize: number;
  lastSyncTime: number | null;
}

const LAST_SYNC_KEY = 'supabase_last_sync_time';

export function getSyncStatus(): SyncStatus {
  const lastSyncTime = localStorage.getItem(LAST_SYNC_KEY);

  return {
    isOnline: isOnline(),
    isConfigured: isSupabaseConfigured(),
    queueSize: getOfflineQueueSize(),
    lastSyncTime: lastSyncTime ? parseInt(lastSyncTime, 10) : null,
  };
}

/**
 * Update last sync time
 */
export function updateLastSyncTime(): void {
  localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
}
