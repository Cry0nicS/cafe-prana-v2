import { afterEach, describe, expect, it, vi } from 'vitest'
import { setTestRuntimeConfig } from '../utils/runtime-config'
import { jwtWithRole } from '../utils/supabase-keys'

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn(() => ({ from: () => {} })) }))

vi.mock('@supabase/supabase-js', () => ({ createClient }))

const { useServerSupabaseClient } = await import('~~/server/utils/supabase')

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

  it('refuses the publishable key, which is as public as the anon key', () => {
    setTestRuntimeConfig({ supabaseServiceRoleKey: 'sb_publishable_abc123' })

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
