// lib/subscription.ts

import { createClient } from '@/utils/supabase/server';

export async function getUserSubscriptionStatus(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Subscription')
    .select('subscriptionStatus')
    .eq('customerId', userId)
    .maybeSingle();

  if (error || !data) return false;

  return ['active', 'trialing'].includes(data.subscriptionStatus);
}
