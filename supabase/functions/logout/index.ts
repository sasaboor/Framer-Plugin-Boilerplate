// Supabase Edge Function: logout
// Clears active session for a license key

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  license_key: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { license_key }: RequestBody = await req.json();

    if (!license_key) {
      return new Response(
        JSON.stringify({ success: false, message: 'License key is required' }),
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

    // Find user by license key
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, license_key')
      .eq('license_key', license_key)
      .single();

    if (userError || !user) {
      console.log('[Logout] User not found for license key');
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: 'Logged out successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Clear active session
    const { error: updateError } = await supabase
      .from('users')
      .update({
        active_session_started_at: null,
        active_session_device: null,
        active_session_browser: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Logout] Error clearing session:', updateError);
      throw updateError;
    }

    console.log('[Logout] Session cleared for user:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Logged out successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Logout] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'An error occurred during logout',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
