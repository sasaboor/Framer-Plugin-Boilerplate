// Supabase Edge Function: validate-license
// Validates license keys with Polar.sh and manages user records

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  license_key: string;
}

// Simple in-memory rate limiting (resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, limit: number = 5, windowMs: number = 60000): boolean {
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

    // Rate limiting: 5 requests per minute per IP
    if (!checkRateLimit(clientIP, 5, 60000)) {
      console.log('[Security] Rate limit exceeded for IP:', clientIP);
      return new Response(
        JSON.stringify({ valid: false, message: 'Too many requests. Please try again later.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      );
    }

    const { license_key }: RequestBody = await req.json();

    if (!license_key) {
      return new Response(
        JSON.stringify({ valid: false, message: 'License key is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Validate license with Polar.sh API (direct HTTP request)
    const polarAccessToken = Deno.env.get('POLAR_ACCESS_TOKEN');
    const polarOrgId = Deno.env.get('POLAR_ORG_ID');

    console.log('[Polar] Validating license:', license_key.substring(0, 10) + '...');
    console.log('[Polar] Org ID:', polarOrgId);

    let validationResult: any;
    try {
      const response = await fetch(
        `https://api.polar.sh/v1/license-keys/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${polarAccessToken}`,
          },
          body: JSON.stringify({
            key: license_key.trim(),
            organization_id: polarOrgId,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Polar] API error:', response.status, errorText);
        throw new Error(`Polar API error: ${response.status}`);
      }

      validationResult = await response.json();
      console.log('[Polar] Validation result:', JSON.stringify(validationResult));
    } catch (error) {
      console.error('[Polar] Validation error:', error);
      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid license key or API error' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Check validation result
    const status = validationResult?.status;
    const isValid = status === 'granted';

    if (!isValid) {
      const message =
        status === 'revoked' ? 'This license key has been revoked' :
        status === 'expired' ? 'This license key has expired' :
        'License key is not valid or has no active grants';

      return new Response(
        JSON.stringify({
          valid: false,
          message,
          status
        }),
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

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('license_key', license_key)
      .maybeSingle();

    let user;

    if (existingUser) {
      // CHECK FOR CONCURRENT LICENSE USE
      // If there's an active session and it's < 3 weeks old, reject the login
      if (existingUser.active_session_started_at) {
        const sessionStart = new Date(existingUser.active_session_started_at);
        const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000); // 3 weeks in milliseconds

        if (sessionStart > threeWeeksAgo) {
          // Session is still active and not expired
          console.log('[Validate] License already in use:', license_key.substring(0, 10) + '...');
          return new Response(
            JSON.stringify({
              valid: false,
              message: 'This license is already in use on another device. Please log out from the other device first.',
              status: 'in_use',
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 409, // Conflict status code
            }
          );
        } else {
          // Session expired, will be cleared below
          console.log('[Validate] Previous session expired, clearing...');
        }
      }

      // Update existing user and set new active session
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          tier: 'premium',
          updated_at: new Date().toISOString(),
          active_session_started_at: new Date().toISOString(),
          active_session_device: 'Framer Plugin', // Can be enhanced with actual device info
          active_session_browser: 'Browser', // Can be enhanced with actual browser info
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }

      user = updatedUser;
    } else {
      // Create new user with active session
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          license_key,
          tier: 'premium',
          active_session_started_at: new Date().toISOString(),
          active_session_device: 'Framer Plugin',
          active_session_browser: 'Browser',
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      user = newUser;
    }

    // Create or update subscription record
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!existingSubscription) {
      const { error: subscriptionError } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        status: 'active',
        polar_subscription_id: validationResult?.subscription_id || null,
      });

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
      }
    }

    // Get subscription expiry date
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('expires_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    return new Response(
      JSON.stringify({
        valid: true,
        user,
        expires_at: subscription?.expires_at || null,
        message: 'License validated successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in validate-license function:', error);
    return new Response(
      JSON.stringify({
        valid: false,
        message: error.message || 'An error occurred during validation',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
