// A structurally valid JWT whose payload carries the given role. The signature
// is irrelevant: the key guard only reads the claims.
export const jwtWithRole = (role: string) => [
  Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
  Buffer.from(JSON.stringify({ iss: 'supabase', role })).toString('base64url'),
  'signature'
].join('.')
