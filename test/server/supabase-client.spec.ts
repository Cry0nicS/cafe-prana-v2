import { afterEach, describe, expect, it, vi } from 'vitest'
import { setTestRuntimeConfig } from '../utils/runtime-config'

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn(() => ({ from: () => {} })) }))

vi.mock('@supabase/supabase-js', () => ({ createClient }))

const { useServerSupabaseClient } = await import('~~/server/utils/supabase')

// A structurally valid JWT whose payload carries the given role. The signature
// is irrelevant: the guard only reads the claims.
const jwtWithRole = (role: string) => [
  Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
  Buffer.from(JSON.stringify({ iss: 'supabase', role })).toString('base64url'),
  'signature'
].join('.')

describe('useServerSupabaseClient', () => {
  afterEach(() => {
    createClient.mockClear()
    setTestRuntimeConfig()
  })

  it('creates a client with the service-role JWT', () => {
    const key = jwtWithRole('service_role')
    setTestRuntimeConfig({ supabaseServiceRoleKey: key })

    useServerSupabaseClient()

    expect(createClient).toHaveBeenCalledWith('https://supabase.test', key, expect.objectContaining({
      auth: { autoRefreshToken: false, persistSession: false }
    }))
  })

  it('accepts an opaque secret key', () => {
    setTestRuntimeConfig({ supabaseServiceRoleKey: 'sb_secret_abc123' })

    useServerSupabaseClient()

    expect(createClient).toHaveBeenCalledWith('https://supabase.test', 'sb_secret_abc123', expect.anything())
  })

  it('refuses the anon key', () => {
    setTestRuntimeConfig({ supabaseServiceRoleKey: jwtWithRole('anon') })

    expect(() => useServerSupabaseClient()).toThrowError(/service-role/)
    expect(createClient).not.toHaveBeenCalled()
  })

  it('refuses a malformed JWT', () => {
    setTestRuntimeConfig({ supabaseServiceRoleKey: 'eyJ.not-base64!.sig' })

    expect(() => useServerSupabaseClient()).toThrowError(/service-role/)
    expect(createClient).not.toHaveBeenCalled()
  })

  it('fails when the key is missing', () => {
    setTestRuntimeConfig({ supabaseServiceRoleKey: '' })

    expect(() => useServerSupabaseClient()).toThrowError(/not configured/)
    expect(createClient).not.toHaveBeenCalled()
  })
})
