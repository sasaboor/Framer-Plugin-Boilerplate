// Supabase Edge Function: sync-usage
// Syncs offline usage data from localStorage to Supabase

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  license_key: string;
  total_checks?: number;
  free_check_used?: boolean;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { license_key, total_checks, free_check_used }: RequestBody = await req.json();

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
      .select('*')
      .eq('license_key', license_key)
      .single();

    if (userError || !user) {
      console.error('User not found for license key');
      return new Response(
        JSON.stringify({ success: false, message: 'User not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Get current usage tracking data
    const { data: currentUsage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (usageError) {
      console.error('Error fetching usage tracking:', usageError);
      return new Response(
        JSON.stringify({ success: false, message: 'Error fetching usage data' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Merge data - take the higher values
    const mergedTotalChecks =
      total_checks !== undefined
        ? Math.max(total_checks, currentUsage.total_checks_run)
        : currentUsage.total_checks_run;

    const mergedFreeCheckUsed =
      free_check_used !== undefined ? free_check_used || currentUsage.free_check_used : currentUsage.free_check_used;

    // Update usage tracking
    const { data: updatedUsage, error: updateError } = await supabase
      .from('usage_tracking')
      .update({
        total_checks_run: mergedTotalChecks,
        free_check_used: mergedFreeCheckUsed,
        last_check_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating usage:', updateError);
      return new Response(
        JSON.stringify({ success: false, message: 'Error updating usage data' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('Usage synced for user:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        usage: updatedUsage,
        message: 'Usage data synced successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in sync-usage function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'An error occurred during sync',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
