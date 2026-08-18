// Supabase Edge Function: track-event
// Handles all analytics event tracking for the Framer plugin

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackEventRequest {
  event_name: string;
  properties?: Record<string, any>;
  user_id?: string; // Optional - can track anonymous events
}

// Simple in-memory rate limiting (resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    // Rate limiting: 100 events per minute per IP
    if (!checkRateLimit(clientIP, 100, 60000)) {
      console.log('[Security] Rate limit exceeded for IP:', clientIP);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      );
    }

    const { event_name, properties = {}, user_id }: TrackEventRequest = await req.json();

    // Validate event name
    if (!event_name || typeof event_name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'event_name is required and must be a string' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    // Get user_id from license key if provided in properties
    let resolvedUserId = user_id;

    if (!resolvedUserId && properties.license_key) {
      // Look up user by license key
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('license_key', properties.license_key)
        .maybeSingle();

      if (user) {
        resolvedUserId = user.id;
        // Remove license_key from properties to avoid storing it
        delete properties.license_key;
      }
    }

    // Insert analytics event
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert({
        user_id: resolvedUserId || null,
        event_name,
        properties,
      });

    if (insertError) {
      console.error('[track-event] Error inserting event:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to track event', details: insertError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('[track-event] Event tracked:', event_name, resolvedUserId ? `(user: ${resolvedUserId})` : '(anonymous)');

    return new Response(
      JSON.stringify({ success: true, event_name }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[track-event] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
