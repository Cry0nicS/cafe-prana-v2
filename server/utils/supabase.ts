import { createClient } from '@supabase/supabase-js'
import { isServiceRoleKey } from '#shared/utils/supabase-key'
import type { Database } from '#shared/utils/types'

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
