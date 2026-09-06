import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

/**
 * Server-only Supabase client.
 *
 * The secret key can bypass RLS. Never expose this client or key
 * to React/Vite/browser code.
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SECRET_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);
