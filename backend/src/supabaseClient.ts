import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function requiredAnyEnv(names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  throw new Error(`Missing one of environment variables: ${names.join(', ')}`);
}

function decodeJwtRole(jwt: string): string | null {
  try {
    const [, payload] = jwt.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf8');
    const parsed = JSON.parse(json) as { role?: unknown };
    return typeof parsed.role === 'string' ? parsed.role : null;
  } catch {
    return null;
  }
}

const SUPABASE_URL = requiredEnv('SUPABASE_URL');

// Common env naming conventions:
// - SUPABASE_ANON_KEY
// - SUPABASE_SERVICE_ROLE_KEY (recommended)
// - SUPABASE_SERVICE_KEY (legacy in this repo)
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const API_KEY: string =
  SUPABASE_ANON_KEY ||
  SUPABASE_SERVICE_ROLE_KEY ||
  requiredAnyEnv(['SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY']);

export const isServiceRoleKeyConfigured =
  !!SUPABASE_SERVICE_ROLE_KEY && decodeJwtRole(SUPABASE_SERVICE_ROLE_KEY) === 'service_role';

if (SUPABASE_SERVICE_ROLE_KEY && !isServiceRoleKeyConfigured) {
  const role = decodeJwtRole(SUPABASE_SERVICE_ROLE_KEY);
  console.warn(
    `SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY does not look like a service_role key (role=${role ?? 'unknown'}). ` +
      'DB operations will run with the user JWT and may be blocked by RLS if policies are missing.'
  );
}

// Auth client used for signUp/signIn/getUser (works with anon key; also works with service role).
export const supabaseAuth = createClient(SUPABASE_URL, API_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Admin client (service role) used when available.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || API_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Backwards-compatible export used by older code (service role preferred).
export const supabase = supabaseAdmin;

export function createSupabaseUserClient(accessToken: string): SupabaseClient {
  return createClient(SUPABASE_URL, API_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}