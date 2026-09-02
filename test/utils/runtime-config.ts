// Values returned by the `useRuntimeConfig()` stub installed in
// `test/setup/nitro-globals.ts`. Tests that exercise code reading the runtime
// config (the Mailgun service, the Supabase client) mutate this via
// `setTestRuntimeConfig`.
export const testRuntimeConfig: Record<string, string> = {}

export const defaultTestRuntimeConfig = {
  supabaseUrl: 'https://supabase.test',
  supabaseServiceRoleKey: 'sb_secret_test',
  mailgunBaseUrl: 'https://api.eu.mailgun.net',
  mailgunKey: 'test-mailgun-key',
  mailgunDomain: 'mail.test',
  reservationEmailFrom: 'Cafe Prana <reservation@mail.test>',
  reservationEmailTo: 'owner@test',
  reservationEmailBcc: 'bcc@test',
  contactEmailFrom: 'Cafe Prana <hello@mail.test>',
  contactEmailTo: 'contact@test'
}

// Resets every key back to its default, then applies the overrides, so a test
// that blanks a value cannot leak into the next one.
export const setTestRuntimeConfig = (
  overrides: Partial<Record<keyof typeof defaultTestRuntimeConfig, string>> = {}
) => {
  Object.assign(testRuntimeConfig, defaultTestRuntimeConfig, overrides)
}

setTestRuntimeConfig()
