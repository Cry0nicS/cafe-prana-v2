import { createClient } from '@supabase/supabase-js'
import type { Database } from '#shared/utils/types'

export const useServerSupabaseClient = () => {
  const config = useRuntimeConfig()

  if (!config.supabaseUrl || !config.supabaseKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase is not configured'
    })
  }

  return createClient<Database>(config.supabaseUrl, config.supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
