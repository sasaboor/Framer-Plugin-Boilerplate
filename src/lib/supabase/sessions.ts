/**
 * Supabase Sessions Service
 * Manages user session tracking and analytics
 */

import { supabase, isSupabaseConfigured } from './client';
import type { UserSession, InsertUserSession, UpdateUserSession } from './types';

/**
 * Create a new session
 */
export async function startSession(
  userId: string,
  projectId?: string
): Promise<UserSession | null> {
  if (!isSupabaseConfigured()) {
    console.warn('[Sessions] Supabase not configured, session not saved');
    return null;
  }

  try {
    const sessionData: InsertUserSession = {
      user_id: userId,
      project_id: projectId || null,
      started_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('[Sessions] Error creating session:', error);
      return null;
    }

    console.log('[Sessions] Session started:', data.id);
    return data;
  } catch (err) {
    console.error('[Sessions] Error in startSession:', err);
    return null;
  }
}

/**
 * End a session
 */
export async function endSession(sessionId: string): Promise<UserSession | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    // First, get the session to calculate duration
    const { data: session, error: fetchError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError || !session) {
      console.error('[Sessions] Error fetching session:', fetchError);
      return null;
    }

    const startedAt = new Date(session.started_at);
    const endedAt = new Date();
    const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

    const updates: UpdateUserSession = {
      ended_at: endedAt.toISOString(),
      duration_seconds: durationSeconds,
    };

    const { data, error } = await supabase
      .from('user_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('[Sessions] Error ending session:', error);
      return null;
    }

    console.log('[Sessions] Session ended:', sessionId, `Duration: ${durationSeconds}s`);
    return data;
  } catch (err) {
    console.error('[Sessions] Error in endSession:', err);
    return null;
  }
}

/**
 * Get session by ID
 */
export async function getSessionById(sessionId: string): Promise<UserSession | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('[Sessions] Error fetching session:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Sessions] Error in getSessionById:', err);
    return null;
  }
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(
  userId: string,
  limit: number = 50
): Promise<UserSession[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Sessions] Error fetching user sessions:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Sessions] Error in getUserSessions:', err);
    return [];
  }
}

/**
 * Get total session time for a user (in seconds)
 */
export async function getTotalSessionTime(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('duration_seconds')
      .eq('user_id', userId)
      .not('duration_seconds', 'is', null);

    if (error) {
      console.error('[Sessions] Error calculating total session time:', error);
      return 0;
    }

    const totalSeconds = data.reduce((sum, session) => sum + (session.duration_seconds || 0), 0);
    return totalSeconds;
  } catch (err) {
    console.error('[Sessions] Error in getTotalSessionTime:', err);
    return 0;
  }
}

/**
 * Get session count for a user
 */
export async function getSessionCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  try {
    const { count, error } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('[Sessions] Error counting sessions:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('[Sessions] Error in getSessionCount:', err);
    return 0;
  }
}

/**
 * Get active (unclosed) sessions for a user
 */
export async function getActiveSessions(userId: string): Promise<UserSession[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .is('ended_at', null)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('[Sessions] Error fetching active sessions:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Sessions] Error in getActiveSessions:', err);
    return [];
  }
}

/**
 * Close all active sessions for a user
 * Useful for cleanup or logout
 */
export async function closeAllActiveSessions(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  try {
    const activeSessions = await getActiveSessions(userId);

    let closed = 0;
    for (const session of activeSessions) {
      const result = await endSession(session.id);
      if (result) {
        closed++;
      }
    }

    console.log(`[Sessions] Closed ${closed} active sessions for user ${userId}`);
    return closed;
  } catch (err) {
    console.error('[Sessions] Error in closeAllActiveSessions:', err);
    return 0;
  }
}

/**
 * Get session analytics for a user
 */
export interface SessionAnalytics {
  totalSessions: number;
  totalTimeSeconds: number;
  averageSessionSeconds: number;
  lastSessionDate: string | null;
}

export async function getSessionAnalytics(userId: string): Promise<SessionAnalytics> {
  if (!isSupabaseConfigured()) {
    return {
      totalSessions: 0,
      totalTimeSeconds: 0,
      averageSessionSeconds: 0,
      lastSessionDate: null,
    };
  }

  try {
    const sessions = await getUserSessions(userId);

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.duration_seconds !== null);
    const totalTimeSeconds = completedSessions.reduce(
      (sum, s) => sum + (s.duration_seconds || 0),
      0
    );
    const averageSessionSeconds =
      completedSessions.length > 0 ? Math.floor(totalTimeSeconds / completedSessions.length) : 0;
    const lastSessionDate = sessions.length > 0 ? sessions[0].started_at : null;

    return {
      totalSessions,
      totalTimeSeconds,
      averageSessionSeconds,
      lastSessionDate,
    };
  } catch (err) {
    console.error('[Sessions] Error in getSessionAnalytics:', err);
    return {
      totalSessions: 0,
      totalTimeSeconds: 0,
      averageSessionSeconds: 0,
      lastSessionDate: null,
    };
  }
}
