// Supabase Edge Function: polar-webhook
// Handles Polar.sh webhook events for subscription management

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-polar-signature',
};

// Verify Polar.sh webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  return digest === signature;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get webhook signature
    const signature = req.headers.get('x-polar-signature') || '';
    const webhookSecret = Deno.env.get('POLAR_WEBHOOK_SECRET') || '';

    // Get raw body for signature verification
    const rawBody = await req.text();

    // Verify signature if secret is configured
    if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.type;

    console.log('Received Polar.sh webhook:', eventType);

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    switch (eventType) {
      case 'subscription.created': {
        const { subscription, customer } = event.data;

        // Find user by license key or email
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('license_key', subscription.license_key)
          .maybeSingle();

        if (user) {
          // Create subscription record
          await supabase.from('subscriptions').insert({
            user_id: user.id,
            polar_subscription_id: subscription.id,
            status: 'active',
            expires_at: subscription.current_period_end || null,
          });

          // Update user tier
          await supabase
            .from('users')
            .update({ tier: 'premium' })
            .eq('id', user.id);

          console.log('Subscription created for user:', user.id);
        }
        break;
      }

      case 'subscription.updated': {
        const { subscription } = event.data;

        // Find subscription
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('polar_subscription_id', subscription.id)
          .single();

        if (existingSubscription) {
          // Update subscription
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status === 'active' ? 'active' : 'cancelled',
              expires_at: subscription.current_period_end || null,
            })
            .eq('id', existingSubscription.id);

          // Update user tier based on status
          const newTier = subscription.status === 'active' ? 'premium' : 'free';
          await supabase
            .from('users')
            .update({ tier: newTier })
            .eq('id', existingSubscription.user_id);

          console.log('Subscription updated:', subscription.id);
        }
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.revoked': {
        const { subscription } = event.data;

        // Find subscription
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('polar_subscription_id', subscription.id)
          .single();

        if (existingSubscription) {
          const status = eventType === 'subscription.cancelled' ? 'cancelled' : 'revoked';

          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({ status })
            .eq('id', existingSubscription.id);

          // Downgrade user to free tier
          await supabase
            .from('users')
            .update({ tier: 'free' })
            .eq('id', existingSubscription.user_id);

          console.log('Subscription cancelled/revoked:', subscription.id);
        }
        break;
      }

      case 'subscription.expired': {
        const { subscription } = event.data;

        // Find subscription
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('polar_subscription_id', subscription.id)
          .single();

        if (existingSubscription) {
          // Mark as expired
          await supabase
            .from('subscriptions')
            .update({ status: 'expired' })
            .eq('id', existingSubscription.id);

          // Downgrade user to free
          await supabase
            .from('users')
            .update({ tier: 'free' })
            .eq('id', existingSubscription.user_id);

          console.log('Subscription expired, user downgraded:', existingSubscription.user_id);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
