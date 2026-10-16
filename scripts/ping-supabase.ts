// Keeps the Supabase project awake. Free-plan projects pause after a week
// without a database request, and the site only makes one when a guest books a
// table, so a quiet week takes the reservation form down. Run every three days
// by `.github/workflows/supabase-keepalive.yml`.
//
// One read-only request: a single reservation id, through the same client the
// server uses. Nothing is written, and the row it returns is not printed.
//
// It also proves the two repository secrets are right. GitHub never shows a
// secret's value, so a run is the only way to check them: a wrong one fails
// here with a message naming it. Run through `jiti` (`npm run ping:supabase`).
import { appendFileSync } from 'node:fs'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../shared/utils/types'
import { checkKeepAliveConfig, describeKeepAliveResponse } from './supabase-keepalive'

const url = process.env.SUPABASE_URL?.trim() ?? ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? ''

// The run summary is where a failure is read, so it has to explain itself there.
const summarise = (markdown: string) => {
  const path = process.env.GITHUB_STEP_SUMMARY

  if (path) {
    appendFileSync(path, `${markdown}\n`)
  }
}

const fail = (problems: string[]) => {
  problems.forEach(problem => console.error(`✖ ${problem}`))
  summarise(`## Supabase keep-alive failed\n\n${problems.map(problem => `- ${problem}`).join('\n')}`)
  process.exitCode = 1
}

const problems = checkKeepAliveConfig({ url, key })

if (problems.length > 0) {
  fail(problems)
} else {
  const supabase = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  const { status, error } = await supabase.from('reservations').select('id').limit(1)
  const verdict = describeKeepAliveResponse({ status, error: error?.message })

  if (verdict.ok) {
    console.log(`✔ ${verdict.message}`)
    summarise(`## Supabase keep-alive\n\n${verdict.message}`)
  } else {
    fail([verdict.message])
  }
}
