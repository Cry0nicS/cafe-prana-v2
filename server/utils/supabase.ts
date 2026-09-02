import { createClient } from '@supabase/supabase-js'
import type { Database } from '#shared/utils/types'

// Legacy Supabase keys are JWTs carrying the Postgres role they act as. The
// anon and service-role keys look identical at a glance, and the anon key is
// public by design, so refuse anything that is not explicitly service_role.
// The newer `sb_secret_...` keys are opaque and are accepted as they are.
const isServiceRoleKey = (key: string) => {
  if (!key.startsWith('eyJ')) {
    return true
  }

  const payload = key.split('.')[1]

  if (!payload) {
    return false
  }

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { role?: unknown }

    return claims.role === 'service_role'
  } catch {
    return false
  }
}

export const useServerSupabaseClient = () => {
  const config = useRuntimeConfig()

  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase is not configured'
    })
  }

  if (!isServiceRoleKey(config.supabaseServiceRoleKey)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase key is not a service-role key'
    })
  }

  return createClient<Database>(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
