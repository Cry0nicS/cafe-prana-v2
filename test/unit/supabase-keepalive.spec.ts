import { describe, expect, it } from 'vitest'
import { checkKeepAliveConfig, describeKeepAliveResponse } from '../../scripts/supabase-keepalive'

// A structurally valid JWT whose payload carries the given role. The signature
// is irrelevant: the guard only reads the claims.
const jwtWithRole = (role: string) => [
  Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
  Buffer.from(JSON.stringify({ iss: 'supabase', role })).toString('base64url'),
  'signature'
].join('.')

const url = 'https://abcdefghijklmnop.supabase.co'

describe('checkKeepAliveConfig', () => {
  it('accepts a project URL with a service-role JWT or a secret key', () => {
    expect(checkKeepAliveConfig({ url, key: jwtWithRole('service_role') })).toEqual([])
    expect(checkKeepAliveConfig({ url, key: 'sb_secret_abc123' })).toEqual([])
  })

  it('names each missing secret', () => {
    const problems = checkKeepAliveConfig({ url: '', key: '' })

    expect(problems).toHaveLength(2)
    expect(problems[0]).toMatch(/SUPABASE_URL is empty/)
    expect(problems[1]).toMatch(/SUPABASE_SERVICE_ROLE_KEY is empty/)
  })

  it('refuses a URL that is not an https address', () => {
    expect(checkKeepAliveConfig({ url: 'abcdefghijklmnop.supabase.co', key: 'sb_secret_abc' })[0]).toMatch(/SUPABASE_URL/)
    expect(checkKeepAliveConfig({ url: 'http://abcdefghijklmnop.supabase.co', key: 'sb_secret_abc' })[0]).toMatch(/https/)
  })

  // The dashboard shows the REST endpoint right next to the project URL, and
  // pasting that one doubles the path on every request.
  it('refuses a URL that carries a path, such as the REST endpoint', () => {
    expect(checkKeepAliveConfig({ url: `${url}/rest/v1`, key: 'sb_secret_abc' })[0]).toMatch(/no path/)
  })

  it('accepts a trailing slash on the project URL', () => {
    expect(checkKeepAliveConfig({ url: `${url}/`, key: 'sb_secret_abc' })).toEqual([])
  })

  it('refuses the anon key and the publishable key, which the reservations table does not grant', () => {
    expect(checkKeepAliveConfig({ url, key: jwtWithRole('anon') })[0]).toMatch(/anon or publishable/)
    expect(checkKeepAliveConfig({ url, key: 'sb_publishable_abc123' })[0]).toMatch(/anon or publishable/)
  })

  it('never echoes the key back', () => {
    const key = jwtWithRole('anon')

    expect(checkKeepAliveConfig({ url, key }).join('\n')).not.toContain(key)
  })
})

describe('describeKeepAliveResponse', () => {
  it('passes on 200', () => {
    expect(describeKeepAliveResponse({ status: 200 })).toEqual({ ok: true, message: expect.stringMatching(/answered/) })
  })

  it('blames the key on 401 and 403', () => {
    for (const status of [401, 403]) {
      const result = describeKeepAliveResponse({ status })

      expect(result.ok).toBe(false)
      expect(result.message).toMatch(/SUPABASE_SERVICE_ROLE_KEY/)
    }
  })

  it('blames the URL on 404, since the table exists in the right project', () => {
    const result = describeKeepAliveResponse({ status: 404 })

    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/SUPABASE_URL/)
  })

  it('points at a paused project on a server error', () => {
    const result = describeKeepAliveResponse({ status: 503 })

    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/paused/)
  })

  it('blames the URL when the host cannot be reached at all', () => {
    const result = describeKeepAliveResponse({ status: 0, error: 'fetch failed' })

    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/SUPABASE_URL/)
    expect(result.message).toContain('fetch failed')
  })
})
