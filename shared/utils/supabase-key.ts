// Which kind of Supabase key a string is. The server and the keep-alive ping
// both refuse anything but a service-role key; the ping also says which wrong
// kind it got, so a failed run names the mistake.
//
// Legacy keys are JWTs carrying the Postgres role they act as. The anon and
// service-role keys look identical at a glance, and the anon key is public by
// design, so only an explicit `service_role` claim counts. The newer keys are
// opaque: `sb_secret_...` is the service-role one, `sb_publishable_...` is as
// public as the anon key. Other opaque strings are taken on trust as secret
// keys, as before.
export type SupabaseKeyKind = 'service_role' | 'public' | 'malformed'

// `atob` rather than Node's `Buffer`, so the helper behaves the same wherever
// `#shared` is imported from.
const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')

  return atob(base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '='))
}

export const supabaseKeyKind = (key: string): SupabaseKeyKind => {
  if (key.startsWith('sb_publishable_')) {
    return 'public'
  }

  if (!key.startsWith('eyJ')) {
    return 'service_role'
  }

  const payload = key.split('.')[1]

  if (!payload) {
    return 'malformed'
  }

  try {
    const claims = JSON.parse(decodeBase64Url(payload)) as { role?: unknown }

    return claims.role === 'service_role' ? 'service_role' : 'public'
  } catch {
    return 'malformed'
  }
}

export const isServiceRoleKey = (key: string) => supabaseKeyKind(key) === 'service_role'
