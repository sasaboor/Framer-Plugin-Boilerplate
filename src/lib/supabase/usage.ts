/**
 * Supabase Usage Tracking Service
 * Manages user usage statistics and check counts
 */

import { supabase, isSupabaseConfigured } from './client';
import type { UsageTracking, UpdateUsageTracking } from './types';
import { storage } from '../config/localStorage';

/**
 * Get usage tracking data for a user
 */
export async function getUserUsage(userId: string): Promise<UsageTracking | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('[Usage] Error fetching usage:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Usage] Error in getUserUsage:', err);
    return null;
  }
}

/**
 * Increment check count for a user
 */
export async function incrementCheckCount(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const currentCount = storage.getTotalChecks();
    storage.setTotalChecks(currentCount + 1);
    return true;
  }

  try {
    const { error } = await supabase.rpc('increment_check_count', {
      p_user_id: userId,
    });

    if (error) {
      console.error('[Usage] Error incrementing check count:', error);
      // Fallback to localStorage
      const currentCount = storage.getTotalChecks();
      storage.setTotalChecks(currentCount + 1);
      return false;
    }

    console.log('[Usage] Check count incremented for user:', userId);
    return true;
  } catch (err) {
    console.error('[Usage] Error in incrementCheckCount:', err);
    // Fallback to localStorage
    const currentCount = storage.getTotalChecks();
    storage.setTotalChecks(currentCount + 1);
    return false;
  }
}

/**
 * Get total checks run by a user
 * Falls back to localStorage if Supabase unavailable
 */
export async function getTotalChecks(userId: string | null): Promise<number> {
  if (!userId || !isSupabaseConfigured()) {
    // Fallback to localStorage
    return storage.getTotalChecks();
  }

  try {
    const usage = await getUserUsage(userId);
    return usage?.total_checks_run || storage.getTotalChecks();
  } catch (err) {
    console.error('[Usage] Error in getTotalChecks:', err);
    return storage.getTotalChecks();
  }
}

/**
 * Mark free check as used
 */
export async function markFreeCheckUsed(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    storage.setFreeCheckUsed(true);
    return true;
  }

  try {
    const { error } = await supabase
      .from('usage_tracking')
      .update({ free_check_used: true })
      .eq('user_id', userId);

    if (error) {
      console.error('[Usage] Error marking free check as used:', error);
      storage.setFreeCheckUsed(true);
      return false;
    }

    // Also update localStorage for consistency
    storage.setFreeCheckUsed(true);
    console.log('[Usage] Free check marked as used for user:', userId);
    return true;
  } catch (err) {
    console.error('[Usage] Error in markFreeCheckUsed:', err);
    storage.setFreeCheckUsed(true);
    return false;
  }
}

/**
 * Check if user has used their free check
 * Falls back to localStorage if Supabase unavailable
 */
export async function hasFreeCheckBeenUsed(userId: string | null): Promise<boolean> {
  if (!userId || !isSupabaseConfigured()) {
    // Fallback to localStorage
    return storage.hasFreeCheckBeenUsed();
  }

  try {
    const usage = await getUserUsage(userId);
    return usage?.free_check_used || storage.hasFreeCheckBeenUsed();
  } catch (err) {
    console.error('[Usage] Error in hasFreeCheckBeenUsed:', err);
    return storage.hasFreeCheckBeenUsed();
  }
}

/**
 * Update usage tracking data
 */
export async function updateUsageTracking(
  userId: string,
  updates: UpdateUsageTracking
): Promise<UsageTracking | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('usage_tracking')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Usage] Error updating usage tracking:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Usage] Error in updateUsageTracking:', err);
    return null;
  }
}

/**
 * Sync localStorage usage data to Supabase
 * Called when coming online or when Supabase becomes available
 */
export async function syncUsageToSupabase(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const localTotalChecks = storage.getTotalChecks();
    const localFreeCheckUsed = storage.hasFreeCheckBeenUsed();

    // Get current Supabase data
    const currentUsage = await getUserUsage(userId);

    if (!currentUsage) {
      console.warn('[Usage] No usage record found for user, cannot sync');
      return false;
    }

    // Merge data - take the higher check count
    const newTotalChecks = Math.max(localTotalChecks, currentUsage.total_checks_run);
    const newFreeCheckUsed = localFreeCheckUsed || currentUsage.free_check_used;

    // Only update if there are changes
    if (
      newTotalChecks !== currentUsage.total_checks_run ||
      newFreeCheckUsed !== currentUsage.free_check_used
    ) {
      const updated = await updateUsageTracking(userId, {
        total_checks_run: newTotalChecks,
        free_check_used: newFreeCheckUsed,
        last_check_at: new Date().toISOString(),
      });

      if (updated) {
        console.log('[Usage] Usage data synced to Supabase:', {
          totalChecks: newTotalChecks,
          freeCheckUsed: newFreeCheckUsed,
        });

        // Update localStorage with merged data
        storage.setTotalChecks(newTotalChecks);
        storage.setFreeCheckUsed(newFreeCheckUsed);

        return true;
      }
    }

    return true;
  } catch (err) {
    console.error('[Usage] Error syncing usage to Supabase:', err);
    return false;
  }
}

/**
 * Sync Supabase usage data to localStorage
 * Called when loading data from server
 */
export async function syncUsageToLocalStorage(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const usage = await getUserUsage(userId);

    if (!usage) {
      return false;
    }

    // Update localStorage with Supabase data
    storage.setTotalChecks(usage.total_checks_run);
    storage.setFreeCheckUsed(usage.free_check_used);

    console.log('[Usage] Usage data synced from Supabase to localStorage');
    return true;
  } catch (err) {
    console.error('[Usage] Error syncing usage to localStorage:', err);
    return false;
  }
}

/**
 * Get usage statistics
 */
export interface UsageStats {
  totalChecks: number;
  freeCheckUsed: boolean;
  lastCheckAt: string | null;
}

export async function getUsageStats(userId: string | null): Promise<UsageStats> {
  if (!userId || !isSupabaseConfigured()) {
    // Fallback to localStorage
    return {
      totalChecks: storage.getTotalChecks(),
      freeCheckUsed: storage.hasFreeCheckBeenUsed(),
      lastCheckAt: null,
    };
  }

  try {
    const usage = await getUserUsage(userId);

    if (!usage) {
      // Fallback to localStorage
      return {
        totalChecks: storage.getTotalChecks(),
        freeCheckUsed: storage.hasFreeCheckBeenUsed(),
        lastCheckAt: null,
      };
    }

    return {
      totalChecks: usage.total_checks_run,
      freeCheckUsed: usage.free_check_used,
      lastCheckAt: usage.last_check_at,
    };
  } catch (err) {
    console.error('[Usage] Error in getUsageStats:', err);
    return {
      totalChecks: storage.getTotalChecks(),
      freeCheckUsed: storage.hasFreeCheckBeenUsed(),
      lastCheckAt: null,
    };
  }
}
