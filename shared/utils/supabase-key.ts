// Legacy Supabase keys are JWTs carrying the Postgres role they act as. The
// anon and service-role keys look identical at a glance, and the anon key is
// public by design, so refuse anything that is not explicitly service_role.
// The newer `sb_secret_...` keys are opaque and are accepted as they are.
export const isServiceRoleKey = (key: string) => {
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
